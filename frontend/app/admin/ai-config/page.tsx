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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Bot, Plus, Edit2, Play, Settings, Activity } from "lucide-react";
import { AdminAIPanel } from "@/components/ai";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AIConfig {
  configId: string;
  jobId: string;
  resumeWeight: number;
  mcqWeight: number;
  technicalWeight: number;
  interviewWeight: number;
  passingThreshold: number;
  integrityPenalty: number;
  confidenceWeighting: { HIGH: number; MEDIUM: number; LOW: number };
  prosConsRules: {
    maxProsPerStage: number;
    maxConsPerStage: number;
    confidenceThreshold: number;
    biasCheckEnabled: boolean;
  };
  riskyWordings: string[];
  autoEscalateThreshold: number;
  status: string;
}

interface TestResult {
  status: 'VERIFIED' | 'FAILED';
  timestamp: string;
  result: string;
  validation: {
    errors: string[];
    warnings: string[];
    totalWeight: string;
    linkedJob: string;
  };
}

interface Job {
  _id: string;
  id: number;
  title: string;
}

const DEFAULT_FORM = {
  jobId: "",
  resumeWeight: "0.25",
  mcqWeight: "0.25",
  technicalWeight: "0.25",
  interviewWeight: "0.25",
  passingThreshold: "0.6",
  autoEscalateThreshold: "0.85",
  integrityPenalty: "0.2",
  cwHigh: "1.0",
  cwMedium: "0.8",
  cwLow: "0.5",
  pcMaxPros: "5",
  pcMaxCons: "5",
  pcConfidenceThreshold: "0.7",
  pcBiasCheckEnabled: true,
  riskyWordings: "discriminatory, biased, stereotypical",
};

export default function AIConfigPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AIConfig | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [testResult, setTestResult] = useState<TestResult | string | null>(null);

  const { data: configs = [] } = useQuery({
    queryKey: ["ai-configs"],
    queryFn: () => adminApi.getAIConfigs().then(r => r.data?.data || r.data?.configs || r.data || []),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs-select"],
    queryFn: () => adminApi.getJobs().then(r => r.data?.data || r.data?.jobs || r.data || []),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => adminApi.createAIConfig(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-configs"] }); setOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => adminApi.updateAIConfig(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-configs"] }); setOpen(false); },
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => adminApi.testAIConfig(id),
    onSuccess: (r) => setTestResult(r.data?.data || "Test passed"),
  });

  const totalWeight = () => {
    return (parseFloat(form.resumeWeight) || 0) +
      (parseFloat(form.mcqWeight) || 0) +
      (parseFloat(form.technicalWeight) || 0) +
      (parseFloat(form.interviewWeight) || 0);
  };

  function openCreate() {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setOpen(true);
  }

  function openEdit(cfg: AIConfig) {
    setEditing(cfg);
    setForm({
      jobId: cfg.jobId,
      resumeWeight: String(cfg.resumeWeight),
      mcqWeight: String(cfg.mcqWeight),
      technicalWeight: String(cfg.technicalWeight),
      interviewWeight: String(cfg.interviewWeight),
      passingThreshold: String(cfg.passingThreshold),
      autoEscalateThreshold: String(cfg.autoEscalateThreshold),
      integrityPenalty: String(cfg.integrityPenalty ?? 0.2),
      cwHigh: String(cfg.confidenceWeighting?.HIGH ?? 1.0),
      cwMedium: String(cfg.confidenceWeighting?.MEDIUM ?? 0.8),
      cwLow: String(cfg.confidenceWeighting?.LOW ?? 0.5),
      pcMaxPros: String(cfg.prosConsRules?.maxProsPerStage ?? 5),
      pcMaxCons: String(cfg.prosConsRules?.maxConsPerStage ?? 5),
      pcConfidenceThreshold: String(cfg.prosConsRules?.confidenceThreshold ?? 0.7),
      pcBiasCheckEnabled: cfg.prosConsRules?.biasCheckEnabled ?? true,
      riskyWordings: (cfg.riskyWordings || []).join(", ") || "discriminatory, biased, stereotypical",
    });
    setOpen(true);
  }

  function handleSubmit() {
    const payload = {
      jobId: form.jobId,
      resumeWeight: parseFloat(form.resumeWeight),
      mcqWeight: parseFloat(form.mcqWeight),
      technicalWeight: parseFloat(form.technicalWeight),
      interviewWeight: parseFloat(form.interviewWeight),
      passingThreshold: parseFloat(form.passingThreshold),
      autoEscalateThreshold: parseFloat(form.autoEscalateThreshold),
      integrityPenalty: parseFloat(form.integrityPenalty),
      confidenceWeighting: {
        HIGH: parseFloat(form.cwHigh),
        MEDIUM: parseFloat(form.cwMedium),
        LOW: parseFloat(form.cwLow),
      },
      prosConsRules: {
        maxProsPerStage: parseInt(form.pcMaxPros),
        maxConsPerStage: parseInt(form.pcMaxCons),
        confidenceThreshold: parseFloat(form.pcConfidenceThreshold),
        biasCheckEnabled: form.pcBiasCheckEnabled,
      },
      riskyWordings: form.riskyWordings.split(",").map(s => s.trim()).filter(Boolean),
    };
    if (editing) updateMutation.mutate({ id: editing.configId, data: payload });
    else createMutation.mutate(payload);
  }

  const getJobTitle = (jobId: string) => {
    const job = jobs.find((j: Job) => String(j.id) === String(jobId) || j._id === String(jobId));
    return job?.title || jobId;
  };

  const weightOk = Math.abs(totalWeight() - 1.0) < 0.01;

  return (
    <PanelLayout title="AI System Center" allowedRoles={["ADMIN"]}>
      <Tabs defaultValue="weights" className="space-y-6">
        <TabsList className="bg-white border p-1 h-12 shadow-sm">
          <TabsTrigger value="weights" className="px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Settings className="w-4 h-4 mr-2" /> Job Weightages
          </TabsTrigger>
          <TabsTrigger value="health" className="px-6 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
            <Activity className="w-4 h-4 mr-2" /> System Health & Models
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weights" className="space-y-6 outline-none">
          {/* Per-Job AI Configs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" /> Job AI Configurations
              </CardTitle>
              <Button onClick={openCreate} size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Config
              </Button>
            </CardHeader>
            <CardContent>
              {testResult && typeof testResult === 'object' && (
                <div className={`mb-6 p-4 rounded-lg border shadow-sm ${testResult.status === 'VERIFIED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold text-sm ${testResult.status === 'VERIFIED' ? 'text-green-800' : 'text-red-800'}`}>
                      Test Result: {testResult.status}
                    </h3>
                    <span className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">
                      {new Date(testResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm mb-3 ${testResult.status === 'VERIFIED' ? 'text-green-700' : 'text-red-700'}`}>
                    {testResult.result}
                  </p>
                  
                  {testResult.validation?.errors?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Critical Errors</p>
                      {testResult.validation.errors.map((err: string, i: number) => (
                        <p key={i} className="text-xs text-red-600 flex items-start gap-1">
                          <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> {err}
                        </p>
                      ))}
                    </div>
                  )}

                  {testResult.validation?.warnings?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Optimization Warnings</p>
                      {testResult.validation.warnings.map((warn: string, i: number) => (
                        <p key={i} className="text-xs text-amber-600 flex items-start gap-1">
                          <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> {warn}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-black/5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Target Job</p>
                      <p className="text-xs font-medium">{testResult.validation?.linkedJob}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Total Weight</p>
                      <p className="text-xs font-medium">{testResult.validation?.totalWeight}</p>
                    </div>
                  </div>
                </div>
              )}
              {testResult && typeof testResult === 'string' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  {testResult}
                </div>
              )}
              <div className="space-y-3">
                {configs.length === 0 && <p className="text-sm text-gray-400">No configurations yet. Create one to configure AI scoring for a job.</p>}
                {configs.map((cfg: AIConfig) => (
                  <div key={cfg.configId} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{getJobTitle(cfg.jobId)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Resume {Math.round(cfg.resumeWeight * 100)}% · MCQ {Math.round(cfg.mcqWeight * 100)}% · Technical {Math.round(cfg.technicalWeight * 100)}% · Interview {Math.round(cfg.interviewWeight * 100)}%
                      </p>
                      <p className="text-xs text-gray-400">Passing threshold: {Math.round(cfg.passingThreshold * 100)}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cfg.status === "ACTIVE" ? "success" : "secondary"}>{cfg.status}</Badge>
                      <Button size="sm" variant="outline" onClick={() => testMutation.mutate(cfg.configId)}>
                        <Play className="w-3 h-3 mr-1" /> Test
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(cfg)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" /> How AI Scoring Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                {[
                  { label: "Resume Screening", color: "bg-blue-50 text-blue-700" },
                  { label: "MCQ Assessment", color: "bg-green-50 text-green-700" },
                  { label: "Technical Round", color: "bg-purple-50 text-purple-700" },
                  { label: "AI Interview", color: "bg-orange-50 text-orange-700" },
                ].map(({ label, color }) => (
                  <div key={label} className={`p-3 rounded-lg ${color}`}>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs mt-1 opacity-70">Weighted stage</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="outline-none">
          <AdminAIPanel systemId="primary-ai-cluster" />
        </TabsContent>
      </Tabs>


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit AI Config" : "Create AI Config"}</DialogTitle>
            <DialogDescription>
              Configure stage weights, governance rules, and scoring thresholds for the AI recruiter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Tabs defaultValue="stage" className="w-full mt-2">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="stage">Weights & Basics</TabsTrigger>
                <TabsTrigger value="gov">Governance</TabsTrigger>
                <TabsTrigger value="pros">Pros & Cons</TabsTrigger>
              </TabsList>

              <TabsContent value="stage" className="space-y-4 pt-4">
                <div>
                  <Label>Job</Label>
                  <Select value={form.jobId} onValueChange={v => setForm(f => ({ ...f, jobId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                    <SelectContent>
                      {jobs.map((j: Job) => (
                        <SelectItem key={j._id} value={String(j.id)}>{j.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1 block">Stage Weights (must sum to 1.0)</Label>
                  {!weightOk && <p className="text-xs text-red-500 mb-2">Current total: {totalWeight().toFixed(2)} — must equal 1.0</p>}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["resumeWeight", "Resume Weight"],
                      ["mcqWeight", "MCQ Weight"],
                      ["technicalWeight", "Technical Weight"],
                      ["interviewWeight", "Interview Weight"],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <Label className="text-xs">{label}</Label>
                        <Input type="number" step="0.05" min="0" max="1"
                          value={form[key as keyof typeof form] as string | number}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Passing Threshold (0–1)</Label>
                    <Input type="number" step="0.05" min="0" max="1"
                      value={form.passingThreshold}
                      onChange={e => setForm(f => ({ ...f, passingThreshold: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Auto-Escalate Threshold (0-1)</Label>
                    <Input type="number" step="0.05" min="0" max="1"
                      value={form.autoEscalateThreshold}
                      onChange={e => setForm(f => ({ ...f, autoEscalateThreshold: e.target.value }))} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gov" className="space-y-4 pt-4">
                <div>
                  <Label>Integrity Penalty</Label>
                  <Input type="number" step="0.05" min="0" max="1"
                    value={form.integrityPenalty}
                    onChange={e => setForm(f => ({ ...f, integrityPenalty: e.target.value }))} />
                  <p className="text-xs text-gray-400 mt-1">Deduction applied across stage scores if a confidence issue or malpractice anomaly is flagged.</p>
                </div>
                <div>
                  <Label className="mb-1 block">Confidence Weighting Factors</Label>
                  <p className="text-xs text-gray-400 mb-2">Score multipliers based on AI confidence in assessment elements.</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">HIGH</Label>
                      <Input type="number" step="0.1"
                        value={form.cwHigh}
                        onChange={e => setForm(f => ({ ...f, cwHigh: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">MEDIUM</Label>
                      <Input type="number" step="0.1"
                        value={form.cwMedium}
                        onChange={e => setForm(f => ({ ...f, cwMedium: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">LOW</Label>
                      <Input type="number" step="0.1"
                        value={form.cwLow}
                        onChange={e => setForm(f => ({ ...f, cwLow: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pros" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Max Pros Per Stage</Label>
                    <Input type="number"
                      value={form.pcMaxPros}
                      onChange={e => setForm(f => ({ ...f, pcMaxPros: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Max Cons Per Stage</Label>
                    <Input type="number"
                      value={form.pcMaxCons}
                      onChange={e => setForm(f => ({ ...f, pcMaxCons: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Rule Engine Confidence Threshold</Label>
                  <Input type="number" step="0.05"
                    value={form.pcConfidenceThreshold}
                    onChange={e => setForm(f => ({ ...f, pcConfidenceThreshold: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2 mt-2 py-1">
                  <input type="checkbox" id="biasCheck" 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    checked={form.pcBiasCheckEnabled}
                    onChange={e => setForm(f => ({ ...f, pcBiasCheckEnabled: e.target.checked }))} />
                  <Label htmlFor="biasCheck" className="mb-0 cursor-pointer">Enable Bias and Fairness Checking</Label>
                </div>
                <div>
                  <Label>Bias Safe Wording Rules (csv)</Label>
                  <Input 
                    value={form.riskyWordings}
                    onChange={e => setForm(f => ({ ...f, riskyWordings: e.target.value }))} 
                    placeholder="discriminatory, biased, stereotypical" />
                  <p className="text-xs text-gray-400 mt-1">Penalty flags trigger on pros/cons entries containing these keywords.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}
              disabled={!weightOk || !form.jobId || createMutation.isPending || updateMutation.isPending}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
}
