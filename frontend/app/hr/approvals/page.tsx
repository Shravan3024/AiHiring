"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, CheckCircle,
  User, Briefcase, Calendar, ChevronRight, Clock, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ApprovalApplication {
  _id: string;
  candidateId?: { name?: string };
  jobId?: { title?: string };
  stage?: string;
  status?: string;
  appliedAt?: string;
}

export default function HRApprovalsPage() {
  const router = useRouter();

  const { data = [], isLoading } = useQuery({
    queryKey: ["hr-applications"],
    queryFn: async () => {
      const res = await hrApi.getApplications();
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  const applications: ApprovalApplication[] = Array.isArray(data) ? data : [];

  // Filter those requiring HR action under the current workflow
  const pendingApprovals = (applications || []).filter((a: { stage?: string; status?: string }) =>
    ["INTERVIEW_COMPLETED", "HR_REVIEW", "PROCEED_TO_HR", "RECOMMENDED_BY_AI", "OFFERED"].includes(a.stage || a.status || "")
  );

  return (
    <PanelLayout title="Action Items" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Executive Approvals</h1>
            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Review and finalize pending candidate transitions</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-400 font-bold text-[10px] uppercase tracking-widest border border-gray-100">
            <Clock className="w-3 h-3" />
            Queued: {pendingApprovals.length}
          </div>
        </div>

        {/* List Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            <ClipboardList className="w-3.5 h-3.5" />
            Pending Operational Decisions
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-50/50 rounded-xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Efficiency Optimized</h3>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight font-medium">No pending approvals detected in the global pipeline.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {pendingApprovals.map((item: ApprovalApplication) => {
                const c = item.candidateId;
                const j = item.jobId;
                const status = item.stage || item.status;
                
                return (
                  <Card key={item._id} className="border-gray-100 shadow-sm hover:border-black transition-all group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                        {/* Status bar (Left or Top) */}
                        <div className="w-full sm:w-1 bg-black shrink-0" />
                        
                        <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:bg-black group-hover:text-white transition-all">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors">{c?.name || "Anonymous Candidate"}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" /> {j?.title || "Staff Position"}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 w-full sm:w-auto self-end sm:self-center">
                            <div className="hidden md:flex flex-col items-end gap-1 px-4 border-r border-gray-50">
                               <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Current Phase</p>
                               <Badge variant="outline" className="h-6 text-[9px] font-bold px-3 border-gray-100 bg-gray-50 text-gray-600 uppercase tracking-widest">
                                 {status}
                               </Badge>
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="w-full sm:w-auto h-10 px-6 text-[10px] font-bold uppercase tracking-widest gap-2 bg-black text-white hover:bg-gray-800 rounded-lg group/btn"
                              onClick={() => router.push(`/hr/candidates/${item._id}`)}
                            >
                              Open Decision Suite <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Policy Notice */}
        <div className="bg-gray-50 rounded-xl p-5 border border-dashed border-gray-200 flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm shrink-0">
            <AlertCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.1em]">Protocol Note</p>
            <p className="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed">Approvals are final and will trigger the next transition in the recruitment lifecycle. Ensure analysis is completed before finalization.</p>
          </div>
        </div>

      </div>
    </PanelLayout>
  );
}
