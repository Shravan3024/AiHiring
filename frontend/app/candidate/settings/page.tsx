"use client";

import React, { useState, useEffect } from "react";
import { useUIStore, useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  User, Shield, Lock, Trash2, 
  Eye, EyeOff, Globe, Bell, 
  Smartphone, Monitor, CreditCard,
  LogOut, ChevronRight, CheckCircle2,
  AlertTriangle, Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CandidateSettings() {
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    setPageTitle("Account Settings");
  }, []);

  const sections = [
    { id: "personal", label: "Security & Access", icon: Shield },
    { id: "privacy", label: "Privacy Controls", icon: Lock },
    { id: "notifications", label: "System Alerts", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle }
  ];

  const [activeSection, setActiveSection] = useState("personal");

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="border-none shadow-sm rounded-[40px] bg-white p-6 overflow-hidden">
              <div className="p-4 space-y-2">
                 {sections.map(s => (
                   <button
                     key={s.id}
                     onClick={() => setActiveSection(s.id)}
                     className={cn(
                       "w-full flex items-center gap-4 p-4 rounded-lg transition-all font-bold text-sm",
                       activeSection === s.id 
                         ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                         : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                     )}
                   >
                      <s.icon className={cn("w-5 h-5", activeSection === s.id ? "text-white" : "text-slate-400")} />
                      {s.label}
                   </button>
                 ))}
              </div>
           </Card>

           <Card className="border-none shadow-sm rounded-[40px] bg-slate-900 p-5 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <h4 className="font-bold">Active Sessions</h4>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Monitor className="w-4 h-4 text-emerald-400" />
                       <div>
                          <p className="text-xs font-bold">Chrome on Windows</p>
                          <p className="text-[10px] text-slate-400">Delhi, India • Active Now</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Smartphone className="w-4 h-4 text-slate-500" />
                       <div>
                          <p className="text-xs font-bold text-slate-300">iPhone 14 Pro</p>
                          <p className="text-[10px] text-slate-500">2 hours ago</p>
                       </div>
                    </div>
                 </div>
                 <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300 hover:bg-white/5 font-bold text-xs p-0 h-auto mt-4">Log out all devices</Button>
              </div>
           </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 space-y-10">
           {activeSection === "personal" && (
             <Card className="border-none shadow-sm rounded-[40px] bg-white p-6 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Security & Access</h3>
                   <p className="text-sm text-slate-400 font-medium">Manage your authentication methods and security protocols.</p>
                </div>

                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                         <Input defaultValue={user?.email} disabled className="h-14 bg-slate-50 border-none rounded-lg font-bold px-6 text-slate-500" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                         <div className="relative">
                            <Input type={showPass ? "text" : "password"} defaultValue="••••••••" className="h-14 bg-slate-50 border-none rounded-lg font-bold px-6" />
                            <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                               {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-slate-50 flex flex-col gap-6">
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg">
                         <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600"><Key className="w-6 h-6" /></div>
                            <div>
                               <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                               <p className="text-xs text-slate-400 font-medium">Add an extra layer of security to your account.</p>
                            </div>
                         </div>
                         <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-blue-100">Enable</Button>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg">
                         <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-600"><Smartphone className="w-6 h-6" /></div>
                            <div>
                               <p className="font-bold text-slate-900">Recovery Phone</p>
                               <p className="text-xs text-slate-400 font-medium">Used to recover account if you lose access.</p>
                            </div>
                         </div>
                         <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-white rounded-xl px-6 font-bold">Manage</Button>
                      </div>
                   </div>
                </div>

                <div className="flex justify-end pt-4">
                   <Button className="h-14 px-12 bg-slate-900 hover:bg-black text-white rounded-lg font-black uppercase tracking-widest transition-all">Update Security</Button>
                </div>
             </Card>
           )}

           {activeSection === "danger" && (
             <Card className="border-none shadow-sm rounded-[40px] bg-white p-6 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Danger Zone</h3>
                   <p className="text-sm text-slate-400 font-medium">Irreversible actions that affect your account data.</p>
                </div>

                <div className="space-y-6">
                   <div className="p-5 border-2 border-dashed border-red-100 rounded-xl bg-red-50/20 flex items-center justify-between">
                      <div className="space-y-1">
                         <h4 className="font-bold text-red-600">Delete Account</h4>
                         <p className="text-xs text-slate-500 font-medium max-w-sm">This will permanently delete your profile, applications, and documents. This action cannot be undone.</p>
                      </div>
                      <Button variant="destructive" className="h-12 px-5 rounded-xl font-black uppercase tracking-widest text-[10px]">Delete Permanently</Button>
                   </div>

                   <div className="p-5 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between">
                      <div className="space-y-1">
                         <h4 className="font-bold text-slate-900">Archive Profile</h4>
                         <p className="text-xs text-slate-500 font-medium max-w-sm">Temporarily hide your profile from all recruiters and hiring teams.</p>
                      </div>
                      <Button variant="outline" className="h-12 px-5 rounded-xl border-slate-200 font-bold text-xs">Archive Now</Button>
                   </div>
                </div>
             </Card>
           )}

           {/* Generic placeholder for other sections */}
           {activeSection !== "personal" && activeSection !== "danger" && (
             <Card className="border-none shadow-sm rounded-[40px] bg-white p-20 text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="w-20 h-12 bg-slate-50 text-slate-200 rounded-[28px] flex items-center justify-center mx-auto"><Settings className="w-10 h-10" /></div>
                <div>
                   <h4 className="text-xl font-bold text-slate-900">Section Coming Soon</h4>
                   <p className="text-slate-500 mt-2">We are currently fine-tuning these settings for your account.</p>
                </div>
                <Button onClick={() => setActiveSection("personal")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold">Go to Security</Button>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}
function Settings(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
