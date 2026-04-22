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
import { Download, FileText, BookOpen, Mic, CheckCircle, Loader2, AlertCircle, MessageSquare, Mail, Phone, MapPin, ShieldAlert, MousePointer2 } from "lucide-react";
import { toast } from "sonner";

interface ApplicationDetails {
  id: number;
  candidate: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    location?: string;
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
}

export default function HRApplicationDetailsPage() {
  const params = useParams();
  const applicationId = Number(params.id);

  const queryClient = useQueryClient();
  const { data: application, isLoading, error } = useQuery({
    queryKey: ["hr-application", applicationId],
    queryFn: async () => (await api.get(`/hr/applications/${applicationId}`)).data,
  });

  const appData = application?.data as ApplicationDetails;

  const { data: aiAnalysisRaw } = useQuery({
    queryKey: ["ai-analysis-full", applicationId],
    queryFn: async () => (await api.get(`/ai/analysis/${applicationId}`)).data,
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{appData.candidate?.name || "N/A"}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${appData.candidate?.email}`} className="font-semibold text-blue-600 hover:underline">
                      {appData.candidate?.email || "N/A"}
                    </a>
                  </div>
                </div>
                {appData.candidate?.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a href={`tel:${appData.candidate.phone}`} className="font-semibold text-blue-600 hover:underline">
                        {appData.candidate.phone}
                      </a>
                    </div>
                  </div>
                )}
                {appData.candidate?.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{appData.candidate.location}</p>
                    </div>
                  </div>
                )}
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
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              HR Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">Send communication to candidate based on AI recommendation</p>
            <div className="flex gap-3 flex-wrap">
              {appData.status === "RECOMMENDED_BY_AI" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  Send Offer Letter
                </Button>
              )}
              {appData.status === "PROCEED_TO_HR" && (
                <>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Schedule Interview
                  </Button>
                  <Button variant="outline">
                    Request Additional Info
                  </Button>
                </>
              )}
              {appData.status === "AUTO_REJECTED" && (
                <Button variant="outline" className="text-gray-600">
                  Send Rejection Notice
                </Button>
              )}
              <Button variant="outline" className="text-gray-600">
                Add Internal Note
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
}

function ProctoringDataWrapper({ applicationId }: { applicationId: number }) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ["proctoring-data", applicationId],
    queryFn: async () => (await api.get(`/ai/analysis/${applicationId}`)).data,
  });

  if (isLoading) return <div className="p-10 text-center text-gray-400">Loading security logs...</div>;
  const attempts = raw?.data?.assessment_attempts || [];

  return <ProctoringReviewPanel attempts={attempts} />;
}
