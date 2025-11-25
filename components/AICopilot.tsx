import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { createComplianceChat, validateApiKey } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';

const AICopilot: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState(validateApiKey());
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting only once on mount, or when language changes if we want to reset
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        id: 'welcome', 
        role: 'model', 
        text: t('copilotWelcome')
      }]);
    }
  }, [t, messages.length]);

  useEffect(() => {
    if (isOpen && hasKey && !chatSessionRef.current) {
      chatSessionRef.current = createComplianceChat();
    }
  }, [isOpen, hasKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !hasKey || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', isStreaming: true }]);

      let fullText = '';
      
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMsgId ? { ...msg, text: fullText } : msg
            )
          );
        }
      }
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
        )
      );

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: 'Sorry, I encountered an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-40 transition-all duration-300 hover:scale-105 ${isOpen ? 'scale-0 opacity-0' : 'bg-indigo-600 text-white'}`}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Interface */}
      <div 
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <div className="flex items-center gap-2 text-white">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">{t('copilotTitle')}</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {!hasKey && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              Please configure your API_KEY to use the AI Copilot features.
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    AI Assistant
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                 <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('copilotPlaceholder')}
              className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
              rows={2}
              disabled={!hasKey || isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !hasKey || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-center">
             <span className="text-[10px] text-slate-400">{t('aiDisclaimer')}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AICopilot;
