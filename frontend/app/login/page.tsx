"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, ShieldCheck, KeyRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PublicNavbar } from "@/components/shared/PublicNavbar";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: (creds?: { email: string; password: string }) => authApi.login(creds ?? form),
    onSuccess: (res) => {
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === "ADMIN") router.push("/admin");
      else if (user.role === "HR") router.push("/hr");
      else if (user.role === "MD") router.push("/md");
      else router.push("/candidate");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Invalid email or password.";
      setError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    loginMutation.mutate(form);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center font-sans overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/login-bg.png"
          alt="Industrial Background"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-gray-900/60 to-black/80 backdrop-blur-[4px]" />
      </div>

      <PublicNavbar />

      <div className="relative z-10 flex flex-col items-center justify-center pt-20 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-4">
            <div className="bg-white/90 p-3 rounded-lg shadow-sm backdrop-blur-md border border-white/50">
              <img src="/logo.png" alt="AI Hiring System Logo" className="h-16 w-auto object-contain" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300 font-medium">
            Professional access to the AI Hiring System ecosystem.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px]">
          <div className="bg-white/80 backdrop-blur-2xl py-10 px-4 shadow-sm border border-white/30 sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 rounded-xl p-4 text-sm animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Email address
                </Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Your Email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border-gray-200/50 bg-gray-50/30 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Password
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-xl border-gray-200/50 bg-gray-50/30 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-12 flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]"
                >
                  {loginMutation.isPending ? "SIGNING IN..." : "SIGN IN"}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                New candidate?{" "}
                <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-4 decoration-blue-500/30">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Demo credentials - Glassy Section */}
            <div className="mt-10 pt-8 border-t border-gray-100/50">
              <div className="flex items-center gap-2 justify-center mb-4">
                <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Managed Persona</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { role: "Admin", email: "admin@example.com", pass: "password123" },
                  { role: "HR", email: "hr@example.com", pass: "password123" },
                  { role: "Candidate", email: "candidate@example.com", pass: "password123" },
                ].map(cred => (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => { const creds = { email: cred.email, password: cred.pass }; setForm(creds); setError(""); loginMutation.mutate(creds); }}
                    className="group relative flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:shadow-xl hover:border-blue-500/50 transition-all duration-300"
                  >
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-1 select-none">{cred.role}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center relative z-10 pb-10 px-4">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest drop-shadow-sm">
          &copy; {new Date().getFullYear()} AI Hiring System Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
