'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { SkillTwinAPI } from '../../lib/api';
import {
  Bot,
  X,
  Send,
  ShieldCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  grounding?: any;
  timestamp: string;
}

export default function AIChatPanel() {
  const {
    isAIChatOpen,
    setIsAIChatOpen,
    selectedSkillId,
    currentPath,
    currentDomain,
    masteryMap,
    skills
  } = useSkillTwin();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello Alex! I am TwinAI, your strictly grounded learning copilot. I analyze your real Bayesian Knowledge Tracing posterior values and prerequisite DAG topological ordering. Ask me anything about your roadmap, skill requirements, or recent plan adaptations!`,
      grounding: {
        system: 'Zero-Hallucination Grounding Engine',
        domain: currentDomain,
        tracked_skills: skills.length,
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAIChatOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsSending(true);

    // Call grounded chat engine
    const { reply, grounding } = await SkillTwinAPI.sendChatMessage(
      textToSend,
      selectedSkillId,
      currentPath,
      currentDomain,
      masteryMap
    );

    const aiMsg: ChatMessage = {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: reply,
      grounding,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsSending(false);
  };

  const quickPrompts = [
    `Why did my roadmap adapt?`,
    `What are the prerequisites for Redis?`,
    `Explain my lowest mastery skill`,
    `What should I study next?`,
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[580px] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border dark:border-cyan-500/30 border-cyan-200 dark:bg-[#0b1222]/95 bg-white/95 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-200 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 dark:bg-surface-200/80 bg-slate-100 px-4 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-brand-600 text-white shadow-md shadow-cyan-500/25">
            <Bot className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-[#090d16]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold dark:text-white text-slate-900">TwinAI Assistant</span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                Grounded
              </span>
            </div>
            <p className="text-[10px] dark:text-slate-400 text-slate-500">Zero-hallucination BKT reasoning</p>
          </div>
        </div>

        <button
          onClick={() => setIsAIChatOpen(false)}
          className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-white p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'border dark:border-white/10 border-slate-200 dark:bg-surface-200/90 bg-slate-50 dark:text-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              {msg.text}

              {/* Grounding Metadata Badge */}
              {msg.grounding && (
                <div className="mt-2 rounded-xl border dark:border-cyan-500/20 border-cyan-200 dark:bg-cyan-950/30 bg-cyan-50 p-2 text-[10px] dark:text-slate-300 text-slate-700 font-mono">
                  <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold mb-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verifiable Grounding Payload:</span>
                  </div>
                  <pre className="overflow-x-auto text-[9px] dark:text-slate-400 text-slate-600">
                    {JSON.stringify(msg.grounding, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <span className="text-[9px] dark:text-slate-500 text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
        {isSending && (
          <div className="flex items-center gap-2 text-xs dark:text-slate-400 text-slate-500 animate-pulse">
            <Bot className="h-4 w-4 text-cyan-500" />
            <span>Calculating grounded mathematical reasoning...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="border-t dark:border-white/5 border-slate-200 dark:bg-surface-300/30 bg-slate-100 px-3 py-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="rounded-lg border dark:border-white/10 border-slate-200 dark:bg-surface-200/80 bg-white px-2 py-1 text-[10px] font-medium dark:text-slate-300 text-slate-700 hover:border-cyan-500/40 dark:hover:text-white hover:text-slate-900 whitespace-nowrap transition-all shadow-xs"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t dark:border-white/10 border-slate-200 dark:bg-surface-200/90 bg-white p-3">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask TwinAI with mathematical grounding..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            className="flex-1 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-300/80 bg-slate-50 px-3.5 py-2 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isSending}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 disabled:opacity-40 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
