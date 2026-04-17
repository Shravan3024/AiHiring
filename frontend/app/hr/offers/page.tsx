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
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    applicationId: "", salary: "", currency: "INR",
    startDate: "", expiryDate: "", notes: "", templateId: "",
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ["hr-applications-offers"],
    queryFn: async () => {
      const res = await hrApi.getApplications();
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  const applications = Array.isArray(data) ? data : [];

  const createMutation = useMutation({
    mutationFn: (data: object) => hrApi.createOffer(data),
    onSuccess: () => setOpen(false),
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

  return (
    <PanelLayout title="Compensation Center" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Offer Management</h1>
            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Draft, review, and dispatch employment contracts</p>
          </div>
          <Button onClick={() => setOpen(true)} className="flex items-center gap-2 h-10 px-6 font-bold uppercase tracking-widest text-[10px] bg-black text-white hover:bg-gray-800 rounded-lg shadow-lg">
            <Plus className="w-3.5 h-3.5" /> Initialize New Offer
          </Button>
        </div>

        {/* Global Stats or Filter bar would go here if needed */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main List */}
          <section className="lg:col-span-3 space-y-4">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                 <FileText className="w-3.5 h-3.5" /> Dispatched Agreements
               </div>
               <span className="text-[10px] text-gray-300 font-medium italic">Showing Recent Dispatches</span>
             </div>

             <Card className="border-gray-100 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="text-center py-24 bg-gray-50/50">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-5 h-5 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Active Offers</h3>
                    <p className="text-[11px] text-gray-400 mt-2 max-w-xs mx-auto font-medium">Agreement feed is currently silent. Active transitions will appearing here as they are processed.</p>
                  </div>
                </CardContent>
             </Card>
          </section>

          {/* Side Info */}
          <aside className="space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                <AlertCircle className="w-3.5 h-3.5" /> Internal Protocol
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                 <div className="flex gap-3">
                   <div className="h-5 w-5 bg-black text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">1</div>
                   <p className="text-[11px] text-gray-600 font-medium leading-relaxed">Ensure salary alignment with departmental budget caps before dispatching.</p>
                 </div>
                 <div className="flex gap-3">
                   <div className="h-5 w-5 bg-black text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">2</div>
                   <p className="text-[11px] text-gray-600 font-medium leading-relaxed">Candidate notifications are triggered automatically upon executive sign-off.</p>
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
                  <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-0 focus:border-black transition-all">
                    <SelectValue placeholder="Locate cleared candidate..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl overflow-hidden">
                    {applications.map((a: any) => {
                      const name = a.candidateId?.name || "Anonymous";
                      const job = a.jobId?.title || "System Role";
                      return (
                        <SelectItem key={a._id} value={a._id} className="text-xs py-3 focus:bg-gray-50 transition-colors">
                          <span className="font-bold">{name}</span>
                          <span className="mx-2 text-gray-300">/</span>
                          <span className="text-gray-500">{job}</span>
                        </SelectItem>
                      );
                    })}
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
                      <SelectItem value="EUR" className="text-xs">EUR — Euro</SelectItem>
                      <SelectItem value="GBP" className="text-xs">GBP — British Pound</SelectItem>
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

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operational Metadata (Notes)</Label>
                <Textarea rows={3} className="rounded-xl border-gray-100 bg-gray-50/50 resize-none text-xs p-4" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Insert clauses, relocation notes, or background clearance prerequisites..." />
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
      </div>
    </PanelLayout>
  );
}

