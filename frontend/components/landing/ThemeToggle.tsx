"use client";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-[60px] h-8" />; // Placeholder to prevent layout shift

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-between w-[64px] h-8 p-1 rounded-full border border-white/10 dark:bg-white/5 bg-gray-100/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 dark:hover:border-white/30 group shadow-inner"
      aria-label="Toggle theme"
    >
      <div className="flex w-full justify-between items-center px-1.5 z-10">
        <Sun
          className={`w-3.5 h-3.5 transition-colors duration-300 ${
            !isDark ? "text-amber-500" : "text-gray-500 group-hover:text-gray-300"
          }`}
        />
        <Moon
          className={`w-3.5 h-3.5 transition-colors duration-300 ${
            isDark ? "text-indigo-400" : "text-gray-400 group-hover:text-gray-600"
          }`}
        />
      </div>

      <motion.div
        className={`absolute top-1 bottom-1 w-[26px] rounded-full shadow-md z-0 flex items-center justify-center ${
          isDark ? "bg-[#0B1020] border border-white/10 shadow-[0_0_10px_rgba(124,58,237,0.3)]" : "bg-white border border-gray-200"
        }`}
        initial={false}
        animate={{
          left: isDark ? "34px" : "4px",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      />
    </button>
  );
}
