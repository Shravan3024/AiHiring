"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Clock, ShieldCheck, Zap, AlertTriangle, CheckCircle2,
  AlertOctagon, ChevronLeft, ChevronRight, Lock, Activity,
  Sparkles, BookOpen, FileText, ArrowRight, Mic, MicOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Question {
  id: string; question: string; options: string[];
  type: string; topic: string; difficulty: string;
  weight: number; section: number; evaluation_type: string;
}
interface AssessmentData {
  success: boolean; attempt_id: number;
  config: { section1_duration: number; section2_duration: number; mcq_count: number; theory_count: number };
  section1: Question[]; section2: Question[];
}

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [phase, setPhase] = useState<"pre" | "s1" | "transition" | "s2" | "done">("pre");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  const { data: assessment, isLoading } = useQuery<AssessmentData>({
    queryKey: ["assessment", applicationId],
    queryFn: async () => (await candidateApi.startAssessment(applicationId)).data,
    enabled: phase === "s1" || phase === "s2",
    retry: false,
    staleTime: Infinity
  });

  // ── SPEECH-TO-TEXT (Web Speech API) for Section 2 ──
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        // Append final transcribed text to the current answer
        const q = (phase === "s1" ? assessment?.section1 : assessment?.section2)?.[currentIdx];
        if (q) {
          setAnswers(prev => ({
            ...prev,
            [q.id]: (prev[q.id] || "") + finalTranscript
          }));
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      const errorMessages: Record<string, string> = {
        "not-allowed": "Microphone access denied. Please allow microphone permissions in your browser settings.",
        "network": "Voice input requires an internet connection. Please check your network and try again.",
        "no-speech": "No speech detected. Please speak clearly into your microphone.",
        "audio-capture": "No microphone found. Please connect a microphone and try again.",
        "aborted": "Voice input was stopped.",
      };
      const msg = errorMessages[event.error] || `Voice input error: ${event.error}. Please type your answer instead.`;
      if (event.error !== "aborted") toast.error(msg);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      // Auto-restart if still in listening mode (handles browser auto-stop)
      if (recognitionRef.current && isListening) {
        try { recognitionRef.current.start(); } catch (_) {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast.success("🎤 Voice input active — start speaking!");
  }, [phase, assessment, currentIdx, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Stop listening when navigating away from Section 2 or changing questions
  useEffect(() => {
    if (phase !== "s2") stopListening();
  }, [phase]);

  useEffect(() => {
    // Stop and allow re-start on question change
    if (isListening) {
      stopListening();
    }
  }, [currentIdx]);

  // Set timer when phase changes
  useEffect(() => {
    if (phase === "s1" && assessment) setTimeLeft(assessment.config.section1_duration * 60);
    if (phase === "s2" && assessment) setTimeLeft(assessment.config.section2_duration * 60);
  }, [phase, assessment]);

  // Timer countdown — uses ref to avoid TDZ with handleSectionTimeout defined below
  const sectionTimeoutRef = useRef<() => void>(() => { });
  useEffect(() => {
    if ((phase !== "s1" && phase !== "s2") || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { sectionTimeoutRef.current(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);





  const saveAnswer = useMutation({
    mutationFn: ({ qId, ans, section }: any) =>
      candidateApi.saveAssessmentAnswer(String(assessment!.attempt_id), qId, ans, section)
  });

  const bulkSave = useMutation({
    mutationFn: (answersToSave: Record<string, { answer_text: string; section: number }>) =>
      candidateApi.saveAllAnswers(String(assessment!.attempt_id), answersToSave)
  });

  const logMal = useMutation({
    mutationFn: (data: any) => candidateApi.logMalpractice(applicationId, data)
  });

  const submitMut = useMutation({
    mutationFn: () => candidateApi.submitAssessment(String(assessment!.attempt_id)),
    onSuccess: () => { stopCamera(); toast.success("Assessment submitted!"); router.push(`/candidate/application/${applicationId}`); },
    onError: () => { toast.error("Submission failed. Answers were saved."); setIsSubmitting(false); }
  });

  // Build payload for a section
  const buildPayload = (sectionNum: number) => {
    const questions = sectionNum === 1 ? assessment?.section1 : assessment?.section2;
    const payload: Record<string, { answer_text: string; section: number }> = {};
    (questions || []).forEach(q => {
      if (answers[q.id] !== undefined) {
        payload[q.id] = { answer_text: answers[q.id], section: sectionNum };
      }
    });
    return payload;
  };

  // Section timeout handler (needs buildPayload + handleFinalSubmit)
  const handleSectionTimeout = async () => {
    if (phase === "s1") {
      toast.warning("Section 1 time up! Saving and moving to Section 2.");
      try {
        const s1Payload = buildPayload(1);
        if (Object.keys(s1Payload).length > 0 && assessment?.attempt_id) {
          await candidateApi.saveAllAnswers(String(assessment.attempt_id), s1Payload);
        }
      } catch (_) { }
      setPhase("transition"); setCurrentIdx(0);
    } else if (phase === "s2") {
      handleFinalSubmit();
    }
  };

  // Flush ALL answers (both sections) then submit
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Build full payload for section 2 (section 1 was already flushed at transition)
      const s2Payload = buildPayload(2);
      if (Object.keys(s2Payload).length > 0) {
        await candidateApi.saveAllAnswers(String(assessment!.attempt_id), s2Payload);
      }
    } catch (_) { }
    submitMut.mutate();
  }, [isSubmitting, answers, assessment]);

  // Flush section 1 answers then go to transition
  const handleCompleteSection1 = useCallback(async () => {
    const s1Payload = buildPayload(1);
    try {
      if (Object.keys(s1Payload).length > 0) {
        await candidateApi.saveAllAnswers(String(assessment!.attempt_id), s1Payload);
      }
    } catch (_) { }
    setPhase("transition");
    setCurrentIdx(0);
  }, [answers, assessment]);

  // Keep ref updated so timer can call the latest version
  useEffect(() => {
    sectionTimeoutRef.current = handleSectionTimeout;
  });

  // Auto-save current question every 30s as safety net
  useEffect(() => {
    if (phase !== "s1" && phase !== "s2") return;
    const questions = phase === "s1" ? assessment?.section1 : assessment?.section2;
    const sectionNum = phase === "s1" ? 1 : 2;
    const interval = setInterval(() => {
      const q = questions?.[currentIdx];
      if (q && answers[q.id]) {
        saveAnswer.mutate({ qId: q.id, ans: answers[q.id], section: sectionNum });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [phase, currentIdx, assessment, answers]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); }
    } catch { toast.error("Camera access required."); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject)
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
  };

  const enterFullscreen = () => {
    containerRef.current?.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => { });
  };

  useEffect(() => {
    if (phase === "s1") { enterFullscreen(); startCamera(); }
    return () => { if (phase === "done") stopCamera(); };
  }, [phase]);

  useEffect(() => {
    if (phase === "pre") return;
    const onFS = () => setIsFullScreen(!!document.fullscreenElement);
    const onVis = () => {
      if (document.visibilityState === "hidden" && !isSubmitting) {
        setWarnings(v => v + 1);
        logMal.mutate({ type: "TAB_SWITCH", severity: 5, meta: { t: new Date() } });
        toast.error("Warning: Tab switch detected!");
      }
    };
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("fullscreenchange", onFS);
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("copy", block);
    document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("fullscreenchange", onFS);
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("copy", block);
      document.removeEventListener("contextmenu", block);
    };
  }, [phase, isSubmitting]);

  const handleAnswer = (val: string) => {
    const isS1 = phase === "s1";
    const questions = isS1 ? assessment?.section1 : assessment?.section2;
    const q = questions?.[currentIdx];
    if (!q) return;
    setAnswers(p => ({ ...p, [q.id]: val }));
    // For MCQ: immediately persist the answer to DB
    if (isS1 && assessment?.attempt_id) {
      saveAnswer.mutate({ qId: q.id, ans: val, section: 1 });
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const questions = phase === "s1" ? (assessment?.section1 || []) : (assessment?.section2 || []);
  const curQ = questions[currentIdx];
  const answeredCount = questions.filter(q => answers[q.id]).length;

  // ── PRE-START SCREEN ──
  if (phase === "pre") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-4xl space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Assessment Portal</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Hiring System AI Systems</p>
            </div>
          </div>

          <Card className="border-none shadow-sm rounded-xl bg-white p-6">
            <h2 className="text-lg font-black text-slate-900 mb-6">Assessment Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-blue-800 uppercase tracking-wide text-sm">Section 1 — MCQ Test</span>
                </div>
                <p className="text-xl font-black text-slate-900">20 Questions</p>
                <p className="text-sm text-slate-500 mt-1">Multiple choice — Technical knowledge</p>
                <div className="flex items-center gap-2 mt-4">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-blue-600">20 Minutes</span>
                </div>
              </div>
              <div className="p-6 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-purple-800 uppercase tracking-wide text-sm">Section 2 — Theory</span>
                </div>
                <p className="text-xl font-black text-slate-900">5 Questions</p>
                <p className="text-sm text-slate-500 mt-1">Scenario / Behavioral / Analytical</p>
                <div className="flex items-center gap-2 mt-2">
                  <Mic className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-purple-600 text-sm">Voice Input Available</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-purple-600">25 Minutes</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Questions", value: "25" },
                { label: "Total Time", value: "45 Min" },
                { label: "Proctoring", value: "Active" },
                { label: "Passing Score", value: "40%" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-8">
              {["Camera must remain active", "Fullscreen mode is mandatory", "Tab switching will be logged", "Copy/Paste is disabled", "Auto-submit when timer ends"].map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {r}
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-lg p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  onClick={() => setHasAgreed(!hasAgreed)}
                  className={cn("w-8 h-8 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all",
                    hasAgreed ? "bg-blue-600 border-blue-600" : "border-slate-600 hover:border-slate-500")}
                >
                  {hasAgreed && <CheckCircle2 className="w-5 h-5 text-white" />}
                </div>
                <p className="text-white font-bold">I agree to the assessment terms and integrity policy</p>
              </div>
              <Button
                disabled={!hasAgreed}
                onClick={() => setPhase("s1")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 rounded-xl font-black uppercase tracking-widest shrink-0"
              >
                Start Section 1 <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── SECTION TRANSITION ──
  if (phase === "transition") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
        <Card className="max-w-lg w-full bg-slate-900 border-slate-800 rounded-[40px] p-12 text-center">
          <div className="w-20 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Section 1 Complete!</h2>
          <p className="text-slate-400 mb-2">MCQ section submitted successfully.</p>
          <div className="bg-slate-800 rounded-lg p-6 my-8 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-black">Section 2 — Theory Questions</p>
                <p className="text-slate-400 text-sm">5 long-answer questions • 25 minutes</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">These questions are scenario-based, behavioral, or analytical. Write detailed, thoughtful answers.</p>
            <div className="flex items-center gap-2 mt-3 p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Mic className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-300">🎤 Voice dictation is available — click the mic icon to speak your answers</span>
            </div>
          </div>
          <Button
            onClick={() => { setPhase("s2"); setCurrentIdx(0); }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14 rounded-lg font-black text-lg"
          >
            Begin Section 2 <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>
      </div>
    );
  }

  // ── ACTIVE TEST (S1 or S2) ──
  if ((phase === "s1" || phase === "s2") && (isLoading || !assessment)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Assessment...</p>
        </div>
      </div>
    );
  }

  if (phase === "s1" || phase === "s2") {
    const isS1 = phase === "s1";
    const sectionColor = isS1 ? "blue" : "purple";
    const isLowTime = timeLeft < 120;

    return (
      <div ref={containerRef} className="min-h-screen bg-[#050505] text-slate-300">
        {/* Fullscreen gate */}
        {!isFullScreen && !isSubmitting && (
          <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center text-center p-5">
            <div>
              <AlertOctagon className="w-10 h-10 text-red-500 animate-pulse mx-auto mb-6" />
              <h2 className="text-xl font-black text-white mb-3">Fullscreen Required</h2>
              <p className="text-slate-400 mb-8">Re-enable fullscreen to continue your assessment.</p>
              <Button onClick={enterFullscreen} className="bg-blue-600 text-white px-12 h-14 rounded-lg font-bold">
                Return to Test
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-black border-b border-slate-900 flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-4">
              <div className={cn("px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest",
                isS1 ? "bg-blue-600/20 text-blue-400" : "bg-purple-600/20 text-purple-400")}>
                {isS1 ? "Section 1 — MCQ" : "Section 2 — Theory"}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border",
                isLowTime ? "border-red-600/40 bg-red-600/10" : "border-slate-800 bg-slate-900/50")}>
                <Clock className={cn("w-4 h-4", isLowTime ? "text-red-400 animate-pulse" : "text-blue-400")} />
                <span className={cn("text-xl font-black tabular-nums", isLowTime ? "text-red-400" : "text-white")}>
                  {fmt(timeLeft)}
                </span>
              </div>
              {isS1 ? (
                <Button
                  onClick={handleCompleteSection1}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 h-10 rounded-xl font-bold text-xs uppercase"
                >
                  Complete Section 1
                </Button>
              ) : (
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 h-10 rounded-xl font-bold text-xs uppercase"
                >
                  {isSubmitting ? "Submitting..." : "Submit Assessment"}
                </Button>
              )}
            </div>
          </header>

          <main className="flex-1 flex overflow-hidden p-6 gap-6">
            {/* Question Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Card className={cn("flex-1 border-2 rounded-xl flex flex-col overflow-hidden",
                isS1 ? "bg-slate-950/50 border-blue-900/30" : "bg-slate-950/50 border-purple-900/30")}>
                {/* Question header */}
                <div className="p-5 border-b border-slate-900 bg-black/20">
                  <div className="flex gap-3 mb-4">
                    <Badge className={cn("px-3 py-1 text-[10px] font-bold uppercase",
                      isS1 ? "bg-blue-600/10 text-blue-400 border-blue-600/20" : "bg-purple-600/10 text-purple-400 border-purple-600/20")}>
                      {isS1 ? "Multiple Choice" : (curQ?.type || "Theory")}
                    </Badge>
                    <Badge className="bg-slate-900 text-slate-500 border-none text-[10px] font-bold uppercase">
                      {curQ?.topic}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-relaxed">{curQ?.question}</h3>
                </div>

                {/* Answer area */}
                <div className="flex-1 p-5 overflow-y-auto">
                  {isS1 && curQ?.options?.length > 0 ? (
                    <div className="space-y-3">
                      {curQ.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt)}
                          className={cn(
                            "w-full p-5 text-left rounded-lg border-2 transition-all flex items-center gap-5",
                            answers[curQ.id] === opt
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-black/30 border-slate-800 hover:border-slate-700 text-slate-300"
                          )}
                        >
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border-2 shrink-0",
                            answers[curQ.id] === opt ? "border-white/30 bg-white/10" : "border-slate-700 bg-slate-800 text-slate-400")}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-lg font-semibold">{opt}</span>
                          {answers[curQ.id] === opt && <CheckCircle2 className="w-5 h-5 text-white/60 ml-auto shrink-0" />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col h-full gap-3">
                      <div className="relative flex-1">
                        <textarea
                          placeholder="Write your detailed response here or use the microphone to dictate..."
                          value={answers[curQ?.id || ""] || ""}
                          onChange={e => handleAnswer(e.target.value)}
                          className={cn(
                            "w-full h-full min-h-[260px] bg-slate-900/30 border-2 rounded-[24px] p-5 pr-16 text-lg text-white focus:outline-none transition-all placeholder:text-slate-700 resize-none font-medium leading-relaxed",
                            isListening ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]" : "border-slate-800/50 focus:border-purple-500"
                          )}
                        />
                        {/* Floating mic button inside textarea area */}
                        <button
                          type="button"
                          onClick={() => isListening ? stopListening() : startListening()}
                          className={cn(
                            "absolute top-4 right-4 w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                            isListening
                              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/30"
                              : "bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-600/30"
                          )}
                          title={isListening ? "Stop voice input" : "Start voice input"}
                        >
                          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                      </div>
                      {/* Voice input status bar */}
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all",
                        isListening
                          ? "bg-purple-500/10 border-purple-500/30"
                          : "bg-slate-900/30 border-slate-800/30"
                      )}>
                        <div className={cn("w-2 h-2 rounded-full shrink-0",
                          isListening ? "bg-red-500 animate-pulse" : "bg-slate-700"
                        )} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          {isListening ? "🎤 Listening — speak your answer..." : "Voice Input Available — click mic to dictate"}
                        </span>
                        {isListening && (
                          <span className="ml-auto text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                            Recording
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="p-6 px-6 bg-black/40 border-t border-slate-900 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(v => v - 1)}
                    className="text-slate-500 hover:text-white font-bold gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous
                  </Button>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
                    Question {currentIdx + 1} of {questions.length}
                  </p>
                  <Button
                    disabled={currentIdx === questions.length - 1}
                    onClick={() => setCurrentIdx(v => v + 1)}
                    className={cn("text-white font-black px-5 h-12 rounded-lg gap-2",
                      isS1 ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700")}
                  >
                    Next <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="w-72 flex flex-col gap-4">
              {/* Camera */}
              <div className="aspect-video bg-black rounded-[24px] border-2 border-slate-900 overflow-hidden relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-full">Live</span>
                </div>
              </div>

              {/* Progress */}
              <Card className="bg-slate-950/50 border-slate-900 border-2 rounded-[24px] p-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Answered</p>
                  <p className="text-lg font-black text-white">{answeredCount}/{questions.length}</p>
                </div>
                <Progress
                  value={(answeredCount / questions.length) * 100}
                  className={cn("h-2 bg-slate-800", isS1 ? "[&>div]:bg-blue-600" : "[&>div]:bg-purple-600")}
                />
              </Card>

              {/* Question grid */}
              <Card className="flex-1 bg-slate-950/50 border-slate-900 border-2 rounded-[24px] p-4 overflow-y-auto">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 px-1">Questions</p>
                <div className={cn("grid gap-2", isS1 ? "grid-cols-5" : "grid-cols-3")}>
                  {questions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(i)}
                      className={cn(
                        "aspect-square rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center relative",
                        i === currentIdx
                          ? "bg-white text-black border-white"
                          : answers[q.id]
                            ? isS1 ? "bg-blue-600/10 border-blue-600/40 text-blue-400"
                              : "bg-purple-600/10 border-purple-600/40 text-purple-400"
                            : "bg-black/40 border-slate-800 text-slate-600 hover:border-slate-700"
                      )}
                    >
                      {i + 1}
                      {answers[q.id] && i !== currentIdx && (
                        <div className={cn("absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full",
                          isS1 ? "bg-blue-500" : "bg-purple-500")} />
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Integrity */}
              <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm font-bold text-amber-500">{warnings} / 3 Violations</p>
              </div>
            </aside>
          </main>
        </div>
      </div>
    );
  }

  return null;
}
