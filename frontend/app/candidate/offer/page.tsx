"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, CheckCircle2, XCircle, Clock,
  ChevronRight, Download, Eye, Briefcase,
  TrendingUp, Calendar, MapPin, DollarSign
} from "lucide-react";
import { candidateApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUIStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function JobOffersPage() {
  const { setPageTitle } = useUIStore();
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle("Job Offers");
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await candidateApi.getDashboard();
      // Filter applications that have an offer object
      const appsWithOffers = (res.data.applications || []).filter((app: any) => app.offer !== null);
      setOffers(appsWithOffers);
    } catch (err) {
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACCEPTED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "REJECTED": return "bg-rose-50 text-rose-600 border-rose-100";
      case "PENDING": return "bg-amber-50 text-amber-600 border-amber-100";
      case "EXPIRED": return "bg-slate-50 text-slate-500 border-slate-100";
      default: return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  if (loading) {
    return (
      <div className="p-5 space-y-6">
        <Skeleton className="h-[200px] w-full rounded-[40px]" />
        <Skeleton className="h-[200px] w-full rounded-[40px]" />
      </div>
    );
  }

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Your Career Opportunities</h1>
        <p className="text-slate-500">Review and manage your formal job offers from AI Hiring System.</p>
      </div>

      {offers.length === 0 ? (
        <Card className="rounded-[40px] border-dashed border-2 border-slate-200 bg-slate-50/50 p-12 text-center">
          <div className="w-20 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mx-auto mb-6">
            <FileText className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Offers Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Once you successfully complete the interview process, your official offer letters will appear here.
          </p>
          <Link href="/candidate/application">
            <Button className="rounded-full bg-blue-600 hover:bg-blue-700 px-5">
              Check Application Status
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {offers.map((app) => (
            <Card key={app.id} className="rounded-[40px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Info */}
                  <div className="flex-1 p-5 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          getStatusColor(app.offer.status)
                        )}>
                          {app.offer.status}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 pt-2">{app.job_title}</h2>
                        <p className="text-slate-500 font-medium">{app.jobId?.department || "Operations"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Annual CTC</p>
                        <p className="text-lg font-bold text-blue-600">₹{(app.offer.salary / 100000).toFixed(1)} LPA</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Joining Date</p>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs font-bold">
                            {app.offer.startDate ? new Date(app.offer.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "TBD"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Location</p>
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs font-bold">{app.jobId?.location || "Remote"}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Role Type</p>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs font-bold">{app.jobId?.type || "Full Time"}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bonus</p>
                        <div className="flex items-center gap-2 text-slate-700">
                          <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs font-bold">₹{app.offer.bonus || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="w-full md:w-72 bg-slate-50 p-5 flex flex-col justify-center gap-3 border-l border-slate-100">
                    <Link href={`/candidate/offer/${app.id}`} className="w-full">
                      <Button className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 h-12 shadow-lg shadow-blue-100 font-bold">
                        View & Respond
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/print-offer/${app.id}`)}
                      className="w-full rounded-lg border-slate-200 bg-white h-12 text-slate-600 hover:bg-slate-50 font-bold flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 font-medium px-4 mt-2">
                      Offer expires on {app.offer.expiresAt ? new Date(app.offer.expiresAt).toLocaleDateString() : "30 days"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="rounded-[40px] bg-slate-900 p-5 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Important Information</h3>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            All offer letters generated by AI Hiring System AI are legally binding once accepted.
            Please ensure you review the benefits, joining instructions, and non-disclosure
            agreements carefully before proceeding. If you have questions, use the AI assistant.
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      </Card>
    </div>
  );
}
