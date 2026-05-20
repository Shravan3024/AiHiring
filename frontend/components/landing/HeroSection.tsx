"use client";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const avatarColors = ["#7C3AED", "#C6FF00", "#3B82F6", "#F59E0B", "#EC4899"];

function FloatingCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute backdrop-blur-xl dark:bg-black/40 bg-white/80 border dark:border-white/10 border-gray-200/50 shadow-2xl transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Full-bleed hero image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-genhire.png"
          alt="GenHire AI futuristic hiring dashboard"
          fill
          priority
          className="object-cover object-center"
          quality={90}
        />
        {/* Strong left gradient to prevent text bleed-through */}
        <div className="absolute inset-0 dark:bg-gradient-to-r dark:from-[#050816] dark:from-30% dark:via-[#050816]/90 dark:via-55% dark:to-[#050816]/10 bg-gradient-to-r from-[#F8FAFC] from-30% via-[#F8FAFC]/90 via-55% to-[#F8FAFC]/10 transition-colors duration-300" />
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 dark:bg-gradient-to-b dark:from-[#050816] dark:to-transparent bg-gradient-to-b from-[#F8FAFC] to-transparent transition-colors duration-300" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 dark:bg-gradient-to-t dark:from-[#050816] dark:to-transparent bg-gradient-to-t from-[#F8FAFC] to-transparent transition-colors duration-300" />
        {/* Subtle purple ambient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="max-w-xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border dark:border-[#C6FF00]/40 border-blue-200 dark:bg-[#C6FF00]/10 bg-blue-50 mb-8 transition-colors"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full dark:bg-[#C6FF00] bg-blue-600"
            />
            <span className="dark:text-[#C6FF00] text-blue-600 text-xs font-bold tracking-widest uppercase transition-colors">
              AI-Powered Recruitment Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            <span className="dark:text-white text-[#0F172A] block transition-colors">Hire the right</span>
            <span className="dark:text-white text-[#0F172A] block transition-colors">people.</span>
            <span className="block">
              <span className="dark:text-[#C6FF00] text-blue-600 transition-colors">10x</span>
              <span className="dark:text-white text-[#0F172A] transition-colors"> faster with </span>
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] bg-clip-text text-transparent">AI</span>
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="dark:text-gray-400 text-gray-600 text-lg leading-relaxed mb-10 max-w-md transition-colors"
          >
            GenHire AI automates every step of your hiring journey — from intelligent screening to final selection.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(198,255,0,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#C6FF00] text-black font-bold text-base shadow-[0_0_25px_rgba(198,255,0,0.3)] hover:bg-[#d4ff33] transition-all duration-200"
              >
                Start Hiring <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/careers">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border dark:border-white/20 border-gray-300 dark:bg-white/5 bg-white/50 backdrop-blur-sm dark:text-white text-gray-700 font-semibold text-base dark:hover:bg-white/10 hover:bg-gray-100 hover:border-gray-400 dark:hover:border-white/40 transition-all duration-200"
              >
                <Briefcase className="w-4 h-4" /> Find a Job
              </motion.button>
            </Link>
          </motion.div>

          {/* Trusted by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {avatarColors.map((color, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                  className="w-8 h-8 rounded-full border-2 dark:border-[#050816] border-[#F8FAFC] flex items-center justify-center text-xs font-bold text-white transition-colors"
                  style={{ backgroundColor: color }}
                >
                  {String.fromCharCode(65 + i)}
                </motion.div>
              ))}
            </div>
            <p className="text-sm dark:text-gray-400 text-gray-500 transition-colors">
              Trusted by <span className="dark:text-white text-gray-900 font-semibold">500+</span> innovative companies worldwide
            </p>
          </motion.div>
        </div>
      </div>

      {/* Floating dashboard mini-card (top right area) */}
      <FloatingCard
        className="hidden lg:block top-28 right-[4%] p-4 w-60 rounded-2xl"
        delay={0}
      >
        <p className="text-xs dark:text-gray-400 text-gray-500 mb-2 font-medium">Hiring Dashboard</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Total Candidates", val: "12,450", color: "#C6FF00", lightColor: "#65a30d" },
            { label: "Match Accuracy", val: "94%", color: "#7C6FF7", lightColor: "#6366f1" },
            { label: "Time to Hire", val: "15 Days", color: "#60A5FA", lightColor: "#3b82f6" },
            { label: "Hiring Success", val: "89%", color: "#F59E0B", lightColor: "#d97706" },
          ].map((item) => (
            <div key={item.label} className="dark:bg-white/5 bg-gray-50/80 rounded-lg p-2 border dark:border-white/5 border-gray-100 transition-colors">
              <p className="text-[10px] dark:text-gray-500 text-gray-500 mb-0.5">{item.label}</p>
              <p className="text-sm font-bold dark:text-white text-gray-900" style={{ color: "inherit" }}>
                <span className="dark:hidden" style={{ color: item.lightColor }}>{item.val}</span>
                <span className="hidden dark:inline" style={{ color: item.color }}>{item.val}</span>
              </p>
            </div>
          ))}
        </div>
      </FloatingCard>
    </section>
  );
}
