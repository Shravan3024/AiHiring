"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Mail, Trash2, Loader2, UserPlus, Shield, PowerOff, Settings2, LogOut, ArrowRight, Fingerprint, Zap, Clock, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HRUser {
  _id: string;
  id: number;
  name: string;
  email: string;
  status: string;
  hr_role?: string;
  createdAt: string;
}

export default function HRManagementPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [ruleForm, setRuleForm] = useState({ stage: "Assessment", threshold: 67, timeoutHours: 48, role: "REVIEWER" });

  const { data: hrsData = [], isLoading } = useQuery({
    queryKey: ["admin-hrs"],
    queryFn: () => adminApi.getHRs().then(r => r.data),
  });

  const hrs = Array.isArray(hrsData) ? hrsData : [];

  const { data: rulesData = [] } = useQuery({
    queryKey: ["admin-approval-rules"],
    queryFn: () => adminApi.getApprovalRules().then((r: any) => r.data),
  });

  const activeRule = Array.isArray(rulesData) ? rulesData[rulesData.length - 1] : null;

  const createHRMutation = useMutation({
    mutationFn: (data: typeof form) => adminApi.createHR(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hrs"] });
      setOpen(false);
      setForm({ name: "", email: "", password: "" });
      toast.success("HR account created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.details || err.response?.data?.message || "Failed to create HR user");
    },
  });

  const updateHRMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminApi.updateHR(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hrs"] });
      setEditUser(null);
      toast.success("HR policy updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Policy update failed");
    },
  });

  const forceLogoutMutation = useMutation({
    mutationFn: (id: string) => adminApi.forceLogoutHR(id),
    onSuccess: () => toast.success("HR session terminated"),
    onError: () => toast.error("Command failed"),
  });

  const deleteHRMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteHR(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hrs"] });
      toast.success("HR account revoked");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Revocation failed");
    },
  });
  
  const createRuleMutation = useMutation({
    mutationFn: (data: any) => adminApi.createApprovalRule(data),
    onSuccess: () => {
      toast.success("Global rule deployed");
      setRulesOpen(false);
    },
    onError: () => toast.error("Rule deployment failed")
  });

  const [editUser, setEditUser] = useState<HRUser | null>(null);
  const [editForm, setEditForm] = useState({ status: "ACTIVE", hr_role: "VIEWER" });

  const handleEditOpen = (u: HRUser) => {
    setEditUser(u);
    setEditForm({ status: u.status || "ACTIVE", hr_role: u.hr_role || "VIEWER" });
  };

  const filtered = hrs.filter((u: HRUser) =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PanelLayout title="Access Governance" allowedRoles={["ADMIN"]}>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic opacity-20 selection:bg-none pointer-events-none absolute -top-4 -left-2 transform -rotate-1 select-none">HR AUTHORITY</h2>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Identity & Role Management</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Global HR User Directory & Concurrence Controls</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                 <Input 
                   placeholder="Filter identities..." 
                   className="h-11 pl-10 pr-4 w-72 bg-white shadow-sm border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/50"
                   value={search} 
                   onChange={e => setSearch(e.target.value)} 
                 />
              </div>
              <Button 
                onClick={() => setOpen(true)} 
                className="h-11 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Provision Account
              </Button>
           </div>
        </div>

        <Tabs defaultValue="team" className="space-y-8">
          <TabsList className="bg-white shadow-sm border border-slate-200 w-fit h-14 p-1.5 rounded-[1.25rem] gap-2 backdrop-blur-md">
             <TabsTrigger value="team" className="h-full px-8 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold transition-all">Identity Registry</TabsTrigger>
             <TabsTrigger value="rules" className="h-full px-8 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold transition-all">Approval Rules Engine</TabsTrigger>
          </TabsList>
          
          <TabsContent value="team" className="mt-0">
            <div className="bg-white shadow-sm border border-slate-200 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
               {isLoading ? (
                 <div className="p-20 flex flex-col items-center justify-center space-y-4">
                   <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                   <p className="text-xs font-black uppercase text-slate-400 tracking-[0.4em]">Decrypting Registry...</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto custom-scrollbar">
                   <Table>
                     <TableHeader className="bg-slate-50 border-b border-slate-200">
                       <TableRow className="hover:bg-transparent border-0">
                         <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User Identity</TableHead>
                         <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Access Credentials</TableHead>
                         <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Role Assignment</TableHead>
                         <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Status</TableHead>
                         <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Governance</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {filtered.length === 0 ? (
                         <TableRow className="hover:bg-transparent border-0">
                           <TableCell colSpan={5} className="text-center py-24">
                             <div className="flex flex-col items-center gap-4 opacity-20">
                               <Users className="w-16 h-16" />
                               <span className="text-xs font-black uppercase tracking-[0.3em]">No Identities Found</span>
                             </div>
                           </TableCell>
                         </TableRow>
                       ) : filtered.map((u: HRUser) => (
                         <TableRow key={u._id} className="group hover:bg-slate-50 transition-all border-b border-slate-200 last:border-0 relative">
                           <TableCell className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center font-bold text-blue-400 border border-slate-200 shrink-0">
                                   {u.name?.charAt(0)}
                                 </div>
                                 <span className="text-slate-900 font-bold tracking-tight">{u.name}</span>
                              </div>
                           </TableCell>
                           <TableCell>
                             <div className="flex items-center gap-2 text-slate-500 text-xs font-medium tracking-tight">
                               <Mail className="w-3 h-3 text-blue-400/50" /> {u.email}
                             </div>
                           </TableCell>
                           <TableCell>
                              <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[9px] font-black tracking-widest px-3 py-1">
                                {u.hr_role || 'VIEWER'}
                              </Badge>
                           </TableCell>
                           <TableCell>
                             <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  u.status === 'DISABLED' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                )} />
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  u.status === 'DISABLED' ? 'text-rose-400' : 'text-emerald-400'
                                )}>{u.status || "ACTIVE"}</span>
                             </div>
                           </TableCell>
                           <TableCell className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleEditOpen(u)}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all border border-transparent hover:border-blue-500/30"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => { if(confirm(`Terminate sessions for ${u.name}?`)) forceLogoutMutation.mutate(u._id); }}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm text-amber-500/40 hover:text-amber-400 hover:bg-amber-400/10 transition-all border border-transparent hover:border-amber-500/30"
                                >
                                  <PowerOff className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => { if(confirm(`Revoke access for ${u.name}?`)) deleteHRMutation.mutate(u._id); }}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm text-rose-500/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all border border-transparent hover:border-rose-500/30"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
               )}
            </div>
          </TabsContent>
          
          <TabsContent value="rules" className="mt-0">
            <div className="bg-white shadow-sm border border-slate-200 rounded-[2.5rem] p-10 min-h-[400px] backdrop-blur-xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Fingerprint className="w-32 h-32 text-blue-500" />
               </div>
               
               <div className="relative z-10 space-y-12">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                     <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                           <Settings2 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Validation Matrix</h3>
                        <p className="text-sm text-slate-500 font-medium max-w-lg leading-relaxed">
                          Define multi-factor concurrence requirements. The ecosystem enforces exact threshold bounds, auto-escalation SLAs, and mandatory review matrices per role stage.
                        </p>
                     </div>
                     <Button className="bg-indigo-600 hover:bg-indigo-500 h-14 px-8 rounded-2xl font-bold shadow-xl shadow-indigo-900/40 shrink-0" onClick={() => setRulesOpen(true)}>
                        Deploy Global Rule
                     </Button>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { icon: Shield, label: "Required Quorum", val: activeRule ? `${activeRule.approvalsRequired} HRs` : "1 ADMIN", color: "text-indigo-400" },
                      { icon: Zap, label: "Avg Threshold", val: activeRule ? `${Math.round(activeRule.approvalThreshold * 100)}%` : "67%", color: "text-amber-400" },
                      { icon: Clock, label: "SLA Timeout", val: activeRule ? `${activeRule.slaHours}H` : "48H", color: "text-rose-400" },
                      { icon: Users, label: "Escalation", val: activeRule?.role || "SR. HR", color: "text-purple-400" },
                    ].map((stat, i) => (
                      <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-200 transition-all">
                         <div className={cn("p-3 rounded-xl bg-white shadow-sm w-fit", stat.color)}>
                            <stat.icon className="w-5 h-5" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.val}</p>
                         </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center space-y-4 py-20">
                     <Lock className="w-12 h-12 text-slate-900/5 animate-pulse" />
                     <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 uppercase tracking-widest">Active Rule Registry Encrypted</p>
                     <p className="text-[10px] text-slate-400 max-w-sm font-medium">Policy orchestration is handled via <code>hrApprovalRule.js</code> secure middleware layer for real-time compliance enforcement.</p>
                  </div>
               </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* DIALOGS - Redesigned to match dark theme */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 text-slate-900 p-0 overflow-hidden rounded-[2.5rem]">
          <DialogHeader className="p-8 bg-slate-50 border-b border-slate-200 relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
               <UserPlus className="w-6 h-6 text-blue-400" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Identity Provisioning</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Create a new secure access corridor for an HR Manager.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Identity Name</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                placeholder="Manager Name" 
                className="h-12 bg-white shadow-sm border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Secure Email</Label>
              <Input 
                type="email" 
                value={form.email} 
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                placeholder="address@ecosystem.com" 
                className="h-12 bg-white shadow-sm border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Access Key</Label>
              <Input 
                type="password" 
                value={form.password} 
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                placeholder="Min 8 characters" 
                className="h-12 bg-white shadow-sm border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-200">
            <Button 
               variant="ghost" 
               onClick={() => setOpen(false)} 
               className="text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm font-bold"
            >
              Cancel
            </Button>
            <Button
              className="px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              onClick={() => createHRMutation.mutate(form)}
              disabled={createHRMutation.isPending || !form.name || !form.email || !form.password}
            >
              {createHRMutation.isPending ? "PROVISIONING..." : "COMMIT IDENTITY"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-md bg-white border-slate-200 text-slate-900 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Policy Configuration</DialogTitle>
            <DialogDescription className="text-slate-500">
              Modify governance bounds for {editUser?.name}.
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-6 pt-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Authority Level</Label>
                  <Select value={editForm.hr_role} onValueChange={v => setEditForm({ ...editForm, hr_role: v })}>
                    <SelectTrigger className="h-12 bg-white shadow-sm border-slate-200 rounded-xl">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                       <SelectItem value="VIEWER">HR Viewer (Read Only)</SelectItem>
                       <SelectItem value="REVIEWER">HR Reviewer (Standard)</SelectItem>
                       <SelectItem value="APPROVER">HR Approver (Executive)</SelectItem>
                       <SelectItem value="SENIOR_HR">Senior HR (Root Path)</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Kill-Switch Controller</Label>
                  <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger className="h-12 bg-white shadow-sm border-slate-200 rounded-xl text-rose-400">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                       <SelectItem value="ACTIVE" className="text-emerald-400 uppercase font-black tracking-widest text-[10px]">Active Protocol</SelectItem>
                       <SelectItem value="DISABLED" className="text-rose-400 uppercase font-black tracking-widest text-[10px]">Revocation (Locked)</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
          )}
          <DialogFooter className="mt-8 gap-3">
             <Button 
               variant="secondary" 
               className="bg-white shadow-sm text-slate-500 hover:bg-slate-100 border-0"
               onClick={() => setEditUser(null)}
              >Cancel</Button>
             <Button 
               className="bg-blue-600 hover:bg-blue-500 font-bold"
               onClick={() => updateHRMutation.mutate({ id: editUser!._id, data: editForm })} 
               disabled={updateHRMutation.isPending}
              >
                DEPLOY POLICY
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 text-slate-900 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Deploy Governance Rule</DialogTitle>
            <DialogDescription className="text-slate-500">
              Sync concurrence bounds to the global rules engine.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-6">
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Pipeline Stage Context</Label>
                <Select value={ruleForm.stage} onValueChange={v => setRuleForm({ ...ruleForm, stage: v })}>
                   <SelectTrigger className="h-12 bg-white shadow-sm border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                   <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="Screening">Global Screening</SelectItem>
                      <SelectItem value="Assessment">Technical Assessment</SelectItem>
                      <SelectItem value="Interview">Video Analysis</SelectItem>
                      <SelectItem value="FinalDecision">Executive Decision</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Quorum (%)</Label>
                   <Input 
                      type="number" 
                      value={ruleForm.threshold} 
                      onChange={e => setRuleForm({ ...ruleForm, threshold: parseInt(e.target.value) })}
                      className="h-12 bg-white shadow-sm border-slate-200 rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">SLA Latency (H)</Label>
                   <Input 
                      type="number" 
                      value={ruleForm.timeoutHours} 
                      onChange={e => setRuleForm({ ...ruleForm, timeoutHours: parseInt(e.target.value) })}
                      className="h-12 bg-white shadow-sm border-slate-200 rounded-xl" 
                    />
                </div>
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Minimum Auth Role</Label>
                <Select value={ruleForm.role} onValueChange={v => setRuleForm({ ...ruleForm, role: v })}>
                   <SelectTrigger className="h-12 bg-white shadow-sm border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                   <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="REVIEWER">HR REVIEWER</SelectItem>
                      <SelectItem value="APPROVER">HR APPROVER</SelectItem>
                      <SelectItem value="SENIOR_HR">SENIOR HR</SelectItem>
                   </SelectContent>
                </Select>
             </div>
          </div>
          <DialogFooter className="mt-8">
             <Button variant="ghost" onClick={() => setRulesOpen(false)} className="text-slate-500">Cancel</Button>
             <Button 
                className="bg-indigo-600 hover:bg-indigo-500 font-bold"
                onClick={() => createRuleMutation.mutate(ruleForm)} 
                disabled={createRuleMutation.isPending}
              >
                SYNC RULESET
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
}
