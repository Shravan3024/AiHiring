"use client";
import React from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, PieChart, Pie
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Brain, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateVisualAnalyticsProps {
  profileData: any;
}

export default function CandidateVisualAnalytics({ profileData }: CandidateVisualAnalyticsProps) {
  // Mock skill data derived from profile or AI analysis
  const skillData = [
    { subject: 'Technical', A: profileData?.aiScore || 75, fullMark: 100 },
    { subject: 'Soft Skills', A: 82, fullMark: 100 },
    { subject: 'Integrity', A: profileData?.integrityScore || 90, fullMark: 100 },
    { subject: 'Experience', A: 65, fullMark: 100 },
    { subject: 'Cultural Fit', A: 88, fullMark: 100 },
    { subject: 'Problem Solving', A: profileData?.aiScore ? Math.min(100, profileData.aiScore + 10) : 80, fullMark: 100 },
  ];

  const pipelineData = [
    { name: 'Applied', value: 100, fill: '#64748b' },
    { name: 'Screening', value: 85, fill: '#3b82f6' },
    { name: 'Technical', value: 70, fill: '#8b5cf6' },
    { name: 'Interview', value: 40, fill: '#d946ef' },
    { name: 'Final', value: 15, fill: '#10b981' },
  ];

  const sentimentData = [
    { name: 'Positive', value: 75, color: '#10b981' },
    { name: 'Neutral', value: 20, color: '#f59e0b' },
    { name: 'Negative', value: 5, color: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700">
      {/* Skill Radar Chart */}
      <Card className="border-border/40 shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="border-b border-border/10 pb-4">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Skill Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 h-[300px]">
          <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Candidate"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.5}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      <Card className="border-border/40 shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="border-b border-border/10 pb-4">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Behavioral Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 h-[300px] flex flex-col items-center justify-center">
          <div className="w-full h-[200px]">
            <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4">
            {sentimentData.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] font-black uppercase text-muted-foreground">{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Progression */}
      <Card className="border-border/40 shadow-xl rounded-lg overflow-hidden md:col-span-2">
        <CardHeader className="border-b border-border/10 pb-4">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Pipeline Conversion Velocity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 h-[300px]">
          <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 'bold' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 10 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Integrity & Risk Indicators */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
            <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Authentication</h4>
            <p className="text-xl font-black text-foreground mt-1">VERIFIED</p>
         </div>
         <div className="p-5 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center text-center">
            <Brain className="w-8 h-8 text-primary mb-2" />
            <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">AI Confidence</h4>
            <p className="text-xl font-black text-foreground mt-1">{profileData?.aiScore || 85}%</p>
         </div>
         <div className="p-5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center text-center">
            <Award className="w-8 h-8 text-amber-500 mb-2" />
            <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Fit Benchmark</h4>
            <p className="text-xl font-black text-foreground mt-1">TOP 5%</p>
         </div>
      </div>
    </div>
  );
}
