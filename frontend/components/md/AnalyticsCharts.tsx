"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsCharts({ data }: any) {
  const chartData = [
    {
      name: "High Performers",
      value: data?.scoreDistribution?.high || 0,
      category: "High",
    },
    {
      name: "Average",
      value: data?.scoreDistribution?.medium || 0,
      category: "Medium",
    },
    {
      name: "Below Average",
      value: data?.scoreDistribution?.low || 0,
      category: "Low",
    },
  ];

  const hasData = chartData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p className="text-sm">No score distribution data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <Legend />
        <Bar dataKey="value" name="Candidates" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
