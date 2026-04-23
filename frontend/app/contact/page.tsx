"use client";
import React, { useState } from "react";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PremiumBackground } from "@/components/shared/PremiumBackground";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
   const [loading, setLoading] = useState(false);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => {
         setLoading(false);
         toast.success("Message received. Our relevant department will contact you within 24 hours.");
      }, 1500);
   };

   const departments = [
      { name: "MARKETING & SALES", email: "marketing@maskpolymers.com", phone: "Enter Your Phone Number" },
      { name: "PURCHASE & VENDORS", email: "purchase@maskpolymers.com", phone: "+91 98765 43211" },
      { name: "HUMAN RESOURCES", email: "hr@maskpolymers.com", phone: "+91 98765 43212" },
      { name: "FINANCE", email: "finance@maskpolymers.com", phone: "+91 98765 43213" }
   ];

   return (
      <main className="min-h-screen pt-32 pb-20 px-4 md:px-8 font-sans">
         <PremiumBackground />
         <PublicNavbar />

         <div className="max-w-7xl mx-auto space-y-24">
            {/* Contact Hero */}
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">
                  Operational Symmetry
               </div>
               <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.85]">
                  SYNC WITH<br />
                  <span className="text-blue-600">OUR TEAMS.</span>
               </h1>
               <p className="max-w-xl mx-auto text-slate-500 text-lg font-medium">
                  Connecting departmental expertise for seamless industrial collaboration. Choose a specialized node below or send a general inquiry.
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               {/* Dept List */}
               <div className="lg:col-span-1 space-y-6">
                  {departments.map((dept, i) => (
                     <div key={i} className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-8 rounded-[2rem] hover:bg-white transition-all shadow-sm">
                        <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-4">{dept.name}</h3>
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-bold text-slate-700">{dept.email}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-bold text-slate-500">{dept.phone}</span>
                           </div>
                        </div>
                     </div>
                  ))}

                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                     <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <MapPin className="w-5 h-5 text-blue-500" />
                           <span className="text-[10px] font-black tracking-[0.2em] uppercase">Headquarters</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-300">
                           Mask Polymers Industrial Hub,<br />
                           Engineering Zone IV, Pune,<br />
                           Maharashtra - 411044, India
                        </p>
                     </div>
                     <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  </div>
               </div>

               {/* Contact Form */}
               <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]" />

                  <div className="relative z-10 space-y-12">
                     <div className="space-y-4">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">General Inquiry Core</h2>
                        <p className="text-slate-500 font-medium">Please provide your technical requirements or corporate details.</p>
                     </div>

                     <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                              <input required className="w-full bg-white/50 border border-slate-200/60 h-14 rounded-2xl px-6 font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-0 transition-all outline-none" placeholder="Organization or Name" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Protocol</label>
                              <input required type="email" className="w-full bg-white/50 border border-slate-200/60 h-14 rounded-2xl px-6 font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-0 transition-all outline-none" placeholder="Email Address" />
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry Parameters</label>
                           <textarea required rows={5} className="w-full bg-white/50 border border-slate-200/60 rounded-3xl p-6 font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-0 transition-all outline-none resize-none" placeholder="Describe your requirement or message..." />
                        </div>

                        <button disabled={loading} type="submit" className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 hover:shadow-blue-200 active:scale-95 group">
                           {loading ? "Transmitting..." : (
                              <span className="flex items-center gap-3">
                                 Transmit Information <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                              </span>
                           )}
                        </button>
                     </form>
                  </div>
               </div>
            </div>
         </div>
      </main>
   );
}
