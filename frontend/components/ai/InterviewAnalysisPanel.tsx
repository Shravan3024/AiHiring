"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Mic, MessageSquare, CheckCircle, AlertCircle, TrendingUp,
  RefreshCw, Brain, Zap, Flag, Heart, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { generateInterviewReport } from "@/lib/utils/generateReports";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

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
    onSuccess: () => {
      toast.success("Interview analyzed successfully.");
      refetch();
      setTranscript('');
    },
  });

  // Fetch interview analysis from the main application profile
  const { data: profileRes, isLoading, refetch } = useQuery({
    queryKey: ['hr-application', applicationId],
    queryFn: async () => {
      const response = await api.get(`/hr/applications/${applicationId}`);
      return response.data;
    },
  });

  const interviewData = profileRes?.data?.interviewAnalysis;
  const sessionData = profileRes?.data?.interview_session;
  const hasSession = !!sessionData?.answers_provided;

  // Chart data for performance metrics
  const chartData = interviewData ? [
    { category: "Technical", value: interviewData.technical_knowledge_score || 0 },
    { category: "Communication", value: interviewData.communication_score || 0 },
    { category: "Problem Solving", value: interviewData.problem_solving_score || 0 },
    { category: "Soft Skills", value: interviewData.soft_skills_score || 0 },
    { category: "Cultural Fit", value: interviewData.cultural_fit_score || 0 },
  ] : [];

  const getRecommendationColor = (recommendation: string) => {
    if (!recommendation) return "bg-gray-600";
    const rec = recommendation.toLowerCase();
    if (rec.includes("strong_yes")) return "bg-green-600";
    if (rec.includes("yes")) return "bg-green-500";
    if (rec.includes("maybe")) return "bg-yellow-600";
    if (rec.includes("no")) return "bg-red-500";
    return "bg-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Transcript Input */}
      {/* Auto Analysis Trigger */}
      {!interviewData && (
        <Card className="border-2 border-blue-100 shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-4 text-white">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mic className="w-5 h-5" />
              Automated Interview Intelligence
            </CardTitle>
            <p className="text-blue-100 text-xs mt-1">Neural core ready for semantic session analysis.</p>
          </div>
          <CardContent className="p-10 text-center space-y-6">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm border-4 border-white ring-8 ring-blue-50/50">
               <Zap className="w-10 h-10 text-blue-600 fill-blue-600 animate-pulse" />
            </div>
            
            <div className="max-w-md mx-auto space-y-2">
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl">Session Intelligence Detected</h4>
              <p className="text-sm text-slate-500 font-medium">The candidate's AI Video Interview session is available for deep-learning analysis. Click below to generate forensic performance insights.</p>
            </div>

            <Button 
              onClick={() => analyzeInterview("")} 
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 px-10 h-14 rounded-2xl font-black text-sm gap-3 shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              {isPending ? <RefreshCw className="animate-spin w-5 h-5" /> : <Brain className="w-5 h-5" />}
              INITIATE NEURAL ANALYSIS
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
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span>Interview Analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => generateInterviewReport({
                      candidate: profileRes?.data?.candidate,
                      job: profileRes?.data?.job,
                      analysis: interviewData,
                      session: profileRes?.data?.interview_session
                    })}
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 border-slate-300 hover:bg-slate-50"
                  >
                    <Download className="w-3 h-3" /> Download Interview Report
                  </Button>
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
