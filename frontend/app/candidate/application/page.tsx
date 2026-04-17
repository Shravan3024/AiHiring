"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, Upload, Clock, MapPin, DollarSign, Users, FileText,
  TrendingUp, CheckCircle, XCircle, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function CandidateApplication() {
  const [activeTab, setActiveTab] = useState< "status" |"jobs" | "applications">("applications");
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: overview } = useQuery({
    queryKey: ["candidate-overview"],
    queryFn: () => candidateApi.getDashboard().then((r: any) => r.data),
  });

  const { data: applicationsData } = useQuery({
    queryKey: ["candidate-applications"],
    queryFn: async () => {
      try {
        return await candidateApi.getDashboard().then((r: any) => r.data)
      } catch {
        return { data: [] };
      }
    },
    enabled: activeTab === "applications",
  });

  const { data: jobsData } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: () => candidateApi.getJobs().then(r => r.data),
    enabled: activeTab === "jobs",
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => candidateApi.applyJob({ jobId }),
    onSuccess: () => {
      toast.success("Application submitted!");
      // Optionally refresh status
      queryClient.invalidateQueries({ queryKey: ["candidate-overview"] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to apply.";
      toast.error(msg);
    },
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("resume", file);
    try {
      await candidateApi.uploadResume(fd);
      toast.success("Resume uploaded successfully!");
      // Refetch candidate data so parsed resume info appears immediately
      queryClient.invalidateQueries({ queryKey: ["candidate-overview"] });
    } catch {
      toast.error("Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  };

  const apps = overview?.applications || overview?.dashboard?.applications || [];
  const applications = applicationsData?.data || applicationsData?.applications || [];
  const jobs = jobsData?.jobs || jobsData || [];

  const STAGES = ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AUTO_REJECTED":
        return "bg-red-100 text-red-800";
      case "RECOMMENDED_BY_AI":
        return "bg-green-100 text-green-800";
      case "PROCEED_TO_HR":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return "text-gray-600";
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <PanelLayout title="My Application" allowedRoles={["CANDIDATE"]}>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["status", "applications", "jobs"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t === "status" ? "Application Status" : t === "applications" ? "My Applications" : "Browse Jobs"}
          </button>
        ))}
      </div>

      {activeTab === "status" && (
        <div className="space-y-4">
          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="w-4 h-4" /> Upload / Update Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  id="resume-upload-input"
                  accept=".pdf,.doc,.docx" 
                  className="hidden" 
                  onChange={handleResumeUpload} 
                />
                <Button 
                  asChild
                  variant="outline" 
                  disabled={uploading}
                  className="cursor-pointer"
                >
                  <label htmlFor="resume-upload-input">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>{uploading ? "Uploading..." : "Choose File"}</span>
                  </label>
                </Button>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">Supported Formats</span>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-1">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>

              {overview?.candidate?.resume_path && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-semibold text-sm mb-2 text-gray-800">Uploaded Resume Details</h4>
                  <a 
                    href={`http://localhost:5000${overview.candidate.resume_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium text-sm hover:underline flex items-center gap-1 mb-3"
                  >
                    <FileText className="w-4 h-4" /> View Current Document
                  </a>
                  
                  {overview.candidate.skills && overview.candidate.skills.length > 0 && (
                    <div className="mb-2">
                       <p className="text-xs font-semibold text-gray-500 mb-1">Parsed Skills</p>
                       <div className="flex flex-wrap gap-1">
                         {overview.candidate.skills.map((s: string) => (
                           <Badge key={s} variant="secondary" className="text-xs bg-gray-200">{s}</Badge>
                         ))}
                       </div>
                    </div>
                  )}
                  
                  {(overview.candidate.cgpa || overview.candidate.year_of_passout) && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                      {overview.candidate.cgpa && (
                        <p className="text-xs text-gray-600"><span className="font-semibold">CGPA:</span> {overview.candidate.cgpa}</p>
                      )}
                      {overview.candidate.year_of_passout && (
                        <p className="text-xs text-gray-600"><span className="font-semibold">Passout Year:</span> {overview.candidate.year_of_passout}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications */}
          {apps.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No applications yet. Browse jobs to apply.
              </CardContent>
            </Card>
          ) : (
            apps.map((app: { _id: string; stage?: string; status?: string; jobId?: { title: string }; appliedAt?: string }, idx: number) => {
              const status = app.status || "APPLIED";
              const stage = app.stage || "Applied";
              
              // Mapping status/stage to index
              const stageMap: Record<string, number> = {
                "Applied": 1, "APPLIED": 1,
                "Screening": 2, "SCREENING": 2, "PROCEED_TO_HR": 2,
                "Assessment": 3, "ASSESSMENT": 3, "TECHNICAL_ROUND_PENDING": 3, "TECHNICAL_ROUND_IN_PROGRESS": 3,
                "Interview": 4, "INTERVIEW": 4, "INTERVIEW_PENDING": 4, "INTERVIEW_IN_PROGRESS": 4,
                "Offer": 5, "OFFER": 5, "OFFER_GENERATED": 5,
                "Hired": 6, "HIRED": 6
              };

              const currentIdx = stageMap[stage] || stageMap[status] || 1;
              const isRejected = ["REJECTED", "AUTO_REJECTED"].includes(status);
              const progress = isRejected ? 100 : Math.round((currentIdx / STAGES.length) * 100);
              
              return (
                <Card key={app._id || idx}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span>{app.jobId?.title || "Position"}</span>
                      </div>
                      <Badge>{app.stage || app.status || "Applied"}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span><span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {STAGES.map((s, i) => (
                        <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${
                          i < currentIdx - 1 ? "bg-green-100 text-green-700" :
                          i === currentIdx - 1 ? "bg-blue-100 text-blue-700 font-semibold" :
                          "bg-gray-100 text-gray-400"
                        }`}>{s}</span>
                      ))}
                    </div>
                    {app.appliedAt ? (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Application Data Reserving...
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === "applications" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Recommended</p>
                <p className="text-2xl font-bold">
                  {applications.filter((a: any) => a.status === "RECOMMENDED_BY_AI").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <XCircle className="w-5 h-5 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">
                  {applications.filter((a: any) => a.status === "AUTO_REJECTED").length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* Applications Table */}
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No applications yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-center">Resume</TableHead>
                        <TableHead className="text-center">Assessment</TableHead>
                        <TableHead className="text-center">Interview</TableHead>
                        <TableHead className="text-center">Applied</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications
                        .filter((app: any) =>
                          !searchTerm || app.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((app: any) => (
                          <TableRow key={app.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{app.job_title}</TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <Badge className={getStatusColor(app.status)}>
                                  {app.status === "AUTO_REJECTED"
                                    ? "Rejected"
                                    : app.status === "RECOMMENDED_BY_AI"
                                    ? "Recommended"
                                    : app.status === "PROCEED_TO_HR"
                                    ? "Under Review"
                                    : app.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${getScoreColor(app.overall_score)}`}>
                                {app.overall_score ? `${app.overall_score.toFixed(1)}/100` : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${getScoreColor(app.resume_score)}`}>
                                {app.resume_score ? `${app.resume_score.toFixed(0)}` : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${getScoreColor(app.technical_score)}`}>
                                {app.technical_score ? `${app.technical_score.toFixed(0)}` : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${getScoreColor(app.interview_score)}`}>
                                {app.interview_score ? `${app.interview_score.toFixed(0)}` : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-sm text-gray-600">
                              {app.created_at ? new Date(app.created_at).toLocaleDateString() : "Pending"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Link href={`/candidate/application/${app.id}`}>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="space-y-4">
          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="w-4 h-4" /> Upload / Update Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  id="resume-upload-input-jobs"
                  accept=".pdf,.doc,.docx" 
                  className="hidden" 
                  onChange={handleResumeUpload} 
                />
                <Button 
                  asChild
                  variant="outline" 
                  disabled={uploading}
                  className="cursor-pointer"
                >
                  <label htmlFor="resume-upload-input-jobs">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>{uploading ? "Uploading..." : "Choose File"}</span>
                  </label>
                </Button>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">Supported Formats</span>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-1">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browse Jobs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(jobs) && jobs.length === 0 && (
              <p className="text-gray-500 col-span-2 text-center py-8">No open positions found.</p>
            )}
            {Array.isArray(jobs) && jobs.map((job: { _id: string; title: string; type?: string; location?: string; salary?: string; openings?: number; description?: string }) => (
              <Card key={job._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <Badge variant="secondary">{job.type || "Full-time"}</Badge>
                  </div>
                  <div className="space-y-1 mb-3">
                    {job.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{job.location}
                      </p>
                    )}
                    {job.salary && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />{job.salary}
                      </p>
                    )}
                    {job.openings && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />{job.openings} opening{job.openings > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  {job.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                  )}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => applyMutation.mutate(job._id)}
                    disabled={applyMutation.isPending}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
