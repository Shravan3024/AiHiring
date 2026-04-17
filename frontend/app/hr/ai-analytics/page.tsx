"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PanelLayout from "@/components/shared/PanelLayout";
import {
  MDAnalyticsPanel,
  AIDecisionPanel,
} from "@/components/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, TrendingUp, CheckCircle, XCircle, Loader2, AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";

export default function HRAIAnalyticsPage() {
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>();
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>();

  const { data: jobs, isLoading: joboading } = useQuery({
    queryKey: ["hr-jobs"],
    queryFn: async () => (await api.get("/jobs")).data,
  });

  if (joboading) {
    return (
      <PanelLayout title="AI Analytics" allowedRoles={["HR", "MD"]}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="AI Analytics" allowedRoles={["HR", "MD"]}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">AI-powered candidate scoring and decision analysis</p>
        </div>

        {/* Job Filter */}
        {jobs?.data && jobs.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filter by Job</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Badge
                className={`cursor-pointer ${!selectedJobId ? "bg-blue-600" : "bg-gray-200"}`}
                onClick={() => setSelectedJobId(undefined)}
              >
                All Jobs
              </Badge>
              {jobs.data.map((job: any) => (
                <Badge
                  key={job.id}
                  className={`cursor-pointer ${selectedJobId === job.id ? "bg-blue-600" : "bg-gray-200"}`}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  {job.title}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Main Analytics */}
        <div>
          <MDAnalyticsPanel jobId={selectedJobId} departmentId={selectedDeptId} />
        </div>
      </div>
    </PanelLayout>
  );
}
