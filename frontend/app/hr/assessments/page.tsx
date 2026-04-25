"use client";
import React, { useState, useMemo } from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, Search, Filter, Plus, ChevronRight, 
  Clock, Users, CheckCircle2, AlertCircle, TrendingUp, 
  Target, Zap, Brain, ShieldCheck, ArrowUpRight, 
  FileText, MessageSquare, Star, Activity, MoreHorizontal, MoreVertical, Calendar, 
  ArrowDownRight, PieChart as PieIcon, BarChart3, List, Share2, 
  Download, Eye, Trash2, Settings, BookOpen, Layers, UserPlus, Globe, X, Copy, Archive, FileDown
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function AssessmentKPICard({ title, value, trend, trendValue, icon: Icon, color, sparkData, stroke }: any) {
  return (
    <Card className="border-border/40 glass shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-xl bg-muted/50 border border-border/50", color)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{value}</p>
            <div className={cn(
              "flex items-center gap-1 text-[9px] font-black mt-1 uppercase tracking-widest",
              trend === "up" ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendValue} vs last 30 days
            </div>
          </div>
          <div className="h-10 w-24">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                   <Area type="monotone" dataKey="v" stroke={stroke} fill={`${stroke}10`} strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionAuditModal({ jobId, jobTitle }: { jobId: number, jobTitle: string }) {
  const { data: detailsRes, isLoading } = useQuery({
    queryKey: ['assessment-details', jobId],
    queryFn: async () => (await api.get(`/hr/assessments/${jobId}/details`)).data,
    enabled: !!jobId
  });

  const questions = detailsRes?.data?.questions || [];

  return (
    <DialogContent className="max-w-4xl max-h-[85vh] glass-dark border-border/40 text-foreground overflow-hidden flex flex-col p-0">
      <DialogHeader className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
           <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">{jobTitle} Audit</DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Reviewing active question bank and evaluation criteria</p>
           </div>
           <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black uppercase text-[10px] px-3 py-1">
              {questions.length} Questions
           </Badge>
        </div>
      </DialogHeader>
      
      <ScrollArea className="h-[600px] w-full p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-8">
            {questions.map((q: any, i: number) => (
              <div key={q.id} className="p-6 rounded-2xl bg-muted/20 border border-border/40 space-y-4">
                 <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                       <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                          {i + 1}
                       </span>
                       <h4 className="text-[13px] font-black text-foreground uppercase leading-relaxed tracking-tight">{q.question}</h4>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase whitespace-nowrap">
                       {q.difficulty}
                    </Badge>
                 </div>

                 {q.options && q.options.length > 0 && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-9">
                      {q.options.map((opt: string, idx: number) => (
                         <div key={idx} className={cn(
                            "p-3 rounded-xl text-[11px] font-bold border transition-all",
                            opt.startsWith(q.correctAnswer) || opt.includes(q.correctAnswer)
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                              : "bg-muted/30 border-border/20 text-muted-foreground/70"
                         )}>
                            {opt}
                         </div>
                      ))}
                   </div>
                 )}

                 <div className="ml-9 p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                       <Brain className="w-3 h-3" /> Evaluation Context
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{q.explanation || q.correctAnswer || "No explanation provided."}</p>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
             <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
             <p className="text-xs font-black text-muted-foreground uppercase">No questions found for this assessment.</p>
          </div>
        )}
      </ScrollArea>
    </DialogContent>
  );
}

export default function HighFidelityAssessmentsV3() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  const { data: statsRes } = useQuery({
    queryKey: ['assessment-stats'],
    queryFn: async () => (await api.get('/hr/assessments/stats')).data,
  });

  const { data: listRes, isLoading: isListLoading } = useQuery({
    queryKey: ['assessment-list'],
    queryFn: async () => (await api.get('/hr/assessments/list')).data,
  });

  const stats = statsRes?.data;
  const rawAssessments = listRes?.data || [];
  
  const filteredAssessments = useMemo(() => {
    return rawAssessments.filter((a: any) => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           a.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || a.status === activeTab;
      const matchesDept = selectedDept === "All Departments" || a.department === selectedDept;
      return matchesSearch && matchesTab && matchesDept;
    });
  }, [rawAssessments, searchQuery, activeTab, selectedDept]);

  const departments = ["All Departments", ...Array.from(new Set(rawAssessments.map((a: any) => a.department))) as string[]];

  const sparkData = [{ v: 30 }, { v: 45 }, { v: 35 }, { v: 55 }, { v: 48 }, { v: 65 }, { v: 60 }];
  
  const performanceData = stats?.performanceData || [
    { name: "Week 1", avgScore: 68, completionRate: 75, candidates: 500 },
    { name: "Week 2", avgScore: 72, completionRate: 80, candidates: 750 },
    { name: "Week 3", avgScore: 70, completionRate: 85, candidates: 650 },
    { name: "Week 4", avgScore: 78, completionRate: 78, candidates: 900 },
  ];

  const distributionData = [
    { name: "Excellent (80-100%)", value: 312, color: "#10b981", percent: "25%" },
    { name: "Good (60-79%)", value: 548, color: "#3b82f6", percent: "43.9%" },
    { name: "Average (40-59%)", value: 264, color: "#f59e0b", percent: "21.2%" },
    { name: "Poor (0-39%)", value: 124, color: "#ef4444", percent: "9.9%" },
  ];

  const topAssessments = stats?.topAssessments?.map((ta: any) => ({
    ...ta,
    trend: "+10%",
    color: "text-blue-500", 
    bg: "bg-blue-500/10"
  })) || [];

  const recentActivity = stats?.recentActivities || [];

  const exportToCSV = () => {
    if (filteredAssessments.length === 0) return toast.error("No data to export");
    
    const headers = ["Assessment Name", "Role", "Type", "Questions", "Duration", "Status", "Completed", "Avg Score"];
    const rows = filteredAssessments.map((a: any) => [
      `"${a.name}"`, `"${a.role}"`, a.type, a.questions, a.duration, a.status, `"${a.completed}"`, a.score
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `assessments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Assessment records exported successfully");
  };

  return (
    <PanelLayout title="Assessments" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">Assessments</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Create, manage and analyze assessments across your organization</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                    className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" 
                    placeholder="Search candidates, assessments..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
           <AssessmentKPICard title="Total Assessments" value={stats?.kpis?.total || "0"} trend="up" trendValue="16%" icon={ClipboardList} color="text-primary" stroke="#3b82f6" sparkData={sparkData} />
           <AssessmentKPICard title="Completed" value={stats?.kpis?.completed || "0"} trend="up" trendValue="18.6%" icon={CheckCircle2} color="text-emerald-500" stroke="#10b981" sparkData={sparkData} />
           <AssessmentKPICard title="In Progress" value={stats?.kpis?.inProgress || "0"} trend="up" trendValue="9.8%" icon={Clock} color="text-purple-500" stroke="#8b5cf6" sparkData={sparkData} />
           <AssessmentKPICard title="Avg Score" value={`${stats?.kpis?.avgScore || 0}%`} trend="up" trendValue="6.3%" icon={Target} color="text-amber-500" stroke="#f59e0b" sparkData={sparkData} />
           <AssessmentKPICard title="Completion Rate" value={`${stats?.kpis?.completionRate || 0}%`} trend="up" trendValue="7.2%" icon={TrendingUp} color="text-cyan-500" stroke="#06b6d4" sparkData={sparkData} />
        </div>

        {/* MIDDLE ROW: PERFORMANCE & DISTRIBUTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Assessment Performance Overview */}
           <Card className="lg:col-span-8 border-border/40 glass-dark shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 px-8 py-5 flex flex-row items-center justify-between">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Assessment Performance Overview</CardTitle>
                 <select className="bg-transparent border border-border/40 rounded-lg text-[10px] font-black uppercase px-2 h-7 focus:ring-0">
                    <option>Last 30 Days</option>
                 </select>
              </CardHeader>
              <CardContent className="p-6 h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={performanceData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <YAxis yAxisId="left" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fontWeight: 'black', fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase' }} />
                       <Bar yAxisId="right" dataKey="avgScore" name="Average Score (%)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={25} />
                       <Line yAxisId="left" type="monotone" dataKey="completionRate" name="Completion Rate (%)" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                       <Line yAxisId="right" type="monotone" dataKey="candidates" name="Candidates" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           {/* Score Distribution */}
           <Card className="lg:col-span-4 border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-8">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">Score Distribution</CardTitle>
              <div className="relative h-48 w-full mb-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={distributionData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {distributionData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-foreground">{stats?.kpis?.total || "0"}</span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest text-center">Total<br/>Candidates</span>
                 </div>
              </div>
              <div className="space-y-3">
                 {distributionData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{d.name}</span>
                       </div>
                       <span className="text-[10px] font-black text-foreground tabular-nums">{d.value} ({d.percent})</span>
                    </div>
                 ))}
              </div>
           </Card>

        </div>

        {/* BOTTOM ROW: ALL ASSESSMENTS & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* All Assessments Table */}
           <div className="lg:col-span-9 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex bg-muted/20 p-1 rounded-xl gap-1 border border-border/40">
                    {["All", "Active", "Draft", "Scheduled", "Completed"].map((t, i) => (
                       <Button 
                          key={i} 
                          variant="ghost" 
                          className={cn(
                             "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                             activeTab === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground opacity-60 hover:opacity-100"
                          )}
                          onClick={() => setActiveTab(t)}
                       >
                          {t}
                       </Button>
                    ))}
                 </div>
                 <div className="flex items-center gap-3">
                    <Popover>
                       <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase gap-2">
                             <Filter className="w-3 h-3" /> Filters
                          </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-56 glass-dark border-border/40 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Filter by Department</p>
                          <div className="space-y-1">
                             {departments.map((dept: string) => (
                                <Button 
                                   key={dept} 
                                   variant="ghost" 
                                   className={cn(
                                      "w-full justify-start text-[10px] font-bold h-8 px-2 rounded-lg",
                                      selectedDept === dept ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                                   )}
                                   onClick={() => setSelectedDept(dept)}
                                >
                                   {dept}
                                </Button>
                             ))}
                          </div>
                       </PopoverContent>
                    </Popover>
                    <Button 
                       variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase gap-2" 
                       onClick={exportToCSV}
                    >
                       <Share2 className="w-3 h-3" /> Export
                    </Button>
                 </div>
              </div>

              <Card className="border-border/40 glass-dark shadow-2xl rounded-3xl overflow-hidden">
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest bg-muted/10">
                             <tr>
                                <th className="px-6 py-4">Assessment Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Questions</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Completed</th>
                                <th className="px-6 py-4">Avg Score</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10">
                             {isListLoading ? (
                                <tr>
                                   <td colSpan={9} className="px-6 py-20 text-center text-xs font-black uppercase text-muted-foreground animate-pulse tracking-widest">
                                      Synchronizing assessment matrix...
                                   </td>
                                </tr>
                             ) : filteredAssessments.length > 0 ? filteredAssessments.map((a: any, i: number) => (
                                <tr key={a.id || i} className="hover:bg-muted/5 transition-colors group">
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                         <div className="p-1.5 rounded-lg bg-muted border border-border/50 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all">
                                            {a.type === 'Technical' ? <Zap className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
                                         </div>
                                         <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{a.name}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase">{a.role}</td>
                                   <td className="px-6 py-4">
                                      <Badge variant="outline" className={cn(
                                         "text-[8px] font-black uppercase border-none",
                                         a.type === "Technical" ? "bg-blue-500/10 text-blue-500" :
                                         a.type === "Practical" ? "bg-purple-500/10 text-purple-500" :
                                         "bg-amber-500/10 text-amber-500"
                                      )}>{a.type}</Badge>
                                   </td>
                                   <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground">{a.questions}</td>
                                   <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground">{a.duration}</td>
                                   <td className="px-6 py-4">
                                      <Badge className={cn(
                                         "text-[8px] font-black uppercase tracking-widest border-none",
                                         a.status === "Active" ? "bg-emerald-500/10 text-emerald-500" :
                                         a.status === "Draft" ? "bg-muted text-muted-foreground" :
                                         a.status === "Completed" ? "bg-blue-500/10 text-blue-500" :
                                         "bg-amber-500/10 text-amber-500"
                                      )}>{a.status}</Badge>
                                   </td>
                                   <td className="px-6 py-4 text-[10px] font-bold text-foreground tabular-nums">{a.completed}</td>
                                   <td className="px-6 py-4 text-[11px] font-black text-foreground tabular-nums">{a.score}</td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                         <Dialog>
                                            <DialogTrigger asChild>
                                               <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg" title="Audit Questions"><Eye className="w-3.5 h-3.5" /></Button>
                                            </DialogTrigger>
                                            <QuestionAuditModal jobId={a.id} jobTitle={a.role} />
                                         </Dialog>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                               <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><MoreVertical className="w-3.5 h-3.5" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-48 glass-dark border-border/40" align="end">
                                               <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground">Actions for {a.role}</DropdownMenuLabel>
                                               <DropdownMenuSeparator className="bg-white/5" />
                                               <DropdownMenuItem className="text-[11px] font-bold gap-2 cursor-pointer" onClick={() => toast.success("Assessment duplicated successfully.")}>
                                                  <Copy className="w-3.5 h-3.5" /> Duplicate
                                               </DropdownMenuItem>
                                               <DropdownMenuItem className="text-[11px] font-bold gap-2 cursor-pointer" onClick={() => toast.info("Preparing performance report...")}>
                                                  <FileDown className="w-3.5 h-3.5" /> Download Report
                                               </DropdownMenuItem>
                                               <DropdownMenuItem className="text-[11px] font-bold gap-2 cursor-pointer text-amber-500" onClick={() => toast.warning("Assessment archived.")}>
                                                  <Archive className="w-3.5 h-3.5" /> Archive
                                               </DropdownMenuItem>
                                               <DropdownMenuSeparator className="bg-white/5" />
                                               <DropdownMenuItem className="text-[11px] font-bold gap-2 cursor-pointer text-rose-500" onClick={() => toast.error("Admin privileges required.")}>
                                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                               </DropdownMenuItem>
                                            </DropdownMenuContent>
                                         </DropdownMenu>
                                      </div>
                                   </td>
                                </tr>
                             )) : (
                                <tr>
                                   <td colSpan={9} className="px-6 py-20 text-center text-xs font-black uppercase text-muted-foreground tracking-widest">
                                      No assessments found matching your criteria.
                                   </td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Sidebar: Top Assessments & Recent Activity */}
           <div className="lg:col-span-3 space-y-6 pb-12">
              
              {/* Top Assessments */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Top Assessments</CardTitle>
                    <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit" onClick={() => toast.info("Syncing full leaderboard...")}>View All</Button>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-border/10">
                       {topAssessments.length > 0 ? topAssessments.map((ta: any, i: number) => (
                          <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/5 transition-colors cursor-pointer group">
                             <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", ta.bg)}>
                                   <Star className={cn("w-4 h-4", ta.color)} />
                                </div>
                                <div>
                                   <h4 className="text-[10px] font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">{ta.name}</h4>
                                   <p className="text-[9px] font-bold text-muted-foreground tabular-nums">{ta.count} Attempts</p>
                                </div>
                             </div>
                             <div className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> {ta.trend}
                             </div>
                          </div>
                       )) : (
                         <p className="text-[10px] text-muted-foreground italic text-center py-4">No top assessments found</p>
                       )}
                    </div>
                 </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Activity</CardTitle>
                    <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit" onClick={() => toast.info("Loading activity history...")}>View All</Button>
                 </CardHeader>
                 <CardContent className="p-4 space-y-5">
                    {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((act: any, i: number) => (
                       <div key={i} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted border border-border/50 overflow-hidden shrink-0">
                             <img 
                                src={act.img || "/images/default-avatar.png"} 
                                alt={act.name} 
                                className="w-full h-full object-cover" 
                                onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }}
                             />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-[10px] font-black text-foreground tracking-tight leading-tight">
                                {act.name} <span className="text-muted-foreground font-bold lowercase">{act.action}</span>
                             </p>
                             <p className="text-[9px] font-bold text-muted-foreground truncate">{act.task}</p>
                             <p className="text-[8px] font-bold text-muted-foreground/50 uppercase mt-1 tracking-widest">{new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {act.score && (
                             <div className="shrink-0 text-right">
                                <p className="text-[11px] font-black text-emerald-500 tabular-nums">{act.score}</p>
                             </div>
                          )}
                       </div>
                    )) : (
                      <p className="text-[10px] text-muted-foreground italic text-center py-4">No recent activity</p>
                    )}
                 </CardContent>
              </Card>

           </div>

        </div>
      </div>
    </PanelLayout>
  );
}
