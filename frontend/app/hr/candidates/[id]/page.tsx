"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { hrApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User, Briefcase, FileText, MessageSquare, CheckCircle, XCircle,
  RotateCcw, ArrowUpCircle, Download, Mail, GraduationCap, MapPin, Phone,
  ShieldAlert, Sparkles, ThumbsUp, ThumbsDown, Lock, FileSignature, CheckCircle2, 
  Eye, CalendarClock, Building, Server, AlertOctagon, Timer, ShieldCheck, 
  MousePointer2, Loader2, Play, Video, Users, AlertTriangle, Clock, 
  Trophy, ExternalLink, ChevronRight, AlertCircle, FileSearch
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import InterviewHighlights from "@/components/hr/InterviewHighlights";

interface DecisionPayload {
  decision: string;
  hr_notes: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

interface ReEvaluationResponse {
  score?: number;
}

interface EvaluationItem {
  stage: string;
  overallScore?: number;
  pros?: string[];
  cons?: string[];
  summary?: string;
  isManual?: boolean;
}

interface InternalNote {
  id?: string | number;
  content?: string;
  type?: string;
  author?: string;
  version?: number;
  createdAt?: string;
}

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [hasSubmittedDecision, setHasSubmittedDecision] = useState(false); // Locks after finalize clock

  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerData, setOfferData] = useState({ template: "standard_sde", baseCTC: "", joiningDate: "" });
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);
  const [downloadingAssessment, setDownloadingAssessment] = useState(false);
  const [downloadingInterview, setDownloadingInterview] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [viewingResume, setViewingResume] = useState(false);

  const openResumePDF = async () => {
    setViewingResume(true);
    try {
      const response = await hrApi.viewResume(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      toast.error('Unable to load resume. The file may not be uploaded yet.');
    } finally {
      setViewingResume(false);
    }
  };


  const downloadBlob = async (
    fetchFn: () => Promise<any>,
    filename: string,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    try {
      const response = await fetchFn();
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${filename} downloaded successfully`);
    } catch (err) {
      toast.error('Failed to generate PDF report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidate-profile", id],
    queryFn: () => hrApi.getCandidateProfile(id).then(r => r.data || {}),
    enabled: !!id,
  });

  const decisionMutation = useMutation({
    mutationFn: ({ decision, hr_notes }: DecisionPayload) => {
      // Mocked HR rule engine execution over real API call
      return hrApi.makeDecision(id, {
        decision: decision,
        reason: hr_notes,
        comments: hr_notes || ""
      });
    },
    onSuccess: () => {
      setHasSubmittedDecision(true);
      setIsConfirmOpen(false);
      qc.invalidateQueries({ queryKey: ["candidate-profile", id] });
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: () => hrApi.createOffer({ application_id: id, salary: offerData.baseCTC, joining_date: offerData.joiningDate }),
    onSuccess: () => {
      setOfferDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["candidate-profile", id] });
    }
  });

  const [newNoteText, setNewNoteText] = useState("");
  const addNoteMutation = useMutation({
    mutationFn: () => hrApi.addInternalNote(id as string, newNoteText),
    onSuccess: () => {
      setNewNoteText("");
      qc.invalidateQueries({ queryKey: ["candidate-profile", id] });
    }
  });

  const reparseMutation = useMutation({
    mutationFn: async () => (await api.post(`/resume/reparse/${id}`)).data,
    onSuccess: () => {
      toast.success("Resume parsed successfully!");
      qc.invalidateQueries({ queryKey: ["candidate-profile", id] });
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || "Parsing failed");
    }
  });

  const reEvaluateAssessmentMutation = useMutation({
    mutationFn: async () => {
      return (await hrApi.reEvaluateAssessment(id)).data;
    },
    onSuccess: (res: ReEvaluationResponse) => {
      toast.success(`Assessment re-evaluated successfully! New Score: ${res.score}%`);
      qc.invalidateQueries({ queryKey: ["candidate-profile", id] });
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.error || "Re-evaluation failed");
    }
  });

  const { data: rulesData = [] } = useQuery({
    queryKey: ["approval-rules"],
    queryFn: () => hrApi.getApprovalRules().then(r => r.data || []),
  });

  // Dynamically resolve threshold from rules based on current stage
  const resolveThreshold = () => {
    const rules = Array.isArray(rulesData) ? rulesData : [];
    // Find rule for FINAL stage as default, or match by status mapping
    const finalRule = rules.find((r: any) => r.stage === 'FINAL');
    return finalRule?.approvalsRequired ?? 3; // Fallback to 3 if not found
  };

  const profileData = profile?.data || profile || {};
  const HR_THRESHOLD = resolveThreshold();
  const currentApprovals = profileData?.approvals?.received ?? 1;
  const isLocked = currentApprovals >= HR_THRESHOLD;

  if (isLoading) {
    return (
      <PanelLayout title="Candidate Profile" allowedRoles={["HR", "ADMIN"]}>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse bg-gray-100 rounded-lg" />)}
        </div>
      </PanelLayout>
    );
  }

  const candidate = profileData.candidate || profileData.candidateId || {};
  const job = profileData.job || profileData.jobId || {};
  const stage = profileData.stage || profileData.status || "Applied";
  const canApproveAssessment = ["APPLIED", "RESUME_SUBMITTED", "RESUME_EVALUATED"].includes(stage);
  const canRequestReassessment = ["TECHNICAL_ROUND_COMPLETED", "PROCEED_TO_HR", "RECOMMENDED_BY_AI", "REJECTED", "AUTO_REJECTED"].includes(stage);
  const canApproveInterview = ["TECHNICAL_ROUND_COMPLETED"].includes(stage);
  const canFinalize = ["INTERVIEW_COMPLETED", "PROCEED_TO_HR", "RECOMMENDED_BY_AI"].includes(stage);
  const canRequestReInterview = ["INTERVIEW_COMPLETED", "PROCEED_TO_HR", "RECOMMENDED_BY_AI", "SELECTED", "REJECTED", "AUTO_REJECTED"].includes(stage) || !!profileData.interviewData;
  const canPutOnHold = ["TECHNICAL_ROUND_COMPLETED", "INTERVIEW_COMPLETED", "PROCEED_TO_HR", "RECOMMENDED_BY_AI"].includes(stage);

  // Simulated Offer State Mapping based on status
  const simulatedStatus = stage.includes("OFFER") || stage === 'HIRED' ? (stage === 'HIRED' ? 'ACCEPTED' : 'SENT') : null;
  const offerStatus = simulatedStatus as "SENT" | "VIEWED" | "ACCEPTED" | "DECLINED" | "EXPIRED" | null;

  return (
    <PanelLayout title="Candidate Evaluation Profile" allowedRoles={["HR", "ADMIN"]}>
      {/* Back Navigation */}
      <div className="mb-5 flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-2 text-slate-600 hover:text-slate-900" onClick={() => router.back()}>
          ← Back to Pipeline
        </Button>
      </div>

      {/* ─── PROFILE HERO CARD ─── */}
      <Card className="mb-6 border-slate-200 shadow-lg rounded-2xl relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 p-6 opacity-[0.025] pointer-events-none select-none">
          <Sparkles className="w-56 h-56 text-blue-600" />
        </div>

        <CardContent className="p-8 relative z-10">
          {/* ── ROW 1: Avatar + Identity ── */}
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 shrink-0 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl relative overflow-hidden">
              {candidate.profile_image_path ? (
                <img
                  src={`http://localhost:5000${candidate.profile_image_path}`}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Name + ID */}
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                  {candidate.name || "Unknown Candidate"}
                </h2>
                <Badge variant="outline" className="text-[10px] font-bold tracking-widest text-slate-400 bg-slate-50 border-slate-200">
                  ID: {profileData._id || id}
                </Badge>
              </div>

              {/* Role + Email */}
              <div className="flex flex-wrap items-center gap-5 mt-2 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-blue-700">
                  <Briefcase className="w-4 h-4" />
                  {job.title || "Applied Role"}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                  {candidate.email}
                </span>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Badge className="bg-blue-600 text-white border-0 text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-full uppercase">
                  {stage}
                </Badge>
                {profileData.integrityScore !== undefined && (
                  <Badge className={cn(
                    "text-[10px] font-bold tracking-wide px-3 py-1 rounded-full border-0 uppercase flex items-center gap-1",
                    profileData.integrityScore >= 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                  )}>
                    <ShieldAlert className="w-3 h-3" /> Integrity: {profileData.integrityScore}%
                  </Badge>
                )}
                {profileData.aiFitBand && (
                  <Badge className={cn(
                    "text-[10px] font-bold tracking-wide px-3 py-1 rounded-full border-0 uppercase",
                    profileData.aiFitBand === 'GOOD' ? 'bg-emerald-100 text-emerald-700'
                    : profileData.aiFitBand === 'AVERAGE' ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                  )}>
                    Fit: {profileData.aiFitBand}
                  </Badge>
                )}
                {profileData?.aiScore !== undefined && (
                  <Badge className="bg-blue-50 text-blue-700 border-0 text-[10px] font-bold tracking-wide px-3 py-1 rounded-full uppercase">
                    Score: {profileData.aiScore}%
                  </Badge>
                )}
                {profileData.proctoringSummary && profileData.proctoringSummary.malpracticeWarnings > 0 && (
                  <Badge className="bg-rose-50 text-rose-700 border-0 text-[10px] font-bold tracking-wide px-3 py-1 rounded-full uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {profileData.proctoringSummary.malpracticeWarnings} Flags
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 2: Action Buttons ── */}
          <div className="border-t border-slate-100 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {/* View Resume */}
              {profileData.resumeUrl ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs gap-2 h-9"
                  onClick={openResumePDF}
                  disabled={viewingResume}
                >
                  {viewingResume ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSearch className="w-3.5 h-3.5 text-slate-500" />}
                  {viewingResume ? 'Loading...' : 'View Resume'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-slate-200 text-slate-400 font-semibold text-xs gap-2 h-9 cursor-not-allowed"
                  disabled
                >
                  <FileSearch className="w-3.5 h-3.5" />
                  No Resume
                </Button>
              )}

              {/* Reparse */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-blue-100 text-blue-700 hover:bg-blue-50 font-semibold text-xs gap-2 h-9"
                onClick={() => reparseMutation.mutate()}
                disabled={reparseMutation.isPending}
              >
                {reparseMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {reparseMutation.isPending ? "Parsing..." : "Reparse Profile"}
              </Button>

              {/* Assessment PDF */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-emerald-100 text-emerald-700 hover:bg-emerald-50 font-semibold text-xs gap-2 h-9"
                onClick={() => downloadBlob(
                  () => hrApi.getAssessmentReport(id),
                  `Assessment_Report_${id}.pdf`,
                  setDownloadingAssessment
                )}
                disabled={downloadingAssessment}
              >
                {downloadingAssessment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {downloadingAssessment ? 'Generating...' : 'Assessment PDF'}
              </Button>

              {/* Interview PDF */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-purple-100 text-purple-700 hover:bg-purple-50 font-semibold text-xs gap-2 h-9"
                onClick={() => downloadBlob(
                  () => hrApi.getInterviewReport(id),
                  `Interview_Report_${id}.pdf`,
                  setDownloadingInterview
                )}
                disabled={downloadingInterview}
              >
                {downloadingInterview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {downloadingInterview ? 'Generating...' : 'Interview PDF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="ai" className="w-full">
            <div className="overflow-x-auto pb-1 mb-5">
              <TabsList className="bg-slate-100 p-1 rounded-xl border border-slate-200 inline-flex min-w-max w-full">
                <TabsTrigger value="ai" className="rounded-lg px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">AI Analysis</TabsTrigger>
                <TabsTrigger value="highlights" className="rounded-lg px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">Interview Highlights</TabsTrigger>
                <TabsTrigger value="integrity" className="rounded-lg px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">Integrity Risk</TabsTrigger>
                <TabsTrigger value="overview" className="rounded-lg px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">Overview</TabsTrigger>
                <TabsTrigger value="evaluation" className="rounded-lg px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">Evaluation Traces</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="ai">
              <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" /> Neural Mapping
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {profileData?.evaluationProsCons?.length > 0 ? (
                    <div className="space-y-6">
                      {profileData.evaluationProsCons.map((evalItem: EvaluationItem, idx: number) => (
                        <div key={idx} className="border border-slate-100 rounded-xl p-6 bg-white">
                          <h3 className="font-bold text-gray-800 uppercase tracking-tight mb-4 border-b border-slate-50 pb-2">{evalItem.stage.replace(/_/g, ' ')}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <h4 className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Strengths</h4>
                              <ul className="text-sm space-y-1">
                                {evalItem.pros?.map((p, i) => <li key={i} className="flex gap-2"><span>•</span> {p}</li>)}
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-rose-600 font-bold uppercase tracking-widest text-[10px]">Weaknesses</h4>
                              <ul className="text-sm space-y-1">
                                {evalItem.cons?.map((c, i) => <li key={i} className="flex gap-2"><span>•</span> {c}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="py-10 text-center text-slate-400 italic">No AI data available</div>}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="highlights" className="mt-6">
             <InterviewHighlights data={profileData.interviewHighlights} />
          </TabsContent>

          <TabsContent value="integrity" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl">
                  <ShieldAlert className={`w-12 h-12 mb-4 ${(profileData.proctoringSummary?.integrityScore ?? 100) < 70 ? 'text-red-500' : 'text-blue-500'}`} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Integrity Score</h4>
                  <p className="text-4xl font-black text-slate-900">{profileData.proctoringSummary?.integrityScore ?? 100}<span className="text-lg text-slate-300">/100</span></p>
                </Card>

                <Card className="border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl">
                  <AlertCircle className={`w-12 h-12 mb-4 ${(profileData.proctoringSummary?.malpracticeWarnings ?? 0) > 2 ? 'text-red-500' : 'text-amber-500'}`} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Warning Count</h4>
                  <p className="text-4xl font-black text-slate-900">{profileData.proctoringSummary?.malpracticeWarnings ?? 0}</p>
                </Card>

                <Card className="border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center bg-slate-900 text-center rounded-2xl text-white">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Automated Risk Status</h4>
                  <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest ${(profileData.proctoringSummary?.integrityScore ?? 100) < 60 ? 'bg-red-500' : 'bg-blue-600'}`}>
                    {(profileData.proctoringSummary?.integrityScore ?? 100) < 60 ? 'CRITICAL RISK' : 'OPERATIONAL SAFE'}
                  </div>
                </Card>
              </div>

              <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-5">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-900">Malpractice Log (Session Telemetry)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {profileData.proctoringSummary?.violations?.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {profileData.proctoringSummary.violations.map((v: any, i: number) => (
                        <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                          <div className={`p-2 rounded-lg ${v.severity >= 4 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black uppercase tracking-widest text-slate-900">{v.type?.replace(/_/g, " ")}</p>
                              <Badge className={v.severity >= 4 ? 'bg-red-100 text-red-600 border-red-200' : 'bg-amber-100 text-amber-600 border-amber-200'}>
                                SEV {v.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{new Date(v.createdAt).toLocaleTimeString()} - Behavioral anomaly detected via {v.meta?.detector || 'Proctoring Engine'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-medium uppercase tracking-widest">No Malpractice Events Logged</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
            <TabsContent value="overview">
              <Card className="border-slate-100 shadow-sm rounded-2xl p-6 bg-white">
                <div className="space-y-4">
                   <p className="text-sm text-gray-600 leading-relaxed">{candidate.summary || "Summary data not provided."}</p>
                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Education</Label>
                        <p className="text-sm font-bold">{candidate.education}</p>
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Location</Label>
                        <p className="text-sm font-bold">{candidate.location}</p>
                      </div>
                   </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="evaluation">
               <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                     <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-900">Audit Compliance Logs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {profileData.auditLogs?.approvalRecords?.length > 0 ? (
                      <div className="space-y-3">
                        {profileData.auditLogs.approvalRecords.map((rec: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-xs font-black uppercase text-blue-600">{rec.decision?.replace(/_/g, ' ')}</span>
                                {rec.approvalStage && (
                                  <Badge variant="outline" className="ml-2 text-[8px]">
                                    From: {rec.approvalStage?.replace(/_/g, ' ')}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400">
                                {rec.timestamp ? new Date(rec.timestamp).toLocaleString() : ''}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 italic">&quot;{rec.comments}&quot;</p>
                            <p className="text-[9px] text-slate-400 mt-2 uppercase tracking-widest">
                              — {rec.reviewer?.name || 'System'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <Clock className="w-8 h-8 mx-auto mb-3 text-slate-200" />
                        <p className="text-slate-400 text-sm font-medium">No audit events recorded yet.</p>
                        <p className="text-slate-300 text-xs mt-1">Events will appear as the candidate moves through pipeline stages.</p>
                      </div>
                    )}
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>

          {/* Offer History */}
          {(stage.includes('SELECTED') || stage.includes('OFFER') || stage.includes('HIRED')) && (
            <Card className="mt-8 border-slate-100 shadow-sm rounded-2xl p-6 bg-white">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-blue-600" /> Contract Status
                  </h3>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 w-1/2" />
                  </div>
                  <span className="text-xs font-black text-blue-600 uppercase">Processing</span>
               </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-100 bg-white shadow-sm rounded-2xl p-6">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Consensus Status</h3>
             <Progress value={(currentApprovals / HR_THRESHOLD) * 100} className="h-2 mb-2" />
             <p className="text-[10px] font-bold text-center text-slate-500">{currentApprovals} of {HR_THRESHOLD} Required Decided</p>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
             <CardHeader className="bg-slate-50 border-b border-slate-100 p-5">
               <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-900">Decision Lock</CardTitle>
             </CardHeader>
             <CardContent className="p-5 space-y-4">
                {isLocked ? (
                  <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed">
                    <Lock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Finalized</p>
                  </div>
                ) : (
                  <>
                    <Select value={decision} onValueChange={setDecision}>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue placeholder="Commit Action..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEND_TO_ASSESSMENT">Authorize Assessment</SelectItem>
                        <SelectItem value="APPROVE_FOR_INTERVIEW">Authorize Interview</SelectItem>
                        <SelectItem value="REQUEST_RE_INTERVIEW">Request Re-Interview</SelectItem>
                        <SelectItem value="REQUEST_RE_ASSESSMENT">Request Re-Assessment</SelectItem>
                        <SelectItem value="APPROVED">Final Selection</SelectItem>
                        <SelectItem value="REJECTED">Reject Application</SelectItem>
                        <SelectItem value="ON_HOLD">Put On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Operational rationale..." 
                      className="rounded-xl border-slate-200 text-xs" 
                      rows={3} 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                    />
                    <Button 
                      className="w-full bg-slate-900 hover:bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest h-11" 
                      disabled={!decision || !notes.trim()}
                      onClick={() => setIsConfirmOpen(true)}
                    >
                      Finalize Directive
                    </Button>
                  </>
                )}
             </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Confirm Authorization</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              You are committing the action <strong>{decision.replace(/_/g, " ")}</strong>.
              Due to Final Clock multi-HR approval rules, <strong className="text-red-500">you will not be able to edit this after confirmation</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-50 p-6 rounded-2xl border italic text-sm text-slate-600">
            &quot;{notes}&quot;
          </div>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl font-bold uppercase text-[10px]"
              onClick={() => setIsConfirmOpen(false)}
            >
              Abort
            </Button>
            <Button
              className="rounded-xl font-bold uppercase text-[10px] bg-blue-600 hover:bg-blue-700"
              disabled={decisionMutation.isPending}
              onClick={() => decisionMutation.mutate({ decision, hr_notes: notes })}
            >
              {decisionMutation.isPending ? "Executing..." : "Execute & Lock Decision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent className="rounded-3xl max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-blue-600" /> Offer Creation Wizard
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              Draft and distribute the digital offer letter for {candidate.name || "the candidate"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Offer Template</Label>
              <Select
                value={offerData.template}
                onValueChange={(v) => setOfferData({ ...offerData, template: v })}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Standard SDE Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard_sde">Standard Template</SelectItem>
                  <SelectItem value="executive">Executive & Management Template</SelectItem>
                  <SelectItem value="contract">Fixed Term Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CTC (Annual Breakup)</Label>
              <Input
                type="number"
                placeholder="e.g. 1500000"
                className="rounded-xl"
                value={offerData.baseCTC}
                onChange={(e) => setOfferData({ ...offerData, baseCTC: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Joining Date</Label>
              <Input
                type="date"
                className="rounded-xl"
                value={offerData.joiningDate}
                onChange={(e) => setOfferData({ ...offerData, joiningDate: e.target.value })}
              />
            </div>

            <div className="col-span-2 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 flex justify-between items-center">
                <div>
                  <p className="font-bold text-[10px] uppercase tracking-widest text-slate-400">PDF Generation</p>
                  <p className="text-xs mt-1 font-bold">Template variables mapped & ready.</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg border-slate-200 bg-white hover:bg-slate-50">
                   <Download className="w-3 h-3 mr-2" /> Preview
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl font-bold uppercase text-[10px]"
              onClick={() => setOfferDialogOpen(false)}
            >
              Discard
            </Button>
            <Button
              className="rounded-xl font-bold uppercase text-[10px] bg-slate-900 text-white"
              disabled={!offerData.baseCTC || !offerData.joiningDate || createOfferMutation.isPending}
              onClick={() => createOfferMutation.mutate()}
            >
              {createOfferMutation.isPending ? "Sending..." : "Dispatch Letter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
}

