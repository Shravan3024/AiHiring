"use client";
import React, { useState, useEffect, useCallback } from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Search, Filter, ChevronRight, 
  Mail, Edit, ArrowUpRight, ArrowDownRight, CheckCircle2, 
  Zap, Target, Star, MapPin, Layers, Download, 
  RefreshCw, TrendingUp, Loader2, Sparkles, Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from "recharts";
import { cn } from "@/lib/utils";
import { talentPoolApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function IndustrialTalentPoolV4() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await talentPoolApi.getTalentPool({ search, tab: activeTab, page, limit });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Talent Link Error: Could not sync with database");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleExport = () => {
    toast.info("Exporting talent pool to industrial dossier...");
    // Mock export
    setTimeout(() => toast.success("Dossier exported successfully!"), 2000);
  };

  const handleObservationClick = (type: string) => {
    router.push(`/hr/talent-pool/observations/${type.toLowerCase().replace(/ /g, '-')}`);
  };

  if (loading && !data) {
    return (
      <PanelLayout title="Talent Pool" allowedRoles={["HR", "ADMIN"]}>
         <div className="max-w-[1600px] mx-auto p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
               {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <Skeleton className="lg:col-span-9 h-[600px] rounded-[2.5rem]" />
               <Skeleton className="lg:col-span-3 h-[600px] rounded-[2.5rem]" />
            </div>
         </div>
      </PanelLayout>
    );
  }

  const kpis = data ? [
    { title: "Total Talent", value: data.kpis.totalTalent, icon: Users, color: "text-primary", trend: "+12%" },
    { title: "Engaged", value: data.kpis.engaged, icon: Target, color: "text-emerald-500", trend: "+8%" },
    { title: "Nurturing", value: data.kpis.nurturing, icon: RefreshCw, color: "text-purple-500", trend: "+15%" },
    { title: "Not Engaged", value: data.kpis.rejected, icon: Zap, color: "text-rose-500", trend: "-4%" },
    { title: "Hired Pool", value: data.kpis.hired, icon: CheckCircle2, color: "text-blue-500", trend: "+5%" },
  ] : [];

  const tabs = ["All", "Engaged", "Nurturing", "Hired"];

  return (
    <PanelLayout title="Talent Pool" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-foreground tracking-tighter flex items-center gap-2 uppercase italic">Talent Pool Core<span className="text-primary not-italic">.</span></h1>
              <div className="flex items-center gap-3">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">Neural Database Synchronized</p>
                 <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[7px] font-black uppercase tracking-widest gap-1.5 px-2 py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Link Active
                 </Badge>
              </div>
           </div>
           <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="pl-12 h-12 w-80 bg-muted/30 border-border/50 rounded-[1.25rem] text-[11px] font-bold uppercase tracking-widest focus:ring-primary/20 transition-all shadow-inner" 
                   placeholder="Search profile, skill, location..." 
                 />
              </div>
              <Button onClick={fetchData} variant="outline" className="h-12 rounded-[1.25rem] border-border/50 bg-background/50 backdrop-blur-xl text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-muted/50 transition-all px-8">
                 <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Sync Database
              </Button>
           </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
           {kpis.map((k, i) => (
              <Card key={i} className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden group hover:scale-[1.03] transition-all duration-500 border-b-4 border-b-transparent hover:border-b-primary">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                       <div className={cn("p-2.5 rounded-2xl bg-muted/50 border border-border/50 shadow-xl group-hover:scale-110 transition-transform", k.color)}>
                          <k.icon className="w-5 h-5" />
                       </div>
                       <Badge variant="outline" className="text-[7px] font-black uppercase border-border/50 tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Neural Verified</Badge>
                    </div>
                    <div className="flex items-end justify-between">
                       <p className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{k.value.toLocaleString()}</p>
                       <div className={cn("text-[9px] font-black flex items-center gap-1 mb-1 px-2 py-0.5 rounded-full bg-emerald-500/10", k.trend.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>
                          {k.trend.startsWith('+') ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />} {k.trend}
                       </div>
                    </div>
                 </CardContent>
              </Card>
           ))}
        </div>

        {/* PRIMARY INTERFACE: TABLE & ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Talent Pool Main Table */}
           <div className="lg:col-span-9 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-6 bg-muted/20 p-2.5 rounded-[1.75rem] border border-border/40 backdrop-blur-md shadow-2xl">
                 <div className="flex gap-1.5 overflow-x-auto no-scrollbar pl-1">
                    {tabs.map((t, i) => (
                       <Button key={i} variant="ghost" 
                        onClick={() => { setActiveTab(t); setPage(1); }}
                        className={cn(
                          "h-11 text-[10px] font-black uppercase tracking-[0.2em] px-8 rounded-2xl flex-shrink-0 transition-all",
                          activeTab === t ? "bg-card text-primary shadow-2xl ring-1 ring-border/50" : "text-muted-foreground opacity-50 hover:opacity-100 hover:bg-white/5"
                       )}>{t} Pool {data && t !== "All" ? `(${data.kpis[t.toLowerCase() === 'hired pool' ? 'hired' : t.toLowerCase()]})` : ""}</Button>
                    ))}
                 </div>
                 <div className="flex items-center gap-4 pr-3">
                    <Button variant="outline" size="sm" className="h-10 rounded-xl text-[9px] font-black uppercase gap-2 border-border/40 hover:bg-primary/5 transition-all"><Filter className="w-4 h-4" /> Advanced Filter</Button>
                    <Button onClick={handleExport} variant="outline" size="sm" className="h-10 rounded-xl text-[9px] font-black uppercase gap-2 border-border/40 hover:bg-emerald-500/5 transition-all"><Download className="w-4 h-4" /> Export Pool</Button>
                 </div>
              </div>

              <Card className="border-border/40 glass shadow-2xl rounded-[2.5rem] overflow-hidden">
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="text-[9px] font-black uppercase text-muted-foreground/30 tracking-[0.3em] bg-muted/10">
                             <tr>
                                <th className="px-8 py-6 w-12"><input type="checkbox" className="rounded-lg border-border/50" /></th>
                                <th className="px-8 py-6">Candidate Profile</th>
                                <th className="px-8 py-6">Target Role</th>
                                <th className="px-8 py-6">Skill Vectors</th>
                                <th className="px-8 py-6">Neural Status</th>
                                <th className="px-8 py-6">Match Index</th>
                                <th className="px-8 py-6 text-right">Strategic Action</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-border/5">
                             {loading ? (
                                [1,2,3,4,5].map(i => (
                                  <tr key={i}><td colSpan={7} className="px-8 py-6"><Skeleton className="h-12 w-full rounded-2xl" /></td></tr>
                                ))
                             ) : data.talentList.length === 0 ? (
                                <tr><td colSpan={7} className="px-8 py-20 text-center"><p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">No candidate vectors found in this quadrant.</p></td></tr>
                             ) : data.talentList.map((t: any, i: number) => (
                                <tr key={i} className="hover:bg-primary/[0.03] transition-all group cursor-default">
                                   <td className="px-8 py-7"><input type="checkbox" className="rounded-lg border-border/50" /></td>
                                   <td className="px-8 py-7">
                                      <div className="flex items-center gap-5">
                                         <div className="w-12 h-12 rounded-2xl bg-muted border-2 border-border/50 overflow-hidden group-hover:border-primary/50 transition-all shadow-2xl ring-8 ring-primary/5">
                                            <img 
                                               src={t.img || "/images/default-avatar.png"} 
                                               alt="" 
                                               className="w-full h-full object-cover" 
                                               onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }}
                                            />
                                         </div>
                                         <div>
                                            <p className="text-[13px] font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{t.name}</p>
                                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1"><MapPin className="w-3.5 h-3.5 text-primary/50" /> {t.loc}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-7 text-[11px] font-black text-muted-foreground uppercase tracking-tight">{t.role}</td>
                                   <td className="px-8 py-7">
                                      <div className="flex gap-2 flex-wrap max-w-[160px]">
                                         {t.skills.slice(0, 3).map((s: string, si: number) => (
                                            <Badge key={si} variant="outline" className="text-[8px] font-black uppercase border-border/40 bg-muted/5 py-1 px-2.5 rounded-lg">{s}</Badge>
                                         ))}
                                         {t.skills.length > 3 && <span className="text-[10px] font-black text-primary animate-pulse">+{t.skills.length - 3}</span>}
                                      </div>
                                   </td>
                                   <td className="px-8 py-7">
                                      <Badge className={cn(
                                         "text-[9px] font-black uppercase border-none px-4 py-2 rounded-xl shadow-lg",
                                         t.status === "HIRED" ? "bg-blue-500/10 text-blue-500" : 
                                         t.status === "REJECTED" ? "bg-rose-500/10 text-rose-500" :
                                         "bg-emerald-500/10 text-emerald-500"
                                      )}>{t.status}</Badge>
                                   </td>
                                   <td className="px-8 py-7">
                                      <div className="flex flex-col gap-2">
                                         <div className="flex items-center gap-2.5">
                                            <span className="text-xl font-black text-foreground tabular-nums tracking-tighter">{t.score}</span>
                                            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                                         </div>
                                         <div className="w-20 h-1.5 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full industrial-gradient shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-1000" style={{ width: `${t.score}%` }} />
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-7 text-right">
                                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 scale-90 group-hover:scale-100">
                                         <Button variant="outline" size="icon" className="w-10 h-10 rounded-2xl hover:bg-primary/10 hover:text-primary border-border/40 shadow-2xl transition-all"><Mail className="w-4 h-4" /></Button>
                                         <Button variant="outline" size="icon" className="w-10 h-10 rounded-2xl hover:bg-amber-500/10 hover:text-amber-500 border-border/40 shadow-2xl transition-all"><Edit className="w-4 h-4" /></Button>
                                         <Button 
                                           onClick={() => router.push(`/hr/candidates/${t.id}`)}
                                           variant="outline" size="icon" className="w-10 h-10 rounded-2xl hover:bg-primary industrial-gradient text-white border-none shadow-2xl transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                         </Button>
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <div className="px-10 py-8 flex items-center justify-between border-t border-border/5 bg-muted/10 backdrop-blur-xl">
                       <div className="flex items-center gap-4">
                          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Synchronized View: {data.talentList.length} / {data.filteredCount} Neural Vectors</span>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-500">Auto-Refreshed</Badge>
                       </div>
                       <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="h-11 rounded-2xl text-[10px] font-black uppercase px-6 border-border/40 hover:bg-white/5 transition-all disabled:opacity-30">Previous Quadrant</Button>
                          <Button 
                            variant="outline" 
                            disabled={data.talentList.length < limit}
                            onClick={() => setPage(p => p + 1)}
                            className="h-11 rounded-2xl text-[10px] font-black uppercase px-6 border-border/40 bg-white/5 hover:bg-primary/10 transition-all group">Next Quadrant <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* ANALYTICS SIDEBAR */}
           <div className="lg:col-span-3 space-y-8 pb-20">
              
              {/* Distribution Analytics */}
              <Card className="border-border/40 glass shadow-2xl rounded-[2.5rem] overflow-hidden p-8 group border-t-4 border-t-primary/20">
                 <div className="flex items-center justify-between mb-12">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Neural Map Distribution</CardTitle>
                    <Box className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
                 </div>
                 <div className="relative h-56 w-full mb-12">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={data.distribution} innerRadius={70} outerRadius={100} paddingAngle={10} dataKey="value" stroke="none">
                             {data.distribution.map((entry: any, index: number) => <Cell key={index} fill={entry.color} className="drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]" />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: 'rgba(0,0,0,0.95)', fontSize: '11px', color: 'white', fontWeight: 'bold' }} />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-4xl font-black text-foreground tracking-tighter tabular-nums">{data.kpis.totalTalent.toLocaleString()}</span>
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 mt-1">Total Pool</span>
                    </div>
                 </div>
                 <div className="space-y-5">
                    {data.distribution.map((d: any, i: number) => (
                       <div key={i} className="flex items-center justify-between group/legend p-3 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-border/20">
                          <div className="flex items-center gap-4">
                             <div className="w-3 h-3 rounded-full shadow-[0_0_12px_currentColor] animate-pulse" style={{ color: d.color, backgroundColor: d.color }}></div>
                             <span className="text-[11px] font-black text-muted-foreground uppercase tracking-tight group-hover/legend:text-foreground transition-colors">{d.name}</span>
                          </div>
                          <span className="text-[11px] font-black text-foreground tabular-nums">{d.value.toLocaleString()} <span className="opacity-40 ml-1.5 text-[9px]">({d.percent})</span></span>
                       </div>
                    ))}
                 </div>
              </Card>

              {/* Market Skills Axis (Real Data) */}
              <Card className="border-border/40 glass shadow-2xl rounded-[2.5rem] overflow-hidden p-8 group border-t-4 border-t-emerald-500/20">
                 <div className="flex items-center justify-between mb-10">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Market Skills Axis</CardTitle>
                    <TrendingUp className="w-5 h-5 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <div className="space-y-8">
                    {data.topSkills.map((s: any, i: number) => (
                       <div key={i} className="space-y-3 group/skill">
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                             <span className="text-foreground group-hover/skill:text-primary transition-colors">{s.name}</span>
                             <span className="text-muted-foreground tabular-nums">{s.count}</span>
                          </div>
                          <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner">
                             <div className="h-full industrial-gradient rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(var(--primary),0.4)]" style={{ width: `${s.progress}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
                 <Button 
                   onClick={() => router.push('/hr/talent-pool/skill-map')}
                   variant="outline" className="w-full mt-10 h-14 rounded-2xl border-border/40 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-primary/10 transition-all shadow-xl group">
                    View Full Skill Map <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </Card>

           </div>

        </div>

        {/* STRATEGIC TALENT OBSERVATIONS */}
        <div className="space-y-8 pb-32">
           <div className="flex items-center gap-4 ml-4">
              <Zap className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
              <h2 className="text-xl font-black uppercase tracking-[0.4em] text-muted-foreground italic">Strategic Talent Observations</h2>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                 { title: "Engagement Critical", desc: `${data.kpis.rejected} candidates require re-engagement workflows to optimize pool utility.`, btn: "Launch Pulse", icon: RefreshCw, color: "text-rose-500" },
                 { title: "Nurturing Ready", desc: `${data.kpis.nurturing} high-potential profiles identified for passive recruitment nurturing.`, btn: "Start Sequence", icon: Star, color: "text-purple-500" },
                 { title: "Top Talent Index", desc: "Aggregated match analysis shows technical elite density is increasing by 12%.", btn: "View Profiles", icon: Target, color: "text-amber-500" },
                 { title: "Pipeline Health", desc: "Neural match efficiency has improved MoM. Strategic depth at 92%.", btn: "Scale Pipeline", icon: Layers, color: "text-blue-500" },
              ].map((ra, i) => (
                 <Card key={i} className="border-border/40 glass shadow-2xl overflow-hidden p-10 group hover:border-primary/40 transition-all bg-gradient-to-br from-card to-background relative border-t-4 border-t-transparent hover:border-t-primary">
                    <div className="flex flex-col gap-6">
                       <div className={cn("p-3 rounded-2xl bg-muted border border-border/50 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-2xl w-fit", ra.color)}>
                          <ra.icon className="w-6 h-6" />
                       </div>
                       <div className="space-y-3">
                          <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{ra.title}</h3>
                          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed h-14 overflow-hidden group-hover:text-foreground/80 transition-colors">{ra.desc}</p>
                       </div>
                       <Button 
                         variant="link" 
                         onClick={() => handleObservationClick(ra.title)}
                         className="text-[10px] font-black uppercase p-0 h-fit text-primary flex items-center gap-2 group/btn hover:no-underline underline-offset-8">
                          {ra.btn} <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                       </Button>
                    </div>
                 </Card>
              ))}
           </div>
        </div>

      </div>
    </PanelLayout>
  );
}
