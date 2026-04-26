"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, ShieldCheck, Maximize, Monitor, Zap, Camera,
  AlertTriangle, Info, CheckCircle2, AlertOctagon, ChevronLeft,
  ChevronRight, Lock, Eye, Activity, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AxiosResponse } from "axios";
import { Card, CardContent } from "@/components/ui/card";

interface Question {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
  weight: number;
}

interface AssessmentData {
  success: boolean;
  attempt_id: number;
  duration: number;
  questions: Question[];
}

export default function IntegratedAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [isStarted, setIsStarted] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout| null>(null);

  // Fetch Assessment Data
  const { data: assessment, isLoading } = useQuery<AssessmentData>({
    queryKey: ["assessment", applicationId],
    queryFn: async () => {
      const res = await candidateApi.startAssessment(applicationId);
      return res.data;
    },
    enabled: isStarted,
    retry: false
  });

  useEffect(() => {
    if (assessment?.duration) {
      setTimeLeft(assessment.duration * 60);
      setIsReady(true);
    }
  }, [assessment]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || !isStarted || !isFullScreen) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 1) return prev - 1;
        if (prev === 1) handleSubmit();
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isStarted, isFullScreen]);

  // Mutations
  const saveAnswerMutation = useMutation<AxiosResponse<any>, Error, { questionId: string; answerText: string }>({
    mutationFn: ({ questionId, answerText }) => {
       if (!assessment?.attempt_id) throw new Error("Attempt ID not found");
       return candidateApi.saveAssessmentAnswer(String(assessment.attempt_id), questionId, answerText);
    },
  });

  const submitMutation = useMutation<AxiosResponse<any>, Error, void>({
    mutationFn: () => {
       if (!assessment?.attempt_id) throw new Error("Attempt ID not found");
       return candidateApi.submitAssessment(String(assessment.attempt_id));
    },
    onSuccess: (res) => {
      stopCamera();
      toast.success("Assessment submitted successfully!");
      router.push(`/candidate/application/${applicationId}`);
    },
    onError: () => {
      toast.error("Submission error. Your answers were auto-saved.");
      setIsSubmitting(false);
    }
  });

  const logMalpracticeMutation = useMutation<AxiosResponse<any>, Error, { type: string; severity?: number; meta: any }>({
    mutationFn: (data) => candidateApi.logMalpractice(applicationId, data),
  });

  // Auto-save: Every 10 seconds, save the current answer if it has changed
  useEffect(() => {
    if (isStarted && assessment?.attempt_id) {
       autoSaveIntervalRef.current = setInterval(() => {
          const currentQ = assessment.questions?.[currentQuestionIndex];
          if (!currentQ) return;
          const currentAns = answers[currentQ.id];
          if (currentAns) {
             saveAnswerMutation.mutate({ questionId: String(currentQ.id), answerText: currentAns });
          }
       }, 10000);
    }
    return () => { if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current); };
  }, [isStarted, currentQuestionIndex, assessment?.attempt_id, assessment?.questions]);
  // Note: Removed 'answers' from dependency to prevent interval reset on every keystroke

  // Proctoring
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast.error("Camera access is mandatory. Please grant permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
       (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const handleFullScreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch(() => toast.error("Fullscreen blocked."));
    }
  };

  const handleStart = async () => setIsStarted(true);

  useEffect(() => {
    if (isStarted) {
      handleFullScreen();
      startCamera();
    }
    return () => stopCamera();
  }, [isStarted]);

  useEffect(() => {
    if (!isStarted) return;
    const handleFSChange = () => setIsFullScreen(!!document.fullscreenElement);
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && !isSubmitting) {
        setWarningCount(v => v + 1);
        logMalpracticeMutation.mutate({ type: "TAB_SWITCH", severity: 5, meta: { timestamp: new Date().toISOString() } });
        toast.error("Warning: Tab switching detected.");
      }
    };
    const blockAction = (e: Event) => e.preventDefault();
    document.addEventListener("fullscreenchange", handleFSChange);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("copy", blockAction);
    document.addEventListener("paste", blockAction);
    document.addEventListener("contextmenu", blockAction);
    return () => {
      document.removeEventListener("fullscreenchange", handleFSChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("copy", blockAction);
      document.removeEventListener("paste", blockAction);
      document.removeEventListener("contextmenu", blockAction);
    };
  }, [isStarted, isSubmitting]);

  const handleAnswer = (val: string) => {
    const qId = assessment?.questions[currentQuestionIndex].id;
    if (qId) {
       setAnswers(prev => ({ ...prev, [qId]: val }));
       // Removed saveAnswerMutation.mutate from here to avoid spamming the server on every keystroke
    }
  };

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    submitMutation.mutate();
  }, [isSubmitting, submitMutation]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!isStarted) {
    return (
      <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-12 px-6 overflow-y-auto">
        <div className="w-full max-w-5xl flex items-center justify-between mb-12">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                 <ShieldCheck className="text-white w-7 h-7" />
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assessment Portal</h1>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mask Polymers AI Systems</p>
              </div>
           </div>
           <Badge variant="outline" className="px-4 py-2 border-slate-200 text-slate-500 font-bold bg-white rounded-xl shadow-sm">APP_ID: #{applicationId.slice(-6).toUpperCase()}</Badge>
        </div>

        <div className="w-full max-w-5xl space-y-8">
           <Card className="border-none shadow-sm rounded-[40px] bg-white p-12">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Before you begin...</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                    { icon: Clock, label: "Time Limit", value: "60 Minutes", color: "text-blue-500", bg: "bg-blue-50" },
                    { icon: Zap, label: "Questions", value: "25 Total", color: "text-amber-500", bg: "bg-amber-50" },
                    { icon: Monitor, label: "Environment", value: "Quiet & Solo", color: "text-emerald-500", bg: "bg-emerald-50" },
                    { icon: Lock, label: "Security", value: "Proctored", color: "text-purple-500", bg: "bg-purple-50" }
                 ].map((item, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-50 flex flex-col items-center text-center">
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", item.bg, item.color)}>
                          <item.icon className="w-6 h-6" />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                       <p className="text-lg font-bold text-slate-900">{item.value}</p>
                    </div>
                 ))}
              </div>

              <div className="mt-12 space-y-6">
                 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Info className="w-5 h-5 text-blue-600" /> Key Guidelines</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                       "Camera must remain active at all times",
                       "Fullscreen mode is mandatory",
                       "Tab switching will be logged",
                       "System will auto-submit on timer end",
                       "Copy/Paste is disabled for security",
                       "Stable internet connection required"
                    ].map((rule, idx) => (
                       <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium text-slate-600">{rule}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </Card>

           <div className="bg-slate-900 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="relative z-10 flex items-start gap-6 max-w-xl">
                 <div 
                    onClick={() => setHasAgreed(!hasAgreed)}
                    className={cn(
                       "w-10 h-10 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all",
                       hasAgreed ? "bg-blue-600 border-blue-600" : "border-slate-700 hover:border-slate-600"
                    )}
                 >
                    {hasAgreed && <CheckCircle2 className="w-6 h-6 text-white" />}
                 </div>
                 <div>
                    <h4 className="text-white font-bold text-xl">I agree to the assessment terms</h4>
                    <p className="text-slate-400 text-sm mt-1">I understand that any malpractice will lead to immediate disqualification.</p>
                 </div>
              </div>
              <Button 
                 disabled={!hasAgreed}
                 onClick={handleStart} 
                 className="relative z-10 bg-white hover:bg-slate-100 text-slate-900 h-16 px-12 rounded-[24px] font-black uppercase tracking-widest transition-all disabled:opacity-20"
              >
                 Initialize Test
              </Button>
              <div className="absolute top-0 right-0 p-12 opacity-5"><Sparkles className="w-48 h-48 text-white" /></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-slate-300 selection:bg-blue-500/30">
      {(!isFullScreen && !isSubmitting) && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-12 text-center">
          <div className="max-w-md">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
               <AlertOctagon className="w-12 h-12 text-red-500 animate-pulse" />
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Security Alert</h2>
            <p className="text-slate-400 mt-4 font-medium">Fullscreen mode is required to maintain the integrity of the assessment. Re-enable to continue.</p>
            <Button onClick={handleFullScreen} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold px-12 h-16 rounded-2xl">Return to Test</Button>
          </div>
        </div>
      )}

      {isLoading || !isReady || !assessment ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
           <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Preparing Workspace...</p>
        </div>
      ) : (
        <div className="flex flex-col h-screen overflow-hidden text-left">
          <header className="h-20 bg-black border-b border-slate-900 flex items-center justify-between px-10 shrink-0">
             <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white">M</div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                   <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assessment ID</h2>
                   <p className="text-sm font-black text-white">#T-MATRIX-01</p>
                </div>
             </div>
             
             <div className="flex items-center gap-12">
                <div className="flex items-center gap-4 bg-slate-900/50 px-6 py-2.5 rounded-2xl border border-slate-800">
                   <Clock className="w-5 h-5 text-blue-500" />
                   <span className="text-2xl font-black text-white tabular-nums">{timeLeft !== null ? formatTime(timeLeft) : "00:00"}</span>
                </div>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-12 rounded-xl font-bold uppercase text-xs tracking-widest transition-all">
                   {isSubmitting ? "Submitting..." : "Finish Test"}
                </Button>
             </div>
          </header>

          <main className="flex-1 flex overflow-hidden p-8 gap-8">
             <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <Card className="flex-1 bg-slate-950/50 border-slate-900 rounded-[40px] flex flex-col border-2 overflow-hidden">
                   <div className="p-10 lg:p-14 border-b border-slate-900 bg-black/20">
                      <div className="flex gap-3 mb-8">
                         <Badge className="bg-blue-600/10 text-blue-400 border-blue-600/20 px-4 py-1 rounded-full font-bold text-[10px] uppercase">{assessment.questions[currentQuestionIndex].category}</Badge>
                         <Badge className="bg-slate-900 text-slate-500 border-none px-4 py-1 rounded-full font-bold text-[10px] uppercase">Difficulty: {assessment.questions[currentQuestionIndex].difficulty}</Badge>
                      </div>
                      <h3 className="text-3xl font-bold text-white leading-tight">
                         {assessment.questions[currentQuestionIndex].question}
                      </h3>
                   </div>

                   <div className="flex-1 p-10 lg:p-14 space-y-6 overflow-y-auto custom-scrollbar">
                      {assessment.questions[currentQuestionIndex].options?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                           {assessment.questions[currentQuestionIndex].options.map((opt, i) => (
                              <button 
                                 key={i} 
                                 onClick={() => handleAnswer(opt)} 
                                 className={cn(
                                    "w-full p-8 text-left rounded-3xl border-2 transition-all flex items-center gap-8 group relative overflow-hidden",
                                    answers[assessment.questions[currentQuestionIndex].id] === opt 
                                       ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20" 
                                       : "bg-black/40 border-slate-900 hover:border-slate-800 text-slate-300"
                                 )}
                              >
                                 <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2",
                                    answers[assessment.questions[currentQuestionIndex].id] === opt ? "border-white/30 bg-white/10" : "border-slate-800 bg-slate-900/50 text-slate-500"
                                 )}>
                                    {String.fromCharCode(65 + i)}
                                 </div>
                                 <span className="text-xl font-bold">{opt}</span>
                                 {answers[assessment.questions[currentQuestionIndex].id] === opt && <div className="absolute right-8"><CheckCircle2 className="w-6 h-6 text-white/50" /></div>}
                              </button>
                           ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col min-h-[400px]">
                          <textarea 
                             placeholder="Write your detailed response here..."
                             value={answers[assessment.questions[currentQuestionIndex].id] || ""} 
                             onChange={(e) => handleAnswer(e.target.value)} 
                             className="flex-1 w-full bg-slate-900/20 border-2 border-slate-800/50 rounded-[32px] p-10 text-xl text-white focus:border-blue-500 focus:bg-slate-900/40 focus:outline-none transition-all placeholder:text-slate-700 resize-none shadow-2xl font-medium leading-relaxed" 
                          />
                        </div>
                      )}
                   </div>

                   <div className="p-8 px-14 bg-black/40 border-t border-slate-900 flex justify-between items-center">
                      <Button 
                         variant="ghost" 
                         disabled={currentQuestionIndex === 0} 
                         onClick={() => setCurrentQuestionIndex(v => v - 1)}
                         className="text-slate-500 hover:text-white font-bold gap-2 px-6 h-14 rounded-2xl transition-all"
                      >
                         <ChevronLeft className="w-5 h-5" /> Previous
                      </Button>
                      <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Question {currentQuestionIndex + 1} of {assessment.questions.length}</p>
                      <Button 
                         disabled={currentQuestionIndex === assessment.questions.length - 1} 
                         onClick={() => setCurrentQuestionIndex(v => v + 1)}
                         className="bg-white hover:bg-slate-200 text-black font-black px-10 h-14 rounded-2xl transition-all shadow-xl gap-2"
                      >
                         Next Question <ChevronRight className="w-5 h-5" />
                      </Button>
                   </div>
                </Card>
             </div>

             <aside className="w-full lg:w-[420px] flex flex-col gap-8">
                <Card className="aspect-video bg-black rounded-[40px] border-2 border-slate-900 overflow-hidden relative group">
                   <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                   <div className="absolute top-6 left-6 flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">Live Proctor</span>
                   </div>
                </Card>

                <Card className="flex-1 bg-slate-950/50 border-slate-900 rounded-[40px] border-2 p-10 flex flex-col">
                   <div className="mb-10 text-left">
                      <div className="flex justify-between items-end mb-4 px-2">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Completion</p>
                            <p className="text-2xl font-bold text-white">{Math.round(((Object.keys(answers).length) / assessment.questions.length) * 100)}%</p>
                         </div>
                         <Activity className="w-6 h-6 text-blue-500/50" />
                      </div>
                      <Progress value={((Object.keys(answers).length) / assessment.questions.length) * 100} className="h-2 bg-slate-900 [&>div]:bg-blue-600 transition-all duration-700" />
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                      <div className="grid grid-cols-5 gap-3">
                         {assessment.questions.map((q, i) => (
                           <button 
                             key={q.id} 
                             onClick={() => setCurrentQuestionIndex(i)} 
                             className={cn(
                               "aspect-square rounded-2xl text-sm font-bold border-2 transition-all flex items-center justify-center relative", 
                               i === currentQuestionIndex 
                                 ? "bg-white text-black border-white shadow-lg" 
                                 : answers[q.id] 
                                   ? "bg-blue-600/10 border-blue-600/30 text-blue-500" 
                                   : "bg-black/40 border-slate-900 text-slate-700 hover:border-slate-700"
                             )}
                           >
                             {i + 1}
                             {answers[q.id] && i !== currentQuestionIndex && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="mt-10 p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 flex items-center gap-4 text-left">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                         <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Integrity Monitor</p>
                         <p className="text-sm font-bold text-amber-500">{warningCount} / 3 Strikes Used</p>
                      </div>
                   </div>
                </Card>
             </aside>
          </main>
        </div>
      )}
    </div>
  );
}
