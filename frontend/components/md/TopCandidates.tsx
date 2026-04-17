import { Medal, Star, Zap, ShieldCheck } from "lucide-react";

export default function TopCandidates({ data = [] }: any) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-20 italic space-y-4">
        <Star className="w-10 h-10 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">NO_ELITE_TIER_DATA</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {data.slice(0, 5).map((c: any, i: number) => {
        const score = c.score || c.assessmentScore || 0;
        const percentage = Math.min(Math.round(score), 100);

        return (
          <div
            key={i}
            className="flex items-center justify-between p-8 hover:bg-white/5 transition-all group cursor-default"
          >
            <div className="flex items-center gap-6 flex-1 min-w-0">
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "⭐"}
               </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white uppercase tracking-tight truncate leading-none mb-2">{c.candidate || c.name || "Unknown Intelligence"}</p>
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-3 h-3 text-blue-500" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">ELITE_PERFORMER_{i + 1}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="text-right">
                <p className="text-2xl font-black text-blue-400 tracking-tighter tabular-nums">{percentage}%</p>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Confidence</p>
              </div>
              <div className="w-1.5 h-12 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all duration-1000"
                  style={{ height: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}