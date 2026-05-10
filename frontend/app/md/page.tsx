"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Users, TrendingUp, Target, CheckCircle2, Clock, AlertCircle,
  ArrowUpRight, ArrowDownRight, Brain, Zap, Shield, Star,
  BarChart3, Activity, ChevronRight, RefreshCw, Download,
  DollarSign, Briefcase, Calendar, Building2, CheckCircle, XCircle, X, Loader2
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const AreaChart  = dynamic(() => import("recharts").then(m => m.AreaChart),  { ssr: false });
const Area       = dynamic(() => import("recharts").then(m => m.Area),       { ssr: false });
const XAxis      = dynamic(() => import("recharts").then(m => m.XAxis),      { ssr: false });
const YAxis      = dynamic(() => import("recharts").then(m => m.YAxis),      { ssr: false });
const Tooltip    = dynamic(() => import("recharts").then(m => m.Tooltip),    { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const PieChart   = dynamic(() => import("recharts").then(m => m.PieChart),   { ssr: false });
const Pie        = dynamic(() => import("recharts").then(m => m.Pie),        { ssr: false });
const Cell       = dynamic(() => import("recharts").then(m => m.Cell),       { ssr: false });

const COLORS = ["#0ea5e9", "#14b8a6", "#8b5cf6", "#f59e0b", "#f43f5e"];

import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MDCommandCenter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ app: any; action: 'APPROVED' | 'REJECTED' } | null>(null);

  const { data: appsRaw = [], refetch: refetchApps } = useQuery({
    queryKey: ["md-applications"],
    queryFn: async () => (await api.get("/md/applications")).data,
    refetchInterval: 30_000,
  });
  const { data: analytics = {} as any, refetch: refetchAnalytics } = useQuery({
    queryKey: ["md-analytics"],
    queryFn: async () => (await api.get("/md/analytics")).data,
    refetchInterval: 30_000,
  });
  const { data: top = [] as any[], refetch: refetchTop } = useQuery({
    queryKey: ["md-top-candidates"],
    queryFn: async () => (await api.get("/md/top-candidates")).data,
    refetchInterval: 30_000,
  });

  const { mutate: makeDecision, isPending: isDeciding } = useMutation({
    mutationFn: (data: { application_id: number; decision: 'APPROVED' | 'REJECTED' }) =>
      api.post('/md/decision', data),
    onSuccess: (res) => {
      const d = res.data;
      toast.success(d.decision === 'APPROVED'
        ? `✅ ${d.candidateName} recommended to HR`
        : `❌ ${d.candidateName} rejected for HR review`);
      setConfirmDialog(null);
      queryClient.invalidateQueries({ queryKey: ['md-applications'] });
      queryClient.invalidateQueries({ queryKey: ['md-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['md-top-candidates'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Decision failed'),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchApps(), refetchAnalytics(), refetchTop()]);
    setRefreshing(false);
  };

  const apps: any[] = Array.isArray(appsRaw) ? appsRaw : [];
  const topList: any[] = Array.isArray(top) ? top : [];

  const kpis = [
    { label: "Total Pipeline", value: analytics.totalApplications ?? apps.length, icon: Users, color: "text-primary", bg: "bg-primary/10", trend: "+12%", up: true },
    { label: "Shortlisted", value: analytics.shortlisted ?? 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+8%", up: true },
    { label: "Pending Review", value: analytics.pendingReview ?? 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", trend: "-3%", up: false },
    { label: "Selected", value: analytics.selected ?? 0, icon: Star, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+15%", up: true },
    { label: "Avg AI Score", value: `${Math.round(analytics.avgAiScore ?? 0)}`, icon: Brain, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+4.2%", up: true },
    { label: "Offer Rate", value: `${Math.round(analytics.offerRate ?? 0)}%`, icon: Target, color: "text-cyan-500", bg: "bg-cyan-500/10", trend: "+6%", up: true },
  ];

  const funnelData = analytics.funnel ?? [
    { stage: "Applied", count: apps.length },
    { stage: "Screened", count: Math.floor(apps.length * 0.6) },
    { stage: "Assessment", count: Math.floor(apps.length * 0.4) },
    { stage: "Interview", count: Math.floor(apps.length * 0.25) },
    { stage: "Selected", count: analytics.selected ?? 0 },
  ];

  const trendData = analytics.trendData ?? [
    { month: "Jan", apps: 12, hires: 2 }, { month: "Feb", apps: 18, hires: 3 },
    { month: "Mar", apps: 15, hires: 2 }, { month: "Apr", apps: 22, hires: 4 },
    { month: "May", apps: apps.length, hires: analytics.selected ?? 0 },
  ];

  const deptData = analytics.departments ?? [
    { name: "Engineering", value: 35 }, { name: "Marketing", value: 20 },
    { name: "Sales", value: 25 }, { name: "Operations", value: 20 },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      SELECTED: "bg-emerald-500/10 text-emerald-500",
      OFFER_SENT: "bg-blue-500/10 text-blue-500",
      REJECTED: "bg-rose-500/10 text-rose-500",
      INTERVIEW_COMPLETED: "bg-purple-500/10 text-purple-500",
      HR_REVIEW: "bg-amber-500/10 text-amber-500",
      OFFERED: "bg-blue-500/10 text-blue-500",
      HIRED: "bg-emerald-500/10 text-emerald-500",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  return (
    <PanelLayout title="Command Center" allowedRoles={["MD"]}>
      <div className="max-w-[1600px] mx-auto space-y-4 p-3 md:p-5 animate-in fade-in duration-500">

        {/* 2-STEP CONFIRMATION DIALOG */}
        <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
          <DialogContent className="max-w-lg bg-white border-slate-100 rounded-xl shadow-2xl p-0 overflow-hidden">
            <div className={cn("px-6 py-4 border-b", confirmDialog?.action === 'APPROVED' ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100")}>
              <DialogHeader>
                <DialogTitle className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  {confirmDialog?.action === 'APPROVED' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                  {confirmDialog?.action === 'APPROVED' ? 'Confirm Recommendation' : 'Confirm Rejection'}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Step 2 of 2 — Verification Required</DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className={cn("p-4 rounded-lg border", confirmDialog?.action === 'APPROVED' ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100")}>
                <p className="text-xs text-slate-600">
                  {confirmDialog?.action === 'APPROVED'
                    ? <>Do you really want to <span className="font-black text-emerald-700">recommend</span> candidate <span className="font-black text-slate-900">{confirmDialog?.app?.candidateName || confirmDialog?.app?.name}</span> to HR?</>
                    : <>Do you really want to <span className="font-black text-rose-700">reject</span> candidate <span className="font-black text-slate-900">{confirmDialog?.app?.candidateName || confirmDialog?.app?.name}</span> for HR review?</>}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div><span className="text-slate-400 font-bold">Name:</span><span className="text-slate-700 font-bold block">{confirmDialog?.app?.candidateName || '—'}</span></div>
                <div><span className="text-slate-400 font-bold">Email:</span><span className="text-slate-700 block">{confirmDialog?.app?.candidateEmail || confirmDialog?.app?.candidate?.email || '—'}</span></div>
                <div><span className="text-slate-400 font-bold">Position:</span><span className="text-slate-700 font-bold block">{confirmDialog?.app?.jobTitle || confirmDialog?.app?.position || '—'}</span></div>
                <div><span className="text-slate-400 font-bold">AI Score:</span><span className="text-primary font-bold block">{Math.round(confirmDialog?.app?.aiScore || 0)}%</span></div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-700">This is a recommendation only. HR is the final authority for candidate selection and offer process.</p>
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex sm:justify-between gap-3">
              <Button variant="outline" className="flex-1 h-11 font-black uppercase text-[10px] tracking-widest" onClick={() => setConfirmDialog(null)} disabled={isDeciding}>Cancel</Button>
              <Button className={cn("flex-1 h-11 text-white font-black uppercase text-[10px] tracking-widest gap-2", confirmDialog?.action === 'APPROVED' ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500")} onClick={() => makeDecision({ application_id: confirmDialog?.app?.applicationId || confirmDialog?.app?.id, decision: confirmDialog?.action as 'APPROVED' | 'REJECTED' })} disabled={isDeciding}>
                {isDeciding ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmDialog?.action === 'APPROVED' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {confirmDialog?.action === 'APPROVED' ? 'Confirm Recommendation' : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-1">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight uppercase flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary" /> Command Center
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}
              className="h-8 rounded-md border-border/50 text-[10px] font-bold uppercase tracking-wider px-3 gap-1.5 bg-white shadow-sm">
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
              {refreshing ? "Syncing..." : "Refresh"}
            </Button>
            <Button variant="outline" className="h-8 rounded-md border-border/50 text-[10px] font-bold uppercase tracking-wider px-3 gap-1.5 bg-white shadow-sm">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {kpis.map((k, i) => (
            <Card key={i} className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("p-1.5 rounded-md border border-border/50", k.bg, k.color)}>
                    <k.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className={cn("text-[9px] font-bold flex items-center gap-0.5 tracking-wider", k.up ? "text-emerald-500" : "text-rose-500")}>
                    {k.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {k.trend}
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground tabular-nums leading-none mb-1 mt-3">{k.value}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ROW 2: TREND + FUNNEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card className="lg:col-span-7 border-border/40 bg-white shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-border/40 px-4 py-2.5 flex flex-row items-center justify-between bg-muted/20">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" /> Hiring Velocity
              </CardTitle>
              <Badge variant="secondary" className="text-[8px] font-bold uppercase px-1.5 py-0 bg-white shadow-sm border border-border/50">Live</Badge>
            </CardHeader>
            <CardContent className="p-4 h-[200px]">
              <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="hiresGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '10px', padding: '4px 8px', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey="apps" name="Applications" stroke="#0ea5e9" fill="url(#appsGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="hires" name="Hires" stroke="#14b8a6" fill="url(#hiresGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            <Card className="border-border/40 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-border/40 px-4 py-2 bg-muted/20">
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-500" /> Capability Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {funnelData.slice(0, 4).map((f: any, i: number) => {
                  const pct = funnelData[0]?.count > 0 ? Math.round((f.count / funnelData[0].count) * 100) : 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
                        <span className="text-muted-foreground">{f.stage}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground tabular-nums">{f.count}</span>
                          <span className="text-primary">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-border/40 px-4 py-2 bg-muted/20">
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" /> Department Mix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 h-[90px]">
                <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptData} dataKey="value" nameKey="name" innerRadius={25} outerRadius={40} paddingAngle={2}>
                      {deptData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ROW 3: TOP CANDIDATES + PIPELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-8">

          {/* Elite Tier */}
          <Card className="lg:col-span-4 border-border/40 bg-white shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-border/40 px-4 py-2.5 flex flex-row items-center justify-between bg-muted/20">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Elite Talent Tier
              </CardTitle>
              <Button variant="link" onClick={() => router.push('/md/applications')}
                className="text-[9px] font-bold uppercase p-0 h-fit text-muted-foreground hover:text-primary">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {topList.length > 0 ? topList.slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/md/applications/${c.id}`)}>
                    <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 shadow-sm border border-border/40",
                      i === 0 ? "bg-amber-50 text-amber-600" : i === 1 ? "bg-slate-50 text-slate-600" :
                      i === 2 ? "bg-orange-50 text-orange-600" : "bg-muted/50 text-muted-foreground")}>#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-foreground uppercase tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                        {c.name || c.candidateName}
                      </p>
                      <p className="text-[8px] font-medium text-muted-foreground truncate">{c.position || c.jobTitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-bold text-primary leading-none">{Math.round(c.aiScore || c.ai_score || 0)}</p>
                      <p className="text-[7px] font-medium text-muted-foreground uppercase mt-0.5">Score</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center text-[10px] font-bold text-muted-foreground/60 uppercase">No candidates yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Table */}
          <Card className="lg:col-span-8 border-border/40 bg-white shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-border/40 px-4 py-2.5 flex flex-row items-center justify-between bg-muted/20">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" /> Corporate Pipeline
                <Badge variant="secondary" className="font-bold text-[8px] px-1 py-0 bg-white border border-border/50">{apps.length}</Badge>
              </CardTitle>
              <Button variant="link" onClick={() => router.push('/md/applications')}
                className="text-[9px] font-bold uppercase p-0 h-fit text-muted-foreground hover:text-primary">Full View</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2">Candidate</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">AI Score</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-[11px]">
                    {apps.slice(0, 8).map((app: any, i: number) => (
                      <tr key={app.applicationId || i}
                        className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-2 cursor-pointer" onClick={() => router.push(`/md/applications/${app.applicationId || app.id}`)}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-muted border border-border/50 overflow-hidden shrink-0 shadow-sm">
                              <img src={app.profileImage || "/images/default-avatar.png"} alt=""
                                className="w-full h-full object-cover"
                                onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }} />
                            </div>
                            <div>
                              <span className="font-bold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors text-[10px] block">
                                {app.candidateName || app.name}
                              </span>
                              <span className="text-[8px] text-muted-foreground">{app.candidateEmail || app.candidate?.email || ''}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-[9px] font-medium text-muted-foreground uppercase truncate max-w-[120px]">{app.position || app.jobTitle || "—"}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-foreground tabular-nums">{Math.round(app.aiScore || 0)}</span>
                            <div className="w-12 h-1 bg-muted/50 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(app.aiScore || 0)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <Badge className={cn("text-[8px] font-bold uppercase border-none px-1.5 py-0", statusBadge(app.applicationStatus || app.status))}>
                            {(app.applicationStatus || app.status || "—").replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {app.final_decision !== 'APPROVED' && app.final_decision !== 'REJECTED' && app.final_decision !== 'MD_RECOMMENDED' && app.final_decision !== 'MD_REJECTED' && (
                              <>
                                <Button size="icon" variant="ghost"
                                  className="w-6 h-6 rounded-md hover:bg-emerald-500/10 text-emerald-600"
                                  onClick={(e) => { e.stopPropagation(); setConfirmDialog({ app, action: 'APPROVED' }); }}>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost"
                                  className="w-6 h-6 rounded-md hover:bg-rose-500/10 text-rose-600"
                                  onClick={(e) => { e.stopPropagation(); setConfirmDialog({ app, action: 'REJECTED' }); }}>
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            <Button size="icon" variant="ghost"
                              className="w-6 h-6 rounded-md hover:bg-muted/50"
                              onClick={() => router.push(`/md/applications/${app.applicationId || app.id}`)}>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {apps.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-[10px] font-bold uppercase text-muted-foreground/60">
                        No interview-completed candidates available
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </PanelLayout>
  );
}
