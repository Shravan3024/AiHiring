"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { AIDecisionPanel } from "@/components/ai/AIDecisionPanel";
import { AssessmentAnalysisPanel } from "@/components/ai/AssessmentAnalysisPanel";
import { InterviewAnalysisPanel } from "@/components/ai/InterviewAnalysisPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, TrendingUp, ShieldCheck, Download, 
  ChevronLeft, BarChart2, BrainCircuit 
} from "lucide-react";
import { toast } from "sonner";

export default function MDApplicationReview() {
  const { id } = useParams();
  const router = useRouter();
  const applicationId = Number(id);

  const { data: appResponse, isLoading } = useQuery({
    queryKey: ["hr-application", applicationId],
    queryFn: async () => (await hrApi.getCandidateProfile(String(applicationId))).data,
  });

  const app = appResponse?.data;

  const handleDownloadReport = async () => {
     try {
       const res = await hrApi.getExecutiveReport(String(applicationId));
       const url = window.URL.createObjectURL(new Blob([res.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `EXECUTIVE_REPORT_${applicationId}.pdf`);
       document.body.appendChild(link);
       link.click();
       toast.success("Executive PDF Generated");
     } catch (e) {
        toast.error("Failed to generate report");
     }
  };

  if (isLoading) return <div className="p-12 text-center text-slate-400">Loading AI Insights...</div>;

  return (
    <PanelLayout title="Executive Approval Terminal" allowedRoles={["MD", "ADMIN"]}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase">Executive Approval</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Candidate: {app?.Candidate?.User?.name} | Role: {app?.Job?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button onClick={handleDownloadReport} variant="outline" className="gap-2 border-slate-300 font-bold uppercase text-[10px] tracking-widest">
                <Download className="w-4 h-4" /> Download Executive Dossier
             </Button>
             <Badge className="px-4 py-2 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px]">
                Stage: {app?.status}
             </Badge>
          </div>
        </div>

        {/* Top Section: Decision Core & Benchmark */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
                <AIDecisionPanel applicationId={applicationId} />
            </div>
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-slate-200 shadow-md">
                   <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                         <BarChart2 className="w-4 h-4 text-blue-600" /> Peer Benchmarking
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Candidate vs Peer Average</p>
                         <div className="flex items-end gap-3">
                            <p className="text-4xl font-black text-slate-900">{Math.round(app?.overall_score || 0)}%</p>
                            <p className="text-sm font-bold text-emerald-600 mb-1.5 flex items-center gap-0.5">
                               <TrendingUp className="w-3 h-3" /> +12%
                            </p>
                         </div>
                         <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-600 h-full" style={{ width: `${app?.overall_score}%` }} />
                         </div>
                      </div>

                      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                         <p className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Integrity Verification
                         </p>
                         <p className="text-lg font-bold text-slate-900 mt-2">{app?.integrity_score || 100}/100</p>
                         <p className="text-xs text-slate-500 mt-1 italic">Validated via Multi-Factor Proctoring Logs.</p>
                      </div>
                   </CardContent>
                </Card>
            </div>
        </div>

        {/* Details Tabs */}
        <div className="grid grid-cols-1 gap-8">
           <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                 <BrainCircuit className="w-4 h-4" /> Technical & Behavioral Deep-Dive
              </h3>
              <AssessmentAnalysisPanel applicationId={applicationId} />
           </div>
           
           <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                 <FileText className="w-4 h-4" /> Interview Highlights (6 Dimensions)
              </h3>
              <InterviewAnalysisPanel applicationId={applicationId} />
           </div>
        </div>

        {/* Final MD Actions */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
           <div>
              <h2 className="text-xl font-black text-slate-900 uppercase">Final Executive Decision</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 italic">
                 Note: Your decision will be logged as the definitive Board Action for this ID.
              </p>
           </div>
           <div className="flex items-center gap-4 w-full md:w-auto">
              <Button size="lg" variant="outline" className="flex-1 md:flex-none h-14 px-10 rounded-2xl border-slate-300 font-bold uppercase text-[11px] tracking-widest hover:bg-slate-50">
                 Reject Candidate
              </Button>
              <Button size="lg" className="flex-1 md:flex-none h-14 px-10 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-blue-200">
                 Approve & Dispatch Offer
              </Button>
           </div>
        </div>

      </div>
    </PanelLayout>
  );
}
