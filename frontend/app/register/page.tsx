"use client";
import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Eye, EyeOff, AlertCircle, ArrowLeft, RefreshCw, ShieldCheck, UserPlus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { PublicNavbar } from "@/components/shared/PublicNavbar";

type Step = "register" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "CANDIDATE",
      }),
    onSuccess: () => {
      setRegisteredEmail(form.email);
      setStep("otp");
      setResendCooldown(60);
      toast.success("Verification code sent to your email.");
    },
    onError: (err: any) => {
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        setError(backendErrors[0].message);
      } else {
        setError(err?.response?.data?.message || "Registration failed. Please try again.");
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () =>
      authApi.verifyOTP({ email: registeredEmail, otp: otp.join("") }),
    onSuccess: () => {
      toast.success("Email verified successfully. You can now log in.");
      router.push("/login");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Invalid code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOTP({ email: registeredEmail }),
    onSuccess: () => {
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      toast.success("A new verification code has been sent.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to resend code.");
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    
    // Strict password validation matching backend
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (!passwordRegex.test(form.password)) {
      return setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }
    
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    registerMutation.mutate();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (value && index === 5 && newOtp.every(d => d)) {
      setTimeout(() => verifyMutation.mutate(), 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.every(d => d)) {
      verifyMutation.mutate();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const newOtp = [...otp];
    text.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const passwordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Fair", color: "bg-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = passwordStrength(form.password);

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
            <div className="bg-white/90 p-3 rounded-2xl shadow-2xl backdrop-blur-md border border-white/50">
              <img src="/logo.png" alt="Mask Polymers Logo" className="h-16 w-auto object-contain" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            {step === "register" ? "Create Account" : "Verify Identity"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300 font-medium whitespace-pre-line">
            {step === "register" 
              ? "Professional onboarding for Mask Polymers ecosystem." 
              : `A 6-digit verification code has been sent to\n${registeredEmail}`}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px]">
          <div className="bg-white/80 backdrop-blur-2xl py-10 px-4 shadow-2xl border border-white/30 sm:rounded-[2.5rem] sm:px-10">
            
            {step === "register" && (
              <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm animate-shake">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Full name
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Enter Your Name"
                      className="block w-full rounded-xl border-gray-200/50 bg-gray-50/30 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 transition-all"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Email address
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Enter Your Email"
                      className="block w-full rounded-xl border-gray-200/50 bg-gray-50/30 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 transition-all"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="block w-full rounded-xl border-gray-200/50 bg-gray-50/30 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 pr-10 transition-all"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2 px-1">
                      <div className="flex gap-1.5 h-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div 
                            key={i} 
                            className={`flex-1 rounded-full transition-all duration-500 ${i <= strength.score ? strength.color : "bg-gray-100"}`} 
                          />
                        ))}
                      </div>
                      <p className={cn("text-[10px] font-bold mt-1.5 uppercase tracking-wider text-right", strength.color.replace("bg-", "text-"))}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Confirm password
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="block w-full rounded-xl border-gray-200/50 bg-gray-50/30 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 pr-10 transition-all font-mono"
                      value={form.confirmPassword}
                      onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(s => !s)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full h-12 flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]"
                  >
                    {registerMutation.isPending ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                  </Button>
                </div>
              </form>
            )}

            {step === "otp" && (
              <div className="space-y-8">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm animate-shake">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <div className="flex justify-between gap-3 px-1">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className={cn(
                        "w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all outline-none",
                        digit 
                          ? "border-blue-600 bg-blue-50/30 text-blue-600" 
                          : "border-gray-100 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      )}
                    />
                  ))}
                </div>

                <div className="pt-2 flex flex-col gap-4">
                  <Button
                    className="w-full h-12 flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]"
                    onClick={() => { setError(""); verifyMutation.mutate(); }}
                    disabled={otp.some(d => !d) || verifyMutation.isPending}
                  >
                    {verifyMutation.isPending ? "VERIFYING..." : "VERIFY CODE"}
                  </Button>

                  <div className="text-center">
                    {resendCooldown > 0 ? (
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        Resend available in {resendCooldown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => resendMutation.mutate()}
                        disabled={resendMutation.isPending}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto transition-colors focus:outline-none uppercase tracking-widest"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", resendMutation.isPending && "animate-spin")} />
                        {resendMutation.isPending ? "Sending..." : "Resend Code"}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setStep("register"); setError(""); setOtp(["", "", "", "", "", ""]); }}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-2 transition-colors focus:outline-none mx-auto uppercase tracking-widest"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to register
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center sm:block">
            <p className="text-sm text-gray-300">
              Already a member?{" "}
              <Link href="/login" className="font-bold text-white hover:text-blue-400 transition-colors underline underline-offset-4 decoration-blue-500/50">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center relative z-10 pb-10">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Mask Polymers Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </div>

  );
}
