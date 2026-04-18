"use client";
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AuthGuard from "./AuthGuard";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface PanelLayoutProps {
  children: React.ReactNode;
  title: string;
  allowedRoles?: string[];
  fullScreen?: boolean;
}

export default function PanelLayout({
  children,
  title,
  allowedRoles,
  fullScreen = false,
}: PanelLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className={cn(
        "flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-200",
        fullScreen ? "w-screen" : "w-full industrial-grid"
      )}>
        {!fullScreen && <Sidebar />}
        
        <div className={cn(
          "relative flex flex-col flex-1 overflow-hidden z-10 transition-all duration-300",
          fullScreen && "w-full"
        )}>
          {!fullScreen && <Topbar title={title} />}
          
          <main className={cn(
            "flex-1 overflow-y-auto custom-scrollbar",
            !fullScreen ? "p-4 md:p-6 lg:p-10" : "p-0 min-h-screen w-full"
          )}>
            <div className={cn(
              "mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700",
              !fullScreen ? "max-w-[1600px]" : "w-full min-h-screen"
            )}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
