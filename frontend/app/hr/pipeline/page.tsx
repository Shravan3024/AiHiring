"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, User, ChevronRight, Filter, Briefcase, Percent, SortDesc } from "lucide-react";

interface PipelineCandidate {
  applicationId: string | number;
  candidateId: string | number;
  candidateName: string;
  candidateEmail: string;
  position: string;
  applicationStatus: string;
  aiScore: number;
  fitBand: string;
  resumeScore: number;
  daysInStage: number;
}

const STAGE_COLORS: Record<string, "default" | "success" | "warning" | "destructive" | "secondary" | "purple"> = {
  APPLIED: "secondary",
  RESUME_SUBMITTED: "secondary",
  RESUME_EVALUATED: "default",
  ASSESSMENT_UNLOCKED: "default",
  TECHNICAL_ROUND_PENDING: "default",
  TECHNICAL_ROUND_COMPLETED: "purple",
  TECHNICAL_ROUND_IN_PROGRESS: "purple",
  INTERVIEW_UNLOCKED: "warning",
  INTERVIEW_SCHEDULED: "warning",
  INTERVIEW_COMPLETED: "warning",
  INTERVIEW_IN_PROGRESS: "warning",
  RE_INTERVIEW_REQUESTED: "warning",
  PROCEED_TO_HR: "warning",
  RECOMMENDED_BY_AI: "success",
  SELECTED: "success",
  OFFERED: "success",
  REJECTED: "destructive",
  AUTO_REJECTED: "destructive",
  HR_REVIEW: "warning"
};

export default function PipelinePage() {
  const router = useRouter();
  
  // States for backend filtering
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("");
  const [minSkillMatch, setMinSkillMatch] = useState("");
  const [sortByFitBand, setSortByFitBand] = useState("none");

  // Call the new Pipeline API structure
  const { data: pipelineData = [], isLoading } = useQuery({
    queryKey: ["hr-pipeline", search, stageFilter, roleFilter, minSkillMatch, sortByFitBand],
    queryFn: () => hrApi.getPipeline({
      search,
      stage: stageFilter,
      role: roleFilter,
      minSkillMatch,
      sortByFitBand: sortByFitBand === "none" ? undefined : sortByFitBand
    }).then(r => r.data?.data || []),
  });

  const getUIStage = (status: string) => {
    if (!status) return "Applied";
    if (status === "APPLIED" || status === "RESUME_SUBMITTED") return "Applied";
    if (status.includes("RESUME")) return "Screening";
    if (status.includes("ASSESSMENT_UNLOCKED")) return "Assessment";
    if (status.includes("TECHNICAL")) return "Assessment";
    if (status.includes("INTERVIEW")) return "Interview";
    if (status.includes("PROCEED_TO_HR") || status.includes("HR_REVIEW")) return "HR Review";
    if (status.includes("RECOMMENDED") || status.includes("SELECTED") || status.includes("OFFER")) return "Offer";
    if (status.includes("REJECT")) return "Rejected";
    return status;
  }

  const stages = [
    "APPLIED",
    "RESUME_EVALUATED",
    "ASSESSMENT_UNLOCKED",
    "TECHNICAL_ROUND_COMPLETED",
    "INTERVIEW_UNLOCKED",
    "INTERVIEW_COMPLETED",
    "PROCEED_TO_HR",
    "RECOMMENDED_BY_AI",
    "SELECTED"
  ];

  const grouped = stages.reduce((acc, stage) => {
    acc[stage] = pipelineData.filter((a: PipelineCandidate) => a.applicationStatus === stage);
    return acc;
  }, {} as Record<string, PipelineCandidate[]>);

  return (
    <PanelLayout title="Candidate Pipeline Filters & Routing" allowedRoles={["HR", "ADMIN"]}>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search ID or Name..." className="pl-9"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative flex-1">
           <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <Input placeholder="Filter by Role..." className="pl-9"
            value={roleFilter} onChange={e => setRoleFilter(e.target.value)} />
        </div>
        <div className="relative flex-1">
           <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <Input type="number" placeholder="Min Skill Match %" className="pl-9"
            value={minSkillMatch} onChange={e => setMinSkillMatch(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger>
            <Filter className="w-4 h-4 mr-1" />
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map(s => <SelectItem key={s} value={s}>{getUIStage(s)} ({s})</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortByFitBand} onValueChange={setSortByFitBand}>
          <SelectTrigger>
             <SortDesc className="w-4 h-4 mr-1" />
             <SelectValue placeholder="Sort Fit Band" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="none">Sort: Default</SelectItem>
             <SelectItem value="desc">Sort: Highest Fit</SelectItem>
             <SelectItem value="asc">Sort: Lowest Fit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {stages.map(stage => (
          <div key={stage} className="flex-shrink-0 bg-white border rounded-lg px-4 py-2 text-center min-w-[100px]">
            <p className="text-lg font-bold text-gray-900">{grouped[stage]?.length ?? 0}</p>
            <p className="text-xs text-gray-500">{getUIStage(stage)}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 animate-pulse bg-gray-100 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {pipelineData.length === 0 && (
            <Card><CardContent className="p-12 text-center text-gray-400">No applications match the filters</CardContent></Card>
          )}
          {pipelineData.map((candidate: PipelineCandidate) => (
              <div
                key={candidate.applicationId}
                className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm cursor-pointer transition-all"
                onClick={() => router.push(`/hr/candidates/${candidate.applicationId}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{candidate.candidateName} <span className="text-xs text-gray-400">({candidate.candidateId})</span></p>
                    <p className="text-xs text-gray-500">{candidate.candidateEmail}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-grow max-w-[200px] hidden xl:block">
                  {(() => {
                    const status = candidate.applicationStatus;
                    const isRejected = ["REJECTED", "AUTO_REJECTED"].includes(status);
                    const stageMap: Record<string, number> = {
                      "APPLIED": 1, "RESUME_SUBMITTED": 1, "RESUME_EVALUATED": 2,
                      "ASSESSMENT_UNLOCKED": 3, "TECHNICAL_ROUND_IN_PROGRESS": 4, "TECHNICAL_ROUND_COMPLETED": 5,
                      "INTERVIEW_UNLOCKED": 6, "INTERVIEW_IN_PROGRESS": 7, "INTERVIEW_COMPLETED": 8,
                      "PROCEED_TO_HR": 9, "HR_REVIEW": 9, "RECOMMENDED_BY_AI": 9, "SELECTED": 10, "OFFERED": 10
                    };
                    const percent = isRejected ? 100 : Math.round(((stageMap[status] || 1) / 10) * 100);
                    
                    return (
                      <>
                        <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-400">
                          <span>{isRejected ? "Terminated" : "Progress"}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-1000", isRejected ? "bg-red-500" : "bg-blue-600")}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center hidden md:block">
                    <p className="text-sm font-medium">{candidate.position}</p>
                    <p className="text-xs text-gray-400">Skill Match: {candidate.resumeScore}%</p>
                  </div>
                  <Badge variant={STAGE_COLORS[candidate.applicationStatus] || "secondary"}>{getUIStage(candidate.applicationStatus)}</Badge>
                  <div className="text-center hidden lg:block">
                     <p className="text-sm font-bold text-blue-600">{candidate.aiScore}%</p>
                     <p className="text-xs text-gray-400 uppercase tracking-tighter">{candidate.fitBand.replace('_', ' ')}</p>
                  </div>
                  <span className="text-xs text-gray-400 hidden lg:block">
                    {candidate.daysInStage}d in stage
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </PanelLayout>
  );
}
