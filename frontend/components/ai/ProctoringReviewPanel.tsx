"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, Camera, Monitor, Globe, 
  Clock, AlertTriangle, CheckCircle, Info,
  ChevronLeft, ChevronRight, Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProctoringReviewPanelProps {
  attempts?: any[];
  generalViolations?: any[];
}

export const ProctoringReviewPanel: React.FC<ProctoringReviewPanelProps> = ({ 
  attempts = [], 
  generalViolations = [] 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 1. Get events from attempts (Phase 4/7)
  const attempt = attempts.length > 0 ? attempts[0] : null;
  const attemptData = attempt?.anti_cheating_data || {};
  const attemptEvents = attemptData.events || [];
  const attemptFlags = attemptData.flags || [];
  const attemptAnomalies = attemptData.anomalies || [];

  // 2. Map general violations (Phase 5/Interview) to a consistent format
  const mappedGeneralEvents = generalViolations.map(v => ({
    type: v.type,
    severity: v.severity >= 4 ? "CRITICAL" : v.severity >= 3 ? "HIGH" : "NORMAL",
    timestamp: v.createdAt || v.timestamp,
    message: v.meta?.message || `Violation: ${v.type?.replace(/_/g, " ")}`,
    data: v.meta || {},
    category: "VIOLATION"
  }));

  // 3. Extract webcam images from all sources
  const snapshotsFromAttempts = attemptEvents
    .filter((e: any) => e.type === "WEBCAM_ANOMALY" && e.data?.image)
    .map((e: any) => ({
      image: e.data.image,
      timestamp: e.timestamp,
      id: e.eventId
    }));

  const snapshotsFromGeneral = generalViolations
    .filter((v: any) => v.meta?.image)
    .map((v: any) => ({
      image: v.meta.image,
      timestamp: v.createdAt || v.timestamp,
      id: v.id
    }));

  const snapshots = [...snapshotsFromAttempts, ...snapshotsFromGeneral];

  // 4. Combine all violations for the timeline
  const allCriticalEvents = [
    ...attemptFlags.map((f: any) => ({ ...f, category: "FLAG" })),
    ...attemptAnomalies.map((a: any) => ({ ...a, category: "ANOMALY" })),
    ...mappedGeneralEvents
  ].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (allCriticalEvents.length === 0 && snapshots.length === 0 && attempts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-10 text-center text-gray-400">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No proctoring logs found</p>
        </CardContent>
      </Card>
    );
  }

  const integrityScore = attemptData.integrityScore || Math.max(0, 100 - (generalViolations.length * 10));

  return (
    <div className="space-y-6">
      
      {/* Integrity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cn(
          "border-l-4 shadow-sm",
          integrityScore < 60 ? "border-l-red-500" : "border-l-emerald-500"
        )}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Integrity Score</p>
              <h3 className="text-2xl font-black">{integrityScore}%</h3>
            </div>
            <div className={cn(
              "p-2 rounded-full",
              integrityScore < 60 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
            )}>
              {integrityScore < 60 ? <AlertTriangle /> : <CheckCircle />}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Flags Detected</p>
              <h3 className="text-2xl font-black">{allCriticalEvents.length}</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-full">
              <ShieldAlert />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Device Fingerprint</p>
              <h3 className="text-sm font-bold truncate max-w-[150px]">{attemptData.deviceInfo?.browser || "SYSTEM V1"}</h3>
              <p className="text-[10px] text-gray-400">{attemptData.deviceInfo?.os || "Candidate OS"}</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <Monitor />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SNAPSHOT VIEW-REEL */}
        <Card className="shadow-md">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Camera className="w-4 h-4 text-gray-400" /> Proctoring Snapshots
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {snapshots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {snapshots.map((snap: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in"
                    onClick={() => setSelectedImage(snap.image)}
                  >
                    <img src={snap.image} alt="Proctoring" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="text-white w-5 h-5" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-white">
                      {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                <Camera className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-xs italic">No snapshots recorded for this session.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MALPRACTICE TIMELINE */}
        <Card className="shadow-md">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Violation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            {allCriticalEvents.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {allCriticalEvents.map((event, idx) => (
                  <div key={idx} className="p-4 flex gap-3 hover:bg-gray-50">
                    <div className={cn(
                      "flex-shrink-0 w-2 h-2 mt-1.5 rounded-full",
                      event.severity === "CRITICAL" ? "bg-red-500 animate-pulse" : 
                      event.severity === "HIGH" ? "bg-orange-500" : "bg-yellow-500"
                    )} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-bold text-gray-900 leading-none">
                          {event.type?.replace(/_/g, " ")}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-tight">{event.message}</p>
                      {event.data?.tabTitle && (
                        <p className="text-[10px] mt-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block font-medium">
                          Tab: {event.data.tabTitle}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="h-5 text-[9px] uppercase font-bold">
                      {event.category}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-100 mx-auto mb-2" />
                <p className="text-xs text-gray-400 italic">No critical violations detected.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full">
            <img src={selectedImage} alt="Full Snapshot" className="w-full h-auto rounded-xl shadow-2xl border-4 border-white/10" />
            <Button 
              className="absolute -top-12 right-0 text-white bg-white/20 hover:bg-white/40 border-0"
              onClick={() => setSelectedImage(null)}
            >
              Close Viewer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
