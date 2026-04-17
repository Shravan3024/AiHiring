"use client";
import React from "react";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PremiumBackground } from "@/components/shared/PremiumBackground";
import { Box, Layers, Settings, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";

export default function ProductsPage() {
  const categories = [
    {
      title: "Sealing Solutions",
      products: ["O-Rings", "Gaskets", "Oil Seals", "Mechanical Seals"]
    },
    {
      title: "Flow & Conveyance",
      products: ["Radiator Hoses", "Fuel Lines", "Hydraulic Hoses", "Air Intake Hoses"]
    },
    {
      title: "NVH & Protection",
      products: ["Bellows", "Anti-Vibration Mounts", "Dampers", "Grommets"]
    },
    {
      title: "Precision Engineering",
      products: ["Rubber to Metal Bonded Parts", "Diaphragms", "Custom Molded Parts", "Extruded Profiles"]
    }
  ];

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 md:px-8 font-sans">
      <PremiumBackground />
      <PublicNavbar />

      <div className="max-w-7xl mx-auto space-y-24">
        {/* Product Catalog Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">
                ENGINEERED EXCELLENCE
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.85]">
                PRECISION<br />
                <span className="text-blue-600">POLYMERS.</span>
              </h1>
              <p className="max-w-md text-slate-500 text-lg font-medium leading-relaxed">
                A diverse portfolio of high-performance rubber and composite solutions designed for the world's most demanding automotive environments.
              </p>
              <div className="flex items-center gap-6 pt-4">
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900">16+</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Cycles</span>
                 </div>
                 <div className="w-px h-10 bg-slate-200" />
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900">500+</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Clients</span>
                 </div>
              </div>
           </div>

           <div className="relative group">
              <div className="absolute inset-0 bg-blue-600/20 rounded-[3rem] blur-[120px] animate-pulse" />
              <div className="relative bg-white/40 backdrop-blur-md border border-white/20 p-2 rounded-[3.5rem] shadow-2xl overflow-hidden transition-transform duration-700 group-hover:scale-[1.02]">
                 <img 
                    src="/products-collage.png" 
                    alt="Product Catalog Collage" 
                    className="w-full h-auto rounded-[3rem] shadow-inner"
                 />
              </div>
           </div>
        </section>

        {/* Categories Grid */}
        <section className="space-y-16">
           <div className="flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="space-y-3">
                 <h2 className="text-4xl font-black tracking-tight text-slate-900">Catalogue Architecture</h2>
                 <p className="text-slate-400 text-[11px] uppercase tracking-[0.3em] font-black">Segmented by Industrial Application</p>
              </div>
              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-200/60">
                 <ShieldCheck className="w-5 h-5 text-emerald-500" />
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">OEM Quality Guaranteed</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((cat, idx) => (
                <div key={idx} className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-10 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 group">
                   <div className="flex items-center justify-between mb-8">
                      <div className="p-3 bg-slate-900 rounded-2xl text-white group-hover:bg-blue-600 transition-colors">
                        <Box className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">0{idx + 1}</span>
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{cat.title}</h3>
                   <div className="grid grid-cols-1 gap-4">
                      {cat.products.map((product, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 group/item">
                           <div className="w-1 h-1 rounded-full bg-blue-600 group-hover/item:scale-[2] transition-transform" />
                           <span className="text-sm font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors">{product}</span>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Custom Solution CTA */}
        <section className="bg-blue-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
           <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
           <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight max-w-3xl lowercase">
                Need a bespoke <span className="uppercase">polymer</span> solution for your next project?
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-6">
                 <button className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-blue-900/10">
                    Request Technical Datasheet
                 </button>
                 <button className="bg-blue-700/50 text-white border border-blue-400/30 px-10 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-white hover:text-blue-600 transition-all">
                    Consult Engineering Team
                 </button>
              </div>
           </div>
        </section>
      </div>
    </main>
  );
}
