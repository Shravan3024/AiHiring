"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Edit2, GitBranch, CheckCircle } from "lucide-react";

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  jobId?: { _id: string; title: string } | string;
  stages?: string[];
  mandatoryStages?: string[];
  optionalStages?: string[];
  retryRules?: { maxRetries: number; coolOffPeriodDays: number };
  approvalRequired: boolean;
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_MANDATORY = ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"];
const DEFAULT_OPTIONAL = ["BackgroundCheck"];

export default function WorkflowsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", jobId: "all", 
    mandatoryStages: DEFAULT_MANDATORY.join(", "),
    optionalStages: DEFAULT_OPTIONAL.join(", "),
    approvalRequired: "true",
    maxRetries: 3,
    coolOffPeriodDays: 7
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => adminApi.getWorkflows().then(r => r.data?.data || r.data?.workflows || r.data || []),
  });
  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs-select"],
    queryFn: () => adminApi.getJobs().then(r => {
      const list = r.data?.data || r.data?.jobs || r.data || [];
      return list.map((j: any) => ({ _id: String(j.id || j._id), title: j.title }));
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => adminApi.createWorkflow(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workflows"] }); setOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => adminApi.updateWorkflow(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workflows"] }); setOpen(false); },
  });

  function openCreate() {
    setEditing(null);
    setForm({ 
      name: "", description: "", jobId: "all", 
      mandatoryStages: DEFAULT_MANDATORY.join(", "), 
      optionalStages: DEFAULT_OPTIONAL.join(", "),
      approvalRequired: "true",
      maxRetries: 3, coolOffPeriodDays: 7
    });
    setOpen(true);
  }

  function openEdit(wf: Workflow) {
    setEditing(wf);
    setForm({
      name: wf.name,
      description: wf.description || "",
      jobId: typeof wf.jobId === "object" ? wf.jobId?._id : wf.jobId || "all",
      mandatoryStages: wf.mandatoryStages?.join(", ") || (wf.stages ? wf.stages.join(", ") : ""),
      optionalStages: wf.optionalStages?.join(", ") || "",
      approvalRequired: String(wf.approvalRequired),
      maxRetries: wf.retryRules?.maxRetries || 3,
      coolOffPeriodDays: wf.retryRules?.coolOffPeriodDays || 7
    });
    setOpen(true);
  }

  function handleSubmit() {
    const mandatory = form.mandatoryStages.split(",").map(s => s.trim()).filter(Boolean);
    const optional = form.optionalStages.split(",").map(s => s.trim()).filter(Boolean);
    
    // Stage Order resolves to Mandatory followed by Optional (can be dragged in advanced UI)
    const stageOrder = [...mandatory, ...optional];
    
    const payload = {
      workflowName: form.name,
      description: form.description,
      jobId: (form.jobId && form.jobId !== "all") ? form.jobId : undefined,
      mandatoryStages: mandatory,
      optionalStages: optional,
      stageOrder: stageOrder,
      stages: stageOrder,
      retryRules: {
        maxRetries: Number(form.maxRetries),
        coolOffPeriodDays: Number(form.coolOffPeriodDays)
      },
      coolingOffPeriods: { default: Number(form.coolOffPeriodDays) },
      approvalRequired: form.approvalRequired === "true",
    };
    if (editing) updateMutation.mutate({ id: editing._id, data: payload });
    else createMutation.mutate(payload);
  }

  return (
    <PanelLayout title="Hiring Workflows" allowedRoles={["ADMIN"]}>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.length === 0 && (
          <Card className="col-span-2">
            <CardContent className="p-12 text-center text-gray-400">No workflows configured yet</CardContent>
          </Card>
        )}
        {workflows.map((wf: Workflow) => (
          <Card key={wf._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                  {wf.name}
                </CardTitle>
                <div className="flex gap-2 items-center">
                  <Badge variant={wf.isActive ? "success" : "secondary"}>
                    {wf.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => openEdit(wf)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {wf.description && <p className="text-sm text-gray-500 mb-3">{wf.description}</p>}
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex flex-wrap gap-2 items-center">
                   <p className="text-xs font-semibold w-16">Required:</p>
                  {(wf.mandatoryStages || wf.stages || []).map((stage: string, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">{stage}</div>
                    </div>
                  ))}
                </div>
                {wf.optionalStages && wf.optionalStages.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <p className="text-xs font-semibold w-16 text-gray-400">Optional:</p>
                    {wf.optionalStages.map((stage: string, i: number) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs border border-gray-200 border-dashed">{stage}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 items-center text-xs text-gray-500 mb-2 p-2 bg-gray-50 rounded">
                 <span><b className="text-gray-700">Retries:</b> {wf.retryRules?.maxRetries || 3}</span>
                 <span><b className="text-gray-700">Cool-off:</b> {wf.retryRules?.coolOffPeriodDays || 7} days</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {wf.approvalRequired && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" /> Approval required
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Workflow" : "Create Workflow"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the configuration for this hiring workflow." : "Define a new sequence of hiring stages and rules."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Workflow Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Engineering Hiring" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description..." />
            </div>
            <div>
              <Label>Link to Job (optional)</Label>
              <Select value={form.jobId} onValueChange={v => setForm(f => ({ ...f, jobId: v }))}>
                <SelectTrigger><SelectValue placeholder="All jobs (global)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All jobs (global)</SelectItem>
                  {jobs.map((j: { _id: string; title: string }) => (
                    <SelectItem key={j._id} value={j._id}>{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mandatory Stages (Ordered)</Label>
                <Textarea rows={2} value={form.mandatoryStages}
                  onChange={e => setForm(f => ({ ...f, mandatoryStages: e.target.value }))}
                  placeholder="Applied, Screening, Interview, Offer, Hired" />
              </div>
              <div>
                <Label>Optional Stages</Label>
                <Textarea rows={2} value={form.optionalStages}
                  onChange={e => setForm(f => ({ ...f, optionalStages: e.target.value }))}
                  placeholder="Assessment, BackgroundCheck" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border">
               <div>
                  <Label className="text-xs">Max Stage Retries</Label>
                  <Input type="number" min="0" value={form.maxRetries} onChange={e => setForm(f => ({ ...f, maxRetries: parseInt(e.target.value) }))} />
               </div>
               <div>
                  <Label className="text-xs">Cool-off Period (Days)</Label>
                  <Input type="number" min="0" value={form.coolOffPeriodDays} onChange={e => setForm(f => ({ ...f, coolOffPeriodDays: parseInt(e.target.value) }))} />
               </div>
            </div>
            <div>
              <Label>Approval Required</Label>
              <Select value={form.approvalRequired} onValueChange={v => setForm(f => ({ ...f, approvalRequired: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
}
