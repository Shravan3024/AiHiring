"use client";
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic, MessageSquare, CheckCircle, TrendingUp,
  RefreshCw, Brain, Zap, Layers, Target, Download, Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { generateInterviewReport } from "@/lib/utils/generateReports";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InterviewAnalysisPanelProps {
  applicationId: number;
}

export const InterviewAnalysisPanel: React.FC<InterviewAnalysisPanelProps> = ({
  applicationId,
}) => {
  const { mutate: analyzeInterview, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.post('/ai/interview/analyze', {
        applicationId,
        interviewType: 'technical',
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Interview analyzed successfully.");
      refetch();
    },
  });

  const { data: profileRes, isLoading, refetch } = useQuery({
    queryKey: ['hr-application', applicationId],
    queryFn: async () => {
      const response = await api.get(`/hr/applications/${applicationId}`);
      return response.data;
    },
  });

  const interviewData = profileRes?.data?.interviewAnalysis;
  // interview_session.questions_asked holds the real response_text from the candidate
  const sessionData = profileRes?.data?.interview_session;
  const highlights = profileRes?.data?.interviewHighlights;

  // Build Q&A trace rows:
  // sessionData.questions_asked has response_text → use it first
  // Fall back to interviewData.qa_pairs (AI analysis pairs, may lack text)
  const traceRows: any[] = (() => {
    const fromSession = (sessionData?.questions_asked || []).filter(
      (q: any) => q.question_text || q.question
    );
    if (fromSession.length > 0) return fromSession;
    return interviewData?.qa_pairs || [];
  })();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="animate-spin mx-auto w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto Analysis Trigger */}
      {!interviewData && (
        <Card className="border-2 border-blue-100 shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-4 text-white">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mic className="w-5 h-5" /> Automated Interview Intelligence
            </CardTitle>
            <p className="text-blue-100 text-xs mt-1">Neural core ready for semantic session analysis.</p>
          </div>
          <CardContent className="p-10 text-center space-y-6">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm border-4 border-white ring-8 ring-blue-50/50">
              <Zap className="w-10 h-10 text-blue-600 fill-blue-600 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl">Session Intelligence Detected</h4>
              <p className="text-sm text-slate-500 font-medium">
                The candidate's AI Video Interview session is available for deep-learning analysis.
              </p>
            </div>
            <Button
              onClick={() => analyzeInterview()}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 px-10 h-14 rounded-lg font-black text-sm gap-3 shadow-xl"
            >
              {isPending ? <RefreshCw className="animate-spin w-5 h-5" /> : <Brain className="w-5 h-5" />}
              INITIATE NEURAL ANALYSIS
            </Button>
          </CardContent>
        </Card>
      )}

      {interviewData && (
        <div className="space-y-6">
          {/* Score + Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" /> Interview Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <p className="text-5xl font-black text-slate-900">{Math.round(interviewData.overall_score || 0)}</p>
                  <p className="text-slate-400 font-bold">/100</p>
                </div>
                <div className="mt-6 space-y-4">
                  {[["AI Scored Weight (LLM)", "70%", "70%", "bg-blue-600"],
                  ["ML Deterministic Match", "30%", "30%", "bg-slate-400"]].map(([label, pct, w, color]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1">
                        <span>{label}</span><span>{pct}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={cn("h-full", color)} style={{ width: w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard label="Answer Structure Analysis" score={interviewData.communication_score || 0} icon={<Layers className="w-5 h-5 text-indigo-600" />} description="Evaluates intro, logical flow, and technical conclusion clarity." scheme="indigo" />
              <MetricCard label="Concept Coverage" score={interviewData.technical_knowledge_score || 0} icon={<Target className="w-5 h-5 text-emerald-600" />} description="Measures breadth of technical nuances addressed in responses." scheme="emerald" />
              <MetricCard label="Semantic Match Engine" score={interviewData.overall_score || 0} icon={<Zap className="w-5 h-5 text-amber-600" />} description="AI semantic alignment with industry-standard answer keys." scheme="amber" />
            </div>
          </div>

          {/* Executive Summary */}
          <Card className="border-blue-100 bg-blue-50/20">
            <CardHeader className="pb-2 border-b border-blue-50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-blue-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> AI Performance Executive Summary
              </CardTitle>
              <Button
                onClick={() => analyzeInterview()}
                disabled={isPending}
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 text-blue-600 border-blue-200 hover:bg-blue-100 m-0"
              >
                {isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Re-analyze Session
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="font-bold text-blue-900 text-sm">
                Final Evaluation: {Math.round(interviewData.overall_score || 0)}%.
                (AI: {Math.round(interviewData.overall_score || 0)}%, Behavioral: {Math.round(interviewData.soft_skills_score || 0)}%).
              </p>
              <div className="mt-3 space-y-2">
                {(interviewData.detailed_evaluation || "").split('\n').filter((l: any) => l.trim()).slice(0, 3).map((line: string, i: number) => (
                  <div key={i} className="flex gap-3 items-start text-sm text-slate-700">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{line.replace(/^[•\-\*\d\.]+\s*/, '').substring(0, 200)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-4">
                {[
                  ["Domain Expertise", `${Math.round(interviewData.technical_knowledge_score || 0)}%`, "Accuracy"],
                  ["Structural Integrity", `${Math.round(interviewData.communication_score || 0)}/100`, "Score"]
                ].map(([label, val, sub]) => (
                  <div key={label} className="bg-white p-3 rounded-xl border border-blue-100 flex-1 shadow-sm">
                    <span className="block text-[10px] font-black text-slateate-400 uppercase tracking-wider mb-1">{label}</span>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-blue-700">{val}</span>
                      <span className="text-[10px] text-slate-400 mb-1 font-bold">{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-emerald-100 bg-emerald-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(interviewData.strengths || []).map((s: string, i: number) => (
                    <li key={i} className="text-xs text-emerald-700 flex items-start gap-2">
                      <span className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />{s}
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
                  {(interviewData.weaknesses || []).map((w: string, i: number) => (
                    <li key={i} className="text-xs text-rose-700 flex items-start gap-2">
                      <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 shrink-0" />{w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* ── Detailed Interview Trace Table ────────────────────────────── */}
          <Card className="shadow-md border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between py-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Detailed Interview Trace
              </CardTitle>
              <Button
                onClick={() => generateInterviewReport({
                  candidate: profileRes?.data?.candidate,
                  job: profileRes?.data?.job,
                  analysis: interviewData,
                  session: sessionData
                })}
                variant="outline" size="sm"
                className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 border-slate-300 hover:bg-slate-100"
              >
                <Download className="w-3 h-3" /> Download Interview Report
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-900 border-r w-[40%]">Question</TableHead>
                    <TableHead className="font-bold text-slate-900">Candidate Input</TableHead>
                    <TableHead className="font-bold text-slate-900 text-right">Metric Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {traceRows.map((pair: any, idx: number) => {
                    const questionText = pair.question_text || pair.question || `Interview Question ${idx + 1}`;
                    // response_text is saved by the backend on every submitResponsePhase5 call
                    const responseText = pair.response_text || pair.answer_text || pair.candidate_response || pair.answer || "";
                    const expectedAns = pair.expectedAnswer || pair.expected_answer || null;
                    const relevanceScore = pair.analysis?.relevance != null ? Math.round(pair.analysis.relevance * 100) : null;
                    const confRaw = pair.analysis?.confidence;
                    const confLabel = confRaw != null ? (confRaw > 0.7 ? "High" : confRaw > 0.4 ? "Med" : "Low") : null;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold text-slate-700 border-r align-top">
                          <div className="text-xs text-slate-400 mb-1 font-mono uppercase tracking-tighter">Question Trace</div>
                          <p className="leading-relaxed text-sm">Q: {questionText}</p>
                          {expectedAns && (
                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-700">
                              <span className="font-black uppercase mr-2 text-[9px] bg-emerald-200 px-1.5 py-0.5 rounded">Expected</span>
                              {expectedAns}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm align-top">
                          <div className="text-xs text-slate-400 mb-1 font-mono uppercase tracking-tighter">Candidate Response</div>
                          <p className={cn(
                            "italic p-3 rounded-xl border text-sm leading-relaxed",
                            responseText
                              ? "bg-slate-50 border-slate-100 text-slate-700"
                              : "bg-amber-50 border-amber-100 text-amber-600"
                          )}>
                            {responseText ? `"${responseText}"` : "No verbal response recorded."}
                          </p>
                          {(pair.analysis?.keywords || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pair.analysis.keywords.slice(0, 5).map((kw: string, ki: number) => (
                                <span key={ki} className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 rounded px-1.5 py-0.5 font-bold">{kw}</span>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right align-top">
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase font-black text-slate-400 border-slate-200 px-2">
                              Trace_{idx + 1}
                            </Badge>
                            {relevanceScore !== null && (
                              <Badge className={cn("text-[10px] font-bold border-transparent",
                                relevanceScore >= 70 ? "bg-emerald-100 text-emerald-700" :
                                  relevanceScore >= 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                              )}>
                                Relevance: {relevanceScore}%
                              </Badge>
                            )}
                            {confLabel && (
                              <Badge className="bg-slate-100 text-slate-600 border-transparent text-[10px] font-bold">
                                Conf: {confLabel}
                              </Badge>
                            )}
                            {pair.response_duration_seconds && (
                              <Badge className="bg-blue-50 text-blue-600 border-transparent text-[10px] font-bold">
                                {pair.response_duration_seconds}s
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {traceRows.length === 0 && (
                <div className="p-10 text-center text-slate-400 italic">No Q&A traces captured for this session.</div>
              )}
            </CardContent>
          </Card>

          {/* ── Video Highlights Section ─────────────────────────────────── */}
          {highlights && (
            <Card className="shadow-md border-slate-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 py-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                    <Video className="w-5 h-5 text-blue-400" /> Interview Video Highlights
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {highlights.overallScore != null && (
                      <Badge className="bg-blue-600 text-white border-transparent text-xs font-bold">
                        Score: {Math.round(highlights.overallScore)}/100
                      </Badge>
                    )}
                    {highlights.status && (
                      <Badge className={cn("border-transparent text-xs font-bold uppercase",
                        highlights.status === 'COMPLETED' ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                      )}>
                        {highlights.status}
                      </Badge>
                    )}
                  </div>
                </div>
                {highlights.startedAt && (
                  <p className="text-slate-400 text-xs mt-1">
                    Session: {new Date(highlights.startedAt).toLocaleString()}
                    {highlights.endedAt && ` → ${new Date(highlights.endedAt).toLocaleString()}`}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6">

                {/* Main video player */}
                {highlights.videoUrl ? (
                  <div className="rounded-lg overflow-hidden bg-black aspect-video border border-slate-200 shadow-lg">
                    <video controls className="w-full h-full" src={highlights.videoUrl}>
                      Your browser does not support video playback.
                    </video>
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 aspect-video flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <Video className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold text-sm">No full session recording available</p>
                      <p className="text-slate-300 text-xs">Per-question clips are shown below</p>
                    </div>
                  </div>
                )}

                {/* AI session highlights bullets */}
                {(highlights.aiHighlights || []).length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-3">AI-Generated Highlights</h4>
                    <div className="space-y-2">
                      {highlights.aiHighlights.map((h: any, i: number) => (
                        <div key={i} className="flex gap-3 items-start text-sm text-blue-700">
                          <span className="font-black text-blue-400 shrink-0">#{i + 1}</span>
                          <span>{typeof h === 'string' ? h : h.summary || h.text || JSON.stringify(h)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-question clip cards */}
                {(highlights.highlights || []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
                      Per-Question Response Review ({highlights.highlights.length} questions)
                    </h4>
                    <div className="space-y-4">
                      {highlights.highlights.map((h: any, idx: number) => (
                        <div key={idx} className="border border-slate-100 rounded-lg overflow-hidden bg-white shadow-sm">
                          {/* Header row */}
                          <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0">
                                Q{idx + 1}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 leading-tight">{h.question}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  Duration: {h.duration}s &nbsp;·&nbsp; At: {h.timestamp}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                              <Badge className={cn("text-[10px] font-bold border-transparent",
                                h.score >= 70 ? "bg-emerald-100 text-emerald-700" :
                                  h.score >= 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                              )}>
                                {h.score}% relevance
                              </Badge>
                              <Badge className={cn("text-[10px] font-bold border-transparent",
                                h.confidence === 'High' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                              )}>
                                {h.confidence} conf.
                              </Badge>
                              {h.sentiment && (
                                <Badge className={cn("text-[10px] font-bold border-transparent",
                                  h.sentiment === 'Positive' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                )}>
                                  {h.sentiment}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            {/* Per-question video clip */}
                            {h.recordingPath && (
                              <video controls className="w-full rounded-xl bg-black max-h-52" src={h.recordingPath}>
                                Video not supported
                              </video>
                            )}

                            {/* Response transcript */}
                            {h.responseText ? (
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verbal Response</p>
                                <p className="text-sm text-slate-700 italic leading-relaxed">"{h.responseText}"</p>
                              </div>
                            ) : (
                              <p className="text-xs text-amber-500 italic bg-amber-50 rounded-lg p-2 border border-amber-100">
                                No verbal response transcript captured for this question.
                              </p>
                            )}

                            {/* Keywords */}
                            {(h.keywords || []).length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {h.keywords.map((kw: string, ki: number) => (
                                  <span key={ki} className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 rounded px-1.5 py-0.5 font-bold">{kw}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
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

export default InterviewAnalysisPanel;
