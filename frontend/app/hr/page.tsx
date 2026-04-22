"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Clock, CheckCircle, TrendingUp, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Activity, Calendar, MessageCircle, ShieldCheck,
  Trophy, Star, Loader2, ExternalLink
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { cn } from "@/lib/utils";

interface PendingAction {
  _id: string;
  candidateName?: string;
  jobTitle?: string;
  action?: string;
  daysWaiting?: number;
}

function StatCard({ title, value, trend, trendValue, icon: Icon }: {
  title: string; value: string | number; trend?: "up" | "down";
  trendValue?: string; icon: any;
}) {
  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 shadow-sm">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
              trend === "up" ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
            )}>
              {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <p className="text-4xl font-black text-slate-900 mt-1 tracking-tighter">{value ?? "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HRDashboard() {
  const router = useRouter();

  const { data: kpi } = useQuery({
    queryKey: ["hr-kpi"],
    queryFn: () => hrApi.getKPICards().then(r => {
      const d = r.data?.data || r.data || {};
      return {
        activeApplications: d.totalCandidates ?? d.activeApplications,
        pendingDecisions: d.pendingReview ?? d.pendingDecisions,
        offersSent: d.selected ?? d.offersSent,
        avgTimeToHire: d.avgTimeToHire,
      };
    }),
    refetchInterval: 30000,
  });

  const { data: funnel } = useQuery({
    queryKey: ["hr-funnel"],
    queryFn: () => hrApi.getHiringFunnel().then(r => r.data?.data || r.data?.stages || r.data || []),
    refetchInterval: 30000,
  });

  const { data: aiVsHRRaw } = useQuery({
    queryKey: ["hr-ai-vs-hr"],
    queryFn: () => hrApi.getAIvsHR().then(r => r.data?.data || r.data || {}),
    refetchInterval: 30000,
  });

  const { data: pending } = useQuery({
    queryKey: ["hr-pending"],
    queryFn: () => hrApi.getPendingActions().then(r => r.data?.data || r.data?.actions || r.data || []),
    refetchInterval: 15000,
  });

  const { data: operationalCore, isLoading: isOpsLoading } = useQuery({
    queryKey: ["hr-operational-core"],
    queryFn: () => hrApi.getOperationalCore().then(r => r.data?.data || r.data || {}),
    refetchInterval: 20000,
  });

  const { data: topCandidates, isLoading: isTopLoading } = useQuery({
    queryKey: ["hr-top-candidates"],
    queryFn: () => hrApi.getTopCandidates().then(r => r.data?.data || r.data || []),
    refetchInterval: 30000,
  });

  const funnelData: any[] = Array.isArray(funnel) ? funnel : [];
  const aiHRData: any[] = Array.isArray(aiVsHRRaw?.chartData) ? aiVsHRRaw.chartData : [];
  const alignmentRate: number = aiVsHRRaw?.alignmentRate ?? null;
  const pendingItems: PendingAction[] = Array.isArray(pending) ? (pending as PendingAction[]) : [];
  const topList: any[] = Array.isArray(topCandidates) ? topCandidates : [];

  return (
    <PanelLayout title="Recruitment Center" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4">

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Pipeline"
            value={kpi?.activeApplications}
            trend="up"
            trendValue="+12% Gain"
            icon={Users}
          />
          <StatCard
            title="Needs Review"
            value={kpi?.pendingDecisions}
            trend={kpi?.pendingDecisions > 10 ? "down" : "up"}
            trendValue="High Volume"
            icon={Clock}
          />
          <StatCard
            title="Elite Selection"
            value={kpi?.offersSent}
            trend="up"
            trendValue="+4 Active"
            icon={CheckCircle}
          />
          <StatCard
            title="Hire Velocity"
            value={kpi?.avgTimeToHire ? `${kpi.avgTimeToHire}D` : "—"}
            trend="up"
            trendValue="-2D Target"
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Funnel Chart */}
          <Card className="lg:col-span-2 border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Recruitment Velocity Funnel</CardTitle>
            </CardHeader>
            <CardContent className="pt-10 pb-6 px-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} width={120} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 10, 10, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Operational Core — REAL-TIME */}
          <Card className="border-slate-100 shadow-xl bg-slate-900 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[100px]" />
            <CardHeader className="px-8 py-6">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Operational Core
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-8">
              <p className="text-sm font-medium text-slate-400 leading-relaxed">
                System synchronizing candidate feedback loops across departmental evaluators.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-300">Internal Discussions</span>
                  </div>
                  <span className="text-sm font-black text-white">
                    {isOpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (operationalCore?.internalDiscussions ?? '—')}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-300">SLA Efficiency</span>
                  </div>
                  <span className={cn(
                    "text-sm font-black",
                    (operationalCore?.slaEfficiency ?? 100) >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  )}>
                    {isOpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${operationalCore?.slaEfficiency ?? '—'}%`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                Sync Team Analytics
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* AI vs Human Alignment Matrix — FIXED */}
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI vs Human Alignment Matrix</CardTitle>
              {alignmentRate !== null && (
                <Badge className={cn(
                  "text-[10px] font-black px-3 py-1 rounded-full border-0",
                  alignmentRate >= 70 ? 'bg-emerald-100 text-emerald-700' : alignmentRate >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                )}>
                  {alignmentRate}% Aligned
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-10">
              <div className="h-[300px] w-full">
                {aiHRData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiHRData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '20px' }} />
                      <Bar dataKey="aiDecisions" fill="#2563eb" name="AI Engine" radius={[5, 5, 0, 0]} barSize={28} />
                      <Bar dataKey="hrDecisions" fill="#cbd5e1" name="HR Panel" radius={[5, 5, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <Activity className="w-10 h-10 mb-2 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Calibration Data</p>
                    <p className="text-[9px] text-slate-400 mt-1">Applications will populate this chart automatically</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Priority Queue + Top Candidates split */}
          <div className="space-y-6">
            {/* Operational Protocol Queue */}
            <Card className="border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Operational Protocol Queue
                </CardTitle>
                <Badge variant="outline" className="text-[9px] font-black bg-white">Real-time</Badge>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto max-h-[220px]">
                {pendingItems.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300">Pipeline Synchronized</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {pendingItems.slice(0, 4).map((item) => (
                      <div key={item._id} className="px-6 py-4 hover:bg-slate-50 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-xs border border-slate-200">
                            {item.candidateName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 leading-tight">{item.candidateName}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.jobTitle} • {item.action}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.daysWaiting !== undefined && item.daysWaiting > 2 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-black uppercase rounded-lg">
                              <Clock className="w-2.5 h-2.5" /> {item.daysWaiting}D
                            </div>
                          )}
                          <button className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Candidates — REAL-TIME */}
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Top Candidates
                </CardTitle>
                <Badge variant="outline" className="text-[9px] font-black bg-white">Real-time</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {isTopLoading ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                ) : topList.length === 0 ? (
                  <div className="py-8 text-center">
                    <Star className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No scored candidates yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {topList.map((c: any, i: number) => (
                      <div
                        key={c.applicationId}
                        className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-all group cursor-pointer"
                        onClick={() => router.push(`/hr/candidates/${c.applicationId}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}</span>
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{c.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.job}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-black text-blue-600 tabular-nums">{c.score}%</p>
                            <p className="text-[8px] text-slate-400 uppercase font-bold">Score</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
