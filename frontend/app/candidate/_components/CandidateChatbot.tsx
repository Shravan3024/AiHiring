"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, Send, X, MessageSquare, 
  Sparkles, User, Minus, Maximize2,
  Paperclip, Smile, MoreHorizontal,
  ChevronRight, BrainCircuit
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { aiApi } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
  time: string;
  isNew?: boolean;
};

// --- Typewriter Component ---
function Typewriter({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 10); // Speed of typing
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete]);

  return (
    <div className="prose prose-sm prose-slate max-w-none break-words leading-relaxed text-slate-700 font-medium
        prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-blue-700 prose-strong:font-bold">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedText}
      </ReactMarkdown>
    </div>
  );
}

export default function CandidateChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hello! I'm your AI Recruitment Assistant. How can I help you with your application today?", 
      sender: "bot", 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === "bot" ? "assistant" : "user",
        content: m.text
      }));

      const response = await aiApi.chat(input, history);
      
      const botMsg: Message = {
        id: Date.now() + 1,
        text: response.data.data || "I'm sorry, I couldn't process that. How else can I help?",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "System is experiencing high load. Please try again in a moment.",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-[420px] h-[650px] mb-6 border-none shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[40px] bg-white flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
           {/* Header */}
           <div className="p-7 bg-blue-600 text-white flex items-center justify-between shadow-lg relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md shadow-inner">
                    <BrainCircuit className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h3 className="font-bold text-base tracking-tight">MSK AI Assistant</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                       <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest opacity-80">Online & Ready</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-1">
                 <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/10 text-white" onClick={() => setIsOpen(false)}><Minus className="w-4 h-4" /></Button>
                 <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/10 text-white" onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></Button>
              </div>
           </div>

           {/* Feed */}
           <div 
             ref={scrollRef}
             className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#F8FAFC]"
           >
              {messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col group", m.sender === "user" ? "items-end" : "items-start")}>
                   <div className={cn(
                     "max-w-[90%] p-4 rounded-[24px] shadow-sm transition-all duration-300",
                     m.sender === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100" 
                      : "bg-white text-slate-700 rounded-tl-none border border-slate-100/50"
                   )}>
                      {m.sender === "user" ? (
                        <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                      ) : (
                        m.isNew ? (
                          <Typewriter text={m.text} />
                        ) : (
                          <div className="prose prose-sm prose-slate max-w-none break-words leading-relaxed text-slate-700 font-medium
                            prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-blue-700 prose-strong:font-bold">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.text}
                            </ReactMarkdown>
                          </div>
                        )
                      )}
                   </div>
                   <span className="text-[10px] font-bold text-slate-300 mt-2 px-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.sender === "user" ? "You" : "AI Assistant"} • {m.time}
                   </span>
                </div>
              ))}
              {isTyping && (
                <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-2">
                   <div className="bg-white border border-slate-100 p-4 rounded-[20px] rounded-tl-none shadow-sm flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                   </div>
                </div>
              )}
           </div>

           {/* Input */}
           <div className="p-6 bg-white border-t border-slate-50">
              <div className="flex items-center gap-3 bg-[#F1F5F9] p-2.5 rounded-[28px] border border-slate-200/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 transition-all duration-300">
                 <input 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && handleSend()}
                   placeholder="Type your message here..." 
                   className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 px-4 placeholder:text-slate-400"
                 />
                 <Button 
                   onClick={handleSend}
                   disabled={!input.trim() || isTyping}
                   className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-100 flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-50"
                 >
                    <Send className="w-5 h-5 ml-0.5" />
                 </Button>
              </div>
              <p className="text-center text-[10px] text-slate-300 font-bold mt-4 uppercase tracking-[0.2em]">MSK Recruitment Intelligence</p>
           </div>
        </Card>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-10 h-10 rounded-[22px] flex items-center justify-center shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all duration-500 hover:scale-110 hover:shadow-[0_20px_40px_rgba(37,99,235,0.4)]",
          isOpen ? "bg-white text-blue-600 rotate-90" : "bg-blue-600 text-white"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <BrainCircuit className="w-9 h-9" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-[4px] border-[#F8FAFC] rounded-full" />
        )}
      </button>
    </div>
  );
}
