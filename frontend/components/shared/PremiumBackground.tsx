"use client";
import React from "react";

export const PremiumBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#f8fafc]">
      {/* Precision Industrial Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[55%] h-[55%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "3s" }} />
      
      {/* Dynamic Mechanical Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #0F172A 1px, transparent 1px),
            linear-gradient(to bottom, #0F172A 1px, transparent 1px)
          `, 
          backgroundSize: "60px 60px" 
        }} 
      />
      
      {/* Sub-grid for precision texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #0F172A 1px, transparent 1px),
            linear-gradient(to bottom, #0F172A 1px, transparent 1px)
          `, 
          backgroundSize: "12px 12px" 
        }} 
      />
      
      {/* Radial depth layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_transparent_0%,_#f8fafc_90%)]" />
    </div>
  );
};
