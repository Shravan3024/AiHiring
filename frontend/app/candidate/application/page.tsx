"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, Upload, Clock, MapPin, DollarSign, Users, FileText,
  TrendingUp, CheckCircle, XCircle, Search, ArrowRight, Filter,
  ExternalLink, MoreHorizontal, FlaskConical, Beaker, Layout, Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function CandidateApplication() {
  const [activeTab, setActiveTab] = useState<"status" | "jobs" | "applications">("applications");
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { setPageTitle } = useUIStore();

  useEffect(() => {
    setPageTitle("My Applications");
  }, []);

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
      queryClient.invalidateQueries({ queryKey: ["candidate-overview"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to apply.");
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

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s?.includes("REJECTED")) return "bg-red-50 text-red-600";
    if (s?.includes("RECOMMENDED") || s?.includes("HIRED")) return "bg-emerald-50 text-emerald-600";
    if (s?.includes("PROCEED") || s?.includes("HR") || s?.includes("REVIEW")) return "bg-blue-50 text-blue-600";
    return "bg-slate-50 text-slate-600";
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return "text-slate-400";
    if (score >= 75) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 w-fit">
        {(["applications", "status", "jobs"] as const).map(t => (
          <button
            key={t}
            onClick={() => { setActiveTab(t); setPageTitle(t === "applications" ? "My Applications" : t === "status" ? "Application Status" : "Browse Jobs"); }}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === t ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:text-slate-900"
            )}
          >
            {t === "applications" ? "Overview" : t === "status" ? "Stage Details" : "Browse Jobs"}
          </button>
        ))}
      </div>

      {activeTab === "applications" && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm rounded-xl bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Active</p>
                  <p className="text-lg font-bold text-slate-900">{applications.length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-sm rounded-xl bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><CheckCircle className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended</p>
                  <p className="text-lg font-bold text-slate-900">{applications.filter((a: any) => a.status === "RECOMMENDED_BY_AI").length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-sm rounded-xl bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Users className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Review</p>
                  <p className="text-lg font-bold text-slate-900">{applications.filter((a: any) => a.status === "PROCEED_TO_HR").length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-sm rounded-xl bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"><XCircle className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rejected</p>
                  <p className="text-lg font-bold text-slate-900">{applications.filter((a: any) => a.status === "AUTO_REJECTED").length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 h-12 bg-white border-slate-100 rounded-lg shadow-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <Button variant="outline" className="h-12 px-6 rounded-lg border-slate-100 bg-white font-bold gap-2 text-slate-600">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>

          {/* Applications List */}
          <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-50 hover:bg-transparent">
                  <TableHead className="px-5 py-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Position & Company</TableHead>
                  <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px] tracking-widest">Current Status</TableHead>
                  <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px] tracking-widest">AI Score</TableHead>
                  <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px] tracking-widest">Applied Date</TableHead>
                  <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px] tracking-widest">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <Briefcase className="w-12 h-12 opacity-20" />
                        <p className="font-medium">No applications found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  applications
                    .filter((app: any) => !searchTerm || app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((app: any, idx: number) => (
                      <TableRow key={app.id || idx} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="px-5 py-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              idx % 3 === 0 ? "bg-blue-50 text-blue-600" : idx % 3 === 1 ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"
                            )}>
                              {idx % 3 === 0 ? <Beaker className="w-5 h-5" /> : idx % 3 === 1 ? <FlaskConical className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{app.job_title || "Software Engineer"}</p>
                              <p className="text-xs text-slate-400 font-medium">AI Hiring System Pvt. Ltd.</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn("px-4 py-1.5 rounded-lg border-none font-bold uppercase text-[9px] tracking-wider", getStatusColor(app.status))}>
                            {app.status?.replace(/_/g, " ") || "APPLIED"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className={cn("text-lg font-black", getScoreColor(app.overall_score))}>
                              {app.overall_score ? app.overall_score.toFixed(0) : "—"}
                            </span>
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Overall</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="text-sm font-bold text-slate-900">{app.created_at ? new Date(app.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Pending"}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Link href={`/candidate/application/${app.id}`}>
                            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                              <ExternalLink className="w-5 h-5" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === "status" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {apps.length > 0 ? apps.map((app: any, idx: number) => {
            const stages = ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"];

            const getStageIdx = (status: string) => {
              const s = status?.toUpperCase() || "";
              if (["HIRED", "ACCEPTED", "OFFER_ACCEPTED"].includes(s)) return 5;
              if (s.includes("OFFER")) return 4;
              if (s.includes("INTERVIEW") || s.includes("VIDEO")) return 3;
              if (s.includes("ASSESSMENT") || s.includes("TECHNICAL")) return 2;
              if (s.includes("SCREENING") || s.includes("RESUME") || s.includes("EVALUATED") || s.includes("SHORTLISTED")) return 1;
              return 0; // Applied
            };

            const currentStageIdx = getStageIdx(app.status);
            const progressPercentage = (currentStageIdx / (stages.length - 1)) * 100;
            const isRejected = app.status?.toUpperCase().includes("REJECTED");

            return (
              <Card key={idx} className="border-none shadow-sm rounded-xl bg-white overflow-hidden p-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-6">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", isRejected ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600")}>
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{app.jobId?.title || "Role Title"}</h3>
                      <p className="text-slate-400 font-medium">Applied on {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "26 Apr 2026"}</p>
                    </div>
                  </div>
                  <Badge className={cn("px-6 py-2 rounded-xl border-none font-bold text-sm", getStatusColor(app.status))}>
                    {app.status?.replace(/_/g, " ") || "In Progress"}
                  </Badge>
                </div>

                <div className="relative pt-10 pb-6 px-4">
                  <div className="absolute top-[68px] left-[60px] right-[60px] h-1.5 bg-slate-100 rounded-full" />
                  <div
                    className={cn("absolute top-[68px] left-[60px] h-1.5 rounded-full transition-all duration-1000", isRejected ? "bg-red-400" : "bg-blue-600")}
                    style={{ width: `calc(${progressPercentage}% - ${progressPercentage > 0 ? '120px' : '0px'})`, minWidth: progressPercentage > 0 ? '20px' : '0' }}
                  />

                  <div className="flex justify-between items-center relative z-10">
                    {stages.map((s, i) => (
                      <div key={s} className="flex flex-col items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-700",
                          i < currentStageIdx ? "bg-emerald-500 text-white" :
                            i === currentStageIdx ? (isRejected ? "bg-red-600 text-white" : "bg-blue-600 text-white animate-pulse") :
                              "bg-white text-slate-200"
                        )}>
                          {i < currentStageIdx ? <CheckCircle className="w-6 h-6" /> :
                            i === currentStageIdx && isRejected ? <XCircle className="w-6 h-6" /> :
                              <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest transition-colors",
                          i === currentStageIdx ? (isRejected ? "text-red-600" : "text-blue-600") : "text-slate-400"
                        )}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          }) : (
            <Card className="border-none shadow-sm rounded-xl bg-white p-20 text-center">
              <FileText className="w-20 h-12 text-slate-100 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-900">No Applications Found</h3>
              <p className="text-slate-500 mt-2">Start by browsing open positions and applying for a role.</p>
              <Button className="mt-8 bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-xl" onClick={() => setActiveTab("jobs")}>Browse Jobs</Button>
            </Card>
          )}
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job: any) => (
              <Card key={job._id} className="border-none shadow-sm rounded-xl bg-white p-6 group hover:shadow-sm hover:-translate-y-1 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none px-4 py-1.5 rounded-lg font-bold">{job.type || "Full-time"}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                <div className="flex flex-wrap gap-6 mt-4 text-slate-400 font-medium">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location || "Remote"}</span>
                  <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> {job.salary || "Competitive"}</span>
                  <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {job.openings || 1} Openings</span>
                </div>
                <p className="text-slate-500 mt-6 leading-relaxed line-clamp-2">{job.description || "Join our team at AI Hiring System and help us build the future of AI-powered industrial solutions."}</p>
                <Button
                  className="w-full mt-10 h-14 rounded-lg bg-slate-900 hover:bg-blue-600 text-white font-bold transition-all shadow-lg shadow-slate-200"
                  onClick={() => applyMutation.mutate(job._id)}
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? "Applying..." : "Apply for this role"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
