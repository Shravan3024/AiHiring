"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const PublicNavbar: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: "PRODUCTS", href: "/products" },
    { name: "ABOUT", href: "/about" },
    { name: "CAREERS", href: "/careers" },
    { name: "CONTACT", href: "/contact" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative p-1.5 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
                <img
                  src="/logo.png"
                  alt="AI Hiring System"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">
                AI HIRING<span className="text-blue-600 group-hover:text-slate-900"> SYSTEM</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[11px] font-black tracking-[0.2em] uppercase transition-all hover:text-blue-600 relative py-1 ${isActive(link.href)
                  ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full"
                  : "text-slate-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-right hover:after:origin-left"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[11px] font-black tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors">
              LOGIN
            </Link>
            <Link href="/register">
              <button className="bg-slate-900 text-white px-7 py-3 rounded-xl text-[11px] font-black tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 hover:shadow-blue-200 active:scale-95">
                REGISTER
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
