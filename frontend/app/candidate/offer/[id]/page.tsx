"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileCheck, Download, CheckCircle, XCircle, 
  Calendar, CreditCard, User, Building, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OfferLetterPage() {
  const params = useParams();
  const applicationId = String(params.id);
  const router = useRouter();
  const [notes, setNotes] = useState("");

  const { data: offerData, isLoading, error } = useQuery({
    queryKey: ["offer-details", applicationId],
    queryFn: () => candidateApi.getOfferDetails(applicationId).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (decision: string) => 
      candidateApi.respondOffer(applicationId, { decision, candidate_notes: notes }),
    onSuccess: () => {
      alert("Response recorded successfully!");
      router.push("/candidate");
    },
    onError: (err: any) => {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  });

  if (isLoading) return <PanelLayout title="Job Offer"><div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-600" /></div></PanelLayout>;
  
  const offer = offerData?.offer;

  if (!offer) {
    return (
      <PanelLayout title="Job Offer">
        <Card className="max-w-2xl mx-auto mt-10">
          <CardContent className="p-10 text-center">
            <Badge variant="outline" className="mb-4">No offer found</Badge>
            <p className="text-gray-500">Your application status has not reached the offer stage yet.</p>
          </CardContent>
        </Card>
      </PanelLayout>
    );
  }

  const isResponded = offer.status !== "PENDING";

  return (
    <PanelLayout title="Review Job Offer" allowedRoles={["CANDIDATE"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className={cn(
          "rounded-xl p-6 text-white shadow-lg overflow-hidden relative",
          offer.status === "ACCEPTED" ? "bg-gradient-to-r from-emerald-500 to-green-600" :
          offer.status === "REJECTED" ? "bg-gradient-to-r from-red-500 to-rose-600" :
          "bg-gradient-to-r from-blue-600 to-indigo-700"
        )}>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Congratulations!</h1>
              <p className="text-sm text-white/80 mt-1 font-medium">You have been selected for the position at Mask Polymers.</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs uppercase font-bold tracking-widest text-white/60 mb-1">Status</p>
              <Badge className="bg-white/20 text-white border-0 text-sm px-4 py-1">{offer.status}</Badge>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Letter Content */}
          <Card className="lg:col-span-2 shadow-sm border-gray-100">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Employment Offer Letter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 prose prose-sm max-w-none">
              {/* Render HTML content safely */}
              <div 
                className="offer-content space-y-4 text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: offer.offer_letter_content }} 
              />
            </CardContent>
          </Card>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Position</p>
                    <p className="text-sm font-semibold text-gray-900">{offer.position_title}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Annual Salary (CTC)</p>
                    <p className="text-sm font-semibold text-gray-900">₹{offer.salary?.toLocaleString()}</p>
                    {offer.bonus > 0 && <p className="text-xs text-green-600 font-medium">+ ₹{offer.bonus?.toLocaleString()} Bonus</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Joining Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(offer.joining_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isResponded ? (
              <Card className="shadow-md border-indigo-100 bg-indigo-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-indigo-900">Your Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Notes/Comments (Optional)</label>
                    <Textarea 
                      placeholder="Add any message for the hiring team..."
                      className="text-xs h-20 bg-white"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => mutation.mutate("ACCEPTED")}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Accept Offer
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => mutation.mutate("REJECTED")}
                      disabled={mutation.isPending}
                    >
                      Reject Offer
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center italic">
                    By accepting, you confirm your availability to join on the mentioned date.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm border-gray-100 bg-gray-50">
                <CardContent className="p-6 text-center">
                  {offer.status === "ACCEPTED" ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-green-800">Offer Accepted</h3>
                      <p className="text-xs text-green-700">Congratulations on joining the team! Our onboarding team will contact you soon.</p>
                      <Button variant="outline" className="w-full mt-2" onClick={() => window.print()}>
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
                        <XCircle className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-red-800">Offer Rejected</h3>
                      <p className="text-xs text-red-700">You have declined this offer. We wish you the best in your future endeavors.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
