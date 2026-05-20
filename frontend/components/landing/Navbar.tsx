"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Zap } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { label: "Product", hasDropdown: true },
  { label: "Features", hasDropdown: false },
  { label: "How It Works", hasDropdown: false },
  { label: "Pricing", hasDropdown: false },
  { label: "Resources", hasDropdown: true },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "dark:bg-[#050816]/80 bg-white/80 backdrop-blur-xl border-b dark:border-white/5 border-gray-200 shadow-sm dark:shadow-[0_4px_60px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-[#C6FF00]/20 blur-md group-hover:bg-[#C6FF00]/40 transition-all duration-300" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#C6FF00] to-[#7C3AED] flex items-center justify-center">
                <Zap className="w-4 h-4 text-black fill-current" />
              </div>
            </div>
            <span className="dark:text-white text-gray-900 font-bold text-lg tracking-tight">
              GenHire <span className="dark:text-[#C6FF00] text-blue-600">AI</span>
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                className="group relative flex items-center gap-1 px-4 py-2 text-sm dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors duration-200"
              >
                {link.label}
                {link.hasDropdown && (
                  <ChevronDown className="w-3.5 h-3.5 dark:text-gray-500 text-gray-400 dark:group-hover:text-gray-300 group-hover:text-gray-600 transition-all duration-200 group-hover:rotate-180" />
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px dark:bg-[#C6FF00] bg-blue-600 group-hover:w-4/5 transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <button className="px-4 py-2 text-sm dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 rounded-lg border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:hover:bg-white/10 hover:bg-gray-100 backdrop-blur-sm transition-all duration-200">
                Login
              </button>
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative px-5 py-2 text-sm font-semibold text-black rounded-lg bg-[#C6FF00] hover:bg-[#d4ff33] transition-all duration-200 shadow-[0_0_20px_rgba(198,255,0,0.3)] hover:shadow-[0_0_30px_rgba(198,255,0,0.5)] flex items-center gap-2"
              >
                Get Started
                <span className="text-xs">→</span>
              </motion.button>
            </Link>
            <button
              className="md:hidden p-2 dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 dark:bg-[#050816]/95 bg-white/95 backdrop-blur-2xl flex flex-col pt-20 px-6"
          >
            <div className="absolute top-4 right-20">
              <ThemeToggle />
            </div>
            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="py-4 text-left text-lg dark:text-gray-300 text-gray-700 border-b dark:border-white/5 border-gray-200 dark:hover:text-white hover:text-gray-900 transition-colors"
              >
                {link.label}
              </motion.button>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/login">
                <button className="w-full py-3 text-sm dark:text-gray-300 text-gray-700 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:hover:bg-white/10 hover:bg-gray-100 transition-colors">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full py-3 text-sm font-bold text-black rounded-xl bg-[#C6FF00] hover:bg-[#d4ff33] transition-colors">
                  Get Started →
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
