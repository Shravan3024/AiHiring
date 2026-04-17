"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, Clock, DollarSign, Calendar, Briefcase, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CandidateOffer() {
  const [responded, setResponded] = useState(false);
  const [response, setResponse] = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const [reason, setReason] = useState("");

  const { data: overview } = useQuery({
    queryKey: ["candidate-overview"],
    queryFn: () => candidateApi.getDashboard().then(r => r.data),
  });

  const apps = overview?.applications || overview?.dashboard?.applications || [];
  const offerApp = apps.find((a: any) =>
    ["Offer", "OFFER", "offer", "SELECTED"].includes(a.stage || a.status)
  );
  const offer = offerApp?.offer || offerApp?.offerDetails;

  const respondMutation = useMutation({
    mutationFn: (vars: any) => candidateApi.respondOffer({
      offer_id: vars.offerId,
      decision: vars.response,
      candidate_notes: vars.reason,
    }),
    onSuccess: (_, vars: any) => {
      setResponse(vars.response);
      setResponded(true);
      toast.success(vars.response === "ACCEPTED" ? "Offer accepted! Congratulations!" : "Offer declined.");
    },
    onError: () => toast.error("Failed to respond to offer."),
  });

  const handleRespond = (resp: "ACCEPTED" | "REJECTED") => {
    if (!offerApp?._id && !offer?._id) return;
    respondMutation.mutate({
      applicationId: offerApp?._id,
      offerId: offer?._id,
      response: resp,
      reason: resp === "REJECTED" ? reason : undefined,
    });
  };

  if (responded) {
    return (
      <PanelLayout title="Job Offer" allowedRoles={["CANDIDATE"]}>
        <Card className="max-w-lg mx-auto text-center mt-10">
          <CardContent className="p-8">
            {response === "ACCEPTED" ? (
              <>
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                <p className="text-gray-500">You have accepted the offer. Our HR team will contact you with onboarding details.</p>
              </>
            ) : (
              <>
                <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Offer Declined</h2>
                <p className="text-gray-500">We&apos;ve recorded your response. Thank you for your time.</p>
              </>
            )}
          </CardContent>
        </Card>
      </PanelLayout>
    );
  }

  if (!offerApp && !offer) {
    return (
      <PanelLayout title="Job Offer" allowedRoles={["CANDIDATE"]}>
        <Card className="max-w-lg mx-auto mt-10">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No Offer Available</h2>
            <p className="text-gray-500 text-sm">You don&apos;t have an active job offer at this time. Please continue through the interview process.</p>
          </CardContent>
        </Card>
      </PanelLayout>
    );
  }

  const expiryDate = offer?.expiresAt ? new Date(offer.expiresAt) : null;
  const isExpired = expiryDate && expiryDate < new Date();

  return (
    <PanelLayout title="Job Offer" allowedRoles={["CANDIDATE"]}>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Offer Letter</h2>
                <p className="text-gray-500 text-sm mt-1">Please review and respond to your offer</p>
              </div>
              {isExpired ? (
                <Badge variant="destructive">Expired</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(offerApp?.jobId?.title || offer?.position) && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Position</p>
                    <p className="font-semibold text-sm">{offerApp?.jobId?.title || offer?.position}</p>
                  </div>
                </div>
              )}
              {(offer?.salary || offer?.compensation) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Compensation</p>
                    <p className="font-semibold text-sm">{offer.salary || offer.compensation}</p>
                  </div>
                </div>
              )}
              {offer?.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-semibold text-sm">{new Date(offer.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {expiryDate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Offer Expires</p>
                    <p className={`font-semibold text-sm ${isExpired ? "text-red-600" : ""}`}>
                      {expiryDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offer Details */}
        {offer?.details && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Offer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{offer.details}</p>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        {offer?.benefits && offer.benefits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Benefits Package</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {offer.benefits.map((b: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Decline reason */}
        <Card>
          <CardContent className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for declining (optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="If you plan to decline, briefly explain why..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Warning */}
        {!isExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              This offer is time-sensitive. Please respond before the expiry date.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isExpired && (
          <div className="flex gap-3">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleRespond("REJECTED")}
              disabled={respondMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline Offer
            </Button>
            <Button
              variant="success"
              className="flex-1"
              onClick={() => handleRespond("ACCEPTED")}
              disabled={respondMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Offer
            </Button>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
