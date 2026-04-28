"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import SummaryCards from "@/components/md/SummaryCards";
import CandidateTable from "@/components/md/CandidateTable";
import TopCandidates from "@/components/md/TopCandidates";
import AnalyticsCharts from "@/components/md/AnalyticsCharts";
import { MDAnalyticsPanel } from "@/components/ai/MDAnalyticsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Target, ShieldAlert } from "lucide-react";

export default function MDDashboard() {
  const {
    data: apps = [],
    isLoading: isAppsLoading,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ["md-applications"],
    queryFn: async () => (await api.get("/md/applications")).data,
    refetchInterval: 30000,
  });

  const {
    data: analytics = {},
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["md-analytics"],
    queryFn: async () => (await api.get("/md/analytics")).data,
    refetchInterval: 30000,
  });

  const {
    data: top = [],
    isLoading: isTopLoading,
    refetch: refetchTop,
  } = useQuery({
    queryKey: ["md-top-candidates"],
    queryFn: async () => (await api.get("/md/top-candidates")).data,
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetchApps();
    refetchAnalytics();
    refetchTop();
  };

  const isLoading = isAppsLoading || isAnalyticsLoading || isTopLoading;

  return (
    <PanelLayout title="Executive Overview" allowedRoles={["MD"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4">
        <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter leading-none">Management Executive System</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">Operational oversight, capability mapping, and high-fidelity decisioning.</p>
          </div>
          <button
            className="h-14 rounded-2xl bg-slate-900 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? "Synchronizing..." : "System Refresh"}
          </button>
        </div>

        <SummaryCards data={analytics} />

        <Tabs defaultValue="pipeline" className="space-y-8">
           <TabsList className="bg-slate-100 p-1.5 rounded-[1.5rem] h-16 w-full max-w-md border border-slate-200 gap-2">
              <TabsTrigger value="pipeline" className="rounded-2xl h-full flex-1 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg">
                 <Users className="w-3.5 h-3.5" /> Pipeline Stream
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-2xl h-full flex-1 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg">
                 <BarChart3 className="w-3.5 h-3.5" /> Neural Analytics
              </TabsTrigger>
           </TabsList>

           <TabsContent value="pipeline" className="space-y-8 mt-0 outline-none">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="xl:col-span-2 border-slate-100 shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-10 py-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Corporate Pipeline Stream</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CandidateTable apps={apps} refresh={refetchApps} />
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
                  <CardHeader className="px-10 py-8 relative z-10 border-b border-white/5">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Elite Talent Tier</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 relative z-10">
                    <TopCandidates data={top} />
                  </CardContent>
                </Card>
              </div>
           </TabsContent>

           <TabsContent value="analytics" className="mt-0 outline-none">
              <MDAnalyticsPanel />
           </TabsContent>
        </Tabs>
      </div>
    </PanelLayout>
  );
}
