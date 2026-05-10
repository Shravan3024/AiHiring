"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Power, Search, Briefcase, FileText, Video, HelpCircle, ChevronRight, ChevronDown, MapPin, Users, Target, Zap, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: "ACTIVE" | "CLOSED" | "DRAFT";
  applicationCount?: number;
  createdAt: string;
  description?: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  minExperience?: number;
  maxExperience?: number;
  urgency?: string;
  requiredSkills?: string[];
  skillWeights?: Record<string, string>;
}

const EMPTY_JOB = {
  title: "", department: "", location: "", type: "FULL_TIME",
  description: "", requirements: "", salaryMin: "", salaryMax: "",
  minExperience: "0", maxExperience: "10", urgency: "NORMAL",
  skillsList: [] as { skill: string; weight: string }[],
  technicalQuestions: [] as any[],
  interviewQuestions: [] as any[]
};

export default function AdminJobsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState<typeof EMPTY_JOB>(EMPTY_JOB);

  const { data: jobsData = [], isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => adminApi.getJobs().then((r) => r.data?.data || r.data?.jobs || r.data || []),
  });

  const jobs = Array.isArray(jobsData) ? jobsData : [];

  const createMutation = useMutation({
    mutationFn: (data: object) => adminApi.createJob(data),
    onSuccess: () => { 
        qc.invalidateQueries({ queryKey: ["admin-jobs"] }); 
        setOpen(false);
        toast.success("Position deployed successfully");
    },
    onError: () => toast.error("Deployment failed")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => adminApi.updateJob(id, data),
    onSuccess: () => { 
        qc.invalidateQueries({ queryKey: ["admin-jobs"] }); 
        setOpen(false);
        toast.success("Position synchronized");
    },
    onError: () => toast.error("Synchronization failed")
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateJob(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-jobs"] }); toast.success("Position activated"); },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => adminApi.closeJob(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-jobs"] }); toast.success("Position closed"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteJob(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-jobs"] }); toast.success("Position revoked"); },
  });

  const filtered = jobs.filter((j: Job) =>
    (j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.department?.toLowerCase().includes(search.toLowerCase()))
  );

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_JOB });
    setOpen(true);
  }

  function openEdit(job: Job) {
    setEditing(job);
    const skillsList = job.requiredSkills?.map(skill => ({
       skill,
       weight: job.skillWeights?.[skill] || "MEDIUM"
    })) || [];

    setForm({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      type: job.type || "FULL_TIME",
      description: job.description || "",
      requirements: job.requirements || "",
      salaryMin: String(job.salaryMin || ""),
      salaryMax: String(job.salaryMax || ""),
      minExperience: String(job.minExperience ?? 0),
      maxExperience: String(job.maxExperience ?? 10),
      urgency: job.urgency || "NORMAL",
      skillsList,
      technicalQuestions: (job as any).technicalQuestions || [], 
      interviewQuestions: (job as any).interviewQuestions || []
    });
    setOpen(true);
  }

  function handleSubmit() {
    const requiredSkills = form.skillsList.map(s => s.skill.trim()).filter(Boolean);
    const skillWeights = form.skillsList.reduce((acc, curr) => {
       if (curr.skill.trim()) acc[curr.skill.trim()] = curr.weight;
       return acc;
    }, {} as Record<string, string>);

    const payload = { 
       ...form, 
       salaryMin: Number(form.salaryMin) || 0, 
       salaryMax: Number(form.salaryMax) || 0,
       minExperience: Number(form.minExperience) || 0,
       maxExperience: Number(form.maxExperience) || 10,
       requiredSkills,
       skillWeights
    };

    if (editing) updateMutation.mutate({ id: editing._id, data: payload });
    else createMutation.mutate(payload);
  }

  return (
    <PanelLayout title="Global Vacancies" allowedRoles={["ADMIN"]}>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        
        {/* Header Action Layer */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Position Inventory</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-[0.2em]">Deployment & Lifecycle Governance</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                 <Input 
                    placeholder="Filter positions..." 
                    className="h-12 pl-10 pr-4 w-72 bg-white shadow-sm border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/50"
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                 />
              </div>
              <Button 
                onClick={openCreate} 
                className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 group transition-all"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
                Deploy Position
              </Button>
           </div>
        </div>

        {/* Content Layer */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-white shadow-sm border border-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((job: Job) => (
              <div 
                key={job._id} 
                className="group relative bg-white shadow-sm border border-slate-200 rounded-lg p-7 backdrop-blur-md hover:bg-slate-100 transition-all duration-500 hover:-translate-y-1"
              >
                {/* Status Indicator */}
                <div className="absolute top-7 right-7">
                  <Badge className={cn(
                    "text-[9px] font-black tracking-widest uppercase border-0 px-3 py-1",
                    job.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" :
                    job.status === "CLOSED" ? "bg-rose-500/10 text-rose-400" : "bg-slate-100 text-slate-500"
                  )}>
                    {job.status}
                  </Badge>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-slate-200 shrink-0">
                         <Briefcase className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="min-w-0 pr-16">
                         <h4 className="text-lg font-bold text-slate-900 tracking-tight truncate group-hover:text-blue-400 transition-colors uppercase">{job.title}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{job.department}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-slate-500 truncate">
                         <MapPin className="w-3.5 h-3.5" />
                         <span className="text-xs font-medium tracking-tight truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 truncate">
                         <Users className="w-3.5 h-3.5" />
                         <span className="text-xs font-medium tracking-tight">{job.applicationCount || 0} Inbound</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 truncate">
                         <Target className="w-3.5 h-3.5" />
                         <span className="text-xs font-medium tracking-tight uppercase tracking-widest">{job.type?.split('_')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 truncate">
                         <Zap className="w-3.5 h-3.5" />
                         <span className="text-xs font-medium tracking-tight">{job.minExperience}+ Yrs Exp</span>
                      </div>
                   </div>

                   {/* Micro skills preview */}
                   <div className="flex flex-wrap gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      {(job.requiredSkills || []).slice(0, 3).map(sk => (
                        <span key={sk} className="text-[9px] font-black uppercase tracking-widest bg-white shadow-sm border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">{sk}</span>
                      ))}
                      {(job.requiredSkills?.length || 0) > 3 && <span className="text-[9px] font-black text-slate-400">+{job.requiredSkills!.length - 3}</span>}
                   </div>

                   <div className="pt-4 border-t border-slate-200 flex gap-2">
                      <button 
                        onClick={() => openEdit(job)}
                        className="flex-1 h-11 bg-white shadow-sm hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-slate-200"
                      >
                         Configure
                      </button>
                      <button 
                         onClick={() => { if (confirm("Terminate position access?")) deleteMutation.mutate(job._id); }}
                         className="w-11 h-11 flex items-center justify-center bg-white shadow-sm hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                      {job.status !== "ACTIVE" ? (
                        <button 
                           onClick={() => activateMutation.mutate(job._id)}
                           className="w-11 h-11 flex items-center justify-center bg-white shadow-sm hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
                        >
                           <Power className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                           onClick={() => closeMutation.mutate(job._id)}
                           className="w-11 h-11 flex items-center justify-center bg-white shadow-sm hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 rounded-xl transition-all border border-transparent hover:border-amber-500/20"
                        >
                           <Clock className="w-4 h-4" />
                        </button>
                      )}
                   </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-40 flex flex-col items-center justify-center text-center opacity-20 italic">
                 <Briefcase className="w-20 h-20 mb-4" />
                 <p className="text-sm font-black uppercase tracking-[0.4em]">Inventory Empty</p>
              </div>
            )}
          </div>
        )}

        {/* DIALOG REDESIGN */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-white border-slate-200 text-slate-900 rounded-lg p-0 custom-scrollbar shadow-sm">
            <DialogHeader className="p-8 bg-slate-50 border-b border-slate-200 space-y-2">
               <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-blue-400" />
               </div>
               <DialogTitle className="text-2xl font-bold tracking-tight">{editing ? "Sync Position" : "Deploy Position"}</DialogTitle>
               <DialogDescription className="text-slate-500 font-medium">
                  {editing ? "Update algorithmic weights and position details." : "Initialize a new talent acquisition corridor."}
               </DialogDescription>
            </DialogHeader>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Job Identity</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Senior Systems Architect" className="h-12 bg-white shadow-sm border-slate-200 rounded-xl focus:ring-blue-500/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Functional Group</Label>
                  <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Infrastructure" className="h-12 bg-white shadow-sm border-slate-200 rounded-xl focus:ring-blue-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Geographical Node</Label>
                  <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Hybrid / Remote" className="h-12 bg-white shadow-sm border-slate-200 rounded-xl focus:ring-blue-500/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Engagement Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="h-12 bg-white shadow-sm border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="FULL_TIME">Full Time Access</SelectItem>
                      <SelectItem value="PART_TIME">Part Time Access</SelectItem>
                      <SelectItem value="CONTRACT">Project Contract</SelectItem>
                      <SelectItem value="INTERNSHIP">Internal Rotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Remuneration Bounds (Min-Max)</Label>
                    <div className="flex items-center gap-3">
                       <Input type="number" value={form.salaryMin} onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))} placeholder="0" className="h-12 bg-white shadow-sm border-slate-200 rounded-xl" />
                       <div className="h-px w-4 bg-slate-100" />
                       <Input type="number" value={form.salaryMax} onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))} placeholder="0" className="h-12 bg-white shadow-sm border-slate-200 rounded-xl" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Experience Lifecycle (Yrs)</Label>
                    <div className="flex items-center gap-3">
                       <Input type="number" value={form.minExperience} onChange={e => setForm(f => ({ ...f, minExperience: e.target.value }))} placeholder="Min" className="h-12 bg-white shadow-sm border-slate-200 rounded-xl" />
                       <div className="h-px w-4 bg-slate-100" />
                       <Input type="number" value={form.maxExperience} onChange={e => setForm(f => ({ ...f, maxExperience: e.target.value }))} placeholder="Max" className="h-12 bg-white shadow-sm border-slate-200 rounded-xl" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Algorithmic Skill Weights</Label>
                    <Button variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/10" onClick={() => setForm(f => ({...f, skillsList: [...f.skillsList, {skill: "", weight: "MEDIUM"}]}))}>
                       + Append Skill
                    </Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                    {form.skillsList.map((sk, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl group hover:border-slate-200 transition-colors">
                        <Input className="h-9 bg-transparent border-0 text-sm font-bold placeholder:opacity-20" value={sk.skill} onChange={e => {
                           const ns = [...form.skillsList]; ns[i].skill = e.target.value; setForm(f => ({...f, skillsList: ns}));
                        }} placeholder="e.g. Docker" />
                        <Select value={sk.weight} onValueChange={v => {
                           const ns = [...form.skillsList]; ns[i].weight = v; setForm(f => ({...f, skillsList: ns}));
                        }}>
                          <SelectTrigger className="w-24 h-9 bg-white shadow-sm border-0 text-[10px] font-black uppercase tracking-widest"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 text-slate-900">
                            <SelectItem value="HIGH" className="text-emerald-400">High</SelectItem>
                            <SelectItem value="MEDIUM" className="text-blue-400">Med</SelectItem>
                            <SelectItem value="LOW" className="text-slate-500">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <button className="p-2 opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity" onClick={() => {
                            const ns = [...form.skillsList]; ns.splice(i, 1); setForm(f => ({...f, skillsList: ns}));
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {form.skillsList.length === 0 && <div className="col-span-2 py-10 border border-dashed border-slate-200 rounded-lg text-center opacity-20 italic text-xs uppercase tracking-widest font-black">Weight Matrix Empty</div>}
                 </div>
              </div>

              <div className="space-y-4 pt-4">
                 <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Position Assessment Architecture</span>
                 </div>
                 
                 <Accordion type="single" collapsible className="space-y-3">
                    <AccordionItem value="technical" className="border-0 bg-white shadow-sm rounded-lg px-6">
                       <AccordionTrigger className="hover:no-underline py-4">
                          <span className="text-xs font-bold text-slate-900 tracking-tight">Technical Knowledge Evaluation ({form.technicalQuestions?.length || 0})</span>
                       </AccordionTrigger>
                       <AccordionContent className="pb-6 space-y-4">
                          {form.technicalQuestions?.map((q, i) => (
                             <div key={i} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative group">
                                <button className="absolute top-4 right-4 text-rose-500/20 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100" onClick={() => {
                                   const n = [...form.technicalQuestions]; n.splice(i, 1); setForm(f => ({...f, technicalQuestions: n}));
                                }}><Trash2 className="w-4 h-4" /></button>
                                <div className="grid grid-cols-2 gap-4">
                                   <Input placeholder="Logic Topic" className="h-10 bg-white shadow-sm border-slate-200 rounded-lg text-xs" value={q.topic} onChange={e => {
                                      const n = [...form.technicalQuestions]; n[i].topic = e.target.value; setForm(f => ({...f, technicalQuestions: n}));
                                   }} />
                                   <Select value={q.difficulty} onValueChange={v => {
                                      const n = [...form.technicalQuestions]; n[i].difficulty = v; setForm(f => ({...f, technicalQuestions: n}));
                                   }}>
                                      <SelectTrigger className="h-10 bg-white shadow-sm border-slate-200 rounded-lg text-[10px] uppercase font-black tracking-widest"><SelectValue /></SelectTrigger>
                                      <SelectContent className="bg-white border-slate-200 text-slate-900"><SelectItem value="EASY">Easy</SelectItem><SelectItem value="MEDIUM">Med</SelectItem><SelectItem value="HARD">Hard</SelectItem></SelectContent>
                                   </Select>
                                </div>
                                <Textarea placeholder="Question Text" className="bg-white shadow-sm border-slate-200 rounded-lg text-xs" rows={2} value={q.question} onChange={e => {
                                   const n = [...form.technicalQuestions]; n[i].question = e.target.value; setForm(f => ({...f, technicalQuestions: n}));
                                }} />
                                <Input placeholder="Correct Answer Vector" className="h-10 bg-blue-500/5 border-blue-500/10 rounded-lg text-xs text-blue-400 font-bold" value={q.correct_answer} onChange={e => {
                                   const n = [...form.technicalQuestions]; n[i].correct_answer = e.target.value; setForm(f => ({...f, technicalQuestions: n}));
                                }} />
                             </div>
                          ))}
                          <Button variant="ghost" className="w-full h-12 border border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm transition-all" onClick={() => setForm(f => ({...f, technicalQuestions: [...(f.technicalQuestions || []), {topic: "", difficulty: "MEDIUM", questionType: "THEORY", question: "", correct_answer: ""}]}))}>
                             + Insert Technical Node
                          </Button>
                       </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="interview" className="border-0 bg-white shadow-sm rounded-lg px-6">
                       <AccordionTrigger className="hover:no-underline py-4">
                          <span className="text-xs font-bold text-slate-900 tracking-tight">AI Interview Prompt Engineering ({form.interviewQuestions?.length || 0})</span>
                       </AccordionTrigger>
                       <AccordionContent className="pb-6 space-y-4">
                          {form.interviewQuestions?.map((q, i) => (
                             <div key={i} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative group">
                                <button className="absolute top-4 right-4 text-rose-500/20 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100" onClick={() => {
                                   const n = [...form.interviewQuestions]; n.splice(i, 1); setForm(f => ({...f, interviewQuestions: n}));
                                }}><Trash2 className="w-4 h-4" /></button>
                                <div className="grid grid-cols-2 gap-4">
                                   <Select value={q.category} onValueChange={v => {
                                      const n = [...form.interviewQuestions]; n[i].category = v; setForm(f => ({...f, interviewQuestions: n}));
                                   }}>
                                      <SelectTrigger className="h-10 bg-white shadow-sm border-slate-200 rounded-lg text-[10px] uppercase font-black"><SelectValue /></SelectTrigger>
                                      <SelectContent className="bg-white border-slate-200 text-slate-900">
                                         <SelectItem value="TECHNICAL_DEEP_DIVE">Technical</SelectItem>
                                         <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                                         <SelectItem value="SYSTEM_DESIGN">System Design</SelectItem>
                                      </SelectContent>
                                   </Select>
                                   <Select value={q.difficulty} onValueChange={v => {
                                      const n = [...form.interviewQuestions]; n[i].difficulty = v; setForm(f => ({...f, interviewQuestions: n}));
                                   }}>
                                      <SelectTrigger className="h-10 bg-white shadow-sm border-slate-200 rounded-lg text-[10px] uppercase font-black"><SelectValue /></SelectTrigger>
                                      <SelectContent className="bg-white border-slate-200 text-slate-900"><SelectItem value="EASY">Easy</SelectItem><SelectItem value="MEDIUM">Med</SelectItem><SelectItem value="HARD">Hard</SelectItem></SelectContent>
                                   </Select>
                                </div>
                                <Textarea placeholder="Video Analysis Prompt" className="bg-white shadow-sm border-slate-200 rounded-lg text-xs" rows={2} value={q.question} onChange={e => {
                                   const n = [...form.interviewQuestions]; n[i].question = e.target.value; setForm(f => ({...f, interviewQuestions: n}));
                                }} />
                             </div>
                          ))}
                          <Button variant="ghost" className="w-full h-12 border border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm transition-all" onClick={() => setForm(f => ({...f, interviewQuestions: [...f.interviewQuestions, {category: "TECHNICAL_DEEP_DIVE", difficulty: "MEDIUM", question: "", expectedAnswer: ""}]}))}>
                             + Insert Video Analysis Node
                          </Button>
                       </AccordionContent>
                    </AccordionItem>
                 </Accordion>
              </div>
            </div>

            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-200 h-24 flex items-center">
              <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-500 font-bold hover:bg-white shadow-sm">Cancel</Button>
              <Button 
                onClick={handleSubmit} 
                className="px-10 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest h-14 rounded-lg shadow-xl shadow-blue-500/20"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editing ? "SYNC ARCHITECTURE" : "DEPLOY POSITION"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PanelLayout>
  );
}
