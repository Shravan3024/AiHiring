"use client";
import { motion } from "framer-motion";
import { FileText, Users, MessageSquare, BarChart2, UserCheck, Zap } from "lucide-react";

const MiniLineChart = ({ color }: { color: string }) => {
  const points = [30, 45, 35, 55, 40, 60, 50, 70, 55, 75];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 160; const h = 50;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / (max - min)) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12 mt-auto" preserveAspectRatio="none">
      <polyline points={coords} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${coords} ${w},${h}`} fill={`url(#grad-${color.replace("#","")})`} stroke="none" />
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const BarChart = ({ color }: { color: string }) => {
  const bars = [4, 7, 5, 9, 6, 8, 5, 10, 7, 9, 6, 11];
  return (
    <div className="flex items-end gap-1 mt-auto h-12">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          style={{ height: `${h * 4}px`, backgroundColor: color, originY: 1 }}
          className="flex-1 rounded-t-sm opacity-80"
        />
      ))}
    </div>
  );
};

const AvatarRow = () => (
  <div className="flex items-center gap-1 mt-auto">
    {["👩‍💼", "👨‍💼", "👩‍💻", "👨‍💻"].map((e, i) => (
      <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#C6FF00] flex items-center justify-center text-sm border-2 dark:border-[#111827] border-white transition-colors">
        <Users className="w-4 h-4 text-white" />
      </div>
    ))}
  </div>
);

const features = [
  {
    icon: <FileText className="w-5 h-5 text-[#7C6FF7]" />,
    iconBg: "bg-[#7C3AED]/30",
    title: "AI Resume Screening",
    desc: "Automatically screen and shortlist the best candidates.",
    visual: <MiniLineChart color="#7C3AED" />,
    col: "lg:col-span-1",
  },
  {
    icon: <Users className="w-5 h-5 text-[#C6FF00]" />,
    iconBg: "bg-[#C6FF00]/20",
    title: "Smart Candidate Matching",
    desc: "Advanced AI matches talent with the perfect roles.",
    visual: <AvatarRow />,
    col: "lg:col-span-1",
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-[#60A5FA]" />,
    iconBg: "bg-[#3B82F6]/20",
    title: "AI Interview Assistant",
    desc: "Real-time insights and smart interview recommendations.",
    visual: <MiniLineChart color="#60A5FA" />,
    badge: "92%",
    col: "lg:col-span-1",
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-[#C6FF00]" />,
    iconBg: "bg-[#C6FF00]/20",
    title: "Hiring Analytics",
    desc: "Powerful dashboards and reports for better decisions.",
    visual: <BarChart color="#C6FF00" />,
    col: "lg:col-span-1",
  },
  {
    icon: <UserCheck className="w-5 h-5 text-[#C6FF00]" />,
    iconBg: "bg-[#C6FF00]/20",
    title: "Collaborative Hiring",
    desc: "Work together with your team seamlessly.",
    visual: <AvatarRow />,
    col: "lg:col-span-1",
  },
  {
    icon: <Zap className="w-5 h-5 text-[#C6FF00]" />,
    iconBg: "bg-[#C6FF00]/20",
    title: "Automated Workflows",
    desc: "Automate repetitive tasks and save valuable time.",
    visual: <MiniLineChart color="#C6FF00" />,
    col: "lg:col-span-1",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-20 px-4 z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 transition-colors">
            Everything you need to build exceptional teams
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col p-5 rounded-2xl dark:bg-[#0D1117] bg-white border dark:border-white/10 border-gray-200 shadow-sm hover:shadow-md dark:hover:border-[#C6FF00]/30 hover:border-[#C6FF00]/50 min-h-[220px] overflow-hidden transition-all duration-300"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br dark:from-[#C6FF00]/3 from-[#C6FF00]/5 to-transparent pointer-events-none" />

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.iconBg}`}>{f.icon}</div>

              {/* Text */}
              <h3 className="text-base font-semibold dark:text-white text-gray-900 mb-2 transition-colors">{f.title}</h3>
              <p className="text-sm dark:text-gray-400 text-gray-600 leading-relaxed mb-4 transition-colors">{f.desc}</p>

              {/* Badge */}
              {f.badge && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-md bg-[#C6FF00]/20 text-[#C6FF00] text-xs font-bold">
                  {f.badge}
                </div>
              )}

              {/* Visual */}
              <div className="mt-auto">{f.visual}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
