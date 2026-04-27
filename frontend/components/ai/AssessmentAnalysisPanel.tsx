"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, Zap, CheckCircle, Scale, Target, Layers, Download, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api, { hrApi } from "@/lib/api";
import { generateAssessmentReport } from "@/lib/utils/generateReports";

interface AssessmentPanelProps {
  applicationId: number;
}

export const AssessmentAnalysisPanel: React.FC<AssessmentPanelProps> = ({ applicationId }) => {
  const queryClient = useQueryClient();
  const { data: analysisRes, isLoading } = useQuery({
    queryKey: ["ai-analysis-full", applicationId],
    queryFn: async () => (await api.get(`/hr/applications/${applicationId}`)).data,
  });

  const { mutate: analyze, isPending: isAnalyzing } = useMutation({
    mutationFn: () => hrApi.analyzeAssessment(String(applicationId)),
    onSuccess: () => {
      toast.success("Assessment analyzed successfully!");
      queryClient.invalidateQueries({ queryKey: ["ai-analysis-full", applicationId] });
    },
    onError: () => {
      toast.error("Failed to analyze assessment.");
    }
  });

  // Accessing assessment attempts via relationships or data mapping
  const assessmentData = analysisRes?.data?.assessment_attempts || [];
  const aiAnalysis = analysisRes?.data?.assessmentAnalysis || analysisRes?.data?.assessment_analyses?.[0] || null;

  return (
    <div className="space-y-6">
      {assessmentData.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No assessments captured for this application sequence</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={String(assessmentData[0].id)} className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-xl w-full justify-start overflow-auto">
            {assessmentData.map((attempt: any, idx: number) => (
              <TabsTrigger key={attempt.id} value={String(attempt.id)} className="rounded-lg px-6">
                Attempt #{idx + 1} ({attempt.assessment_type})
              </TabsTrigger>
            ))}
          </TabsList>

          {assessmentData.map((attempt: any) => (
            <TabsContent key={attempt.id} value={String(attempt.id)} className="space-y-6 mt-6">
              {/* Analysis Trigger (If not evaluated yet) */}
              {attempt.status === 'SUBMITTED' && (
                <Card className="border-amber-200 bg-amber-50 shadow-sm animate-pulse">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 rounded-full">
                        <Zap className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-900">Analysis Pending</h4>
                        <p className="text-sm text-amber-700">The candidate has submitted the assessment. Click the button to run the AI deep-dive analysis.</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => analyze()} 
                      disabled={isAnalyzing}
                      className="bg-amber-600 hover:bg-amber-700 text-white gap-2 px-8"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Run AI Analysis
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Main Score & Advanced Analytics Card */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                 {/* Left: Score Box */}
                 <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" /> Technical Score
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="flex items-baseline gap-1">
                          <p className="text-5xl font-black text-slate-900">{Math.round(attempt.final_score)}</p>
                          <p className="text-slate-400 font-bold">/100</p>
                       </div>
                       <div className="mt-6 space-y-4">
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                             <span>AI Scored Weight (LLM)</span>
                             <span>70%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                             <div className="bg-blue-600 h-full w-[70%]" />
                          </div>
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                             <span>ML Deterministic Match</span>
                             <span>30%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                             <div className="bg-slate-400 h-full w-[30%]" />
                          </div>
                       </div>
                    </CardContent>
                 </Card>

                 {/* Center: Module 1 Advanced Metrics */}
                 <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <MetricCard 
                        label="Answer Structure Analysis" 
                        score={attempt.structure_score} 
                        icon={<Layers className="w-5 h-5 text-indigo-600" />}
                        description="Evaluates intro, logical flow, and technical conclusion clarity."
                        scheme="indigo"
                      />
                      <MetricCard 
                        label="Concept Coverage" 
                        score={attempt.concept_coverage} 
                        icon={<Target className="w-5 h-5 text-emerald-600" />}
                        description="Measures breadth of technical nuances addressed in responses."
                        scheme="emerald"
                      />
                      <MetricCard 
                        label="Semantic Match Engine" 
                        score={attempt.ai_score} 
                        icon={<Zap className="w-5 h-5 text-amber-600" />}
                        description="AI semantic alignment with industry-standard answer keys."
                        scheme="amber"
                      />
                 </div>
              </div>

              {/* AI Assessment Executive Summary */}
              {aiAnalysis && (
                <Card className="border-blue-100 bg-blue-50/20 mb-6">
                   <CardHeader className="pb-2 border-b border-blue-50">
                      <CardTitle className="text-sm font-bold text-blue-800 flex items-center gap-2">
                         <TrendingUp className="w-4 h-4" /> AI Performance Executive Summary
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="pt-4">
                      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                         {aiAnalysis.detailed_feedback || "AI summary generation in progress..."}
                      </div>
                      <div className="mt-4 flex gap-4">
                         <div className="bg-white p-2 rounded-lg border border-blue-100 flex-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Domain Expertise</span>
                            <span className="text-sm font-bold text-blue-700">{Math.round(attempt.concept_coverage || 0)}% Coverage</span>
                         </div>
                         <div className="bg-white p-2 rounded-lg border border-blue-100 flex-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Structural Integrity</span>
                            <span className="text-sm font-bold text-blue-700">{Math.round(attempt.structure_score || 0)}/100</span>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              )}

              {/* AI Assessment Executive Summary */}
              {aiAnalysis && (
                <Card className="border-blue-100 bg-blue-50/20 mb-6">
                   <CardHeader className="pb-2 border-b border-blue-50">
                      <CardTitle className="text-sm font-bold text-blue-800 flex items-center gap-2">
                         <TrendingUp className="w-4 h-4" /> AI Performance Executive Summary
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="pt-4">
                      <div className="text-sm text-slate-700 leading-relaxed">
                         <div className="space-y-3">
                            {(aiAnalysis.detailed_feedback || "").split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                               <div key={i} className="flex gap-3 items-start">
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                  <span>{line.replace(/^[•\-\*\d\.]+\s*/, '')}</span>
                               </div>
                            ))}
                            {(!aiAnalysis.detailed_feedback) && <p className="text-slate-400 italic">No summary points generated for this attempt.</p>}
                         </div>
                      </div>
                      <div className="mt-6 flex gap-4">
                         <div className="bg-white p-3 rounded-xl border border-blue-100 flex-1 shadow-sm">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Domain Expertise</span>
                            <div className="flex items-end gap-2">
                               <span className="text-2xl font-black text-blue-700">{Math.round(attempt.concept_coverage || 0)}%</span>
                               <span className="text-[10px] text-slate-400 mb-1 font-bold">Accuracy</span>
                            </div>
                         </div>
                         <div className="bg-white p-3 rounded-xl border border-blue-100 flex-1 shadow-sm">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Structural Integrity</span>
                            <div className="flex items-end gap-2">
                               <span className="text-2xl font-black text-blue-700">{Math.round(attempt.structure_score || 0)}/100</span>
                               <span className="text-[10px] text-slate-400 mb-1 font-bold">Score</span>
                            </div>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              )}

              {/* AI Strengths & Weaknesses from Analysis */}
              {aiAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-emerald-100 bg-emerald-50/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Key Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                            {(aiAnalysis.strengths || []).map((s: string, i: number) => (
                              <li key={i} className="text-xs text-emerald-700 flex items-start gap-2">
                                <span className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                {s}
                              </li>
                            ))}
                        </ul>
                      </CardContent>
                  </Card>

                  <Card className="border-rose-100 bg-rose-50/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                            {(aiAnalysis.weaknesses || []).map((w: string, i: number) => (
                              <li key={i} className="text-xs text-rose-700 flex items-start gap-2">
                                <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                                {w}
                              </li>
                            ))}
                        </ul>
                      </CardContent>
                  </Card>
                </div>
              )}

              {/* Assessment Trace Table */}
              <Card className="shadow-md border-slate-200 overflow-hidden">
                 <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                       <Zap className="w-5 h-5 text-amber-500" /> Detailed Assessment Trace
                    </CardTitle>
                    <Button 
                      onClick={() => generateAssessmentReport({
                        candidate: analysisRes?.data?.candidate,
                        job: analysisRes?.data?.job,
                        attempt: attempt,
                        proctoring: analysisRes?.data?.malpractice_events || []
                      })}
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 border-slate-300 hover:bg-slate-100"
                    >
                      <Download className="w-3 h-3" /> Download Assessment Report
                    </Button>
                 </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold text-slate-900 border-r">Question</TableHead>
                        <TableHead className="font-bold text-slate-900">Candidate Input</TableHead>
                        <TableHead className="font-bold text-slate-900 text-right">Metric Flags</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.keys(attempt.answers || {}).map((qId: string, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-slate-700 max-w-xs border-r">
                             <div className="text-xs text-slate-400 mb-1 font-mono uppercase tracking-tighter">Question Trace</div>
                             <p className="leading-relaxed">
                                {attempt.answers[qId]?.question_text || qId}
                             </p>
                             {attempt.answers[qId]?.correct_answer && (
                               <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded text-[11px] text-emerald-700">
                                  <span className="font-bold uppercase mr-1">Expected:</span>
                                  {attempt.answers[qId].correct_answer}
                               </div>
                             )}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                             <div className="text-xs text-slate-400 mb-1 font-mono uppercase tracking-tighter">Candidate Response</div>
                             <p className="italic">
                                "{attempt.answers[qId]?.answer_text || "No response provided"}"
                             </p>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                             <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 border-slate-200">
                                Trace_{idx + 1}
                             </Badge>
                             <Badge className="bg-slate-100 text-slate-700 border-transparent hover:bg-slate-100">
                                Weight: 1x
                             </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

function MetricCard({ label, score, icon, description, scheme }: any) {
  const colors: any = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
    rose: "bg-rose-600",
    amber: "bg-amber-600"
  };

  return (
    <Card className="shadow-sm border-slate-100 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
          <div className="text-right">
             <p className="text-2xl font-black text-slate-900">{Math.round(score || 0)}%</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AI Evaluated Depth</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">{label}</h4>
          <p className="text-[11px] text-slate-500 mb-4 h-8 overflow-hidden line-clamp-2">{description}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
             <div className={cn("h-full rounded-full transition-all duration-1000", colors[scheme])} style={{ width: `${score}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AssessmentAnalysisPanel;
