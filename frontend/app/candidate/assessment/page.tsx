"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList, CheckCircle, Clock, Info, ArrowRight,
  ShieldCheck, Star, Lightbulb, Users, Target, Search,
  ChevronRight, Sparkles, HelpCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

export default function CandidateAssessmentHub() {
  const router = useRouter();
  const { setPageTitle } = useUIStore();

  useEffect(() => {
    setPageTitle("Assessments");
  }, []);

  const { data: overview, isLoading } = useQuery({
    queryKey: ["candidate-overview"],
    queryFn: () => candidateApi.getDashboard().then(r => r.data),
  });

  const apps = overview?.applications || [];

  // Find applications that have an assessment unlocked or in progress
  const activeAssessments = apps.filter((app: any) =>
    ["TECHNICAL_ROUND_PENDING", "TECHNICAL_ROUND_IN_PROGRESS", "ASSESSMENT_UNLOCKED"].includes(app.status)
  );

  const hasActiveAssessment = activeAssessments.length > 0;

  // Dynamic logic for Banner Progress Bar
  const getBannerStepIdx = () => {
    if (apps.length === 0) return 0;
    const s = apps[0].status?.toUpperCase() || "";
    if (s.includes("INTERVIEW")) return 3;
    if (s.includes("ASSESSMENT") || s.includes("TECHNICAL")) return 2;
    if (s.includes("SCREENING") || s.includes("RESUME") || s.includes("EVALUATED") || s.includes("SHORTLISTED")) return 1;
    return 0; // Applied
  };

  const bannerStepIdx = getBannerStepIdx();
  const bannerPercentage = (bannerStepIdx / 3) * 100;
  const currentStepLabel = ["Applied", "Screening", "Assessment", "Interview"][bannerStepIdx];

  const steps = [
    { label: "Applied", status: bannerStepIdx > 0 ? "completed" : bannerStepIdx === 0 ? "current" : "pending" },
    { label: "Screening", status: bannerStepIdx > 1 ? "completed" : bannerStepIdx === 1 ? "current" : "pending" },
    { label: "Assessment", status: bannerStepIdx > 2 ? "completed" : bannerStepIdx === 2 ? "current" : "pending" },
    { label: "Interview", status: bannerStepIdx > 3 ? "completed" : bannerStepIdx === 3 ? "current" : "pending" },
  ];

  if (isLoading) {
    return <div className="p-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Analyzing Assessment Queue...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

      {!hasActiveAssessment ? (
        /* Screening Phase Banner (Default) */
        <Card className="border-none shadow-sm rounded-[40px] bg-white p-6 overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">You are currently in the <br /><span className="text-blue-600 uppercase italic tracking-tighter">{currentStepLabel.toLowerCase()} phase.</span></h2>
              <p className="text-slate-500 font-medium">Once shortlisted, your assessment will be unlocked here.</p>
            </div>

            <div className="flex-1 max-w-xl w-full">
              <div className="relative pt-8 pb-4">
                <div className="absolute top-[52px] left-0 right-0 h-1 bg-slate-100 rounded-full" />
                <div
                  className="absolute top-[52px] left-0 h-1 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-1000"
                  style={{ width: `${bannerPercentage}%` }}
                />

                <div className="flex justify-between items-center relative z-10">
                  {steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-700",
                        step.status === "completed" ? "bg-emerald-500 text-white" :
                          step.status === "current" ? "bg-blue-600 text-white animate-pulse" :
                            "bg-white text-slate-300 border-slate-50"
                      )}>
                        {step.status === "completed" ? <CheckCircle className="w-5 h-5" /> :
                          step.status === "current" ? <Clock className="w-5 h-5" /> :
                            <div className="w-2 h-2 rounded-full bg-slate-200" />}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest transition-colors duration-500",
                        step.status === "completed" ? "text-emerald-500" :
                          step.status === "current" ? "text-blue-600" :
                            "text-slate-300"
                      )}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 opacity-5">
            <Sparkles className="w-80 h-80" />
          </div>
        </Card>
      ) : (
        /* Active Assessment List */
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Active Assessments</h2>
            <p className="text-slate-500 font-medium">Please complete your technical evaluations to proceed to the next round.</p>
          </div>

          <div className="grid gap-6">
            {activeAssessments.map((app: any) => (
              <Card key={app.id} className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">Technical Round</Badge>
                        <h3 className="text-lg font-bold text-slate-900 pt-1">{app.job_title || app.jobId?.title}</h3>
                        <p className="text-slate-500 font-medium text-sm">Application ID: #APP-{String(app.id).slice(-6).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Time</p>
                        <p className="text-xl font-bold text-slate-900">45 Min</p>
                        <p className="text-[10px] text-slate-400">20 MCQ + 25 Theory</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">AI Proctoring Enabled</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Section 1: 20 MCQs · 20 Min</span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Section 2: 5 Theory · 25 Min</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-80 bg-slate-50 p-6 flex flex-col justify-center items-center gap-4 border-l border-slate-100">
                    <Button
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black uppercase tracking-widest shadow-lg shadow-blue-100"
                      onClick={() => router.push(`/candidate/assessment/${app.id}`)}
                    >
                      {app.status === "TECHNICAL_ROUND_IN_PROGRESS" ? "Continue Test" : "Start Assessment"}
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Ready</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-none shadow-sm rounded-xl bg-white p-5 flex flex-col items-center text-center group hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Target className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Improve Your Chances</h4>
          <p className="text-slate-500 text-sm mt-4 leading-relaxed px-4">Complete your profile 100% to get noticed by our AI-powered screening engine faster.</p>
          <Button variant="link" className="text-blue-600 font-bold mt-6" onClick={() => router.push("/candidate/profile")}>Complete Profile <ArrowRight className="ml-2 w-4 h-4" /></Button>
        </Card>

        <Card className="border-none shadow-sm rounded-xl bg-white p-5 flex flex-col items-center text-center group hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Star className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Prepare for Assessment</h4>
          <p className="text-slate-500 text-sm mt-4 leading-relaxed px-4">Our assessments evaluate both technical skills and problem-solving abilities. Stay prepared!</p>
          <Button variant="link" className="text-emerald-600 font-bold mt-6" onClick={() => {
            const { toast } = require("sonner");
            toast.info("Sample questions are being curated by our AI. Check back soon!");
          }}>View Sample Questions <ArrowRight className="ml-2 w-4 h-4" /></Button>
        </Card>

        <Card className="border-none shadow-sm rounded-xl bg-white p-5 flex flex-col items-center text-center group hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Fair & Transparent</h4>
          <p className="text-slate-500 text-sm mt-4 leading-relaxed px-4">We use unbiased AI models to ensure every candidate gets a fair shot at their dream role.</p>
          <Button variant="link" className="text-purple-600 font-bold mt-6" onClick={() => {
            const { toast } = require("sonner");
            toast.info("Our process transparency guide is being updated. Stay tuned!");
          }}>Learn About Our Process <ArrowRight className="ml-2 w-4 h-4" /></Button>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-xl bg-blue-600 text-white p-6 overflow-hidden relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Tips to Ace Your Assessment</h4>
              <p className="text-blue-100 mt-2 font-medium">Read our expert guide on how to perform best in technical evaluations.</p>
            </div>
          </div>
          <Button
            className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-6 rounded-xl font-bold shadow-lg shadow-blue-900/20"
            onClick={() => {
              const { toast } = require("sonner");
              toast.info("Assessment guide is currently being finalized. You'll receive a notification once it's live!");
            }}
          >
            Read Guide
          </Button>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Search className="w-64 h-64" />
        </div>
      </Card>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
        <div className="flex items-center gap-4 text-slate-400">
          <HelpCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Confused about the process? <button className="text-blue-600 font-bold hover:underline">Contact our support team</button></p>
        </div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Protocol version 2.4.0 • Secured by AI Hiring System AI</p>
      </div>
    </div>
  );
}
