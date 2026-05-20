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
      <Card className="border-border/40">
        <CardContent className="p-12 text-center text-muted-foreground">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium">No video interview highlights available for this session.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-muted/20 border-b border-border/40 p-4">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Play className="w-4 h-4 text-primary fill-primary" /> Executive Interview Highlights
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
            <div className="aspect-video bg-background flex items-center justify-center flex-col text-muted-foreground gap-3">
               <ShieldCheck className="w-10 h-10 opacity-20" />
               <p className="text-xs font-bold uppercase tracking-widest">Recording Encrypted / Unavailable</p>
            </div>
          )}

          <div className="p-4 bg-card">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Neural Marker Timeline</h4>
            <div className="space-y-3">
              {data.highlights.map((item, idx) => (
                <div 
                  key={idx} 
                  className="group flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-primary">{item.timestamp}</span>
                      <div className="w-0.5 h-4 bg-border/40 group-hover:bg-primary/30" />
                      <Clock className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/60" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary">  {item.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[8px] font-black py-0 h-4 border-border/40 text-muted-foreground">
                          {item.duration || '0:45'}s
                        </Badge>
                        {item.score && (
                           <span className="text-[9px] font-bold text-muted-foreground">Score: <span className={item.score > 70 ? 'text-emerald-500' : 'text-amber-500'}>{item.score}%</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {item.score && item.score < 50 && (
                       <AlertTriangle className="w-4 h-4 text-amber-500" />
                     )}
                     <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
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
