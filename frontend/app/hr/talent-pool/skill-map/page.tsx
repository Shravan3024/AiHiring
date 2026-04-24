"use client";
// Force rebuild for route discovery
import React, { useState, useEffect } from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Globe, Database, Target, ChevronRight, 
  Search, Filter, RefreshCw, Box, Layers, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { talentPoolApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkillMapStrategicView() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await talentPoolApi.getTalentPool();
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (loading || !data) {
    return (
      <PanelLayout title="Skill Map" allowedRoles={["HR", "ADMIN"]}>
        <div className="p-8 space-y-8">
           <Skeleton className="h-12 w-64" />
           <div className="grid grid-cols-2 gap-8">
              <Skeleton className="h-[400px] rounded-3xl" />
              <Skeleton className="h-[400px] rounded-3xl" />
           </div>
        </div>
      </PanelLayout>
    );
  }

  const radarData = data.topSkills.map((s: any) => ({
    subject: s.name,
    A: s.count,
    fullMark: data.kpis.totalTalent
  }));

  return (
    <PanelLayout title="Global Skill Matrix" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="p-0 hover:bg-transparent text-muted-foreground hover:text-primary gap-2 text-[10px] font-black uppercase tracking-widest mb-4">
                 <ArrowLeft className="w-4 h-4" /> Back to Talent Pool
              </Button>
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Strategic Skill Map<span className="text-primary not-italic">.</span></h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Full Neural Density Mapping of Internal Talent Pool</p>
           </div>
           <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-4 py-2">
              Neural Link: Active
           </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           <Card className="border-border/40 glass shadow-2xl rounded-[2.5rem] overflow-hidden p-8">
              <CardHeader className="px-0 pt-0 mb-8">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Skill Supply Index
                 </CardTitle>
              </CardHeader>
              <CardContent className="px-0 h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topSkills} layout="vertical" margin={{ left: 40 }}>
                       <XAxis type="number" hide />
                       <YAxis 
                         dataKey="name" 
                         type="category" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 'black', fill: 'hsl(var(--foreground))' }} 
                       />
                       <Tooltip 
                         cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                         contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                       />
                       <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={30}>
                          {data.topSkills.map((entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           <Card className="border-border/40 glass shadow-2xl rounded-[2.5rem] overflow-hidden p-8">
              <CardHeader className="px-0 pt-0 mb-8">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-500" /> Competency Radar
                 </CardTitle>
              </CardHeader>
              <CardContent className="px-0 h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                       <PolarGrid stroke="rgba(255,255,255,0.1)" />
                       <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))' }} />
                       <PolarRadiusAxis hide />
                       <Radar
                         name="Supply"
                         dataKey="A"
                         stroke="hsl(var(--primary))"
                         fill="hsl(var(--primary))"
                         fillOpacity={0.4}
                       />
                    </RadarChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {data.topSkills.map((s: any, i: number) => (
              <Card key={i} className="border-border/40 glass shadow-2xl rounded-3xl p-6 group hover:border-primary/30 transition-all">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{s.name}</h3>
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase">{s.progress}% Depth</Badge>
                 </div>
                 <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                    Detected in {s.count} unique candidate profiles through semantic content scanning.
                 </p>
              </Card>
           ))}
        </div>

      </div>
    </PanelLayout>
  );
}
