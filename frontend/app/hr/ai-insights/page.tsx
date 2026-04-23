"use client";
import React from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, Brain, Sparkles, TrendingUp, Target, 
  Search, Filter, ChevronRight, Zap, Lightbulb, 
  AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight,
  ShieldCheck, MessageSquare, Star, Activity, Clock, 
  UserPlus, BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  ZapOff, Ghost, Wand2, RefreshCw, Download, Layers, Users, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, BarChart, Bar, Cell
} from "recharts";
import { cn } from "@/lib/utils";

export default function HighFidelityAIInsightsV2() {
  const qualityTrend = [
    { name: "Mar 10", score: 68 },
    { name: "Mar 24", score: 62 },
    { name: "Apr 7", score: 65 },
    { name: "Apr 21", score: 58 },
    { name: "May 5", score: 72 },
    { name: "May 19", score: 68 },
    { name: "Jun 2", score: 75 },
  ];

  const skillGap = [
    { skill: "Data Analysis", current: 48, demand: 92, gap: "-44%" },
    { skill: "Machine Learning", current: 22, demand: 64, gap: "-42%" },
    { skill: "Cloud Computing", current: 31, demand: 68, gap: "-37%" },
    { skill: "Product Strategy", current: 45, demand: 70, gap: "-25%" },
    { skill: "Communication", current: 78, demand: 85, gap: "-7%" },
  ];

  const roles = [
    { role: "Data Analyst", prob: "89%", status: "Very High", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { role: "Product Manager", prob: "76%", status: "High", color: "text-blue-500", bg: "bg-blue-500/10" },
    { role: "UX Designer", prob: "68%", status: "Moderate", color: "text-amber-500", bg: "bg-amber-500/10" },
    { role: "Marketing Manager", prob: "61%", status: "Moderate", color: "text-amber-500", bg: "bg-amber-500/10" },
    { role: "Sales Executive", prob: "45%", status: "Low", color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  const recommended = [
    { name: "Aarav Mehta", role: "Data Analyst", score: "92%", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" },
    { name: "Priya Sharma", role: "UX Designer", score: "88%", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
    { name: "Rohan Verma", role: "Product Manager", score: "85%", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan" },
    { name: "Neha Kapoor", role: "Data Scientist", score: "83%", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha" },
    { name: "Arjun Nair", role: "Marketing Manager", score: "81%", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" },
  ];

  return (
    <PanelLayout title="AI Insights" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">AI Insights</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI-powered insights and recommendations to optimize your hiring decisions</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" placeholder="Search candidates, roles, skills..." />
              </div>
              <Button variant="outline" className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2">
                 <Download className="w-4 h-4" /> Download Insights
              </Button>
              <Button className="h-10 rounded-xl industrial-gradient text-white text-xs font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20">
                 <Sparkles className="w-4 h-4" /> Generate AI Report
              </Button>
           </div>
        </div>

        {/* TABS */}
        <div className="flex bg-muted/20 p-1.5 rounded-2xl gap-2 border border-border/40 overflow-x-auto no-scrollbar">
           {["Overview", "Hiring Intelligence", "Talent Intelligence", "Predictive Analytics", "Recommendations", "Market Insights"].map((t, i) => (
              <Button key={i} variant="ghost" className={cn(
                 "h-10 text-[10px] font-black uppercase tracking-widest px-6 rounded-xl transition-all whitespace-nowrap",
                 i === 0 ? "bg-card text-primary shadow-lg" : "text-muted-foreground opacity-60 hover:opacity-100"
              )}>{t}</Button>
           ))}
        </div>

        {/* KPI GRID WITH PROGRESS BARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
           {[
              { title: "Overall Hiring Quality Score", value: "78", subLeft: "Good", subRight: "Improving", color: "text-purple-500", icon: Layers, progress: 78 },
              { title: "AI Fit Score (Top Candidates)", value: "85%", subLeft: "Strong Fit", subRight: "Quality Match", color: "text-emerald-500", icon: Brain, progress: 85 },
              { title: "Hiring Efficiency Score", value: "72", subLeft: "Fair", subRight: "Room to Improve", color: "text-amber-500", icon: Zap, progress: 72 },
              { title: "Time to Fill (Avg.)", value: "23", subLeft: "Good", subRight: "Faster", color: "text-blue-500", icon: Clock, progress: 65 },
              { title: "Offer Acceptance Rate", value: "81%", subLeft: "Good", subRight: "Impressive", color: "text-rose-500", icon: Target, progress: 81 },
           ].map((k, i) => (
              <Card key={i} className="border-border/40 glass shadow-xl overflow-hidden group">
                 <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                       <div className={cn("p-2 rounded-xl bg-muted/50 border border-border/50", k.color)}>
                          <k.icon className="w-4 h-4" />
                       </div>
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right max-w-[120px]">{k.title}</span>
                    </div>
                    <div className="space-y-1">
                       <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{k.value}</p>
                       <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase">
                          <ArrowUpRight className="w-2.5 h-2.5" /> 8% vs last 30 days
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-1000", k.color.replace('text', 'bg'))} style={{ width: `${k.progress}%` }}></div>
                       </div>
                       <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-tighter">
                          <span>{k.subLeft}</span>
                          <span>{k.subRight}</span>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           ))}
        </div>

        {/* MIDDLE SECTION: SUMMARIES, RECOMMENDATIONS, PREDICTIVE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* AI Insight Summary */}
           <Card className="lg:col-span-4 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">AI Insight Summary</CardTitle>
                 <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">View All Insights</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-border/10">
                    {[
                       { title: "High Performing Skill", desc: "Data Analysis skill is strongly correlated with high performance in Data & Analytics roles.", impact: "High Impact", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: TrendingUp },
                       { title: "Drop-off Alert", desc: "We noticed a 24% drop-off in the assessment stage for Marketing roles. Consider reviewing assessment difficulty.", impact: "Moderate", color: "text-rose-500", bg: "bg-rose-500/10", icon: AlertCircle },
                       { title: "Better Interview Predictors", desc: "Technical interviews are 31% better predictors of on-the-job performance than HR interviews.", impact: "High Impact", color: "text-blue-500", bg: "bg-blue-500/10", icon: Lightbulb },
                       { title: "Diversity Opportunity", desc: "Female candidates drop-off rate is 18% higher in the technical assessment stage.", impact: "Moderate", color: "text-purple-500", bg: "bg-purple-500/10", icon: Users },
                       { title: "Top Source Performance", desc: "Candidates from LinkedIn have 27% higher average scores compared to other sources.", impact: "High Impact", color: "text-blue-500", bg: "bg-blue-500/10", icon: LineIcon },
                    ].map((ins, i) => (
                       <div key={i} className="p-6 hover:bg-muted/5 transition-colors cursor-pointer group space-y-3">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className={cn("p-1.5 rounded-lg border border-border/50", ins.bg, ins.color)}>
                                   <ins.icon className="w-3.5 h-3.5" />
                                </div>
                                <h4 className="text-[10px] font-black text-foreground uppercase tracking-tight">{ins.title}</h4>
                             </div>
                             <Badge variant="outline" className={cn("text-[7px] font-black uppercase border-none", ins.bg, ins.color)}>{ins.impact}</Badge>
                          </div>
                          <p className="text-[9px] font-medium text-muted-foreground leading-relaxed pl-10">{ins.desc}</p>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* AI Hiring Recommendations */}
           <Card className="lg:col-span-4 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">AI Hiring Recommendations</CardTitle>
                 <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">View All</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-border/10">
                    {[
                       { text: "Focus on candidates with strong problem solving skills", sub: "They show 32% higher performance in similar roles", icon: Target, color: "text-emerald-500" },
                       { text: "Reduce assessment length for marketing roles", sub: "Shorter assessments may improve completion rate", icon: Zap, color: "text-amber-500" },
                       { text: "Increase technical interview weightage", sub: "Technical interviews are better predictors of performance", icon: MessageSquare, color: "text-blue-500" },
                       { text: "Engage passive candidates from your talent pool", sub: "412 high-fit passive candidates available", icon: UserPlus, color: "text-purple-500" },
                       { text: "Review compensation for Product Manager role", sub: "Offer acceptance rate is 12% lower than industry avg", icon: Star, color: "text-rose-500" },
                    ].map((rec, i) => (
                       <div key={i} className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                             <div className="p-2 rounded-xl bg-muted/50 border border-border/50 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                <rec.icon className={cn("w-4 h-4", rec.color)} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-foreground uppercase tracking-tight">{rec.text}</p>
                                <p className="text-[9px] font-medium text-muted-foreground mt-0.5">{rec.sub}</p>
                             </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* Predictive Insights */}
           <Card className="lg:col-span-4 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Predictive Insights</CardTitle>
                 <Badge className="bg-primary/10 text-primary text-[8px] font-black border-none px-2 h-4">AI POWERED</Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="flex bg-muted/20 p-1 rounded-xl gap-1 border border-border/40">
                    <Button variant="ghost" className="flex-1 h-8 text-[9px] font-black uppercase tracking-widest bg-card text-primary shadow-sm rounded-lg">Role Success Prediction</Button>
                    <Button variant="ghost" className="flex-1 h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Candidate Risk Prediction</Button>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/10 pb-2">
                       <span>Role</span>
                       <span>Success Probability</span>
                    </div>
                    {roles.map((r, i) => (
                       <div key={i} className="flex items-center justify-between group">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{r.role}</span>
                          <div className="flex items-center gap-4">
                             <span className="text-[11px] font-black text-foreground tabular-nums">{r.prob}</span>
                             <Badge className={cn("text-[8px] font-black uppercase border-none w-20 justify-center", r.bg, r.color)}>{r.status}</Badge>
                          </div>
                       </div>
                    ))}
                 </div>
                 <Button variant="outline" className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-border/50 hover:bg-muted/50 transition-all">View All Role Predictions</Button>
              </CardContent>
           </Card>

        </div>

        {/* BOTTOM SECTION: SKILL GAP, QUALITY TREND, OBSERVATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Skill Gap Analysis */}
           <Card className="lg:col-span-4 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
              <div className="flex items-center justify-between mb-8">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Skill Gap Analysis</CardTitle>
                 <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">View Full Analysis</Button>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-4 text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2 border-b border-border/10 pb-2">
                    <span className="col-span-1">Skill</span>
                    <span className="col-span-1 text-center">Current Availability</span>
                    <span className="col-span-1 text-center">Demand</span>
                    <span className="col-span-1 text-right">Gap</span>
                 </div>
                 {skillGap.map((s, i) => (
                    <div key={i} className="grid grid-cols-4 items-center gap-4 group">
                       <span className="text-[9px] font-black text-foreground uppercase tracking-tight">{s.skill}</span>
                       <div className="flex flex-col gap-1 items-center">
                          <div className="text-[9px] font-black text-blue-500">{s.current}%</div>
                          <div className="h-1 w-full bg-muted rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.current}%` }}></div></div>
                       </div>
                       <div className="flex flex-col gap-1 items-center">
                          <div className="text-[9px] font-black text-emerald-500">{s.demand}%</div>
                          <div className="h-1 w-full bg-muted rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.demand}%` }}></div></div>
                       </div>
                       <span className="text-[10px] font-black text-rose-500 text-right tabular-nums">{s.gap}</span>
                    </div>
                 ))}
              </div>
           </Card>

           {/* Candidate Quality Trend */}
           <Card className="lg:col-span-5 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
              <div className="flex items-center justify-between mb-8">
                 <div className="space-y-1">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Candidate Quality Trend</CardTitle>
                    <p className="text-[8px] font-black text-muted-foreground/60 uppercase">(AI Score Avg.)</p>
                 </div>
                 <select className="bg-transparent border border-border/40 rounded-lg text-[9px] font-black uppercase px-2 h-7">
                    <option>Last 90 Days</option>
                 </select>
              </div>
              <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={qualityTrend}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <YAxis tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                       <Line type="monotone" dataKey="score" name="AI Score (Average)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* AI Observations */}
           <Card className="lg:col-span-3 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-2">
                 <Wand2 className="w-3.5 h-3.5 text-primary" /> AI Observations
              </CardTitle>
              <div className="space-y-8">
                 {[
                    { text: "Candidates with 'Data Visualization' skill have 28% higher success rate in Data roles.", icon: Lightbulb, color: "text-blue-500" },
                    { text: "Weekday interviews (Tue-Thu) show 15% higher completion rate than other days.", icon: RefreshCw, color: "text-indigo-500" },
                    { text: "Candidates applying between 10 AM - 2 PM have higher assessment completion rate.", icon: Clock, color: "text-emerald-500" },
                 ].map((obs, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className={cn("shrink-0 p-2 h-fit rounded-xl bg-muted/50 border border-border/50 group-hover:scale-110 transition-transform", obs.color)}>
                          <obs.icon className="w-3.5 h-3.5" />
                       </div>
                       <p className="text-[10px] font-medium text-foreground leading-relaxed leading-tight">{obs.text}</p>
                    </div>
                 ))}
                 <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit text-primary flex items-center gap-2 group mt-4">
                    Explore All Observations <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
           </Card>

        </div>

        {/* TOP RECOMMENDED CANDIDATES (HORIZONTAL LIST) */}
        <div className="space-y-4 pb-12">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Top AI Recommended Candidates</h2>
                 <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Based on role fit, skills, and potential</p>
              </div>
              <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">View All Candidates</Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recommended.map((c, i) => (
                 <Card key={i} className="border-border/40 glass shadow-xl rounded-3xl overflow-hidden group hover:border-primary/30 transition-all cursor-pointer">
                    <CardContent className="p-6 space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-muted border border-border/50 overflow-hidden">
                                <img src={c.img} alt="" className="w-full h-full object-cover" />
                             </div>
                             <div>
                                <h4 className="text-[10px] font-black text-foreground uppercase tracking-tight">{c.name}</h4>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase">{c.role}</p>
                             </div>
                          </div>
                          <div className="relative w-10 h-10">
                             <svg className="w-full h-full transform -rotate-90">
                                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-muted/10" />
                                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={113} strokeDashoffset={113 * (1 - 0.92)} className="text-emerald-500" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[7px] font-black text-foreground">{c.score}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center justify-between pt-2 border-t border-border/10">
                          <Badge className="bg-emerald-500/10 text-emerald-500 text-[7px] font-black border-none px-2 h-4 uppercase">High Potential</Badge>
                          <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">AI FIT SCORE</span>
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
