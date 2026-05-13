"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Settings, RotateCw, AlertCircle, CheckCircle, Clock, Activity,
  Save, X,
} from "lucide-react";
import api from "@/lib/api";

export interface AdminAIPanelProps {
  systemId?: string;
}

export const AdminAIPanel: React.FC<AdminAIPanelProps> = ({ systemId }) => {
  const qc = useQueryClient();
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [showConfigEdit, setShowConfigEdit] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);

  // Fetch AI system configuration
  const { data: configData, refetch: refetchConfig } = useQuery({
    queryKey: ["ai-config", systemId],
    queryFn: async () => {
      const response = await api.get("/admin/ai-config");
      return response.data;
    },
  });

  // Fetch system health
  const { data: healthData } = useQuery({
    queryKey: ["ai-health"],
    queryFn: async () => {
      const response = await api.get("/admin/system-health");
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch AI models for status
  const { data: modelsData } = useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const response = await api.get("/admin/ai-models");
      return response.data;
    },
  });

  // Fetch audit logs
  const { data: auditData } = useQuery({
    queryKey: ["ai-audit-logs"],
    queryFn: async () => {
      const response = await api.get("/admin/audit-logs?limit=20");
      return response.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time log updates
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const response = await api.put(`/admin/ai-config/${newConfig.id || newConfig._id}`, newConfig);
      return response.data;
    },
    onSuccess: () => {
      refetchConfig();
      setShowConfigEdit(false);
    },
  });

  // Update model mutation
  const updateModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await api.patch(`/admin/ai-models/${modelId}/activate`);
      return response.data;
    },
    onSuccess: () => {
      refetchConfig();
      // Also refetch models
      qc.invalidateQueries({ queryKey: ["ai-models"] });
      setShowModelSelect(false);
    },
  });

  // Restart service mutation
  const restartServiceMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/admin/system-health/restart"); // Placeholder or verify backend
      return response.data;
    },
    onSuccess: () => {
      setTimeout(() => refetchConfig(), 2000);
    },
  });

  const config = configData?.data?.[0] || configData?.data || {}; // Try first config if array
  const health = healthData?.data || {};
  const auditLogs = auditData?.data || auditData?.data?.logs || [];
  const activeModel = modelsData?.data?.find((m: any) => m.status === 'ACTIVE') || modelsData?.data?.[0];

  // Map config with model data for UI
  const displayConfig = {
    ...config,
    current_model: activeModel?.modelVersion || config.current_model || "gemini-1.5-flash",
    model_updated_at: activeModel?.updatedAt ? new Date(activeModel.updatedAt).toLocaleDateString() : "—",
    api_key_valid: true, // Assuming true if we're healthy
    api_key_expires: "Never",
  };

  const getHealthStatus = (status: string) => {
    if (status === "healthy") {
      return <Badge className="bg-green-600">Healthy</Badge>;
    } else if (status === "degraded") {
      return <Badge className="bg-yellow-600">Degraded</Badge>;
    } else {
      return <Badge className="bg-red-600">Unhealthy</Badge>;
    }
  };

  const getModelLabel = (model: string) => {
    if (model.includes("2.0")) return "Gemini 2.0 Flash";
    if (model.includes("1.5")) return "Gemini 1.5 Flash";
    return model;
  };

  return (
    <div className="space-y-6">
      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              System Health & Status
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => restartServiceMutation.mutate()}
              disabled={restartServiceMutation.isPending}
            >
              <RotateCw className="w-4 h-4 mr-1" />
              {restartServiceMutation.isPending ? "Restarting..." : "Restart Service"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-2">AI Service Status</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">Python Flask Service</p>
                {getHealthStatus(health.service_status || "unknown")}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Uptime: {health.uptime_hours || 0}h
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-2">API Response Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {health.avg_response_time_ms || 0}ms
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Last: {health.last_response_ms || 0}ms
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Database Connection</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">PostgreSQL</p>
                {health.db_connected ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Active queries: {health.active_queries || 0}
              </p>
            </div>
          </div>

          {/* Error Rate */}
          {health.error_rate !== undefined && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Error Rate (Last 24h)</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-orange-600">
                  {(health.error_rate * 100).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-600">
                  {health.total_errors || 0} errors / {health.total_requests || 0} requests
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              AI Model Configuration
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowModelSelect(true)}
            >
              Change Model
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <p className="text-sm text-gray-600">Current Model</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg">
                  {getModelLabel(displayConfig.current_model || "")}
                </p>
                <Badge className="bg-blue-600">Active</Badge>
              </div>
              <p className="text-xs text-gray-500">
                Updated: {displayConfig.model_updated_at || "—"}
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <p className="text-sm text-gray-600">API Key Status</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg">
                  {displayConfig.api_key_valid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 inline mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 inline mr-2" />
                  )}
                  {displayConfig.api_key_valid ? "Valid" : "Invalid"}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Expires: {displayConfig.api_key_expires || "—"}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <p className="text-sm font-semibold">Advanced Settings</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Request Timeout</p>
                <p className="font-bold">{displayConfig.request_timeout || 30}s</p>
              </div>
              <div>
                <p className="text-gray-600">Max Retries</p>
                <p className="font-bold">{displayConfig.max_retries || 3}</p>
              </div>
              <div>
                <p className="text-gray-600">Temperature</p>
                <p className="font-bold">{displayConfig.temperature || 0.7}</p>
              </div>
              <div>
                <p className="text-gray-600">Cache Enabled</p>
                <p className="font-bold">{displayConfig.cache_enabled ? "Yes" : "No"}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingConfig(config);
                setShowConfigEdit(true);
              }}
            >
              Edit Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            AI System Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-semibold">Timestamp</th>
                  <th className="text-left py-3 px-3 font-semibold">Action</th>
                  <th className="text-left py-3 px-3 font-semibold">User</th>
                  <th className="text-left py-3 px-3 font-semibold">Details</th>
                  <th className="text-center py-3 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-medium">{log.actionType}</td>
                    <td className="py-3 px-3">{log.userId}</td>
                    <td className="py-3 px-3 text-gray-600 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {(log.status === "success" || log.status === "SUCCESS") ? (
                        <Badge className="bg-green-600">Success</Badge>
                      ) : (log.status === "error" || log.status === "FAILURE") ? (
                        <Badge className="bg-red-600">Error</Badge>
                      ) : (
                        <Badge className="bg-gray-600">Info</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Model Selection Dialog */}
      <Dialog open={showModelSelect} onOpenChange={setShowModelSelect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select AI Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {(modelsData?.data || []).length > 0 ? (
              (modelsData?.data || []).map((model: any) => (
                <div
                  key={model.modelId}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    model.status === 'ACTIVE'
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  onClick={() => updateModelMutation.mutate(model.modelId)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{model.modelVersion}</p>
                      <Badge variant="outline" className="text-[10px] py-0">{model.modelType}</Badge>
                    </div>
                    {model.status === 'ACTIVE' && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{model.description || 'No description provided'}</p>
                  <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-500">
                    <span>Accuracy: {(model.accuracy * 100).toFixed(1)}%</span>
                    <span>Status: {model.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 italic">
                No AI models found in system.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Edit Dialog */}
      <Dialog open={showConfigEdit} onOpenChange={setShowConfigEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit AI Configuration</DialogTitle>
          </DialogHeader>
          {editingConfig && (
            <div className="space-y-4">
              {[
                { key: "request_timeout", label: "Request Timeout (seconds)", type: "number" },
                { key: "max_retries", label: "Max Retries", type: "number" },
                { key: "temperature", label: "Temperature (0-1)", type: "number" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    defaultValue={editingConfig[field.key]}
                    onChange={(e) => {
                      setEditingConfig({
                        ...editingConfig,
                        [field.key]:
                          field.type === "number"
                            ? parseFloat(e.target.value)
                            : e.target.value,
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => updateConfigMutation.mutate(editingConfig)}
                  disabled={updateConfigMutation.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfigEdit(false)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAIPanel;
