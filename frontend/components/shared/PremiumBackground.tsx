"use client";
import React from "react";

export const PremiumBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#f8f9ff]">
      {/* Stitch Industrial Ambient Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[55%] h-[55%] bg-[#003b9a]/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#0050cb]/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "3s" }} />
      
      {/* Industrial Dot Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, #003b9a 1px, transparent 0)`,
          backgroundSize: "24px 24px" 
        }} 
      />
      
      {/* Sub-grid for precision texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #003b9a 1px, transparent 1px),
            linear-gradient(to bottom, #003b9a 1px, transparent 1px)
          `, 
          backgroundSize: "12px 12px" 
        }} 
      />
      
      {/* Radial depth layer — Stitch atmospheric overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_transparent_0%,_#f8f9ff_90%)]" />
    </div>
  );
};
