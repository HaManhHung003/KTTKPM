"use client";

import React, { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function AiChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Chào Admin, tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi về doanh thu, đơn hàng, người dùng...' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await api.post('/admin/ai/chat', { message: userMsg });
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), sender: 'ai', text: response.data.response }
      ]);
    } catch (error: any) {
      console.error('AI Chat error:', error);
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), sender: 'ai', text: 'Đã có lỗi xảy ra. Vui lòng kiểm tra console hoặc cấu hình API Key.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-300 z-50 flex items-center justify-center group"
          title="Hỏi AI"
        >
          <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          {}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ lý AI Quản trị</h3>
                <p className="text-xs text-blue-100">Truy vấn Database thông minh</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div 
                  className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                  <Bot size={16} />
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none text-sm text-gray-500 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Đang phân tích dữ liệu...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi về dữ liệu..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shrink-0"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
