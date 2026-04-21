"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, XCircle, AlertCircle, TrendingUp, RefreshCw,
  Zap, MessageSquare, Share2, ClipboardCheck, Scale, Target, BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { hrApi } from "@/lib/api";
import { toast } from "sonner";

interface AIDecisionPanelProps {
  applicationId: number;
}

export const AIDecisionPanel: React.FC<AIDecisionPanelProps> = ({ applicationId }) => {
  const queryClient = useQueryClient();

  // Fetch AI decision
  const { data: analysisRes, isLoading } = useQuery({
    queryKey: ["ai-analysis-full", applicationId],
    queryFn: async () => (await hrApi.getCandidateProfile(String(applicationId))).data,
  });

  const app = analysisRes?.data;
  const decision = app?.final_decision;
  const rationale = app?.ai_rationale;
  const fitBreakdown = app?.fit_breakdown;

  // Make final decision mutation
  const { mutate: triggerDecision, isPending } = useMutation({
    mutationFn: () => hrApi.triggerDecision(String(applicationId)),
    onSuccess: () => {
      toast.success("AI Decision logic refreshed successfully.");
      queryClient.invalidateQueries({ queryKey: ["hr-application", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["ai-analysis-full", applicationId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Decision core execution failed.");
    }
  });

  const getDecisionStyles = (decision: string) => {
    switch (decision) {
      case "Strong Hire":
        return { color: "bg-emerald-600 text-white", icon: CheckCircle, border: "border-emerald-500", bg: "bg-emerald-50/50" };
      case "Hire":
        return { color: "bg-blue-600 text-white", icon: CheckCircle, border: "border-blue-500", bg: "bg-blue-50/50" };
      case "Borderline":
        return { color: "bg-amber-600 text-white", icon: AlertCircle, border: "border-amber-500", bg: "bg-amber-50/50" };
      case "Reject":
        return { color: "bg-red-600 text-white", icon: XCircle, border: "border-red-500", bg: "bg-red-50/50" };
      default:
        return { color: "bg-slate-600 text-white", icon: RefreshCw, border: "border-slate-500", bg: "bg-slate-50/50" };
    }
  };

  const styles = getDecisionStyles(decision || "");

  const chartData = fitBreakdown ? [
    { name: "Technical Fit", score: fitBreakdown.technical, color: "#2563eb" },
    { name: "Comm Fit", score: fitBreakdown.communication, color: "#7c3aed" },
    { name: "Leadership", score: fitBreakdown.leadership, color: "#059669" },
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Decision Logic */}
      <div className="lg:col-span-7 space-y-6">
        <Card className={cn("border-l-8 transition-all shadow-md", styles.border)}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", styles.color)}>
                  <styles.icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Model Decision Core</CardTitle>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">AI Engine: gemini-2.5-flash</p>
                </div>
              </div>
              <Badge className={cn("px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]", styles.color)}>
                {decision || "PENDING ANALYSIS"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className={cn("p-6 rounded-2xl border", styles.bg, styles.border)}>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                   <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Executive AI Rationale
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                   "{rationale || "The system is awaiting combined metrics from Assessment, Interview, and Integrity modules to formulate a final hiring rationale."}"
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                   <div className="bg-white p-3 rounded-xl shadow-sm"><Target className="w-5 h-5 text-blue-600" /></div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Success Prediction</p>
                      <p className="text-xl font-bold text-slate-900">{app?.success_probability ? Math.round(app.success_probability * 100) : 0}%</p>
                   </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                   <div className="bg-white p-3 rounded-xl shadow-sm"><ClipboardCheck className="w-5 h-5 text-emerald-600" /></div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Integrity Index</p>
                      <p className="text-xl font-bold text-slate-900">{app?.integrity_score || 0}/100</p>
                   </div>
                </div>
             </div>

             <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-800 uppercase mb-3 flex items-center gap-2">
                  <Scale className="w-3 h-3" /> Weighted Decision Formula
                </p>
                <div className="bg-white p-3 rounded-xl text-center border border-blue-200">
                   <code className="text-[11px] font-mono font-bold text-slate-600">
                      (Tech: 40%) + (Int: 40%) + (Integrity: 10%) + (Behav: 10%)
                   </code>
                </div>
             </div>

             <Button 
                onClick={() => triggerDecision()} 
                disabled={isPending}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all font-bold gap-2"
             >
                {isPending ? <RefreshCw className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                {decision ? "Refresh Hiring Decision" : "Execute AI Decision Model"}
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right: Fit Visualization */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="h-full border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> Fit Analysis Detail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} fontSize={11} className="font-bold text-slate-600" />
                  <Tooltip />
                  <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 space-y-4">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Role Suggestion</h4>
               <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-sm font-bold text-indigo-900 leading-relaxed">
                     {app?.role_recommendation || "System recommendation pending decision core execution."}
                  </p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIDecisionPanel;
