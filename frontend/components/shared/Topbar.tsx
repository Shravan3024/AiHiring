"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Bell, Search, Settings, LogOut, User, ChevronDown, X,
  LayoutDashboard, Briefcase, Clock, TrendingUp, Info,
  Moon, Sun, ShieldCheck, CheckCircle2, AlertCircle, 
  Settings2, Activity
} from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi, hrApi, candidateApi, mdApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cbRef.current();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref]);
}

export default function Topbar({ title }: { title?: string }) {
  const { user, clearAuth } = useAuthStore();
  const { toggleSidebar, theme, toggleTheme } = useUIStore();
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useOutsideClick(notifRef, () => setNotifOpen(false));
  useOutsideClick(userRef, () => setUserOpen(false));

  const { data: notifications = [], refetch: refetchNotif } = useQuery({
    queryKey: ["app-notifications", user?.role],
    enabled: !!user,
    refetchInterval: 30_000, // Real-time feel via polling
    queryFn: async () => {
       try {
          let res;
          if (user?.role === "CANDIDATE") res = await candidateApi.getNotifications();
          else if (user?.role === "HR") res = await hrApi.getNotifications();
          else if (user?.role === "ADMIN") res = await adminApi.getNotifications();
          else if (user?.role === "MD") res = await mdApi.getNotifications();
          
          return res?.data?.notifications || [
             { id: "mock-1", title: "System Operational", message: "Alpha Protocol v4.0 Active", timestamp: new Date(), unread: false, type: "SYSTEM" }
          ];
       } catch (err) {
          return [{ id: "err", title: "Sync Pending", message: "Awaiting local subnet handshake", timestamp: new Date(), unread: true, type: "WARNING" }];
       }
    }
  });

  const unreadCount = notifications.filter((n: any) => n.unread).length;

  return (
    <header className={cn(
       "h-20 px-8 flex items-center justify-between sticky top-0 z-40 border-b transition-colors duration-500",
       theme === "dark" ? "bg-black border-slate-900 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" : "bg-white border-slate-100"
    )}>
      {/* Left: Section Title */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 lg:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex flex-col">
          <h1 className={cn(
             "text-sm font-black uppercase tracking-[0.2em]",
             theme === "dark" ? "text-white" : "text-[#0f172a]"
          )}>{title || "Command Center"}</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Subnet Active</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden xl:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className={cn(
               "pl-11 pr-4 py-2.5 text-xs font-bold border rounded-xl focus:outline-none transition-all w-64 uppercase tracking-wider",
               theme === "dark" 
                  ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus:bg-black focus:border-blue-500/50" 
                  : "bg-slate-50/50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            )}
            placeholder="Search Entities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Global Toggles */}
        <div className="flex items-center gap-2 pr-6 border-r border-slate-100 dark:border-slate-800">
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className={cn(
                "p-2.5 rounded-xl transition-all group relative",
                theme === "dark" ? "text-amber-400 hover:bg-amber-400/10" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
             )}
           >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
           </button>

           {/* Notifications */}
           <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className={cn(
                  "p-2.5 rounded-xl transition-all group relative",
                  theme === "dark" ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                )}
              >
                 <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-black" />
                 )}
              </button>

              {notifOpen && (
                 <div className={cn(
                    "absolute right-0 mt-4 w-96 rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden",
                    theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-100"
                 )}>
                    <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-100 dark:border-slate-900">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Secure Notifications</h3>
                       <Badge className="bg-blue-600/10 text-blue-600 border-none font-black text-[9px]">{unreadCount} NEW</Badge>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                       {notifications.length > 0 ? notifications.map((n: any) => (
                          <div key={n.id} className={cn(
                             "p-4 rounded-xl border transition-all cursor-pointer group",
                             n.unread ? "bg-blue-600/5 border-blue-600/10" : "bg-transparent border-transparent"
                          )}>
                             <div className="flex gap-4">
                                <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                   n.unread ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                )}>
                                   {n.type === "WARNING" ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                   <div className="flex justify-between items-start">
                                      <p className="text-xs font-black uppercase tracking-tight leading-tight">{n.title || n.text}</p>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">{n.time || "Just now"}</span>
                                   </div>
                                   <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{n.message || n.sub}</p>
                                </div>
                             </div>
                          </div>
                       )) : (
                          <div className="py-12 text-center opacity-30">
                             <Activity className="w-12 h-12 mx-auto mb-4" />
                             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Feed Static</p>
                          </div>
                       )}
                    </div>
                    <button className="w-full mt-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">View All Archive</button>
                 </div>
              )}
           </div>
        </div>

        {/* User Badge */}
        <div className="relative" ref={userRef}>
           <button 
             onClick={() => setUserOpen(!userOpen)}
             className="flex items-center gap-4 hover:opacity-80 transition-all"
           >
              <div className="flex flex-col items-end hidden md:flex">
                 <span className={cn(
                    "text-xs font-black uppercase tracking-tighter",
                    theme === "dark" ? "text-white" : "text-[#0f172a]"
                 )}>{user?.name}</span>
                 <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.1em] mt-0.5">{user?.role}</span>
              </div>
              <div className={cn(
                 "w-11 h-11 rounded-2xl border flex items-center justify-center font-black relative overflow-hidden transition-all",
                 theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-100 border-slate-200 text-slate-700"
              )}>
                 {getInitials(user?.name || "U")}
                 <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600" />
              </div>
           </button>

           {userOpen && (
              <div className={cn(
                 "absolute right-0 mt-4 w-64 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-200",
                 theme === "dark" ? "bg-slate-950 border-slate-900 text-white" : "bg-white border-slate-100"
              )}>
                 <div className="px-4 py-4 border-b border-slate-50 dark:border-slate-900 mb-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Matrix Auth</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-gray-300 truncate mt-1">{user?.email}</p>
                 </div>

                 {/* System Toggles for Admin */}
                 {(user?.role === "ADMIN" || user?.role === "HR") && (
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-900 mb-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl m-1">
                       <h4 className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2"><Settings2 className="w-3 h-3" /> System Toggles</h4>
                       <div className="space-y-3">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-gray-500 uppercase">AI Auto-Screen</span>
                             <div className="w-8 h-4 bg-emerald-500 rounded-full relative shadow-inner"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" /></div>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-gray-500 uppercase">Proctor Shield</span>
                             <div className="w-8 h-4 bg-emerald-500 rounded-full relative shadow-inner"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" /></div>
                          </div>
                       </div>
                    </div>
                 )}

                 <button 
                   onClick={() => { clearAuth(); router.push("/login"); }}
                   className="w-full flex items-center gap-3 px-4 py-4 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
                 >
                    <LogOut className="w-4 h-4" /> Terminate Session
                 </button>
              </div>
           )}
        </div>
      </div>
    </header>
  );
}
