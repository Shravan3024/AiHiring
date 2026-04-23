"use client";
import React from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, ShieldCheck, Shield, AlertTriangle, 
  Search, Filter, ChevronRight, Download, Share2, 
  MoreVertical, Eye, Edit, Trash2, Clock, Calendar,
  ArrowUpRight, ArrowDownRight, Activity, Users,
  Lock, FileWarning, Fingerprint, Gavel, UserX, UserPlus,
  Target, TrendingUp, BarChart3, PieChart as PieIcon,
  RefreshCw, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import { cn } from "@/lib/utils";

export default function HighFidelityRiskMonitorV2() {
  const riskTrend = [
    { name: "May 12", high: 65, medium: 42, low: 22, no: 12 },
    { name: "May 19", high: 68, medium: 45, low: 25, no: 15 },
    { name: "May 26", high: 72, medium: 40, low: 20, no: 10 },
    { name: "Jun 2", high: 66, medium: 48, low: 28, no: 18 },
    { name: "Jun 9", high: 70, medium: 44, low: 24, no: 14 },
  ];

  const riskByStage = [
    { name: "Sourcing", low: 25, medium: 15, high: 5 },
    { name: "Assessment", low: 15, medium: 35, high: 15 },
    { name: "Interview", low: 10, medium: 40, high: 22 },
    { name: "Background", low: 5, medium: 25, high: 50 },
    { name: "Offer", low: 12, medium: 30, high: 8 },
    { name: "Hired", low: 20, medium: 5, high: 0 },
  ];

  const distribution = [
    { name: "High Risk", value: 37, color: "#ef4444", percent: "21.6%" },
    { name: "Medium Risk", value: 68, color: "#f59e0b", percent: "39.8%" },
    { name: "Low Risk", value: 55, color: "#3b82f6", percent: "32.2%" },
    { name: "No Risk", value: 11, color: "#10b981", percent: "6.4%" },
  ];

  const risks = [
    { name: "Rohan Verma", email: "rohan.verma@email.com", role: "Data Engineer", stage: "Assessment", type: "Background Check", score: 85, level: "High", update: "Jun 10, 2025 10:30 AM", status: "New", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan" },
    { name: "Neha Kapoor", email: "neha.kapoor@email.com", role: "Product Manager", stage: "Interview", type: "Behavioral", score: 72, level: "High", update: "Jun 9, 2025 03:15 PM", status: "Under Review", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha" },
    { name: "Arjun Nair", email: "arjun.nair@email.com", role: "DevOps Engineer", stage: "Background Check", type: "Background Check", score: 68, level: "Medium", update: "Jun 9, 2025 11:20 AM", status: "New", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" },
    { name: "Priya Sharma", email: "priya.sharma@email.com", role: "UX Designer", stage: "Assessment", type: "Assessment", score: 55, level: "Medium", update: "Jun 8, 2025 04:10 PM", status: "Monitoring", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
    { name: "Karan Singh", email: "karan.singh@email.com", role: "Software Engineer", stage: "Offer", type: "Compliance", score: 42, level: "Low", update: "Jun 8, 2025 01:45 PM", status: "Resolved", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan" },
  ];

  const factors = [
    { name: "Employment Gaps", value: 42, color: "bg-rose-500" },
    { name: "Inconsistent Information", value: 31, color: "bg-amber-500" },
    { name: "Background Discrepancies", value: 28, color: "bg-orange-500" },
    { name: "Poor Assessment Score", value: 24, color: "bg-yellow-500" },
    { name: "Behavioral Concerns", value: 18, color: "bg-blue-500" },
  ];

  return (
    <PanelLayout title="Risk Monitor" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">Risk Monitor</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Identify, assess and mitigate risks across your hiring pipeline</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" placeholder="Search candidates, roles, checks..." />
              </div>
              <Button variant="outline" className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2">
                 <Filter className="w-4 h-4" /> Filters
              </Button>
           </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
           {[
              { title: "Overall Risk Score", value: "62 / 100", sub: "Moderate Risk", icon: Shield, color: "text-amber-500", trend: "+6 pts" },
              { title: "High Risk Candidates", value: "37", sub: "Action Required", icon: UserX, color: "text-rose-500", trend: "+12%" },
              { title: "Background Check Alerts", value: "29", sub: "Pending Review", icon: Fingerprint, color: "text-orange-500", trend: "+8%" },
              { title: "Compliance Issues", value: "14", sub: "Unresolved", icon: Gavel, color: "text-purple-500", trend: "-7%" },
              { title: "Actions Required", value: "21", sub: "Due for review", icon: AlertTriangle, color: "text-blue-500", trend: "0%" },
           ].map((k, i) => (
              <Card key={i} className="border-border/40 glass shadow-xl overflow-hidden group">
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
                       <Button key={i} variant="ghost" className={cn(
                          "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg flex-shrink-0 transition-all",
                          i === 0 ? "bg-card text-primary shadow-sm" : "text-muted-foreground opacity-60 hover:opacity-100"
                       )}>{t}</Button>
                    ))}
                 </div>
                 <div className="flex items-center gap-3">
                    <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-8">
                       <option>All Risk Types</option>
                    </select>
                    <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-8">
                       <option>All Stages</option>
                    </select>
                    <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase gap-2"><Download className="w-3 h-3" /> Export</Button>
                 </div>
              </div>

              <Card className="border-border/40 glass-dark shadow-2xl rounded-3xl overflow-hidden">
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest bg-muted/10">
                             <tr>
                                <th className="px-6 py-4"><input type="checkbox" className="rounded border-border/50" /></th>
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
                             {risks.map((r, i) => (
                                <tr key={i} className="hover:bg-muted/5 transition-colors group">
                                   <td className="px-6 py-4"><input type="checkbox" className="rounded border-border/50" /></td>
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                         <div className="w-9 h-9 rounded-xl bg-muted border border-border/50 overflow-hidden">
                                            <img src={r.img} alt="" className="w-full h-full object-cover" />
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
                                      <Badge variant="outline" className="text-[7px] font-black uppercase border-rose-500/20 text-rose-500 bg-rose-500/5 h-4">{r.type}</Badge>
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="space-y-1.5 w-24">
                                         <div className="flex justify-between text-[9px] font-black uppercase">
                                            <span>{r.score}</span>
                                            <span className="text-muted-foreground opacity-50">/ 100</span>
                                         </div>
                                         <div className="h-1 w-full bg-muted rounded-full">
                                            <div className={cn("h-full rounded-full", r.score > 70 ? "bg-rose-500" : r.score > 40 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${r.score}%` }}></div>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4">
                                      <Badge className={cn(
                                         "text-[8px] font-black uppercase border-none w-16 justify-center",
                                         r.level === "High" ? "bg-rose-500/10 text-rose-500" : r.level === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                      )}>{r.level}</Badge>
                                   </td>
                                   <td className="px-6 py-4 text-[9px] font-bold text-muted-foreground uppercase">{r.update}</td>
                                   <td className="px-6 py-4">
                                      <Badge variant="outline" className="text-[8px] font-black uppercase border-border/40 h-5">{r.status}</Badge>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                         <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><Eye className="w-3.5 h-3.5" /></Button>
                                         <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><Edit className="w-3.5 h-3.5" /></Button>
                                         <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><MoreVertical className="w-3.5 h-3.5" /></Button>
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between border-t border-border/10">
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Showing 1 to 7 of 37 candidates</span>
                       <div className="flex gap-1">
                          {[1, 2, 3, '...', 6].map((p, i) => (
                             <Button key={i} variant={p === 1 ? 'default' : 'outline'} className={cn("w-7 h-7 p-0 text-[10px] font-black rounded-lg", p === 1 ? 'industrial-gradient border-none' : 'border-border/40')}>{p}</Button>
                          ))}
                          <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-7 ml-2">
                             <option>10 / page</option>
                          </select>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Sidebar: Distribution, Factors, Alerts */}
           <div className="lg:col-span-3 space-y-6 pb-12">
              
              {/* Risk Distribution */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
                 <div className="flex items-center justify-between mb-8">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Risk Distribution</CardTitle>
                    <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-6">
                       <option>Last 30 Days</option>
                    </select>
                 </div>
                 <div className="relative h-40 w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={distribution} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                             {distribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-xl font-black text-foreground">37</span>
                       <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                    </div>
                 </div>
                 <div className="space-y-3">
                    {distribution.map((d, i) => (
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
                    <ArrowUpRight className="w-3.5 h-3.5" /> 8% increase in high risk candidates
                 </div>
              </Card>

              {/* Top Risk Factors */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
                 <div className="flex items-center justify-between mb-6">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Top Risk Factors</CardTitle>
                    <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">View All</Button>
                 </div>
                 <div className="space-y-5">
                    {factors.map((f, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase">
                             <span className="text-foreground">{f.name}</span>
                             <span className="text-muted-foreground">{f.value}%</span>
                          </div>
                          <div className="h-1 w-full bg-muted rounded-full">
                             <div className={cn("h-full rounded-full", f.color)} style={{ width: `${f.value}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>

              {/* Recent Alerts */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Alerts</CardTitle>
                    <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">View All</Button>
                 </CardHeader>
                 <CardContent className="p-4 space-y-5">
                    {[
                       { title: "High risk background discrepancy", cand: "Rohan Verma", time: "10 mins ago", type: "error" },
                       { title: "Inconsistent employment dates", cand: "Neha Kapoor", time: "1 hour ago", type: "warning" },
                       { title: "Education verification failed", cand: "Arjun Nair", time: "2 hours ago", type: "info" },
                    ].map((alt, i) => (
                       <div key={i} className="flex gap-3 group cursor-pointer">
                          <div className={cn(
                             "shrink-0 p-1.5 h-fit rounded-lg bg-muted border border-border/50 transition-colors",
                             alt.type === 'error' ? "text-rose-500 group-hover:bg-rose-500/10" : alt.type === 'warning' ? "text-amber-500 group-hover:bg-amber-500/10" : "text-purple-500 group-hover:bg-purple-500/10"
                          )}>
                             <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-foreground uppercase tracking-tight leading-tight">{alt.title}</p>
                             <p className="text-[9px] font-medium text-muted-foreground mt-0.5">{alt.cand}</p>
                             <p className="text-[7px] font-bold text-muted-foreground/50 uppercase mt-1 tracking-widest">{alt.time}</p>
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
           <Card className="lg:col-span-6 border-border/40 glass-dark shadow-2xl rounded-3xl overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Risk Trend</CardTitle>
                 <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-7">
                    <option>Last 30 Days</option>
                 </select>
              </div>
              <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTrend}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <YAxis tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                       <Legend verticalAlign="top" align="left" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase' }} />
                       <Line type="monotone" dataKey="high" name="High Risk" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                       <Line type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                       <Line type="monotone" dataKey="low" name="Low Risk" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* Risk by Stage */}
           <Card className="lg:col-span-6 border-border/40 glass-dark shadow-2xl rounded-3xl overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="space-y-1">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Risk by Stage</CardTitle>
                    <p className="text-[8px] font-black text-muted-foreground/60 uppercase">Shows average risk score by candidate stage</p>
                 </div>
                 <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-7">
                    <option>Last 30 Days</option>
                 </select>
              </div>
              <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskByStage}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <YAxis tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                       <Legend verticalAlign="top" align="left" height={36} iconType="square" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase' }} />
                       <Bar dataKey="high" name="High (71-100)" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                       <Bar dataKey="medium" name="Medium (41-70)" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                       <Bar dataKey="low" name="Low (0-40)" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
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
                 { title: "Review High Risk", sub: "37 candidates", btn: "Review Now", icon: ShieldAlert, color: "text-rose-500" },
                 { title: "Verify Backgrounds", sub: "29 pending", btn: "Verify Now", icon: Fingerprint, color: "text-orange-500" },
                 { title: "Check Compliance", sub: "14 issues", btn: "Review Now", icon: Gavel, color: "text-purple-500" },
                 { title: "Re-assess Candidates", sub: "18 recommended", btn: "Re-assess", icon: UserPlus, color: "text-blue-500" },
                 { title: "Update Policies", sub: "3 outdated", btn: "Update Now", icon: ShieldCheck, color: "text-emerald-500" },
              ].map((ma, i) => (
                 <Card key={i} className="border-border/40 glass shadow-xl overflow-hidden p-6 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                       <div className={cn("p-1.5 rounded-lg bg-muted border border-border/50 group-hover:bg-primary/10 transition-colors", ma.color)}>
                          <ma.icon className="w-4 h-4" />
                       </div>
                       <h3 className="text-[10px] font-black text-foreground uppercase tracking-tight leading-tight">{ma.title}</h3>
                    </div>
                    <p className="text-[9px] font-medium text-muted-foreground leading-relaxed mb-4">{ma.sub}</p>
                    <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit text-primary flex items-center gap-1 group">
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
