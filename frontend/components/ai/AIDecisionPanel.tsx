"use client";
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, XCircle, AlertCircle, TrendingUp, RefreshCw,
  Zap, MessageSquare, Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface AIDecisionPanelProps {
  applicationId: number;
  jobId?: number;
  onDecisionComplete?: (data: any) => void;
}

export const AIDecisionPanel: React.FC<AIDecisionPanelProps> = ({
  applicationId,
  jobId,
  onDecisionComplete,
}) => {
  // Make final decision mutation
  const { mutate: makeFinalDecision, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/decision/make", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          applicationId,
          jobId,
        }),
      });

      if (!response.ok) throw new Error("Decision making failed");
      return response.json();
    },
    onSuccess: (data) => {
      onDecisionComplete?.(data.data);
    },
  });

  // Fetch AI decision
  const { data: decisionData, isLoading } = useQuery({
    queryKey: ["ai-decision", applicationId],
    queryFn: async () => {
      const response = await fetch(`/api/ai/analysis/${applicationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch decision");
      return response.json();
    },
  });

  const decision = decisionData?.data?.ai_decision;
  const resumeAnalysis = decisionData?.data?.resume_analysis;
  const assessmentAnalysis = decisionData?.data?.assessment_analysis;
  const interviewAnalysis = decisionData?.data?.interview_analysis;
  
  const scores = decision && {
    resume: resumeAnalysis?.overall_score || decision.resume_score || 0,
    technical: assessmentAnalysis?.overall_score || decision.technical_assessment_score || 0,
    interview: interviewAnalysis?.overall_score || decision.interview_score || 0,
    final: decision.final_score || 0,
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "AUTO_REJECTED":
        return XCircle;
      case "RECOMMENDED":
        return CheckCircle;
      case "PROCEED_TO_HR":
        return AlertCircle;
      default:
        return TrendingUp;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "AUTO_REJECTED":
        return "bg-red-600 text-white";
      case "RECOMMENDED":
        return "bg-green-600 text-white";
      case "PROCEED_TO_HR":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getDecisionLabel = (decision: string) => {
    switch (decision) {
      case "AUTO_REJECTED":
        return "Auto Rejected";
      case "RECOMMENDED":
        return "Recommended";
      case "PROCEED_TO_HR":
        return "Proceed to HR";
      default:
        return "Pending";
    }
  };

  // Chart data
  const scoreChart = scores ? [
    { name: "Resume", score: scores.resume || 0 },
    { name: "Technical", score: scores.technical || 0 },
    { name: "Interview", score: scores.interview || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      {!decision ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-semibold text-gray-700">Make Final AI Decision</h3>
              <p className="text-sm text-gray-500">
                Complete all assessments before generating final decision
              </p>
              <Button
                onClick={() => makeFinalDecision()}
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 mt-4"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate Final Decision"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Main Decision Card */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Final AI Decision</span>
                <Badge className={getDecisionColor(decision.ai_decision)}>
                  {getDecisionLabel(decision.ai_decision)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Decision Summary Box */}
              <div className={cn(
                "p-4 rounded-lg border-l-4 space-y-2",
                decision.ai_decision === "AUTO_REJECTED"
                  ? "bg-red-50 border-red-500"
                  : decision.ai_decision === "RECOMMENDED"
                  ? "bg-green-50 border-green-500"
                  : "bg-yellow-50 border-yellow-500"
              )}>
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  {React.createElement(getDecisionIcon(decision.ai_decision), {
                    className: "w-5 h-5"
                  })}
                  {getDecisionLabel(decision.ai_decision)}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {decision.decision_reason || decision.summary}
                </p>
              </div>

              {/* Final Score */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">Final Score</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {decision.final_score?.toFixed(1)}/100
                  </p>
                  <p className="text-xs text-gray-600">
                    Threshold: {decision.score_threshold}/100
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {decision.confidence_percentage?.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-600">
                    Decision confidence level
                  </p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Score Breakdown</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={scoreChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Weighted Scores Grid */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Resume Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {scores?.resume?.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">Weight: 30%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Technical Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {scores?.technical?.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">Weight: 40%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Interview Score</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {scores?.interview?.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">Weight: 30%</p>
                </div>
              </div>

              {/* How it's calculated */}
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                <p className="font-semibold mb-2">Calculation Formula:</p>
                <code className="text-xs bg-white p-2 rounded block overflow-auto">
                  Final Score = (Resume × 0.3) + (Technical × 0.4) + (Interview × 0.3)
                </code>
              </div>

              {/* Ranking (if available) */}
              {decision.ranked_position && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Ranked Position</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      #{decision.ranked_position}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Better Than</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {decision.percentile_rank?.toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Add Notes
                </Button>
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Decision Explanation */}
          {decision.decision_reason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Decision Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {decision.decision_reason}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AIDecisionPanel;
