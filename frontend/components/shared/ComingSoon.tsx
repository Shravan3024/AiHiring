"use client";
import React from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Brain, Cpu, Zap, Timer } from "lucide-react";

export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <PanelLayout title={title} allowedRoles={["HR", "ADMIN"]}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="relative">
           <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
           <Brain className="w-20 h-20 text-primary relative z-10" />
        </div>
        <div className="text-center space-y-2">
           <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">{title}</h1>
           <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">Module under AI synchronization</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 rounded-full bg-muted/50 border border-border/50 flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ETA: 48H</span>
           </div>
           <div className="px-4 py-2 rounded-full bg-muted/50 border border-border/50 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neural Linked</span>
           </div>
        </div>
      </div>
    </PanelLayout>
  );
}
