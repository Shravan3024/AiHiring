"use client";
import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Briefcase, TrendingUp, Cpu, Globe, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
   const benefits = [
      { icon: TrendingUp, title: "Career Velocity", desc: "Structured growth pathways in automotive engineering and supply chain." },
      { icon: Cpu, title: "Tech-First Culture", desc: "Work with advanced polymer labs and AI-driven manufacturing tools." },
      { icon: Globe, title: "Global Exposure", desc: "Collaborate with Tier-1 OEMs and international industrial partners." },
      { icon: ShieldCheck, title: "Secure Tenure", desc: "Join a stable, growing enterprise with over 25 years of legacy." }
   ];

   return (
      <main className="min-h-screen overflow-x-hidden dark:bg-[#050816] bg-[#F8FAFC] transition-colors duration-300 font-sans">
         {/* Radial ambient glow */}
         <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
               background:
                  "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(198,255,0,0.04) 0%, transparent 60%)",
            }}
         />

         {/* Subtle grid texture */}
         <div
            className="fixed inset-0 pointer-events-none z-0 opacity-30"
            style={{
               backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
               backgroundSize: "60px 60px",
            }}
         />

         <div className="relative z-10">
            <Navbar />

            <div className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-32">
               {/* Careers Hero */}
               <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center space-y-8"
               >
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.2, duration: 0.5 }}
                     className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full dark:bg-[#C6FF00]/10 bg-blue-50 dark:border-[#C6FF00]/20 border-blue-100 text-[10px] font-black tracking-[0.2em] dark:text-[#C6FF00] text-blue-600 uppercase"
                  >
                     <Briefcase className="w-3.5 h-3.5" /> Join the Elite
                  </motion.div>
                  
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter dark:text-white text-slate-900 leading-[0.85]">
                     FUTURE-PROOF<br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r dark:from-[#C6FF00] dark:to-[#7C3AED] from-blue-600 to-indigo-600">
                        YOUR CAREER.
                     </span>
                  </h1>
                  
                  <p className="max-w-2xl mx-auto dark:text-gray-400 text-slate-500 text-lg font-medium">
                     We are looking for visionary engineers, meticulous quality analysts, and strategic leaders to power the next generation of automotive innovation.
                  </p>
                  
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4, duration: 0.5 }}
                     className="pt-8"
                  >
                     <Link href="/register">
                        <button className="relative px-12 py-5 font-black text-xs tracking-[0.2em] uppercase dark:text-black text-white rounded-xl dark:bg-[#C6FF00] bg-slate-900 dark:hover:bg-[#d4ff33] hover:bg-blue-600 transition-all duration-300 dark:shadow-[0_0_20px_rgba(198,255,0,0.3)] dark:hover:shadow-[0_0_40px_rgba(198,255,0,0.5)] shadow-xl shadow-slate-200/50 hover:shadow-blue-500/30 active:scale-95 group">
                           Join Our Talent Pool 
                           <ArrowRight className="inline-block ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                     </Link>
                  </motion.div>
               </motion.div>

               {/* Benefits Section */}
               <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {benefits.map((benefit, i) => (
                     <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        key={i} 
                        className="dark:bg-white/5 bg-white/80 backdrop-blur-xl border dark:border-white/10 border-slate-200/60 p-8 rounded-2xl hover:-translate-y-2 dark:hover:bg-white/10 hover:bg-white hover:shadow-2xl dark:hover:shadow-[0_10px_40px_rgba(124,58,237,0.15)] hover:shadow-slate-200 transition-all duration-300 group"
                     >
                        <div className="p-3 dark:bg-[#C6FF00]/10 bg-blue-50 dark:text-[#C6FF00] text-blue-600 rounded-xl inline-block mb-6 dark:group-hover:bg-[#C6FF00] dark:group-hover:text-black group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                           <benefit.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black dark:text-white text-slate-900 mb-3 uppercase tracking-widest">{benefit.title}</h3>
                        <p className="dark:text-gray-400 text-slate-500 text-sm leading-relaxed font-medium">{benefit.desc}</p>
                     </motion.div>
                  ))}
               </section>

               {/* Culture Statement */}
               <motion.section 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="dark:bg-white/[0.02] bg-white/40 backdrop-blur-xl border dark:border-white/10 border-slate-200/60 rounded-[3rem] p-10 md:p-20 overflow-hidden relative shadow-sm"
               >
                  <div className="absolute -top-24 -right-24 w-96 h-96 dark:bg-[#7C3AED]/20 bg-blue-600/10 rounded-full blur-[100px]" />
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 dark:bg-[#C6FF00]/10 bg-transparent rounded-full blur-[100px]" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center relative z-10">
                     <div className="lg:col-span-3 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight dark:text-white text-slate-900">
                           Life at GenHire AI
                        </h2>
                        <div className="space-y-6 dark:text-gray-400 text-slate-600 font-medium leading-relaxed text-lg">
                           <p>We don't just process candidates; we build AI-driven paradigms for talent acquisition. Our team is a synergy of experienced veterans and young innovators, all working toward an equitable hiring future.</p>
                           <p>We foster a culture of transparency, continuous learning, and technical ownership. From industrial training to leadership mentorship, we ensure our personnel are always at the cutting edge of AI technology.</p>
                        </div>
                     </div>
                     <div className="lg:col-span-2 dark:bg-[#0A0F24]/80 bg-slate-900 backdrop-blur-md border dark:border-white/10 border-transparent rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl">
                        <div className="w-16 h-16 dark:bg-[#C6FF00]/20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                           <Mail className="w-8 h-8 dark:text-[#C6FF00] text-blue-400" />
                        </div>
                        <h4 className="text-white text-xl font-black uppercase tracking-wide">Direct HR Channel</h4>
                        <p className="dark:text-gray-400 text-slate-400 text-sm font-medium leading-relaxed">
                           Have a specific role in mind or want to discuss a customized career path? Connect with our talent acquisition team directly.
                        </p>
                        <div className="pt-4">
                           <a href="mailto:hr@genhire.ai" className="dark:text-[#C6FF00] text-blue-400 dark:hover:text-white hover:text-blue-300 font-black text-xs tracking-[0.2em] uppercase transition-colors">
                              hr@genhire.ai
                           </a>
                        </div>
                     </div>
                  </div>
               </motion.section>

               {/* Footer */}
               <footer className="pt-20 pb-10 border-t dark:border-white/5 border-gray-200 text-center transition-colors">
                  <p className="text-xs dark:text-gray-600 text-gray-500 font-semibold tracking-widest uppercase">
                     © 2026 GenHire AI · All Rights Reserved
                  </p>
               </footer>
            </div>
         </div>
      </main>
   );
}
