import React from 'react';
import { Play, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Highlight {
  question: string;
  timestamp: string;
  duration?: string;
  score?: number;
  confidence?: string;
}

interface InterviewHighlightsProps {
  data: {
    videoUrl: string | null;
    highlights: Highlight[];
  } | null;
}

export default function InterviewHighlights({ data }: InterviewHighlightsProps) {
  if (!data || !data.highlights.length) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-12 text-center text-slate-400">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium">No video interview highlights available for this session.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600 fill-blue-600" /> Executive Interview Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.videoUrl ? (
            <div className="aspect-video bg-black relative group">
              <video 
                src={data.videoUrl} 
                controls 
                className="w-full h-full"
                poster="/video-placeholder.jpg"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge className="bg-blue-600/90 backdrop-blur text-[10px] font-black tracking-widest">RAW RECORDING</Badge>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-slate-900 flex items-center justify-center flex-col text-slate-500 gap-3">
               <ShieldCheck className="w-10 h-10 opacity-20" />
               <p className="text-xs font-bold uppercase tracking-widest">Recording Encrypted / Unavailable</p>
            </div>
          )}

          <div className="p-4 bg-white">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Neural Marker Timeline</h4>
            <div className="space-y-3">
              {data.highlights.map((item, idx) => (
                <div 
                  key={idx} 
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-blue-600">{item.timestamp}</span>
                      <div className="w-0.5 h-4 bg-slate-100 group-hover:bg-blue-200" />
                      <Clock className="w-3 h-3 text-slate-300 group-hover:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-900">{item.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[8px] font-black py-0 h-4 border-slate-200 text-slate-500">
                          {item.duration || '0:45'}s
                        </Badge>
                        {item.score && (
                           <span className="text-[9px] font-bold text-slate-400">Score: <span className={item.score > 70 ? 'text-green-600' : 'text-amber-600'}>{item.score}%</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {item.score && item.score < 50 && (
                       <AlertTriangle className="w-4 h-4 text-amber-500" />
                     )}
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Play className="w-3 h-3 fill-current" />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
