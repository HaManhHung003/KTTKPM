'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Sparkles, User as UserIcon } from 'lucide-react';
import { connectChat, disconnectChat, sendChatMessage } from '@/lib/chat';
import api from '@/lib/api';
import type { ChatMessage, User } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function CustomerChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [me, setMe] = useState<User | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  
  useEffect(() => {
    api.get<User>('/auth/me').then(res => {
      const user = res.data;
      setMe(user);
    }).catch(() => {
      
    });
  }, []);

  
  useEffect(() => {
    if (isOpen && me && me.role?.toLowerCase() !== 'admin') {
      
      api.get<ChatMessage[]>(`/chat/history/${me.id}`).then(hist => {
        setMessages(hist.data);
      }).catch(console.error);

      
      connectChat(
        Number(me.id),
        (msg) => setMessages(prev => [...prev, msg]),
        () => setIsConnected(true),
        (err) => {
          console.error(err);
          setIsConnected(false);
        }
      );
    } else if (!isOpen) {
      disconnectChat();
      setIsConnected(false);
    }
  }, [isOpen, me]);

  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !me) return;

    if (sendChatMessage(Number(me.id), draft)) {
      setDraft('');
    }
  };

  if (me?.role?.toLowerCase() === 'admin') return null; 

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {}
      <div 
        className={cn(
          "transition-all duration-300 ease-out origin-bottom-right mb-4",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none absolute bottom-0 right-0"
        )}
      >
        <Card className="w-[360px] h-[520px] flex flex-col shadow-2xl border-0 overflow-hidden ring-1 ring-black/5 bg-background/95 backdrop-blur-xl">
          {}
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-4 pb-6 flex justify-between items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-inner">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Bear Store Support</h3>
                <p className="text-xs text-amber-100 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Chúng tôi luôn sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/20 p-1.5 rounded-full transition-colors relative z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 -mt-2 bg-gray-50/50 rounded-t-2xl relative z-20">
            {!me && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500 max-w-[80%]">
                  Vui lòng đăng nhập để có thể chat với nhân viên hỗ trợ của chúng tôi.
                </div>
              </div>
            )}
            
            {me && messages.length === 0 && (
              <div className="text-center text-xs text-gray-400 mt-4 bg-white py-2 rounded-full border border-gray-100 shadow-sm mx-8">
                Bắt đầu cuộc trò chuyện
              </div>
            )}

            {me && messages.map(msg => {
              const isMine = msg.senderRole === 'customer';
              return (
                <div key={msg.id} className={cn('flex flex-col w-full', isMine ? 'items-end' : 'items-start')}>
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {!isMine && (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center border border-indigo-200">
                        <span className="text-[10px] font-bold text-indigo-700">A</span>
                      </div>
                    )}
                    <div className={cn(
                      'px-4 py-2.5 text-[13px] shadow-sm leading-relaxed',
                      isMine 
                        ? 'bg-blue-600 text-white rounded-[20px] rounded-br-[4px]' 
                        : 'bg-white text-gray-800 rounded-[20px] rounded-bl-[4px] border border-gray-100'
                    )}>
                      {msg.message}
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] text-gray-400 mt-1",
                    isMine ? "mr-1" : "ml-9"
                  )}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {}
          {me && (
            <div className="p-3 bg-white border-t border-gray-100 z-20">
              <form onSubmit={handleSend} className="flex gap-2 items-center bg-gray-50 rounded-full p-1 pr-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder={isConnected ? 'Nhập tin nhắn của bạn...' : 'Đang kết nối...'}
                  disabled={!isConnected}
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 shadow-none px-4 h-9 text-sm"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!isConnected || !draft.trim()}
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md flex-shrink-0 transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-white ml-0.5" />
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>

      {}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative group transition-all duration-300",
          isOpen ? "bg-gray-800 hover:bg-gray-700 rotate-90" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/50 hover:-translate-y-1"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-300 -rotate-90" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        
        {}
        {!isOpen && (
          <span className="absolute 0 top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-background animate-bounce"></span>
        )}
        
        {}
        {!isOpen && (
          <div className={cn(
            "absolute right-16 px-3 py-1.5 bg-black text-white text-xs rounded-lg shadow-lg whitespace-nowrap transition-all duration-300 pointer-events-none",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          )}>
            Chat với chúng tôi
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-y-[5px] border-y-transparent border-l-[5px] border-l-black"></div>
          </div>
        )}
      </button>
    </div>
  );
}
