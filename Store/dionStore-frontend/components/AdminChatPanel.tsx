'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, User as UserIcon, MessageCircle, MoreVertical, Phone, Video } from 'lucide-react';
import { connectChat, unsubscribeTopic, sendChatMessage } from '@/lib/chat';
import api from '@/lib/api';
import type { ChatMessage, User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ActiveChat {
  userId: number;
  userName: string;
  userEmail: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageSender?: string;
}

export default function AdminChatPanel() {
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [me, setMe] = useState<User | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    api.get<User>('/auth/me').then(res => {
      setMe(res.data);
    }).catch(console.error);

    loadActiveChats();
    const interval = setInterval(loadActiveChats, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveChats = () => {
    api.get<ActiveChat[]>('/chat/active').then(res => {
      setActiveChats(res.data);
    }).catch(console.error);
  };

  // Connect STOMP for selected user
  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    // Load history
    api.get<ChatMessage[]>(`/chat/history/${selectedUserId}`).then(res => {
      setMessages(res.data);
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 50);
    });

    // Connect and subscribe to that user's topic
    connectChat(
      selectedUserId,
      (msg) => {
        setMessages(prev => [...prev, msg]);
      },
      () => console.log('Admin connected to chat topic: ' + selectedUserId),
      (err) => console.error(err)
    );

    return () => {
      unsubscribeTopic(selectedUserId);
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !selectedUserId || !me) return;

    if (sendChatMessage(selectedUserId, draft)) {
      setDraft('');
    }
  };

  return (
    <Card className="flex flex-row p-0 gap-0 h-[calc(100vh-140px)] w-full overflow-hidden rounded-[24px] border border-white/20 shadow-2xl bg-[#F8FAFC]/50 backdrop-blur-2xl min-h-0">
      
      {/* ── Sidebar - Active Chats ── */}
      <div className="w-1/3 md:w-[320px] bg-white/60 border-r border-gray-200/50 flex flex-col min-h-0 shrink-0 relative z-10 backdrop-blur-xl">
        <div className="p-6 pb-4 shrink-0">
          <h3 className="font-bold text-xl text-gray-800 tracking-tight flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-indigo-500" />
            Hỗ trợ khách hàng
          </h3>
          <p className="text-xs text-gray-500 mt-1">Quản lý tin nhắn trực tuyến</p>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4 space-y-2 custom-scrollbar">
          {activeChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <MessageCircle className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium">Trống</p>
            </div>
          ) : (
            activeChats.map(chat => (
              <button
                key={chat.userId}
                onClick={() => setSelectedUserId(chat.userId)}
                className={cn(
                  "w-full p-3 flex items-center gap-3 text-left transition-all duration-300 rounded-2xl border",
                  selectedUserId === chat.userId 
                    ? "bg-white border-indigo-100 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] ring-1 ring-indigo-50" 
                    : "bg-transparent border-transparent hover:bg-white/40 hover:border-white/60"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  selectedUserId === chat.userId ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md" : "bg-indigo-50 text-indigo-600"
                )}>
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-semibold truncate text-gray-800 text-[15px] flex items-center justify-between">
                    <span>{chat.userName}</span>
                    {!!chat.unreadCount && chat.unreadCount > 0 && selectedUserId !== chat.userId && (
                      <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-gray-500 truncate mt-0.5">{chat.userEmail}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col bg-transparent min-w-0 min-h-0 relative">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-white/50 shrink-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md ring-4 ring-white/50">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-800 tracking-tight">
                    {activeChats.find(c => c.userId === selectedUserId)?.userName}
                  </div>
                  <div className="text-[13px] text-emerald-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Đang trực tuyến
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0 custom-scrollbar relative z-0">
              {messages.map((msg, idx) => {
                const isAdmin = msg.senderRole === 'admin';
                const showTail = idx === messages.length - 1 || messages[idx + 1].senderRole !== msg.senderRole;
                
                return (
                  <div key={msg.id} className={cn('flex flex-col w-full', isAdmin ? 'items-end' : 'items-start')}>
                    <div className={cn(
                      'px-5 py-3 text-[14px] max-w-[70%] leading-relaxed shadow-sm transition-all hover:shadow-md',
                      isAdmin 
                        ? cn('bg-gradient-to-br from-indigo-500 to-purple-600 text-white', 
                             showTail ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl') 
                        : cn('bg-white text-gray-800 border border-gray-100',
                             showTail ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl')
                    )}>
                      {msg.message}
                    </div>
                    <span className={cn(
                      "text-[11px] text-gray-400 mt-1.5 font-medium",
                      isAdmin ? "mr-1" : "ml-1"
                    )}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white/40 backdrop-blur-md shrink-0 border-t border-white/50">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3 bg-white p-2 rounded-[24px] shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Soạn tin nhắn..."
                  className="flex-1 bg-transparent border-0 focus:ring-0 px-4 py-2 text-[15px] outline-none text-gray-800 placeholder:text-gray-400"
                />
                <Button 
                  type="submit" 
                  disabled={!draft.trim()}
                  className="rounded-[20px] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 h-10 px-5"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Gửi
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-6 relative z-0">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
              <MessageCircle className="w-96 h-96" />
            </div>
            <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center relative z-10 animate-bounce-slow">
              <MessageCircle className="w-12 h-12 text-indigo-500" />
            </div>
            <div className="text-center relative z-10">
              <h2 className="text-2xl font-bold text-gray-800">Sẵn sàng hỗ trợ</h2>
              <p className="text-gray-500 mt-2">Chọn một khách hàng từ danh sách bên trái để bắt đầu chat.</p>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        .animate-bounce-slow { animation: bounce 3s infinite; }
      `}} />
    </Card>
  );
}
