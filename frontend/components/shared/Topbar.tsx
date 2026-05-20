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

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <header className="h-11 bg-background border-b" />;

  const unreadCount = notifications.filter((n: any) => n.unread).length;

  return (
    <header className={cn(
      "h-14 px-5 flex items-center justify-between sticky top-0 z-40 border-b backdrop-blur-[24px] transition-all duration-300",
      "bg-white/50 border-white/40 shadow-sm"
    )}>
      {/* Left: Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground lg:hidden transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Cpu className="w-3 h-3 text-primary animate-pulse" />
          <h1 className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">{title || "Command Center"}</h1>
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden xl:block group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            className={cn(
              "pl-8 pr-3 py-1.5 text-[10px] font-medium border rounded-xl focus:outline-none transition-all w-48 uppercase tracking-wider",
              "bg-white/40 border-white/30 text-foreground placeholder:text-muted-foreground/60 focus:bg-white/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            )}
            placeholder="Search Entities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Global Toggles */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-border">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex items-center gap-1.5 p-1 rounded-md transition-all border border-border/40 bg-muted/20 hover:bg-muted/30 group",
              theme === "dark" ? "text-amber-500" : "text-primary"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center transition-all shadow-sm",
              theme === "dark" ? "bg-amber-500 text-white" : "bg-primary text-white"
            )}>
              {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </div>
            <div className="hidden lg:flex flex-col items-start pr-1">
              <span className="text-[7px] font-bold uppercase tracking-wider leading-none">{theme === "dark" ? "Solaris" : "Deep Space"}</span>
            </div>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={cn(
                "p-1.5 rounded-md transition-all hover:bg-muted group",
                unreadCount > 0 ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full border border-background animate-pulse" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl border bg-card/95 backdrop-blur-xl border-border p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary">Intelligence Feed</h3>
                  <Badge className="bg-primary/10 text-primary border-none font-bold text-[8px] px-1.5 py-0">{unreadCount} NEW</Badge>
                </div>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {notifications.length > 0 ? notifications.map((n: any) => (
                    <div key={n.id} className={cn(
                      "p-2 rounded-md border transition-all cursor-pointer group hover:bg-muted/50",
                      n.unread ? "bg-primary/5 border-primary/20" : "bg-transparent border-transparent"
                    )}>
                      <div className="flex gap-2.5">
                        <div className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                          n.unread ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground"
                        )}>
                          {n.type === "WARNING" ? <AlertCircle className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-[10px] font-bold uppercase tracking-tight truncate">{n.title || n.text}</p>
                            <span className="text-[8px] font-medium text-muted-foreground uppercase ml-2 flex-shrink-0">{n.time || "Now"}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-snug line-clamp-2">{n.message || n.sub}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-6 text-center opacity-30">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-[9px] font-bold uppercase tracking-wider">Signal Static</p>
                    </div>
                  )}
                </div>
                <button className="w-full mt-2 py-2 bg-muted rounded-md text-[8px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/20">Clear Buffer</button>
              </div>
            )}
          </div>
        </div>

        {/* User Badge */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 hover:opacity-90 transition-all p-1 rounded-md"
          >
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-[11px] font-bold uppercase tracking-tight text-foreground leading-tight">{user?.name}</span>
              <div className="flex items-center gap-1">
                <Fingerprint className="w-2.5 h-2.5 text-primary/70" />
                <span className="text-[8px] font-medium text-primary uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary to-blue-400 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-xs text-foreground overflow-hidden">
                {getInitials(user?.name || "U")}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
              </div>
            </div>
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-lg shadow-xl border bg-card/95 backdrop-blur-xl border-border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2.5 border-b border-border mb-1">
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Identity Core</p>
                <p className="text-[11px] font-medium text-foreground truncate mt-0.5">{user?.email}</p>
              </div>

              {/* System Toggles */}
              {(user?.role === "ADMIN" || user?.role === "HR") && (
                <div className="px-3 py-2 border-b border-border mb-1 bg-muted/50 rounded-md m-0.5">
                  <h4 className="text-[8px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5"><Settings2 className="w-2.5 h-2.5 text-primary" /> System Modules</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-foreground uppercase">AI Screening</span>
                        <span className="text-[7px] text-muted-foreground font-medium uppercase tracking-tight">Automated scoring</span>
                      </div>
                      <Switch
                        checked={features.aiScreening}
                        onCheckedChange={() => toggleFeature("aiScreening")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-foreground uppercase">Proctor Shield</span>
                        <span className="text-[7px] text-muted-foreground font-medium uppercase tracking-tight">Integrity check</span>
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
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold text-destructive hover:bg-destructive/10 rounded-md transition-all uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" /> Terminate Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
