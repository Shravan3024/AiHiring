"use client";
import React, { useState } from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, PieChart as PieIcon, LineChart as LineIcon, TrendingUp, 
  Search, Filter, ChevronRight, Download, Share2, Calendar,
  ArrowUpRight, ArrowDownRight, Activity, Users, Target,
  Zap, Clock, DollarSign, Briefcase, Building2, Globe,
  CheckCircle2, AlertCircle, Sparkles, FilterX, HelpCircle,
  MoreVertical, Eye, MapPin, Lightbulb, BarChart, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, BarChart as RechartsBarChart, Bar, Cell, PieChart, Pie, Legend,
  ComposedChart
} from "recharts";
import { cn } from "@/lib/utils";
import { aiApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function HighFidelityAnalyticsV2() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ai-analytics"],
    queryFn: () => aiApi.getAnalytics().then((res: any) => res.data.data),
  });

  if (isLoading || !data) {
    return (
      <PanelLayout title="Analytics" allowedRoles={["HR", "ADMIN"]}>
        <div className="p-8 space-y-8">
           <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-96" />
           </div>
           <div className="grid grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
           </div>
           <Skeleton className="h-[600px] w-full rounded-[2.5rem]" />
        </div>
      </PanelLayout>
    );
  }

  const { kpis, funnel, trendData, sources, departments, avgTimeToHire, acceptanceRate, totalApps } = data;

  const diversityData = [
    { label: "Women Hires", value: "34.9%", trend: "+4.6%", icon: Users, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Underrepresented", value: "22.6%", trend: "+3.2%", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Global Hires", value: "12.4%", trend: "+2.1%", icon: Globe, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Persons w/ Disabilities", value: "2.7%", trend: "+0.6%", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const timeToHireTrend = [
    { name: "Jan", days: 28 },
    { name: "Feb", days: 24 },
    { name: "Mar", days: 26 },
    { name: "Apr", days: 27 },
    { name: "May", days: 23 },
    { name: "Jun", days: 22 },
  ];

  const metricsTable = [
    { metric: "Application Conversion Rate", this: funnel[funnel.length-1].rate, prev: "1.2%", change: "+0.2%", trend: "up" },
    { metric: "Interview to Offer Rate", this: "22.8%", prev: "20.5%", change: "+2.3%", trend: "up" },
    { metric: "Offer Acceptance Rate", this: `${acceptanceRate}%`, prev: "75.1%", change: "+3.3%", trend: "up" },
    { metric: "Time to Hire (Avg.)", this: `${avgTimeToHire} days`, prev: "25.8 days", change: "-2.2 days", trend: "down" },
    { metric: "Cost per Hire", this: "$1,150", prev: "$1,372", change: "+9.0%", trend: "up" },
  ];

  const iconMap: Record<string, any> = {
     Users, CheckCircle2, Target, Clock, DollarSign
  };

  return (
    <PanelLayout title="Analytics" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">Analytics</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Track key metrics and performance insights across your hiring process</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" placeholder="Search candidates, roles, skills..." />
              </div>
              <Button onClick={() => refetch()} variant="outline" className="h-10 w-10 p-0 rounded-xl border-border/50">
                 <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2">
                 <Calendar className="w-4 h-4" /> Last 30 Days
              </Button>
              <Button 
                variant="outline" 
                className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2"
                onClick={async () => {
                  try {
                    const response = await aiApi.exportAnalytics({});
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `ai-analytics-${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  } catch (error) {
                    console.error("Export failed:", error);
                  }
                }}
              >
                 <Download className="w-4 h-4" /> Export
              </Button>
           </div>
        </div>

        {/* KPI GRID WITH SPARKINES */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
           {kpis.map((k: any, i: number) => {
              const Icon = iconMap[k.icon] || Users;
              return (
                 <Card key={i} className="border-border/40 glass shadow-xl overflow-hidden group relative">
                    <CardContent className="p-5 space-y-4">
                       <div className="flex items-center justify-between">
                          <div className={cn("p-2 rounded-xl bg-muted/50 border border-border/50", k.color)}>
                             <Icon className="w-4 h-4" />
                          </div>
                          <div className="h-8 w-20">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[10, 15, 8, 12, 18, 14, 20]}>
                                   <Line type="monotone" dataKey={(v) => v} stroke="currentColor" strokeWidth={2} dot={false} className={k.color} />
                                </LineChart>
                             </ResponsiveContainer>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{k.title}</p>
                          <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{k.value}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className={cn("text-[10px] font-black flex items-center gap-1", (k.trend.startsWith('+') && !k.inverse) || (k.trend.startsWith('-') && k.inverse) ? "text-emerald-500" : "text-rose-500")}>
                             {k.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {k.trend}
                          </div>
                          <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">vs prev period</span>
                       </div>
                    </CardContent>
                 </Card>
              );
           })}
        </div>

        {/* TABS */}
        <div className="flex bg-muted/10 p-1 rounded-2xl border border-border/40 overflow-x-auto no-scrollbar shadow-inner backdrop-blur-md">
           {["Overview", "Sourcing", "Pipeline", "Assessments", "Interviews", "Offers & Hires", "Diversity", "Time & Efficiency"].map((t, i) => (
              <Button key={i} variant="ghost" className={cn(
                 "h-10 text-[10px] font-black uppercase tracking-[0.2em] px-8 rounded-xl transition-all whitespace-nowrap",
                 i === 0 
                    ? "bg-card text-primary shadow-2xl shadow-primary/10 border border-border/50 scale-[1.02]" 
                    : "text-muted-foreground opacity-40 hover:opacity-100 hover:bg-white/5"
              )}>{t}</Button>
           ))}
        </div>

        {/* FUNNEL & TREND SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Hiring Funnel Overview */}
           <Card className="lg:col-span-7 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-8">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-2">
                 Hiring Funnel Overview <HelpCircle className="w-3 h-3 opacity-40 cursor-help" />
              </CardTitle>
              <div className="relative space-y-4">
                 {funnel.map((f: any, i: number) => (
                    <div key={i} className="grid grid-cols-12 items-center gap-4">
                       <div className="col-span-3 text-[10px] font-black text-muted-foreground uppercase">{f.label}</div>
                       <div className="col-span-5 flex justify-center">
                          <div className={cn("h-8 rounded-lg transition-all duration-1000", f.color, f.w)}></div>
                       </div>
                       <div className="col-span-1 text-[10px] font-black text-foreground text-center">{f.count}</div>
                       <div className="col-span-1 text-[10px] font-black text-muted-foreground text-center">{f.rate}</div>
                       <div className={cn("col-span-2 text-[9px] font-black text-right", f.vs.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>
                          {f.vs.startsWith('+') && <ArrowUpRight className="w-2.5 h-2.5 inline mr-1" />} {f.vs}
                       </div>
                    </div>
                 ))}
                 <div className="pt-6 border-t border-border/10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Overall conversion rate from Applicant to Hire: {funnel[funnel.length-1].rate}</p>
                 </div>
              </div>
           </Card>

           {/* Hiring Trends */}
           <Card className="lg:col-span-5 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Hiring Trends</CardTitle>
                 <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-7">
                    <option>Weekly</option>
                 </select>
              </div>
              <div className="h-[250px] w-full mb-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <YAxis tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                       <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase' }} />
                       <Line type="monotone" dataKey="apps" name="Applications" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                       <Line type="monotone" dataKey="interviews" name="Interviews" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                       <Line type="monotone" dataKey="offers" name="Offers" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                       <Line type="monotone" dataKey="hires" name="Hires" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-4">
                 {[
                    { label: totalApps, sub: "Applications", trend: "+15.2%", color: "text-emerald-500" },
                    { label: Math.round(totalApps * 0.1), sub: "Interviews", trend: "+10.1%", color: "text-emerald-500" },
                    { label: Math.round(totalApps * 0.05), sub: "Offers", trend: "+8.3%", color: "text-emerald-500" },
                    { label: Math.round(totalApps * 0.03), sub: "Hires", trend: "+6.5%", color: "text-emerald-500" },
                 ].map((s, i) => (
                    <div key={i} className="space-y-1">
                       <p className="text-[12px] font-black text-foreground">{s.label}</p>
                       <p className="text-[8px] font-bold text-muted-foreground uppercase">{s.sub}</p>
                       <div className={cn("text-[8px] font-black flex items-center gap-0.5", s.color)}>
                          <ArrowUpRight className="w-2 h-2" /> {s.trend}
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

        </div>

        {/* BOTTOM GRID: SOURCES, DEPT, DIVERSITY, TIME */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           
           {/* Top Sources by Hires */}
           <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Top Sources by Hires</CardTitle>
              <div className="relative h-32 w-full mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={sources} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                          {sources.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-foreground">{funnel[funnel.length-1].count}</span>
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Total Hires</span>
                 </div>
              </div>
              <div className="space-y-2">
                 {sources.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                          <span className="text-[9px] font-black text-muted-foreground uppercase">{s.name}</span>
                       </div>
                       <span className="text-[9px] font-black text-foreground tabular-nums">{s.value} ({s.percent})</span>
                    </div>
                 ))}
              </div>
              <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit mt-4 text-primary">View Full Report →</Button>
           </Card>

           {/* Hires by Department */}
           <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Hires by Department</CardTitle>
              <div className="relative h-32 w-full mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={departments} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                          {departments.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-foreground">{funnel[funnel.length-1].count}</span>
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                 </div>
              </div>
              <div className="space-y-2">
                 {departments.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                          <span className="text-[9px] font-black text-muted-foreground uppercase">{s.name}</span>
                       </div>
                       <span className="text-[9px] font-black text-foreground tabular-nums">{s.value} ({s.percent})</span>
                    </div>
                 ))}
              </div>
              <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit mt-4 text-primary">View Full Report →</Button>
           </Card>

           {/* Diversity Overview */}
           <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Diversity Overview</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                 {diversityData.map((d, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-muted/20 border border-border/50">
                       <div className={cn("p-1.5 rounded-lg w-fit mb-2", d.bg, d.color)}>
                          <d.icon className="w-3 h-3" />
                       </div>
                       <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">{d.label}</p>
                       <p className="text-[14px] font-black text-foreground">{d.value}</p>
                       <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase mt-1">
                          <ArrowUpRight className="w-2 h-2" /> {d.trend} <span className="text-muted-foreground/40 font-bold ml-1">vs prev. period</span>
                       </div>
                    </div>
                 ))}
              </div>
              <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit mt-6 text-primary">View Diversity Report →</Button>
           </Card>

           {/* Time to Hire Trend */}
           <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
              <div className="flex items-center justify-between mb-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Time to Hire Trend</CardTitle>
                 <select className="bg-transparent border border-border/40 rounded-lg text-[8px] font-black uppercase px-2 h-6">
                    <option>Monthly</option>
                 </select>
              </div>
              <div className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeToHireTrend}>
                       <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                       <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} label={{ position: 'top', fontSize: 10, fontWeight: 'black', fill: '#fff' }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit mt-4 text-primary">View Full Report →</Button>
           </Card>

        </div>

        {/* FOOTER SECTION: METRICS, INSIGHTS, BENCHMARK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
           
           {/* Key Metrics Summary */}
           <Card className="lg:col-span-5 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-border/10">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Key Metrics Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <table className="w-full text-left">
                    <thead className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest bg-muted/5">
                       <tr>
                          <th className="px-6 py-3">Metric</th>
                          <th className="px-6 py-3">This Period</th>
                          <th className="px-6 py-3">Prev Period</th>
                          <th className="px-6 py-3">Change</th>
                          <th className="px-6 py-3">Trend</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                       {metricsTable.map((m, i) => (
                          <tr key={i} className="hover:bg-muted/5 transition-colors group">
                             <td className="px-6 py-3 text-[9px] font-black text-muted-foreground uppercase">{m.metric}</td>
                             <td className="px-6 py-3 text-[10px] font-black text-foreground">{m.this}</td>
                             <td className="px-6 py-3 text-[10px] font-black text-muted-foreground/60">{m.prev}</td>
                             <td className={cn("px-6 py-3 text-[9px] font-black", m.change.startsWith('+') || m.change.startsWith('-') && m.trend === 'down' ? "text-emerald-500" : "text-rose-500")}>
                                {m.change}
                             </td>
                             <td className="px-6 py-3">
                                <div className="w-12 h-6">
                                   <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={[10, 15, 8, 12, 18, 14, 20]}>
                                         <Line type="monotone" dataKey={(v) => v} stroke={m.trend === 'up' ? "#10b981" : "#ef4444"} strokeWidth={2} dot={false} />
                                      </LineChart>
                                   </ResponsiveContainer>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </CardContent>
           </Card>

           {/* Insights & Highlights */}
           <Card className="lg:col-span-3 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Insights & Highlights</CardTitle>
              <div className="space-y-6">
                 {[
                    { text: `Your offer acceptance rate is at ${acceptanceRate}%, maintaining strong competitiveness.`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { text: "LinkedIn continues to be your top source for quality hires.", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { text: `Average time to hire is currently ${avgTimeToHire} days.`, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { text: "Consider improving conversion in the Assessment stage.", icon: Lightbulb, color: "text-purple-500", bg: "bg-purple-500/10" },
                 ].map((ins, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className={cn("shrink-0 p-1.5 h-fit rounded-lg border border-border/50", ins.bg, ins.color)}>
                          <ins.icon className="w-3.5 h-3.5" />
                       </div>
                       <p className="text-[9px] font-medium text-foreground leading-relaxed">{ins.text}</p>
                    </div>
                 ))}
              </div>
              <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit mt-8 text-primary">View All Insights →</Button>
           </Card>

           {/* Benchmark Comparison */}
           <Card className="lg:col-span-4 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
              <div className="flex items-center justify-between mb-8">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Benchmark Comparison</CardTitle>
                 <select className="bg-transparent border border-border/40 rounded-lg text-[8px] font-black uppercase px-2 h-6">
                    <option>Industry Benchmark</option>
                 </select>
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between text-[7px] font-black text-muted-foreground uppercase tracking-widest">
                    <span>Metric</span>
                    <div className="flex gap-4">
                       <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Our Company</span>
                       <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></div> Benchmark</span>
                    </div>
                 </div>
                 {[
                    { label: "Offer Acceptance Rate", val: `${acceptanceRate}%`, bench: "68.5%", progress: acceptanceRate, benchProgress: 68.5 },
                    { label: "Time to Hire (Days)", val: avgTimeToHire.toString(), bench: "28.7", progress: 65, benchProgress: 80, inverse: true },
                    { label: "Cost per Hire", val: "$1,150", bench: "$1,620", progress: 60, benchProgress: 85, inverse: true },
                    { label: "Quality of Hire Score", val: "85/100", bench: "72/100", progress: 85, benchProgress: 72 },
                 ].map((b, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[9px] font-black uppercase">
                          <span className="text-muted-foreground">{b.label}</span>
                          <div className="flex gap-4">
                             <span className="text-foreground">{b.val}</span>
                             <span className="text-muted-foreground/40">{b.bench}</span>
                          </div>
                       </div>
                       <div className="h-1.5 w-full bg-muted/30 rounded-full relative overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-muted-foreground/20 rounded-full transition-all duration-1000" style={{ width: `${b.benchProgress}%` }}></div>
                          <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000" style={{ width: `${b.progress}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
              <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit mt-8 text-primary">View Benchmark Report →</Button>
           </Card>

        </div>

      </div>
    </PanelLayout>
  );
}
