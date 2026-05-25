"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PanelLayout from "@/components/shared/PanelLayout";
import {
  ResumeAnalysisPanel,
  AssessmentAnalysisPanel,
  InterviewAnalysisPanel,
  AIDecisionPanel,
  ProctoringReviewPanel,
} from "@/components/ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api, { hrApi } from "@/lib/api";
import { generateDossierPDF } from "@/lib/utils/generateDossierPDF";
import { Download, FileText, BookOpen, Mic, CheckCircle, Loader2, AlertCircle, MessageSquare, Mail, Phone, MapPin, ShieldAlert, MousePointer2, Clock, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ApplicationDetails {
  id: number;
  candidate: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    profileImage?: string;
    // Education
    education?: string;
    specialization?: string;
    cgpa?: number;
    year_of_passout?: number;
    experience_years?: number;
    candidate_type?: string;
    domain?: string;
    area_of_interest?: string;
    current_company?: string;
    working_address?: string;
    skills?: string[];
    summary?: string;
  };
  job: {
    id: number;
    title: string;
    department: string;
  };
  status: string;
  aiScore: number;
  scores: {
    resume: number;
    technical: number;
    interview: number;
    aggregate: number;
  };
  appliedAt: string;
  resumeUrl?: string;
}

export default function HRApplicationDetailsPage() {
  const params = useParams();
  const applicationId = Number(params.id);

  const queryClient = useQueryClient();
  const { data: application, isLoading, error } = useQuery({
    queryKey: ["hr-application", applicationId],
    queryFn: async () => (await api.get(`/hr/applications/${applicationId}`)).data,
    refetchInterval: 5000, // Poll every 5s for realtime updates
  });

  const appData = application?.data as ApplicationDetails;

  const { data: aiAnalysisRaw } = useQuery({
    queryKey: ["ai-analysis-full", applicationId],
    queryFn: async () => (await api.get(`/ai/analysis/${applicationId}`)).data,
    refetchInterval: 5000, // Poll every 5s for realtime updates
  });

  const reparseMutation = useMutation({
    mutationFn: async () => (await api.post(`/resume/reparse/${applicationId}`)).data,
    onSuccess: () => {
      toast.success("Resume parsed successfully!");
      queryClient.invalidateQueries({ queryKey: ["hr-application", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["ai-analysis-full", applicationId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Parsing failed");
    }
  });

  const makeDecisionMutation = useMutation({
    mutationFn: async ({ decision, reason }: { decision: string; reason: string }) => 
      (await hrApi.makeDecision(String(applicationId), { decision, reason, comments: "" })).data,
    onSuccess: (res) => {
      toast.success(res.message || "Decision recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["hr-application", applicationId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Decision failed");
    }
  });

  const handleDownload = () => {
    if (appData && aiAnalysisRaw?.data) {
      generateDossierPDF({
        application: appData,
        aiAnalysis: aiAnalysisRaw.data,
      });
    }
  };

  if (isLoading) {
    return (
      <PanelLayout title="Application Review" allowedRoles={["HR", "MD", "ADMIN"]}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading application...</span>
        </div>
      </PanelLayout>
    );
  }

  if (error || !appData) {
    return (
      <PanelLayout title="Application Review" allowedRoles={["HR", "MD", "ADMIN"]}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Failed to load application</p>
              <p className="text-sm text-red-700">Please try again later</p>
            </div>
          </CardContent>
        </Card>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="Application Review" allowedRoles={["HR", "MD", "ADMIN"]}>
      <div className="space-y-6 p-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{appData.job?.title || "Operational Role"}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-600 text-sm">Application ID: #{appData.id}</p>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleDownload}
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] gap-1.5 px-3 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
                    disabled={!aiAnalysisRaw}
                  >
                    <Download className="w-3.5 h-3.5" /> Client Dossier
                  </Button>
                  <Button 
                    onClick={async () => {
                      try {
                        const res = await hrApi.getExecutiveReport(String(applicationId));
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `EXECUTIVE_REPORT_${applicationId}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        toast.success("Executive PDF Generated");
                      } catch (e) {
                         toast.error("Failed to generate report");
                      }
                    }}
                    variant="default" 
                    size="sm" 
                    className="h-8 text-[10px] gap-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold"
                  >
                    <FileText className="w-3.5 h-3.5" /> Executive AI Report
                  </Button>



                  {appData.resumeUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-[10px] gap-1.5 px-3 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold"
                      onClick={() => window.open(appData.resumeUrl, '_blank')}
                    >
                      <Download className="w-3.5 h-3.5" /> Original Resume
                    </Button>
                  )}
                </div>

              </div>
            </div>
            <div className="text-right space-y-2">
              <Badge
                className={
                  appData.status === "AUTO_REJECTED"
                    ? "bg-red-600 font-bold"
                    : appData.status === "RECOMMENDED_BY_AI"
                    ? "bg-green-600 font-bold"
                    : appData.status === "PROCEED_TO_HR"
                    ? "bg-indigo-600 font-bold"
                    : "bg-gray-600 font-bold"
                }
              >
                {appData.status?.replace(/_/g, " ")}
              </Badge>
              {appData.aiScore && (
                <div className="text-3xl font-black text-blue-600 drop-shadow-sm">
                  {Number(appData.aiScore || 0).toFixed(1)}<span className="text-sm text-gray-400">/100</span>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Candidate Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Left col */}
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-lg bg-white border-2 border-blue-200 overflow-hidden shadow-lg shrink-0">
                        <img
                          src={appData.candidate?.profileImage || "/images/default-avatar.png"}
                          alt={appData.candidate?.name}
                          className="w-full h-full object-cover"
                          onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-bold text-gray-900 text-lg">{appData.candidate?.name || "N/A"}</p>
                        {appData.candidate?.candidate_type && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                            appData.candidate.candidate_type === 'FRESHER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {appData.candidate.candidate_type === 'FRESHER' ? 'Fresher' : 'Working Professional'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {appData.candidate?.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <a href={`mailto:${appData.candidate.email}`} className="font-semibold text-blue-600 hover:underline text-sm">
                          {appData.candidate.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {appData.candidate?.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <a href={`tel:${appData.candidate.phone}`} className="font-semibold text-blue-600 hover:underline text-sm">
                          {appData.candidate.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {appData.candidate?.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900 text-sm">{appData.candidate.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right col — Education & Background */}
                <div className="space-y-3 border-l border-blue-200 pl-6">
                  <p className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">Education & Background</p>

                  {(appData.candidate?.education || appData.candidate?.specialization) && (
                    <div>
                      <p className="text-xs text-gray-500">Degree / Specialization</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {[appData.candidate?.education, appData.candidate?.specialization].filter(Boolean).join(' — ')}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {appData.candidate?.cgpa && (
                      <div className="bg-white rounded-xl p-3 border border-blue-100">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">CGPA</p>
                        <p className="text-lg font-black text-blue-700">{appData.candidate.cgpa}</p>
                      </div>
                    )}
                    {appData.candidate?.year_of_passout && (
                      <div className="bg-white rounded-xl p-3 border border-blue-100">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Year of Passout</p>
                        <p className="text-lg font-black text-slate-700">{appData.candidate.year_of_passout}</p>
                      </div>
                    )}
                  </div>

                  {(appData.candidate?.experience_years !== undefined) && (
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {appData.candidate.experience_years === 0 ? 'Fresher (0 years)' : `${appData.candidate.experience_years} year(s)`}
                      </p>
                    </div>
                  )}

                  {appData.candidate?.current_company && (
                    <div>
                      <p className="text-xs text-gray-500">Current Company</p>
                      <p className="font-semibold text-gray-900 text-sm">{appData.candidate.current_company}</p>
                    </div>
                  )}

                  {(appData.candidate?.domain || appData.candidate?.area_of_interest) && (
                    <div>
                      <p className="text-xs text-gray-500">Domain / Interest</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {[appData.candidate?.domain, appData.candidate?.area_of_interest].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  )}

                  {appData.candidate?.skills && appData.candidate.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {appData.candidate.skills.slice(0, 8).map((sk: string, i: number) => (
                          <span key={i} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{sk}</span>
                        ))}
                        {appData.candidate.skills.length > 8 && (
                          <span className="text-[10px] text-gray-400">+{appData.candidate.skills.length - 8} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-600">Final Score</p>
                <p className="text-3xl font-bold text-blue-600">
                  {Number(appData.aiScore || 0).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">/100</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="w-4 h-4 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-600">Resume Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {Number(appData.scores?.resume || 0).toFixed(0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-4 h-4 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600">Assessment Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Number(appData.scores?.technical || 0).toFixed(0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Mic className="w-4 h-4 mx-auto mb-2 text-orange-600" />
                <p className="text-sm text-gray-600">Interview Score</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Number(appData.scores?.interview || 0).toFixed(0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Analysis Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              AI Analysis & Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="decision" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="decision" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Decision</span>
                </TabsTrigger>
                <TabsTrigger value="resume" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Resume</span>
                </TabsTrigger>
                <TabsTrigger value="assessment" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Assessment</span>
                </TabsTrigger>
                <TabsTrigger value="interview" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span className="hidden sm:inline">Interview</span>
                </TabsTrigger>
                <TabsTrigger value="proctoring" className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline">Proctoring</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="decision" className="space-y-4">
                  <AIDecisionPanel applicationId={applicationId} />
                </TabsContent>

                <TabsContent value="resume" className="space-y-4">
                  <ResumeAnalysisPanel
                    applicationId={applicationId}
                    jobId={appData.job.id}
                  />
                </TabsContent>

                <TabsContent value="assessment" className="space-y-4">
                  <AssessmentAnalysisPanel applicationId={applicationId} />
                </TabsContent>

                <TabsContent value="interview" className="space-y-4">
                  <InterviewAnalysisPanel applicationId={applicationId} />
                </TabsContent>

                <TabsContent value="proctoring" className="space-y-4">
                  <ProctoringDataWrapper applicationId={applicationId} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* HR Actions */}
        <Card className="bg-gray-50 border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              HR Operational Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Manual Decision Logic - Always visible for HR control */}
            {true && (
              <div className="p-6 bg-white rounded-lg border border-blue-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Manual Review & Pipeline Movement</h4>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Awaiting HR Decision</Badge>
                </div>
                <p className="text-xs text-slate-500">Select an action to move this candidate to the next stage of the recruitment funnel.</p>
                
                <div className="flex gap-3 flex-wrap pt-2">
                  <Button 
                    onClick={() => makeDecisionMutation.mutate({ decision: 'SEND_TO_ASSESSMENT', reason: 'Approved for technical screening' })}
                    disabled={makeDecisionMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold gap-2"
                  >
                    <BookOpen className="w-4 h-4" /> Approve for Assessment
                  </Button>
                  
                  <Button 
                    onClick={() => makeDecisionMutation.mutate({ decision: 'APPROVE_FOR_INTERVIEW', reason: 'Approved for AI Video Interview' })}
                    disabled={makeDecisionMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-xs font-bold gap-2"
                  >
                    <Mic className="w-4 h-4" /> Approve for Interview
                  </Button>

                  <Button 
                    onClick={() => makeDecisionMutation.mutate({ decision: 'REQUEST_RE_ASSESSMENT', reason: 'HR requested a technical re-assessment.' })}
                    disabled={makeDecisionMutation.isPending}
                    variant="outline"
                    className="border-purple-500 text-purple-700 hover:bg-purple-50 text-xs font-bold gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Request Re-assessment
                  </Button>

                  <Button 
                    onClick={() => makeDecisionMutation.mutate({ decision: 'REQUEST_RE_INTERVIEW', reason: 'HR requested a follow-up AI interview.' })}
                    disabled={makeDecisionMutation.isPending}
                    variant="outline"
                    className="border-orange-500 text-orange-700 hover:bg-orange-50 text-xs font-bold gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Request Re-interview
                  </Button>

                  <Button 
                    onClick={() => makeDecisionMutation.mutate({ decision: 'FINAL_SELECTION', reason: 'Candidate selected after full evaluation.' })}
                    disabled={makeDecisionMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Final Selection
                  </Button>

                  <Button 
                    onClick={() => makeDecisionMutation.mutate({ decision: 'SEND_OFFER', reason: 'Offer letter dispatched.' })}
                    disabled={makeDecisionMutation.isPending}
                    className="bg-cyan-600 hover:bg-cyan-700 text-xs font-bold gap-2"
                  >
                    <Mail className="w-4 h-4" /> Send Offer Letter
                  </Button>

                  <Button 
                    onClick={() => makeDecisionMutation.mutate({ decision: 'ON_HOLD', reason: 'Placed on hold for further review' })}
                    disabled={makeDecisionMutation.isPending}
                    variant="outline"
                    className="border-amber-500 text-amber-700 hover:bg-amber-50 text-xs font-bold gap-2"
                  >
                    <Clock className="w-4 h-4" /> Put on Hold
                  </Button>

                  <Button 
                    onClick={() => {
                      const reason = window.prompt("Reason for rejection:");
                      if (reason) makeDecisionMutation.mutate({ decision: 'REJECTED', reason });
                    }}
                    disabled={makeDecisionMutation.isPending}
                    variant="outline"
                    className="border-red-500 text-red-700 hover:bg-red-50 text-xs font-bold gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject Candidate
                  </Button>
                </div>
              </div>
            )}

            {/* Post-Intelligence Actions */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intelligence-Based Communication</p>
              <div className="flex gap-3 flex-wrap">
                {appData.status === "RECOMMENDED_BY_AI" && (
                  <Button className="bg-green-600 hover:bg-green-700 text-xs font-bold">
                    <CheckCircle className="w-4 h-4 mr-2" /> Send Offer Letter
                  </Button>
                )}
                <Button variant="outline" className="text-slate-600 text-xs font-bold">
                  <MessageSquare className="w-4 h-4 mr-2" /> Add Internal Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
}

function ProctoringDataWrapper({ applicationId }: { applicationId: number }) {
  const { data: appDetails, isLoading } = useQuery({
    queryKey: ["hr-application", applicationId],
    queryFn: async () => (await api.get(`/hr/applications/${applicationId}`)).data,
  });

  if (isLoading) return <div className="p-10 text-center text-gray-400">Loading security logs...</div>;
  
  const data = appDetails?.data || {};
  const attempts = data.assessment_attempts || [];
  const generalViolations = data.proctoringSummary?.violations || [];

  return <ProctoringReviewPanel attempts={attempts} generalViolations={generalViolations} />;
}
