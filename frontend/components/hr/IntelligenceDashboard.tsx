"use client";
import React from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, PieChart, Pie, AreaChart, Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, Award, Brain, Zap, ShieldCheck, CheckCircle2, 
  AlertCircle, MessageSquare, Briefcase, MapPin, Mail, 
  ExternalLink, ChevronRight, UserPlus, XCircle, PauseCircle,
  BarChart3, Activity, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CandidateIntelligenceProps {
  profileData: any;
}

export default function CandidateIntelligence({ profileData }: CandidateIntelligenceProps) {
  // Mock Data for High-Fidelity UI
  const skillData = [
    { subject: 'Marketing Strategy', A: 90, fullMark: 100 },
    { subject: 'Digital Marketing', A: 80, fullMark: 100 },
    { subject: 'SEO / SEM', A: 85, fullMark: 100 },
    { subject: 'Analytics', A: 75, fullMark: 100 },
    { subject: 'Brand Management', A: 70, fullMark: 100 },
    { subject: 'Communication', A: 95, fullMark: 100 },
  ];

  const emotionalToneData = [
    { time: '00:00', value: 40 },
    { time: '05:00', value: 60 },
    { time: '10:00', value: 45 },
    { time: '15:00', value: 70 },
    { time: '20:00', value: 55 },
    { time: '25:00', value: 80 },
    { time: '30:00', value: 65 },
  ];

  const scoreBreakdown = [
    { name: 'Resume', value: 25, color: '#10b981' },
    { name: 'Assessment', value: 25, color: '#3b82f6' },
    { name: 'Interview', value: 27, color: '#8b5cf6' },
    { name: 'Integrity', value: 8, color: '#f59e0b' },
  ];

  const predictionData = [
    { month: 'M1', performance: 65, retention: 80 },
    { month: 'M2', performance: 75, retention: 82 },
    { month: 'M3', performance: 85, retention: 85 },
    { month: 'M4', performance: 92, retention: 88 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* 1. TOP HERO SECTION */}
      <Card className="border-border/40 glass-dark shadow-2xl overflow-hidden rounded-[2rem]">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Candidate Identity */}
            <div className="lg:col-span-4 flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative w-24 h-24 rounded-full bg-muted border-2 border-primary/50 overflow-hidden">
                  <img 
                    src={profileData?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarthak"} 
                    alt="Candidate" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                   <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                  {profileData?.name || "Sarthak Giri"}
                </h1>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" /> Executive - Marketing
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-medium">sarthakgiri190@gmail.com</p>
                <div className="flex gap-4 mt-2">
                   <div className="px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-[9px] font-black uppercase tracking-tighter">ID: MP-12548</div>
                   <div className="px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-[9px] font-black uppercase tracking-tighter">EXP: 3.2 YRS</div>
                </div>
              </div>
            </div>

            {/* Hire Score Gauge */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center border-x border-border/10 px-4">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Hire Score</span>
               <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/10" />
                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={301.59} strokeDashoffset={301.59 * (1 - 0.85)} 
                            className="text-emerald-500 transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-foreground">85</span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">/100</span>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black mt-1">Strong Hire</Badge>
                  </div>
               </div>
            </div>

            {/* AI Insights Indicators */}
            <div className="lg:col-span-3 space-y-4 px-4">
               <div className="space-y-1">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">AI Recommendation</span>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Strong Hire</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <span className="text-[8px] font-black uppercase text-muted-foreground">Confidence</span>
                     <p className="text-xs font-black text-foreground">92%</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[8px] font-black uppercase text-muted-foreground">Fit for Role</span>
                     <p className="text-xs font-black text-primary">High</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[8px] font-black uppercase text-muted-foreground">Risk Level</span>
                     <p className="text-xs font-black text-emerald-500">Low</p>
                  </div>
               </div>
            </div>

            {/* Score Breakdown Donut */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Score Breakdown</span>
               <div className="h-28 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={scoreBreakdown} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                          {scoreBreakdown.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }} />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* 2. MAIN ANALYSIS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Radar & Performance */}
        <div className="lg:col-span-4 space-y-6">
           {/* Skills Match Radar */}
           <Card className="border-border/40 glass-dark shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Skills Match Radar
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                       <PolarGrid stroke="rgba(255,255,255,0.05)" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: 'black', textTransform: 'uppercase' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Candidate" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                       <Tooltip />
                    </RadarChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           {/* Assessment Performance */}
           <Card className="border-border/40 glass shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assessment Performance</h3>
                       <div className="flex items-center gap-2">
                          <span className="text-3xl font-black text-foreground">88</span>
                          <span className="text-xs font-black text-muted-foreground uppercase">/100</span>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none ml-2">Excellent</Badge>
                       </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                       <Activity className="w-6 h-6 text-emerald-500" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    {[
                       { label: 'Marketing Fundamentals', score: 90 },
                       { label: 'Case Study', score: 85 },
                       { label: 'Analytics & Metrics', score: 92 },
                       { label: 'Situational Judgment', score: 85 },
                    ].map((item, i) => (
                       <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                             <span>{item.label}</span>
                             <span>{item.score}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: `${item.score}%` }} />
                          </div>
                       </div>
                    ))}
                 </div>
                 <Button variant="outline" className="w-full border-border/50 text-[10px] font-black uppercase tracking-widest h-10 group">
                    View Full Assessment <ChevronRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </CardContent>
           </Card>
        </div>

        {/* Center Column: Timeline & Interview */}
        <div className="lg:col-span-5 space-y-6">
           {/* Experience Timeline */}
           <Card className="border-border/40 glass shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Experience Timeline
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="relative border-l-2 border-primary/20 ml-4 space-y-10">
                    {[
                       { year: '2024 - Present', role: 'Executive - Marketing', company: 'Current Corp', desc: 'Leading growth initiatives and digital strategy.' },
                       { year: '2022 - 2024', role: 'Marketing Lead', company: 'GrowthX', desc: 'Scaled user acquisition by 200% YoY.' },
                       { year: '2021 - 2022', role: 'Sr. Marketing Exec.', company: 'Brand Corp', desc: 'Managed multi-channel campaigns.' },
                    ].map((job, i) => (
                       <div key={i} className="relative pl-8">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/50"></div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">{job.year}</p>
                          <h4 className="text-sm font-black text-foreground mt-1">{job.role}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{job.company}</p>
                          <p className="text-xs text-muted-foreground mt-2 font-medium line-clamp-1">{job.desc}</p>
                       </div>
                    ))}
                 </div>
                 <div className="grid grid-cols-4 gap-4 mt-10 pt-6 border-t border-border/10">
                    <div className="text-center">
                       <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Total Exp</p>
                       <p className="text-xs font-black text-foreground">3.2 Yrs</p>
                    </div>
                    <div className="text-center border-x border-border/10">
                       <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Relevant</p>
                       <p className="text-xs font-black text-foreground">2.6 Yrs</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Progression</p>
                       <p className="text-xs font-black text-emerald-500 flex items-center justify-center gap-1">High <TrendingUp className="w-3 h-3" /></p>
                    </div>
                    <div className="text-center border-l border-border/10">
                       <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Stability</p>
                       <p className="text-xs font-black text-foreground">87%</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* Interview Analysis */}
           <Card className="border-border/40 glass-dark shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-500" /> Interview Analysis
                 </CardTitle>
                 <div className="flex gap-4">
                    <div className="text-right">
                       <p className="text-[8px] font-black text-muted-foreground uppercase">Confidence</p>
                       <p className="text-[10px] font-black text-emerald-500">EXCELLENT</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-muted-foreground uppercase">Tech Depth</p>
                       <p className="text-[10px] font-black text-primary">GOOD</p>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-6">
                 <div className="grid grid-cols-4 gap-4 mb-6">
                    {['Communication', 'Confidence', 'Tech Depth', 'Problem Solving'].map((s, i) => (
                       <div key={i} className="p-3 rounded-2xl bg-muted/30 border border-border/50 text-center">
                          <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">{s}</p>
                          <p className="text-sm font-black text-foreground">{80 + i * 4}</p>
                       </div>
                    ))}
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <Activity className="w-3 h-3" /> Emotional Tone Over Time
                    </span>
                    <div className="h-[120px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={emotionalToneData}>
                             <defs>
                                <linearGradient id="colorTone" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <XAxis dataKey="time" hide />
                             <YAxis hide domain={[0, 100]} />
                             <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                             <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTone)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right Column: AI Summary & Integrity */}
        <div className="lg:col-span-3 space-y-6">
           {/* AI Summary */}
           <Card className="border-border/40 glass shadow-xl rounded-3xl overflow-hidden h-fit">
              <CardHeader className="border-b border-white/5 pb-4">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-500" /> AI Summary
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                    "Sarthak is a result-driven marketing professional with strong expertise in digital strategy, brand building, and data-driven decision making. His skillset aligns very well with the role requirements."
                 </p>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Strengths
                       </span>
                       <ul className="space-y-1.5">
                          {['Strategic Thinking', 'Data Driven Approach', 'Strong Communication'].map((s, i) => (
                             <li key={i} className="text-[10px] font-bold text-foreground flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500"></div> {s}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" /> Areas to Improve
                       </span>
                       <ul className="space-y-1.5">
                          {['Advanced Analytics', 'Technical Marketing Tools'].map((s, i) => (
                             <li key={i} className="text-[10px] font-bold text-foreground flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-amber-500"></div> {s}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* Integrity & Risk Score */}
           <Card className="border-border/40 glass-dark shadow-xl rounded-3xl overflow-hidden h-fit">
              <CardHeader className="border-b border-white/5 pb-4">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Integrity & Risk Score
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                       <span className="text-xl font-black text-emerald-500">92</span>
                       <span className="text-[8px] font-black text-emerald-500/50">/100</span>
                    </div>
                    <div>
                       <p className="text-xs font-black text-foreground uppercase tracking-widest">Low Risk</p>
                       <p className="text-[10px] text-muted-foreground font-medium">Authentication Verified</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    {[
                       { label: 'No Malpractice Detected', status: true },
                       { label: 'Consistent Behavior', status: true },
                       { label: 'High Authenticity Score', status: true },
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground">{item.label}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                       </div>
                    ))}
                 </div>
                 <Button variant="ghost" className="w-full mt-6 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                    View Details <ChevronRight className="w-3 h-3 ml-1" />
                 </Button>
              </CardContent>
           </Card>
        </div>

      </div>

      {/* 3. AI DECISION ENGINE & ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
         
         {/* Decision Rationale */}
         <Card className="lg:col-span-8 border-border/40 glass-dark shadow-2xl rounded-[2.5rem] overflow-hidden border-t-2 border-t-primary/30">
            <CardContent className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                           <Brain className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-foreground uppercase tracking-widest">AI Decision Engine</h3>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Why AI recommends Strong Hire?</p>
                        </div>
                     </div>
                     <ul className="space-y-3">
                        {[
                           'Excellent overall performance across all stages',
                           'High role fit and skill match (85%)',
                           'Strong communication and problem-solving skills',
                           'Low risk with high integrity score',
                           'Good career progress and stability'
                        ].map((item, i) => (
                           <li key={i} className="flex items-start gap-3">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-xs font-medium text-muted-foreground">{item}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div className="space-y-6 border-l border-border/10 pl-8">
                     <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Prediction Insights</h4>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-foreground">Future Performance</span>
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px]">High (92%)</Badge>
                           </div>
                           <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '92%' }} />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-foreground">Retention Probability</span>
                              <Badge className="bg-primary/10 text-primary border-none text-[10px]">High (88%)</Badge>
                           </div>
                           <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: '88%' }} />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Final Decision & Similar */}
         <div className="lg:col-span-4 space-y-6">
            <Card className="border-border/40 glass shadow-xl rounded-3xl overflow-hidden p-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Final Decision</h3>
               <div className="grid grid-cols-3 gap-3 mb-6">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex flex-col items-center justify-center h-16 rounded-2xl gap-1">
                     <UserPlus className="w-5 h-5" />
                     <span className="text-[9px] font-black uppercase">Hire</span>
                  </Button>
                  <Button variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 flex flex-col items-center justify-center h-16 rounded-2xl gap-1">
                     <PauseCircle className="w-5 h-5" />
                     <span className="text-[9px] font-black uppercase">Hold</span>
                  </Button>
                  <Button variant="outline" className="border-rose-500/50 text-rose-500 hover:bg-rose-500/10 flex flex-col items-center justify-center h-16 rounded-2xl gap-1">
                     <XCircle className="w-5 h-5" />
                     <span className="text-[9px] font-black uppercase">Reject</span>
                  </Button>
               </div>
               <textarea 
                  className="w-full h-20 bg-muted/30 border border-border/50 rounded-2xl p-4 text-xs font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Add Decision Note..."
               ></textarea>
            </Card>

            <Card className="border-border/40 glass-dark shadow-xl rounded-3xl overflow-hidden p-6">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Similar Candidates</h3>
                  <Button variant="link" className="text-[10px] font-black uppercase p-0 h-fit text-primary">Compare All</Button>
               </div>
               <div className="flex items-center gap-3">
                  {[1, 2, 3].map((i) => (
                     <div key={i} className="w-10 h-10 rounded-full bg-muted border border-border/50 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate${i}`} alt="Sim" className="w-full h-full object-cover" />
                     </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                     +12
                  </div>
               </div>
            </Card>
         </div>

      </div>

    </div>
  );
}
