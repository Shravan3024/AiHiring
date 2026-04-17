"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { hrApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, BarChart2, Clock, GitCommit, FileDown, FileText, AlertTriangle, ShieldCheck } from "lucide-react";

export default function HRReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch actual data using React Query
  const { data: funnel } = useQuery({ queryKey: ["hr-funnel"], queryFn: () => hrApi.getHiringFunnel().then(r => r.data?.data) });
  const { data: tth } = useQuery({ queryKey: ["hr-tth"], queryFn: () => hrApi.getTimeToHire().then(r => r.data?.data) });
  const { data: skills } = useQuery({ queryKey: ["hr-skills"], queryFn: () => hrApi.getSkillsHeatmap().then(r => r.data?.data) });
  const { data: rejections } = useQuery({ queryKey: ["hr-rejections"], queryFn: () => hrApi.getRejectionReasons().then(r => r.data?.data) });
  const { data: aivshr } = useQuery({ queryKey: ["hr-ai-vs-hr"], queryFn: () => hrApi.getAIvsHR().then(r => r.data?.data) });

  // Map to defaults if loading/missing
  const funnelData = Array.isArray(funnel) ? funnel : [
    { stage: "Applied", count: 0 },
    { stage: "Selected", count: 0 }
  ];

  const timeToHireData = Array.isArray(tth) ? tth : [
    { role: "Loading...", days: 0 }
  ];

  // For skill mapping: Backend getSkillGap returns [{ skill: 'Resume', strong: x, average: y, weak: z}, ...]
  // We will map it to gapScore = weak count * 10
  const skillGapData = Array.isArray(skills) ? skills.map((s: any) => ({
     skill: s.skill,
     gapScore: (s.weak > 0 ? (s.weak / (s.strong + s.average + s.weak)) * 100 : 0).toFixed(0)
  })) : [];

  const rejectionReasonData = Array.isArray(rejections) ? rejections : [
    { name: "No data", value: 1 }
  ];
  
  const alignmentData = aivshr?.chartData ? aivshr.chartData.map((d: any) => ({
    month: d.month,
    alignScore: (d.hrDecisions > 0 ? (d.aiDecisions / d.hrDecisions) * 100 : 0).toFixed(0)
  })) : [];



  const PIE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  const triggerExport = (format: 'csv' | 'pdf') => {
    // Simulated Export Action
    const timestamp = new Date().toISOString().split('T')[0];
    alert(`Generating ${format.toUpperCase()} export for ${activeTab} data (Timestamp: ${timestamp})`);
  };

  return (
    <PanelLayout title="Reports & Analytics Module" allowedRoles={["HR", "ADMIN"]}>
      <div className="flex justify-between items-center mb-6">
        <div>
           <p className="text-gray-500 text-sm">Strategic insights and pipeline efficiency tracking.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="bg-white" onClick={() => triggerExport('csv')}>
              <FileText className="w-4 h-4 mr-2" /> Export CSV
           </Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => triggerExport('pdf')}>
              <FileDown className="w-4 h-4 mr-2" /> Export PDF
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 bg-white shadow-xs p-1 h-auto border">
          <TabsTrigger value="overview" className="py-2.5">Pipeline Funnel</TabsTrigger>
          <TabsTrigger value="time" className="py-2.5">Time-to-Hire</TabsTrigger>
          <TabsTrigger value="skills" className="py-2.5">Skill Gaps</TabsTrigger>
          <TabsTrigger value="rejections" className="py-2.5">Rejection Analysis</TabsTrigger>
          <TabsTrigger value="alignment" className="py-2.5">AI vs HR Alignment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-blue-50/50 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <BarChart2 className="w-5 h-5 text-blue-600" /> Hiring Funnel Trend Over Time
              </CardTitle>
              <CardDescription>Track conversion rates sequentially through your recruitment lifecycle.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={funnelData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: '#4b5563' }} width={120} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="bg-indigo-50/50 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Clock className="w-5 h-5 text-indigo-600" /> Time to Hire per Role
              </CardTitle>
              <CardDescription>Average cycle time in days from job posting to offer acceptance.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={timeToHireData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                  <YAxis label={{ value: 'Days to Hire', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="days" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card className="border-rose-100 shadow-sm">
            <CardHeader className="bg-rose-50/50 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600" /> Organizational Skill Gap Report
              </CardTitle>
              <CardDescription>Quantifiable delta between required job skills and aggregate candidate competency.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={skillGapData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="skill" type="category" width={140} />
                  <Tooltip />
                  <Bar dataKey="gapScore" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejections">
          <Card className="border-amber-100 shadow-sm">
             <CardHeader className="bg-amber-50/50 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <GitCommit className="w-5 h-5 text-amber-600" /> Rejection Reason Analysis
              </CardTitle>
              <CardDescription>Categorical breakdown of candidate drop-offs and HR rejection designations.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={rejectionReasonData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {rejectionReasonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alignment">
          <Card className="border-emerald-100 shadow-sm">
             <CardHeader className="bg-emerald-50/50 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> AI vs HR Alignment
              </CardTitle>
              <CardDescription>Correlation strength between Gemini AI Fit Bands and Final HR Decision execution.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={alignmentData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} label={{ value: 'Alignment %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="alignScore" stroke="#10b981" strokeWidth={4} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PanelLayout>
  );
}
