"use client";
import React from "react";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { Shield, Target, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";

export default function LandingPage() {
  const { token, user } = useAuthStore();

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/landing-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-125 brightness-110"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:4rem_4rem] opacity-20" />
      </div>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-4 z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="mb-10 flex">
            <div className="px-6 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Engineered Excellence
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-7xl md:text-9xl font-[900] tracking-[-0.04em] leading-[0.85] mb-10 text-slate-900 flex flex-col">
            <span className="uppercase">Engineered </span>
            <span className="text-blue-600 uppercase">Excellence<span className="text-blue-600">.</span></span>
          </h1>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-slate-700 font-bold max-w-2xl leading-relaxed mb-12 drop-shadow-sm">
            A diverse portfolio of high-performance rubber and composite solutions designed for the world&apos;s most demanding automotive environments.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link href={token ? "/dashboard" : "/register"}>
              <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-lg font-black uppercase tracking-widest text-[11px] hover:bg-blue-600 transition-all shadow-sm hover:-translate-y-1">
                {token ? "Go to Dashboard" : "Initiate Application"}
              </button>
            </Link>
            <Link href="/products" className="group flex items-center gap-3 text-slate-900 font-black uppercase tracking-[0.2em] text-[11px] hover:text-blue-600 transition-colors bg-white/50 px-6 py-3 rounded-xl backdrop-blur-sm border border-slate-100">
              Explore Solutions
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-20 border-y border-slate-200/50 bg-white/40 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { title: "Founded 1997", desc: "Decades of mastery in polymer science and technical engineering." },
            { title: "Tier-1 Partner", desc: "Trusted by global automotive giants for zero-defect component delivery." },
            { title: "ISO Certified", desc: "Highest standards in quality management and production precision." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col border-l-2 border-slate-900 pl-8">
              <h3 className="text-sm font-black uppercase tracking-widest mb-3 text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed font-bold">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 text-center border-t border-slate-200/50 bg-white/60 backdrop-blur-sm relative z-10">
        <img src="/logo.png" alt="AI Hiring System" className="h-10 w-auto mx-auto mb-10 contrast-125 hover:scale-110 transition-transform cursor-pointer" />
        <div className="flex justify-center gap-12 mb-12">
          {['Infrastructure', 'Sustainability', 'Research', 'Careers'].map(l => (
            <Link key={l} href="#" className="text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-[0.3em] transition-colors">{l}</Link>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2026 AI Hiring System Pvt. Ltd. • All Rights Reserved</p>
      </footer>
    </main>
  );
}
