"use client";
import React, { useState, useMemo } from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Search, Filter, Plus, ChevronRight, 
  Download, Share2, MoreVertical, Calendar, 
  ArrowUpRight, ArrowDownRight, Users, CheckCircle2, 
  History, Sparkles, PieChart as PieIcon, BarChart3, 
  ShieldCheck, FileVideo, FileBarChart2, Mail, ExternalLink, Brain, Clock, Globe, Target,
  Eye, Settings, LayoutGrid, Database, HardDrive, FileSpreadsheet, FileBox, Trash2,
  AlertCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function HighFidelityReportsV2() {
  const [activeTab, setActiveTab] = useState("All Reports");
  const [searchQuery, setSearchQuery] = useState("");

  // FETCH STATS
  const { data: statsData } = useQuery({
    queryKey: ['report-stats'],
    queryFn: async () => {
      const res = await api.get('/hr/reports/stats');
      return res.data.data;
    }
  });

  // FETCH LIST
  const { data: rawReports = [], isLoading } = useQuery({
    queryKey: ['reports-list'],
    queryFn: async () => {
      const res = await api.get('/hr/reports/list');
      return res.data.data;
    }
  });

  // FETCH RECENT
  const { data: recentDownloads = [] } = useQuery({
    queryKey: ['reports-recent'],
    queryFn: async () => {
      const res = await api.get('/hr/reports/recent');
      return res.data.data;
    }
  });

  // Memoized filtered reports
  const filteredReports = useMemo(() => {
    return rawReports.filter((r: any) => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.candidate.toLowerCase().includes(searchQuery.toLowerCase());
      
      const tabMap: any = {
        "Candidate Reports": "CANDIDATE_REPORT",
        "Assessment Reports": "ASSESSMENT_REPORT",
        "Interview Reports": "INTERVIEW_TRANSCRIPT",
        "Aggregated Reports": "AGGREGATED_REPORT"
      };
      
      const matchesTab = activeTab === "All Reports" || r.type === tabMap[activeTab];
      return matchesSearch && matchesTab;
    });
  }, [rawReports, searchQuery, activeTab]);

  const handleDownload = async (report: any) => {
    try {
      toast.loading("Preparing document for download...");
      
      // Track the download in DB
      await api.post(`/hr/reports/${report.id}/track`);

      // Logic to fetch/download file
      const endpoint = report.type.includes('ASSESSMENT') 
        ? `/hr/report/${report.application_id}`
        : report.type.includes('INTERVIEW')
        ? `/hr/report/interview/${report.application_id}`
        : `/hr/reports/executive/${report.application_id}`;

      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', report.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success("Report downloaded successfully");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download report");
    }
  };

  const handleView = async (report: any) => {
    try {
      // Track the view in DB
      await api.post(`/hr/reports/${report.id}/track`);

      const endpoint = report.type.includes('ASSESSMENT') 
        ? `/hr/report/${report.application_id}`
        : report.type.includes('INTERVIEW')
        ? `/hr/report/interview/${report.application_id}`
        : `/hr/reports/executive/${report.application_id}`;

      // Open in new tab
      window.open(`${api.defaults.baseURL}${endpoint}`, '_blank');
    } catch (error) {
      toast.error("Failed to open report view");
    }
  };

  const kpis = statsData?.kpis || {
    totalGenerated: 0, growth: 0, totalDownloaded: 0, downloadGrowth: 0, scheduledReports: 0, accuracy: 0
  };

  const storage = statsData?.storage || { used: 0, total: 10, percent: 0 };

  const reportTypes = [
    { name: "Candidate Report", desc: "Individual candidate assessment and interview summary", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", type: "CANDIDATE" },
    { name: "Assessment Report", desc: "Detailed assessment performance and analytics report", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10", type: "ASSESSMENT" },
    { name: "Interview Report", desc: "Interview feedback and evaluation summary report", icon: FileVideo, color: "text-orange-500", bg: "bg-orange-500/10", type: "INTERVIEW" },
    { name: "Aggregated Report", desc: "Combined report of assessment and interview insights", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10", type: "AGGREGATED" },
    { name: "Custom Report", desc: "Build a custom report with selected sections", icon: Settings, color: "text-indigo-500", bg: "bg-indigo-500/10", action: "Customize" },
  ];

  return (
    <PanelLayout title="Reports" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">Reports</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Generate, view and download reports with actionable insights</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10 h-10 w-64 bg-muted/30 border-border/50 rounded-xl text-xs font-medium" 
                   placeholder="Search candidates, reports..." 
                 />
              </div>
              <Button variant="outline" className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2">
                 <Filter className="w-4 h-4" /> Filters
              </Button>
           </div>
        </div>

        {/* GENERATE NEW REPORT */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Generate New Report</h2>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Select report type and parameters</span>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {reportTypes.map((rt, i) => (
                 <Card key={i} className="border-border/40 glass shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border-b-4 border-b-primary/50">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", rt.bg)}>
                          <rt.icon className={cn("w-6 h-6", rt.color)} />
                       </div>
                       <div>
                          <h4 className="text-[11px] font-black text-foreground uppercase tracking-tight">{rt.name}</h4>
                          <p className="text-[9px] font-medium text-muted-foreground leading-relaxed mt-2">{rt.desc}</p>
                       </div>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="w-full rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all"
                         onClick={() => toast.info(`Starting ${rt.name} generation...`)}
                       >
                          {rt.action || "Generate"}
                       </Button>
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>

        {/* MAIN SECTION: REPORTS & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* All Reports Table */}
           <div className="lg:col-span-9 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex bg-muted/20 p-1 rounded-xl gap-1 border border-border/40 overflow-x-auto no-scrollbar">
                    {["All Reports", "Candidate Reports", "Assessment Reports", "Interview Reports", "Aggregated Reports", "Shared Reports"].map((t) => (
                       <Button 
                         key={t} 
                         onClick={() => setActiveTab(t)}
                         variant="ghost" 
                         className={cn(
                           "h-8 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg flex-shrink-0 transition-all",
                           activeTab === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground opacity-60 hover:opacity-100"
                         )}
                       >
                         {t}
                       </Button>
                    ))}
                 </div>
                 <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase gap-2"><Download className="w-3 h-3" /> Export List</Button>
                 </div>
              </div>

              <Card className="border-border/40 glass-dark shadow-2xl rounded-3xl overflow-hidden">
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest bg-muted/10">
                             <tr>
                                <th className="px-6 py-4">Report Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Generated By</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4 text-center">Format</th>
                                <th className="px-6 py-4 text-center">Size</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10">
                             {isLoading ? (
                               <tr>
                                 <td colSpan={7} className="px-6 py-12 text-center">
                                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                 </td>
                               </tr>
                             ) : filteredReports.length > 0 ? filteredReports.map((r: any) => (
                                <tr key={r.id} className="hover:bg-muted/5 transition-colors group">
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                         <div className={cn("p-1.5 rounded-lg bg-muted border border-border/50 transition-all group-hover:border-primary/30", 
                                           r.type.includes('ASSESSMENT') ? "text-emerald-500" : r.type.includes('INTERVIEW') ? "text-orange-500" : "text-purple-500"
                                         )}>
                                            <FileText className="w-3.5 h-3.5" />
                                         </div>
                                         <div>
                                            <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{r.name}</p>
                                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{r.candidate}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase">{r.type.replace('_', ' ')}</td>
                                   <td className="px-6 py-4 text-[10px] font-black text-foreground uppercase tracking-tight">{r.generatedBy}</td>
                                   <td className="px-6 py-4 text-[9px] font-bold text-muted-foreground uppercase">{new Date(r.dateTime).toLocaleString()}</td>
                                   <td className="px-6 py-4 text-center">
                                      <Badge variant="outline" className={cn(
                                         "text-[8px] font-black uppercase border-none gap-1",
                                         r.format === "PDF" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                                      )}>
                                         {r.format === "PDF" ? <FileText className="w-2.5 h-2.5" /> : <FileSpreadsheet className="w-2.5 h-2.5" />} {r.format}
                                      </Badge>
                                   </td>
                                   <td className="px-6 py-4 text-center text-[10px] font-bold text-muted-foreground tabular-nums">{r.size}</td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                         <Button onClick={() => handleView(r)} variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-primary/10 text-primary"><Eye className="w-3.5 h-3.5" /></Button>
                                         <Button onClick={() => handleDownload(r)} variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-emerald-500/10 text-emerald-500"><Download className="w-3.5 h-3.5" /></Button>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                               <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"><MoreVertical className="w-3.5 h-3.5" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="glass-dark border-border/40">
                                               <DropdownMenuItem className="text-[10px] font-black uppercase gap-2 cursor-pointer">
                                                  <Share2 className="w-3 h-3" /> Share with Team
                                               </DropdownMenuItem>
                                               <DropdownMenuItem className="text-[10px] font-black uppercase gap-2 cursor-pointer text-rose-500 focus:text-rose-500">
                                                  <Trash2 className="w-3 h-3" /> Archive Report
                                               </DropdownMenuItem>
                                            </DropdownMenuContent>
                                         </DropdownMenu>
                                      </div>
                                   </td>
                                </tr>
                             )) : (
                               <tr>
                                 <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground uppercase text-[10px] font-black">
                                   No generated reports found.
                                 </td>
                               </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Sidebar: Popular, Storage, Recent */}
           <div className="lg:col-span-3 space-y-6 pb-12">
              
              {/* Popular Reports */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Activity</CardTitle>
                    <Button variant="link" className="text-[9px] font-black uppercase p-0 h-fit">View All</Button>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-border/10">
                       {recentDownloads.slice(0, 5).map((p: any, i: number) => (
                          <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/5 transition-colors cursor-pointer group">
                             <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                                   <History className="w-3.5 h-3.5" />
                                </div>
                                <h4 className="text-[10px] font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">{p.reportName}</h4>
                             </div>
                             <span className="text-[8px] font-bold text-muted-foreground uppercase">{new Date(p.timeAgo).toLocaleTimeString()}</span>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>

              {/* Report Storage */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden p-6">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Report Storage</CardTitle>
                 <div className="relative h-32 w-32 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/10" />
                       <circle 
                         cx="64" cy="64" r="58" 
                         stroke="currentColor" strokeWidth="8" 
                         fill="transparent" 
                         strokeDasharray={364.4} 
                         strokeDashoffset={364.4 * (1 - storage.percent / 100)} 
                         className="text-primary transition-all duration-1000" 
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-xl font-black text-foreground">{storage.percent}%</span>
                       <span className="text-[7px] font-black text-muted-foreground uppercase">Storage Used</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                       <span className="text-muted-foreground">Used</span>
                       <span className="text-foreground">{storage.used} MB</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                       <span className="text-muted-foreground">Total</span>
                       <span className="text-foreground">{storage.total} GB</span>
                    </div>
                    <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest text-center pt-2">
                       {Math.max(0, (storage.total * 1024) - storage.used).toFixed(0)} MB available
                    </p>
                 </div>
              </Card>

              {/* Recent Downloads (Real Data) */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Downloads</CardTitle>
                 </CardHeader>
                 <CardContent className="p-4 space-y-5">
                    {recentDownloads.length > 0 ? recentDownloads.slice(0, 3).map((dl: any, i: number) => (
                       <div key={i} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted border border-border/50 overflow-hidden shrink-0">
                             <img 
                                 src={dl.img || "/images/default-avatar.png"} 
                                 alt="" 
                                 className="w-full h-full object-cover" 
                                 onError={(e: any) => { e.target.src = "/images/default-avatar.png"; }}
                              />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-[10px] font-black text-foreground tracking-tight leading-tight uppercase">{dl.candidate}</p>
                             <p className="text-[8px] font-bold text-muted-foreground truncate leading-tight mt-0.5">{dl.reportName}</p>
                             <p className="text-[7px] font-bold text-muted-foreground/50 uppercase mt-1 tracking-widest">{new Date(dl.timeAgo).toLocaleTimeString()}</p>
                          </div>
                       </div>
                    )) : (
                      <p className="text-[9px] font-black text-muted-foreground uppercase text-center py-4">No recent downloads</p>
                    )}
                 </CardContent>
              </Card>

           </div>

        </div>

        {/* BOTTOM SECTION: INSIGHTS */}
        <div className="space-y-4 pb-12">
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Report Insights</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                 { title: "Reports Generated", value: kpis.totalGenerated, trend: "up", trendVal: `${kpis.growth}%`, icon: FileText, color: "text-primary" },
                 { title: "Reports Downloaded", value: kpis.totalDownloaded, trend: "up", trendVal: `${kpis.downloadGrowth}%`, icon: Download, color: "text-emerald-500" },
                 { title: "Scheduled Reports", value: kpis.scheduledReports, trend: "up", trendVal: "0%", icon: Clock, color: "text-purple-500" },
                 { title: "Report Accuracy", value: `${kpis.accuracy}%`, trend: "up", trendVal: "3%", icon: Target, color: "text-amber-500" },
              ].map((ins, i) => (
                 <Card key={i} className="border-border/40 glass shadow-xl overflow-hidden p-6 relative group hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <div className={cn("p-1.5 rounded-lg bg-muted border border-border/50 group-hover:text-primary transition-colors", ins.color)}>
                          <ins.icon className="w-4 h-4" />
                       </div>
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{ins.title}</span>
                    </div>
                    <p className="text-2xl font-black text-foreground tabular-nums">{ins.value}</p>
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                       <ArrowUpRight className="w-3 h-3" /> {ins.trendVal} vs last 30 days
                    </div>
                 </Card>
              ))}
           </div>
        </div>

      </div>
    </PanelLayout>
  );
}
