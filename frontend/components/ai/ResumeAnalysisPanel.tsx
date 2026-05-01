"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText, Upload, CheckCircle, AlertCircle, TrendingUp,
  Download, RefreshCw, Clock, GraduationCap, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface ResumeAnalysisPanelProps {
  applicationId: number;
  jobId?: number;
  onAnalysisComplete?: (data: any) => void;
}

export const ResumeAnalysisPanel: React.FC<ResumeAnalysisPanelProps> = ({
  applicationId,
  jobId,
  onAnalysisComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Parse resume mutation
  const { mutate: parseResume, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", applicationId.toString());
      if (jobId) formData.append("jobId", jobId.toString());

      const response = await api.post("/ai/resume/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      return response.data;
    },
    onSuccess: (data) => {
      onAnalysisComplete?.(data.data);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["resume-analysis", applicationId] });
    },
    onError: (error) => {
      console.error("Resume parsing error:", error);
      toast.error("Failed to upload resume");
    },
  });

  // Reparse mutation
  const { mutate: reparseResume, isPending: isReparsing } = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/ai/resume/reparse/${applicationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-analysis", applicationId] });
      toast.success("Analysis triggered successfully!");
    },
    onError: (error: any) => {
      console.error("Reparse error:", error);
      toast.error(error.response?.data?.message || "Failed to trigger analysis");
    },
  });

  const { data: analysis, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ["resume-analysis", applicationId],
    queryFn: async () => {
      const response = await api.get(`/ai/analysis/${applicationId}`);
      return response.data;
    },
    // Poll every 5 seconds if no resumeData is present (active analysis)
    refetchInterval: (query: any) => {
      return !query.state.data?.data?.resume_analysis ? 5000 : false;
    }
  });

  const resumeData = analysis?.data?.resume_analysis;


  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!resumeData && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition">
          <CardContent className="p-8">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">Upload Resume</h3>
              <p className="text-sm text-gray-500 mb-6">
                PDF, DOCX, or DOC (Max 50MB)
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="resume-upload">
                  <Button
                    asChild
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <span>{selectedFile ? "Change File" : "Choose File"}</span>
                  </Button>
                </label>

                {selectedFile ? (
                  <Button
                    onClick={() => parseResume(selectedFile)}
                    disabled={isPending}
                    className="bg-green-600 hover:bg-green-700 min-w-[140px]"
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Start Upload"
                    )}
                  </Button>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                      onClick={() => reparseResume()}
                      disabled={isReparsing}
                      variant="secondary"
                      className="bg-blue-600 text-white hover:bg-blue-700 min-w-[140px]"
                    >
                      {isReparsing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze Existing"
                      )}
                    </Button>

                    {analysis?.data?.resume_url && (
                      <Button
                        onClick={() => window.open(analysis.data.resume_url, '_blank')}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 min-w-[140px]"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Original
                      </Button>
                    )}
                  </div>

                )}
              </div>

              {selectedFile && (
                <p className="mt-4 text-xs font-medium text-blue-600">
                  Ready to upload: {selectedFile.name}
                </p>
              )}

              <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                * SYSTEM WILL AUTOMATICALLY ANALYZE UPON UPLOAD
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {resumeData && (
        <div className="space-y-4">
          {/* Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resume Analysis</span>
                <Badge className={cn(
                  "text-white",
                  resumeData.overall_score >= 70 ? "bg-green-600" :
                    resumeData.overall_score >= 50 ? "bg-yellow-600" :
                      "bg-red-600"
                )}>
                  {Number(resumeData.overall_score || 0).toFixed(1)}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scores Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Overall Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Number(resumeData.overall_score || 0).toFixed(0)}
                  </p>
                </div>
                {jobId && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600">JD Match</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Number(resumeData.jd_match_score || 0).toFixed(0)}%
                    </p>
                  </div>
                )}
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Experience
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {resumeData.total_years_experience !== undefined ? 
                      (resumeData.total_years_experience > 0 ? `${resumeData.total_years_experience}y` : 'Fresher') 
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              {resumeData.contact_info && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Contact Info</h4>
                  <div className="space-y-1 text-sm">
                    {resumeData.contact_info.name && (
                      <p><strong>Name:</strong> {resumeData.contact_info.name}</p>
                    )}
                    {resumeData.contact_info.email && (
                      <p><strong>Email:</strong> {resumeData.contact_info.email}</p>
                    )}
                    {resumeData.contact_info.phone && (
                      <p><strong>Phone:</strong> {resumeData.contact_info.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {resumeData.education && resumeData.education.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Education
                  </h4>
                  <div className="space-y-1 text-sm">
                    {resumeData.education.map((edu: any, idx: number) => (
                      <p key={idx}>
                        {edu.degree} {edu.specialization && `in ${edu.specialization}`}
                        {edu.year_of_passout && ` (${edu.year_of_passout})`}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {resumeData.skills && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Skills</h4>
                  <div className="space-y-2">
                    {/* Handle object format (categorized) */}
                    {typeof resumeData.skills === 'object' && !Array.isArray(resumeData.skills) && (
                      Object.entries(resumeData.skills).map(([category, skills]: [string, any]) => (
                        <div key={category}>
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            {category.replace(/_/g, " ").toUpperCase()}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(skills) && skills.map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                    {/* Handle array format (flat list) */}
                    {Array.isArray(resumeData.skills) && (
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                {resumeData.strengths && (
                  <div className="p-3 bg-green-50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {resumeData.strengths.slice(0, 3).map((strength: string, idx: number) => (
                        <li key={idx}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {resumeData.weaknesses && (
                  <div className="p-3 bg-red-50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Weaknesses
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {resumeData.weaknesses.slice(0, 3).map((weakness: string, idx: number) => (
                        <li key={idx}>• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* AI Summary */}
              {resumeData.ai_summary && (
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">AI Summary</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {resumeData.ai_summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysisPanel;
