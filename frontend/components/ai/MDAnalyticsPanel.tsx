"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter,
} from "recharts";
import {
  TrendingUp, Users, Target, CheckCircle, XCircle, Clock,
  DownloadCloud, Filter,
} from "lucide-react";
import { aiApi } from "@/lib/api";

export interface MDAnalyticsPanelProps {
  jobId?: number;
  departmentId?: number;
}

export const MDAnalyticsPanel: React.FC<MDAnalyticsPanelProps> = ({
  jobId,
  departmentId,
}) => {
  const [filterLevel, setFilterLevel] = useState<"all" | "senior" | "mid_level" | "junior">("all");

  // Fetch analytics data using aiApi
  const { data: analyticsData } = useQuery({
    queryKey: ["md-analytics", jobId, departmentId, filterLevel],
    queryFn: async () => {
      const response = await aiApi.getAnalytics(jobId, departmentId, filterLevel !== "all" ? filterLevel : undefined);
      return response.data;
    },
  });

  const stats = analyticsData?.data?.stats || {};
  const candidates = analyticsData?.data?.candidates || [];
  const scoreDistribution = analyticsData?.data?.scoreDistribution || [];
  const decisionBreakdown = analyticsData?.data?.decisionBreakdown || [];
  const skillLevelDistribution = analyticsData?.data?.skillLevelDistribution || [];
  // Prepare chart data
  const timelineData = candidates.reduce((acc: any[], c: any) => {
    const date = new Date(c.created_at).toLocaleDateString();
    const existing = acc.find(x => x.date === date);
    if (existing) {
      existing.applications++;
      if (c.ai_decision === "AUTO_REJECTED") existing.rejected++;
      else if (c.ai_decision === "RECOMMENDED") existing.recommended++;
    } else {
      acc.push({
        date,
        applications: 1,
        rejected: c.ai_decision === "AUTO_REJECTED" ? 1 : 0,
        recommended: c.ai_decision === "RECOMMENDED" ? 1 : 0,
      });
    }
    return acc;
  }, []);

  const decisionColors = {
    AUTO_REJECTED: "#ef4444",
    RECOMMENDED: "#10b981",
    PROCEED_TO_HR: "#f59e0b",
    PENDING: "#6b7280",
  };

  const scoreScatterData = candidates.map((c: any) => ({
    resume: c.resume_score || 0,
    technical: c.technical_score || 0,
    final: c.final_score || 0,
    name: c.candidate_name || `Candidate ${c.id}`,
    decision: c.ai_decision,
  }));

  const handleExport = async () => {
    try {
      const response = await aiApi.exportAnalytics({
        jobId,
        departmentId,
        skillLevel: filterLevel !== "all" ? filterLevel : undefined,
      });
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total_applications || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Recommended</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.recommended_count || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total_applications ? ((stats.recommended_count || 0) / stats.total_applications * 100).toFixed(1) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Auto-Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.rejected_count || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total_applications ? ((stats.rejected_count || 0) / stats.total_applications * 100).toFixed(1) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Avg Final Score</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.average_final_score?.toFixed(1) || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">/100</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Analytics Filters
            </div>
            <Button onClick={handleExport} size="sm" variant="outline">
              <DownloadCloud className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {["all", "senior", "mid_level", "junior"].map((level) => (
            <Button
              key={level}
              variant={filterLevel === level ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterLevel(level as any)}
              className="capitalize"
            >
              {level === "all" ? "All Levels" : level.replace("_", " ")}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Decision Breakdown Pie Chart */}
      {decisionBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Decision Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={decisionBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {decisionBreakdown.map((entry: any) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={decisionColors[entry.name as keyof typeof decisionColors] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Application Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#3b82f6"
                  name="Total Applications"
                />
                <Line
                  type="monotone"
                  dataKey="recommended"
                  stroke="#10b981"
                  name="Recommended"
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke="#ef4444"
                  name="Rejected"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Level Distribution */}
        {skillLevelDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Skill Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillLevelDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Score Distribution */}
      {scoreDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Score Correlation */}
      {scoreScatterData.length > 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Resume vs Technical Score Correlation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="resume" type="number" name="Resume Score" label="Resume" />
                <YAxis dataKey="technical" type="number" name="Technical Score" label="Technical" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  name="Candidates"
                  data={scoreScatterData}
                  fill="#3b82f6"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Recommended Candidates */}
      {candidates.filter((c: any) => c.ai_decision === "RECOMMENDED").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Recommended Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {candidates
                .filter((c: any) => c.ai_decision === "RECOMMENDED")
                .sort((a: any, b: any) => (b.final_score || 0) - (a.final_score || 0))
                .slice(0, 10)
                .map((candidate: any, idx: number) => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-600">#{idx + 1}</Badge>
                      <div>
                        <p className="font-semibold">
                          {candidate.candidate_name || `Candidate ${candidate.id}`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {candidate.skill_level || "—"} • {candidate.years_experience || 0}y exp
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600">
                      {candidate.final_score?.toFixed(1)}/100
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MDAnalyticsPanel;
