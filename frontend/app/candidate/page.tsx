"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ClipboardList, Video, FileText, CheckCircle, AlertCircle, Search, ChevronRight, Settings, Zap } from "lucide-react";

type CandidateOverview = {
  applications?: Array<{ id?: number; jobId?: { title?: string }; stage?: string; status?: string; applied_at?: string }>;
  dashboard?: { applications?: Array<{ id?: number; jobId?: { title?: string }; stage?: string; status?: string; applied_at?: string }> };
  nextAction?: { message?: string; href?: string } | string;
};

const STAGE_ORDER = ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"];

function StepIndicator({ stage }: { stage: string }) {
  const current = STAGE_ORDER.indexOf(stage);
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-6">
      {STAGE_ORDER.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border-2 transition-all shadow-sm ${
              i < current ? "bg-emerald-500 border-emerald-500 text-white" :
              i === current ? "bg-blue-600 border-blue-600 text-white" :
              "bg-white border-slate-200 text-slate-300"
            }`}>
              {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-2 font-bold uppercase tracking-widest whitespace-nowrap ${i === current ? "text-blue-600" : "text-slate-400"}`}>{s}</span>
          </div>
          {i < STAGE_ORDER.length - 1 && (
            <div className={`h-0.5 w-12 flex-shrink-0 mb-5 mx-1 rounded-full ${i < current ? "bg-emerald-400" : "bg-slate-100"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CandidateDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: overview, isLoading } = useQuery<CandidateOverview, Error>({
    queryKey: ["candidate-overview"],
    queryFn: () => candidateApi.getDashboard().then((r) => r.data),
    enabled: !!user,
  });

  const apps = overview?.applications || overview?.dashboard?.applications || [];
  const validApp = apps.find((app: any) => app.status === "APPLIED");
  const stage = validApp?.stage || validApp?.status || "Applied";

  const quickActions = [
    { label: "My Profile", icon: Settings, href: "/candidate/profile", color: "bg-slate-100 text-slate-600", desc: "Update your details" },
    { label: "Application", icon: FileText, href: "/candidate/application", color: "bg-blue-50 text-blue-600", desc: "View status" },
    { label: "Assessment", icon: ClipboardList, href: "/candidate/assessment", color: "bg-purple-50 text-purple-600", desc: "Technical test" },
    { label: "Interview", icon: Video, href: "/candidate/interview", color: "bg-green-50 text-green-600", desc: "Video session" },
    { label: "Offer Letter", icon: CheckCircle, href: "/candidate/offer", color: "bg-emerald-50 text-emerald-600", desc: "Review offer" },
  ];

  const nextAction = overview?.nextAction;
  const nextActionMessage = typeof nextAction === "object" ? nextAction?.message : nextAction;
  const nextActionHref = typeof nextAction === "object" ? nextAction?.href : undefined;

  return (
    <PanelLayout title="Candidate Dashboard" allowedRoles={["CANDIDATE"]}>
      <div className="max-w-6xl mx-auto space-y-8 p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(" ")[0] || "Candidate"}</h2>
              <p className="text-sm text-gray-500 mt-1">Status: <span className="text-blue-600 font-bold">{stage}</span></p>
           </div>
           {nextAction && (
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                   <p className="text-xs font-bold text-amber-900 uppercase tracking-widest">Next Step</p>
                   <p className="text-sm text-amber-800">{nextActionMessage}</p>
                </div>
                {nextActionHref && (
                   <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => router.push(nextActionHref)}>Continue</Button>
                )}
              </div>
           )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => <div key={i} className="h-40 animate-pulse bg-slate-50 rounded-3xl" />)}
          </div>
        ) : validApp ? (
          <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>{validApp.jobId?.title || "Operational Designation"}</span>
                </div>
                <Badge variant="secondary" className="px-3 py-1 text-[10px] font-bold uppercase">{stage}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex justify-center overflow-x-auto">
              <StepIndicator stage={stage} />
            </CardContent>
          </Card>
        ) : (
          <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500">No active applications found.</p>
            <Button className="mt-6" variant="outline" onClick={() => router.push("/candidate/application")}>Browse Jobs</Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map(item => (
            <Card key={item.href} className="hover:shadow-md cursor-pointer transition-all rounded-2xl border-slate-100 bg-white" onClick={() => router.push(item.href)}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-gray-900">{item.label}</h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PanelLayout>
  );
}
