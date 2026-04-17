"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

interface Application {
  _id: string;
  candidateId?: { _id: string; name: string; email: string } | string;
  jobId?: { _id: string; title: string } | string;
  status: string;
  stage?: string;
  aiScore?: number;
}

export default function HRCandidatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["hr-applications"],
    queryFn: () => hrApi.getApplications().then(r => r.data?.data || []),
  });

  const filtered = applications.filter((a: Application) => {
    const c = typeof a.candidateId === "object" ? a.candidateId : null;
    const name = c?.name || "";
    const email = c?.email || "";
    return !search || name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <PanelLayout title="Global Talent Pool" allowedRoles={["HR", "ADMIN"]}>
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl font-black tracking-tight text-gray-900">Candidates</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Manage and review all active applications across the recruitment funnel.</p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name, email or ID..." 
              className="pl-9 bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="bg-white border rounded-xl overflow-hidden shadow-xs ring-1 ring-black/5">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 border-b text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <div className="col-span-4">Candidate Details</div>
              <div className="col-span-3">Applied For</div>
              <div className="col-span-2">Pipeline Stage</div>
              <div className="col-span-2 text-center">AI Match</div>
              <div className="col-span-1"></div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {isLoading && [1,2,3].map(i => (
                <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
              
              {!isLoading && filtered.length === 0 && (
                <div className="p-16 text-center">
                  <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No candidates found matching your criteria</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                </div>
              )}

              {filtered.map((app: Application) => {
                const c = typeof app.candidateId === "object" ? app.candidateId : null;
                const j = typeof app.jobId === "object" ? app.jobId : null;
                const stage = app.stage || app.status || "APPLIED";
                
                return (
                  <div 
                    key={app._id} 
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50/30 cursor-pointer transition-colors items-center"
                    onClick={() => router.push(`/hr/candidates/${app._id}`)}
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm font-bold text-xs ring-2 ring-white">
                        {(c?.name || "U")[0].toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm text-gray-900 leading-none mb-1">{c?.name || "Unknown Candidate"}</p>
                        <p className="text-xs text-gray-500 truncate">{c?.email}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-3 truncate">
                      <p className="text-sm font-medium text-gray-700">{j?.title || "N/A"}</p>
                    </div>
                    
                    <div className="col-span-2">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] font-bold tracking-tight rounded-md border shadow-xs px-2 py-0.5 ${
                          stage === 'SELECTED' ? 'bg-green-50 text-green-700 border-green-100' :
                          stage === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}
                      >
                        {stage}
                      </Badge>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      {typeof app.aiScore === 'number' && app.aiScore > 0 ? (
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-sm font-black ${app.aiScore >= 80 ? 'text-green-600' : app.aiScore >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                            {Math.round(app.aiScore)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic">Pending</span>
                      )}
                    </div>
                    
                    <div className="col-span-1 flex justify-end">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </PanelLayout>
  );
}
