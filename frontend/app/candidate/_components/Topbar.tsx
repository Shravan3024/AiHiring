"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, User, LogOut, Settings2, Fingerprint, Mail } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { NotificationsDropdown } from "./NotificationsDropdown";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CandidateTopbar({ title }: { title?: string }) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

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

        <div className="relative" ref={userRef}>
          <button 
            onClick={() => setUserOpen(!userOpen)}
            className={cn(
              "flex items-center gap-3 pl-6 border-l border-slate-100 transition-all py-2 group",
              userOpen ? "opacity-100" : "hover:opacity-80"
            )}
          >
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user?.name}</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Candidate</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
              {getInitials(user?.name || "C")}
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", userOpen && "rotate-180")} />
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-300 origin-top-right">
              {/* User Identity */}
              <div className="px-6 py-5 border-b border-slate-50 mb-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Authenticated Account</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                   </div>
                   <div className="flex flex-col overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Candidate Identity</p>
                   </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="px-2 space-y-1">
                <Link 
                  href="/candidate/profile"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link 
                  href="/candidate/settings"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <Settings2 className="w-4 h-4" /> Account Settings
                </Link>
              </div>

              {/* Logout Action */}
              <div className="mt-3 pt-3 border-t border-slate-50 px-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 rounded-xl transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <LogOut className="w-4 h-4" /> Terminate Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
