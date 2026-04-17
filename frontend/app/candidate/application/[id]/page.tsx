"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, Calendar, FileText, CheckCircle, 
  ChevronRight, ArrowLeft, Download, Info, Clock, AlertCircle, Video
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();

  const { data: details, isLoading } = useQuery({
    queryKey: ["app-details", id],
    queryFn: () => candidateApi.getApplicationDetails(id).then(r => r.data),
  });

  const app = details?.application;
  const job = details?.job || app?.job;
  const timeline = details?.timeline || [];

  if (isLoading) return <PanelLayout title="Loading..." allowedRoles={["CANDIDATE"]}><div className="p-20 text-center animate-pulse text-gray-400 font-medium">Loading Application Details...</div></PanelLayout>;
  if (!app) return <PanelLayout title="Error" allowedRoles={["CANDIDATE"]}><div className="p-20 text-center text-red-500 font-medium">Application not found</div></PanelLayout>;

  const canViewOffer = app.status === "OFFERED" || app.status === "HIRED";

  return (
    <PanelLayout title="Application Details" allowedRoles={["CANDIDATE"]}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Action */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/candidate")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <div className="flex gap-2">
            {canViewOffer && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => router.push(`/candidate/offer/${id}`)}>
                <CheckCircle className="w-4 h-4" /> View Offer Letter
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content: Info & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Job Summary */}
            <Card className="shadow-sm overflow-hidden border-blue-100 italic">
              <div className="h-1 bg-blue-600" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{job?.title}</h1>
                    <p className="text-sm text-gray-500 flex items-center gap-1 font-medium">
                      <Briefcase className="w-4 h-4" /> {job?.department} • {job?.company_name || "Mask Polymers"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={cn(
                      "text-sm px-4 py-1 border-0 shadow-sm",
                      app.status === "REJECTED" || app.status === "AUTO_REJECTED" ? "bg-red-50 text-red-600" :
                      app.status === "HIRED" ? "bg-emerald-50 text-emerald-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {app.status.replace(/_/g, " ")}
                    </Badge>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Timeline */}
            <Card className="shadow-sm">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" /> Progress Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8 relative">
                  {/* Vertical line connector */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100" />
                  
                  {timeline.length > 0 ? timeline.map((event: any, idx: number) => (
                    <div key={idx} className="relative pl-10 group">
                      <div className={cn(
                        "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-all",
                        idx === timeline.length - 1 ? "border-blue-600 scale-125 shadow-md shadow-blue-100" : "border-gray-200"
                      )}>
                        {idx === timeline.length - 1 ? (
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                          {new Date(event.changed_at || event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">{event.label || event.new_status?.replace(/_/g, " ")}</h4>
                        {event.metadata?.reason && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2 italic shadow-inner">
                            {event.metadata.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-blue-600 bg-white z-10">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                        <h4 className="text-sm font-bold text-gray-900">Application Submitted</h4>
                        <p className="text-xs text-gray-500">Your application is currently being reviewed by our team.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area: Docs & Actions */}
          <div className="space-y-6">
            
            {/* Status Card (Action Oriented) */}
            <Card className="shadow-sm border-blue-50 bg-blue-50/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Current Status</h3>
                </div>
                
                {app.status === "REJECTED" || app.status === "AUTO_REJECTED" ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-red-900">Application Closed</p>
                    <p className="text-[11px] text-red-700 mt-1">Thank you for your interest. We wish you success in your search.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-tighter mb-1">Next Step</p>
                      <p className="text-sm text-gray-700">
                        {app.status === "TECHNICAL_ROUND_PENDING" ? "Complete Technical Assessment" :
                         app.status === "INTERVIEW_SCHEDULED" ? "Join AI Interview" :
                         app.status === "OFFERED" ? "Review and Accept Offer" : "Await further updates"}
                      </p>
                    </div>

                    {app.status === "TECHNICAL_ROUND_PENDING" && (
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 group" onClick={() => router.push(`/candidate/assessment/${id}`)}>
                        Start Assessment <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                    {app.status === "INTERVIEW_SCHEDULED" && (
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 group" onClick={() => router.push(`/candidate/interview/${id}`)}>
                        Join Interview <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Management */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">My Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => app.resume_url && window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${app.resume_url}`, "_blank")}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">My Resume</span>
                  </div>
                  <Download className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                </div>
                
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50",
                  details.assessment ? "hover:bg-white hover:border-blue-300 transition-all cursor-pointer" : "opacity-50 grayscale"
                )}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Assessment Report</span>
                  </div>
                  <Info className="w-3 h-3 text-gray-400" />
                </div>

                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50",
                  details.interview ? "hover:bg-white hover:border-blue-300 transition-all cursor-pointer" : "opacity-50 grayscale"
                )}>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">Interview Transcript</span>
                  </div>
                  <Info className="w-3 h-3 text-gray-400" />
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
