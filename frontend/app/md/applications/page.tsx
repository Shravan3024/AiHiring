"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function ApplicationsPage() {
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["md-applications"],
    queryFn: async () => (await api.get("/md/applications")).data,
  });

  return (
    <PanelLayout title="MD Applications" allowedRoles={["MD"]}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all candidate applications.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Applications List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading applications...</div>
            ) : apps.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No applications found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Candidate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Job</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((app: any) => (
                      <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{app.candidateName || app.Candidate?.name || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{app.Job?.title || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={app.status === "APPROVED" ? "success" : app.status === "REJECTED" ? "destructive" : "default"}>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{new Date(app.applied_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
}
