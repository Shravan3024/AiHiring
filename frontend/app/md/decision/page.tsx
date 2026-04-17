"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import CandidateTable from "@/components/md/CandidateTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function DecisionPage() {
  const { data: apps = [], isLoading, refetch } = useQuery({
    queryKey: ["md-applications-for-decision"],
    queryFn: async () => (await api.get("/md/applications")).data,
  });

  return (
    <PanelLayout title="MD Decisions" allowedRoles={["MD"]}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Make Decisions</h1>
          <p className="text-sm text-gray-500 mt-1">Approve or reject candidate applications.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Decision Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Loading applications...</div>
            ) : (
              <CandidateTable apps={apps} refresh={refetch} />
            )}
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
}
