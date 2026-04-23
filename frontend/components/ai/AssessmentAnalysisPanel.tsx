"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, Zap, CheckCircle, Scale, Target, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";

interface AssessmentPanelProps {
  applicationId: number;
}

export const AssessmentAnalysisPanel: React.FC<AssessmentPanelProps> = ({ applicationId }) => {
  const { data: analysisRes } = useQuery({
    queryKey: ["ai-analysis-full", applicationId],
    queryFn: async () => (await api.get(`/hr/applications/${applicationId}`)).data,
  });

  // Accessing assessment attempts via relationships or data mapping
  const assessmentData = analysisRes?.data?.assessment_attempts || [];

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
                        score={attempt.ml_score} 
                        icon={<Scale className="w-5 h-5 text-amber-600" />}
                        description="Cosine Similarity & TF-IDF match against gold-standard answer keys."
                        scheme="amber"
                      />
                 </div>
              </div>

              {/* Assessment Trace Table */}
              <Card className="shadow-md border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                   <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" /> Detailed Assessment Trace
                   </CardTitle>
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
                             Q: {qId}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                             {attempt.answers[qId]?.answer_text || "Skipped / No Signal Detected"}
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
