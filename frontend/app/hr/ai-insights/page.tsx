"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, Brain, Sparkles, TrendingUp, Target, 
  Search, Filter, ChevronRight, Zap, Lightbulb, 
  AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight,
  ShieldCheck, MessageSquare, Star, Activity, Clock, 
  UserPlus, BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  ZapOff, Ghost, Wand2, RefreshCw, Download, Layers, Users, Rocket, Loader2,
  Database, Cpu, Network, Globe, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, BarChart, Bar, Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { aiInsightsApi } from "@/lib/api";
import { toast } from "sonner";

export default function IndustryReadyAIInsights() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyzingSection, setAnalyzingSection] = useState<string | null>(null);
  const [predictiveView, setPredictiveView] = useState<"success" | "attrition">("success");
  const [lastSynced, setLastSynced] = useState<string>("");

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const res = await aiInsightsApi.getDashboardData();
      setData(res.data.data);
      setLastSynced(new Date().toLocaleTimeString());
      if (isRefresh) toast.success("Neural Link Synchronized with Database");
    } catch (err) {
      console.error(err);
      toast.error("Database Connection Failure: Check Neural Link Status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-sync every 5 minutes for "Real-time" feel
    const interval = setInterval(() => fetchData(true), 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleNeuralMap = async () => {
    try {
      setAnalyzingSection("Neural Map");
      const res = await aiInsightsApi.analyzeSection("Neural Map Synthesis", data);
      toast.success("Strategic Neural Map Synthesized!");
      
      const insight = res.data.data;
      const newData = {...data};
      if (newData.kpis && newData.kpis[3]) {
          newData.kpis[3].value = "Synced";
          newData.kpis[3].progress = 100;
      }
      setData(newData);
    } catch (err) {
      toast.error("Failed to synthesize Neural Map");
    } finally {
      setAnalyzingSection(null);
    }
  };

  const handleDeepAnalyze = async (section: string, currentData: any) => {
    try {
      setAnalyzingSection(section);
      const res = await aiInsightsApi.analyzeSection(section, currentData);
      toast.success(`${section} Logic Optimized`);
      
      const insight = res.data.data;
      const newData = {...data};
      if (section === "Talent Intelligence") {
          newData.marketInsights[0].desc = insight.content;
          newData.marketInsights[0].impact = insight.impact;
      } else if (section === "Recommendations") {
          newData.recommendations[0].sub = insight.content;
      } else if (section === "Strategic Observations") {
          toast.info(insight.content, { duration: 5000 });
      }
      setData(newData);
    } catch (err) {
      toast.error(`Neural Analysis Failed for ${section}`);
    } finally {
      setAnalyzingSection(null);
    }
  };

  const handleDownloadInsights = async () => {
    try {
      const res = await aiInsightsApi.downloadInsights();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Mask_Polymers_AI_Insights_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("PDF Synthesis Failed");
    }
  };

  const handleGenerateAIReport = async () => {
    try {
      setIsGenerating(true);
      const res = await aiInsightsApi.generateReport();
      toast.success("Strategic Executive Report Ready", {
        description: "AI has synthesized the full dataset into a strategic roadmap."
      });
    } catch (err) {
      toast.error("AI Report Generation Failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
       {[1,2,3,4,5].map(i => (
         <Card key={i} className="border-border/40">
            <CardContent className="p-6 space-y-4">
               <Skeleton className="h-8 w-8 rounded-xl" />
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-10 w-16" />
               <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
         </Card>
       ))}
    </div>
  );

  if (loading || !data) {
    return (
      <PanelLayout title="AI Insights" allowedRoles={["HR", "ADMIN"]}>
        <div className="max-w-[1600px] mx-auto p-8 space-y-8">
           <div className="flex items-center justify-between mb-12">
              <div className="space-y-2">
                 <Skeleton className="h-10 w-64" />
                 <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-4">
                 <Skeleton className="h-11 w-32 rounded-lg" />
                 <Skeleton className="h-11 w-48 rounded-lg" />
              </div>
           </div>
           <LoadingSkeleton />
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Skeleton className="lg:col-span-8 h-[400px] rounded-lg" />
              <Skeleton className="lg:col-span-4 h-[400px] rounded-lg" />
           </div>
        </div>
      </PanelLayout>
    );
  }

  const tabs = ["Overview", "Hiring Intelligence", "Talent Intelligence", "Predictive Analytics", "Recommendations", "Market Insights"];

  return (
    <PanelLayout title="AI Insights" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 animate-pulse">
                    <Cpu className="w-5 h-5 text-primary" />
                 </div>
                 <h1 className="text-3xl font-black text-foreground tracking-tighter flex items-center gap-2 uppercase italic">Neural Recruitment Hub<span className="text-primary not-italic">.</span></h1>
              </div>
              <div className="flex items-center gap-4">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                   <Network className="w-3.5 h-3.5 text-primary" /> Multi-Vector AI Engine Synchronized
                 </p>
                 <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest gap-1.5 px-2 py-0.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" /> Live Sync: {lastSynced}
                 </Badge>
              </div>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleDownloadInsights}
                className="h-11 rounded-lg border-border/50 bg-background/50 backdrop-blur-xl text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-muted/50 transition-all px-6"
              >
                 <Download className="w-4 h-4" /> Export Strategic Dossier
              </Button>
              <Button 
                onClick={handleGenerateAIReport}
                disabled={isGenerating}
                className="h-11 rounded-lg industrial-gradient text-white text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm shadow-primary/30 px-8 hover:scale-105 active:scale-95 transition-all"
              >
                 {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 {isGenerating ? "Synthesizing Dataset..." : "Generate AI Strategic Report"}
              </Button>
           </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-muted/10 p-1 rounded-lg border border-border/40 overflow-x-auto no-scrollbar shadow-inner backdrop-blur-xl sticky top-4 z-50 shadow-sm shadow-primary/5">
           {tabs.map((t, i) => (
              <Button 
                key={i} 
                variant="ghost" 
                onClick={() => setActiveTab(t)}
                className={cn(
                  "h-10 text-[10px] font-black uppercase tracking-[0.25em] px-10 rounded-xl transition-all whitespace-nowrap",
                  activeTab === t 
                     ? "bg-card text-primary shadow-sm shadow-primary/20 border border-border/50 scale-[1.02]" 
                     : "text-muted-foreground opacity-30 hover:opacity-100 hover:bg-white/5"
               )}>{t}</Button>
           ))}
        </div>

        {/* PRIMARY KPI METRICS */}
        {activeTab === "Overview" && (
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {data.kpis.map((k: any, i: number) => (
                 <Card key={i} className="border-border/40 shadow-sm overflow-hidden group hover:scale-[1.02] transition-all duration-500 border-b-4 border-b-transparent hover:border-b-primary">
                    <CardContent className="p-6 space-y-5">
                       <div className="flex items-center justify-between">
                          <div className={cn("p-2.5 rounded-lg bg-muted/50 border border-border/50", k.color)}>
                             <Layers className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-1.5">
                             <Database className="w-3 h-3 text-muted-foreground opacity-30" />
                             <Badge variant="outline" className="text-[7px] font-black uppercase border-border/50 tracking-widest px-2">Verified</Badge>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{k.title}</p>
                          <p className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{k.value}</p>
                       </div>
                       <div className="space-y-2.5">
                          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner">
                             <div className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)]", k.color.replace('text', 'bg'))} style={{ width: `${k.progress}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                             <span>{k.subLeft}</span>
                             <span>{k.subRight}</span>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              ))}
           </div>
        )}

        {/* NEURAL ANALYSIS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Hiring Intelligence: Quality Trends */}
           {(activeTab === "Overview" || activeTab === "Hiring Intelligence") && (
              <Card className="lg:col-span-8 border-border/40 shadow-sm rounded-lg overflow-hidden group hover:border-primary/30 transition-all duration-500">
                 <CardHeader className="border-b border-white/5 px-8 py-6 flex flex-row items-center justify-between bg-muted/10">
                    <div className="space-y-1">
                       <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                          <History className="w-4 h-4 text-primary" /> Neural Hiring Quality Trend
                       </CardTitle>
                    </div>
                    {analyzingSection === "Hiring Intelligence" ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <LineIcon className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />}
                 </CardHeader>
                 <CardContent className="p-8">
                    <div className="h-[300px] w-full">
                       <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
                          <AreaChart data={data.qualityTrend}>
                             <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                             <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                             <YAxis hide domain={[0, 100]} />
                             <Tooltip 
                               contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }}
                               itemStyle={{ fontWeight: 'black', color: 'hsl(var(--primary))' }}
                             />
                             <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" animationDuration={2000} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-6">
                        {[
                          { label: "Pool Depth", val: data.kpis[1].value, col: "text-emerald-500" },
                          { label: "Avg Quality", val: `${data.kpis[0].value}%`, col: "text-purple-500" },
                          { label: "Efficiency", val: data.kpis[2].value, col: "text-amber-500" }
                        ].map((stat, idx) => (
                           <div key={idx} className="p-5 rounded-lg bg-muted/20 border border-border/40 space-y-1">
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                              <p className={cn("text-xl font-black tracking-tighter", stat.col)}>{stat.val}</p>
                           </div>
                        ))}
                    </div>
                 </CardContent>
              </Card>
           )}

           {/* Talent Intelligence: Dynamic Observations */}
           {(activeTab === "Overview" || activeTab === "Talent Intelligence") && (
              <Card className="lg:col-span-4 border-border/40 shadow-sm rounded-lg overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                 <CardHeader className="border-b border-white/5 px-8 py-6 flex flex-row items-center justify-between bg-muted/10">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Talent Intelligence</CardTitle>
                    {analyzingSection === "Talent Intelligence" ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" /> : <Brain className="w-5 h-5 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />}
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-border/10">
                       {data.marketInsights.map((ins: any, i: number) => (
                          <div key={i} 
                            onClick={() => handleDeepAnalyze("Talent Intelligence", ins)}
                            className="p-8 hover:bg-emerald-500/5 transition-all cursor-pointer group space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className={cn("p-2.5 rounded-lg border border-border/50 bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform")}>
                                      <TrendingUp className="w-4 h-4" />
                                   </div>
                                   <h4 className="text-[11px] font-black text-foreground uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{ins.title}</h4>
                                </div>
                                <Badge variant="outline" className={cn("text-[8px] font-black uppercase border-none bg-emerald-500/10 text-emerald-500 px-3 py-1")}>{ins.impact}</Badge>
                             </div>
                             <p className="text-[10px] font-medium text-muted-foreground leading-relaxed pl-12 group-hover:text-foreground/80 transition-colors">{ins.desc}</p>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           )}

           {/* Predictive Analytics: Yield & Attrition */}
           {(activeTab === "Overview" || activeTab === "Predictive Analytics") && (
              <Card className="lg:col-span-6 border-border/40 shadow-sm rounded-lg overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                 <CardHeader className="border-b border-white/5 px-8 py-6 flex flex-row items-center justify-between bg-muted/10">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Neural Predictive Models</CardTitle>
                    {analyzingSection === "Predictive Analytics" ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Sparkles className="w-5 h-5 text-blue-500 opacity-50 group-hover:opacity-100 animate-pulse transition-all" />}
                 </CardHeader>
                 <CardContent className="p-8 space-y-8">
                    <div className="flex bg-muted/30 p-1.5 rounded-lg gap-1.5 border border-border/40 shadow-inner">
                       <Button 
                         variant="ghost" 
                         onClick={() => setPredictiveView("success")}
                         className={cn("flex-1 h-10 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all", predictiveView === "success" ? "bg-card text-blue-500 shadow-xl" : "text-muted-foreground opacity-50")}>
                          Success Probability
                       </Button>
                       <Button 
                         variant="ghost" 
                         onClick={() => setPredictiveView("attrition")}
                         className={cn("flex-1 h-10 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all", predictiveView === "attrition" ? "bg-card text-rose-500 shadow-xl" : "text-muted-foreground opacity-50")}>
                          Attrition Risk
                       </Button>
                    </div>
                    <div className="space-y-6">
                       {data.predictions.map((r: any, i: number) => (
                          <div key={i} 
                            onClick={() => handleDeepAnalyze("Predictive Analytics", r)}
                            className="flex items-center justify-between group/row cursor-pointer hover:bg-blue-500/5 p-3 rounded-lg transition-all border border-transparent hover:border-blue-500/20">
                             <div className="space-y-1">
                                <span className="text-[12px] font-black text-foreground uppercase tracking-tight group-hover/row:text-blue-500 transition-colors">{r.role}</span>
                                <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                   <p className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.2em]">Neural Match Confidence</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-6">
                                <span className="text-lg font-black text-foreground tabular-nums">{predictiveView === 'success' ? r.prob : `${100 - parseInt(r.prob)}%`}</span>
                                <Badge className={cn("text-[9px] font-black uppercase border-none w-28 justify-center py-2 rounded-lg", r.bg, r.color)}>{r.status}</Badge>
                             </div>
                          </div>
                       ))}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleNeuralMap}
                      disabled={analyzingSection === "Neural Map"}
                      className="w-full h-14 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all gap-3 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {analyzingSection === "Neural Map" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Network className="w-5 h-5 text-primary" />}
                        {analyzingSection === "Neural Map" ? "Mapping Neural Vectors..." : "Synthesize Full Neural Roadmap"} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </CardContent>
              </Card>
           )}

           {/* Market Skill Gap Analysis: Real-time Supply/Demand */}
           {(activeTab === "Overview" || activeTab === "Market Insights") && (
              <Card className="lg:col-span-6 border-border/40 shadow-sm rounded-lg overflow-hidden p-8 group">
                 <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                       <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-500" /> Market Skill Gap Index
                       </CardTitle>
                       <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">Aggregate Supply vs Demand Mapping</p>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 text-[9px] font-black border-none px-4 py-2 uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/10">Neural Map Active</Badge>
                 </div>
                 <div className="space-y-8">
                    <div className="grid grid-cols-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 border-b border-border/10 pb-4">
                       <span className="col-span-1">Talent Axis</span>
                       <span className="col-span-1 text-center">Internal Supply</span>
                       <span className="col-span-1 text-center">Market Demand</span>
                       <span className="col-span-1 text-right">Strategic Gap</span>
                    </div>
                    {data.skillGap.map((s: any, i: number) => (
                       <div key={i} className="grid grid-cols-4 items-center gap-6 group/skill hover:bg-white/5 p-3 rounded-lg transition-all">
                          <span className="text-[11px] font-black text-foreground uppercase tracking-tight group-hover/skill:text-blue-500 transition-colors">{s.skill}</span>
                          <div className="flex flex-col gap-2 items-center">
                             <div className="text-[10px] font-black text-blue-500 tabular-nums">{s.current || 0}%</div>
                             <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${s.current || 0}%` }}></div></div>
                          </div>
                          <div className="flex flex-col gap-2 items-center">
                             <div className="text-[10px] font-black text-emerald-500 tabular-nums">{s.demand || 0}%</div>
                             <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${s.demand || 0}%` }}></div></div>
                          </div>
                          <div className="text-right">
                             <Badge variant="outline" className={cn("text-[10px] font-black tabular-nums border-none px-3 py-1.5 rounded-lg", (parseInt(s.gap) || 0) < -30 ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500")}>
                                {s.gap || "0%"}
                             </Badge>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>
           )}

           {/* Strategic AI Recommendations */}
           {(activeTab === "Overview" || activeTab === "Recommendations") && (
              <Card className="lg:col-span-12 border-border/40 shadow-sm rounded-lg overflow-hidden group">
                 <CardHeader className="border-b border-white/5 px-8 py-6 flex flex-row items-center justify-between bg-muted/10">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Autonomous Strategic Action Plan</CardTitle>
                    {analyzingSection === "Recommendations" ? <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> : <Lightbulb className="w-5 h-5 text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />}
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-border/10">
                       {data.recommendations.map((rec: any, i: number) => (
                          <div key={i} 
                            onClick={() => handleDeepAnalyze("Recommendations", rec)}
                            className="p-10 hover:bg-amber-500/5 transition-all cursor-pointer group/rec space-y-5">
                             <div className="p-4 rounded-lg bg-muted/50 border border-border/50 w-fit group-hover/rec:bg-amber-500/10 group-hover/rec:border-amber-500/30 transition-all shadow-xl">
                                <Target className={cn("w-6 h-6", rec.color)} />
                             </div>
                             <div className="space-y-2">
                                <p className="text-[14px] font-black text-foreground uppercase tracking-tight leading-tight group-hover/rec:text-amber-500 transition-colors">{rec.text}</p>
                                <p className="text-[11px] font-medium text-muted-foreground leading-snug">{rec.sub}</p>
                             </div>
                             <div className="flex items-center gap-2 pt-2 opacity-0 group-hover/rec:opacity-100 transition-opacity">
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Execute AI Action</span>
                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                             </div>
                          </div>
                       ))}
                       <div 
                         onClick={() => handleDeepAnalyze("Full Suite", data)}
                         className="p-10 flex items-center justify-center bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all border-l border-border/10 group/btn">
                          <div className="text-center space-y-4">
                             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover/btn:rotate-180 transition-all duration-700 ring-8 ring-primary/5">
                                <RefreshCw className="w-8 h-8 text-primary" />
                             </div>
                             <div className="space-y-1">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary block">Synchronize AI Engine</span>
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block opacity-60">Full Neural Recalculation</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           )}

        </div>

        {/* TOP RECOMMENDED NEURAL MATCHES */}
        <div className="space-y-8 pb-20">
           <div className="flex items-center justify-between">
              <div className="space-y-2">
                 <h2 className="text-2xl font-black uppercase tracking-tight text-foreground italic flex items-center gap-3">
                    <Star className="w-7 h-7 text-amber-500 fill-amber-500" /> Top Recommended Neural Matches
                 </h2>
                 <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">Aggregated from Technical, Behavioral, and Cultural Alignment Vectors</p>
              </div>
              <Button 
                onClick={() => fetchData(true)}
                variant="outline"
                className="h-12 rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-muted transition-all px-8">
                 <RefreshCw className="w-4 h-4" /> Refresh Talent Pool
              </Button>
           </div>
           <div className="flex flex-wrap items-stretch justify-center gap-8">
              {data.topCandidates.map((c: any, i: number) => (
                 <Card key={i} className="w-full md:w-[calc(33.33%-2rem)] lg:w-[calc(20%-2rem)] min-w-[280px] border-border/40 shadow-sm rounded-[3rem] overflow-hidden group hover:scale-105 hover:border-primary/40 transition-all duration-500 cursor-pointer bg-gradient-to-b from-card to-background relative">
                    <div className="absolute top-6 right-6 z-10">
                       <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                    </div>
                    <CardContent className="p-8 pt-12 space-y-8 text-center flex flex-col items-center">
                       <div className="relative w-44 h-44 mb-4 flex items-center justify-center">
                          {/* Neural Gauge */}
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                             <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-muted/5" />
                             <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={502} strokeDashoffset={502 * (1 - parseFloat(c.score)/100)} className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-1000" strokeLinecap="round" />
                          </svg>
                          
                          {/* Avatar Core */}
                          <div className="relative w-32 h-32 rounded-full border-4 border-background bg-muted overflow-hidden shadow-sm z-10 ring-8 ring-primary/5">
                             <img 
                                src={c.img || "/images/default-avatar.png"} 
                                alt={c.name} 
                                className="w-full h-full object-cover" 
                                onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }}
                             />
                             {/* Score Overlay Badge */}
                             <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-md py-1.5 border-t border-white/10">
                                <span className="text-sm font-black text-white tracking-tighter tabular-nums">{c.score}</span>
                             </div>
                          </div>

                          {/* Neural Match Label Floating */}
                          <Badge variant="outline" className="absolute -top-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-xl border-border/50 text-[7px] font-black uppercase tracking-[0.3em] px-3 py-1 shadow-xl z-20 whitespace-nowrap">Neural Match</Badge>
                       </div>
                       
                       <div className="space-y-1.5">
                          <h4 className="text-[14px] font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">{c.name}</h4>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] line-clamp-1 opacity-60">{c.role}</p>
                       </div>

                       <div className="flex flex-wrap justify-center gap-2 pt-2 w-full">
                          <Badge className="bg-emerald-500/5 text-emerald-500 text-[8px] font-black border border-emerald-500/20 py-1.5 px-3 uppercase tracking-widest rounded-xl">Technical Elite</Badge>
                          <Badge className="bg-primary/5 text-primary text-[8px] font-black border border-primary/20 py-1.5 px-3 uppercase tracking-widest rounded-xl">High Potential</Badge>
                       </div>
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>

      </div>
    </PanelLayout>
  );
}
