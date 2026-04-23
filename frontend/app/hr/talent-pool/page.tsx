"use client";
import React from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Search, Filter, Plus, ChevronRight, 
  Mail, Edit, MoreVertical, Calendar, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, 
  Clock, Zap, Target, Star, ShieldCheck, 
  MapPin, Send, Layers, Download, Eye,
  RefreshCw, TrendingUp, UserPlus, Box, List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from "recharts";
import { cn } from "@/lib/utils";

export default function HighFidelityTalentPoolV2() {
  const distribution = [
    { name: "Engaged", value: 632, color: "#10b981", percent: "50.6%" },
    { name: "Nurturing", value: 286, color: "#8b5cf6", percent: "22.9%" },
    { name: "Not Engaged", value: 220, color: "#ef4444", percent: "17.6%" },
    { name: "Hired", value: 110, color: "#3b82f6", percent: "8.9%" },
  ];

  const topSkills = [
    { name: "JavaScript", count: 512, progress: 85 },
    { name: "Python", count: 436, progress: 75 },
    { name: "React", count: 398, progress: 70 },
    { name: "SQL", count: 342, progress: 60 },
    { name: "AWS", count: 310, progress: 55 },
  ];

  const talent = [
    { name: "Karan Singh", loc: "Bengaluru, India", role: "Software Engineer", skills: ["React", "Node.js", "AWS"], source: "LinkedIn", added: "May 20, 2025", engaged: "2 days ago", status: "Engaged", score: 92, quality: "Excellent", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan" },
    { name: "Priya Sharma", loc: "Pune, India", role: "UX Designer", skills: ["Figma", "UI/UX", "Prototyping"], source: "Naukri", added: "May 18, 2025", engaged: "5 days ago", status: "Engaged", score: 88, quality: "Excellent", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
    { name: "Devansh Gupta", loc: "Delhi, India", role: "Data Engineer", skills: ["Python", "SQL", "ETL"], source: "Referral", added: "May 15, 2025", engaged: "1 week ago", status: "Nurturing", score: 78, quality: "Good", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Devansh" },
    { name: "Ananya Iyer", loc: "Chennai, India", role: "Marketing Manager", skills: ["SEO", "SEM", "Analytics"], source: "Indeed", added: "May 14, 2025", engaged: "3 days ago", status: "Engaged", score: 85, quality: "Very Good", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya" },
    { name: "Vishal Reddy", loc: "Hyderabad, India", role: "Mobile Developer", skills: ["Flutter", "Dart", "Firebase"], source: "LinkedIn", added: "May 12, 2025", engaged: "2 weeks ago", status: "Nurturing", score: 76, quality: "Good", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vishal" },
  ];

  return (
    <PanelLayout title="Talent Pool" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">Talent Pool</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Manage and engage potential candidates for future opportunities</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" placeholder="Search candidates, skills, roles, locations..." />
              </div>
              <Button variant="outline" className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2">
                 <UserPlus className="w-4 h-4" /> Add Candidate
              </Button>
              <Button className="h-10 rounded-xl industrial-gradient text-white text-xs font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20">
                 <Zap className="w-4 h-4" /> Create Talent Pipeline
              </Button>
           </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
           {[
              { title: "Total Talent", value: "1,248", icon: Users, color: "text-primary", trend: "+18%" },
              { title: "Engaged", value: "632", icon: Target, color: "text-emerald-500", trend: "+14%" },
              { title: "Nurturing", value: "286", icon: RefreshCw, color: "text-purple-500", trend: "+11%" },
              { title: "Not Engaged", value: "220", icon: Zap, color: "text-rose-500", trend: "-6%" },
              { title: "Hired from Pool", value: "110", icon: CheckCircle2, color: "text-blue-500", trend: "+9%" },
           ].map((k, i) => (
              <Card key={i} className="border-border/40 glass shadow-xl overflow-hidden group">
                 <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                       <div className={cn("p-2 rounded-xl bg-muted/50 border border-border/50", k.color)}>
                          <k.icon className="w-4 h-4" />
                       </div>
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{k.title}</span>
                    </div>
                    <div className="flex items-end justify-between">
                       <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{k.value}</p>
                       <div className={cn("text-[9px] font-black flex items-center gap-1", k.trend.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>
                          {k.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {k.trend}
                       </div>
                    </div>
                 </CardContent>
              </Card>
           ))}
        </div>

        {/* MAIN SECTION: TABLE & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* All Talent Table */}
           <div className="lg:col-span-9 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex bg-muted/20 p-1 rounded-xl gap-1 border border-border/40 overflow-x-auto no-scrollbar">
                    {["All Talent (1,248)", "Engaged (632)", "Nurturing (286)", "Not Engaged (220)", "Hired (110)"].map((t, i) => (
                       <Button key={i} variant="ghost" className={cn(
                          "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg flex-shrink-0 transition-all",
                          i === 0 ? "bg-card text-primary shadow-sm" : "text-muted-foreground opacity-60 hover:opacity-100"
                       )}>{t}</Button>
                    ))}
                 </div>
                 <div className="flex items-center gap-3">
                    <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-8">
                       <option>All Skills</option>
                    </select>
                    <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-8">
                       <option>All Locations</option>
                    </select>
                    <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase gap-2"><Filter className="w-3 h-3" /> More Filters</Button>
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
                                <th className="px-6 py-4">Current Role</th>
                                <th className="px-6 py-4">Top Skills</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Added On</th>
                                <th className="px-6 py-4">Last Engaged</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Talent Score</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10">
                             {talent.map((t, i) => (
                                <tr key={i} className="hover:bg-muted/5 transition-colors group">
                                   <td className="px-6 py-4"><input type="checkbox" className="rounded border-border/50" /></td>
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                         <div className="w-9 h-9 rounded-xl bg-muted border border-border/50 overflow-hidden">
                                            <img src={t.img} alt="" className="w-full h-full object-cover" />
                                         </div>
                                         <div>
                                            <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{t.name}</p>
                                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {t.loc}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase">{t.role}</td>
                                   <td className="px-6 py-4">
                                      <div className="flex gap-1 flex-wrap max-w-[120px]">
                                         {t.skills.map((s, si) => (
                                            <Badge key={si} variant="outline" className="text-[7px] font-black uppercase border-border/40 h-4">{s}</Badge>
                                         ))}
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase">{t.source}</td>
                                   <td className="px-6 py-4 text-[9px] font-bold text-muted-foreground uppercase">{t.added}</td>
                                   <td className="px-6 py-4 text-[9px] font-bold text-muted-foreground uppercase">{t.engaged}</td>
                                   <td className="px-6 py-4">
                                      <Badge className={cn(
                                         "text-[8px] font-black uppercase border-none",
                                         t.status === "Engaged" ? "bg-emerald-500/10 text-emerald-500" : "bg-purple-500/10 text-purple-500"
                                      )}>{t.status}</Badge>
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="space-y-1">
                                         <p className="text-[11px] font-black text-foreground">{t.score}</p>
                                         <p className={cn("text-[7px] font-black uppercase", t.quality === 'Excellent' ? 'text-emerald-500' : 'text-blue-500')}>{t.quality}</p>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                         <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><Mail className="w-3.5 h-3.5" /></Button>
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
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Showing 1 to 5 of 1,248 talent</span>
                       <div className="flex gap-1">
                          {[1, 2, 3, '...', 125].map((p, i) => (
                             <Button key={i} variant={p === 1 ? 'default' : 'outline'} className={cn("w-7 h-7 p-0 text-[10px] font-black rounded-lg", p === 1 ? 'industrial-gradient border-none' : 'border-border/40')}>{p}</Button>
                          ))}
                          <Button variant="outline" className="w-7 h-7 p-0 rounded-lg border-border/40"><ChevronRight className="w-4 h-4" /></Button>
                          <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-7 ml-2">
                             <option>10 / page</option>
                          </select>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Sidebar: Overview, Skills, Activity */}
           <div className="lg:col-span-3 space-y-6 pb-12">
              
              {/* Talent Pool Overview */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
                 <div className="flex items-center justify-between mb-8">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Talent Pool Overview</CardTitle>
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
                       <span className="text-xl font-black text-foreground">1,248</span>
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
              </Card>

              {/* Top Skills in Pool */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
                 <div className="flex items-center justify-between mb-6">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Top Skills in Pool</CardTitle>
                    <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">View All</Button>
                 </div>
                 <div className="space-y-5">
                    {topSkills.map((s, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase">
                             <span className="text-foreground">{s.name}</span>
                             <span className="text-muted-foreground">{s.count}</span>
                          </div>
                          <div className="h-1 w-full bg-muted rounded-full">
                             <div className="h-full bg-primary rounded-full" style={{ width: `${s.progress}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>

              {/* Engagement Activity */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Engagement Activity</CardTitle>
                    <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">View All</Button>
                 </CardHeader>
                 <CardContent className="p-4 space-y-5">
                    {[
                       { name: "Priya Sharma", action: "opened your email", time: "2 hours ago", icon: Mail, color: "text-blue-500" },
                       { name: "Karan Singh", action: "replied to your message", time: "5 hours ago", icon: Send, color: "text-emerald-500" },
                       { name: "Ananya Iyer", action: "downloaded the job description", time: "1 day ago", icon: Download, color: "text-amber-500" },
                    ].map((act, i) => (
                       <div key={i} className="flex gap-3">
                          <div className={cn("shrink-0 p-1.5 h-fit rounded-lg bg-muted border border-border/50", act.color)}>
                             <act.icon className="w-3 h-3" />
                          </div>
                          <div>
                             <p className="text-[10px] font-medium text-foreground leading-tight"><span className="font-black uppercase">{act.name}</span> {act.action}</p>
                             <p className="text-[7px] font-bold text-muted-foreground/50 uppercase mt-1 tracking-widest">{act.time}</p>
                          </div>
                       </div>
                    ))}
                 </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                 {[
                    { label: "Add Candidate", icon: UserPlus },
                    { label: "Send Campaign", icon: Send },
                    { label: "Create Pipeline", icon: Layers },
                    { label: "Import Candidates", icon: Download },
                 ].map((qa, i) => (
                    <Button key={i} variant="outline" className="h-20 flex-col gap-2 rounded-2xl border-border/40 glass hover:bg-primary/5 hover:border-primary/30 transition-all">
                       <qa.icon className="w-4 h-4 text-primary" />
                       <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-foreground">{qa.label}</span>
                    </Button>
                 ))}
              </div>

           </div>

        </div>

        {/* RECOMMENDED ACTIONS (BOTTOM) */}
        <div className="space-y-4 pb-12">
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Recommended Actions</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                 { title: "Re-engage inactive candidates", desc: "220 candidates haven't engaged in 30+ days", btn: "View Candidates", icon: RefreshCw, color: "text-rose-500" },
                 { title: "Nurture high potential talent", desc: "86 candidates are ready for nurturing", btn: "Start Nurturing", icon: Star, color: "text-purple-500" },
                 { title: "Highlight top talent", desc: "32 high scoring candidates to review", btn: "Review Now", icon: Target, color: "text-amber-500" },
                 { title: "Talent pipeline opportunity", desc: "Create pipeline for Product Manager role", btn: "Create Pipeline", icon: Layers, color: "text-blue-500" },
              ].map((ra, i) => (
                 <Card key={i} className="border-border/40 glass shadow-xl overflow-hidden p-6 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                       <div className={cn("p-1.5 rounded-lg bg-muted border border-border/50 group-hover:bg-primary/10 transition-colors", ra.color)}>
                          <ra.icon className="w-4 h-4" />
                       </div>
                       <h3 className="text-[10px] font-black text-foreground uppercase tracking-tight leading-tight">{ra.title}</h3>
                    </div>
                    <p className="text-[9px] font-medium text-muted-foreground leading-relaxed mb-4">{ra.desc}</p>
                    <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit text-primary flex items-center gap-1 group">
                       {ra.btn} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </Card>
              ))}
           </div>
        </div>

      </div>
    </PanelLayout>
  );
}
