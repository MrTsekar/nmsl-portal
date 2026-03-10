"use client";

import { useState } from "react";
import { MessageCircle, Send, Clock } from "lucide-react";
import type { ChatConversation, Message } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChatWindow({
  conversations,
  messages,
}: {
  conversations: ChatConversation[];
  messages: Message[];
}) {
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const activeConversation = conversations.find((item) => item.id === activeId) ?? conversations[0];
  const scopedMessages = messages.filter((item) => item.conversationId === activeConversation?.id);

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* Conversations Sidebar */}
      <Card className="hidden lg:block border-slate-200 dark:border-slate-800 shadow-lg">
        <CardHeader className="pb-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-blue-950/30 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Conversations</h3>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversation?.id;
              const initials = conversation.title.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveId(conversation.id)}
                  className={`w-full rounded-xl p-3 text-left transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md" 
                      : "border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className={`h-10 w-10 border-2 ${
                      isActive ? "border-white" : "border-slate-200 dark:border-slate-700"
                    }`}>
                      <AvatarFallback className={isActive ? "bg-white/20 text-white" : "bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 text-cyan-700 dark:text-cyan-300"}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        isActive ? "text-white" : "text-slate-900 dark:text-slate-100"
                      }`}>{conversation.title}</p>
                      <p className={`truncate text-xs ${
                        isActive ? "text-white/90" : "text-slate-500 dark:text-slate-400"
                      }`}>{conversation.lastMessage}</p>
                    </div>
                    <div className="relative">
                      <span className="flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isActive ? "bg-white" : "bg-green-400"
                        }`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          isActive ? "bg-white" : "bg-green-500"
                        }`}></span>
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
        <CardHeader className="pb-3 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-950/30 border-b border-slate-200 dark:border-slate-700">
          {activeConversation && (() => {
            const initials = activeConversation.title.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-cyan-200 dark:border-cyan-800">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">{activeConversation.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>Online • Appointment: {activeConversation.appointmentId}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </CardHeader>
        <CardContent className="flex h-[500px] sm:h-[550px] md:h-[600px] flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-6 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
            {scopedMessages.map((message) => {
              const isOwn = message.own;
              return (
                <div key={message.id} className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                  {!isOwn && (
                    <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-slate-200 dark:border-slate-700">
                      <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                        {activeConversation?.title.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-md ${
                    isOwn 
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-sm" 
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-sm"
                  }`}>
                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      isOwn ? "text-white" : "text-slate-800 dark:text-slate-200"
                    }`}>{message.body}</p>
                    <div className={`mt-1 flex items-center gap-1 text-[10px] ${
                      isOwn ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                    }`}>
                      <Clock className="h-3 w-3" />
                      <span>{message.sentAt}</span>
                    </div>
                  </div>
                  {isOwn && (
                    <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-cyan-200 dark:border-cyan-800">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-semibold">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Input Area */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Type a message..." 
                className="flex-1 border-slate-300 dark:border-slate-600 focus:border-cyan-500 dark:focus:border-cyan-500 rounded-xl text-sm"
              />
              <Button 
                size="sm" 
                className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md rounded-xl px-4 sm:px-6"
              >
                <Send className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
