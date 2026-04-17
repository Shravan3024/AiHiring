"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Briefcase, Settings, Users, FileText,
  GitBranch, Shield, ChevronLeft, ChevronRight, Bot,
  ClipboardList, TrendingUp, UserCheck, Bell, LogOut, Lock,
  Command, Layers, Fingerprint, Settings2, Moon, Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/lib/store";

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
  { label: "Candidates", href: "/hr/candidates", icon: UserCheck },
  { label: "Decisions", href: "/hr/approvals", icon: ClipboardList },
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
  { label: "Profile", href: "/candidate/profile", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore();

  const navItems =
    user?.role === "ADMIN" ? adminNav :
    user?.role === "HR" ? hrNav :
    user?.role === "MD" ? mdNav : candidateNav;

  return (
    <aside
      className={cn(
        "relative z-30 flex flex-col transition-all duration-500 ease-in-out h-screen border-r",
        sidebarOpen ? "w-72" : "w-20",
        theme === "dark" ? "bg-black border-slate-900 shadow-[20px_0_40px_rgba(0,0,0,0.4)]" : "bg-white border-slate-200"
      )}
    >
      {/* Header / Logo */}
      <div className={cn(
         "relative flex items-center justify-between px-5 h-20 border-b",
         theme === "dark" ? "border-slate-900" : "border-slate-100"
      )}>
        <div className={cn("flex items-center gap-3 transition-all duration-500", !sidebarOpen && "scale-0 invisible w-0")}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Fingerprint className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className={cn("font-black text-xs tracking-widest uppercase mb-1", theme === "dark" ? "text-white" : "text-[#0f172a]")}>Mask Polymers</span>
            <span className="font-bold text-[10px] text-blue-600 tracking-tighter uppercase">Industrial Hub</span>
          </div>
        </div>
        
        <button
          onClick={toggleSidebar}
          className={cn(
             "p-2 rounded-xl transition-all border shrink-0",
             theme === "dark" ? "hover:bg-slate-900 border-slate-800 text-slate-500" : "hover:bg-slate-50 border-transparent text-slate-400"
          )}
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {sidebarOpen && (
           <div className="px-4 mb-6 transition-opacity">
              <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase italic">Module Operations</span>
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
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-[1.02]"
                  : theme === "dark" 
                     ? "text-slate-500 hover:bg-slate-900 hover:text-white" 
                     : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              )}
            >
              <item.icon className={cn(
                 "w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:rotate-6",
                 isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"
              )} />
              {sidebarOpen && <span className="tracking-tighter uppercase text-[11px] font-black">{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-[calc(100%+10px)] px-4 py-2 bg-black text-white text-[10px] font-black rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 uppercase tracking-widest border border-slate-800">
                   {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Actions & Toggles */}
      <div className={cn(
         "p-4 border-t space-y-4",
         theme === "dark" ? "border-slate-900 bg-slate-950/20" : "border-slate-100"
      )}>
          {/* Theme Switcher Mobile/Expanded */}
          <button 
             onClick={toggleTheme}
             className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group border border-dashed",
                theme === "dark" 
                   ? "border-slate-800 text-amber-400 bg-amber-400/5 hover:bg-amber-400/10" 
                   : "border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
             )}
          >
             {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             {sidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">{theme === "dark" ? "Solaris Mode" : "Dark Protocol"}</span>}
          </button>

          <button
            onClick={() => { clearAuth(); window.location.href = "/login"; }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all group uppercase text-[10px] font-black tracking-widest"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            {sidebarOpen && <span>Terminate Session</span>}
          </button>
      </div>
    </aside>
  );
}
