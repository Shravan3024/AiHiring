"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { adminApi, hrApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { CandidateComparisonPanel } from "@/components/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Loader2 } from "lucide-react";

export default function CompareCandidatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const candidateIds = searchParams.get("ids")?.split(",").map(id => parseInt(id)) || [];

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: () => adminApi.getJob(jobId!).then(r => r.data?.data || r.data),
    enabled: !!jobId,
  });

  if (candidateIds.length === 0) {
    return (
      <PanelLayout title="Compare Candidates" allowedRoles={["HR", "ADMIN", "MD"]}>
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
          <Users className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">No Candidates Selected</h2>
          <p className="text-gray-400 mt-2">Go back to the pipeline to select candidates for comparison.</p>
          <Button variant="outline" className="mt-6" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pipeline
          </Button>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="Head-to-Head Comparison" allowedRoles={["HR", "ADMIN", "MD"]}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Comparison</h1>
              {jobLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" /> Loading job info...
                </div>
              ) : (
                <p className="text-gray-600 mt-1">Comparing {candidateIds.length} candidates for <span className="font-semibold text-blue-600">{job?.title}</span></p>
              )}
            </div>
          </div>
        </div>

        <div>
          <CandidateComparisonPanel 
            jobId={jobId ? parseInt(jobId) : 0} 
            candidateIds={candidateIds} 
          />
        </div>
      </div>
    </PanelLayout>
  );
}
