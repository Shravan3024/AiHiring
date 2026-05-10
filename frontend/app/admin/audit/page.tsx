"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database, 
  FileLock, 
  Activity, 
  RefreshCw, 
  Download, 
  FileText,
  AlertTriangle,
  History,
  Trash2,
  ChevronRight,
  UserCheck,
  Bot,
  Settings,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AuditLog {
  auditId: string;
  actionType: string;
  userId: string;
  userRole?: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  status?: string;
  timestamp: string;
  oldValue?: any;
  newValue?: any;
  relatedAiModelVersion?: string;
}

const ACTION_MAP: Record<string, string> = {
  HR_DECISION: "HR Decision",
  AI_RECOMMENDATION: "AI Analysis",
  APPROVAL_FLOW: "Approval Workflow",
  RULE_CHANGED: "Policy Update",
  LOGIN: "Auth Access",
  CONFIG_CHANGED: "System Config",
  MODEL_DEPLOYED: "Model Deploy",
  MODEL_ROLLBACK: "Rollback",
  JOB_CREATED: "Job Created",
  JOB_UPDATED: "Job Updated",
  JOB_DELETED: "Job Deleted",
  ACCESS_REVOKED: "Access Revoked"
};

const ACTION_TYPE_ICONS: Record<string, React.ReactNode> = {
  HR_DECISION: <UserCheck className="w-4 h-4 text-blue-500" />,
  AI_RECOMMENDATION: <Bot className="w-4 h-4 text-purple-500" />,
  APPROVAL_FLOW: <FileText className="w-4 h-4 text-indigo-500" />,
  RULE_CHANGED: <Settings className="w-4 h-4 text-orange-500" />,
  CONFIG_CHANGED: <Settings className="w-4 h-4 text-orange-400" />,
  LOGIN: <LogIn className="w-4 h-4 text-green-500" />,
  ACCESS_REVOKED: <Shield className="w-4 h-4 text-red-500" />,
  JOB_CREATED: <RefreshCw className="w-4 h-4 text-green-400" />,
};

export default function AuditPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("logs");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Query: Audit Logs
  const { data: logsResponse, isLoading: logsLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => adminApi.getAuditLogs({ limit: 200 }).then(r => r.data),
  });
  const logs = Array.isArray(logsResponse?.data) ? logsResponse.data : [];

  // Query: Stats
  const { data: statsResponse } = useQuery({
    queryKey: ["audit-stats"],
    queryFn: () => adminApi.getAuditStats().then(r => r.data),
  });
  const stats = statsResponse?.data || { actions: [], status: [] };

  // Query: Retention Policy
  const { data: retentionResponse } = useQuery({
    queryKey: ["retention-policy"],
    queryFn: () => adminApi.getDataRetentionPolicy().then(r => r.data),
  });
  const policy = retentionResponse?.data || {
    resumeRetentionDays: 730,
    interviewVideoRetentionDays: 365,
    archivedCandidateRetentionDays: 180,
    anonymizationEnabled: true,
    autoDeleteEnabled: true
  };

  // Query: System Health
  const { data: healthResponse, isLoading: isHealthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => adminApi.getSystemHealth().then(r => r.data),
  });
  const health = healthResponse?.data || {
    resumeParsingFailures: 0,
    interviewAiCrashes: 0,
    emailFailures: 0,
    longRunningApprovals: 0,
    uptime_hours: 0
  };

  // Mutations
  const updateRetentionMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateDataRetentionPolicy(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retention-policy"] });
      toast.success("Policy updated");
    }
  });

  const retryAiMutation = useMutation({
    mutationFn: (data: { applicationId: string; taskType: string }) => adminApi.triggerAiRetry(data),
    onSuccess: () => {
      toast.success("Retry pipeline triggered");
      refetchHealth();
    },
    onError: () => toast.error("Retry failed")
  });

  const filteredLogs = logs.filter((log: AuditLog) => {
    const searchStr = `${log.actionType} ${log.description} ${log.entityType} ${log.userId}`.toLowerCase();
    const matchSearch = !search || searchStr.includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || log.actionType === actionFilter;
    return matchSearch && matchAction;
  });

  const handleExport = async (format: string = "csv") => {
    try {
      const res = await adminApi.exportAuditLogs(format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit-logs-${new Date().toISOString()}.${format}`);
      document.body.appendChild(link);
      link.click();
      toast.success(`Exported logs as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const getStatusColor = (status?: string) => {
    if (status === "FAILURE" || status === "SUSPICIOUS") return "destructive";
    if (status === "SUCCESS") return "success";
    return "secondary";
  };

  return (
    <PanelLayout title="System Governance & Compliance" allowedRoles={["ADMIN"]}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="pt-4 flex justify-between items-center">
             <div><p className="text-sm font-medium text-blue-600">Total Events</p><h3 className="text-2xl font-bold text-blue-900">{logs.length}</h3></div>
             <FileText className="w-8 h-8 text-blue-200" />
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 border-red-100">
           <CardContent className="pt-4 flex justify-between items-center">
              <div><p className="text-sm font-medium text-red-600">Failed Tasks</p><h3 className="text-2xl font-bold text-red-900">{(health.resumeParsingFailures || 0) + (health.interviewAiCrashes || 0)}</h3></div>
              <AlertCircle className="w-8 h-8 text-red-200" />
           </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
           <CardContent className="pt-4 flex justify-between items-center">
              <div><p className="text-sm font-medium text-green-600">System Status</p><h3 className="text-2xl font-bold text-green-900">{(health.total_errors || 0) < 5 ? "HEALTHY" : "DEGRADED"}</h3></div>
              <CheckCircle className="w-8 h-8 text-green-200" />
           </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border-purple-100">
           <CardContent className="pt-4 flex justify-between items-center">
              <div><p className="text-sm font-medium text-purple-600">AI Version</p><h3 className="text-2xl font-bold text-purple-900">v1.4.2</h3></div>
              <Bot className="w-8 h-8 text-purple-200" />
           </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border p-1 h-12">
          <TabsTrigger value="logs" className="px-6 h-full gap-2"><Shield className="w-4 h-4" /> Audit Registry</TabsTrigger>
          <TabsTrigger value="privacy" className="px-6 h-full gap-2"><FileLock className="w-4 h-4" /> Data Retention & Privacy</TabsTrigger>
          <TabsTrigger value="health" className="px-6 h-full gap-2"><Activity className="w-4 h-4" /> System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div>
                <CardTitle>Immutable Audit Trail</CardTitle>
                <CardDescription>Tracing HR decisions, model changes and system configurations.</CardDescription>
              </div>
              <div className="flex gap-2">
                 <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <Input placeholder="Search logs..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
                 </div>
                 <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="h-9 gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="bg-gray-50/50 border-b p-3 grid grid-cols-12 text-xs font-bold text-gray-400 uppercase">
                  <div className="col-span-1 text-center">Icon</div>
                  <div className="col-span-2">Event Type</div>
                  <div className="col-span-5">Description & Entity</div>
                  <div className="col-span-2">User / IP</div>
                  <div className="col-span-2 text-right pr-4">Timestamp</div>
               </div>
               <div className="divide-y max-h-[600px] overflow-y-auto">
                 {logsLoading ? <div className="p-8 text-center text-gray-400 animate-pulse">Loading trace ledger...</div> : 
                   filteredLogs.map((log: AuditLog) => (
                    <div key={log.auditId} className="p-3 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors">
                       <div className="col-span-1 flex justify-center">{ACTION_TYPE_ICONS[log.actionType] || <History className="w-4 h-4 text-gray-400"/>}</div>
                       <div className="col-span-2">
                          <div className="text-sm font-bold text-gray-900">{ACTION_MAP[log.actionType] || log.actionType.replace(/_/g, " ")}</div>
                          <Badge variant={getStatusColor(log.status)} className="text-[9px] h-4">{log.status}</Badge>
                       </div>
                       <div className="col-span-5 pr-4 space-y-1">
                          <p className="text-sm text-gray-600 line-clamp-1">{log.description}</p>
                          <div className="flex items-center gap-2">
                            {log.entityType && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 rounded-full border border-indigo-100">{log.entityType}</span>}
                            {log.relatedAiModelVersion && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 rounded-full">AI: {log.relatedAiModelVersion}</span>}
                          </div>
                       </div>
                       <div className="col-span-2 text-xs text-gray-500">
                          <div className="font-medium text-gray-900">{log.userId}</div>
                          <div className="flex items-center gap-1"><Shield className="w-3 h-3"/> {log.ipAddress}</div>
                       </div>
                       <div className="col-span-2 text-right pr-4 text-[11px] text-gray-400">
                          <div className="font-semibold text-gray-600">{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                       </div>
                    </div>
                  ))
                 }
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                 <CardHeader className="bg-gray-50"><CardTitle>Retention Duration Policies</CardTitle></CardHeader>
                 <CardContent className="pt-6 space-y-6">
                    {[
                      { label: "Resume Retention", key: "resumeRetentionDays", sub: "Days before auto-deletion of PDF files" },
                      { label: "Interview Video Retention", key: "interviewVideoRetentionDays", sub: "Storage duration for AI video sessions" },
                      { label: "Archived Candidate Data", key: "archivedCandidateRetentionDays", sub: "Persistence for cooling-off application rules" },
                    ].map(field => (
                      <div key={field.key} className="flex justify-between items-center">
                        <div><p className="font-bold text-sm">{field.label}</p><p className="text-[11px] text-gray-400">{field.sub}</p></div>
                        <div className="flex items-center gap-2">
                          <Input type="number" className="w-20 text-right" value={policy[field.key as keyof typeof policy]} onChange={e => updateRetentionMutation.mutate({ [field.key]: parseInt(e.target.value) })} />
                          <span className="text-xs text-gray-400 font-bold">Days</span>
                        </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>

              <Card>
                 <CardHeader className="bg-gray-50"><CardTitle>Data Privacy Controls</CardTitle></CardHeader>
                 <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                       <div className="space-y-0.5"><p className="font-bold text-sm">Data Anonymization Policy</p><p className="text-xs text-gray-400 italic">Mask personal identifiers in training sets & analytics.</p></div>
                       <Switch checked={policy.anonymizationEnabled} onCheckedChange={(v: boolean) => updateRetentionMutation.mutate({ anonymizationEnabled: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                       <div className="space-y-0.5"><p className="font-bold text-sm">Automated Cleanup Service</p><p className="text-xs text-gray-400 italic">Enable background workers to purge expired data blocks.</p></div>
                       <Switch checked={policy.autoDeleteEnabled} onCheckedChange={(v: boolean) => updateRetentionMutation.mutate({ autoDeleteEnabled: v })} />
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg flex gap-3 border border-amber-100">
                       <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /><p className="text-xs text-amber-800 font-medium">Policy updates trigger re-calculation of expiry dates for all active database entities in the next processing cycle.</p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="health">
           <Card>
              <CardHeader className="bg-gray-50 flex flex-row items-center justify-between">
                 <div><CardTitle>Real-time Diagnostics & Recovery</CardTitle><CardDescription>Monitor technical bottlenecks and recovery from pipeline failures.</CardDescription></div>
                 <Button variant="outline" size="sm" className="gap-2" onClick={() => refetchHealth()}>
                    <RefreshCw className={cn("w-3 h-3", isHealthLoading && "animate-spin")}/> Re-run Health Check
                 </Button>
              </CardHeader>
              <CardContent className="p-0">
                 <table className="w-full text-left">
                    <thead className="bg-gray-100/50 border-b text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       <tr><th className="p-4">Service Chain</th><th className="p-4">Current Status</th><th className="p-4">Error Rate</th><th className="p-4 text-right">Failure Recovery</th></tr>
                    </thead>
                    <tbody className="divide-y">
                       {[
                         { name: "Resume Parsing Pipeline", status: health.resumeParsingFailures > 0 ? "Degraded" : "Operational", err: health.resumeParsingFailures, load: "Medium", type: "RESUME_PARSING" },
                         { name: "Gemini Analysis Engine", status: health.interviewAiCrashes > 0 ? "Attention" : "High Priority", err: health.interviewAiCrashes, load: "High", type: "FINAL_DECISION" },
                         { name: "Email Delivery MTA", status: "Active", err: health.emailFailures, load: "Low", type: "EMAIL" },
                       ].map(srv => (
                         <tr key={srv.name} className="hover:bg-gray-50/50">
                            <td className="p-4"><div className="font-bold text-sm">{srv.name}</div><div className="text-[10px] text-gray-400">Load: {srv.load}</div></td>
                            <td className="p-4"><Badge className={cn(srv.err > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700")}>{srv.status}</Badge></td>
                            <td className="p-4"><span className={`font-bold text-sm ${srv.err > 0 ? "text-red-600" : "text-gray-400"}`}>{srv.err} Errors</span></td>
                            <td className="p-4 text-right">
                               <Button size="sm" disabled={srv.err === 0} variant={srv.err > 0 ? "default" : "outline"} className="gap-2 text-[11px]" onClick={() => retryAiMutation.mutate({ applicationId: "FAILED_QUEUE", taskType: srv.type })}>
                                  <RefreshCw className={cn("w-3 h-3", retryAiMutation.isPending && "animate-spin")} /> Retry Failed
                               </Button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
                 <div className="p-8 border-t bg-gray-50/30 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h4 className="font-bold text-sm">Automated Retry Policies</h4>
                       <div className="flex items-center justify-between p-3 bg-white border rounded">
                          <span className="text-xs font-semibold">Auto-retry transient AI timeouts</span>
                          <Switch defaultChecked />
                       </div>
                       <div className="flex items-center justify-between p-3 bg-white border rounded">
                          <span className="text-xs font-semibold">Enable Graceful Fallback Mode</span>
                          <Switch defaultChecked />
                       </div>
                    </div>
                    <div className="bg-blue-600 rounded-lg p-6 text-white flex flex-col justify-between shadow-lg shadow-blue-500/20">
                        <h4 className="font-bold text-lg mb-2">Technical Health Summary</h4>
                        <p className="text-xs text-blue-100 leading-relaxed mb-4">
                           Total Approval Latency: <b>{health.averageApprovalTime || "4.2"} hours</b>. 
                           System encountered <b>{health.total_errors || 0} critical failures</b> in the last 24h. 
                           Status: <span className="font-bold border-b border-blue-300">{(health.total_errors || 0) < 5 ? "STABLE" : "DEGRADED"}</span>
                        </p>
                        
                        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="text-slate-900 border-white bg-slate-100 hover:bg-slate-200 transition-all font-bold">View Detailed Reports</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>System Health Breakdown</DialogTitle>
                              <DialogDescription>Detailed metrics for the last 24 hours.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="flex justify-between border-b pb-2"><span className="text-sm font-medium">Resume Parsing Failures</span><span className="text-sm font-bold text-red-600">{health.resumeParsingFailures}</span></div>
                              <div className="flex justify-between border-b pb-2"><span className="text-sm font-medium">AI Analysis Crashes</span><span className="text-sm font-bold text-red-600">{health.interviewAiCrashes}</span></div>
                              <div className="flex justify-between border-b pb-2"><span className="text-sm font-medium">Average Latency</span><span className="text-sm font-bold">{health.averageApprovalTime}h</span></div>
                              <div className="flex justify-between border-b pb-2"><span className="text-sm font-medium">Database Status</span><Badge className="bg-green-100 text-green-700">ONLINE</Badge></div>
                              <div className="flex justify-between border-b pb-2"><span className="text-sm font-medium">System Uptime</span><span className="text-sm font-bold">{health.uptime_hours || 0}h</span></div>
                            </div>
                          </DialogContent>
                        </Dialog>
                     </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </PanelLayout>
  );
}
