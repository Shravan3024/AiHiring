"use client";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BrandLogosSection } from "@/components/landing/BrandLogosSection";

export default function LandingPage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden dark:bg-[#050816] bg-[#F8FAFC] transition-colors duration-300"
    >
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

      {/* Page content */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <MetricsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BrandLogosSection />

        {/* Footer */}
        <footer className="py-10 border-t dark:border-white/5 border-gray-200 text-center transition-colors">
          <p className="text-xs dark:text-gray-600 text-gray-500">
            © 2026 GenHire AI · All Rights Reserved
          </p>
        </footer>
      </div>
    </main>
  );
}
