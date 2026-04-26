"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, User } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { NotificationsDropdown } from "./NotificationsDropdown";

export default function CandidateTopbar({ title }: { title?: string }) {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <header className="h-20 bg-white border-b" />;

  return (
    <header className="h-24 px-8 flex items-center justify-between bg-white border-b border-slate-100">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-slate-900">{title || "Candidate Panel"}</h1>
        {title === "My Profile" && <p className="text-[10px] text-slate-400 font-medium">Manage your personal, academic and professional details.</p>}
      </div>

      <div className="flex-1 max-w-md mx-12">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationsDropdown />

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900">{user?.name}</span>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Candidate</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-100">
            {getInitials(user?.name || "C")}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
