"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Briefcase, TrendingUp, CheckCircle, Clock, 
  ArrowUpRight, ArrowDownRight, Activity, Zap, ShieldAlert,
  Calendar, Layers, MapPin
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { cn } from "@/lib/utils";

const CHART_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

function ExecutiveStatCard({
  title, value, trend, trendValue, icon: Icon, colorClass,
}: {
  title: string; value: string | number; trend?: "up" | "down";
  trendValue?: string; icon: any; colorClass: string;
}) {
  return (
    <div className="relative group overflow-hidden bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-all group-hover:opacity-20", colorClass)} />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div className={cn("p-3.5 rounded-2xl bg-slate-50 border border-slate-100", colorClass.replace('bg-', 'text-'))}>
            <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest",
              trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
            )}>
              {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] ml-1 mb-2">{title}</p>
          <p className="text-5xl font-black text-[#0f172a] tracking-tight tabular-nums">
            {value ?? "00"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useQuery({ 
    queryKey: ["admin-stats"], 
    queryFn: () => adminApi.getStats().then((r) => {
      const d = r.data?.data || r.data || {};
      return {
        totalApplications: d.totalCandidates ?? d.totalApplications ?? 0,
        activeJobs: d.totalActiveJobs ?? d.activeJobs ?? 0,
        pendingApprovals: d.pendingApprovals ?? 0,
        hiredThisMonth: d.aiEvaluationsToday ?? d.hiredThisMonth ?? 0,
      };
    }) 
  });
  
  const { data: trendData } = useQuery({ queryKey: ["admin-trend"], queryFn: () => adminApi.getHiringTrend().then((r) => r.data?.data || r.data || []) });
  const { data: funnelData } = useQuery({ queryKey: ["admin-funnel"], queryFn: () => adminApi.getFunnel().then((r) => r.data?.data || r.data || []) });
  const { data: roleData } = useQuery({ queryKey: ["admin-role-apps"], queryFn: () => adminApi.getRoleApplications().then((r) => r.data?.data || r.data || []) });
  const { data: healthData } = useQuery({ queryKey: ["admin-system-health"], queryFn: () => adminApi.getSystemHealth().then((r) => r.data?.data || r.data) });

  return (
    <PanelLayout title="Enterprise Intelligence" allowedRoles={["ADMIN"]}>
      <div className="space-y-10 pb-16">
        
        {/* Statistics Layer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ExecutiveStatCard
            title="Total Applications"
            value={stats?.totalApplications}
            trend="up"
            trendValue="+14%"
            icon={Users}
            colorClass="bg-blue-600"
          />
          <ExecutiveStatCard
            title="Active Vacancies"
            value={stats?.activeJobs}
            trend="up"
            trendValue="3 LIVE"
            icon={Briefcase}
            colorClass="bg-indigo-600"
          />
          <ExecutiveStatCard
            title="Pending Decisions"
            value={stats?.pendingApprovals}
            trend="down"
            trendValue="PRIORITY"
            icon={Clock}
            colorClass="bg-amber-600"
          />
          <ExecutiveStatCard
            title="Pipeline Velocity"
            value={stats?.hiredThisMonth}
            trend="up"
            trendValue="OPTIMAL"
            icon={Zap}
            colorClass="bg-emerald-600"
          />
        </div>

        {/* Primary Analytical Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Global Hiring Velocity */}
           <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                 <Activity className="w-48 h-48 text-[#0f172a]" />
              </div>
              
              <div className="relative z-10 space-y-10">
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-2xl font-black text-[#0f172a] tracking-tight uppercase">Operational Velocity</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Inbound Flow: Last 6 Periods</p>
                    </div>
                 </div>

                 <div className="h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={Array.isArray(trendData) ? trendData : []}>
                          <defs>
                             <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: '900' }} 
                            dy={15}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: '900' }} 
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="applications" 
                            stroke="#2563eb" 
                            strokeWidth={5} 
                            fill="url(#velocityGrad)" 
                            animationDuration={2500}
                          />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           {/* Funnel distribution */}
           <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-10 flex flex-col justify-between group">
              <div>
                 <h3 className="text-2xl font-black text-[#0f172a] tracking-tight uppercase">Capability Conversion</h3>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Talent Acquisition Lifecycle</p>
              </div>

              <div className="space-y-8">
                 {(Array.isArray(funnelData) ? funnelData : []).map((stage: any, i) => (
                    <div key={stage.stage} className="space-y-3">
                       <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                          <span>{stage.stage}</span>
                          <span className="text-blue-600">{stage.count}</span>
                       </div>
                       <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-blue-600 transition-all duration-1000 ease-out flex justify-end px-2 items-center"
                             style={{ width: `${Math.min(100, (stage.count / Math.max(...funnelData.map((x:any) => x.count), 1)) * 100)}%` }}
                          />
                       </div>
                    </div>
                 ))}
              </div>

              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flow Efficiency</p>
                    <p className="text-sm font-black text-[#0f172a] uppercase">Optimized Integrity</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Supporting Analytical Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Role breakdown */}
           <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black text-[#0f172a] tracking-tight uppercase leading-none">Resource Allocation</h3>
                 <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-blue-600" />
                 </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-14">
                 <div className="w-56 h-56 md:w-64 md:h-64 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={Array.isArray(roleData) ? roleData : []} 
                            dataKey="count" 
                            nameKey="role"
                            cx="50%" 
                            cy="50%" 
                            innerRadius={80} 
                            outerRadius={110} 
                            paddingAngle={10}
                          >
                             {roleData?.map((entry: any, index: number) => (
                               <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#fff" strokeWidth={4} />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Global</span>
                       <span className="text-3xl font-black text-[#0f172a]">100%</span>
                    </div>
                 </div>

                 <div className="flex-1 w-full grid grid-cols-2 gap-x-10 gap-y-6">
                    {(Array.isArray(roleData) ? roleData : []).map((item: any, i) => (
                       <div key={item.role} className="flex flex-col gap-2 group/item">
                          <div className="flex items-center gap-3">
                             <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                             <span className="text-[10px] font-black text-slate-500 uppercase truncate tracking-[0.15em] group-hover/item:text-blue-600 transition-colors uppercase">{item.role}</span>
                          </div>
                          <span className="text-2xl font-black text-[#0f172a] tabular-nums pl-5">{item.count}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* System Integrity & Health */}
           <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-10 group">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-[#0f172a] tracking-tight uppercase leading-none">Infrastructure Integrity</h3>
                 <Badge className="bg-blue-600 text-white border-0 text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-200">System Ready</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {healthData ? Object.entries(healthData).map(([key, val]) => (
                    <div key={key} className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-4 hover:border-blue-200 transition-all hover:bg-white hover:shadow-lg">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] truncate mr-2">{key.replace(/_/g, " ")}</span>
                          <div className={cn(
                             "w-2.5 h-2.5 rounded-full",
                             val === "healthy" || val === true ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-amber-500 animate-pulse"
                          )} />
                       </div>
                       <div className="flex items-end justify-between">
                          <p className="text-base font-black text-[#0f172a] uppercase tracking-tighter">{String(val)}</p>
                          <button className="text-[9px] font-black text-blue-600 hover:scale-110 transition-transform tracking-widest">DIAGNOSTIC</button>
                       </div>
                    </div>
                 )) : (
                    <div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-30 italic space-y-5">
                       <Zap className="w-16 h-16 text-blue-600 animate-bounce" />
                       <span className="text-xs font-black uppercase tracking-[0.5em] text-blue-600">Syncing Matrix...</span>
                    </div>
                 )}
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                 <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    <Calendar className="w-4 h-4" />
                    <span>Last Sync: {new Date().toLocaleTimeString()}</span>
                 </div>
                 <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-[0.3em] flex items-center gap-2 group">
                    View Registry
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>

      </div>
    </PanelLayout>
  );
}
