"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi, hrApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, Clock, CheckCircle, XCircle, 
  TrendingUp, Users, ArrowUpRight, Search, 
  Filter, UserPlus, Briefcase, Fingerprint
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminApprovalsPage() {
  const { data: bottleneckData } = useQuery({
    queryKey: ["approval-bottleneck"],
    queryFn: () => adminApi.getApprovalBottleneck().then(r => r.data?.data || r.data || []),
  });

  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ["hr-pipeline-admin"],
    queryFn: () => hrApi.getPipeline().then(r => r.data?.data || r.data || []),
  });

  const pipeline: any[] = Array.isArray(pipelineData) ? pipelineData : [];
  const bottleneck: any[] = Array.isArray(bottleneckData) ? bottleneckData : [];

  // UPDATED: Broadened matching logic to include all relevant sub-stages
  const approvalStages = [
    "TECHNICAL_ROUND_COMPLETED", 
    "INTERVIEW_COMPLETED", 
    "HR_REVIEW", 
    "SELECTED", 
    "OFFERED",
    "PROCEED_TO_HR",
    "RECOMMENDED_BY_AI"
  ];
  
  const pendingApprovals = pipeline.filter(app => {
    const status = (app.status || app.applicationStatus || "").toUpperCase();
    return approvalStages.some(stage => status.includes(stage) || stage.includes(status));
  });

  const approved = pipeline.filter(a => 
    ["HIRED", "SELECTED", "OFFERED"].some(s => (a.status || "").toUpperCase().includes(s))
  ).length;

  const rejected = pipeline.filter(a => 
    ["REJECTED", "AUTO_REJECTED"].some(s => (a.status || "").toUpperCase().includes(s))
  ).length;

  const bottleneckStage = bottleneck.length > 0
    ? bottleneck.reduce((max: any, s: any) => (!max || s.count > max.count ? s : max), null)
    : null;

  return (
    <PanelLayout title="Approval Management" allowedRoles={["ADMIN"]}>
      <div className="space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Awaiting Review", val: pendingApprovals.length, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
            { label: "Approved Records", val: approved, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
            { label: "Reject Cycles", val: rejected, icon: XCircle, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
          ].map((stat, i) => (
            <div key={i} className={cn("p-6 rounded-[2rem] bg-white shadow-sm border backdrop-blur-md flex items-center justify-between group hover:bg-slate-100 transition-all", stat.border)}>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                <p className="text-4xl font-bold text-slate-900 tabular-nums tracking-tighter">{stat.val}</p>
              </div>
              <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottleneck Alert */}
        {bottleneckStage && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 flex items-center gap-4 animate-in fade-in duration-1000">
             <div className="p-3 bg-orange-500/20 rounded-xl">
                <TrendingUp className="w-5 h-5 text-orange-400" />
             </div>
             <div className="flex-1">
               <p className="text-sm font-medium text-slate-900/80">
                 Efficiency Alert: <span className="text-orange-400 font-bold">{bottleneckStage.count} candidates</span> are currently pending at <span className="uppercase tracking-widest text-[10px] bg-orange-500/20 px-2 py-0.5 rounded ml-1 font-black">{bottleneckStage.stage}</span> stage.
               </p>
             </div>
             <button className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-colors tracking-widest">Accelerate Workflow</button>
          </div>
        )}

        {/* Main Approval Table Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-3">
              <div className="bg-white shadow-sm border border-slate-200 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                 <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                       <ClipboardList className="w-5 h-5 text-blue-400" />
                       <h3 className="text-lg font-bold text-slate-900 tracking-tight">Candidates Awaiting Decision</h3>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="relative group">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                          <input 
                            placeholder="Filter queue..." 
                            className="bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-64 transition-all"
                          />
                       </div>
                       <button className="p-2 rounded-full bg-white shadow-sm hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all">
                          <Filter className="w-4 h-4" />
                       </button>
                    </div>
                 </div>

                 <div className="p-4 min-h-[400px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-64 flex-col gap-4">
                         <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                         <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Pipeline...</p>
                      </div>
                    ) : pendingApprovals.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                         <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-400" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-slate-900 font-bold opacity-40">Queue cleared</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">No candidates awaiting admin approval</p>
                         </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {pendingApprovals.map((app: any, idx) => (
                          <div 
                            key={app.applicationId || idx} 
                            className="group flex flex-wrap items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-200 rounded-2xl transition-all duration-300 relative overflow-hidden"
                          >
                            {/* Decorative line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-5 min-w-[280px]">
                               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-slate-200">
                                  <UserPlus className="w-5 h-5 text-slate-500" />
                               </div>
                               <div className="space-y-1">
                                  <p className="text-slate-900 font-bold text-sm group-hover:text-blue-400 transition-colors">
                                    {app.candidateName || `Candidate #${app.applicationId}`}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-500">
                                     <Briefcase className="w-3 h-3" />
                                     <span>{app.position || "Processing..."}</span>
                                  </div>
                               </div>
                            </div>

                            <div className="flex items-center gap-8">
                               <div className="flex flex-col items-end gap-1">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Fit Band</span>
                                  <Badge className={cn(
                                    "px-3 py-1 rounded-full uppercase text-[9px] font-black tracking-widest border border-slate-200",
                                    app.fitBand === "high_fit" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                    app.fitBand === "avg_fit" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                    "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                  )}>
                                     {app.fitBand?.replace("_", " ") || "Evaluating"}
                                  </Badge>
                               </div>

                               <div className="h-10 w-px bg-white shadow-sm" />

                               <div className="flex flex-col items-end gap-1">
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</span>
                                   <span className="text-xs text-slate-900 font-medium opacity-60">
                                      {app.applicationStatus?.replace(/_/g, " ") || "Pending Decision"}
                                   </span>
                               </div>

                               <button 
                                 className="ml-4 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-all shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95"
                                 onClick={() => window.location.href = `/hr/applications/${app.applicationId}`}
                               >
                                  <ArrowUpRight className="w-5 h-5" />
                               </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Distribution Sidebar Card */}
           <div className="space-y-6">
              <div className="bg-white shadow-sm border border-slate-200 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-xl">
                 <div className="space-y-2">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                    <h4 className="text-slate-900 font-bold tracking-tight">Active Funnel</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Real-time distribution of candidates across core hiring stages.</p>
                 </div>
                 
                 <div className="space-y-4 pt-4">
                    {bottleneck.length > 0 ? bottleneck.map((s, idx) => (
                      <div key={idx} className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">{s.stage?.replace(/_/g, " ")}</span>
                            <span className="text-slate-900">{s.count}</span>
                         </div>
                         <div className="h-[2px] bg-white shadow-sm rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                              style={{ width: `${Math.min(100, (s.count / Math.max(...bottleneck.map(x => x.count), 1)) * 100)}%` }}
                            />
                         </div>
                      </div>
                    )) : (
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest text-center py-10 italic">Awaiting Metrics...</p>
                    )}
                 </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-slate-900 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                    <Fingerprint className="w-24 h-24" />
                 </div>
                 <div className="relative z-10 space-y-4">
                    <h4 className="font-bold tracking-tight text-xl leading-tight">Admin System Governance</h4>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">Automated status updates are currently enforcing <span className="font-black border-b border-slate-200">Approval Flow v2.4</span>. Ensure all compliance flags are cleared before final selection.</p>
                    <button className="pt-2 text-[10px] font-black uppercase tracking-widest border-b border-white flex items-center gap-2 group-hover:gap-4 transition-all">Audit Policies</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </PanelLayout>
  );
}
