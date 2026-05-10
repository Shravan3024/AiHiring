"use client";
import React, { useState, useMemo } from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, Search, Filter, Plus, ChevronRight, 
  Clock, Users, CheckCircle2, AlertCircle, TrendingUp, 
  Target, Zap, Brain, ShieldCheck, ArrowUpRight, 
  FileText, MessageSquare, Star, Activity, MoreHorizontal, MoreVertical, Calendar, 
  Video, Mic, Smile, Headphones, VideoOff, ArrowDownRight, Globe,
  LayoutGrid, Share2, Eye, Edit, Trash2, UserPlus, MapPin, Sparkles, Quote, RefreshCw,
  X, Download, FileDown, Layers, ArrowRight, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, CartesianGrid, Legend, ComposedChart
} from "recharts";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Interview Audit Modal Component
 */
function InterviewAuditModal({ interviewId }: { interviewId: string | number | null }) {
  const { data, isLoading } = useQuery({
    queryKey: ['interview-details', interviewId],
    queryFn: async () => {
      if (!interviewId) return null;
      const res = await api.get(`/hr/interviews/${interviewId}/details`);
      return res.data.data;
    },
    enabled: !!interviewId
  });

  if (!interviewId) return null;

  const session = data?.session;
  const analysis = data?.analysis;
  const qaPairs = data?.qaPairs || [];

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-border/40 p-0 shadow-sm">
      <DialogHeader className="p-8 border-b border-border/10 bg-muted/5">
        <div className="flex items-center justify-between gap-6">
           <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                 <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase px-2 py-0.5">Neural Audit v2.5</Badge>
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID: {interviewId}</span>
              </div>
              <DialogTitle className="text-2xl font-black text-foreground tracking-tight uppercase leading-none">
                 {session?.Application?.Candidate?.User?.name || "Interview Audit"}
              </DialogTitle>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 {session?.Application?.Job?.title} <ArrowRight className="w-3 h-3" /> Technical AI Round
              </p>
           </div>
           <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black uppercase text-[10px] px-3 py-1">
                 {qaPairs.length} Interaction Nodes
              </Badge>
           </div>
        </div>
      </DialogHeader>
      
      <ScrollArea className="h-[600px] w-full p-8 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data ? (
          <div className="space-y-10">
            {/* OVERALL SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="col-span-2 border-border/40 bg-primary/5 p-6 rounded-lg relative overflow-hidden group">
                  <Quote className="absolute -top-2 -right-2 w-24 h-24 opacity-[0.03] text-primary rotate-12" />
                  <div className="relative z-10">
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Brain className="w-4 h-4" /> AI Evaluation Feedback
                     </p>
                     <p className="text-sm font-medium text-foreground leading-relaxed italic">
                        "{analysis?.overall_feedback || session?.ai_analysis?.overall_feedback || "The candidate demonstrated balanced technical knowledge and strong communication skills. Potential for further growth within the engineering squad."}"
                     </p>
                  </div>
               </Card>
               <Card className="border-border/40 bg-muted/20 p-6 rounded-lg flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Overall Score</p>
                  <div className="text-4xl font-black text-primary tracking-tighter tabular-nums">
                     {session?.overall_score || analysis?.overall_score || "4.2"}<span className="text-sm text-muted-foreground/50 ml-1">/5</span>
                  </div>
                  <Badge className="mt-3 bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">
                     {session?.hire_recommendation || "RECOMMENDED"}
                  </Badge>
               </Card>
            </div>

            {/* Q&A SECTION */}
            <div className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Session Transcript & Analysis
               </h3>
               <div className="space-y-8">
                  {qaPairs.map((pair: any, i: number) => (
                    <div key={i} className="space-y-4">
                       {/* Question */}
                       <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                             <span className="text-[10px] font-black text-primary">Q{i+1}</span>
                          </div>
                          <div className="pt-1">
                             <p className="text-[13px] font-black text-foreground uppercase leading-relaxed tracking-tight">
                                {pair.question}
                             </p>
                          </div>
                       </div>
                       
                       {/* Answer */}
                       <div className="ml-12 p-6 rounded-lg bg-muted/10 border border-border/40 relative group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 rounded-full" />
                          <div className="flex items-center gap-2 mb-3">
                             <User className="w-3.5 h-3.5 text-muted-foreground" />
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Candidate Response</span>
                          </div>
                          <p className="text-[12px] font-medium text-foreground/80 leading-relaxed">
                             {pair.answer || pair.candidate_response || "No response recorded."}
                          </p>
                          
                          {pair.analysis && (
                             <div className="mt-6 pt-4 border-t border-border/10 space-y-3">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <Zap className="w-3 h-3 text-amber-500" />
                                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">AI Relevance Scoring</span>
                                   </div>
                                   <Badge variant="outline" className="text-[8px] font-black text-emerald-500 border-emerald-500/20">{pair.analysis.relevance || "High"}</Badge>
                                </div>
                                <p className="text-[11px] font-medium text-muted-foreground bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 italic">
                                   {pair.analysis.feedback || "The response shows deep conceptual understanding and practical application."}
                                </p>
                             </div>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
             <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
             <p className="text-xs font-black text-muted-foreground uppercase">Failed to load session details.</p>
          </div>
        )}
      </ScrollArea>
    </DialogContent>
  );
}

/**
 * Schedule Interview Modal Component
 */
function ScheduleInterviewModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [interviewTime, setInterviewTime] = useState<string>("");
  const [interviewType, setInterviewType] = useState<string>("VIDEO");
  const [interviewer, setInterviewer] = useState<string>("AI Neural Core");

  // Fetch ready candidates
  const { data: readyApps = [] } = useQuery({
    queryKey: ['ready-for-interview'],
    queryFn: async () => {
      const res = await api.get('/hr/interviews/ready');
      return res.data.data;
    },
    enabled: isOpen
  });

  const scheduleMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post(`/hr/schedule-interview/${payload.applicationId}`, payload);
    },
    onSuccess: () => {
      toast.success("Interview scheduled successfully");
      queryClient.invalidateQueries({ queryKey: ['interviews-list'] });
      queryClient.invalidateQueries({ queryKey: ['interview-stats'] });
      onOpenChange(false);
      // Reset form
      setSelectedAppId("");
      setInterviewDate("");
      setInterviewTime("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to schedule interview");
    }
  });

  const handleSchedule = () => {
    if (!selectedAppId || !interviewDate || !interviewTime) {
      toast.error("Please fill all required fields");
      return;
    }
    scheduleMutation.mutate({
      applicationId: selectedAppId,
      interview_date: interviewDate,
      interview_time: interviewTime,
      interview_type: interviewType,
      interviewer: interviewer
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-lg border-border/40 shadow-sm p-0 overflow-hidden">
        <DialogHeader className="p-8 border-b border-border/10 bg-primary/5">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/20">
                 <Calendar className="w-5 h-5" />
              </div>
              <div>
                 <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">Schedule AI Interview</DialogTitle>
                 <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Set up a new neural evaluation session</DialogDescription>
              </div>
           </div>
        </DialogHeader>
        
        <div className="p-8 space-y-6">
           {/* Candidate Selection */}
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Target Candidate</label>
              <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                 <SelectTrigger className="rounded-xl border-border/50 h-12 text-xs font-bold uppercase tracking-widest bg-muted/20">
                    <SelectValue placeholder="Select Candidate" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-border/40 shadow-xl max-h-[300px]">
                    {readyApps.length > 0 ? readyApps.map((app: any) => (
                       <SelectItem key={app.id} value={app.id.toString()}>
                          <div className="flex flex-col py-1">
                             <span className="font-black text-foreground">{app.candidateName}</span>
                             <span className="text-[8px] text-muted-foreground">{app.jobTitle}</span>
                          </div>
                       </SelectItem>
                    )) : (
                       <div className="py-6 px-2 text-center">
                          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-[10px] font-black text-muted-foreground uppercase">No candidates ready</p>
                       </div>
                    )}
                 </SelectContent>
              </Select>
           </div>

           <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Interview Date</label>
                 <Input 
                   type="date" 
                   value={interviewDate}
                   onChange={(e) => setInterviewDate(e.target.value)}
                   className="rounded-xl border-border/50 h-12 text-xs font-bold bg-muted/20" 
                 />
              </div>
              {/* Time */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Start Time</label>
                 <Input 
                   type="time" 
                   value={interviewTime}
                   onChange={(e) => setInterviewTime(e.target.value)}
                   className="rounded-xl border-border/50 h-12 text-xs font-bold bg-muted/20" 
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Interview Mode</label>
                 <Select value={interviewType} onValueChange={setInterviewType}>
                    <SelectTrigger className="rounded-xl border-border/50 h-12 text-xs font-bold uppercase tracking-widest bg-muted/20">
                       <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40 shadow-xl">
                       <SelectItem value="VIDEO">AI Video Round</SelectItem>
                       <SelectItem value="AUDIO">AI Audio Round</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              {/* Interviewer */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Evaluating Core</label>
                 <Input 
                   value={interviewer}
                   onChange={(e) => setInterviewer(e.target.value)}
                   className="rounded-xl border-border/50 h-12 text-xs font-bold bg-muted/20" 
                   placeholder="e.g. AI Neural Core"
                 />
              </div>
           </div>

           <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex gap-3">
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[9px] font-medium text-muted-foreground leading-relaxed">
                 <span className="font-black text-primary uppercase">Security Protocol:</span> The interview link will remain active for exactly <span className="text-foreground font-black">10 hours</span> from the scheduled start time. After this window, the session will be automatically locked.
              </p>
           </div>
        </div>

        <DialogFooter className="p-8 pt-0 flex items-center justify-between gap-4">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[10px] font-black uppercase tracking-widest">Discard</Button>
           <Button 
             onClick={handleSchedule} 
             disabled={scheduleMutation.isPending}
             className="rounded-xl industrial-gradient text-white text-[10px] font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20 flex-1"
           >
              {scheduleMutation.isPending ? (
                 <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Processing...
                 </div>
              ) : "Initialize Schedule"}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function HighFidelityInterviewsV2() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | number | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // FETCH STATS
  const { data: statsData } = useQuery({
    queryKey: ['interview-stats'],
    queryFn: async () => {
      const res = await api.get('/hr/interviews/stats');
      return res.data.data;
    }
  });

  // FETCH LIST
  const { data: rawInterviews = [], isLoading } = useQuery({
    queryKey: ['interviews-list'],
    queryFn: async () => {
      const res = await api.get('/hr/interviews/list');
      return res.data.data;
    }
  });

  // Memoized filtered interviews
  const filteredInterviews = useMemo(() => {
    return rawInterviews.filter((int: any) => {
      const matchesSearch = int.candidate.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           int.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || activeTab === "Overview" || int.status.toUpperCase() === activeTab.toUpperCase();
      return matchesSearch && matchesTab;
    });
  }, [rawInterviews, searchQuery, activeTab]);

  const exportToCSV = () => {
    const headers = ["Candidate", "Role", "Round", "Status", "Score", "Date"];
    const rows = filteredInterviews.map((int: any) => [
      int.candidate,
      int.role,
      int.round,
      int.status,
      int.score,
      int.dateTime ? new Date(int.dateTime).toLocaleDateString() : "N/A"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Interviews_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Interview report exported successfully");
  };

  const kpis = statsData?.kpis || {
    total: "0", completed: "0", scheduled: "0", cancelled: "0", avgScore: "0"
  };

  const distribution = statsData?.distribution || [
    { name: "STRONG_YES", value: 0, color: "#10b981" },
    { name: "YES", value: 0, color: "#3b82f6" },
    { name: "MAYBE", value: 0, color: "#f59e0b" },
    { name: "NO", value: 0, color: "#ef4444" },
  ];

  const highlights = statsData?.highlights || [];

  return (
    <PanelLayout title="Interviews" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">Interviews</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Schedule, conduct and evaluate candidate interviews</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" 
                   placeholder="Search candidates, roles..." 
                 />
              </div>
              <Button 
                onClick={() => setIsScheduleModalOpen(true)}
                variant="outline" 
                className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2"
              >
                 <Calendar className="w-4 h-4" /> Schedule
              </Button>
              <Button 
                onClick={() => setIsScheduleModalOpen(true)}
                className="h-10 rounded-xl industrial-gradient text-white text-xs font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
              >
                 <Plus className="w-4 h-4" /> New Interview
              </Button>
           </div>
        </div>

        {/* TABS */}
        <div className="flex bg-muted/20 p-1.5 rounded-lg gap-2 border border-border/40 overflow-x-auto no-scrollbar">
           {["Overview", "Scheduled", "Completed", "Cancelled", "All"].map((t) => (
              <Button 
                key={t} 
                onClick={() => setActiveTab(t)}
                variant="ghost" 
                className={cn(
                  "h-10 text-[10px] font-black uppercase tracking-widest px-6 rounded-xl transition-all",
                  activeTab === t ? "bg-card text-primary shadow-lg" : "text-muted-foreground opacity-60 hover:opacity-100"
                )}
              >
                {t}
              </Button>
           ))}
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
           {[
              { title: "Total Interviews", value: kpis.total, icon: Video, color: "text-primary", trend: "+18.6%" },
              { title: "Completed", value: kpis.completed, icon: CheckCircle2, color: "text-emerald-500", trend: "+16.2%" },
              { title: "Scheduled", value: kpis.scheduled, icon: Clock, color: "text-purple-500", trend: "+12.5%" },
              { title: "Cancelled", value: kpis.cancelled, icon: VideoOff, color: "text-rose-500", trend: "+5.6%" },
              { title: "Avg. Score", value: `${kpis.avgScore} / 5`, icon: Star, color: "text-amber-500", trend: "+6.3%" },
           ].map((k, i) => (
              <Card key={i} className="border-border/40 shadow-xl overflow-hidden group">
                 <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                       <div className={cn("p-2 rounded-xl bg-muted/50 border border-border/50", k.color)}>
                          <k.icon className="w-4 h-4" />
                       </div>
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{k.title}</span>
                    </div>
                    <div className="flex items-end justify-between">
                       <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{k.value}</p>
                       <div className="text-[9px] font-black text-emerald-500 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" /> {k.trend}
                       </div>
                    </div>
                 </CardContent>
              </Card>
           ))}
        </div>

        {/* INTERVIEW HIGHLIGHTS */}
        {highlights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Interview Highlights & AI Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {highlights.map((h: any, i: number) => (
                  <Card key={i} className="border-border/40 shadow-xl rounded-lg overflow-hidden border-l-4 border-l-primary/50 relative group hover:border-primary/30 transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <Quote className="absolute top-4 right-4 w-12 h-12 opacity-5 text-primary group-hover:scale-110 transition-transform" />
                        <Badge className="text-[8px] font-black uppercase mb-4 bg-primary/10 text-primary border-none">AI INSIGHT</Badge>
                        <p className="text-xs font-medium text-foreground leading-relaxed italic mb-4">"{h.insight}"</p>
                        <div className="flex items-center gap-2 pt-2 border-t border-border/10">
                            <div className="w-6 h-6 rounded-full bg-muted border border-border/50 overflow-hidden">
                              <img 
                                src={h.img} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{h.name}</span>
                        </div>
                      </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* MAIN SECTION: TABLE & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* All Interviews Table */}
           <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Sessions</CardTitle>
                 <div className="flex items-center gap-3">
                    <Button onClick={exportToCSV} variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase gap-2"><Share2 className="w-3 h-3" /> Export</Button>
                 </div>
              </div>

              <Card className="border-border/40 shadow-sm rounded-lg overflow-hidden">
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest bg-muted/10">
                             <tr>
                                <th className="px-6 py-4">Candidate</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Round</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Score</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10">
                             {isLoading ? (
                               <tr>
                                 <td colSpan={6} className="px-6 py-12 text-center">
                                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                 </td>
                               </tr>
                             ) : filteredInterviews.length > 0 ? filteredInterviews.map((int: any) => (
                                <tr key={int.id} className="hover:bg-muted/5 transition-colors group">
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                         <div className="w-9 h-9 rounded-xl bg-muted border border-border/50 overflow-hidden">
                                             <img 
                                                src={int.img || "/images/default-avatar.png"} 
                                                alt="" 
                                                className="w-full h-full object-cover" 
                                                onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }}
                                             />
                                         </div>
                                         <div>
                                            <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{int.candidate}</p>
                                            <p className="text-[8px] font-bold text-muted-foreground truncate max-w-[120px]">{int.candidateEmail}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4">
                                      <p className="text-[10px] font-black text-muted-foreground uppercase">{int.role}</p>
                                      <p className="text-[8px] font-bold text-primary/50 uppercase">{int.dateTime && !isNaN(new Date(int.dateTime).getTime()) ? new Date(int.dateTime).toLocaleDateString() : "PENDING"}</p>
                                   </td>
                                   <td className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase">{int.round}</td>
                                   <td className="px-6 py-4 text-center">
                                      <Badge className={cn(
                                         "text-[8px] font-black uppercase tracking-widest border-none",
                                         int.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" :
                                         int.status === "CANCELLED" ? "bg-rose-500/10 text-rose-500" :
                                         "bg-blue-500/10 text-blue-500"
                                      )}>{int.status}</Badge>
                                   </td>
                                   <td className="px-6 py-4 text-center text-[11px] font-black text-foreground">{int.score}</td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                         <Dialog>
                                            <DialogTrigger asChild>
                                               <Button onClick={() => setSelectedInterviewId(int.id)} variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><Eye className="w-3.5 h-3.5 text-primary" /></Button>
                                            </DialogTrigger>
                                            <InterviewAuditModal interviewId={selectedInterviewId} />
                                         </Dialog>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                               <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><MoreVertical className="w-3.5 h-3.5" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-border/40">
                                               <DropdownMenuItem className="text-[10px] font-black uppercase gap-2 cursor-pointer">
                                                  <FileDown className="w-3 h-3" /> Download Report
                                               </DropdownMenuItem>
                                               <DropdownMenuItem className="text-[10px] font-black uppercase gap-2 cursor-pointer text-rose-500 focus:text-rose-500">
                                                  <Trash2 className="w-3 h-3" /> Cancel Interview
                                               </DropdownMenuItem>
                                            </DropdownMenuContent>
                                         </DropdownMenu>
                                      </div>
                                   </td>
                                </tr>
                             )) : (
                               <tr>
                                 <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground uppercase text-[10px] font-black">
                                   No interview sessions found.
                                 </td>
                               </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Sidebar: Summary & Distribution */}
           <div className="lg:col-span-4 space-y-6">
              
              {/* Interview Summary */}
              <Card className="border-border/40 shadow-sm rounded-lg overflow-hidden p-6">
                 <div className="flex items-center justify-between mb-8">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Pipeline Efficiency</CardTitle>
                 </div>
                 <div className="space-y-6">
                    {[
                       { label: 'Completion Rate', val: '84.5%', trend: 'up', trendVal: '8.6%', color: 'text-emerald-500', icon: CheckCircle2 },
                       { label: 'No Show Rate', val: '6.2%', trend: 'up', trendVal: '2.1%', color: 'text-rose-500', icon: VideoOff },
                       { label: 'Reschedule Rate', val: '12.4%', trend: 'up', trendVal: '1.3%', color: 'text-amber-500', icon: RefreshCw },
                       { label: 'Avg. Score', val: `${kpis.avgScore} / 5`, trend: 'down', trendVal: '0.4', color: 'text-blue-500', icon: Star },
                    ].map((s, i) => (
                       <div key={i} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <div className="p-1.5 rounded-lg bg-muted/50 border border-border/50 group-hover:text-primary transition-colors">
                                <s.icon className="w-3.5 h-3.5" />
                             </div>
                             <span className="text-[10px] font-black text-muted-foreground uppercase">{s.label}</span>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-black text-foreground">{s.val}</p>
                             <div className={cn("flex items-center gap-1 text-[8px] font-black uppercase", s.trend === 'up' ? 'text-emerald-500' : 'text-rose-500')}>
                                {s.trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />} {s.trendVal}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>

              {/* Score Distribution */}
              <Card className="border-border/40 shadow-sm rounded-lg overflow-hidden p-8">
                 <div className="flex items-center justify-between mb-8">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Hiring Recommendation</CardTitle>
                 </div>
                 <div className="relative h-48 w-full mb-8">
                    <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={distribution} 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                             {distribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color || ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index % 4]} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-2xl font-black text-foreground tracking-tighter">{kpis.completed}</span>
                       <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Graded</span>
                    </div>
                 </div>
                 <div className="space-y-3">
                    {distribution.map((d: any, i: number) => (
                       <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color || ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i % 4] }}></div>
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{d.name}</span>
                          </div>
                          <span className="text-[10px] font-black text-foreground tabular-nums">{d.value}</span>
                       </div>
                    ))}
                 </div>
              </Card>

           </div>

        </div>

        {/* BOTTOM SECTION: ANALYTICS & TOP INTERVIEWERS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
           
           {/* Interview Analytics */}
           <Card className="lg:col-span-12 border-border/40 shadow-sm rounded-lg overflow-hidden">
              <CardHeader className="border-b border-white/5 px-8 py-5 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Video Intelligence</CardTitle>
                 <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">Explore All Clips</Button>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                       { name: "Technical Deep-dive", cand: "Rohan Verma", duration: "0:45", tag: "System Design", color: "from-blue-500/20 to-transparent", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" },
                       { name: "Leadership Response", cand: "Neha Kapoor", duration: "1:20", tag: "Culture Fit", color: "from-emerald-500/20 to-transparent", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80" },
                       { name: "Problem Solving", cand: "Arjun Nair", duration: "0:30", tag: "Algorithm", color: "from-purple-500/20 to-transparent", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80" },
                       { name: "Architecture Vision", cand: "Sarthak Giri", duration: "2:15", tag: "High Potential", color: "from-amber-500/20 to-transparent", img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80" },
                    ].map((v, i) => (
                       <div key={i} className="relative aspect-video rounded-lg overflow-hidden group border border-border/40 cursor-pointer">
                          <img src={v.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-10 h-10 rounded-full industrial-gradient flex items-center justify-center">
                                <Video className="w-4 h-4 text-white" />
                             </div>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                             <Badge className="bg-black/60 text-white text-[7px] border-none font-black">{v.duration}</Badge>
                             <span className="text-[9px] font-black text-white uppercase tracking-tighter shadow-xl">{v.cand}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

        </div>

        <ScheduleInterviewModal isOpen={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen} />

      </div>
    </PanelLayout>
  );
}
