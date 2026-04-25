"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Settings, Users, FileText,
  GitBranch, Shield, ChevronLeft, ChevronRight, Bot,
  ClipboardList, TrendingUp, UserCheck, Bell, LogOut, Lock,
  Command, Layers, Fingerprint, Settings2, Moon, Sun, User, Cpu, Sparkles, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/lib/store";
import { useTheme } from "next-themes";

const adminNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Jobs", icon: Briefcase, href: "/admin/jobs" },
  { label: "Workflows", icon: GitBranch, href: "/admin/workflows" },
  { label: "AI Config", icon: Bot, href: "/admin/ai-config" },
  { label: "HR Management", icon: Users, href: "/admin/hr-management" },
  { label: "Approvals", icon: ClipboardList, href: "/admin/approvals" },
  { label: "Audit Log", icon: Shield, href: "/admin/audit" },
];

const hrNav = [
  { label: "Dashboard", href: "/hr", icon: LayoutDashboard },
  { label: "Pipeline", href: "/hr/pipeline", icon: TrendingUp },
  { label: "Candidates", href: "/hr/candidates", icon: Users },
  { label: "Assessments", href: "/hr/assessments", icon: ClipboardList },
  { label: "Interviews", href: "/hr/interviews", icon: Bot },
  { label: "Reports", href: "/hr/reports", icon: FileText },
  { label: "AI Insights", href: "/hr/ai-insights", icon: Sparkles },
  { label: "Talent Pool", href: "/hr/talent-pool", icon: Layers },
  { label: "Risk Monitor", href: "/hr/risk-monitor", icon: Shield },
  { label: "Analytics", href: "/hr/analytics", icon: BarChart3 },
];

const mdNav = [
  { label: "Dashboard", href: "/md", icon: LayoutDashboard },
  { label: "Executive Decision", href: "/md/decision", icon: Shield },
  { label: "Performance", href: "/md/analytics", icon: TrendingUp },
];

const candidateNav = [
  { label: "Dashboard", href: "/candidate", icon: LayoutDashboard },
  { label: "My Applications", href: "/candidate/application", icon: FileText },
  { label: "Assessment Hub", href: "/candidate/assessment", icon: ClipboardList },
  { label: "Interview", href: "/candidate/interview", icon: Bot },
  { label: "Offer Desk", href: "/candidate/offer", icon: Briefcase },
  { label: "Profile", href: "/candidate/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems =
    user?.role === "ADMIN" ? adminNav :
    user?.role === "HR" ? hrNav :
    user?.role === "MD" ? mdNav : candidateNav;

  if (!mounted) return <aside className="w-20 bg-card border-r h-screen" />;

  return (
    <aside
      className={cn(
        "relative z-30 flex flex-col transition-all duration-500 ease-in-out h-screen border-r",
        sidebarOpen ? "w-72" : "w-20",
        "bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl"
      )}
    >
      {/* Header / Logo */}
      <div className="relative flex items-center justify-between px-5 h-20 border-b border-border/40 bg-background/20">
        <div className={cn("flex items-center gap-3 transition-all duration-500", !sidebarOpen && "scale-0 invisible w-0")}>
          <div className="w-10 h-10 industrial-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
             <Cpu className="text-white w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-[0.2em] uppercase mb-0.5 text-foreground">Mask Polymers</span>
            <span className="font-bold text-[8px] text-primary tracking-[0.3em] uppercase">Advanced Recruitment</span>
          </div>
        </div>
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl transition-all border border-border/50 hover:bg-muted text-muted-foreground shrink-0"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {sidebarOpen && (
           <div className="px-4 mb-6 opacity-40">
              <span className="text-[9px] font-black text-muted-foreground tracking-[0.4em] uppercase">Operational Hub</span>
           </div>
        )}
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30 scale-[1.02]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                 "w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                 isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
              )} />
              {sidebarOpen && <span className="tracking-widest uppercase text-[10px] font-black">{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-[calc(100%+10px)] px-4 py-2 bg-card text-foreground text-[10px] font-black rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 uppercase tracking-widest border border-border shadow-2xl">
                   {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Actions & Toggles */}
      <div className="p-4 border-t border-border/40 space-y-3 bg-background/20">
          <button 
             onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
             className={cn(
                "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group border border-border/50 shadow-sm",
                theme === "dark" 
                   ? "text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20" 
                   : "text-primary bg-primary/5 hover:bg-primary/10 border-primary/20"
             )}
          >
             <div className="flex items-center gap-4">
                <div className={cn(
                   "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                   theme === "dark" ? "bg-amber-500/20" : "bg-primary/20"
                )}>
                   {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </div>
                {sidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">{theme === "dark" ? "Solaris Mode" : "Deep Space"}</span>}
             </div>
             {sidebarOpen && (
                <div className={cn(
                   "w-10 h-5 rounded-full relative transition-all duration-500 border border-current opacity-40",
                )}>
                   <div className={cn(
                      "absolute top-1 w-2.5 h-2.5 rounded-full transition-all duration-500 shadow-sm",
                      theme === "dark" ? "right-1.5 bg-amber-500" : "left-1.5 bg-primary"
                   )} />
                </div>
             )}
          </button>

          <button
            onClick={() => { clearAuth(); window.location.href = "/login"; }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-all group uppercase text-[10px] font-black tracking-widest"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            {sidebarOpen && <span>Terminate Session</span>}
          </button>
      </div>
    </aside>
  );
}
