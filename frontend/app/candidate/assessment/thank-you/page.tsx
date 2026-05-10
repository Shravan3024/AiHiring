"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   CheckCircle,
   ArrowRight,
   Clock,
   Calendar,
   Users,
   FileText,
   Mail,
   Smartphone,
   Star,
   PartyPopper,
   ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

export default function AssessmentThankYouPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const score = searchParams.get("score");
   const { setPageTitle } = useUIStore();

   useEffect(() => {
      setPageTitle("Assessment Submitted");
   }, []);

   const nextSteps = [
      {
         title: "AI Analysis",
         desc: "Our AI engine is evaluating your responses against the role requirements.",
         icon: PartyPopper,
         status: "current",
         time: "Now"
      },
      {
         title: "Shortlisting",
         desc: "Recruiters will review your profile and AI score for the next round.",
         icon: Users,
         status: "pending",
         time: "2-3 Days"
      },
      {
         title: "Interview",
         desc: "If shortlisted, you'll receive an invitation for a live technical round.",
         icon: Smartphone,
         status: "pending",
         time: "Next Week"
      }
   ];

   return (
      <div className="max-w-5xl mx-auto py-12 space-y-12">
         {/* Success Header */}
         <div className="text-center space-y-6">
            <div className="w-24 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/50 animate-in zoom-in duration-700">
               <CheckCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
               <h1 className="text-lg font-black text-slate-900 tracking-tight">Assessment Submitted!</h1>
               <p className="text-slate-500 font-medium text-lg">Great job! Your responses have been securely recorded.</p>
            </div>
            {score && (
               <Badge className="bg-blue-50 text-blue-600 px-6 py-2 rounded-xl border-none font-bold text-lg">
                  Final Score: {score}%
               </Badge>
            )}
         </div>

         {/* Horizontal Timeline */}
         <Card className="border-none shadow-sm rounded-[40px] bg-white p-12">
            <h3 className="text-xl font-bold text-slate-900 mb-10 flex items-center gap-2">
               <Clock className="w-5 h-5 text-blue-600" /> What happens next?
            </h3>

            <div className="relative">
               {/* Line */}
               <div className="absolute top-6 left-10 right-10 h-1 bg-slate-100 rounded-full" />

               <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                  {nextSteps.map((step, i) => (
                     <div key={i} className="flex flex-col items-center text-center group">
                        <div className={cn(
                           "w-20 h-12 rounded-lg flex items-center justify-center border-8 border-white shadow-sm transition-all duration-500 group-hover:scale-110",
                           step.status === "current" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-300"
                        )}>
                           <step.icon className="w-8 h-8" />
                        </div>
                        <div className="mt-6 space-y-2">
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{step.time}</p>
                           <h4 className="font-bold text-slate-900 text-lg">{step.title}</h4>
                           <p className="text-xs text-slate-400 leading-relaxed font-medium px-4">{step.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </Card>

         {/* Support Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-none shadow-sm rounded-xl bg-white p-6 flex items-start gap-6 group hover:shadow-md transition-all">
               <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-lg font-bold text-slate-900">Email Updates</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">We've sent a confirmation email to your registered address with all the details.</p>
                  <Button variant="link" className="text-purple-600 font-bold p-0 h-auto mt-4">Check Inbox <ChevronRight className="w-4 h-4" /></Button>
               </div>
            </Card>
            <Card className="border-none shadow-sm rounded-xl bg-white p-6 flex items-start gap-6 group hover:shadow-md transition-all">
               <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-lg font-bold text-slate-900">Share Feedback</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">How was your experience today? Help us improve our evaluation process.</p>
                  <Button variant="link" className="text-amber-600 font-bold p-0 h-auto mt-4">Give Feedback <ChevronRight className="w-4 h-4" /></Button>
               </div>
            </Card>
         </div>

         <div className="flex flex-col items-center gap-6 pt-8">
            <Button
               onClick={() => router.push("/candidate")}
               className="bg-slate-900 hover:bg-black text-white px-12 h-16 rounded-[24px] font-black uppercase tracking-widest shadow-sm shadow-slate-200 transition-all"
            >
               Return to Dashboard
            </Button>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Evaluation Securely Recorded by AI Hiring System AI</p>
         </div>
      </div>
   );
}
