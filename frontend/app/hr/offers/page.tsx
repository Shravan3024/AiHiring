"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { hrApi, candidateApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { 
  FileText, Plus, Send, DollarSign, 
  Search, Calendar, Briefcase, User, ExternalLink, 
  CheckCircle, Clock, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HROffersPage() {
  const [activeTab, setActiveTab] = useState<"offers" | "templates">("offers");
  const [open, setOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const [form, setForm] = useState({
    applicationId: "", salary: "", currency: "INR",
    startDate: "", expiryDate: "", notes: "", templateId: "",
  });

  const [templateForm, setTemplateForm] = useState({
    templateName: "", templateContent: ""
  });

  const { data: appsData = [], isLoading: appsLoading } = useQuery({
    queryKey: ["hr-applications-offers"],
    queryFn: async () => {
      const res = await hrApi.getApplications();
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  const { data: templatesData, refetch: refetchTemplates } = useQuery({
    queryKey: ["offer-templates"],
    queryFn: () => hrApi.getOfferTemplates().then(r => r.data.templates),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => hrApi.createOffer(data),
    onSuccess: () => {
      setOpen(false);
      setForm({ applicationId: "", salary: "", currency: "INR", startDate: "", expiryDate: "", notes: "", templateId: "" });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => hrApi.createOfferTemplate(data),
    onSuccess: () => {
      setTemplateOpen(false);
      refetchTemplates();
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: any) => hrApi.updateOfferTemplate(id, data),
    onSuccess: () => {
      setTemplateOpen(false);
      refetchTemplates();
    }
  });

  function handleSubmit() {
    createMutation.mutate({
      applicationId: form.applicationId,
      salary: Number(form.salary),
      currency: form.currency,
      startDate: form.startDate,
      expiryDate: form.expiryDate,
      notes: form.notes,
      templateId: form.templateId || undefined,
    });
  }

  function handleTemplateSubmit() {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.templateId, data: templateForm });
    } else {
      createTemplateMutation.mutate(templateForm);
    }
  }

  return (
    <PanelLayout title="Compensation Center" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Offer Management</h1>
            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Draft, review, and dispatch employment contracts</p>
          </div>
          <div className="flex gap-4">
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab("offers")}
                  className={cn("px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all", activeTab === "offers" ? "bg-white text-black shadow-sm" : "text-gray-400")}
                >
                  Active Offers
                </button>
                <button 
                  onClick={() => setActiveTab("templates")}
                  className={cn("px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all", activeTab === "templates" ? "bg-white text-black shadow-sm" : "text-gray-400")}
                >
                  Letter Templates
                </button>
             </div>
             {activeTab === "offers" ? (
               <Button onClick={() => setOpen(true)} className="flex items-center gap-2 h-10 px-6 font-bold uppercase tracking-widest text-[10px] bg-black text-white hover:bg-gray-800 rounded-lg shadow-lg">
                 <Plus className="w-3.5 h-3.5" /> Initialize New Offer
               </Button>
             ) : (
               <Button onClick={() => { setEditingTemplate(null); setTemplateForm({ templateName: "", templateContent: "" }); setTemplateOpen(true); }} className="flex items-center gap-2 h-10 px-6 font-bold uppercase tracking-widest text-[10px] bg-black text-white hover:bg-gray-800 rounded-lg shadow-lg">
                 <Plus className="w-3.5 h-3.5" /> Create Template
               </Button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <section className="lg:col-span-3 space-y-6">
             {activeTab === "offers" ? (
               <>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                     <FileText className="w-3.5 h-3.5" /> Dispatched Agreements
                   </div>
                 </div>
                 <Card className="border-gray-100 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="text-center py-24 bg-gray-50/50">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-5 h-5 text-gray-300" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Active Offers Found</h3>
                        <p className="text-[11px] text-gray-400 mt-2 max-w-xs mx-auto font-medium">Agreement feed is currently silent. Use the "Initialize New Offer" button to start.</p>
                      </div>
                    </CardContent>
                 </Card>
               </>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templatesData?.length > 0 ? templatesData.map((t: any) => (
                    <Card key={t.templateId} className="border-gray-100 hover:border-black transition-all group shadow-sm rounded-2xl overflow-hidden bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                           <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                              <FileText className="w-5 h-5" />
                           </div>
                           <Button 
                             variant="ghost" size="icon" 
                             onClick={() => { setEditingTemplate(t); setTemplateForm({ templateName: t.templateName, templateContent: t.templateContent }); setTemplateOpen(true); }}
                             className="text-gray-300 hover:text-black"
                           >
                              <Plus className="w-4 h-4 rotate-45" /> {/* Edit Icon placeholder */}
                           </Button>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">{t.templateName}</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-4">Last Modified: {new Date(t.updatedAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-50 italic">
                          "{t.templateContent}"
                        </p>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-2 text-center py-20 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                       <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                       <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No templates created yet</p>
                    </div>
                  )}
               </div>
             )}
          </section>

          <aside className="space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                <AlertCircle className="w-3.5 h-3.5" /> Internal Protocol
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                 <div className="flex gap-3">
                   <div className="h-5 w-5 bg-black text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">1</div>
                   <p className="text-[11px] text-gray-600 font-medium leading-relaxed">Templates support placeholders like <span className="text-black font-bold">{"{{candidateName}}"}</span> and <span className="text-black font-bold">{"{{jobTitle}}"}</span>.</p>
                 </div>
                 <div className="flex gap-3">
                   <div className="h-5 w-5 bg-black text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">2</div>
                   <p className="text-[11px] text-gray-600 font-medium leading-relaxed">Standard salary breakup will be appended automatically to all letter bodies.</p>
                 </div>
              </div>
            </section>
          </aside>
        </div>

        {/* Dialog for Creating Offer */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg rounded-2xl border-gray-100 shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-8 border-b border-gray-50 bg-gray-50/50">
              <DialogTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 tracking-tight">
                <Send className="w-5 h-5 text-black" /> Initial Contract Draft
              </DialogTitle>
              <DialogDescription className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Operational Workspace / Offer Sequence
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Selection</Label>
                <Select value={form.applicationId} onValueChange={v => setForm(f => ({ ...f, applicationId: v }))}>
                  <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="Locate cleared candidate..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl overflow-hidden">
                    {appsData.map((a: any) => (
                      <SelectItem key={a._id} value={a._id} className="text-xs py-3">
                        <span className="font-bold">{a.candidateId?.name || "Anonymous"}</span>
                        <span className="mx-2 text-gray-300">/</span>
                        <span className="text-gray-500">{a.jobId?.title || "Role"}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Letter Template</Label>
                <Select value={form.templateId} onValueChange={v => setForm(f => ({ ...f, templateId: v }))}>
                  <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50">
                    <SelectValue placeholder="Use Default Branding..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    {templatesData?.map((t: any) => (
                      <SelectItem key={t.templateId} value={t.templateId} className="text-xs">{t.templateName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Compensation</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <Input type="number" className="h-11 pl-10 rounded-xl border-gray-100 bg-gray-50/50 font-bold" value={form.salary}
                      onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Currency Unit</Label>
                  <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                      <SelectItem value="INR" className="text-xs">INR — Indian Rupee</SelectItem>
                      <SelectItem value="USD" className="text-xs">USD — US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deployment Date</Label>
                  <Input type="date" className="h-11 rounded-xl border-gray-100 bg-gray-50/50" value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valid Until</Label>
                  <Input type="date" className="h-11 rounded-xl border-gray-100 bg-gray-50/50" value={form.expiryDate}
                    onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
                </div>
              </div>
            </div>

            <DialogFooter className="p-8 border-t border-gray-50 bg-gray-50/50 gap-3">
              <Button variant="ghost" onClick={() => setOpen(false)} className="text-[10px] font-bold uppercase tracking-widest rounded-xl">Discard</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!form.applicationId || createMutation.isPending}
                className="h-11 px-8 bg-black text-white hover:bg-gray-800 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-black/10 disabled:opacity-50"
              >
                {createMutation.isPending ? "Executing..." : "Finalize & Dispatch"} <Send className="w-3.5 h-3.5 ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog for Managing Template */}
        <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
          <DialogContent className="max-w-2xl rounded-2xl border-gray-100 shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-8 border-b border-gray-50 bg-gray-50/50">
              <DialogTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 tracking-tight">
                <FileText className="w-5 h-5 text-black" /> {editingTemplate ? "Refine Agreement Template" : "Construct New Agreement Template"}
              </DialogTitle>
              <DialogDescription className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Recruitment Intelligence / Branding Engine
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                 <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Internal Template Name</Label>
                 <Input className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-bold" value={templateForm.templateName}
                   onChange={e => setTemplateForm(f => ({ ...f, templateName: e.target.value }))} placeholder="e.g. Standard Full-Time Offer" />
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between items-end mb-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Letter Content (Body)</Label>
                    <span className="text-[9px] text-blue-600 font-bold italic tracking-widest">Rich Text Placeholder Engine v1.0</span>
                 </div>
                 <Textarea rows={12} className="rounded-xl border-gray-100 bg-gray-50/50 resize-none text-xs p-6 leading-relaxed font-serif" value={templateForm.templateContent}
                   onChange={e => setTemplateForm(f => ({ ...f, templateContent: e.target.value }))}
                   placeholder="Start drafting the letter body here... Use {{candidateName}} for personalized greeting." />
               </div>
            </div>

            <DialogFooter className="p-8 border-t border-gray-50 bg-gray-50/50 gap-3">
              <Button variant="ghost" onClick={() => setTemplateOpen(false)} className="text-[10px] font-bold uppercase tracking-widest rounded-xl">Cancel</Button>
              <Button 
                onClick={handleTemplateSubmit} 
                disabled={!templateForm.templateName || !templateForm.templateContent || createTemplateMutation.isPending || updateTemplateMutation.isPending}
                className="h-11 px-8 bg-black text-white hover:bg-gray-800 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-black/10 disabled:opacity-50"
              >
                {createTemplateMutation.isPending || updateTemplateMutation.isPending ? "Syncing..." : editingTemplate ? "Update Changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PanelLayout>
  );
}

