"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PanelLayout from "@/components/shared/PanelLayout";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, TrendingUp, CheckCircle, XCircle, Loader2,
  Search, Filter, Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  candidate_name: string;
  candidate_email: string;
  status: string;
  overall_score?: number;
  resume_score?: number;
  technical_score?: number;
  interview_score?: number;
  created_at: string;
}

export default function HRApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ["hr-applications", statusFilter],
    queryFn: async () => {
      // Use the hrApi helper which calls /hr/applications
      const response = await api.get(`/hr/applications${statusFilter ? `?status=${statusFilter}` : ''}`);
      return response.data;
    },
  });

  const applications = applicationsData?.data || [];

  const filteredApplications = applications.filter((app: Application) =>
    !searchTerm || 
    app.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: applications.length,
    recommended: applications.filter((a: Application) => a.status === "RECOMMENDED_BY_AI").length,
    rejected: applications.filter((a: Application) => a.status === "AUTO_REJECTED").length,
    hrReview: applications.filter((a: Application) => a.status === "PROCEED_TO_HR").length,
  };

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

  if (isLoading) {
    return (
      <PanelLayout title="Applications Review" allowedRoles={["HR", "MD"]}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading applications...</span>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="Applications Review" allowedRoles={["HR", "MD"]}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications Review</h1>
          <p className="text-gray-600 mt-1">Manage candidate applications with AI recommendations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Recommended</p>
              <p className="text-2xl font-bold">{stats.recommended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Filter className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">HR Review</p>
              <p className="text-2xl font-bold">{stats.hrReview}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="w-5 h-5 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by candidate name or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="RECOMMENDED_BY_AI">Recommended</SelectItem>
                  <SelectItem value="PROCEED_TO_HR">HR Review</SelectItem>
                  <SelectItem value="AUTO_REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No applications match your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Final Score</TableHead>
                      <TableHead className="text-center">Resume</TableHead>
                      <TableHead className="text-center">Assessment</TableHead>
                      <TableHead className="text-center">Interview</TableHead>
                      <TableHead className="text-center">Applied</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app: Application) => (
                      <TableRow key={app.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.candidate_name}</p>
                            <p className="text-xs text-gray-500">{app.candidate_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{app.job_title}</TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Badge className={getStatusColor(app.status)}>
                              {app.status === "AUTO_REJECTED"
                                ? "Rejected"
                                : app.status === "RECOMMENDED_BY_AI"
                                ? "Recommended"
                                : app.status === "PROCEED_TO_HR"
                                ? "HR Review"
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
                          {new Date(app.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link href={`/hr/applications/${app.id}`}>
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
}
