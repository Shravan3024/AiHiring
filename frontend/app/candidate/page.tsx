"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import { useAuthStore, useUIStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, ClipboardList, Video, FileText, CheckCircle, 
  AlertCircle, Search, ChevronRight, Zap, User, ArrowRight,
  ShieldCheck, Info, FlaskConical, Beaker, Settings, PenTool, Layout,
  Calendar, Mail, Star, HelpCircle, Activity, Target, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

type CandidateOverview = {
  applications?: Array<{ id?: number; jobId?: { title?: string }; stage?: string; status?: string; applied_at?: string }>;
  dashboard?: { applications?: Array<{ id?: number; jobId?: { title?: string }; stage?: string; status?: string; applied_at?: string }> };
  nextAction?: { message?: string; href?: string } | string;
};

export default function CandidateDashboard() {
  const { user } = useAuthStore();
  const { setPageTitle } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    setPageTitle("Dashboard");
  }, []);

  const { data: overview, isLoading } = useQuery<CandidateOverview, Error>({
    queryKey: ["candidate-overview"],
    queryFn: () => candidateApi.getDashboard().then((r) => r.data),
    enabled: !!user,
    refetchInterval: 5000, // Update dashboard data every 5 seconds for real-time feel
  });

  const apps = overview?.applications || overview?.dashboard?.applications || [];
  const latestApp = apps[0];
  const appStatus = latestApp?.status?.toUpperCase() || "NONE";

  const getStepStatus = (index: number) => {
    // 0: Profile Setup, 1: Application Review, 2: Skills Assessment, 3: Technical Interview, 4: Final Offer
    if (index === 0) return "completed";
    
    const statusMap: Record<string, number> = {
      // Step 1: Application Review / Screening
      "APPLIED": 1,
      "SCREENING": 1,
      "RESUME_REVIEW": 1,
      "RESUME_SUBMITTED": 1,
      "RESUME_EVALUATED": 1,
      "SHORTLISTED": 1,
      
      // Step 2: Skills Assessment
      "ASSESSMENT_UNLOCKED": 2,
      "TECHNICAL_ROUND": 2,
      "TECHNICAL_ROUND_PENDING": 2,
      "TECHNICAL_ROUND_IN_PROGRESS": 2,
      "ASSESSMENT_IN_PROGRESS": 2,
      "TECHNICAL_ROUND_COMPLETED": 2,
      "ASSESSMENT_COMPLETED": 2,
      
      // Step 3: AI Interview
      "INTERVIEW_SCHEDULED": 3,
      "INTERVIEW_UNLOCKED": 3,
      "INTERVIEW_PENDING": 3,
      "INTERVIEW_IN_PROGRESS": 3,
      "RE_INTERVIEW_REQUESTED": 3,
      "INTERVIEW_COMPLETED": 3,
      
      // Step 4: HR Review & Final Offer
      "RECOMMENDED_BY_AI": 4,
      "PROCEED_TO_HR": 4,
      "HR_REVIEW": 4,
      "OFFERED": 4,
      "OFFER_SENT": 4,
      "SELECTED": 4,
      "HIRED": 4,
      "ACCEPTED": 4,
      "OFFER_REJECTED": 4,
    };

    const currentStage = statusMap[appStatus] || (apps.length > 0 ? 1 : 0);

    if (currentStage > index) return "completed";
    if (currentStage === index) return "current";
    return "pending";
  };

  const getStageColor = (status?: string) => {
    if (!status) return "bg-blue-50 text-blue-600";
    const s = status.toUpperCase();
    if (s.includes("OFFER")) return "bg-emerald-50 text-emerald-600";
    if (s.includes("INTERVIEW")) return "bg-purple-50 text-purple-600";
    if (s.includes("ASSESSMENT") || s.includes("TECHNICAL")) return "bg-blue-50 text-blue-600";
    return "bg-slate-50 text-slate-400";
  };

  const nextSteps = [
    { 
      label: "Profile Setup", 
      date: "Completed", 
      status: getStepStatus(0), 
      icon: User, 
      desc: "Your professional profile is 100% complete." 
    },
    { 
      label: "Application Review", 
      date: getStepStatus(1) === "completed" ? "Completed" : getStepStatus(1) === "current" ? "In Progress" : "Upcoming", 
      status: getStepStatus(1), 
      icon: FileText, 
      desc: "Recruiters are evaluating your resume." 
    },
    { 
      label: "Skills Assessment", 
      date: getStepStatus(2) === "completed" ? "Completed" : getStepStatus(2) === "current" ? "Active" : "Upcoming", 
      status: getStepStatus(2), 
      icon: Target, 
      desc: "Complete tests to showcase your skills." 
    },
    { 
      label: "Technical Interview", 
      date: getStepStatus(3) === "completed" ? "Completed" : getStepStatus(3) === "current" ? "Scheduled" : "Upcoming", 
      status: getStepStatus(3), 
      icon: Video, 
      desc: "Live interaction with our tech team." 
    },
    { 
      label: "Final Offer", 
      date: getStepStatus(4) === "completed" || getStepStatus(5) === "completed" ? "Completed" : getStepStatus(4) === "current" ? "Received" : "Upcoming", 
      status: getStepStatus(4), 
      icon: Star, 
      desc: "Join the Mask Polymers family." 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, {user?.name?.split(" ")[0] || "Candidate"}! 👋</h2>
          <p className="text-slate-500 font-medium text-lg">Your career journey at Mask Polymers starts here.</p>
        </div>
        <Button onClick={() => router.push("/candidate/profile")} className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-100 h-14 px-8 rounded-2xl font-bold shadow-sm flex items-center gap-2 transition-all">
           Update Profile <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Applications List */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
            <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-black text-slate-900">Active Applications</CardTitle>
              <Badge className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg border-none font-bold text-xs">{apps.length} Roles</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {apps.length > 0 ? apps.map((app: any, idx: number) => (
                  <div 
                    key={app.id || idx} 
                    onClick={() => router.push(`/candidate/application/${app.id}`)}
                    className="p-10 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:scale-110 duration-500",
                        idx % 3 === 0 ? "bg-blue-50 text-blue-600" : idx % 3 === 1 ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"
                      )}>
                        {idx % 3 === 0 ? <Beaker className="w-7 h-7" /> : idx % 3 === 1 ? <FlaskConical className="w-7 h-7" /> : <Layout className="w-7 h-7" />}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{app.jobId?.title || "Role Title"}</h4>
                        <div className="flex items-center gap-2 text-slate-400 font-medium mt-1">
                           <Briefcase className="w-3.5 h-3.5" />
                           <span className="text-xs">Mask Polymers Pvt. Ltd.</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:gap-16">
                      <Badge className={cn("px-5 py-2 rounded-xl border-none font-bold uppercase text-[9px] tracking-widest", getStageColor(app.status))}>
                        {app.status?.replace(/_/g, " ") || "APPLIED"}
                      </Badge>
                      <div className="text-right hidden xl:block">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Applied On</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "26 Apr 2026"}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto">
                       <Search className="w-8 h-8 text-slate-200" />
                    </div>
                    <div>
                       <h4 className="text-xl font-bold text-slate-900">No active applications</h4>
                       <p className="text-slate-400 font-medium mt-1">You haven't applied for any positions yet.</p>
                    </div>
                    <Button onClick={() => router.push("/candidate/application")} className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-bold">Browse Open Positions</Button>
                  </div>
                )}
              </div>
              {apps.length > 0 && (
                <div className="p-10 pt-4 border-t border-slate-50 text-center">
                  <Button variant="link" className="text-blue-600 font-bold hover:no-underline flex items-center gap-2 mx-auto" onClick={() => router.push("/candidate/application")}>
                    View All Applications <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What's Next Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900">How our process works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Assessments", desc: "Showcase your skills through curated technical tests.", icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
                { title: "Interviews", desc: "Interact with our lead engineers and hiring managers.", icon: Video, color: "bg-emerald-50 text-emerald-600" },
                { title: "Offer", desc: "Receive a formal offer and join our innovative team.", icon: Zap, color: "bg-purple-50 text-purple-600" }
              ].map((item, i) => (
                <Card key={i} className="border-none shadow-sm rounded-[32px] bg-white p-8 flex flex-col gap-6 group hover:shadow-md transition-all">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500", item.color)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Next Steps */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden p-10">
            <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">
               <Activity className="w-6 h-6 text-blue-600" /> Next Steps
            </h3>
            
            <div className="relative space-y-12">
               {/* Vertical Line */}
               <div className="absolute left-[23px] top-[40px] bottom-[40px] w-0.5 border-l-2 border-dashed border-slate-100" />
               
               {nextSteps.map((step, i) => (
                 <div key={i} className="flex items-start gap-6 relative z-10 group">
                   <div className={cn(
                     "w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-500 shrink-0",
                     step.status === "completed" ? "bg-emerald-500 text-white" :
                     step.status === "current" ? "bg-blue-600 text-white animate-pulse" :
                     "bg-white text-slate-200"
                   )}>
                     {step.status === "completed" ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                   </div>
                   <div className="flex-1 pt-1">
                     <div className="flex items-center justify-between mb-1">
                       <h4 className={cn("font-bold text-sm", step.status === "current" ? "text-blue-600" : "text-slate-900")}>{step.label}</h4>
                       <span className={cn(
                         "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                         step.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                         step.status === "current" ? "bg-blue-50 text-blue-600" :
                         "bg-slate-50 text-slate-300"
                       )}>{step.date}</span>
                     </div>
                     <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        {step.desc}
                     </p>
                   </div>
                 </div>
               ))}
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-4 text-slate-500">
                  <HelpCircle className="w-5 h-5" />
                  <p className="text-[11px] font-medium leading-tight">Need assistance with your application? <button onClick={() => router.push("/contact")} className="text-blue-600 font-bold hover:underline">Contact Support</button></p>
               </div>
            </div>
          </Card>

          {/* Mini Banner */}
          <Card className="border-none shadow-sm rounded-[32px] bg-blue-600 p-8 text-white relative overflow-hidden group">
             <div className="relative z-10 space-y-4">
                <h4 className="text-lg font-bold">Top 1% Candidate?</h4>
                <p className="text-blue-100 text-xs font-medium leading-relaxed">Verified profiles get 3x more interview invites. Update your skills now.</p>
                <Button className="bg-white text-blue-600 hover:bg-blue-50 h-10 px-6 rounded-xl font-bold text-xs" onClick={() => router.push("/candidate/profile")}>
                   Verify Profile
                </Button>
             </div>
             <Sparkles className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform duration-700" />
          </Card>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400">
         <div className="flex items-center gap-4">
            <ShieldCheck className="w-5 h-5 text-blue-600/50" />
            <p className="text-xs font-medium">Your data is secured with AES-256 encryption. Powered by Mask Polymers AI.</p>
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.4em]">© 2026 MASK POLYMERS PVT. LTD.</p>
      </div>
    </div>
  );
}
