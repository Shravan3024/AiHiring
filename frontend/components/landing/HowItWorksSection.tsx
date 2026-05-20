"use client";
import { motion } from "framer-motion";
import { Upload, Cpu, Video, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <Upload className="w-6 h-6 text-[#7C6FF7]" />,
    iconBg: "from-[#7C3AED] to-[#4F46E5]",
    glow: "rgba(124,58,237,0.4)",
    num: "1",
    title: "Upload Resume",
    desc: "Upload or import resumes from any source.",
  },
  {
    icon: <Cpu className="w-6 h-6 text-[#C6FF00]" />,
    iconBg: "from-[#2D4A1E] to-[#3D6B28]",
    glow: "rgba(198,255,0,0.3)",
    num: "2",
    title: "AI Screening",
    desc: "AI analyzes, ranks and shortlists the best.",
  },
  {
    icon: <Video className="w-6 h-6 text-[#7C6FF7]" />,
    iconBg: "from-[#7C3AED] to-[#4F46E5]",
    glow: "rgba(124,58,237,0.4)",
    num: "3",
    title: "AI Interviews",
    desc: "Assess candidates with AI-powered interviews.",
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-[#C6FF00]" />,
    iconBg: "from-[#2D4A1E] to-[#3D6B28]",
    glow: "rgba(198,255,0,0.3)",
    num: "4",
    title: "Smart Hiring",
    desc: "Review insights and hire the right candidate.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-20 px-4 z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 transition-colors">How GenHire AI works</h2>
        </motion.div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
          {/* Connecting wave line — desktop only */}
          <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] -translate-y-1/2 h-px z-0">
            <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 20">
              <motion.path
                d="M0,10 C100,0 150,20 200,10 C250,0 300,20 350,10 C400,0 450,20 500,10 C550,0 570,20 600,10"
                fill="none"
                stroke="url(#waveGrad)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="50%" stopColor="#C6FF00" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative z-10 flex flex-col items-center text-center w-full md:w-48"
            >
              {/* Glowing circle */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                className="relative mb-4"
              >
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full blur-xl dark:opacity-100 opacity-60 transition-opacity"
                  style={{ background: step.glow, transform: "scale(1.5)" }}
                />
                {/* Ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 dark:border-white/10 border-gray-200 transition-colors"
                  style={{ transform: "scale(1.15)" }}
                />
                {/* Main circle */}
                <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${step.iconBg} flex items-center justify-center shadow-xl`}>
                  {step.icon}
                </div>
              </motion.div>

              {/* Step number badge */}
              <div className="mb-3 px-3 py-1 rounded-full dark:bg-white/10 bg-gray-100 dark:text-gray-300 text-gray-600 text-xs font-bold border dark:border-white/10 border-gray-200 transition-colors">
                {step.num}
              </div>
              <h3 className="dark:text-white text-gray-900 font-semibold text-base mb-1 transition-colors">{step.title}</h3>
              <p className="dark:text-gray-400 text-gray-500 text-sm leading-relaxed transition-colors">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
