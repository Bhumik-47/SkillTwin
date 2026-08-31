'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { SkillTwinAPI } from '../../lib/api';
import {
  Bot,
  X,
  Send,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  RotateCcw,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Expand,
  Scaling
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  grounding?: any;
  timestamp: string;
}

// Helper to render inline markdown tokens (bold, code, italic)
function renderInlineMarkdown(text: string) {
  // Regex to split by bold (**...**), inline code (`...`), and italic (*...*)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold dark:text-white text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded px-1.5 py-0.5 bg-slate-200 dark:bg-surface-50 font-mono text-[11px] text-cyan-700 dark:text-cyan-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// Helper to render structured markdown messages (headings, lists, paragraphs)
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul_${elements.length}`} className="my-1.5 space-y-1">
            {currentList.items}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol_${elements.length}`} className="my-1.5 space-y-1">
            {currentList.items}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={lineIdx} className="font-bold text-xs sm:text-sm mt-2 mb-1 dark:text-white text-slate-900">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(
        <li key={lineIdx} className="ml-4 list-disc leading-relaxed text-xs">
          {renderInlineMarkdown(trimmed.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      const textAfterNumber = trimmed.replace(/^\d+\.\s/, '');
      currentList.items.push(
        <li key={lineIdx} className="ml-4 list-decimal leading-relaxed text-xs">
          {renderInlineMarkdown(textAfterNumber)}
        </li>
      );
    } else if (trimmed === '') {
      flushList();
      elements.push(<div key={lineIdx} className="h-1.5" />);
    } else {
      flushList();
      elements.push(
        <p key={lineIdx} className="leading-relaxed text-xs my-0.5">
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

export default function AIChatPanel() {
  const {
    isAIChatOpen,
    setIsAIChatOpen,
    selectedSkillId,
    currentPath,
    currentDomain,
    masteryMap,
    skills,
    user
  } = useSkillTwin();

  const getInitialMessage = (): ChatMessage => ({
    id: 'm1',
    sender: 'ai',
    text: `Hi **${user.full_name.split(' ')[0]}**! I'm your AI Learning Assistant. I can explain any concept, help you prepare for practice quizzes, or answer questions about your study roadmap.\n\nWhat would you like to explore today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);
  const [isSending, setIsSending] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resize State & Presets
  const [sizePreset, setSizePreset] = useState<'normal' | 'large' | 'fullscreen'>('normal');
  const [customDimensions, setCustomDimensions] = useState<{ width: number; height: number }>({
    width: 420,
    height: 560
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: customDimensions.width,
      startH: customDimensions.height
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = dragStartRef.current.startX - e.clientX;
      const deltaY = dragStartRef.current.startY - e.clientY;
      const newW = Math.max(340, Math.min(window.innerWidth - 32, dragStartRef.current.startW + deltaX));
      const newH = Math.max(420, Math.min(window.innerHeight - 32, dragStartRef.current.startH + deltaY));
      setCustomDimensions({ width: newW, height: newH });
      setSizePreset('normal');
    };

    const onMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const isFullscreen = sizePreset === 'fullscreen';

  const toggleSizePreset = () => {
    if (sizePreset === 'normal') {
      setSizePreset('large');
      setCustomDimensions({ width: 680, height: 680 });
    } else if (sizePreset === 'large') {
      setSizePreset('fullscreen');
    } else {
      setSizePreset('normal');
      setCustomDimensions({ width: 420, height: 560 });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sizePreset === 'fullscreen') {
          setSizePreset('normal');
          setCustomDimensions({ width: 420, height: 560 });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sizePreset]);

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

    // Call chat engine
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

  const handleConfirmClear = () => {
    setMessages([getInitialMessage()]);
    setShowClearConfirm(false);
  };

  const quickPrompts = [
    `What should I study next?`,
    `Explain Redis caching`,
    `What is database indexing?`,
    `FastAPI vs Django`,
  ];

  return (
    <>
      {/* Background Dim Backdrop when in Fullscreen */}
      {isFullscreen && (
        <div
          onClick={() => setSizePreset('normal')}
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        />
      )}

      <div
        style={
          isFullscreen
            ? {
                top: '5rem',
                bottom: '1.5rem',
                left: '1.25rem',
                right: '1.25rem',
                maxWidth: '68rem',
                margin: '0 auto',
                height: 'calc(100vh - 6.5rem)'
              }
            : {
                width: `${customDimensions.width}px`,
                height: `${customDimensions.height}px`,
                maxWidth: 'calc(100vw - 2rem)',
                maxHeight: 'calc(100vh - 5.5rem)'
              }
        }
        className={`fixed z-[60] flex flex-col overflow-hidden rounded-3xl border dark:border-white/15 border-slate-300 dark:bg-[#0d1525] bg-white shadow-2xl animate-modal-reveal transition-all ${
          isFullscreen ? 'inset-x-4 sm:inset-x-auto' : 'bottom-4 sm:bottom-6 right-4 sm:right-6'
        } ${isDragging ? 'select-none transition-none' : 'duration-200'}`}
      >
        {/* Top-Left Drag-to-Resize Corner Handle */}
        {!isFullscreen && (
          <div
            onMouseDown={startResize}
            title="Drag to resize chat window"
            className="absolute top-0 left-0 h-6 w-6 z-30 cursor-nwse-resize group flex items-start justify-start p-1"
          >
            <div className="h-3 w-3 rounded-br border-t-2 border-l-2 border-slate-400 group-hover:border-cyan-400 transition-colors" />
          </div>
        )}
      
      {/* Header */}
      <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-100 px-4 py-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-brand-600 text-white shadow-sm">
            <Bot className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-[#0d1525]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold dark:text-white text-slate-900">AI Learning Tutor</span>
            </div>
            <p className="text-[10px] dark:text-slate-400 text-slate-500">Always available to help</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Size Preset Toggle */}
          <button
            onClick={toggleSizePreset}
            title={sizePreset === 'fullscreen' ? 'Restore standard view' : sizePreset === 'large' ? 'Full screen' : 'Expand window'}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-white p-1 text-slate-400 hover:text-brand-500 dark:hover:text-white transition-all active:scale-[0.95]"
          >
            {sizePreset === 'fullscreen' ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : sizePreset === 'large' ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Expand className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Refresh / Clear Chat Trigger */}
          <button
            onClick={() => setShowClearConfirm(true)}
            title="Refresh and clear chat"
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-white p-1 text-slate-400 hover:text-brand-500 dark:hover:text-white transition-all active:scale-[0.95]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Close Panel Trigger */}
          <button
            onClick={() => setIsAIChatOpen(false)}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-white p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-[0.95]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Caution Prompt for Chat Refresh */}
      {showClearConfirm && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 p-3 text-xs animate-in fade-in">
          <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <div className="space-y-1.5 flex-1">
              <p className="font-semibold">Clear conversation history?</p>
              <p className="text-[11px] opacity-90 leading-tight">
                Previous messages in this session will be lost.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleConfirmClear}
                  className="rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold px-2.5 py-1 text-[10px] shadow-xs active:scale-[0.95]"
                >
                  Clear Chat
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white shadow-sm font-medium'
                  : 'border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 dark:text-slate-200 text-slate-800'
              }`}
            >
              {msg.sender === 'user' ? (
                <span>{msg.text}</span>
              ) : (
                <FormattedMessage text={msg.text} />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 px-1">
              <span className="text-[9px] dark:text-slate-500 text-slate-400">{msg.timestamp}</span>
              {msg.sender === 'ai' && (
                <span className="text-[9px] font-semibold flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="h-2.5 w-2.5" />
                  SkillTwin Tutor
                </span>
              )}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex items-center gap-2 text-xs dark:text-slate-400 text-slate-500 animate-pulse">
            <Bot className="h-4 w-4 text-cyan-400" />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="border-t dark:border-white/5 border-slate-200 dark:bg-surface-50 bg-slate-100 px-3 py-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="rounded-lg border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-white px-2.5 py-1 text-[10.5px] font-medium dark:text-slate-300 text-slate-700 hover:border-brand-500 whitespace-nowrap transition-all shadow-2xs active:scale-[0.97]"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-white p-3">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question about your study plan..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            className="flex-1 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-slate-50 px-3.5 py-2 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isSending}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-all active:scale-[0.95]"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
