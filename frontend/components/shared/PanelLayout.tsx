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
}

export default function PanelLayout({
  children,
  title,
  allowedRoles,
}: PanelLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-200 industrial-grid">
        <Sidebar />
        
        <div className="relative flex flex-col flex-1 overflow-hidden z-10 transition-all duration-300">
          <Topbar title={title} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 custom-scrollbar">
            <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
