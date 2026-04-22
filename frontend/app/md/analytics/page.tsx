"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { aiApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  BarChart3, TrendingUp, Users, CheckCircle, XCircle,
  Activity, Target, Clock, Filter, DownloadCloud
} from "lucide-react";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"];

function StatCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${color || 'bg-blue-50'}`}>
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <p className="text-4xl font-black text-slate-900 mt-1 tracking-tighter">{value ?? "—"}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data: mdAnalytics, isLoading: isMdLoading } = useQuery({
    queryKey: ["md-analytics"],
    queryFn: async () => (await api.get("/md/analytics")).data,
    refetchInterval: 30000,
  });

  const { data: aiAnalyticsRes, isLoading: isAiLoading } = useQuery({
    queryKey: ["ai-analytics-full"],
    queryFn: async () => (await aiApi.getAnalytics()).data,
    refetchInterval: 30000,
  });

  const aiData = aiAnalyticsRes?.data || {};
  const stats = aiData.stats || {};
  const candidates = aiData.candidates || [];
  const scoreDistribution = aiData.scoreDistribution || [];
  const decisionBreakdown = aiData.decisionBreakdown || [];

  // Score distribution for md/analytics (high/medium/low)
  const scoreDistMd = [
    { name: "High Performers (80+)", value: mdAnalytics?.scoreDistribution?.high || 0, color: "#10b981" },
    { name: "Average (50–79)", value: mdAnalytics?.scoreDistribution?.medium || 0, color: "#f59e0b" },
    { name: "Below Average (<50)", value: mdAnalytics?.scoreDistribution?.low || 0, color: "#ef4444" },
  ];

  const hasScoreDist = scoreDistMd.some(d => d.value > 0);

  // Timeline data from AI candidates
  const timelineData = candidates.reduce((acc: any[], c: any) => {
    const date = new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const existing = acc.find((x: any) => x.date === date);
    if (existing) {
      existing.total++;
      if (c.ai_decision === "AUTO_REJECTED") existing.rejected++;
      else if (c.ai_decision === "RECOMMENDED") existing.recommended++;
    } else {
      acc.push({
        date, total: 1,
        rejected: c.ai_decision === "AUTO_REJECTED" ? 1 : 0,
        recommended: c.ai_decision === "RECOMMENDED" ? 1 : 0,
      });
    }
    return acc;
  }, []).slice(-14); // last 14 data points

  const isLoading = isMdLoading || isAiLoading;

  return (
    <PanelLayout title="MD Analytics" allowedRoles={["MD", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-6">

        {/* Header */}
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Neural Analytics</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
              AI-driven score distribution &amp; performance intelligence
            </p>
          </div>
          <Badge variant="outline" className="text-[9px] font-black w-fit">Real-time</Badge>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Applications" value={mdAnalytics?.total ?? stats.total_applications ?? 0} icon={Users} color="bg-blue-50" />
          <StatCard title="Recommended" value={stats.recommended_count ?? 0}
            sub={stats.total_applications ? `${((stats.recommended_count || 0) / stats.total_applications * 100).toFixed(1)}%` : ''}
            icon={CheckCircle} color="bg-emerald-50" />
          <StatCard title="Auto-Rejected" value={stats.rejected_count ?? mdAnalytics?.rejected ?? 0}
            sub={stats.total_applications ? `${((stats.rejected_count || 0) / stats.total_applications * 100).toFixed(1)}%` : ''}
            icon={XCircle} color="bg-rose-50" />
          <StatCard title="Avg Final Score" value={stats.average_final_score ? Number(stats.average_final_score).toFixed(1) : '—'} sub="/100"
            icon={TrendingUp} color="bg-purple-50" />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Score Distribution */}
          <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" /> Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-4 pb-6">
              {!hasScoreDist && scoreDistribution.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[240px] text-slate-300">
                  <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No score data yet</p>
                  <p className="text-[9px] text-slate-400 mt-1">Scores will appear after candidates complete assessments</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={hasScoreDist ? scoreDistMd : scoreDistribution}
                    margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey={hasScoreDist ? "name" : "range"} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0/0.1)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                      {(hasScoreDist ? scoreDistMd : scoreDistribution).map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Decision Breakdown */}
          <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> AI Decision Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-4 pb-6">
              {decisionBreakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[240px] text-slate-300">
                  <Target className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No decisions recorded</p>
                  <p className="text-[9px] text-slate-400 mt-1">Decisions appear after AI evaluations run</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={decisionBreakdown} cx="50%" cy="50%" outerRadius={90}
                      dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {decisionBreakdown.map((entry: any, i: number) => (
                        <Cell key={i} fill={
                          entry.name === 'RECOMMENDED' ? '#10b981' :
                          entry.name === 'AUTO_REJECTED' ? '#ef4444' :
                          entry.name === 'PROCEED_TO_HR' ? '#f59e0b' : '#6b7280'
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Application Timeline */}
        {timelineData.length > 0 && (
          <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" /> Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-4 pb-6">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0/0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" name="Total" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="recommended" stroke="#10b981" name="Recommended" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Selection Rate Card */}
        {mdAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] bg-slate-900 text-white col-span-1">
              <CardContent className="p-6 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Selection Rate</p>
                <p className="text-5xl font-black tabular-nums">{mdAnalytics.selectionRate ?? 0}%</p>
                <p className="text-xs text-slate-500">of all applications selected</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100 shadow-sm rounded-[1.5rem]">
              <CardContent className="p-6 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Selected</p>
                <p className="text-5xl font-black tabular-nums text-emerald-600">{mdAnalytics.selected ?? 0}</p>
                <p className="text-xs text-slate-500">hired via pipeline</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100 shadow-sm rounded-[1.5rem]">
              <CardContent className="p-6 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Rejected</p>
                <p className="text-5xl font-black tabular-nums text-rose-500">{mdAnalytics.rejected ?? 0}</p>
                <p className="text-xs text-slate-500">screened out</p>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </PanelLayout>
  );
}
