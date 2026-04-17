"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, AlertCircle, TrendingUp, Users,
  Award, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
} from "recharts";

export interface CandidateComparisonPanelProps {
  jobId: number;
  candidateIds?: number[];
}

export const CandidateComparisonPanel: React.FC<CandidateComparisonPanelProps> = ({
  jobId,
  candidateIds,
}) => {
  // Fetch ranked candidates
  const { data: rankedData } = useQuery({
    queryKey: ["ranked-candidates", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/ai/candidates/ranked?jobId=${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch rankings");
      return response.json();
    },
  });

  const candidates = rankedData?.data?.candidates || [];
  const displayCandidates = candidateIds
    ? candidates.filter((c: any) => candidateIds.includes(c.id))
    : candidates.slice(0, 5);

  if (displayCandidates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No candidates to compare</p>
        </CardContent>
      </Card>
    );
  }

  // Chart data
  const comparisonData = displayCandidates.map((candidate: any) => ({
    name: candidate.candidate_name || `Candidate ${candidate.id}`,
    resume: candidate.resume_score || 0,
    technical: candidate.technical_score || 0,
    interview: candidate.interview_score || 0,
    final: candidate.final_score || 0,
  }));

  // Skills comparison
  const skillsData = displayCandidates.map((candidate: any) => ({
    name: candidate.candidate_name || `Candidate ${candidate.id}`,
    technical: candidate.skill_level === "senior" ? 90 :
               candidate.skill_level === "mid_level" ? 70 :
               candidate.skill_level === "junior" ? 50 : 30,
    communication: candidate.communication_score || 0,
    problem_solving: candidate.problem_solving_score || 0,
    cultural_fit: candidate.cultural_fit_score || 0,
  }));

  const getStatusBadge = (decision: string) => {
    switch (decision) {
      case "AUTO_REJECTED":
        return <Badge className="bg-red-600 w-full justify-center">Auto Rejected</Badge>;
      case "RECOMMENDED":
        return <Badge className="bg-green-600 w-full justify-center">Recommended</Badge>;
      case "PROCEED_TO_HR":
        return <Badge className="bg-yellow-600 w-full justify-center">Proceed to HR</Badge>;
      default:
        return <Badge className="bg-gray-600 w-full justify-center">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Candidate Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-semibold">#</th>
                  <th className="text-left py-3 px-3 font-semibold">Candidate</th>
                  <th className="text-center py-3 px-3 font-semibold">Resume</th>
                  <th className="text-center py-3 px-3 font-semibold">Technical</th>
                  <th className="text-center py-3 px-3 font-semibold">Interview</th>
                  <th className="text-center py-3 px-3 font-semibold">Final Score</th>
                  <th className="text-center py-3 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayCandidates.map((candidate: any, idx: number) => (
                  <tr key={candidate.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <Badge className="bg-gray-600 w-6 h-6 flex items-center justify-center p-0">
                        {idx + 1}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {candidate.candidate_name || `Candidate ${candidate.id}`}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={cn(
                        "font-semibold",
                        candidate.resume_score >= 70 ? "text-green-600" :
                        candidate.resume_score >= 50 ? "text-yellow-600" :
                        "text-red-600"
                      )}>
                        {candidate.resume_score?.toFixed(1) || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={cn(
                        "font-semibold",
                        candidate.technical_score >= 70 ? "text-green-600" :
                        candidate.technical_score >= 50 ? "text-yellow-600" :
                        "text-red-600"
                      )}>
                        {candidate.technical_score?.toFixed(1) || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={cn(
                        "font-semibold",
                        candidate.interview_score >= 70 ? "text-green-600" :
                        candidate.interview_score >= 50 ? "text-yellow-600" :
                        "text-red-600"
                      )}>
                        {candidate.interview_score?.toFixed(1) || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-lg text-blue-600">
                        {candidate.final_score?.toFixed(1) || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(candidate.ai_decision)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Score Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Score Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="resume" fill="#3b82f6" />
              <Bar dataKey="technical" fill="#10b981" />
              <Bar dataKey="interview" fill="#f59e0b" />
              <Bar dataKey="final" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skills Radar Comparison */}
      {skillsData.length <= 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Skills & Competencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={skillsData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Technical"
                  dataKey="technical"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Communication"
                  dataKey="communication"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Problem Solving"
                  dataKey="problem_solving"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Cultural Fit"
                  dataKey="cultural_fit"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Comparison Cards */}
      <div className="grid gap-4">
        {displayCandidates.map((candidate: any, idx: number) => (
          <Card key={candidate.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-gray-600"># {idx + 1}</Badge>
                  <span>{candidate.candidate_name || `Candidate ${candidate.id}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-white",
                    candidate.final_score >= 70 ? "bg-green-600" :
                    candidate.final_score >= 50 ? "bg-yellow-600" :
                    "bg-red-600"
                  )}>
                    {candidate.final_score?.toFixed(1)}/100
                  </Badge>
                  {getStatusBadge(candidate.ai_decision)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key attributes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Experience</p>
                  <p className="text-lg font-bold text-blue-600">
                    {candidate.years_experience || 0}y
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Skill Level</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {candidate.skill_level || "—"}
                  </Badge>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Education</p>
                  <p className="text-sm font-bold text-purple-600">
                    {candidate.education || "—"}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="text-sm font-bold text-indigo-600">
                    {candidate.location || "—"}
                  </p>
                </div>
              </div>

              {/* Strengths & Concerns */}
              <div className="grid grid-cols-2 gap-4">
                {candidate.strengths && candidate.strengths.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {candidate.strengths.slice(0, 3).map((s: string, i: number) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {candidate.concerns && candidate.concerns.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Concerns
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {candidate.concerns.slice(0, 3).map((c: string, i: number) => (
                        <li key={i}>⚠ {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CandidateComparisonPanel;
