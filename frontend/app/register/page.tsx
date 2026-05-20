"use client";
import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, ArrowLeft, RefreshCw, UserPlus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";

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
    if (score <= 1) return { score, label: "Weak", color: "bg-red-500 text-red-500" };
    if (score <= 3) return { score, label: "Fair", color: "bg-amber-500 text-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500 text-emerald-500" };
  };

  const strength = passwordStrength(form.password);

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
            <UserPlus className="w-8 h-8 text-[#C6FF00]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white text-gray-900 mb-2 transition-colors">
            {step === "register" ? "Create Account" : "Verify Identity"}
          </h2>
          <p className="text-sm dark:text-gray-400 text-gray-500 font-medium whitespace-pre-line transition-colors">
            {step === "register"
              ? "Join GenHire AI ecosystem."
              : `A 6-digit verification code has been sent to\n${registeredEmail}`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px]"
        >
          <div className="dark:bg-[#0B1020]/80 bg-white/80 backdrop-blur-2xl py-8 px-6 shadow-2xl border dark:border-white/10 border-gray-200 rounded-2xl sm:px-10 transition-colors">

            <AnimatePresence mode="wait">
              {step === "register" ? (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                  onSubmit={handleRegisterSubmit}
                >
                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wider ml-1 transition-colors">
                      Full name
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="Enter Your Name"
                        className="block w-full rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] focus:outline-none sm:text-sm h-12 px-4 transition-all"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wider ml-1 transition-colors">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="Enter Your Email"
                        className="block w-full rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] focus:outline-none sm:text-sm h-12 px-4 transition-all"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
                        required
                        placeholder="••••••••"
                        className="block w-full rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] focus:outline-none sm:text-sm h-12 px-4 pr-10 transition-all"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="mt-2 px-1">
                        <div className="flex gap-1 h-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-all duration-500 ${i <= strength.score ? strength.color.split(' ')[0] : "bg-white/10"}`}
                            />
                          ))}
                        </div>
                        <p className={cn("text-[10px] font-bold mt-1.5 uppercase tracking-wider text-right", strength.color.split(' ')[1])}>
                          {strength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-xs font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wider ml-1 transition-colors">
                      Confirm password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="block w-full rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 placeholder-gray-400 focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] focus:outline-none sm:text-sm h-12 px-4 pr-10 transition-all font-mono"
                        value={form.confirmPassword}
                        onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(s => !s)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="w-full h-12 flex justify-center items-center py-2 px-4 rounded-xl shadow-[0_0_20px_rgba(198,255,0,0.2)] hover:shadow-[0_0_30px_rgba(198,255,0,0.4)] text-sm font-bold text-black bg-[#C6FF00] hover:bg-[#d4ff33] focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {registerMutation.isPending ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div className="flex justify-between gap-2 px-1">
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
                          "w-12 h-14 text-center text-xl font-bold border rounded-xl transition-all outline-none",
                          digit
                            ? "border-[#C6FF00] dark:bg-[#C6FF00]/10 bg-lime-50 text-lime-600 dark:text-[#C6FF00]"
                            : "dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00]"
                        )}
                      />
                    ))}
                  </div>

                  <div className="pt-2 flex flex-col gap-4">
                    <button
                      className="w-full h-12 flex justify-center items-center py-2 px-4 rounded-xl shadow-[0_0_20px_rgba(198,255,0,0.2)] hover:shadow-[0_0_30px_rgba(198,255,0,0.4)] text-sm font-bold text-black bg-[#C6FF00] hover:bg-[#d4ff33] focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                      onClick={() => { setError(""); verifyMutation.mutate(); }}
                      disabled={otp.some(d => !d) || verifyMutation.isPending}
                    >
                      {verifyMutation.isPending ? "VERIFYING..." : "VERIFY CODE"}
                    </button>

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
                          className="text-xs font-bold text-[#C6FF00] hover:text-[#d4ff33] flex items-center gap-2 mx-auto transition-colors focus:outline-none uppercase tracking-widest"
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5", resendMutation.isPending && "animate-spin")} />
                          {resendMutation.isPending ? "Sending..." : "Resend Code"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => { setStep("register"); setError(""); setOtp(["", "", "", "", "", ""]); }}
                      className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2 transition-colors focus:outline-none mx-auto uppercase tracking-widest"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to register
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {step === "register" && (
              <div className="mt-6 text-center">
                <p className="text-sm dark:text-gray-400 text-gray-500 transition-colors">
                  Already a member?{" "}
                  <Link href="/login" className="font-bold text-[#C6FF00] hover:text-[#d4ff33] transition-colors">
                    Log in here
                  </Link>
                </p>
              </div>
            )}
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
