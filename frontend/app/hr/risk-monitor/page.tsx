"use client";
import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, ShieldCheck, Shield, AlertTriangle, 
  Search, ChevronRight, Download,
  MoreVertical, Eye,
  ArrowUpRight, ArrowDownRight,
  Fingerprint, Gavel, UserX, UserPlus,
  RefreshCw, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { hrApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";

// ── Dynamic recharts imports ─────────────────────────────────────────────────
// Splitting recharts out of the initial bundle cuts ~15s off first compile
const ResponsiveContainer = dynamic(
  () => import("recharts").then(m => m.ResponsiveContainer), { ssr: false }
);
const LineChart = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false });
const Line     = dynamic(() => import("recharts").then(m => m.Line),      { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart),  { ssr: false });
const Bar      = dynamic(() => import("recharts").then(m => m.Bar),       { ssr: false });
const Cell     = dynamic(() => import("recharts").then(m => m.Cell),      { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart),  { ssr: false });
const Pie      = dynamic(() => import("recharts").then(m => m.Pie),       { ssr: false });
const XAxis    = dynamic(() => import("recharts").then(m => m.XAxis),     { ssr: false });
const YAxis    = dynamic(() => import("recharts").then(m => m.YAxis),     { ssr: false });
const Tooltip  = dynamic(() => import("recharts").then(m => m.Tooltip),   { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Legend   = dynamic(() => import("recharts").then(m => m.Legend),    { ssr: false });

export default function HighFidelityRiskMonitorV3() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [riskType, setRiskType] = useState("All");
  const [stage, setStage] = useState("All");
  const [page, setPage] = useState(1);

  const { data: monitorData, isLoading, refetch } = useQuery({
    queryKey: ["risk-monitor", search, riskType, stage, page],
    queryFn: () => hrApi.getRiskMonitor({ search, riskType, stage, page, limit: 10 }).then(res => res.data.data),
  });

  const debouncedSearch = useCallback(
    debounce((val: string) => {
      setSearch(val);
      setPage(1);
    }, 500),
    []
  );

  if (isLoading || !monitorData) {
    return (
      <PanelLayout title="Risk Monitor" allowedRoles={["HR", "ADMIN"]}>
        <div className="p-8 space-y-8">
           <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-96" />
           </div>
           <div className="grid grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}
           </div>
           <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </PanelLayout>
    );
  }

  const { kpis, riskList, riskDistribution, topRiskFactors, recentAlerts, filteredTotal } = monitorData;

  // Mocked trend data for visual fidelity as requested
  const riskTrend = [
    { name: "May 12", high: 65, medium: 42, low: 22 },
    { name: "May 19", high: 68, medium: 45, low: 25 },
    { name: "May 26", high: 72, medium: 40, low: 20 },
    { name: "Jun 2", high: 66, medium: 48, low: 28 },
    { name: "Jun 9", high: 70, medium: 44, low: 24 },
  ];

  const riskByStage = [
    { name: "Sourcing", low: 25, medium: 15, high: 5 },
    { name: "Assessment", low: 15, medium: 35, high: 15 },
    { name: "Interview", low: 10, medium: 40, high: 22 },
    { name: "Background", low: 5, medium: 25, high: 50 },
    { name: "Offer", low: 12, medium: 30, high: 8 },
    { name: "Hired", low: 20, medium: 5, high: 0 },
  ];

  return (
    <PanelLayout title="Risk Monitor" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase italic">Risk Monitor<span className="text-primary not-italic">.</span></h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Identify, assess and mitigate risks across your hiring pipeline</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                   onChange={(e) => debouncedSearch(e.target.value)}
                   className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" placeholder="Search candidates, roles, checks..." />
              </div>
              <Button onClick={() => refetch()} variant="outline" className="h-10 w-10 p-0 rounded-xl border-border/50 transition-all hover:bg-primary hover:text-white">
                 <RefreshCw className="w-4 h-4" />
              </Button>
           </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
           {[
              { title: "Overall Risk Score", value: `${kpis.overallRisk} / 100`, sub: kpis.overallRisk > 70 ? "High Risk" : "Moderate Risk", icon: Shield, color: "text-amber-500", trend: "+6 pts" },
              { title: "High Risk Candidates", value: kpis.highRisk, sub: "Action Required", icon: UserX, color: "text-rose-500", trend: "+12%" },
              { title: "Background Check Alerts", value: kpis.backgroundAlerts, sub: "Pending Review", icon: Fingerprint, color: "text-orange-500", trend: "+8%" },
              { title: "Compliance Issues", value: kpis.complianceIssues, sub: "Unresolved", icon: Gavel, color: "text-purple-500", trend: "-7%" },
              { title: "Actions Required", value: Math.round(kpis.highRisk * 1.5), sub: "Due for review", icon: AlertTriangle, color: "text-blue-500", trend: "0%" },
           ].map((k, i) => (
              <Card key={i} className="border-border/40 shadow-xl overflow-hidden group hover:border-primary/20 transition-all">
                 <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                       <div className={cn("p-2 rounded-xl bg-muted/50 border border-border/50", k.color)}>
                          <k.icon className="w-4 h-4" />
                       </div>
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right max-w-[120px]">{k.title}</span>
                    </div>
                    <div className="space-y-1">
                       <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{k.value}</p>
                       <div className="flex items-center justify-between">
                          <p className={cn("text-[9px] font-bold uppercase tracking-widest", k.color)}>{k.sub}</p>
                          <div className={cn("text-[8px] font-black flex items-center gap-1", k.trend.startsWith('+') ? "text-rose-500" : "text-emerald-500")}>
                             {k.trend.startsWith('+') ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />} {k.trend}
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           ))}
        </div>

        {/* MAIN SECTION: TABLE & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Risk Overview Table */}
           <div className="lg:col-span-9 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex bg-muted/20 p-1 rounded-xl gap-1 border border-border/40 overflow-x-auto no-scrollbar">
                    {["All Risks", "High Risk", "Background Check", "Compliance", "Assessment", "Behavioral", "Fraud"].map((t, i) => (
                       <Button key={i} 
                         onClick={() => setRiskType(t.split(' ')[0])}
                         variant="ghost" className={cn(
                          "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg flex-shrink-0 transition-all",
                          (t.includes(riskType) || (riskType === "All" && t === "All Risks")) ? "bg-card text-primary shadow-sm" : "text-muted-foreground opacity-60 hover:opacity-100"
                       )}>{t}</Button>
                    ))}
                 </div>
                 <div className="flex items-center gap-3">
                    <select 
                      onChange={(e) => setStage(e.target.value)}
                      className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-8">
                       <option value="All">All Stages</option>
                       <option value="Sourcing">Sourcing</option>
                       <option value="Assessment">Assessment</option>
                       <option value="Interview">Interview</option>
                       <option value="Background">Background</option>
                       <option value="Offer">Offer</option>
                    </select>
                    <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase gap-2"><Download className="w-3 h-3" /> Export</Button>
                 </div>
              </div>

              <Card className="border-border/40 shadow-sm rounded-lg overflow-hidden">
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest bg-muted/10">
                             <tr>
                                <th className="px-6 py-4">Candidate</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Stage</th>
                                <th className="px-6 py-4">Risk Type</th>
                                <th className="px-6 py-4">Risk Score</th>
                                <th className="px-6 py-4">Risk Level</th>
                                <th className="px-6 py-4">Last Update</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10">
                             {riskList.map((r: any, i: number) => (
                                <tr key={i} className="hover:bg-muted/5 transition-colors group">
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                         <div className="w-9 h-9 rounded-xl bg-muted border border-border/50 overflow-hidden">
                                             <img 
                                                src={r.profileImage || "/images/default-avatar.png"} 
                                                alt="" 
                                                className="w-full h-full object-cover" 
                                                onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }}
                                             />
                                         </div>
                                         <div>
                                            <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{r.name}</p>
                                            <p className="text-[8px] font-bold text-muted-foreground truncate max-w-[150px]">{r.email}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase">{r.role}</td>
                                   <td className="px-6 py-4">
                                      <Badge variant="outline" className="text-[7px] font-black uppercase border-border/40 text-muted-foreground h-4">{r.stage}</Badge>
                                   </td>
                                   <td className="px-6 py-4">
                                      <Badge variant="outline" className="text-[7px] font-black uppercase border-rose-500/20 text-rose-500 bg-rose-500/5 h-4">{r.riskType}</Badge>
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="space-y-1.5 w-24">
                                         <div className="flex justify-between text-[9px] font-black uppercase">
                                            <span>{r.riskScore}</span>
                                            <span className="text-muted-foreground opacity-50">/ 100</span>
                                         </div>
                                         <div className="h-1 w-full bg-muted rounded-full">
                                            <div className={cn("h-full rounded-full", r.riskScore > 70 ? "bg-rose-500" : r.riskScore > 40 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${r.riskScore}%` }}></div>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4">
                                      <Badge className={cn(
                                         "text-[8px] font-black uppercase border-none w-16 justify-center",
                                         r.riskLevel === "High" ? "bg-rose-500/10 text-rose-500" : r.riskLevel === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                      )}>{r.riskLevel}</Badge>
                                   </td>
                                   <td className="px-6 py-4 text-[9px] font-bold text-muted-foreground uppercase">{new Date(r.lastUpdate).toLocaleDateString()}</td>
                                   <td className="px-6 py-4">
                                      <Badge variant="outline" className="text-[8px] font-black uppercase border-border/40 h-5">{r.status}</Badge>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-1">
                                         <Button 
                                           onClick={() => router.push(`/hr/candidates/${r.id}`)}
                                           variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"><Eye className="w-3.5 h-3.5" /></Button>
                                         <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><MoreVertical className="w-3.5 h-3.5" /></Button>
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between border-t border-border/10">
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Showing {riskList.length} of {filteredTotal} candidates</span>
                       <div className="flex gap-1">
                          <Button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            variant="outline" className="h-7 px-3 text-[10px] font-black rounded-lg border-border/40">Prev</Button>
                          <Button 
                            disabled={riskList.length < 10}
                            onClick={() => setPage(p => p + 1)}
                            variant="outline" className="h-7 px-3 text-[10px] font-black rounded-lg border-border/40">Next</Button>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Sidebar: Distribution, Factors, Alerts */}
           <div className="lg:col-span-3 space-y-6 pb-12">
              
              {/* Risk Distribution */}
              <Card className="border-border/40 shadow-sm rounded-lg overflow-hidden p-6">
                 <div className="flex items-center justify-between mb-8">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Risk Distribution</CardTitle>
                    <Badge variant="outline" className="bg-muted/30 text-[8px] font-black border-none uppercase">Live</Badge>
                 </div>
                 <div className="relative h-40 w-full mb-8">
                    <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
                       <PieChart>
                          <Pie data={riskDistribution} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                             {riskDistribution.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-xl font-black text-foreground">{riskList.length}</span>
                       <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">In View</span>
                    </div>
                 </div>
                 <div className="space-y-3">
                    {riskDistribution.map((d: any, i: number) => (
                       <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                             <span className="text-[9px] font-black text-muted-foreground uppercase">{d.name}</span>
                          </div>
                          <span className="text-[9px] font-black text-foreground tabular-nums">{d.value} ({d.percent})</span>
                       </div>
                    ))}
                 </div>
                 <div className="mt-6 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-[9px] font-black text-rose-500 uppercase flex items-center gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Stability Tracking Active
                 </div>
              </Card>

              {/* Top Risk Factors */}
              <Card className="border-border/40 shadow-sm rounded-lg overflow-hidden p-6">
                 <div className="flex items-center justify-between mb-6">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Top Risk Factors</CardTitle>
                 </div>
                 <div className="space-y-5">
                    {topRiskFactors.map((f: any, i: number) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase">
                             <span className="text-foreground">{f.label}</span>
                             <span className="text-muted-foreground">{f.value}%</span>
                          </div>
                          <div className="h-1 w-full bg-muted rounded-full">
                             <div className={cn("h-full rounded-full", f.value > 30 ? "bg-rose-500" : "bg-primary")} style={{ width: `${f.value}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>

              {/* Recent Alerts */}
              <Card className="border-border/40 shadow-sm rounded-lg overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Alerts</CardTitle>
                 </CardHeader>
                 <CardContent className="p-4 space-y-5">
                    {recentAlerts.map((alt: any, i: number) => (
                       <div key={i} className="flex gap-3 group cursor-pointer">
                          <div className={cn(
                             "shrink-0 p-1.5 h-fit rounded-lg bg-muted border border-border/50 transition-colors text-rose-500 group-hover:bg-rose-500/10"
                          )}>
                             <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-foreground uppercase tracking-tight leading-tight">{alt.type}</p>
                             <p className="text-[9px] font-medium text-muted-foreground mt-0.5">{alt.candidate}</p>
                             <p className="text-[7px] font-bold text-muted-foreground/50 uppercase mt-1 tracking-widest">{new Date(alt.time).toLocaleTimeString()}</p>
                          </div>
                       </div>
                    ))}
                 </CardContent>
              </Card>

           </div>

        </div>

        {/* BOTTOM SECTION: TRENDS & ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Risk Trend */}
           <Card className="lg:col-span-6 border-border/40 shadow-sm rounded-lg overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Risk Trend</CardTitle>
              </div>
              <div className="h-[250px] w-full">
                 <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
                    <LineChart data={riskTrend}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <YAxis tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                       <Legend verticalAlign="top" align="left" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase' }} />
                       <Line type="monotone" dataKey="high" name="High Risk" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} />
                       <Line type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                       <Line type="monotone" dataKey="low" name="Low Risk" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* Risk by Stage */}
           <Card className="lg:col-span-6 border-border/40 shadow-sm rounded-lg overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="space-y-1">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Risk by Stage</CardTitle>
                    <p className="text-[8px] font-black text-muted-foreground/60 uppercase">Shows average risk score by candidate stage</p>
                 </div>
              </div>
              <div className="h-[250px] w-full">
                 <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
                    <BarChart data={riskByStage}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <YAxis tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                       <Legend verticalAlign="top" align="left" height={36} iconType="square" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase' }} />
                       <Bar dataKey="high" name="High (71-100)" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                       <Bar dataKey="medium" name="Medium (41-70)" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                       <Bar dataKey="low" name="Low (0-40)" stackId="a" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>

        </div>

        {/* MITIGATION ACTIONS (VERY BOTTOM) */}
         <div className="space-y-4 pb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Mitigation Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
               {[
                  { title: "Review High Risk", sub: `${kpis.highRisk} candidates`, btn: "Review Now", icon: ShieldAlert, color: "text-rose-500", filter: "High" },
                  { title: "Verify Backgrounds", sub: `${kpis.backgroundAlerts} pending`, btn: "Verify Now", icon: Fingerprint, color: "text-orange-500", filter: "Background" },
                  { title: "Check Compliance", sub: `${kpis.complianceIssues} issues`, btn: "Review Now", icon: Gavel, color: "text-purple-500", filter: "Compliance" },
                  { title: "Re-assess Candidates", sub: "18 recommended", btn: "Re-assess", icon: UserPlus, color: "text-blue-500", filter: "Assessment" },
                  { title: "Update Policies", sub: "3 outdated", btn: "Update Now", icon: ShieldCheck, color: "text-emerald-500", filter: "All" },
               ].map((ma, i) => (
                  <Card key={i} className="border-border/40 shadow-xl overflow-hidden p-6 group hover:border-primary/30 transition-all cursor-pointer bg-gradient-to-br from-card to-background/50">
                     <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-1.5 rounded-lg bg-muted border border-border/50 group-hover:bg-primary/10 transition-colors", ma.color)}>
                           <ma.icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-[10px] font-black text-foreground uppercase tracking-tight leading-tight">{ma.title}</h3>
                     </div>
                     <p className="text-[9px] font-medium text-muted-foreground leading-relaxed mb-4">{ma.sub}</p>
                     <Button 
                        onClick={() => {
                           setRiskType(ma.filter);
                           setPage(1);
                           window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        variant="link" className="text-[9px] font-black uppercase p-0 h-fit text-primary flex items-center gap-1 group">
                        {ma.btn} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                     </Button>
                  </Card>
               ))}
            </div>
         </div>
      </div>
    </PanelLayout>
  );
}
