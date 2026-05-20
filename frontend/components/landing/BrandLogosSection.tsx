"use client";
import { motion } from "framer-motion";

/* ─── Brand definitions ─────────────────────────────────────── */
const brands = [
  {
    name: "Google",
    element: (
      <span className="text-2xl font-bold tracking-tight select-none">
        <span style={{ color: "#4285F4" }}>G</span>
        <span style={{ color: "#EA4335" }}>o</span>
        <span style={{ color: "#FBBC05" }}>o</span>
        <span style={{ color: "#4285F4" }}>g</span>
        <span style={{ color: "#34A853" }}>l</span>
        <span style={{ color: "#EA4335" }}>e</span>
      </span>
    ),
  },
  {
    name: "Microsoft",
    element: (
      <div className="flex items-center gap-2 select-none">
        <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden>
          <rect x="1"  y="1"  width="9" height="9" fill="#F25022" />
          <rect x="11" y="1"  width="9" height="9" fill="#7FBA00" />
          <rect x="1"  y="11" width="9" height="9" fill="#00A4EF" />
          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
        <span className="text-base font-semibold dark:text-white/80 text-gray-700 transition-colors">Microsoft</span>
      </div>
    ),
  },
  {
    name: "Airbnb",
    element: (
      <div className="flex items-center gap-2 select-none">
        <svg width="22" height="22" viewBox="0 0 34 34" fill="#FF5A5F" aria-hidden>
          <path d="M17 2C8.7 2 2 8.7 2 17s6.7 15 15 15 15-6.7 15-15S25.3 2 17 2zm0 22c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z" />
        </svg>
        <span className="text-xl font-bold dark:text-white/80 text-gray-700 transition-colors" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>airbnb</span>
      </div>
    ),
  },
  {
    name: "Amazon",
    element: (
      <div className="flex flex-col items-start select-none leading-none">
        <span className="text-xl font-bold tracking-tighter dark:text-white/80 text-gray-700 transition-colors">amazon</span>
        <svg viewBox="0 0 120 18" width="88" height="12" aria-hidden>
          <path
            d="M8 6 Q60 18 112 6"
            stroke="#FF9900"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <polygon points="108,3 113,6 107,8" fill="#FF9900" />
        </svg>
      </div>
    ),
  },
  {
    name: "Notion",
    element: (
      <div className="flex items-center gap-2 select-none">
        <svg width="22" height="22" viewBox="0 0 100 100" aria-hidden>
          <rect width="100" height="100" rx="18" className="dark:fill-white fill-[#1a1a1a] transition-colors" />
          <path d="M27 22h46l4 6v50l-4 4H27l-4-4V28l4-6z" className="dark:fill-white fill-[#1a1a1a] transition-colors" />
          <path d="M30 28 L46 28 L70 62 L54 62 Z" className="dark:fill-[#1a1a1a] fill-white transition-colors" />
          <path d="M46 28 L70 28 L70 38 L46 38 Z" className="dark:fill-[#1a1a1a] fill-white transition-colors" />
          <path d="M30 62 L54 62 L54 72 L30 72 Z" className="dark:fill-[#1a1a1a] fill-white transition-colors" />
        </svg>
        <span className="text-base font-semibold dark:text-white/80 text-gray-700 transition-colors">Notion</span>
      </div>
    ),
  },
  {
    name: "Slack",
    element: (
      <div className="flex items-center gap-2 select-none">
        <svg width="22" height="22" viewBox="0 0 54 54" aria-hidden>
          <path d="M19.7 32c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4h4v4z" fill="#E01E5A" />
          <path d="M21.7 32c0-2.2 1.8-4 4-4s4 1.8 4 4v10c0 2.2-1.8 4-4 4s-4-1.8-4-4V32z" fill="#E01E5A" />
          <path d="M25.7 19.7c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4v4h-4z" fill="#36C5F0" />
          <path d="M25.7 21.7c2.2 0 4 1.8 4 4s-1.8 4-4 4H15.7c-2.2 0-4-1.8-4-4s1.8-4 4-4h10z" fill="#36C5F0" />
          <path d="M38 25.7c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4h-4v-4z" fill="#2EB67D" />
          <path d="M36 25.7c0 2.2-1.8 4-4 4s-4-1.8-4-4V15.7c0-2.2 1.8-4 4-4s4 1.8 4 4v10z" fill="#2EB67D" />
          <path d="M32 38c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4v-4h4z" fill="#ECB22E" />
          <path d="M32 36c-2.2 0-4-1.8-4-4s1.8-4 4-4h10c2.2 0 4 1.8 4 4s-1.8 4-4 4H32z" fill="#ECB22E" />
        </svg>
        <span className="text-base font-semibold dark:text-white/80 text-gray-700 transition-colors">Slack</span>
      </div>
    ),
  },
  {
    name: "Stripe",
    element: (
      <div className="flex items-center gap-2 select-none">
        <svg width="24" height="24" viewBox="0 0 60 25" aria-hidden fill="#635BFF">
          <path d="M29.5 8.4c0-1.5 1.2-2 3.2-2 2.8 0 6.4.9 9.2 2.4V2.2C38.9.8 36 0 32.7 0 25.8 0 21 3.5 21 9.1c0 8.9 12.3 7.5 12.3 11.3 0 1.7-1.5 2.3-3.7 2.3-3.2 0-7.3-1.3-10.5-3.1v6.7c3.6 1.5 7.2 2.2 10.5 2.2 7.1 0 12-3.4 12-9.1C41.6 10 29.5 11.7 29.5 8.4z" />
        </svg>
        <span className="text-xl font-bold text-white/80" style={{ color: "#635BFF" }}>stripe</span>
      </div>
    ),
  },
  {
    name: "OpenAI",
    element: (
      <div className="flex items-center gap-2 select-none">
        <svg width="22" height="22" viewBox="0 0 24 24" className="dark:fill-white fill-gray-900 transition-colors" aria-hidden>
          <path d="M22.28 9.98a5.63 5.63 0 0 0-.48-4.63 5.71 5.71 0 0 0-6.14-2.74A5.65 5.65 0 0 0 11.4 1a5.72 5.72 0 0 0-5.45 3.97 5.65 5.65 0 0 0-3.77 2.74 5.72 5.72 0 0 0 .7 6.7 5.63 5.63 0 0 0 .48 4.63 5.71 5.71 0 0 0 6.14 2.74A5.65 5.65 0 0 0 13.6 23a5.72 5.72 0 0 0 5.46-3.97 5.65 5.65 0 0 0 3.76-2.74 5.72 5.72 0 0 0-.54-6.31zM13.6 21.5a4.24 4.24 0 0 1-2.72-.98l.13-.08 4.52-2.61a.74.74 0 0 0 .37-.64V11.3l1.91 1.1a.07.07 0 0 1 .04.06v5.28a4.27 4.27 0 0 1-4.25 3.76zM3.78 17.6a4.24 4.24 0 0 1-.51-2.85l.14.08 4.52 2.61a.74.74 0 0 0 .74 0l5.52-3.19v2.2a.07.07 0 0 1-.03.06L9.6 19.14a4.27 4.27 0 0 1-5.82-1.54zm-.95-9.3a4.24 4.24 0 0 1 2.22-1.87v5.37a.74.74 0 0 0 .37.64l5.52 3.19-1.91 1.1a.07.07 0 0 1-.07 0L4.43 13.8a4.27 4.27 0 0 1-.6-5.5zm15.7 3.66-5.52-3.19 1.91-1.1a.07.07 0 0 1 .07 0l4.53 2.62a4.27 4.27 0 0 1-.66 7.7v-5.38a.74.74 0 0 0-.33-.65zm1.9-2.86-.14-.08-4.52-2.61a.74.74 0 0 0-.74 0L9.51 9.6V7.4a.07.07 0 0 1 .03-.06l4.53-2.61a4.27 4.27 0 0 1 6.35 4.42v-.15zm-11.97 3.93-1.91-1.1a.07.07 0 0 1-.04-.06V6.59a4.27 4.27 0 0 1 7-3.28l-.13.08-4.52 2.61a.74.74 0 0 0-.37.64l-.03 6.39zm1.04-2.24 2.46-1.42 2.46 1.42v2.84l-2.46 1.42-2.46-1.42V10.8z" />
        </svg>
        <span className="text-base font-semibold dark:text-white/80 text-gray-700 transition-colors">OpenAI</span>
      </div>
    ),
  },
  {
    name: "Vercel",
    element: (
      <div className="flex items-center gap-2 select-none">
        <svg width="20" height="20" viewBox="0 0 24 24" className="dark:fill-white fill-gray-900 transition-colors" aria-hidden>
          <path d="M12 2L2 19.8h20L12 2z" />
        </svg>
        <span className="text-base font-semibold dark:text-white/80 text-gray-700 transition-colors">Vercel</span>
      </div>
    ),
  },
  {
    name: "Framer",
    element: (
      <div className="flex items-center gap-2 select-none">
        <svg width="18" height="22" viewBox="0 0 14 21" className="dark:fill-white fill-gray-900 transition-colors" aria-hidden>
          <path d="M0 0h14v7H7L0 0zM0 7h7l7 7H0V7zM0 14h7l-7 7V14z" />
        </svg>
        <span className="text-base font-semibold dark:text-white/80 text-gray-700 transition-colors">Framer</span>
      </div>
    ),
  },
];

/* ─── Single logo chip ──────────────────────────────────────── */
function LogoChip({ brand }: { brand: (typeof brands)[0] }) {
  return (
    <div
      className="
        group flex items-center justify-center
        px-7 py-3
        rounded-xl
        border dark:border-white/8 border-gray-200
        dark:bg-white/[0.04] bg-gray-100/80
        dark:hover:bg-white/[0.09] hover:bg-gray-200
        dark:hover:border-white/20 hover:border-gray-300
        transition-all duration-300
        cursor-default
        opacity-55 hover:opacity-100
        hover:scale-105
        shrink-0
      "
      style={{ minWidth: "fit-content" }}
    >
      <div className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(198,255,0,0.25)]">
        {brand.element}
      </div>
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────── */
export function BrandLogosSection() {
  // Duplicate 3× so the marquee never shows a gap
  const row = [...brands, ...brands, ...brands];

  return (
    <section className="relative py-16 z-10 border-t dark:border-white/5 border-gray-200 overflow-hidden transition-colors">
      {/* Section heading */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center text-sm font-medium text-gray-500 mb-10 tracking-wide"
      >
        Loved by HR teams worldwide
      </motion.p>

      {/* Edge fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r dark:from-[#050816] from-[#F8FAFC] to-transparent transition-colors duration-300" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l dark:from-[#050816] from-[#F8FAFC] to-transparent transition-colors duration-300" />

      {/* Marquee track */}
      <div className="flex overflow-hidden">
        <div
          className="flex gap-5 marquee-track"
          style={{ animation: "marquee-ltr 32s linear infinite" }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
        >
          {row.map((brand, i) => (
            <LogoChip key={`${brand.name}-${i}`} brand={brand} />
          ))}
        </div>
      </div>

      {/* Keyframe injected via style tag */}
      <style>{`
        @keyframes marquee-ltr {
          0%   { transform: translateX(-33.3333%); }
          100% { transform: translateX(0%); }
        }
        .marquee-track {
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
