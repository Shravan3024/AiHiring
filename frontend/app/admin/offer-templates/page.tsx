"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, FileText, Download, ShieldAlert, History } from "lucide-react";

interface OfferTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  jobId?: string;
  legalClauses?: string[];
  salaryBreakupTemplate?: any;
  branding?: any;
  downloadAllowed?: boolean;
  watermarkEnabled?: boolean;
  expiryDurationDays?: number;
  versionNumber?: number;
  variables?: string[];
  isDefault?: boolean;
  createdAt: string;
}

export default function OfferTemplatesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OfferTemplate | null>(null);
  const [form, setForm] = useState({ 
    name: "", subject: "", body: "",
    jobId: "all", legalClauses: "", salaryBreakupTemplate: "", brandingLogo: "",
    downloadAllowed: true, watermarkEnabled: true, expiryDurationDays: 30
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs-select"],
    queryFn: () => adminApi.getJobs().then(r => r.data?.data || []),
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["offer-templates"],
    queryFn: () => adminApi.getOfferTemplates().then(r => r.data?.data || r.data?.templates || r.data || []),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => adminApi.createOfferTemplate(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["offer-templates"] }); setOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => adminApi.updateOfferTemplate(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["offer-templates"] }); setOpen(false); },
  });

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      subject: "Offer Letter - {{jobTitle}} at MSK Recruitment",
      body: `Dear {{candidateName}},\n\nWe are pleased to offer you the position of {{jobTitle}}.\n\nSalary: {{salary}}\nStart Date: {{startDate}}\n\nPlease confirm your acceptance by {{deadline}}.\n\nBest regards,\n{{hrName}}`,
      jobId: "all", legalClauses: "Standard NDA, Non-Compete", salaryBreakupTemplate: JSON.stringify({ basic: 50, hra: 20 }), brandingLogo: "",
      downloadAllowed: true, watermarkEnabled: true, expiryDurationDays: 30
    });
    setOpen(true);
  }

  function openEdit(t: OfferTemplate) {
    setEditing(t);
    setForm({ 
      name: t.name, subject: t.subject, body: t.body,
      jobId: t.jobId || "all",
      legalClauses: t.legalClauses?.join(", ") || "",
      salaryBreakupTemplate: typeof t.salaryBreakupTemplate === 'object' ? JSON.stringify(t.salaryBreakupTemplate) : t.salaryBreakupTemplate || "",
      brandingLogo: t.branding?.logo || "",
      downloadAllowed: t.downloadAllowed ?? true,
      watermarkEnabled: t.watermarkEnabled ?? true,
      expiryDurationDays: t.expiryDurationDays || 30
    });
    setOpen(true);
  }

  function handleSubmit() {
    let parsedSalary = null;
    try { parsedSalary = form.salaryBreakupTemplate ? JSON.parse(form.salaryBreakupTemplate) : null; } catch(e) { /* ignore parse error */ }
    
    const payload = {
      name: form.name, subject: form.subject, body: form.body,
      jobId: (form.jobId && form.jobId !== "all") ? form.jobId : null,
      legalClauses: form.legalClauses.split(",").map(c=>c.trim()).filter(Boolean),
      salaryBreakupTemplate: parsedSalary,
      branding: { logo: form.brandingLogo },
      downloadAllowed: form.downloadAllowed,
      watermarkEnabled: form.watermarkEnabled,
      expiryDurationDays: Number(form.expiryDurationDays),
    };
    if (editing) updateMutation.mutate({ id: editing._id, data: payload });
    else createMutation.mutate(payload);
  }

  return (
    <PanelLayout title="Offer Templates" allowedRoles={["ADMIN"]}>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-24 animate-pulse bg-gray-100 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.length === 0 && (
            <Card className="col-span-2">
              <CardContent className="p-12 text-center text-gray-400">No templates yet. Create your first offer template.</CardContent>
            </Card>
          )}
          {templates.map((t: OfferTemplate) => (
            <Card key={t._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    {t.name}
                    {t.isDefault && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center bg-gray-50 border border-indigo-100 rounded p-3 mb-4">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1 text-xs text-gray-600"><History className="w-3 h-3"/> v{t.versionNumber || 1}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-600"><ShieldAlert className="w-3 h-3"/> {t.watermarkEnabled ? 'Watermarked' : 'Unprotected'}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-600"><Download className="w-3 h-3"/> {t.downloadAllowed ? 'Downloadable' : 'View Only'}</span>
                  </div>
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded font-medium border border-indigo-100">
                    Expiry: {t.expiryDurationDays || 30} Days
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t.subject}</p>
                <p className="text-xs text-gray-400 line-clamp-2">{t.body}</p>
                {t.variables && t.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {t.variables.map((v, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{`{{${v}}}`}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Template" : "Create Offer Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Standard Offer Letter" />
              </div>
              <div>
                <Label>Role Specific Mapping (Job ID)</Label>
                <Select value={form.jobId} onValueChange={v => setForm(f => ({ ...f, jobId: v }))}>
                   <SelectTrigger><SelectValue placeholder="Global (All Roles)" /></SelectTrigger>
                   <SelectContent>
                      <SelectItem value="all">Global (All Roles)</SelectItem>
                      {jobs.map((j: any) => <SelectItem key={j.id || j._id} value={String(j.id || j._id)}>{j.title}</SelectItem>)}
                   </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Email Subject</Label>
                <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label>Body</Label>
                <p className="text-xs text-gray-400 mb-1">
                  Variables: {"{{candidateName}}"}, {"{{jobTitle}}"}, {"{{salary}}"}, {"{{startDate}}"}, {"{{deadline}}"}, {"{{hrName}}"}
                </p>
                <Textarea rows={6} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className="font-mono text-xs" />
              </div>

              <div>
                <Label>Legal Clauses (comma separated)</Label>
                <Textarea rows={2} value={form.legalClauses} onChange={e => setForm(f => ({ ...f, legalClauses: e.target.value }))} placeholder="NDA, Background Verification..." />
              </div>
              <div>
                <Label>Salary Breakup Rules (JSON)</Label>
                <Textarea rows={2} className="font-mono text-xs" value={form.salaryBreakupTemplate} onChange={e => setForm(f => ({ ...f, salaryBreakupTemplate: e.target.value }))} placeholder='{"base": 50, "bonus": 10}' />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border rounded-lg space-y-4">
               <h4 className="font-semibold text-sm">Document Resource Governance</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <div className="flex gap-2 items-center">
                    <Checkbox id="downloadAllowed" checked={form.downloadAllowed} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, downloadAllowed: v }))} />
                    <Label htmlFor="downloadAllowed" className="text-xs">Allow Download</Label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Checkbox id="watermarkEnabled" checked={form.watermarkEnabled} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, watermarkEnabled: v }))} />
                    <Label htmlFor="watermarkEnabled" className="text-xs">Watermark Enabled</Label>
                  </div>
                  <div>
                    <Label className="text-xs">Expiry Duration (Days)</Label>
                    <Input type="number" value={form.expiryDurationDays} onChange={e => setForm(f => ({ ...f, expiryDurationDays: parseInt(e.target.value) }))} />
                  </div>
                  <div>
                     <Label className="text-xs">Template Versioning</Label>
                     <p className="text-sm font-semibold tracking-wide border px-3 py-1 rounded bg-white text-center">v{editing ? editing.versionNumber || 1 : '1 (New)'}</p>
                  </div>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
}
