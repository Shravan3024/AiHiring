"use client";

import React, { useState, useEffect } from "react";
import { useUIStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, MessageSquare, Send, User, 
  MoreVertical, Paperclip, Smile, Phone, 
  Video, Clock, CheckCircle2, ShieldCheck,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const chats = [
  { 
    id: 1, 
    name: "HR Operations", 
    role: "Hiring Team",
    lastMsg: "Regarding your assessment results...", 
    time: "10:24 AM", 
    unread: 2, 
    active: true,
    avatar: "/avatars/hr.png",
    online: true
  },
  { 
    id: 2, 
    name: "Aman Sharma", 
    role: "Technical Lead",
    lastMsg: "Can we reschedule the interview?", 
    time: "Yesterday", 
    unread: 0,
    avatar: "/avatars/tech.png",
    online: false
  },
  { 
    id: 3, 
    name: "System Bot", 
    role: "AI Assistant",
    lastMsg: "Assessment link is now active.", 
    time: "2 days ago", 
    unread: 0,
    avatar: null,
    online: true
  }
];

const messages = [
  { id: 1, sender: "HR Operations", text: "Hello! We've reviewed your application for the Senior AI Engineer role.", time: "09:15 AM", isMe: false },
  { id: 2, sender: "Me", text: "Thank you for the update! I'm excited about the opportunity.", time: "09:20 AM", isMe: true },
  { id: 3, sender: "HR Operations", text: "Your assessment performance was exceptional. We'd like to discuss the next steps.", time: "10:20 AM", isMe: false },
  { id: 4, sender: "HR Operations", text: "Are you available for a brief call tomorrow morning?", time: "10:22 AM", isMe: false },
];

export default function CandidateMessages() {
  const { setPageTitle } = useUIStore();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setPageTitle("Messages");
  }, []);

  return (
    <div className="h-[calc(100vh-140px)] flex gap-8">
      {/* Sidebar - Chat List */}
      <Card className="w-96 border-none shadow-sm rounded-[40px] bg-white flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-50 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h2>
              <Badge className="bg-blue-600 text-white border-none rounded-lg px-2 py-0.5 text-[10px] font-black">12 New</Badge>
           </div>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-12 h-12 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-blue-100 transition-all"
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
           {chats.map(chat => (
             <div 
               key={chat.id} 
               className={cn(
                 "group p-4 rounded-[28px] cursor-pointer transition-all flex items-center gap-4",
                 chat.active ? "bg-blue-600 shadow-lg shadow-blue-100" : "hover:bg-slate-50"
               )}
             >
                <div className="relative">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm",
                     chat.active ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                   )}>
                      {chat.avatar ? <img src={chat.avatar} className="w-full h-full object-cover rounded-2xl" alt="" /> : chat.name[0]}
                   </div>
                   {chat.online && (
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between mb-0.5">
                      <p className={cn("font-bold truncate", chat.active ? "text-white" : "text-slate-900")}>{chat.name}</p>
                      <span className={cn("text-[10px] font-bold", chat.active ? "text-blue-100" : "text-slate-400")}>{chat.time}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <p className={cn("text-xs truncate", chat.active ? "text-blue-50" : "text-slate-400 font-medium")}>{chat.lastMsg}</p>
                      {chat.unread > 0 && !chat.active && (
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{chat.unread}</div>
                      )}
                   </div>
                </div>
             </div>
           ))}
        </div>
        
        <div className="p-6 bg-slate-50/50">
           <div className="p-4 bg-white rounded-3xl border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ShieldCheck className="w-4 h-4" /></div>
              <p className="text-[10px] font-bold text-slate-500 leading-tight">Your conversations are end-to-end encrypted.</p>
           </div>
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 border-none shadow-sm rounded-[40px] bg-white flex flex-col overflow-hidden">
         {/* Chat Header */}
         <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm">HR</div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900">HR Operations</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Now</span>
                  </div>
               </div>
            </div>
            <div className="flex gap-2">
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Phone className="w-5 h-5" /></Button>
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Video className="w-5 h-5" /></Button>
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"><MoreVertical className="w-5 h-5" /></Button>
            </div>
         </div>

         {/* Messages Feed */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8 bg-slate-50/20">
            {messages.map((m, i) => (
              <div key={m.id} className={cn("flex flex-col", m.isMe ? "items-end" : "items-start")}>
                 <div className={cn(
                   "max-w-[70%] p-6 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                   m.isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                 )}>
                    {m.text}
                 </div>
                 <div className="flex items-center gap-2 mt-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400">{m.time}</span>
                    {m.isMe && <CheckCheck className="w-3 h-3 text-blue-600" />}
                 </div>
              </div>
            ))}
            <div className="flex justify-center">
               <Badge className="bg-slate-100 text-slate-400 border-none font-bold text-[10px] uppercase tracking-widest py-1 px-4">Today</Badge>
            </div>
         </div>

         {/* Chat Input */}
         <div className="p-8 border-t border-slate-50">
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[32px] border border-slate-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-slate-400 hover:text-blue-600"><Paperclip className="w-5 h-5" /></Button>
               <input 
                 value={msg}
                 onChange={(e) => setMsg(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && setMsg("")}
                 placeholder="Type your message here..." 
                 className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-900"
               />
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-slate-400 hover:text-amber-500"><Smile className="w-5 h-5" /></Button>
               <Button 
                 onClick={() => setMsg("")}
                 className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center shrink-0"
               >
                  <Send className="w-5 h-5" />
               </Button>
            </div>
         </div>
      </Card>
    </div>
  );
}
