"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { hrApi, adminApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, Search, Filter, Plus, ChevronRight, 
  Users, Clock, TrendingUp, AlertCircle, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, UserPlus, Zap, Target,
  Calendar, MoreVertical, LayoutGrid, List, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PIPELINE_STAGES = [
  { id: "SOURCED", label: "Sourced", statuses: ["APPLIED", "RESUME_SUBMITTED"], color: "bg-blue-500" },
  { id: "SCREENING", label: "Screening", statuses: ["RESUME_EVALUATED", "TECHNICAL_ROUND_PENDING"], color: "bg-purple-500" },
  { id: "ASSESSMENT", label: "Assessment", statuses: ["TECHNICAL_ROUND_IN_PROGRESS", "TECHNICAL_ROUND_COMPLETED"], color: "bg-amber-500" },
  { id: "INTERVIEW", label: "Interview", statuses: ["INTERVIEW_SCHEDULED", "INTERVIEW_IN_PROGRESS", "INTERVIEW_COMPLETED"], color: "bg-emerald-500" },
  { id: "OFFERED", label: "Offered", statuses: ["HR_REVIEW", "SELECTED", "OFFER_SENT"], color: "bg-cyan-500" },
  { id: "HIRED", label: "Hired", statuses: ["OFFER_ACCEPTED"], color: "bg-indigo-500" },
];

export default function PipelinePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");

  // --- QUERIES ---
  const { data: pipelineRaw, isLoading: isPipelineLoading } = useQuery({
    queryKey: ["hr-pipeline", search, selectedRole],
    queryFn: () => hrApi.getPipeline({ search, role: selectedRole }).then(r => r.data?.data || []),
  });

  const { data: jobsRaw } = useQuery({
    queryKey: ["hr-jobs"],
    queryFn: () => hrApi.getJobs().then(r => r.data?.data || []),
  });

  const { data: kpiData } = useQuery({
    queryKey: ["hr-kpi"],
    queryFn: () => hrApi.getKPICards().then(r => r.data?.data || {}),
  });

  // --- PROCESSED DATA ---
  const jobs = jobsRaw || [];
  const departments = Array.from(new Set(jobs.map((j: any) => j.department))).filter(Boolean);

  const candidates = useMemo(() => {
    if (!pipelineRaw) return [];
    if (selectedDept === "all") return pipelineRaw;
    
    // Filter by department (requires joining with job data if not in pipeline return)
    return pipelineRaw.filter((c: any) => {
      const job = jobs.find((j: any) => j.title === c.position);
      return !selectedDept || selectedDept === "all" || job?.department === selectedDept;
    });
  }, [pipelineRaw, selectedDept, jobs]);

  const groupedCandidates = useMemo(() => {
    const groups: Record<string, any[]> = {};
    PIPELINE_STAGES.forEach(s => groups[s.id] = []);
    
    candidates.forEach((c: any) => {
      const stage = PIPELINE_STAGES.find(s => s.statuses.includes(c.applicationStatus));
      if (stage) {
        groups[stage.id].push(c);
      } else {
        // Fallback for statuses not explicitly in mapping
        if (c.applicationStatus === "REJECTED") return;
        groups["SOURCED"].push(c);
      }
    });
    return groups;
  }, [candidates]);

  return (
    <PanelLayout title="Pipeline" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">Hiring Pipeline</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Track and manage candidates across all hiring stages</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                    className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" 
                    placeholder="Search candidates..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>
        </div>

        {/* TOP FILTERS */}
        <div className="flex flex-wrap gap-4 bg-muted/20 p-3 rounded-2xl border border-border/40">
           <select 
              className="bg-background border-border/40 rounded-xl h-9 px-3 text-[10px] font-black uppercase focus:ring-primary/20 min-w-[140px]"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
           >
              <option value="all">All Roles</option>
              {jobs.map((j: any) => (
                <option key={j.id} value={j.title}>{j.title}</option>
              ))}
           </select>
           <select 
              className="bg-background border-border/40 rounded-xl h-9 px-3 text-[10px] font-black uppercase focus:ring-primary/20 min-w-[140px]"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
           >
              <option value="all">All Departments</option>
              {departments.map((d: any) => (
                <option key={d} value={d}>{d}</option>
              ))}
           </select>
           <div className="flex-1" />
           <div className="flex bg-muted/30 p-1 rounded-xl gap-1">
              <Button variant="ghost" className="h-7 w-8 p-0 bg-card shadow-sm"><LayoutGrid className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" className="h-7 w-8 p-0 opacity-50"><List className="w-3.5 h-3.5" /></Button>
           </div>
        </div>

        {/* KANBAN BOARD */}
        <div className="overflow-x-auto pb-6 custom-scrollbar">
           <div className="flex gap-4 min-w-max">
              {PIPELINE_STAGES.map((stage) => (
                 <div key={stage.id} className="w-72 space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]", stage.color)}></span>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground">{stage.label}</h3>
                          <Badge variant="secondary" className="text-[10px] h-5 rounded-full px-2 font-black bg-muted/50 border-none tabular-nums">
                            {groupedCandidates[stage.id]?.length || 0}
                          </Badge>
                       </div>
                    </div>
                    
                    <div className="space-y-3 min-h-[500px] p-2 bg-muted/5 rounded-2xl border border-dashed border-border/20 transition-colors hover:border-border/40">
                       {groupedCandidates[stage.id]?.length > 0 ? groupedCandidates[stage.id].map((cand: any, i: number) => (
                          <Card 
                            key={cand.applicationId} 
                            onClick={() => router.push(`/hr/applications/${cand.applicationId}`)}
                            className="border-border/40 glass hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:border-primary/30 relative overflow-hidden"
                          >
                             <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                             <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-muted border border-border/50 overflow-hidden shadow-inner">
                                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cand.candidateName}`} alt={cand.candidateName} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                         <p className="text-[11px] font-black text-foreground uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{cand.candidateName}</p>
                                         <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[120px]">{cand.position}</p>
                                      </div>
                                   </div>
                                   <Button variant="ghost" size="icon" className="w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-3.5 h-3.5" /></Button>
                                </div>
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 h-4 border-primary/20 bg-primary/5 text-primary">
                                         Score: {Math.round(cand.aiScore)}
                                      </Badge>
                                      <Badge variant="outline" className={cn(
                                        "text-[8px] font-black uppercase px-1.5 h-4 border-none",
                                        cand.fitBand === 'high_fit' ? 'bg-emerald-500/10 text-emerald-500' : 
                                        cand.fitBand === 'avg_fit' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                                      )}>
                                        {cand.fitBand?.replace('_', ' ')}
                                      </Badge>
                                   </div>
                                   <div className="text-[8px] font-black text-muted-foreground/60 uppercase">
                                      {cand.daysInStage}D In Stage
                                   </div>
                                </div>
                             </CardContent>
                          </Card>
                       )) : (
                         <div className="h-32 flex flex-col items-center justify-center text-center p-4">
                            <Activity className="w-6 h-6 text-muted-foreground/20 mb-2 animate-pulse" />
                            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">No candidates in this stage</p>
                         </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* PIPELINE ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
           {[
              { label: "Total Candidates", value: kpiData?.totalCandidates || "0", trend: "+18.2%", icon: Users, color: "text-primary", bg: "bg-primary/10" },
              { label: "Conversion Rate", value: "22.3%", trend: "+4.5%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Avg. Time to Hire", value: `${kpiData?.avgTimeToHire || 0} Days`, trend: "-2 days", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", inverse: true },
              { label: "Drop-off Rate", value: "31.6%", trend: "+1.2%", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
           ].map((stat, i) => (
              <Card key={i} className="border-border/40 glass shadow-xl overflow-hidden p-6 relative group hover:border-primary/20 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <stat.icon className="w-12 h-12" />
                 </div>
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</span>
                    <div className={cn("p-1.5 rounded-lg border border-border/50", stat.bg, stat.color)}>
                       <stat.icon className="w-3.5 h-3.5" />
                    </div>
                 </div>
                 <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{stat.value}</p>
                 <div className={cn(
                    "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest mt-1",
                    (stat.trend.startsWith('+') && !stat.inverse) || (stat.trend.startsWith('-') && stat.inverse) ? "text-emerald-500" : "text-rose-500"
                 )}>
                    {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {stat.trend} <span className="text-muted-foreground/40 font-bold ml-1">vs last 30 days</span>
                 </div>
              </Card>
           ))}
        </div>

      </div>
    </PanelLayout>
  );
}
