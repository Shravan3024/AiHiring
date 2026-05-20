"use client";
import React from "react";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";
import CandidateChatbot from "./_components/CandidateChatbot";
import AuthGuard from "@/components/shared/AuthGuard";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen, pageTitle } = useUIStore();

  return (
    <AuthGuard allowedRoles={["CANDIDATE"]}>
      <div className="flex h-screen dark:bg-[#050816] bg-[#f8fafc] overflow-hidden font-sans transition-colors duration-300">
        <Sidebar />

        <div className="relative flex flex-col flex-1 overflow-hidden z-10 transition-all duration-300">
          <Topbar title={pageTitle} />

          <main className="flex-1 overflow-y-auto custom-scrollbar p-5">
            <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>

          <CandidateChatbot />
        </div>
      </div>
    </AuthGuard>
  );
}
