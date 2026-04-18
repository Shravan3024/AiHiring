"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  ShieldCheck, 
  Maximize,
  Monitor,
  Zap,
  Camera,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertOctagon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AxiosResponse } from "axios";

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

  // 1. Fetch & Initialize
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

  // 2. Timer Loop
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

  // 3. Mutations
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
      toast.success(`Assessment Complete! Final Score: ${res.data.score}%`);
      router.push(`/candidate/application/${applicationId}`);
    },
    onError: () => {
      toast.error("Submission error. Your answers were auto-saved.");
      setIsSubmitting(false);
    }
  });

  const logMalpracticeMutation = useMutation<AxiosResponse<any>, Error, { type: string; severity?: number; meta: any }>({
    mutationFn: (data) => {
       return candidateApi.logMalpractice(applicationId, data);
    },
  });

  // 4. Persistence
  useEffect(() => {
    if (isStarted && assessment?.attempt_id) {
       autoSaveIntervalRef.current = setInterval(() => {
          const currentQ = assessment.questions?.[currentQuestionIndex];
          if (!currentQ) return;
          const currentAns = answers[currentQ.id];
          if (currentAns) {
             saveAnswerMutation.mutate({ questionId: String(currentQ.id), answerText: currentAns });
          }
       }, 5000);
    }
    return () => { if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current); };
  }, [isStarted, currentQuestionIndex, answers, assessment?.attempt_id, assessment?.questions]);

  // 5. Proctoring
  const startCamera = async () => {
    try {
      console.log("Initializing camera Subnet...");
      // Using more standard constraints for wider compatibility
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          frameRate: { ideal: 15, max: 24 } 
        }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Play failed:", e));
          console.log("Camera Stream Active");
        };
      }
    } catch (err) {
      console.error("Camera fail:", err);
      toast.error("Camera access is mandatory. Please check browser permissions and hardware.");
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
        .catch(() => {
           toast.error("Fullscreen blocked. Check browser settings.");
        });
    }
  };

  const handleStart = async () => {
    setIsStarted(true);
  };

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
        logMalpracticeMutation.mutate({ 
          type: "TAB_SWITCH", 
          severity: 5,
          meta: { 
            timestamp: new Date().toISOString(),
            applicationId: applicationId,
            currentQuestion: currentQuestionIndex + 1
          } 
        });
        toast.error("Security Warning: Tab switching detected. This incident has been logged.");
      }
    };

    const blockAction = (e: Event) => e.preventDefault();
    const handleKeys = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 's', 'p'].includes(e.key.toLowerCase())) {
            e.preventDefault();
            logMalpracticeMutation.mutate({ type: "COPY_ATTEMPT", meta: { key: e.key } });
        }
    };

    document.addEventListener("fullscreenchange", handleFSChange);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("copy", blockAction);
    document.addEventListener("paste", blockAction);
    document.addEventListener("contextmenu", blockAction);
    document.addEventListener("keydown", handleKeys);

    return () => {
      document.removeEventListener("fullscreenchange", handleFSChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("copy", blockAction);
      document.removeEventListener("paste", blockAction);
      document.removeEventListener("contextmenu", blockAction);
      document.removeEventListener("keydown", handleKeys);
    };
  }, [isStarted, isSubmitting]);

  const handleAnswer = (val: string) => {
    const qId = assessment?.questions[currentQuestionIndex].id;
    if (qId) {
       setAnswers(prev => ({ ...prev, [qId]: val }));
       saveAnswerMutation.mutate({ questionId: String(qId), answerText: val });
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

  // --- RENDERING ---

  if (!isStarted) {
    return (
      <div ref={containerRef} className="min-h-screen bg-white flex flex-col items-center py-12 px-6 overflow-y-auto">
        <div className="w-full max-w-4xl flex items-center justify-between mb-12">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                 <ShieldCheck className="text-white w-7 h-7" />
              </div>
              <div className="text-left">
                 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mask Polymers <span className="text-blue-600">Recruitment</span></h1>
                 <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Industrial Assessment Portal</p>
              </div>
           </div>
           <Badge variant="outline" className="px-4 py-1.5 border-gray-200 text-gray-500 font-semibold bg-gray-50 uppercase tracking-tighter">Application ID: #{applicationId}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full max-w-6xl">
           <div className="lg:col-span-12 space-y-8">
              <div className="bg-white border rounded-[2rem] p-10 shadow-sm">
                 <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3 text-left">Assessment Overview</h2>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                    {[
                       { icon: Clock, label: "Duration", value: "60 Minutes", color: "blue" },
                       { icon: Zap, label: "Total Questions", value: "25 Questions", color: "amber" },
                       { icon: Info, label: "Structure", value: "20 Tech + 5 Behavioral", color: "emerald" },
                       { icon: ShieldCheck, label: "Passing Grade", value: "60% Score", color: "indigo" }
                    ].map((item, i) => (
                       <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-colors">
                          <item.icon className={cn("w-6 h-6 mb-3", `text-${item.color}-500`)} />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                          <p className="text-lg font-bold text-gray-900">{item.value}</p>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                 <div className="bg-white border rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5 text-blue-600" /> Rules and Regulations
                    </h3>
                    <ul className="space-y-4">
                       {[
                          "Candidates must keep their web-camera active at all times.",
                          "Exiting fullscreen mode will be logged as a strike.",
                          "Tab switching or window blurring is strictly prohibited.",
                          "The test will auto-submit exactly when the timer hits zero.",
                          "Use of external research or AI tools is grounds for rejection.",
                          "Responses are auto-saved every 5 seconds to prevent data loss."
                       ].map((rule, idx) => (
                          <li key={idx} className="flex gap-4">
                             <div className="w-5 h-5 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center mt-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                             </div>
                             <span className="text-sm font-medium text-gray-600 leading-relaxed">{rule}</span>
                          </li>
                       ))}
                    </ul>
                 </div>

                 <div className="bg-white border rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                       <AlertTriangle className="w-5 h-5 text-amber-500" /> Proctoring Checks
                    </h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-4">
                             <Camera className="w-5 h-5 text-gray-400" />
                             <span className="text-sm font-bold text-gray-700">Web Camera Access</span>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">REQUIRED</Badge>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-4">
                             <Monitor className="w-5 h-5 text-gray-400" />
                             <span className="text-sm font-bold text-gray-700">Fullscreen Authorization</span>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">REQUIRED</Badge>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-gray-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                 <div className="flex items-start gap-5 max-w-xl">
                    <div className="pt-1">
                       <div 
                          onClick={() => setHasAgreed(!hasAgreed)}
                          className={cn(
                             "w-8 h-8 rounded-xl border-2 cursor-pointer flex items-center justify-center transition-all",
                             hasAgreed ? "bg-blue-600 border-blue-600" : "border-gray-700 hover:border-gray-500"
                          )}
                       >
                          {hasAgreed && <CheckCircle2 className="w-5 h-5 text-white" />}
                       </div>
                    </div>
                    <div>
                       <h4 className="text-white font-bold text-lg">Candidate Declaration</h4>
                       <p className="text-gray-400 text-sm leading-relaxed mt-1">I acknowledge that I have read the above rules. Violations result in disqualification.</p>
                    </div>
                 </div>
                 
                 <Button 
                    disabled={!hasAgreed}
                    onClick={handleStart} 
                    className={cn(
                       "h-20 px-16 rounded-[1.5rem] font-bold text-lg uppercase tracking-widest transition-all",
                       hasAgreed ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg" : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    )}
                 >
                    Start Assessment Now
                 </Button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black overflow-y-auto">
      {/* ⚠️ PROCTORING LAYER */}
      {(!isFullScreen && !isSubmitting) && (
        <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center font-mono p-12 text-white text-center">
          <div>
            <AlertOctagon className="w-24 h-24 text-red-500 mx-auto mb-8 animate-bounce" />
            <h2 className="text-5xl font-black uppercase tracking-tighter">Isolation Breach</h2>
            <p className="text-slate-400 mt-4 max-w-md mx-auto">Fullscreen mode is required for this assessment. Please re-enable to proceed.</p>
            <Button onClick={handleFullScreen} className="mt-8 bg-white text-black font-black uppercase px-16 h-20 rounded-3xl">Re-Enable Shield</Button>
          </div>
        </div>
      )}

      {/* 🔄 SYNCING LAYER */}
      {(isLoading || !isReady || !assessment) ? (
        <div className="min-h-screen flex flex-col items-center justify-center font-mono gap-6 text-white text-center">
           <div className="w-16 h-16 border-t-4 border-blue-600 rounded-full animate-spin" />
           <p className="text-sm uppercase tracking-widest text-slate-500">Syncing Matrix Questions...</p>
        </div>
      ) : (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-mono flex flex-col items-stretch text-left">
          {/* HEADER */}
          <div className="h-20 border-b border-slate-900 bg-black/95 flex items-center justify-between px-8 sticky top-0 z-[100]">
             <div className="flex items-center gap-8">
                <div className="h-14 w-14 bg-white rounded-3xl flex items-center justify-center text-black font-black text-2xl">M</div>
                <h1 className="text-sm font-black text-white uppercase tracking-widest">Technical Subnet 01</h1>
             </div>
             <div className="flex items-center gap-12">
                <div className="flex items-center gap-4">
                   <Clock className="w-5 h-5 text-blue-500" />
                   <span className="text-3xl font-black text-white tabular-nums">{timeLeft !== null ? formatTime(timeLeft) : "--:--"}</span>
                </div>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 h-16 px-12 rounded-3xl font-bold uppercase tracking-widest">FINISH TEST</Button>
             </div>
          </div>

          <div className="h-full flex flex-col lg:flex-row gap-6 p-6 lg:p-10 relative">
             {/* MAIN QUESTION AREA */}
             <div className="flex-1 flex flex-col gap-6">
                <div className="border-slate-900 bg-black rounded-[2.5rem] flex flex-col border-2 shadow-2xl shadow-blue-900/10">
                    <div className="p-8 lg:p-12 border-b border-slate-900 bg-slate-950/50">
                      <div className="flex gap-3 mb-6">
                        <Badge className="bg-blue-600/10 text-blue-400 border-blue-600/20">{assessment.questions[currentQuestionIndex].category}</Badge>
                        <Badge className="bg-slate-900 text-slate-400">{assessment.questions[currentQuestionIndex].difficulty}</Badge>
                      </div>
                       <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight underline decoration-blue-500/30 underline-offset-8">
                         {assessment.questions[currentQuestionIndex].question}
                      </h2>
                   </div>
                    <div className="p-8 lg:p-10 space-y-4">
                      {assessment.questions[currentQuestionIndex].options && assessment.questions[currentQuestionIndex].options.length > 0 ? (
                        assessment.questions[currentQuestionIndex].options.map((opt, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleAnswer(opt)} 
                            className={cn(
                              "w-full p-6 text-left rounded-[2rem] border-2 transition-all flex items-center gap-8 group", 
                              answers[assessment.questions[currentQuestionIndex].id] === opt 
                                ? "bg-blue-600 border-blue-500 text-white" 
                                : "bg-black border-slate-900 hover:border-slate-700"
                            )}
                          >
                             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black border-2", answers[assessment.questions[currentQuestionIndex].id] === opt ? "border-white" : "border-slate-800 group-hover:border-slate-600")}>
                                {String.fromCharCode(65 + i)}
                             </div>
                             <span className="text-xl font-bold">{opt}</span>
                          </button>
                        ))
                      ) : (
                        <textarea 
                          placeholder="Type your detailed solution here..."
                          value={answers[assessment.questions[currentQuestionIndex].id] || ""} 
                          onChange={(e) => handleAnswer(e.target.value)} 
                          className="w-full h-48 bg-black border-2 border-slate-900 rounded-[1.5rem] p-8 text-xl text-slate-300 focus:border-blue-600 focus:outline-none transition-colors scrollbar-hide" 
                        />
                      )}
                   </div>

                   <div className="p-8 lg:px-12 lg:py-8 flex justify-between bg-black/50 border-t border-slate-900">
                      <Button variant="outline" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(v => v - 1)} className="h-16 px-10 rounded-2xl border-slate-800 text-slate-400 font-bold uppercase">BACK</Button>
                      <Button disabled={currentQuestionIndex === assessment.questions.length - 1} onClick={() => setCurrentQuestionIndex(v => v + 1)} className="bg-white text-black h-16 px-12 rounded-2xl font-black uppercase">NEXT</Button>
                   </div>
                </div>
             </div>

             {/* SIDEBAR PROCTORING */}
              <div className="w-full lg:w-[400px] flex flex-col gap-6 sticky top-28">
                <div className="aspect-[3/4] bg-slate-950 rounded-[4rem] border-2 border-slate-900 overflow-hidden relative group">
                   <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror-x" />
                   <div className="absolute top-10 left-10 p-3 bg-red-600 rounded-full animate-pulse z-10 shadow-lg shadow-red-900/50" />
                   <div className="absolute bottom-10 left-10 right-10 bg-black/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">AI PROCTOR ACTIVE</p>
                      <p className="text-xs text-white">Monitoring biometric telemetry and gaze vectors.</p>
                   </div>
                </div>

                <div className="flex-1 border-slate-900 bg-slate-950/40 rounded-[4rem] p-12 border-2 text-center flex flex-col justify-between">
                   <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Test Progress</span>
                        <span className="text-xs font-black text-blue-400">{Math.round(((currentQuestionIndex + 1) / assessment.questions.length) * 100)}%</span>
                      </div>
                      <Progress value={((currentQuestionIndex + 1) / assessment.questions.length) * 100} className="h-2 mb-10 bg-slate-900 transition-all duration-700 ease-in-out [&>div]:transition-all [&>div]:duration-700" />
                      
                      <div className="grid grid-cols-5 gap-4">
                        {assessment.questions.map((q, i) => (
                          <button 
                            key={q.id} 
                            onClick={() => setCurrentQuestionIndex(i)} 
                            className={cn(
                              "aspect-square rounded-2xl text-xs font-black border-2 transition-all", 
                              i === currentQuestionIndex 
                                ? "bg-white text-black border-white shadow-lg shadow-white/10" 
                                : answers[q.id] 
                                  ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                                  : "bg-black border-slate-900 text-slate-700 hover:border-slate-700 hover:text-slate-500"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="mt-8 p-6 bg-slate-900/30 rounded-3xl border border-slate-900">
                      <div className="flex items-center gap-4 text-left">
                        <div className="h-10 w-10 rounded-2xl bg-amber-600/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Warning Threshold</p>
                          <p className="text-xs font-bold text-slate-300">{warningCount} / 3 Strikes</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
