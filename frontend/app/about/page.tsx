"use client";
import React from "react";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PremiumBackground } from "@/components/shared/PremiumBackground";
import { Shield, Target, Award, Users, History, Factory } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-4 md:px-8 font-sans">
      <PremiumBackground />
      <PublicNavbar />

      <div className="max-w-6xl mx-auto space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">
            ESTABLISHED 1997
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            ROOTED IN PRECISION.<br />
            <span className="text-blue-600">DRIVEN BY QUALITY.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-lg font-medium">
            For over two decades, AI Hiring System has been at the forefront of the automotive components industry, delivering engineered excellence to global manufacturing leaders.
          </p>
        </div>

        {/* History / Journey Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex p-3 bg-white rounded-lg shadow-xl border border-slate-100">
              <History className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Our Industrial Journey</h2>
            <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
              <p>
                Founded in <span className="text-slate-900 font-bold">1997</span> by pioneers in polymer technology, AI Hiring System began with a clear mission: to bridge the gap between complex engineering requirements and high-performance material solutions.
              </p>
              <p>
                From a single manufacturing unit, we have scaled into a multiple-facility enterprise, specializing in critical automotive sub-systems. Our growth is built on a foundation of ISO-certified processes and a deep understanding of the automotive ecosystem.
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600/10 rounded-lg blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative bg-white border border-slate-200/60 p-8 rounded-lg shadow-sm overflow-hidden aspect-video flex items-center justify-center">
              <Factory className="w-40 h-40 text-slate-100 absolute -bottom-10 -right-10 rotate-12" />
              <div className="text-center space-y-2">
                <span className="block text-6xl font-black text-blue-600">25+</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Years of Engineering Mastery</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Grid */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">The Ai Hiring System Standard</h2>
            <p className="text-slate-400 text-sm mt-2 uppercase tracking-widest font-bold">Four Pillars of Corporate Integrity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Precision", desc: "Every micron matters in high-performance automotive sub-systems." },
              { icon: Target, title: "Innovation", desc: "Constant investment in advanced material science and R&D." },
              { icon: Award, title: "Quality", desc: "Rigorous ISO testing protocols for zero-defect manufacturing." },
              { icon: Users, title: "Synergy", desc: "Long-term partnerships built on transparency and value." }
            ].map((value, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-sm border border-slate-200/60 p-8 rounded-lg hover:bg-white hover:shadow-xl transition-all group">
                <value.icon className="w-6 h-6 text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-black text-slate-900 mb-3 uppercase tracking-wider text-xs">{value.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Global Presence Banner */}
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[100px]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white leading-tight">Trusted by Tier-1 OEM<br /><span className="text-blue-500">Manufacturers Worldwide.</span></h2>
              <p className="text-slate-400 font-medium">Our components power some of the most reliable vehicles on the road today.</p>
            </div>
            <button className="bg-white text-slate-900 px-10 py-4 rounded-lg font-black text-xs tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all">
              View Certifications
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
