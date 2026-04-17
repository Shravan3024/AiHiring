"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Monitor, 
  Lock,
  Zap,
  LayoutGrid,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function CandidateAssessmentHub() {
  const router = useRouter();

  const { data: overview, isLoading } = useQuery({
    queryKey: ["candidate-overview"],
    queryFn: () => candidateApi.getDashboard().then(r => r.data),
  });

  const apps = overview?.applications || overview?.dashboard?.applications || [];
  
  // Find applications that require assessment
  const assessmentApps = apps.filter((app: any) => 
     ["TECHNICAL_ROUND_PENDING", "TECHNICAL_ROUND_IN_PROGRESS", "TECHNICAL_ROUND_COMPLETED", "ASSESSMENT_UNLOCKED"].includes(app.status) ||
     app.status === "APPLIED" || app.status === "SHORTLISTED"
  );

  return (
    <PanelLayout title="Assessment Command Center" allowedRoles={["CANDIDATE"]}>
      <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
        
        {/* Header Branding */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
           <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Skills Matrix <span className="text-blue-600">Alpha</span></h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Industrial Evaluation Hub & Security Protocol</p>
           </div>
           <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl border border-gray-200">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                 <ShieldAlert className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase">System Status</p>
                 <p className="text-xs font-black text-emerald-600 uppercase">Operational - SEC LEVEL 4</p>
              </div>
           </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse" />)}
          </div>
        ) : assessmentApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assessmentApps.map((app: any) => {
              const app_id = String(app?._id || app?.id);
              const isLocked = !["TECHNICAL_ROUND_PENDING", "TECHNICAL_ROUND_IN_PROGRESS", "ASSESSMENT_UNLOCKED"].includes(app.status);
              const isCompleted = app.status === "TECHNICAL_ROUND_COMPLETED";

              return (
                <Card key={app_id} className="group relative border-2 border-gray-200 bg-white rounded-[2.5rem] overflow-hidden hover:border-blue-500 transition-all duration-500 shadow-xl hover:shadow-blue-500/10">
                  <div className={cn("h-3 w-full", isCompleted ? "bg-emerald-500" : isLocked ? "bg-gray-300" : "bg-blue-600")} />
                  
                  <CardHeader className="p-8">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                          <ClipboardList className="w-6 h-6" />
                       </div>
                       <Badge className={cn("uppercase text-[9px] font-black tracking-widest px-3 py-1", 
                          isCompleted ? "bg-emerald-100 text-emerald-600" : isLocked ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600"
                       )}>
                          {app.status.replace(/_/g, " ")}
                       </Badge>
                    </div>
                    <CardTitle className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{app.job?.title || "Technical Assessment"}</CardTitle>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ref ID: SEC-{app_id.slice(-6).toUpperCase()}</p>
                  </CardHeader>

                  <CardContent className="px-8 pb-8 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                       <Clock className="w-4 h-4 text-gray-400" />
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Estimated Time</p>
                          <p className="text-sm font-bold text-gray-700">60 MINUTES</p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                          <Monitor className="w-4 h-4" /> Fullscreen Isolation Mode
                       </div>
                       <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                          <Lock className="w-4 h-4" /> Biometric Data Collection
                       </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 bg-gray-50/50 border-t border-gray-100">
                    {isCompleted ? (
                       <Button disabled className="w-full bg-emerald-50 text-emerald-600 border-none font-black uppercase text-xs tracking-widest h-14 rounded-2xl">
                          <CheckCircle className="w-4 h-4 mr-2" /> Evaluation Finalized
                       </Button>
                    ) : isLocked ? (
                       <Button disabled className="w-full bg-gray-100 text-gray-400 border-none font-black uppercase text-xs tracking-widest h-14 rounded-2xl">
                          <Lock className="w-4 h-4 mr-2" /> Protocol Locked
                       </Button>
                    ) : (
                       <Button 
                          onClick={() => router.push(`/candidate/assessment/${app_id}`)}
                          className="w-full bg-gray-900 hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] h-14 rounded-2xl shadow-xl transition-all group-hover:scale-[1.02]"
                       >
                          Initialize Protocol <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                       </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white border-2 border-dashed border-gray-200 rounded-[4rem]">
             <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center">
                <LayoutGrid className="w-10 h-10 text-gray-200" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase italic">No Active Matrices</h3>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2 max-w-sm mx-auto">You have no assessments scheduled at this time. Protocol will engage upon application shortlisting.</p>
             </div>
             <Button variant="outline" onClick={() => router.push("/candidate")} className="rounded-full px-10 h-12 border-gray-300 font-bold uppercase text-[10px] tracking-widest">Return to Dashboard</Button>
          </div>
        )}

        {/* Pro-Tips / Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
           <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
                 <ShieldAlert className="w-48 h-48" />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Security Protocol 4.0</h4>
              <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-md">
                 Our industrial assessment environment uses strict behavioral analytics. Ensure a quiet environment and stable connectivity before initializing.
              </p>
           </div>
           <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
                 <Zap className="w-48 h-48" />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">AI Matrix Scoring</h4>
              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-md">
                 Evaluation is performing using a hybrid AI-ML engine. Final scores are cross-verified against industrial benchmarks for total accuracy.
              </p>
           </div>
        </div>

      </div>
    </PanelLayout>
  );
}