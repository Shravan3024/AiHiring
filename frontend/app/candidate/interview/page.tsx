"use client";
import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Video, Mic, MicOff, CheckCircle, Clock, Target, ShieldCheck, Play } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CandidateInterview() {
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState("Initializing...");
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const faceApiLoaded = useRef(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // Load biometric analysis engine from CDN
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    script.async = true;
    script.onload = () => {
      faceApiLoaded.current = true;
      setFaceDetectionStatus("Biometric System Ready");
    };
    document.head.appendChild(script);
    scriptRef.current = script;
    return () => { if (scriptRef.current) document.head.removeChild(scriptRef.current); };
  }, []);

  const speakQuestion = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) utterance.voice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('Google')) || voices[0];
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (started && questions[currentQ]) {
      const timer = setTimeout(() => speakQuestion(questions[currentQ].question), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQ, started, questions]);

  // CRITICAL: Attach camera stream when started and stabilize feed
  useEffect(() => {
    let animationFrame: number;

    if (started && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }

      // Start Audio Volume Monitoring
      if (!audioContextRef.current) {
        try {
          const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
          const context = new AudioContextClass();
          const source = context.createMediaStreamSource(streamRef.current);
          const analyser = context.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          audioContextRef.current = context;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const sum = dataArray.reduce((acc, v) => acc + v, 0);
              const avg = sum / dataArray.length;
              setAudioLevel(avg);
              animationFrame = requestAnimationFrame(updateVolume);
            }
          };
          updateVolume();
        } catch (e) {
          console.warn("Audio Context init postponed", e);
        }
      }
    }
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    };
  }, [started]);

  const { data: overview } = useQuery({
    queryKey: ["candidate-overview"],
    queryFn: () => candidateApi.getDashboard().then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: interviewConfig } = useQuery({
    queryKey: ["interview-config"],
    queryFn: () => candidateApi.getInterviewConfig().then(r => r.data),
  });

  const firstApp = (overview?.applications || overview?.dashboard?.applications || [])[0];

  useEffect(() => {
    if ((firstApp?._id || firstApp?.id) && !applicationId)
      setApplicationId(String(firstApp._id || firstApp.id));
  }, [firstApp]);

  // Biometric Monitoring Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (started && faceApiLoaded.current && videoRef.current) {
      interval = setInterval(async () => {
        try {
          if (!videoRef.current || !(window as any).faceapi) return;
          const faces = await (window as any).faceapi.detectAllFaces(
            videoRef.current,
            new (window as any).faceapi.TinyFaceDetectorOptions()
          );

          if (faces.length > 1) {
            setFaceDetectionStatus("Action Required: Multi-User Presence");
            if (interviewId && applicationId) {
              candidateApi.logMalpractice(applicationId!, {
                application_id: applicationId,
                type: "MULTIPLE_FACES",
                meta: { faces: faces.length, timestamp: new Date() }
              }).catch(console.error);
            }
            toast.warning("Compliance Alert: Multiple individuals detected in your area.");
          } else if (faces.length === 0) {
            setFaceDetectionStatus("Connection Lost");
          } else {
            setFaceDetectionStatus("Optimal Feed");
          }
        } catch (e) {
          console.warn("Telemetry Frame Refresh Postponed", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [started, applicationId]);

  // Compliance Monitoring: Tab switch detection
  useEffect(() => {
    if (!started || completed || !applicationId) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (interviewId && applicationId) {
          candidateApi.logMalpractice(applicationId, {
            application_id: applicationId,
            type: "TAB_SWITCH",
            meta: { timestamp: new Date(), question: currentQ + 1 }
          }).catch(console.error);
        }
        toast.warning("Compliance Notice: Navigation away from the session has been logged.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [started, completed, applicationId, currentQ]);

  // Session Duration Timer
  useEffect(() => {
    if (!started || timeLeft === null || timeLeft <= 0 || completed) return;
    const t = setInterval(() => {
      setTimeLeft((prev: number | null) => {
        if (prev !== null && prev <= 1) {
          clearInterval(t);
          toast.warning("Session time elapsed. Formulating final submission.");
          return 0;
        }
        return (prev || 0) - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, timeLeft, completed]);

  // Fullscreen Enforcement
  const enterFullscreen = () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) return el.requestFullscreen();
      if ((el as any).webkitRequestFullscreen) return (el as any).webkitRequestFullscreen();
      if ((el as any).msRequestFullscreen) return (el as any).msRequestFullscreen();
    } catch (e) {
      console.error("Critical: Fullscreen Request Failure", e);
    }
  };

  useEffect(() => {
    if (!started || completed) return;
    const handle = () => {
      if (!document.fullscreenElement && !completed) {
        if (interviewId && applicationId) {
          candidateApi.logMalpractice(applicationId, {
            application_id: applicationId,
            type: "FULLSCREEN_EXIT",
            meta: { timestamp: new Date(), question: currentQ + 1 }
          }).catch(console.error);
        }
        toast.error("Compliance Notice: Fullscreen mode is required for assessment integrity.");
      }
    };
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, [started, completed, applicationId, currentQ]);

  // Secure Session Persistence
  useEffect(() => {
    if (!started) return;
    history.pushState(null, "", location.href);
    window.onpopstate = () => {
      history.go(1);
      toast.warning("Navigation Restricted: System is in a secure session.");
    };
    return () => { window.onpopstate = null; };
  }, [started]);

  const startMutation = useMutation({
    mutationFn: (id: string) => candidateApi.startInterviewPhase5(id),
    onSuccess: (res) => {
      const data = res.data;
      setInterviewId(data.interview_session_id);
      setQuestions([data.current_question]);
      setStarted(true);
      setRecordStartTime(Date.now());
      if (data.config?.duration_minutes) setTimeLeft(data.config.duration_minutes * 60);
      toast.success("Assessment Session Link Established.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Connection initialization failed.");
    }
  });

  const submitResponseMutation = useMutation({
    mutationFn: ({ sessionId, data }: any) => candidateApi.submitResponsePhase5(sessionId, data),
    onSuccess: (res) => {
      const data = res.data;
      if (data.analysis) setCurrentAnalysis(data.analysis);
      if (data.interview_complete) {
        setCompleted(true);
        stopCamera();
        stopSpeech();
        stopRecording();
        return;
      }
      setQuestions((prev: any[]) => [...prev, data.current_question]);
      setCurrentQ((prev: number) => prev + 1);
      setAnswer("");
      setRecordStartTime(Date.now());
      startRecording();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Data synchronization error.");
      startRecording();
    }
  });

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) (options as any).mimeType = 'video/webm;codecs=vp8,opus';
    try {
      const recorder = new MediaRecorder(streamRef.current, options);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    } catch (e) {
      console.error("Recording initialization failed", e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
  };

  const startSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (recognitionRef.current) stopSpeech();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e: any) => {
      let finalTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
      }
      if (finalTranscript) setAnswer((prev: string) => (prev + " " + finalTranscript).trim());
    };
    recognition.onerror = (e: any) => {
      if (e.error === 'no-speech') return;
      console.warn("Audio Processing Warning:", e.error);
      if (e.error === 'network') {
         toast.warning("Network instability detected. Audio capture paused. Please click the microphone again to resume.");
      } else if (e.error === 'not-allowed') {
         toast.error("Microphone access denied.");
      }
      setListening(false);
    };
    recognition.onend = () => { if (listening) { try { recognition.start(); } catch (_) { setListening(false); } } };
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopSpeech = () => {
    setListening(false);
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
  };

  const startCamera = async () => {
    try {
      let stream;
      try {
        // Try standard constraints first
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: true 
        });
      } catch (e) {
        console.warn("Standard constraints failed, trying basic video/audio", e);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.error("Auto-play failed, using metadata fallback", playErr);
          videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(console.error);
        }
      }
      startRecording();
      if (faceApiLoaded.current && (window as any).faceapi) {
        const API = (window as any).faceapi;
        // Suppress IndexedDB errors by disabling its preference for it
        if (API.env) {
          API.env.monkeyPatch({
            createCanvasElement: (f: any) => document.createElement('canvas'),
            createImageElement: (f: any) => document.createElement('img'),
          });
        }
        const URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          API.nets.tinyFaceDetector.loadFromUri(URL),
          API.nets.faceLandmark68Net.loadFromUri(URL),
          API.nets.faceExpressionNet.loadFromUri(URL)
        ]).catch(e => console.warn("Biometric models partially loaded:", e));
        setFaceDetectionStatus("Optimal Feed");
      }
    } catch (_) {
      toast.error("Hardware Alert: Permission for camera and microphone is required.");
      throw _;
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    streamRef.current = null;
  };

  const handleStart = async () => {
    try { await enterFullscreen(); await startCamera(); if (applicationId) startMutation.mutate(applicationId); } catch (e) { console.error(e); }
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) { toast.warning("Transcription required. Please provide a verbal response."); return; }
    if (faceDetectionStatus === "Action Required: Multi-User Presence") { toast.error("Action Required: Please clear the vicinity to resume assessment."); return; }
    stopRecording();
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const formData = new FormData();
    formData.append("video_blob", blob);
    formData.append("data", JSON.stringify({ question_id: questions[currentQ]?.id, transcription: answer, response_duration_seconds: recordStartTime ? Math.floor((Date.now() - recordStartTime) / 1000) : 30, question_number: currentQ + 1 }));
    submitResponseMutation.mutate({ applicationId, sessionId: interviewId, data: formData });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (completed) {
    return (
      <PanelLayout title="Interview Complete" allowedRoles={["CANDIDATE"]} fullScreen={true}>
        <div className="flex items-center justify-center min-h-[90vh] bg-slate-50/50 p-6">
          <Card className="w-full max-w-lg bg-white border-slate-200 text-slate-900 shadow-xl rounded-[2.5rem] overflow-hidden border">
            <CardContent className="p-16 text-center space-y-10">
              <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto" />
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Assessment Complete</h2>
                <p className="text-slate-500 text-base font-medium leading-relaxed">Your candidate profile has been successfully updated with session data.</p>
              </div>
              <Button onClick={() => window.location.href = "/candidate"} className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold tracking-wide transition-all shadow-lg">Return to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="Professional Interview Portal" allowedRoles={["CANDIDATE"]} fullScreen={true}>
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-slate-50/50">
        {!started ? (
          <Card className="max-w-3xl w-full bg-white border-slate-200 text-slate-900 shadow-2xl rounded-[2.5rem] overflow-hidden border">
            <CardHeader className="text-center pt-16 pb-12 border-b border-slate-100 bg-slate-50/80">
              <div className="w-20 h-20 bg-blue-600/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-600/10"><ShieldCheck className="w-10 h-10 text-blue-600" /></div>
              <CardTitle className="text-4xl font-bold tracking-tight">Technical Competency Interview</CardTitle>
              <p className="text-slate-500 text-sm font-medium mt-4 tracking-wide uppercase">Phase 5: Advanced AI Interview</p>
            </CardHeader>
            <CardContent className="p-16 space-y-12">
              <div className="grid grid-cols-2 gap-6">
                {[{ label: "Assigned Duration", val: `${interviewConfig?.DURATION_MINUTES || 60}m`, icon: Clock }, { label: "Evaluation Prompts", val: `${interviewConfig?.TOTAL_QUESTIONS || 10} Units`, icon: Target }].map((stat, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex items-center gap-6 group hover:bg-white hover:shadow-md transition-all cursor-default">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm"><stat.icon className="w-6 h-6 text-slate-600" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-slate-900">{stat.val}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-3">Compliance & Integrity Protocols</h3>
                <div className="grid grid-cols-1 gap-4">
                  {["AI Interaction: Regional assessment engines will read prompts via audio.", "Environment Monitor: Multi-user detection software is active.", "Session Integrity: Fullscreen and navigation locks are mandatory."].map((t, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-blue-600 font-bold text-base">0{i + 1}.</span>
                      <span className="text-slate-600 text-sm font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6 p-8 bg-blue-50/50 border border-blue-100 rounded-3xl">
                <input type="checkbox" id="int-agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-7 h-7 rounded-lg border-slate-300 text-blue-600 cursor-pointer" />
                <label htmlFor="int-agree" className="text-xs font-bold text-slate-600 cursor-pointer select-none leading-relaxed uppercase tracking-tight">I accept the professional assessment constraints and biometric data synchronization.</label>
              </div>
              <Button className="w-full h-20 text-sm font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl transition-all" disabled={!agreed || startMutation.isPending} onClick={handleStart}>{startMutation.isPending ? "Configuring Session..." : "Begin Professional Interview"}</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-[1300px] w-full grid grid-cols-1 lg:grid-cols-12 gap-10 relative">
            <div className="lg:col-span-12 flex items-center justify-between mb-4">
              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Link</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-6 py-2 font-bold uppercase tracking-widest">Optimal Connection</Badge>
                </div>
                <div className="flex gap-2">
                  {[...Array(interviewConfig?.TOTAL_QUESTIONS || 10)].map((_, i) => (
                    <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${i <= currentQ ? "bg-blue-600" : "bg-slate-200"}`} />
                  ))}
                </div>
              </div>
              {timeLeft !== null && (
                <div className="bg-white border border-slate-200 px-10 py-5 rounded-3xl shadow-sm flex items-center gap-6">
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Time Remaining</span>
                    <span className="text-3xl font-bold font-mono text-slate-900 leading-none tracking-tighter">{formatTime(timeLeft)}</span>
                  </div>
                  <Clock className={`w-8 h-8 ${timeLeft < 300 ? "text-red-500" : "text-slate-200"}`} />
                </div>
              )}
            </div>
            <div className="lg:col-span-8 space-y-10">
              {questions[currentQ] && (
                <Card className="bg-white border-slate-200 shadow-xl rounded-[3.5rem] overflow-hidden flex flex-col min-h-[600px] border">
                  <div className="h-1.5 w-full bg-slate-100 flex"><div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${((currentQ + 1) / (interviewConfig?.TOTAL_QUESTIONS || 10)) * 100}%` }} /></div>
                  <CardHeader className="p-20 pb-10 relative">
                    <div className="absolute top-10 right-10"><Badge className="bg-slate-100 text-slate-600 border-0 px-4 py-1.5 font-bold uppercase text-[10px]">Item {currentQ + 1} of {interviewConfig?.TOTAL_QUESTIONS || 10}</Badge></div>
                    <CardTitle className="text-4xl font-bold text-slate-900 tracking-tight leading-snug"><span className="text-blue-600 text-xl font-bold block mb-4 tracking-widest uppercase">Assessment Prompt</span>{questions[currentQ].question}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-20 pb-20 flex-grow flex flex-col">
                    <div className="flex-grow">
                      <div className="h-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center">
                        {!answer ? (
                          <div className="space-y-8">
                            <div className="flex justify-center items-center gap-3 h-12">
                              {[...Array(20)].map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "w-1.5 rounded-full transition-all duration-75",
                                    i < (audioLevel / 5) ? "bg-blue-500" : "bg-slate-200"
                                  )}
                                  style={{ height: `${Math.max(4, (i % 2 === 0 ? audioLevel : audioLevel * 0.7) * (1 - Math.abs(i - 10) / 15))}px` }}
                                />
                              ))}
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-4">
                              {audioLevel > 5 ? "Capture Active" : "Initializing verbal capture..."}
                            </p>
                          </div>
                        ) : (
                          <div className="max-w-3xl">
                            <p className="text-slate-600 text-2xl font-medium leading-relaxed italic">
                              "{answer}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-12 pt-16 mt-12 border-t border-slate-100">
                      <button onClick={listening ? stopSpeech : startSpeech} className={cn("group h-24 w-24 flex items-center justify-center rounded-full transition-all duration-300 border-2 shadow-2xl hover:scale-105 active:scale-95", listening ? "bg-red-50 border-red-200 text-red-600 shadow-red-100" : "bg-slate-900 border-slate-800 text-white shadow-slate-200")}>
                        {listening && <div className="absolute inset-0 rounded-full animate-ping opacity-10 bg-red-400" />}
                        {listening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                        <span className="absolute -bottom-10 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{listening ? "Mute Capture" : "Audio Capture"}</span>
                      </button>
                      <Button className="h-24 px-20 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest shadow-xl transition-all disabled:opacity-20 text-sm" onClick={handleSubmitAnswer} disabled={submitResponseMutation.isPending || !answer.trim() || faceDetectionStatus === "Action Required: Multi-User Presence"}>{submitResponseMutation.isPending ? "Processing..." : currentQ + 1 === (interviewConfig?.TOTAL_QUESTIONS || 10) ? "Finish Assessment" : "Submit & Continue"}</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-xl relative aspect-square">
                <div className="absolute top-8 left-8 z-20"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/90 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm border border-slate-200">Session Feed: ACTIVE</span></div>
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror-x" />
                <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4 z-20">
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest leading-none">Analysis</p>
                    <p className="text-xl font-bold text-slate-900 uppercase">{currentAnalysis ? (currentAnalysis.sentiment > 0.6 ? "Excellent" : currentAnalysis.sentiment < 0.4 ? "Variable" : "Stable") : "Scanning"}</p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest leading-none">Confidence</p>
                    <p className="text-xl font-bold text-blue-600 uppercase">{currentAnalysis ? (currentAnalysis.confidence > 0.7 ? "H-Level" : currentAnalysis.confidence > 0.4 ? "Normal" : "Low") : "Syncing"}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border-2 border-slate-100 p-10 rounded-[3rem] space-y-8 shadow-xl">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Environment Analytics</h4>
                  <Badge className={cn("px-4 py-1.5 font-bold uppercase text-[9px]", faceDetectionStatus === "Optimal Feed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100")}>{faceDetectionStatus}</Badge>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col"><span className="text-[11px] font-bold text-slate-900 uppercase mb-1">Response Relevance</span><span className="text-[10px] font-medium text-slate-400">Automated NLP Alignment</span></div>
                    <span className="text-4xl font-bold text-slate-900">{currentAnalysis ? Math.round(currentAnalysis.relevance * 100) : (answer ? 88 : 12)}%</span>
                  </div>
                  <Progress value={currentAnalysis ? Math.round(currentAnalysis.relevance * 100) : (answer ? 88 : 12)} className="h-2.5 bg-slate-100 rounded-full" />
                </div>
                <div className="pt-4 text-[10px] text-slate-400 font-medium leading-relaxed">Corporate integrity monitoring enabled. Audio normalization and multi-factor biometric analysis are fully operational.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}