"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Bell, Search, Settings, LogOut, User, ChevronDown, X,
  LayoutDashboard, Briefcase, Clock, TrendingUp, Info,
  Moon, Sun, ShieldCheck, CheckCircle2, AlertCircle, 
  Settings2, Activity, Zap, Cpu, Fingerprint
} from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { adminApi, hrApi, candidateApi, mdApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

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
  const { toggleSidebar, features, toggleFeature } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useOutsideClick(notifRef, () => setNotifOpen(false));
  useOutsideClick(userRef, () => setUserOpen(false));

  useEffect(() => setMounted(true), []);

  const { data: notifications = [] } = useQuery({
    queryKey: ["app-notifications", user?.role],
    enabled: !!user,
    refetchInterval: 30_000,
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

  if (!mounted) return <header className="h-20 bg-background border-b" />;

  const unreadCount = notifications.filter((n: any) => n.unread).length;

  return (
    <header className={cn(
       "h-20 px-8 flex items-center justify-between sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300",
       "bg-background/80 border-border/40 shadow-sm"
    )}>
      {/* Left: Section Title */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground lg:hidden transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary animate-pulse" />
            <h1 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/80">{title || "Command Center"}</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Neural Link Synchronized</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden xl:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            className={cn(
               "pl-11 pr-4 py-2.5 text-[11px] font-bold border rounded-xl focus:outline-none transition-all w-64 uppercase tracking-wider",
               "bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            )}
            placeholder="Search Entities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Global Toggles */}
        <div className="flex items-center gap-2 pr-4 border-r border-border">
           {/* Theme Toggle */}
           <button 
             onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
             className={cn(
                "p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95",
                theme === "dark" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
             )}
           >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
           </button>

           {/* Notifications */}
           <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className={cn(
                  "p-2.5 rounded-xl transition-all hover:bg-muted group",
                  unreadCount > 0 ? "text-primary" : "text-muted-foreground"
                )}
              >
                 <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                 {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
                 )}
              </button>

              {notifOpen && (
                 <div className="absolute right-0 mt-4 w-96 rounded-2xl shadow-2xl border bg-card/95 backdrop-blur-xl border-border p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Feed</h3>
                       <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-2 py-0.5">{unreadCount} NEW EVENTS</Badge>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                       {notifications.length > 0 ? notifications.map((n: any) => (
                          <div key={n.id} className={cn(
                             "p-3 rounded-xl border transition-all cursor-pointer group hover:bg-muted/50",
                             n.unread ? "bg-primary/5 border-primary/20" : "bg-transparent border-transparent"
                          )}>
                             <div className="flex gap-4">
                                <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                   n.unread ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                                )}>
                                   {n.type === "WARNING" ? <AlertCircle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-start">
                                      <p className="text-[11px] font-black uppercase tracking-tight truncate">{n.title || n.text}</p>
                                      <span className="text-[9px] font-bold text-muted-foreground uppercase ml-2 flex-shrink-0">{n.time || "Now"}</span>
                                   </div>
                                   <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed line-clamp-2">{n.message || n.sub}</p>
                                </div>
                             </div>
                          </div>
                       )) : (
                          <div className="py-12 text-center opacity-30">
                             <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Signal Static</p>
                          </div>
                       )}
                    </div>
                    <button className="w-full mt-4 py-3 bg-muted rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/20">Clear Buffer</button>
                 </div>
              )}
           </div>
        </div>

        {/* User Badge */}
        <div className="relative" ref={userRef}>
           <button 
             onClick={() => setUserOpen(!userOpen)}
             className="flex items-center gap-3 hover:opacity-90 transition-all p-1 rounded-2xl"
           >
              <div className="flex flex-col items-end hidden md:flex">
                 <span className="text-xs font-black uppercase tracking-tighter text-foreground">{user?.name}</span>
                 <div className="flex items-center gap-1.5 mt-0.5">
                    <Fingerprint className="w-3 h-3 text-primary/70" />
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{user?.role}</span>
                 </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center font-black text-foreground overflow-hidden">
                   {getInitials(user?.name || "U")}
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" />
                </div>
              </div>
           </button>

           {userOpen && (
              <div className="absolute right-0 mt-4 w-72 rounded-2xl shadow-2xl border bg-card/95 backdrop-blur-xl border-border p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                 <div className="px-4 py-4 border-b border-border mb-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Identity Core</p>
                    <p className="text-xs font-bold text-foreground truncate mt-1">{user?.email}</p>
                 </div>

                 {/* System Toggles */}
                 {(user?.role === "ADMIN" || user?.role === "HR") && (
                    <div className="px-4 py-3 border-b border-border mb-2 bg-muted/50 rounded-xl m-1">
                       <h4 className="text-[9px] font-black text-muted-foreground uppercase mb-4 flex items-center gap-2"><Settings2 className="w-3 h-3 text-primary" /> System Modules</h4>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-foreground uppercase">AI Screening</span>
                                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-tighter">Automated scoring active</span>
                             </div>
                             <Switch 
                               checked={features.aiScreening} 
                               onCheckedChange={() => toggleFeature("aiScreening")} 
                             />
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-foreground uppercase">Proctor Shield</span>
                                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-tighter">Integrity verification</span>
                             </div>
                             <Switch 
                               checked={features.proctorShield} 
                               onCheckedChange={() => toggleFeature("proctorShield")} 
                             />
                          </div>
                       </div>
                    </div>
                 )}

                 <button 
                   onClick={() => { clearAuth(); router.push("/login"); }}
                   className="w-full flex items-center gap-3 px-4 py-4 text-[10px] font-black text-destructive hover:bg-destructive/10 rounded-xl transition-all uppercase tracking-[0.2em]"
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
