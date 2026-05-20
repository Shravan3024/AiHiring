"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, KeyRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";

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
    <div className="min-h-screen relative flex flex-col justify-center font-sans overflow-hidden dark:bg-[#050816] bg-[#F8FAFC] dark:text-white text-gray-900 transition-colors duration-300">
      {/* Radial ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(198,255,0,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 dark:opacity-20 opacity-[0.03] transition-opacity duration-300"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center pt-24 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sm:mx-auto sm:w-full sm:max-w-md text-center"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#C6FF00]/10 border border-white/10 mb-6 backdrop-blur-md">
            <KeyRound className="w-8 h-8 text-[#C6FF00]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white text-gray-900 mb-2 transition-colors">
            Welcome Back
          </h2>
          <p className="text-sm dark:text-gray-400 text-gray-500 font-medium transition-colors">
            Sign in to continue to GenHire AI
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px]"
        >
          <div className="dark:bg-[#0B1020]/80 bg-white/80 backdrop-blur-2xl py-8 px-6 shadow-2xl border dark:border-white/10 border-gray-200 rounded-2xl sm:px-10 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wider ml-1 transition-colors">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter Your Email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] focus:outline-none sm:text-sm h-12 px-4 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wider ml-1 transition-colors">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] focus:outline-none sm:text-sm h-12 px-4 pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-12 flex justify-center items-center py-2 px-4 rounded-xl shadow-[0_0_20px_rgba(198,255,0,0.2)] hover:shadow-[0_0_30px_rgba(198,255,0,0.4)] text-sm font-bold text-black bg-[#C6FF00] hover:bg-[#d4ff33] focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loginMutation.isPending ? "SIGNING IN..." : "SIGN IN"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm dark:text-gray-400 text-gray-500 transition-colors">
                New candidate?{" "}
                <Link href="/register" className="font-bold text-[#C6FF00] hover:text-[#d4ff33] transition-colors">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-8 pt-6 border-t dark:border-white/10 border-gray-200 transition-colors">
              <div className="flex items-center gap-2 justify-center mb-4">
                <KeyRound className="w-3.5 h-3.5 text-gray-500" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Managed Persona</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: "Admin", email: "admin@example.com", pass: "password123" },
                  { role: "HR", email: "hr@example.com", pass: "password123" },
                  { role: "Candidate", email: "candidate@example.com", pass: "password123" },
                ].map(cred => (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => { const creds = { email: cred.email, password: cred.pass }; setForm(creds); setError(""); loginMutation.mutate(creds); }}
                    className="group relative flex flex-col items-center justify-center py-2 px-1 rounded-lg dark:bg-white/5 bg-gray-50 border dark:border-white/5 border-gray-200 dark:hover:bg-white/10 hover:bg-gray-100 hover:border-[#7C3AED]/50 transition-all duration-300"
                  >
                    <span className="text-[10px] font-bold dark:text-gray-300 text-gray-500 dark:group-hover:text-white group-hover:text-gray-900 uppercase tracking-wider mb-1 select-none transition-colors">{cred.role}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#C6FF00] shadow-[0_0_10px_rgba(198,255,0,0)] group-hover:shadow-[0_0_10px_rgba(198,255,0,0.5)] transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-auto text-center relative z-10 pb-8 px-4">
        <p className="text-xs dark:text-gray-600 text-gray-400 font-medium tracking-wide transition-colors">
          &copy; {new Date().getFullYear()} GenHire AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
