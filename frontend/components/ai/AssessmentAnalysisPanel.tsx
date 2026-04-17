"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2, BookOpen, Box, FileText, CheckCircle, AlertCircle,
  TrendingUp, RefreshCw, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

interface AssessmentPanelProps {
  applicationId: number;
  assessmentType?: "all" | "coding" | "mcq" | "design" | "case_study";
}

export const AssessmentAnalysisPanel: React.FC<AssessmentPanelProps> = ({
  applicationId,
  assessmentType = "all",
}) => {
  const { data: assessments } = useQuery({
    queryKey: ["assessments", applicationId],
    queryFn: async () => {
      const response = await fetch(`/api/ai/analysis/${applicationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch assessments");
      return response.json();
    },
  });

  const assessmentData = assessments?.data?.assessment_analyses || [];
  const getIcon = (type: string) => {
    switch (type) {
      case "coding":
        return Code2;
      case "mcq":
        return BookOpen;
      case "design":
        return Box;
      case "case_study":
        return FileText;
      default:
        return TrendingUp;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "coding":
        return "bg-blue-600";
      case "mcq":
        return "bg-green-600";
      case "design":
        return "bg-purple-600";
      case "case_study":
        return "bg-indigo-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {assessmentData.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No assessments completed yet</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={assessmentData[0]?.assessment_type} className="w-full">
          <TabsList className="grid w-full gap-2" style={{
            gridTemplateColumns: `repeat(${assessmentData.length}, minmax(0, 1fr))`
          }}>
            {assessmentData.map((assess: any) => (
              <TabsTrigger key={assess.id} value={assess.assessment_type}>
                {assess.test_name}
              </TabsTrigger>
            ))}
          </TabsList>

          {assessmentData.map((assess: any) => (
            <TabsContent key={assess.id} value={assess.assessment_type} className="space-y-4">
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {React.createElement(getIcon(assess.assessment_type), {
                        className: "w-5 h-5"
                      })}
                      {assess.test_name || assess.assessment_type}
                    </span>
                    <Badge className={cn(
                      "text-white",
                      assess.overall_score >= 70 ? "bg-green-600" :
                      assess.overall_score >= 50 ? "bg-yellow-600" :
                      "bg-red-600"
                    )}>
                      {assess.overall_score?.toFixed(1)}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {assess.assessment_type === "coding" && (
                      <>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600">Correctness</p>
                          <p className="text-xl font-bold text-blue-600">
                            {assess.correctness_score?.toFixed(0)}
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-600">Code Quality</p>
                          <p className="text-xl font-bold text-green-600">
                            {assess.code_quality_score?.toFixed(0)}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-600">Efficiency</p>
                          <p className="text-xl font-bold text-purple-600">
                            {assess.efficiency_score?.toFixed(0)}
                          </p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg">
                          <p className="text-xs text-gray-600">Readability</p>
                          <p className="text-xl font-bold text-indigo-600">
                            {assess.readability_score?.toFixed(0) || "—"}
                          </p>
                        </div>
                      </>
                    )}
                    {assess.assessment_type === "mcq" && (
                      <>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-600">Correct</p>
                          <p className="text-xl font-bold text-green-600">
                            {assess.correct_answers}/{assess.total_questions}
                          </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-gray-600">Incorrect</p>
                          <p className="text-xl font-bold text-red-600">
                            {assess.incorrect_answers}
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-gray-600">Percentage</p>
                          <p className="text-xl font-bold text-yellow-600">
                            {(assess.correct_answers / assess.total_questions * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600">Level</p>
                          <p className="text-xl font-bold text-blue-600 capitalize">
                            {assess.estimated_skill_level}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Complexity Analysis for Coding */}
                  {assess.assessment_type === "coding" && (assess.time_complexity || assess.space_complexity) && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                      {assess.time_complexity && (
                        <div>
                          <p className="text-xs text-gray-600">Time Complexity</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {assess.time_complexity}
                          </p>
                        </div>
                      )}
                      {assess.space_complexity && (
                        <div>
                          <p className="text-xs text-gray-600">Space Complexity</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {assess.space_complexity}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-4">
                    {assess.strengths && assess.strengths.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Strengths
                        </h4>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {assess.strengths.slice(0, 3).map((s: string, idx: number) => (
                            <li key={idx}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {assess.weaknesses && assess.weaknesses.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Areas to Improve
                        </h4>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {assess.weaknesses.slice(0, 3).map((w: string, idx: number) => (
                            <li key={idx}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  {assess.improvement_areas && assess.improvement_areas.length > 0 && (
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700">Recommendations</h4>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {assess.improvement_areas.slice(0, 3).map((rec: string, idx: number) => (
                          <li key={idx}>✓ {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default AssessmentAnalysisPanel;
