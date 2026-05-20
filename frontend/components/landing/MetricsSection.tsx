"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Target, Clock, Trophy } from "lucide-react";

function useCounter(target: number, duration: number = 1800, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

interface CardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  numericValue: number;
  suffix: string;
  change: string;
  positive: boolean;
  delay: number;
}

function MetricCard({ icon, iconBg, label, numericValue, suffix, change, positive, delay }: CardProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCounter(numericValue, 1800, inView);
  const display = suffix === "%" ? `${count}%` : suffix === " Days" ? `${count} Days` : count.toLocaleString();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="relative group flex items-start gap-4 p-5 rounded-xl dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200 dark:hover:border-[#C6FF00]/30 hover:border-gray-400 transition-all duration-300"
    >
      <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-xs dark:text-gray-400 text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold dark:text-white text-gray-900">{display}</p>
        <p className={`text-xs mt-1 font-medium ${positive ? "dark:text-[#C6FF00] text-green-600" : "dark:text-red-400 text-red-600"}`}>{change} This month</p>
      </div>
    </motion.div>
  );
}

const metrics: CardProps[] = [
  { icon: <Users className="w-5 h-5 text-[#7C6FF7]" />, iconBg: "bg-[#7C3AED]/30", label: "Total Candidates", numericValue: 12450, suffix: "", change: "+24%", positive: true, delay: 0 },
  { icon: <Target className="w-5 h-5 text-[#C6FF00]" />, iconBg: "bg-[#C6FF00]/20", label: "Match Accuracy", numericValue: 94, suffix: "%", change: "+12%", positive: true, delay: 0.1 },
  { icon: <Clock className="w-5 h-5 text-[#60A5FA]" />, iconBg: "bg-[#3B82F6]/20", label: "Time to Hire", numericValue: 15, suffix: " Days", change: "-30%", positive: false, delay: 0.2 },
  { icon: <Trophy className="w-5 h-5 text-[#F59E0B]" />, iconBg: "bg-[#F59E0B]/20", label: "Hiring Success", numericValue: 89, suffix: "%", change: "+18%", positive: true, delay: 0.3 },
];

export function MetricsSection() {
  return (
    <section className="relative py-6 px-4 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl dark:bg-[#0B1020] bg-white border dark:border-white/10 border-gray-200 shadow-sm dark:shadow-[0_0_60px_rgba(124,58,237,0.1)] transition-colors">
          {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>
      </div>
    </section>
  );
}
