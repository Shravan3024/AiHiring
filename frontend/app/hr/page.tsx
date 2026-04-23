"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Clock, CheckCircle, TrendingUp, AlertTriangle, AlertCircle,
  ArrowUpRight, ArrowDownRight, Activity, Calendar, MessageCircle, ShieldCheck,
  Trophy, Star, Loader2, ExternalLink, Zap, Brain, BarChart3, PieChart as PieIcon,
  Search, Filter, Plus, ChevronRight, Target, LayoutDashboard, FileText, Briefcase,
  Layers, MousePointer2, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function KPICard({ title, value, trend, trendValue, icon: Icon, sparkData, color }: {
  title: string; value: string | number; trend: "up" | "down";
  trendValue: string; icon: any; sparkData: any[]; color: string;
}) {
  return (
    <Card className="border-border/40 glass shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-xl bg-muted/50 border border-border/50", color)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</span>
          <ArrowUpRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{value ?? "—"}</p>
            <div className={cn(
              "flex items-center gap-1 text-[9px] font-black mt-1 uppercase tracking-widest",
              trend === "up" ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendValue}
            </div>
          </div>
          <div className="h-10 w-24">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                   <Area type="monotone" dataKey="v" stroke={trend === "up" ? "#10b981" : "#ef4444"} fill={trend === "up" ? "#10b98110" : "#ef444410"} strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HRDashboard() {
  const router = useRouter();
  const [pipelineView, setPipelineView] = useState<"funnel" | "flow">("funnel");

  // --- QUERIES (REAL-TIME FETCHING) ---
  const { data: kpiData } = useQuery({
    queryKey: ["hr-kpi"],
    queryFn: () => hrApi.getKPICards().then(r => r.data?.data || {}),
  });

  const { data: funnelDataRaw } = useQuery({
    queryKey: ["hr-funnel"],
    queryFn: () => hrApi.getHiringFunnel().then(r => r.data?.data || []),
  });

  const { data: distributionRaw } = useQuery({
    queryKey: ["hr-distribution"],
    queryFn: () => hrApi.getStatusDistribution().then(r => r.data?.data || []),
  });

  const { data: pendingRaw } = useQuery({
    queryKey: ["hr-pending"],
    queryFn: () => hrApi.getPendingActions().then(r => r.data?.data || []),
  });

  const { data: topCandidatesRaw } = useQuery({
    queryKey: ["hr-top-candidates"],
    queryFn: () => hrApi.getTopCandidates().then(r => r.data?.data || []),
  });

  const { data: opsCore } = useQuery({
    queryKey: ["hr-ops-core"],
    queryFn: () => hrApi.getOperationalCore().then(r => r.data?.data || {}),
  });

  // --- MOCK / PROCESSED DATA ---
  const sparkData = [ { v: 40 }, { v: 45 }, { v: 42 }, { v: 50 }, { v: 48 }, { v: 55 }, { v: 60 } ];

  const funnelData = (funnelDataRaw && funnelDataRaw.length > 0) ? funnelDataRaw.map((f: { stage: string; count: number; dropoff: number }) => ({
    stage: f.stage.replace(/_/g, ' '),
    count: f.count,
    conversion: f.dropoff === 0 ? 100 : 100 - f.dropoff
  })) : [
    { stage: 'APPLIED', count: 0, conversion: 0 },
    { stage: 'RESUME CLEARED', count: 0, conversion: 0 },
    { stage: 'TECHNICAL ROUND', count: 0, conversion: 0 },
    { stage: 'INTERVIEW', count: 0, conversion: 0 },
    { stage: 'HR REVIEW', count: 0, conversion: 0 },
    { stage: 'SELECTED', count: 0, conversion: 0 },
  ];

  const distributionData = (distributionRaw && distributionRaw.length > 0) ? distributionRaw.map((d: { label: string; value: number }, i: number) => ({
    name: d.label,
    value: d.value,
    color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'][i % 5]
  })) : [
    { name: 'Loading...', value: 100, color: '#333' }
  ];

  const topCandidate = topCandidatesRaw?.[0] || {
    name: "Sarthak Giri",
    job: "Executive - Marketing",
    score: 92,
    integrityScore: 94,
    status: "SELECTED",
    applicationId: "top-mock"
  };

  return (
    <PanelLayout title="Dashboard" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">Dashboard</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Real-time overview of your hiring pipeline and insights</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" placeholder="Search candidates, roles, skills..." />
              </div>
              <Button variant="outline" className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2">
                 <Calendar className="w-4 h-4" /> May 10 - Jun 10, 2025
              </Button>
              <Button variant="outline" className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2">
                 <Filter className="w-4 h-4" /> Filters
              </Button>
              {/* REMOVED ADD CANDIDATE BUTTON AS REQUESTED */}
           </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
           <KPICard title="Total Candidates" value={kpiData?.totalCandidates || "0"} trend="up" trendValue="18.6%" icon={Users} sparkData={sparkData} color="text-primary" />
           <KPICard title="In Pipeline" value={kpiData?.pendingReview || "0"} trend="up" trendValue="8.3%" icon={TrendingUp} sparkData={sparkData} color="text-amber-500" />
           <KPICard title="Interviews" value={kpiData?.pendingReview || "0"} trend="up" trendValue="21.7%" icon={MessageCircle} sparkData={sparkData} color="text-purple-500" />
           <KPICard title="Offers" value={kpiData?.selected || "0"} trend="up" trendValue="14.2%" icon={CheckCircle} sparkData={sparkData} color="text-emerald-500" />
           <KPICard title="Hires" value={kpiData?.selected || "0"} trend="up" trendValue="12.5%" icon={Trophy} sparkData={sparkData} color="text-primary" />
           <KPICard title="Avg. Time to Hire" value={`${kpiData?.avgTimeToHire || 0} days`} trend="down" trendValue="5.6%" icon={Clock} sparkData={sparkData} color="text-rose-500" />
        </div>

        {/* ROW 2: Pipeline & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Pipeline Overview */}
           <Card className="lg:col-span-6 border-border/40 glass-dark shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 px-8 py-5 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                   <Target className="w-4 h-4 text-primary" /> Pipeline Overview
                 </CardTitle>
                 <div className="flex bg-muted/30 p-1 rounded-lg gap-1">
                    <Button 
                       variant="ghost" 
                       onClick={() => setPipelineView("funnel")}
                       className={cn("h-7 text-[9px] font-black uppercase tracking-widest transition-all", pipelineView === "funnel" ? "bg-card shadow-sm text-primary" : "opacity-50")}
                    >Funnel</Button>
                    <Button 
                       variant="ghost" 
                       onClick={() => setPipelineView("flow")}
                       className={cn("h-7 text-[9px] font-black uppercase tracking-widest transition-all", pipelineView === "flow" ? "bg-card shadow-sm text-primary" : "opacity-50")}
                    >Flow</Button>
                 </div>
              </CardHeader>
              <CardContent className="p-8">
                 {pipelineView === "funnel" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                       <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={funnelData} layout="vertical" margin={{ left: -30 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="stage" type="category" hide />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 12, 12, 0]} barSize={30}>
                                   {funnelData.map((entry: { stage: string; count: number; conversion: number }, index: number) => (
                                      <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.12)} />
                                   ))}
                                </Bar>
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="space-y-4">
                          <table className="w-full text-left">
                             <thead className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">
                                <tr>
                                   <th className="pb-3">Stage</th>
                                   <th className="pb-3">Candidates</th>
                                   <th className="pb-3 text-right">Conversion</th>
                                </tr>
                             </thead>
                             <tbody className="text-[10px] font-black uppercase">
                                {funnelData.map((row: { stage: string; count: number; conversion: number }, i: number) => (
                                   <tr key={i} className="border-t border-border/10">
                                      <td className="py-2.5 flex items-center gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsla(var(--primary), ${1 - i * 0.15})` }}></div>
                                         {row.stage}
                                      </td>
                                      <td className="py-2.5 text-muted-foreground">{row.count}</td>
                                      <td className="py-2.5 text-right text-primary">{row.conversion}%</td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-50"></div>
                       <div className="flex items-center gap-4 md:gap-8 z-10">
                          {funnelData.slice(0, 4).map((f: { stage: string; count: number }, i: number) => {
                             const Icons = [Search, Briefcase, MessageCircle, Star];
                             const Icon = Icons[i % Icons.length];
                             return (
                                <React.Fragment key={i}>
                                   <div className="flex flex-col items-center gap-4 group/node">
                                      <div className="relative">
                                         <div className="absolute -inset-2 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover/node:opacity-100 transition-opacity duration-500"></div>
                                         <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] glass-dark border border-white/10 flex flex-col items-center justify-center shadow-2xl relative z-10 group-hover/node:border-primary/50 transition-colors">
                                            <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary mb-1 group-hover/node:scale-110 transition-transform" />
                                            <span className="text-sm md:text-lg font-black text-foreground tabular-nums">{f.count}</span>
                                         </div>
                                      </div>
                                      <span className="text-[8px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center max-w-[80px] leading-tight">{f.stage}</span>
                                   </div>
                                   {i < 3 && (
                                      <div className="w-8 md:w-16 h-[2px] bg-gradient-to-r from-primary/40 via-primary/80 to-primary/40 relative">
                                         <div className="absolute inset-0 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] animate-pulse"></div>
                                      </div>
                                   )}
                                </React.Fragment>
                             );
                          })}
                       </div>
                       <div className="absolute bottom-4 flex items-center gap-2">
                          <Activity className="w-3 h-3 text-primary animate-pulse" />
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Live Pipeline Flow Synchronized</p>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           {/* AI Insights & Top Candidate */}
           <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* AI Insights */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-8 py-5 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Brain className="w-4 h-4 text-amber-500" /> AI Insights
                    </CardTitle>
                    <Button variant="link" onClick={() => router.push('/hr/ai-insights')} className="text-[9px] font-black uppercase p-0 h-fit">View All</Button>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    {[
                       { title: 'Top Performer', desc: `${topCandidate.name} is in top 5% of all candidates`, score: `${topCandidate.score}/100`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                       { title: 'Risk Alert', desc: `${kpiData?.rejected || 0} candidates flagged for potential risks`, score: 'High', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                       { title: 'Bottleneck', desc: 'Assessment stage is dropping significant candidates', score: 'High', icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                       { title: 'Hiring Forecast', desc: 'You will reach hiring goal by Jun 28, 2025', score: 'On Track', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/50">
                          <div className="flex items-center gap-3">
                             <div className={cn("p-2 rounded-xl", item.bg)}>
                                <item.icon className={cn("w-4 h-4", item.color)} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-foreground">{item.title}</p>
                                <p className="text-[9px] font-medium text-muted-foreground truncate max-w-[150px]">{item.desc}</p>
                             </div>
                          </div>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", item.color)}>{item.score}</span>
                       </div>
                    ))}
                 </CardContent>
              </Card>

              {/* Top Candidate Spotlight */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden border-t-2 border-t-emerald-500/30">
                 <CardHeader className="border-b border-white/5 px-8 py-5 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-emerald-500" /> Top Candidate
                    </CardTitle>
                    <Button variant="link" onClick={() => router.push('/hr/candidates')} className="text-[9px] font-black uppercase p-0 h-fit">View All</Button>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-14 h-14 rounded-2xl bg-muted border border-border/50 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topCandidate.name}`} alt="Top" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{topCandidate.name}</h4>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{topCandidate.job}</p>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black mt-1">Strong Hire</Badge>
                       </div>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                       <div>
                          <p className="text-[18px] font-black text-foreground">{topCandidate.score}<span className="text-xs text-muted-foreground/50 uppercase ml-1">/100</span></p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Overall Score</p>
                       </div>
                       <div className="flex gap-2">
                          {['Communication', 'Logic', 'Fit'].map((k) => (
                             <Badge key={k} variant="outline" className="text-[8px] font-black uppercase border-border/50">{k}</Badge>
                          ))}
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6 border-t border-border/10 pt-4">
                       <div className="text-center">
                          <p className="text-xs font-black text-foreground">3.2 Yrs</p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase">Exp</p>
                       </div>
                       <div className="text-center border-x border-border/10">
                          <p className="text-xs font-black text-foreground">{topCandidate.integrityScore}%</p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase">Fit</p>
                       </div>
                       <div className="text-center">
                          <p className="text-xs font-black text-emerald-500">Low</p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase">Risk</p>
                       </div>
                    </div>
                    <Button className="w-full h-10 industrial-gradient text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl group" onClick={() => router.push(`/hr/applications/${topCandidate.applicationId}`)}>
                       View Full Profile <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </CardContent>
              </Card>

           </div>
        </div>

        {/* ROW 3: Evaluation Summary & Pending */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
           
           {/* Evaluation Summary */}
           <Card className="lg:col-span-9 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 px-8 py-5">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                   <Activity className="w-4 h-4 text-primary" /> Evaluation Summary
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    
                    {/* Score Distribution */}
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Distribution</h4>
                       <div className="relative h-48 w-full flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={distributionData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                   {distributionData.map((entry: { name: string; value: number; color: string }, index: number) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                                </Pie>
                                <Tooltip />
                             </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-xl font-black text-foreground tracking-tighter">{kpiData?.totalCandidates || 0}</span>
                             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          {distributionData.map((d: { name: string; value: number; color: string }, i: number) => (
                             <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">{d.name}</span>
                                </div>
                                <span className="text-[9px] font-black text-foreground">{d.value}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Job Role Performance */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Efficiency</h4>
                          <Button variant="link" onClick={() => router.push('/hr/analytics')} className="text-[8px] font-black uppercase p-0 h-fit">View All</Button>
                       </div>
                       <div className="space-y-6">
                          {[
                             { role: 'SLA Efficiency', score: opsCore?.slaEfficiency || 0 },
                             { role: 'Internal Discussions', score: Math.min(100, (opsCore?.internalDiscussions || 0) * 5) },
                             { role: 'Interview Turnaround', score: 72 },
                             { role: 'Offer Accuracy', score: 98 },
                          ].map((item, i) => (
                             <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                                   <span className="text-muted-foreground">{item.role}</span>
                                   <span className="text-foreground">{item.score}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                   <div className="h-full bg-primary" style={{ width: `${item.score}%` }} />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Hiring Trend */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hiring Trend</h4>
                          <Button variant="link" onClick={() => router.push('/hr/analytics')} className="text-[8px] font-black uppercase p-0 h-fit">View Report</Button>
                       </div>
                       <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={sparkData.map((d, i) => ({ ...d, x: i }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="x" hide />
                                <YAxis hide />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                             </LineChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="flex justify-center gap-6">
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-0.5 bg-primary"></div>
                             <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Hired</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-0.5 bg-muted-foreground/30"></div>
                             <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Offers</span>
                          </div>
                       </div>
                    </div>

                 </div>
              </CardContent>
           </Card>

           {/* Pending Actions */}
           <Card className="lg:col-span-3 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden h-fit">
              <CardHeader className="border-b border-white/5 px-8 py-5 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                   <Clock className="w-4 h-4 text-rose-500" /> Pending Actions
                 </CardTitle>
                 <Button variant="link" onClick={() => router.push('/hr/pipeline')} className="text-[9px] font-black uppercase p-0 h-fit">View All</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-border/10">
                    {pendingRaw && pendingRaw.length > 0 ? pendingRaw.slice(0, 4).map((item: { _id: string; candidateName: string; action: string; urgency: string }, i: number) => (
                       <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors cursor-pointer group" onClick={() => router.push(`/hr/applications/${item._id}`)}>
                          <div className="flex items-center gap-4">
                             <div className={cn("p-2 rounded-xl border border-border/50 bg-primary/10")}>
                                <FileText className={cn("w-4 h-4 text-primary")} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-foreground uppercase tracking-tight">{item.candidateName}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{item.action}</p>
                                <Badge className={cn("text-[7px] font-black border-none", item.urgency === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500')}>{item.urgency}</Badge>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                       </div>
                    )) : (
                       <div className="p-8 text-center text-[10px] font-black text-muted-foreground uppercase opacity-40">No pending actions</div>
                    )}
                 </div>
              </CardContent>
           </Card>

        </div>

      </div>
    </PanelLayout>
  );
}
