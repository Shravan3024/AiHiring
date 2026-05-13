"use client";
import React from "react";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PremiumBackground } from "@/components/shared/PremiumBackground";
import { Briefcase, TrendingUp, Cpu, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
   const benefits = [
      { icon: TrendingUp, title: "Career Velocity", desc: "Structured growth pathways in automotive engineering and supply chain." },
      { icon: Cpu, title: "Tech-First Culture", desc: "Work with advanced polymer labs and AI-driven manufacturing tools." },
      { icon: Globe, title: "Global Exposure", desc: "Collaborate with Tier-1 OEMs and international industrial partners." },
      { icon: Briefcase, title: "Secure Tenure", desc: "Join a stable, growing enterprise with over 25 years of legacy." }
   ];

   return (
      <main className="min-h-screen pt-32 pb-20 px-4 md:px-8 font-sans">
         <PremiumBackground />
         <PublicNavbar />

         <div className="max-w-6xl mx-auto space-y-24">
            {/* Careers Hero */}
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">
                  Join the Elite
               </div>
               <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.85]">
                  FUTURE-PROOF<br />
                  <span className="text-blue-600">YOUR CAREER.</span>
               </h1>
               <p className="max-w-2xl mx-auto text-slate-500 text-lg font-medium">
                  We are looking for visionary engineers, meticulous quality analysts, and strategic leaders to power the next generation of automotive innovation.
               </p>
               <div className="pt-8">
                  <Link href="/register">
                     <button className="bg-slate-900 text-white px-12 py-5 rounded-lg font-black text-xs tracking-[0.2em] uppercase hover:bg-blue-600 transition-all shadow-sm shadow-slate-200 hover:shadow-blue-200 active:scale-95 group">
                        Join Our Talent Pool <ArrowRight className="inline-block ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </button>
                  </Link>
               </div>
            </div>

            {/* Benefits Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {benefits.map((benefit, i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-10 rounded-lg hover:bg-white hover:shadow-xl transition-all group">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-lg inline-block mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <benefit.icon className="w-6 h-6" />
                     </div>
                     <h3 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">{benefit.title}</h3>
                     <p className="text-slate-500 text-sm leading-relaxed font-medium">{benefit.desc}</p>
                  </div>
               ))}
            </section>

            {/* Culture Statement */}
            <section className="bg-white/40 backdrop-blur-md border border-white/20 rounded-[4rem] p-12 md:p-20 overflow-hidden relative">
               <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]" />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                  <div className="space-y-8">
                     <h2 className="text-4xl font-black tracking-tight text-slate-900">Life at AI Hiring System</h2>
                     <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
                        <p>At AI Hiring System, we don't just manufacture components; we solve complex engineering challenges. Our team is a synergy of experienced veterans and young innovators, all working toward zero-defect excellence.</p>
                        <p>We foster a culture of transparency, continuous learning, and technical ownership. From industrial training to leadership mentorship, we ensure our personnel are always at the cutting edge of industry technology.</p>
                     </div>
                  </div>
                  <div className="bg-slate-900 rounded-[3rem] p-12 text-center space-y-6 shadow-sm">
                     <h4 className="text-white text-xl font-black">Direct HR Channel</h4>
                     <p className="text-slate-400 text-sm font-medium leading-relaxed">Have a specific role in mind or want to discuss a customized career path? Connect with our talent acquisition team directly.</p>
                     <div className="pt-4">
                        <a href="mailto:hr@AI HIRING SYSTEM.com" className="text-blue-400 hover:text-blue-300 font-black text-xs tracking-widest uppercase underline underline-offset-8">hr@AI HIRING SYSTEM.com</a>
                     </div>
                  </div>
               </div>
            </section>
         </div>
      </main>
   );
}
