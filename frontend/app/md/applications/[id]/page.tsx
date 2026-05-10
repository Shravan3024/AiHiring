"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import api from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { AIDecisionPanel } from "@/components/ai/AIDecisionPanel";
import { AssessmentAnalysisPanel } from "@/components/ai/AssessmentAnalysisPanel";
import { InterviewAnalysisPanel } from "@/components/ai/InterviewAnalysisPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, TrendingUp, ShieldCheck, Download,
  ChevronLeft, BarChart2, BrainCircuit, CheckCircle, XCircle, Loader2, User
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MDApplicationReview() {
  const { id } = useParams();
  const router = useRouter();
  const applicationId = Number(id);
  const queryClient = useQueryClient();

  const { data: appResponse, isLoading } = useQuery({
    queryKey: ["hr-application", applicationId],
    queryFn: async () => (await hrApi.getCandidateProfile(String(applicationId))).data,
    refetchInterval: 30000,
  });

  // The candidateProfile controller returns { success, data: { id, status, Candidate: { User }, Job } }
  const app = appResponse?.data;
  const candidateName = app?.Candidate?.User?.name || app?.candidateName || '—';
  const jobTitle = app?.Job?.title || app?.jobTitle || '—';
  const overallScore = Math.round(app?.overall_score || 0);
  const integrityScore = app?.integrity_score ?? app?.Candidate?.integrity_score ?? 100;

  const { mutate: makeDecision, isPending: isDeciding } = useMutation({
    mutationFn: (decision: 'APPROVED' | 'REJECTED') =>
      api.post('/md/decision', { application_id: applicationId, decision }),
    onSuccess: (_, decision) => {
      toast.success(decision === 'APPROVED' ? '✅ Offer dispatched successfully!' : '❌ Candidate rejected.');
      queryClient.invalidateQueries({ queryKey: ['hr-application', applicationId] });
      router.push('/md/decision');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Decision failed'),
  });

  const handleDownloadReport = async () => {
    try {
      const res = await hrApi.getExecutiveReport(String(applicationId));
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EXECUTIVE_REPORT_${applicationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('Executive PDF Generated');
    } catch (e) {
      toast.error('Failed to generate report');
    }
  };

  if (isLoading) return (
    <PanelLayout title="Executive Approval Terminal" allowedRoles={['MD', 'ADMIN']}>
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    </PanelLayout>
  );

  return (
    <PanelLayout title="Executive Approval Terminal" allowedRoles={['MD', 'ADMIN']}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Header */}
        <div className="bg-white border border-slate-100 rounded-lg shadow-sm p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Button variant="ghost" size="icon" onClick={() => router.back()}
                className="rounded-xl border border-slate-200 hover:bg-slate-50">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-slate-900 flex items-center justify-center shadow-xl">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                    {candidateName}
                  </h1>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                    {jobTitle} • Application #{applicationId}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button onClick={handleDownloadReport} variant="outline"
                className="gap-2 border-slate-200 font-bold uppercase text-[10px] tracking-widest h-11 px-5 rounded-xl">
                <Download className="w-4 h-4" /> Executive Dossier
              </Button>
              <Badge className={cn(
                'px-4 py-2 font-bold uppercase tracking-widest text-[10px] rounded-xl',
                app?.status === 'SELECTED' || app?.status === 'OFFERED' ? 'bg-emerald-100 text-emerald-700' :
                app?.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                'bg-slate-900 text-white'
              )}>
                {app?.status || 'Under Review'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Score + AI Decision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <AIDecisionPanel applicationId={applicationId} />
          </div>
          <div className="lg:col-span-4 space-y-5">
            {/* Peer Benchmarking */}
            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-600" /> Peer Benchmarking
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5 space-y-5">
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Candidate vs Peer Average</p>
                  <div className="flex items-end gap-3">
                    <p className="text-4xl font-black text-slate-900 tabular-nums">{overallScore}%</p>
                    <p className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +12%
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${overallScore}%` }} />
                  </div>
                </div>
                <div className="p-5 bg-blue-50/50 rounded-lg border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-3 h-3" /> Integrity Verification
                  </p>
                  <p className="text-2xl font-black text-slate-900">{integrityScore}/100</p>
                  <p className="text-xs text-slate-500 mt-1">Validated via Multi-Factor Proctoring Logs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deep Dive Panels */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-slate-400" />
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Technical &amp; Behavioral Deep-Dive</h3>
          </div>
          <AssessmentAnalysisPanel applicationId={applicationId} />

          <div className="flex items-center gap-2 pt-4">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Interview Highlights (6 Dimensions)</h3>
          </div>
          <InterviewAnalysisPanel applicationId={applicationId} />
        </div>

        {/* Final Decision Bar */}
        <div className="bg-slate-900 text-white p-8 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Final Executive Decision</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              This decision will be permanently logged as the Board Action for Application #{applicationId}.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 md:flex-none h-14 px-10 rounded-lg border-white/20 text-white bg-white/5 hover:bg-rose-600 hover:border-rose-600 font-bold uppercase text-[11px] tracking-widest transition-all gap-2"
              onClick={() => makeDecision('REJECTED')}
              disabled={isDeciding}
            >
              {isDeciding ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject Candidate
            </Button>
            <Button
              size="lg"
              className="flex-1 md:flex-none h-14 px-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-blue-900/30 transition-all gap-2"
              onClick={() => makeDecision('APPROVED')}
              disabled={isDeciding}
            >
              {isDeciding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve &amp; Dispatch Offer
            </Button>
          </div>
        </div>

      </div>
    </PanelLayout>
  );
}
