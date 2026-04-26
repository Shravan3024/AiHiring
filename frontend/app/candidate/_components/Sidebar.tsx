"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Settings, Users, FileText,
  Shield, ChevronLeft, ChevronRight, Bot,
  ClipboardList, Calendar, HelpCircle, User, LogOut, Cpu, MessageSquare, Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const navGroups = [
  { group: "OPERATIONAL HUB", items: [
    { label: "Dashboard", href: "/candidate", icon: LayoutDashboard },
    { label: "My Applications", href: "/candidate/application", icon: Briefcase },
    { label: "Assessments", href: "/candidate/assessment", icon: ClipboardList },
    { label: "Interview Schedule", href: "/candidate/interview", icon: Calendar },
    { label: "Job Offers", href: "/candidate/offer", icon: FileText },
  ]},
  { group: "PROFILE & SETTINGS", items: [
    { label: "Profile", href: "/candidate/profile", icon: User },
    { label: "Account Settings", href: "/candidate/settings", icon: Settings2 },
  ]}
];

export default function CandidateSidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <aside className="w-20 bg-white border-r h-screen" />;

  return (
    <aside
      className={cn(
        "relative z-30 flex flex-col transition-all duration-300 ease-in-out h-screen border-r bg-white",
        sidebarOpen ? "w-72" : "w-20"
      )}
    >
      {/* Header / Logo */}
      <div className="flex items-center gap-3 px-6 h-24">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
           <Cpu className="text-white w-6 h-6" />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-slate-900">MASK POLYMERS</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">AI POWERED HIRING</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-2">
            {sidebarOpen && (
              <h3 className="px-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                {group.group}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    )} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Help Card */}
      {sidebarOpen && (
        <div className="p-4 mx-4 mb-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Need Help?</p>
              <p className="text-[10px] text-slate-500">We're here to help you</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50 text-[10px] font-bold">
            Contact Support
          </Button>
        </div>
      )}

      {/* Footer / Toggle & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          onClick={() => { clearAuth(); window.location.href = "/login"; }}
          className="w-full flex items-center gap-4 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
