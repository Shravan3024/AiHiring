"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, User, Briefcase, ExternalLink, Activity, Plus, Minus, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function CandidateTable({ apps = [], refresh }: any) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDecision = async (id: number, decision: string) => {
    try {
      setIsLoading(true);
      await api.post("/md/decision", { application_id: id, decision });
      toast.success(`Application ${decision.toLowerCase()} successfully`);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update decision");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!apps || apps.length === 0) {
    return (
      <div className="text-center py-32 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-100 m-10">
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
           <Briefcase className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">PIPELINE_SYNCHRONIZED_NO_PENDING_ACTION</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100/60">
            <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Candidate</th>
            <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Position</th>
            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Score</th>
            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
            <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {apps.map((app: any) => {
            const aiData = app.AIAnalysis || app.AIDecision || {};
            const pros = Array.isArray(aiData.pros) ? aiData.pros : (aiData.pros ? aiData.pros.split(',') : []);
            const cons = Array.isArray(aiData.cons) ? aiData.cons : (aiData.cons ? aiData.cons.split(',') : []);
            const score = aiData.score || app.score || 0;
            
            const aiRec = (aiData.ai_decision || app.ai_recommendation || "PENDING").toUpperCase();
            const aiStyle =
               aiRec === "APPROVED" || aiRec === "RECOMMENDED"
                 ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                 : aiRec === "REJECTED"
                 ? "bg-rose-50 text-rose-600 border-rose-100"
                 : "bg-slate-50 text-slate-400 border-slate-100";

            const status = app.status?.toUpperCase() || "PENDING";
            const statusStyle =
              status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              status === "REJECTED" ? "bg-rose-50 text-rose-600 border-rose-100" :
              "bg-blue-50 text-blue-600 border-blue-100";

            return (
              <React.Fragment key={app.id}>
                <tr className="group hover:bg-slate-50/50 transition-all duration-500">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform relative overflow-hidden">
                        <User className="w-6 h-6" />
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0f172a] tracking-tight leading-none uppercase mb-2">
                          {app.candidate?.name || app.candidateName || app.Candidate?.name || "Anonymous Intelligence"}
                        </p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">NODE_ID: #{app.id} • VERIFIED</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-blue-50 rounded-lg">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-[#0f172a] uppercase tracking-tight leading-none mb-1.5">{app.Job?.title || "System Operation"}</p>
                          <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">{app.Job?.department || "Unassigned Unit"}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-3">
                       <div className="flex items-center gap-4">
                          <span className="text-lg font-black text-[#0f172a] tabular-nums tracking-tighter">{score}%</span>
                          <Badge className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest border shadow-none", aiStyle)}>
                             AI_OP_{aiRec}
                          </Badge>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Badge variant="outline" className={cn("px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full", statusStyle)}>
                      {status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        className="h-12 w-12 rounded-lg bg-white border border-slate-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-slate-200/50 active:scale-90"
                        onClick={() => handleDecision(app.id, "APPROVED")}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                      </Button>
                      <Button
                        className="h-12 w-12 rounded-lg bg-white border border-slate-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-slate-200/50 active:scale-90"
                        onClick={() => handleDecision(app.id, "REJECTED")}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-6 h-6" />}
                      </Button>
                      <Button
                        className="h-12 w-12 rounded-lg bg-slate-900 border border-slate-800 text-white hover:bg-black transition-all shadow-xl shadow-slate-200/50 active:scale-90"
                        onClick={() => (window.location.href = `/md/applications/${app.id}`)}
                      >
                        <ExternalLink className="w-6 h-6" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {/* Authority Insight Row */}
                <tr className="bg-slate-50/20">
                   <td colSpan={5} className="px-10 py-0">
                      <Accordion type="single" collapsible className="w-full">
                         <AccordionItem value="insights" className="border-0">
                            <AccordionTrigger className="hover:no-underline py-4">
                               <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-20">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                  Neural Evaluation Parameters
                               </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-10 pl-20">
                               <div className="grid grid-cols-2 gap-16">
                                  <div className="space-y-6">
                                     <div className="flex items-center gap-3">
                                        <Plus className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">Core Capacities (Pros)</span>
                                     </div>
                                     <div className="flex flex-wrap gap-3">
                                        {pros.length > 0 ? pros.map((p: string, idx: number) => (
                                           <Badge key={idx} className="bg-white border-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest py-2 px-4 shadow-sm rounded-xl">
                                              {p.trim()}
                                           </Badge>
                                        )) : <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic">Inconclusive data.</span>}
                                     </div>
                                  </div>
                                  <div className="space-y-6">
                                     <div className="flex items-center gap-3">
                                        <Minus className="w-4 h-4 text-rose-500" />
                                        <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">Protocol Risks (Cons)</span>
                                     </div>
                                     <div className="flex flex-wrap gap-3">
                                        {cons.length > 0 ? cons.map((c: string, idx: number) => (
                                           <Badge key={idx} className="bg-white border-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest py-2 px-4 shadow-sm rounded-xl">
                                              {c.trim()}
                                           </Badge>
                                        )) : <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic">No critical vulnerabilities detected.</span>}
                                     </div>
                                  </div>
                                </div>
                            </AccordionContent>
                         </AccordionItem>
                      </Accordion>
                   </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
