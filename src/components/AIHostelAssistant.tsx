/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  HelpCircle, 
  Sparkles, 
  X, 
  MessageSquare, 
  Cpu, 
  BookOpen, 
  Clock, 
  ChevronRight 
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AIHostelAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: "Greetings, Resident. I am the Gemini-BH2 Cybernetic Warden Assistant. I can help explain Boys Hostel 2 rules, guide you through room allocations, explain outpass/leave requests, and clarify dining menu details. How may I assist your matrix today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on hostel policies
  const suggestions = [
    "What are the night curfew hours?",
    "How do I submit a leave / outpass request?",
    "What is the electrical/plumbing complaint procedure?",
    "Tell me about the hostel mess timings.",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsgId = 'msg-' + Date.now();
    const newMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, history: messages.map(m => ({ sender: m.sender, text: m.text })) })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gemini core failed to formulate a response');
      }

      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: data.text || "I was unable to complete this query process. Please verify your communication connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'bot-err-' + Date.now(),
        sender: 'assistant',
        text: `Error syncing with Gemini node: ${err.message || 'Unknown network interference.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        id="toggle-ai-chat-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-purple-600 text-white shadow-xl shadow-cyan-500/20 hover:neon-glow-cyan border border-cyan-400/30 cursor-pointer flex items-center justify-center gap-2 group"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-white animate-pulse" />
        <span className="font-display font-bold text-xs tracking-wider max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">
          GEMINI CO-WARDEN
        </span>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-window-panel"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 w-full max-w-[420px] h-[580px] rounded-3xl glass-panel-neon border-cyan-500/30 flex flex-col justify-between overflow-hidden shadow-2xl shadow-blue-950/50"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-gray-950 via-slate-950 to-blue-950/80 border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xs text-white flex items-center gap-1.5 uppercase tracking-wide">
                    Gemini Cyber Ward
                    <span className="inline-flex w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  </h3>
                  <p className="text-[9px] text-cyan-500 font-mono">VSB BOYS HOSTEL 2 AI CORE</p>
                </div>
              </div>
              <button 
                id="close-ai-chat-btn"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-900 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-950/40">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-purple-900 border border-purple-500/20'}`}>
                    {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none' : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                    <span className={`text-[9px] text-gray-600 font-mono mt-1 block ${msg.sender === 'user' ? 'text-right' : ''}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-7 h-7 rounded-lg bg-purple-900 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-white">
                    <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="font-mono text-[9px] text-cyan-500">Formulating core logic...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested / Guidelines Panel */}
            {messages.length < 3 && (
              <div className="p-3 bg-gray-950/80 border-t border-gray-900 flex flex-wrap gap-2 justify-center">
                {suggestions.map((s, idx) => (
                  <button
                    id={`suggest-btn-${idx}`}
                    key={idx}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="text-[10px] text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 font-mono bg-gray-900/60 hover:bg-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-800/80 transition-all text-left cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form 
              id="ai-chat-input-form"
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="p-3 bg-slate-950/90 border-t border-cyan-500/20 flex gap-2 items-center"
            >
              <input
                id="ai-chat-input-field"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Co-Warden rules or guides..."
                disabled={loading}
                className="flex-grow bg-gray-900 text-xs text-white border border-gray-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-cyan-500/40 transition-all"
              />
              <button
                id="submit-ai-query-btn"
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white disabled:opacity-45 transition-all flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
