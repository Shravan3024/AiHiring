import React from "react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-5">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
            Loading Module
          </p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  );
}
