"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User, Lock, Bell, Shield, Palette, Globe,
  CheckCircle, AlertCircle, Eye, EyeOff, Building2, Mail, Phone,
} from "lucide-react";

type Tab = "profile" | "password" | "notifications" | "appearance" | "security" | "company";

const ADMIN_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",       icon: <User className="w-4 h-4" /> },
  { id: "password",      label: "Password",      icon: <Lock className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "company",       label: "Company",       icon: <Building2 className="w-4 h-4" /> },
  { id: "security",      label: "Security",      icon: <Shield className="w-4 h-4" /> },
  { id: "appearance",    label: "Appearance",    icon: <Palette className="w-4 h-4" /> },
];

const HR_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",       icon: <User className="w-4 h-4" /> },
  { id: "password",      label: "Password",      icon: <Lock className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "appearance",    label: "Appearance",    icon: <Palette className="w-4 h-4" /> },
];

const CANDIDATE_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",       icon: <User className="w-4 h-4" /> },
  { id: "password",      label: "Password",      icon: <Lock className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "appearance",    label: "Appearance",    icon: <Palette className="w-4 h-4" /> },
];

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
      {type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  );
}

function ProfileTab() {
  const { user, setAuth, token } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile(form),
    onSuccess: (res) => {
      const updated = res.data?.user;
      if (updated && token) setAuth({ ...user!, ...updated }, token);
      setStatus({ type: "success", msg: "Profile updated successfully." });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      setStatus({ type: "error", msg: err.response?.data?.message || "Update failed." });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
        <p className="text-sm text-gray-500 mt-1">Update your name and email address.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
          {form.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-medium text-gray-900">{user?.name}</p>
          <Badge variant="secondary" className="text-xs mt-1">{user?.role}</Badge>
        </div>
      </div>

      {status && <Alert type={status.type} msg={status.msg} />}

      <div className="grid grid-cols-1 gap-4 max-w-md">
        <div>
          <Label>Full Name</Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
          </div>
        </div>
        <div>
          <Label>Email Address</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
          </div>
        </div>
      </div>

      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.email}>
        {mutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    onSuccess: () => {
      setStatus({ type: "success", msg: "Password changed successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      setStatus({ type: "error", msg: err.response?.data?.message || "Failed to change password." });
    },
  });

  const strength = form.newPassword.length === 0 ? 0 : form.newPassword.length < 6 ? 1 : form.newPassword.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"];

  const handleSubmit = () => {
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: "error", msg: "New passwords do not match." });
      return;
    }
    setStatus(null);
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        <p className="text-sm text-gray-500 mt-1">Use a strong password with at least 6 characters.</p>
      </div>

      {status && <Alert type={status.type} msg={status.msg} />}

      <div className="space-y-4 max-w-md">
        {(["current", "new", "confirm"] as const).map((field) => {
          const labels = { current: "Current Password", new: "New Password", confirm: "Confirm New Password" };
          const keys = { current: "currentPassword", new: "newPassword", confirm: "confirmPassword" } as const;
          return (
            <div key={field}>
              <Label>{labels[field]}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9 pr-10"
                  type={show[field] ? "text" : "password"}
                  value={form[keys[field]]}
                  onChange={e => setForm(f => ({ ...f, [keys[field]]: e.target.value }))}
                  placeholder="••••••••"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}>
                  {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}

        {form.newPassword.length > 0 && (
          <div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColor[strength] : "bg-gray-200"}`} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Strength: <span className="font-medium">{strengthLabel[strength]}</span></p>
          </div>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={mutation.isPending || !form.currentPassword || !form.newPassword || !form.confirmPassword}>
        {mutation.isPending ? "Updating..." : "Update Password"}
      </Button>
    </div>
  );
}

function NotificationsTab({ role }: { role: string }) {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    applicationUpdates: true,
    weeklyReport: role === "ADMIN" || role === "HR",
    newApplications: role === "HR" || role === "ADMIN",
    interviewReminders: true,
    offerUpdates: role === "CANDIDATE",
    systemAlerts: role === "ADMIN",
    auditAlerts: role === "ADMIN",
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const items: Array<{ key: keyof typeof settings; label: string; desc: string; roles: string[] }> = [
    { key: "emailAlerts",       label: "Email Alerts",         desc: "Receive important alerts via email",              roles: ["ADMIN","HR","CANDIDATE"] },
    { key: "applicationUpdates",label: "Application Updates",  desc: "Get notified when your application status changes",roles: ["CANDIDATE"] },
    { key: "interviewReminders",label: "Interview Reminders",  desc: "Reminders before scheduled interviews",            roles: ["CANDIDATE","HR"] },
    { key: "offerUpdates",      label: "Offer Notifications",  desc: "Updates on offer letters and decisions",           roles: ["CANDIDATE"] },
    { key: "newApplications",   label: "New Applications",     desc: "Alert when candidates apply to open roles",        roles: ["HR","ADMIN"] },
    { key: "weeklyReport",      label: "Weekly Report",        desc: "Weekly hiring metrics and pipeline summary",       roles: ["HR","ADMIN"] },
    { key: "systemAlerts",      label: "System Alerts",        desc: "Critical system health and error alerts",          roles: ["ADMIN"] },
    { key: "auditAlerts",       label: "Audit Alerts",         desc: "Notifications for audit log events",               roles: ["ADMIN"] },
  ];
  
  const filteredItems = items.filter(i => i.roles.includes(role));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <p className="text-sm text-gray-500 mt-1">Choose what notifications you receive.</p>
      </div>

      {saved && <Alert type="success" msg="Notification preferences saved." />}

      <div className="space-y-3 max-w-lg">
        {filteredItems.map(item => (
          <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings[item.key] ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${settings[item.key] ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
        Save Preferences
      </Button>
    </div>
  );
}

function AppearanceTab() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
        <p className="text-sm text-gray-500 mt-1">Customize the look and feel of the interface.</p>
      </div>

      {saved && <Alert type="success" msg="Appearance preferences saved." />}

      <div className="space-y-5 max-w-lg">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Theme</Label>
          <div className="grid grid-cols-3 gap-3">
            {(["light", "dark", "system"] as const).map(t => (
              <button key={t} onClick={() => setTheme(t)}
                className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${theme === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                {t === "light" ? "☀️" : t === "dark" ? "🌙" : "💻"} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Content Density</Label>
          <div className="grid grid-cols-3 gap-3">
            {(["compact", "comfortable", "spacious"] as const).map(d => (
              <button key={d} onClick={() => setDensity(d)}
                className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${density === d ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
        Save Appearance
      </Button>
    </div>
  );
}

function SecurityTab() {
  const { user } = useAuthStore();
  const sessions = [
    { device: "Chrome on Windows", location: "Mumbai, IN", last: "Active now", current: true },
    { device: "Firefox on macOS",  location: "Pune, IN",   last: "2 hours ago", current: false },
    { device: "Mobile - Android",  location: "Delhi, IN",  last: "Yesterday",   current: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
        <p className="text-sm text-gray-500 mt-1">Manage sessions and security options.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Account Status</span>
            </div>
            <Badge variant="success" className="text-xs">Active</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Role</span>
            </div>
            <Badge variant="secondary" className="text-xs">{user?.role}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" /> Active Sessions
        </h4>
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">{s.device}</p>
                <p className="text-xs text-gray-500">{s.location} · {s.last}</p>
              </div>
              {s.current
                ? <Badge variant="success" className="text-xs">Current</Badge>
                : <Button variant="outline" size="sm" className="text-xs h-7">Revoke</Button>
              }
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-lg p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm font-medium text-amber-800">Two-Factor Authentication</p>
        <p className="text-xs text-amber-700 mt-1">2FA adds an extra layer of security to your account.</p>
        <Button variant="outline" size="sm" className="mt-3 text-amber-700 border-amber-300 hover:bg-amber-100">
          Enable 2FA
        </Button>
      </div>
    </div>
  );
}

function CompanyTab() {
  const [form, setForm] = useState({
    companyName: "Navale Corp",
    website: "https://navalecorp.com",
    industry: "Technology",
    size: "51-200",
    phone: "+91 98765 43210",
    address: "Pune, Maharashtra, India",
  });
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Company Settings</h3>
        <p className="text-sm text-gray-500 mt-1">Manage your organization's information.</p>
      </div>

      {saved && <Alert type="success" msg="Company settings saved." />}

      <div className="grid grid-cols-1 gap-4 max-w-md">
        {[
          { key: "companyName", label: "Company Name",  icon: <Building2 className="w-4 h-4 text-gray-400" /> },
          { key: "website",     label: "Website",       icon: <Globe className="w-4 h-4 text-gray-400" /> },
          { key: "industry",    label: "Industry",      icon: <Building2 className="w-4 h-4 text-gray-400" /> },
          { key: "phone",       label: "Phone",         icon: <Phone className="w-4 h-4 text-gray-400" /> },
          { key: "address",     label: "Address",       icon: <Mail className="w-4 h-4 text-gray-400" /> },
        ].map(({ key, label, icon }) => (
          <div key={key}>
            <Label>{label}</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
              <Input className="pl-9"
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={label}
              />
            </div>
          </div>
        ))}

        <div>
          <Label>Company Size</Label>
          <select
            className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.size}
            onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
          >
            {["1-10","11-50","51-200","201-500","500+"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
        Save Company Info
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const role = user?.role || "CANDIDATE";

  const tabs = role === "ADMIN" ? ADMIN_TABS : role === "HR" ? HR_TABS : CANDIDATE_TABS;
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const allowedRoles: ("ADMIN" | "HR" | "CANDIDATE")[] = ["ADMIN", "HR", "CANDIDATE"];

  return (
    <PanelLayout title="Settings" allowedRoles={allowedRoles}>
      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-52 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                {tabs.find(t => t.id === activeTab)?.icon}
                {tabs.find(t => t.id === activeTab)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === "profile"       && <ProfileTab />}
              {activeTab === "password"      && <PasswordTab />}
              {activeTab === "notifications" && <NotificationsTab role={role} />}
              {activeTab === "appearance"    && <AppearanceTab />}
              {activeTab === "security"      && <SecurityTab />}
              {activeTab === "company"       && role === "ADMIN" && <CompanyTab />}
            </CardContent>
          </Card>
        </div>
      </div>
    </PanelLayout>
  );
}
