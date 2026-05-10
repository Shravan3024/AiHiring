"use client";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { hrApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { ChevronRight, Loader2 } from "lucide-react";
import CandidateIntelligence from "@/components/hr/IntelligenceDashboard";

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["candidate-profile", id],
    queryFn: () => hrApi.getCandidateById(id).then(r => r.data || {}),
    enabled: !!id,
  });

  const profileData = profile?.data || profile || {};

  if (isLoading) {
    return (
      <PanelLayout title="Candidate Intelligence" allowedRoles={["HR", "ADMIN"]}>
        <div className="space-y-4 p-8">
          <div className="h-48 animate-pulse bg-muted/20 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 animate-pulse bg-muted/20 rounded-lg" />
            <div className="h-96 animate-pulse bg-muted/20 rounded-lg" />
            <div className="h-96 animate-pulse bg-muted/20 rounded-lg" />
          </div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="Candidate Intelligence" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
           <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/hr')}>Dashboard</span>
           <ChevronRight className="w-3 h-3" />
           <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/hr/candidates')}>Candidates</span>
           <ChevronRight className="w-3 h-3" />
           <span className="text-foreground tracking-widest">{profileData?.candidate?.name || profileData?.name || "Candidate Profile"}</span>
        </div>

        {/* Intelligence View */}
        <CandidateIntelligence profileData={profileData} />
      </div>
    </PanelLayout>
  );
}
