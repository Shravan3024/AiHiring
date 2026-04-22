"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Mic, MessageSquare, CheckCircle, AlertCircle, TrendingUp,
  RefreshCw, Brain, Zap, Flag, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from "recharts";

interface InterviewAnalysisPanelProps {
  applicationId: number;
  onAnalysisComplete?: (data: any) => void;
}

export const InterviewAnalysisPanel: React.FC<InterviewAnalysisPanelProps> = ({
  applicationId,
  onAnalysisComplete,
}) => {
  const [transcript, setTranscript] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Analyze interview mutation
  const { mutate: analyzeInterview, isPending } = useMutation({
    mutationFn: async (transcript: string) => {
      const response = await api.post('/ai/interview/analyze', {
        applicationId,
        transcript,
        interviewType: 'technical',
      });
      return response.data;
    },
    onSuccess: (data) => {
      onAnalysisComplete?.(data.data);
      setTranscript('');
    },
  });

  // Fetch interview analysis
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['interview-analysis', applicationId],
    queryFn: async () => {
      const response = await api.get(`/ai/analysis/${applicationId}`);
      return response.data;
    },
    refetchInterval: 30000,
  });

  const interviewData = analysis?.data?.interview_analysis;

  // Chart data for performance metrics
  const chartData = interviewData ? [
    { category: "Technical", value: interviewData.technical_knowledge_score || 0 },
    { category: "Communication", value: interviewData.communication_score || 0 },
    { category: "Problem Solving", value: interviewData.problem_solving_score || 0 },
    { category: "Soft Skills", value: interviewData.soft_skills_score || 0 },
    { category: "Cultural Fit", value: interviewData.cultural_fit_score || 0 },
  ] : [];

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes("strong_yes")) return "bg-green-600";
    if (recommendation.includes("yes")) return "bg-green-500";
    if (recommendation.includes("maybe")) return "bg-yellow-600";
    if (recommendation.includes("no")) return "bg-red-500";
    return "bg-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Transcript Input */}
      {!interviewData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600" />
              Add Interview Transcript
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Transcript
              </label>
              <Textarea
                placeholder="Paste interview transcript here. Format:&#10;Q: Question text&#10;A: Answer text..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: Format with Q: for questions and A: for answers for better analysis
              </p>
            </div>
            <Button
              onClick={() => analyzeInterview(transcript)}
              disabled={isPending || !transcript.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Interview...
                </>
              ) : (
                "Analyze Interview"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {interviewData && (
        <div className="space-y-4">
          {/* Overall Score & Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Interview Analysis</span>
                <div className="flex items-center gap-3">
                  <Badge className={cn(
                    "text-white",
                    interviewData.overall_score >= 70 ? "bg-green-600" :
                    interviewData.overall_score >= 50 ? "bg-yellow-600" :
                    "bg-red-600"
                  )}>
                    {Number(interviewData.overall_score || 0).toFixed(1)}/100
                  </Badge>
                  <Badge className={cn(
                    "text-white",
                    getRecommendationColor(interviewData.hire_recommendation)
                  )}>
                    {(interviewData.hire_recommendation || "pending").toUpperCase()}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Skills Radar Chart */}
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={chartData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}

              {/* Detailed Scores */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Technical</p>
                  <p className="text-lg font-bold text-blue-600">
                    {Number(interviewData.technical_knowledge_score || 0).toFixed(0)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Communication</p>
                  <p className="text-lg font-bold text-green-600">
                    {Number(interviewData.communication_score || 0).toFixed(0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Problem Solving</p>
                  <p className="text-lg font-bold text-purple-600">
                    {Number(interviewData.problem_solving_score || 0).toFixed(0)}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-gray-600">Soft Skills</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {Number(interviewData.soft_skills_score || 0).toFixed(0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-600">Cultural Fit</p>
                  <p className="text-lg font-bold text-orange-600">
                    {Number(interviewData.cultural_fit_score || 0).toFixed(0)}
                  </p>
                </div>
              </div>

              {/* Speaking Patterns */}
              {interviewData.confidence_level && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Confidence</p>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {interviewData.confidence_level}
                    </Badge>
                  </div>
                  {interviewData.pace && (
                    <div>
                      <p className="text-xs text-gray-600">Pace</p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {interviewData.pace}
                      </Badge>
                    </div>
                  )}
                  {interviewData.clarity && (
                    <div>
                      <p className="text-xs text-gray-600">Clarity</p>
                      <Badge variant="outline" className="mt-1">
                        {interviewData.clarity.split("_").join(" ")}
                      </Badge>
                    </div>
                  )}
                  {interviewData.hesitation_level && (
                    <div>
                      <p className="text-xs text-gray-600">Hesitation</p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {interviewData.hesitation_level}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Green Flags */}
              {interviewData.green_flags && interviewData.green_flags.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm text-green-700 flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-green-700" /> Green Flags
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {interviewData.green_flags.slice(0, 4).map((flag: string, idx: number) => (
                      <li key={idx}>✓ {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags */}
              {interviewData.red_flags && interviewData.red_flags.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm text-red-700 flex items-center gap-2">
                    <Flag className="w-4 h-4" /> Red Flags
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {interviewData.red_flags.slice(0, 4).map((flag: string, idx: number) => (
                      <li key={idx}>⚠ {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                {interviewData.strengths && interviewData.strengths.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {interviewData.strengths.slice(0, 3).map((s: string, idx: number) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {interviewData.weaknesses && interviewData.weaknesses.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Areas to Improve
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {interviewData.weaknesses.slice(0, 3).map((w: string, idx: number) => (
                        <li key={idx}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Performance Prediction */}
              {interviewData.predicted_on_job_performance && (
                <div className="p-3 border-l-4 border-purple-500 bg-purple-50 rounded space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Performance Prediction
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <strong>On-Job Performance:</strong>{" "}
                      <span className="capitalize font-semibold">
                        {interviewData.predicted_on_job_performance}
                      </span>
                    </p>
                    {interviewData.time_to_productivity_months && (
                      <p>
                        <strong>Time to Productivity:</strong> {interviewData.time_to_productivity_months} months
                      </p>
                    )}
                    {interviewData.retention_probability_percentage && (
                      <p>
                        <strong>Retention Probability:</strong>{" "}
                        {Number(interviewData.retention_probability_percentage || 0).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InterviewAnalysisPanel;
