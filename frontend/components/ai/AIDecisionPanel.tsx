"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle, XCircle, AlertCircle, TrendingUp, RefreshCw,
  Zap, ClipboardCheck, Scale, Target, BrainCircuit,
  MessageSquare, Star, BookOpen, Shield, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hrApi } from "@/lib/api";
import { toast } from "sonner";

interface AIDecisionPanelProps { applicationId: number; }

const FIT_DIMENSIONS = [
  { key: "technical",       label: "Technical Fit",       icon: BrainCircuit, color: "#2563eb", bg: "bg-blue-50",    bar: "bg-blue-600",    tooltip: "Derived from Assessment Score (70%) + Interview technical questions (30%)" },
  { key: "communication",   label: "Comm Fit",            icon: MessageSquare, color: "#7c3aed", bg: "bg-purple-50", bar: "bg-purple-600",  tooltip: "Communication Fitness: interview articulation clarity (60%) + behavioral score (40%)" },
  { key: "leadership",      label: "Leadership Fit",      icon: Star,         color: "#059669", bg: "bg-emerald-50",  bar: "bg-emerald-600", tooltip: "Behavioral score (50%) + Interview confidence (30%) + Assessment (20%)" },
  { key: "domain_expertise",label: "Domain Expertise",    icon: BookOpen,     color: "#d97706", bg: "bg-amber-50",   bar: "bg-amber-600",   tooltip: "Assessment score (60%) + Resume relevance score (40%)" },
  { key: "cultural_fit",   label: "Cultural Fit",         icon: Users,        color: "#0891b2", bg: "bg-cyan-50",    bar: "bg-cyan-600",    tooltip: "Behavioral assessment (60%) + Integrity/Security index (40%)" },
];

export const AIDecisionPanel: React.FC<AIDecisionPanelProps> = ({ applicationId }) => {
  const queryClient = useQueryClient();

  const { data: analysisRes, isLoading } = useQuery({
    queryKey: ["ai-analysis-full", applicationId],
    queryFn: async () => (await hrApi.getCandidateProfile(String(applicationId))).data,
  });

  const app = analysisRes?.data;
  const decision = app?.final_decision;
  const rationale = app?.ai_rationale;
  const fitBreakdown = app?.fit_breakdown || {};
  const successProb = app?.success_probability ? Math.round(app.success_probability * 100) : 0;

  const { mutate: triggerDecision, isPending } = useMutation({
    mutationFn: () => hrApi.triggerDecision(String(applicationId)),
    onSuccess: () => {
      toast.success("AI Decision model refreshed successfully.");
      queryClient.invalidateQueries({ queryKey: ["hr-application", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["ai-analysis-full", applicationId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Decision core execution failed.")
  });

  const getDecisionStyles = (d: string) => {
    switch (d) {
      case "Strong Hire": return { color: "bg-emerald-600 text-white", icon: CheckCircle, border: "border-emerald-500", bg: "bg-emerald-50/60", text: "text-emerald-800" };
      case "Hire":        return { color: "bg-blue-600 text-white",    icon: CheckCircle, border: "border-blue-500",    bg: "bg-blue-50/60",    text: "text-blue-800"    };
      case "Borderline":  return { color: "bg-amber-600 text-white",   icon: AlertCircle, border: "border-amber-500",   bg: "bg-amber-50/60",   text: "text-amber-800"   };
      case "Reject":      return { color: "bg-red-600 text-white",     icon: XCircle,     border: "border-red-500",     bg: "bg-red-50/60",     text: "text-red-800"     };
      default:            return { color: "bg-slate-600 text-white",   icon: RefreshCw,   border: "border-slate-300",   bg: "bg-slate-50",      text: "text-slate-700"   };
    }
  };

  const styles = getDecisionStyles(decision || "");

  // Compute average fit for the ring indicator
  const avgFit = FIT_DIMENSIONS.length > 0
    ? Math.round(FIT_DIMENSIONS.reduce((s, d) => s + (fitBreakdown[d.key] || 0), 0) / FIT_DIMENSIONS.length)
    : 0;

  const isErrorState = rationale?.toLowerCase().includes("processing error") || rationale?.toLowerCase().includes("interrupted");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── LEFT: Decision Logic ── */}
      <div className="lg:col-span-7 space-y-5">
        <Card className={cn("border-l-8 shadow-md transition-all", styles.border)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", styles.color)}>
                  <styles.icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Model Decision Core</CardTitle>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">AI Engine: gemini-2.5-flash</p>
                </div>
              </div>
              <Badge className={cn("px-4 py-1.5 font-black uppercase tracking-widest text-[10px]", styles.color)}>
                {decision || "PENDING"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Rationale */}
            <div className={cn("p-5 rounded-2xl border", styles.bg, styles.border)}>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Executive AI Rationale
              </h4>
              {isErrorState ? (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    AI LLM call failed. Deterministic scoring applied automatically. Click "Refresh" to retry AI analysis.
                  </p>
                </div>
              ) : (
                <p className={cn("text-sm leading-relaxed italic", styles.text)}>
                  "{rationale || "Awaiting combined metrics from Assessment, Interview, and Integrity modules."}"
                </p>
              )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Success Prediction</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{successProb}%</p>
                <Progress value={successProb} className="h-1.5 mt-1 [&>div]:bg-blue-600" />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Integrity Index</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{app?.integrity_score || 0}/100</p>
                <Progress value={app?.integrity_score || 0} className="h-1.5 mt-1 [&>div]:bg-emerald-600" />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Fit Score</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{avgFit}%</p>
                <Progress value={avgFit} className="h-1.5 mt-1 [&>div]:bg-purple-600" />
              </div>
            </div>

            {/* Formula */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                <Scale className="w-3 h-3" /> Weighted Decision Formula
              </p>
              <div className="bg-white p-3 rounded-xl text-center border border-blue-200">
                <code className="text-[11px] font-mono font-bold text-slate-600">
                  (Assessment: 35%) + (Interview: 35%) + (Resume: 10%) + (Integrity: 10%) + (Behavioral: 10%)
                </code>
              </div>
            </div>

            {/* Role Suggestion */}
            {app?.role_recommendation && (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-700 uppercase mb-1 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> Role Recommendation
                </p>
                <p className="text-sm font-semibold text-indigo-900 leading-relaxed">
                  {app.role_recommendation}
                </p>
              </div>
            )}

            <Button
              onClick={() => triggerDecision()}
              disabled={isPending}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg font-bold gap-2"
            >
              {isPending ? <RefreshCw className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
              {decision ? "Refresh Hiring Decision" : "Execute AI Decision Model"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── RIGHT: Fit Dimensions ── */}
      <div className="lg:col-span-5 space-y-5">
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> Fit Analysis — 5 Dimensions
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1">Hover each dimension to see how it is calculated</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {FIT_DIMENSIONS.map(dim => {
              const score = fitBreakdown[dim.key] ?? null;
              return (
                <div key={dim.key} className="group" title={dim.tooltip}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", dim.bg)}>
                        <dim.icon className="w-4 h-4" style={{ color: dim.color }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{dim.label}</span>
                    </div>
                    <span className={cn("text-sm font-black", score === null ? "text-slate-400" : score >= 70 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-500")}>
                      {score === null ? "N/A" : `${score}%`}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", dim.bar)}
                      style={{ width: `${score ?? 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity leading-relaxed">
                    {dim.tooltip}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIDecisionPanel;
