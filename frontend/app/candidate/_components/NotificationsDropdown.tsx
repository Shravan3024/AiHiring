"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import { Bell, CheckCircle2, Clock, Info, AlertCircle, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ["candidate-notifications"],
    queryFn: () => candidateApi.getNotifications().then(r => r.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !(n.isRead || n.is_read)).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "WARNING": return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case "INFO": return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-96 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Notifications</h3>
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">{unreadCount} New</span>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Fetching updates...</div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                 <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-lg flex items-center justify-center mx-auto"><Bell className="w-6 h-6" /></div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No new alerts</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n: any) => (
                  <div key={n.id} className={cn("p-5 flex gap-4 hover:bg-slate-50 transition-all cursor-pointer", !(n.isRead || n.is_read) && "bg-blue-50/30")}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white")}>
                       {getIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                       <p className="text-sm font-bold text-slate-900 leading-tight">{n.message}</p>
                       <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            {n.createdAt || n.created_at ? formatDistanceToNow(new Date(n.createdAt || n.created_at), { addSuffix: true }) : "Recently"}
                          </span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-50">
            <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-widest gap-2">
               View All Activity <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
