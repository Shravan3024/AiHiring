import { Users, CheckCircle, XCircle, TrendingUp, Compass, Server, ShieldCheck, Zap } from "lucide-react";

export default function SummaryCards({ data }: any) {
  const stats = [
    {
      title: "Active Pipeline",
      value: data?.total ?? "—",
      icon: Users,
      color: "bg-blue-600",
      subtitle: "Global Candidate Stream",
    },
    {
      title: "Strategic Hires",
      value: data?.selected ?? "—",
      icon: ShieldCheck,
      color: "bg-[#0f172a]",
      subtitle: "Verified Capabilities",
    },
    {
      title: "Protocol Rejections",
      value: data?.rejected ?? "—",
      icon: XCircle,
      color: "bg-rose-600",
      subtitle: "Alignment Failures",
    },
    {
      title: "Operational Rate",
      value: data?.selectionRate ? `${data.selectionRate}%` : "—",
      icon: Zap,
      color: "bg-blue-600",
      subtitle: "Selection Yield",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
               <Icon className="w-24 h-24 text-slate-900" />
            </div>
            <div className="flex flex-col h-full relative z-10">
              <div className="flex items-center justify-between mb-6">
                 <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                 </div>
                 <div className="h-1 w-12 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-200 w-1/2" />
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-2">
                 <p className="text-4xl font-black text-[#0f172a] tracking-tighter">{stat.value}</p>
                 {stat.value !== "—" && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+4%</span>}
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">{stat.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}