"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Shield, CheckCircle, XCircle, ChevronRight, Search, User,
  Briefcase, Calendar, FileText, MessageSquare, ArrowUpRight,
  Filter, RefreshCw, Clock, AlertCircle, Mail, Star
} from "lucide-react";

export default function MDDecisionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterDecision, setFilterDecision] = useState<"ALL" | "RECOMMENDED" | "REJECTED">("ALL");

  const { data: mdDecisionsRaw, isLoading, refetch } = useQuery({
    queryKey: ["hr-md-decisions-full"],
    queryFn: () => hrApi.getMDDecisions().then(r => r.data?.data || []),
    refetchInterval: 30_000,
  });

  const decisions: any[] = Array.isArray(mdDecisionsRaw) ? mdDecisionsRaw : [];

  const filtered = decisions.filter((d: any) => {
    const matchSearch = !search || 
      d.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
      d.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
      d.candidateEmail?.toLowerCase().includes(search.toLowerCase());
    const matchDecision = filterDecision === "ALL" || d.decision === filterDecision;
    return matchSearch && matchDecision;
  });

  const recommendedCount = decisions.filter((d: any) => d.decision === "RECOMMENDED").length;
  const rejectedCount = decisions.filter((d: any) => d.decision === "REJECTED").length;

  return (
    <PanelLayout title="MD Decisions" allowedRoles={["HR", "ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-4 p-3 md:p-5 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-1">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2 uppercase">
              <Shield className="w-4 h-4 text-purple-500" /> MD Decisions
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
              Track all MD recommendations and take final hiring actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} className="h-8 rounded-md border-border/50 text-[10px] font-bold uppercase tracking-wider px-3 gap-1.5 bg-white shadow-sm">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-md bg-purple-500/10"><Shield className="w-4 h-4 text-purple-500" /></div>
              <div>
                <p className="text-xl font-bold text-foreground">{decisions.length}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Decisions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-md bg-emerald-500/10"><CheckCircle className="w-4 h-4 text-emerald-500" /></div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{recommendedCount}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Recommended</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-md bg-rose-500/10"><XCircle className="w-4 h-4 text-rose-500" /></div>
              <div>
                <p className="text-xl font-bold text-rose-600">{rejectedCount}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="border-border/40 bg-white shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border/40 px-4 py-2.5 flex flex-row items-center justify-between bg-muted/20">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-500" /> MD Recommendation Log
              <Badge variant="secondary" className="font-bold text-[8px] px-1 py-0 bg-white border border-border/50">{filtered.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input className="pl-7 h-7 w-48 bg-white border-border/50 rounded-md text-[10px] font-medium" placeholder="Search candidates..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex bg-muted/40 p-0.5 rounded-md gap-0.5">
                {(["ALL", "RECOMMENDED", "REJECTED"] as const).map((f) => (
                  <Button key={f} variant="ghost" onClick={() => setFilterDecision(f)}
                    className={cn("h-6 px-2 text-[9px] font-bold uppercase tracking-wider transition-all",
                      filterDecision === f ? "bg-white shadow-sm text-primary" : "opacity-60")}>
                    {f === "ALL" ? "All" : f === "RECOMMENDED" ? "Recommended" : "Rejected"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-[10px] font-bold text-muted-foreground uppercase">Loading MD decisions...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No MD decisions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Candidate</th>
                      <th className="px-4 py-2.5">Position</th>
                      <th className="px-4 py-2.5">MD Decision</th>
                      <th className="px-4 py-2.5">MD Name</th>
                      <th className="px-4 py-2.5">Date & Time</th>
                      <th className="px-4 py-2.5">AI Score</th>
                      <th className="px-4 py-2.5">HR Status</th>
                      <th className="px-4 py-2.5">Notes</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-[11px]">
                    {filtered.map((d: any, i: number) => (
                      <tr key={d.applicationId || i} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                              <User className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-foreground uppercase tracking-tight leading-none mb-0.5 group-hover:text-primary transition-colors">{d.candidateName}</p>
                              <p className="text-[8px] text-muted-foreground flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{d.candidateEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-[10px] font-bold text-foreground uppercase tracking-tight">{d.jobTitle}</p>
                            <p className="text-[8px] text-muted-foreground">{d.department}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("text-[8px] font-bold border-none px-2 py-0.5",
                            d.decision === 'RECOMMENDED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                          )}>
                            {d.decision === 'RECOMMENDED' ? '✓ RECOMMENDED' : '✗ REJECTED'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-medium text-muted-foreground">{d.mdName || 'MD'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {d.decidedAt ? new Date(d.decidedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {d.decidedAt ? new Date(d.decidedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-foreground tabular-nums">{Math.round(d.aiScore || 0)}%</span>
                            <div className="w-10 h-1 bg-muted/50 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(d.aiScore || 0)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("text-[8px] font-bold uppercase px-1.5 py-0",
                            d.currentStatus === 'SELECTED' || d.currentStatus === 'HIRED' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                            d.currentStatus === 'REJECTED' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                            d.currentStatus === 'OFFER_SENT' ? 'border-blue-200 text-blue-600 bg-blue-50' :
                            'border-amber-200 text-amber-600 bg-amber-50'
                          )}>
                            {(d.currentStatus || 'PENDING').replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {d.mdNotes ? (
                            <div className="max-w-[140px]" title={d.mdNotes}>
                              <p className="text-[9px] text-muted-foreground truncate flex items-center gap-1">
                                <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                                {d.mdNotes}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[9px] text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="icon" variant="ghost" className="w-6 h-6 rounded-md hover:bg-muted/50"
                            onClick={() => router.push(`/hr/applications/${d.applicationId}`)}>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </PanelLayout>
  );
}
