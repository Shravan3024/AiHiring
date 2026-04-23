"use client";
import React, { useState } from "react";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, User, Shield, Zap, Mail, Bell, 
  Globe, Lock, Save, RefreshCw, Upload, Clock,
  Calendar, CheckCircle2, ChevronRight, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");

  const tabs = [
    { name: "General", icon: Settings },
    { name: "Roles & Permissions", icon: Shield },
    { name: "Workflow", icon: RefreshCw },
    { name: "Email Templates", icon: Mail },
    { name: "Notifications", icon: Bell },
    { name: "Integrations", icon: Globe },
    { name: "Security", icon: Lock },
  ];

  return (
    <PanelLayout title="Settings" allowedRoles={["HR", "ADMIN", "SUPER_ADMIN"]}>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">System Settings</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Manage your system preferences and configurations</p>
           </div>
           <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="h-10 rounded-xl border-border/50 text-xs font-black uppercase tracking-widest gap-2">
                 <RefreshCw className="w-4 h-4" /> Reset Defaults
              </Button>
              <Button className="h-10 rounded-xl industrial-gradient text-white text-xs font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20">
                 <Save className="w-4 h-4" /> Save Changes
              </Button>
           </div>
        </div>

        {/* TABS */}
        <div className="flex bg-muted/20 p-1.5 rounded-2xl gap-2 border border-border/40 overflow-x-auto no-scrollbar">
           {tabs.map((tab) => (
              <Button key={tab.name} onClick={() => setActiveTab(tab.name)} variant="ghost" className={cn(
                 "h-10 text-[10px] font-black uppercase tracking-widest gap-3 px-6 rounded-xl flex-shrink-0 transition-all duration-300",
                 activeTab === tab.name ? "bg-card text-primary shadow-lg" : "text-muted-foreground opacity-60 hover:opacity-100"
              )}>
                 <tab.icon className="w-4 h-4" /> {tab.name}
              </Button>
           ))}
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Left Column: Forms */}
           <div className="lg:col-span-8 space-y-8">
              
              {/* Organization Profile */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-8 py-6">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Organization Profile</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Organization Name</label>
                       <Input className="h-12 bg-muted/20 border-border/40 rounded-xl text-xs font-medium" defaultValue="Mask Polymers" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Tagline</label>
                       <Input className="h-12 bg-muted/20 border-border/40 rounded-xl text-xs font-medium" defaultValue="Advanced Recruitment Platform" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Website</label>
                       <Input className="h-12 bg-muted/20 border-border/40 rounded-xl text-xs font-medium" defaultValue="https://maskpolymers.com" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Logo</label>
                       <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted border border-border/40 flex items-center justify-center shrink-0">
                             <Upload className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <Button variant="outline" className="h-12 rounded-xl border-dashed border-border/50 text-[10px] font-black uppercase tracking-widest flex-1">Upload New Logo</Button>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              {/* Regional Settings */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-8 py-6">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Regional Settings</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Timezone</label>
                       <select className="w-full bg-muted/20 border-border/40 rounded-xl h-12 px-4 text-xs font-medium focus:ring-primary/20">
                          <option>(UTC +05:30) Asia/Kolkata</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Date Format</label>
                       <select className="w-full bg-muted/20 border-border/40 rounded-xl h-12 px-4 text-xs font-medium focus:ring-primary/20">
                          <option>DD-MM-YYYY</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Time Format</label>
                       <select className="w-full bg-muted/20 border-border/40 rounded-xl h-12 px-4 text-xs font-medium focus:ring-primary/20">
                          <option>12 Hour</option>
                       </select>
                    </div>
                 </CardContent>
              </Card>

           </div>

           {/* Right Column: Toggles & Policies */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* System Preferences */}
              <Card className="border-border/40 glass shadow-2xl rounded-3xl overflow-hidden">
                 <CardHeader className="border-b border-white/5 px-8 py-6">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">System Preferences</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    {[
                       { label: 'Enable AI Recommendations', enabled: true },
                       { label: 'Enable Email Notifications', enabled: true },
                       { label: 'Enable Candidate Self-Registration', enabled: false },
                       { label: 'Enable Interview Feedback', enabled: true },
                    ].map((pref, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{pref.label}</span>
                          <Switch defaultChecked={pref.enabled} />
                       </div>
                    ))}
                 </CardContent>
              </Card>

              {/* Data Retention */}
              <Card className="border-border/40 glass-dark shadow-2xl rounded-3xl overflow-hidden border-l-4 border-l-primary/50">
                 <CardHeader className="border-b border-white/5 px-8 py-6">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Data Retention</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Data Retention Period</label>
                       <select className="w-full bg-background/50 border-border/40 rounded-xl h-12 px-4 text-xs font-medium focus:ring-primary/20">
                          <option>2 Years</option>
                          <option>5 Years</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-tight">Auto-Archive Candidates</span>
                          <Switch defaultChecked={true} />
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-tight">Anonymize Data</span>
                          <Switch defaultChecked={false} />
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3">
                       <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                       <p className="text-[9px] font-medium text-muted-foreground leading-relaxed uppercase">Candidate data will be archived after 2 years of inactivity by default.</p>
                    </div>
                 </CardContent>
              </Card>

           </div>

        </div>

      </div>
    </PanelLayout>
  );
}
