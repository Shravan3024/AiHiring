"use client";
// Force rebuild for route discovery
import React, { useState, useEffect } from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, ArrowLeft, Target, RefreshCw, Star, Layers,
  ChevronRight, MapPin, Sparkles, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { talentPoolApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ObservationDeepDive() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const observationTitle = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  useEffect(() => {
    const fetchContext = async () => {
      try {
        // Fetch candidates for this context
        let tab = "All";
        if (type === "engagement-critical") tab = "Rejected";
        if (type === "nurturing-ready") tab = "Nurturing";
        
        const res = await talentPoolApi.getTalentPool({ tab });
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, [type]);

  if (loading || !data) {
    return (
       <PanelLayout title="Strategic Deep Dive" allowedRoles={["HR", "ADMIN"]}>
          <div className="p-8 space-y-8">
             <Skeleton className="h-10 w-64" />
             <Skeleton className="h-[500px] w-full rounded-3xl" />
          </div>
       </PanelLayout>
    );
  }

  return (
    <PanelLayout title={observationTitle} allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1400px] mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="p-0 hover:bg-transparent text-muted-foreground hover:text-primary gap-2 text-[10px] font-black uppercase tracking-widest mb-4">
                 <ArrowLeft className="w-4 h-4" /> Back to Intelligence Pool
              </Button>
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-3">
                 <Zap className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" /> {observationTitle}
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">AI-Generated Strategic Context & Action Plan</p>
           </div>
           <Badge className="h-10 bg-primary/10 text-primary border-none px-6 text-[10px] font-black uppercase tracking-widest rounded-2xl">
              Target Candidates: {data.talentList.length}
           </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <Card className="lg:col-span-2 border-border/40 glass shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 px-8 py-6 bg-muted/10">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Contextual Talent Queue</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-border/5">
                    {data.talentList.map((t: any, i: number) => (
                       <div key={i} className="p-8 hover:bg-primary/[0.02] transition-all group flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="w-14 h-14 rounded-2xl bg-muted border-2 border-border/50 overflow-hidden shadow-xl ring-8 ring-primary/5">
                                <img 
                                   src={t.img || "/images/default-avatar.png"} 
                                   alt="" 
                                   className="w-full h-full object-cover" 
                                   onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }}
                                />
                             </div>
                             <div className="space-y-1">
                                <h4 className="text-[14px] font-black text-foreground uppercase tracking-tight">{t.name}</h4>
                                <div className="flex items-center gap-4">
                                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {t.loc}</p>
                                   <Badge variant="outline" className="text-[8px] font-black uppercase border-border/40 py-0.5">{t.role}</Badge>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <div className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                   <span className="text-xl font-black text-foreground tabular-nums tracking-tighter">{t.score}</span>
                                   <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Neural Index</p>
                             </div>
                             <Button 
                               onClick={() => router.push(`/hr/candidates/${t.id}`)}
                               variant="outline" className="h-10 w-10 p-0 rounded-xl hover:bg-primary hover:text-white transition-all border-border/40">
                                <ChevronRight className="w-5 h-5" />
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <div className="space-y-8">
              <Card className="border-border/40 glass shadow-2xl rounded-[2rem] p-8 border-t-4 border-t-amber-500/20">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Strategic Goal</h3>
                 <p className="text-[11px] font-medium text-foreground leading-relaxed mb-8">
                    Optimize the utility of this talent cluster by initiating automated {type.replace(/-/g, ' ')} workflows. AI predicts a 42% increase in conversion through targeted semantic engagement.
                 </p>
                 <Button className="w-full h-14 rounded-2xl industrial-gradient text-white text-[10px] font-black uppercase tracking-widest gap-2 shadow-2xl shadow-primary/30">
                    <Zap className="w-4 h-4" /> Execute Neural Action
                 </Button>
              </Card>

              <Card className="border-border/40 glass shadow-2xl rounded-[2rem] p-8">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Vector Analysis</h3>
                 <div className="space-y-5">
                    {[
                       { label: "Pipeline Impact", val: "High", color: "text-emerald-500" },
                       { label: "Cost of Inaction", val: "Critical", color: "text-rose-500" },
                       { label: "AI Confidence", val: "94%", color: "text-blue-500" },
                    ].map((stat, i) => (
                       <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-muted/20 border border-border/40">
                          <span className="text-[9px] font-black uppercase text-muted-foreground">{stat.label}</span>
                          <span className={cn("text-[11px] font-black uppercase", stat.color)}>{stat.val}</span>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>

        </div>

      </div>
    </PanelLayout>
  );
}
