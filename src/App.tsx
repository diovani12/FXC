/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { QuickPrompts } from './components/QuickPrompts';
import { ResponsibleAiModal } from './components/ResponsibleAiModal';
import { Sparkles, MessageSquare, ArrowDown } from 'lucide-react';

const STORAGE_KEY = 'fxc_ai_chat_history_v1';

const INITIAL_WELCOME: Message = {
  id: 'msg-init-1',
  role: 'assistant',
  content: 'olá! Sou a FXC AI. pode me fazer qualquer perguntas sobre inteligencia artificial!',
  timestamp: Date.now(),
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading chat from localStorage:', e);
    }
    return [INITIAL_WELCOME];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Error saving chat to localStorage:', e);
    }
  }, [messages]);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
      setShowScrollBottom(isFarFromBottom);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  // Send message and stream real-time response from Gemini
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const initialAssistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages([...updatedHistory, initialAssistantMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Erro na conexão com o servidor (Status: ${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const parsed = JSON.parse(trimmed.slice(6));

            if (parsed.error) {
              throw new Error(parsed.error);
            }

            if (parsed.chunk) {
              accumulatedText += parsed.chunk;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, content: accumulatedText, isStreaming: true }
                    : msg
                )
              );
            }

            if (parsed.done) {
              break;
            }
          } catch (e: any) {
            // Ignore parse errors on incomplete chunk boundaries
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }
      }

      // Mark streaming completed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Generation was stopped by user
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                  ...msg,
                  isStreaming: false,
                  content: msg.content || '*(Resposta interrompida pelo usuário)*',
                }
              : msg
          )
        );
      } else {
        console.error('Error streaming response:', err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                  ...msg,
                  isStreaming: false,
                  error: true,
                  content:
                    err.message ||
                    'Desculpe, ocorreu uma falha ao gerar a resposta. Por favor, tente novamente.',
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop active streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Retry last question
  const handleRetry = () => {
    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Find index of last user message
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;

    const prunedHistory = messages.slice(0, lastUserIdx);
    setMessages(prunedHistory);

    handleSendMessage(lastUserMsg.content);
  };

  // Clear Chat
  const handleClearChat = () => {
    if (window.confirm('Deseja realmente limpar toda a conversa?')) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setMessages([INITIAL_WELCOME]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Export Chat
  const handleExportChat = () => {
    const formatted = messages
      .map((m) => {
        const author = m.role === 'assistant' ? 'FXC AI' : 'Você';
        const date = new Date(m.timestamp).toLocaleString('pt-BR');
        return `### ${author} (${date})\n\n${m.content}\n\n---\n`;
      })
      .join('\n');

    const header = `# Conversa com FXC AI\nData: ${new Date().toLocaleDateString(
      'pt-BR'
    )}\n\n> Aviso: A IA pode cometer erros. Verifique informações importantes.\n\n---\n\n`;

    const blob = new Blob([header + formatted], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FXC-AI-Chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#06070d] text-slate-100 bg-grid-pattern selection:bg-purple-600 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />

      {/* Header */}
      <Header
        onClear={handleClearChat}
        onOpenGuide={() => setIsGuideOpen(true)}
        onExport={handleExportChat}
        hasMessages={messages.length > 1}
      />

      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Chat Scroll Container */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 w-full max-w-5xl mx-auto space-y-6"
      >
        {/* Welcome Hero when only initial message exists */}
        {messages.length === 1 && (
          <div className="text-center py-6 sm:py-8 space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/30 border border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.25)]">
              <Sparkles className="text-purple-400 w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bem-vindo à{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                FXC AI
              </span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              Sua assistente inteligente especializada no universo da Inteligência Artificial.
              Descubra os benefícios transformadores, compreenda os riscos e aprenda as melhores
              práticas para um uso ético e seguro.
            </p>
          </div>
        )}

        {/* Message List */}
        <div className="space-y-5">
          {messages.map((message, index) => {
            const isLastAssistant =
              message.role === 'assistant' && index === messages.length - 1;
            return (
              <ChatMessageItem
                key={message.id}
                message={message}
                onRetry={isLastAssistant ? handleRetry : undefined}
                isLastAssistant={isLastAssistant}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        {messages.length <= 3 && !isLoading && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
              <MessageSquare size={13} className="text-purple-400" />
              <span>Sugestões rápidas de perguntas:</span>
            </div>
            <QuickPrompts onSelectPrompt={handleSendMessage} disabled={isLoading} />
          </div>
        )}
      </main>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-28 right-6 z-20 p-2.5 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all animate-bounce"
          title="Rolar para a mensagem mais recente"
          aria-label="Rolar para baixo"
        >
          <ArrowDown size={16} />
        </button>
      )}

      {/* Chat Input Floating Dock */}
      <footer className="sticky bottom-0 z-30 w-full bg-gradient-to-t from-[#06070d] via-[#06070d]/95 to-transparent px-4 pb-4 pt-2">
        <div className="max-w-5xl mx-auto space-y-2">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStop={handleStopStreaming}
          />
          <div className="text-center text-[10.5px] text-slate-500">
            <span>FXC AI pode cometer erros e alucinações. Sempre confira dados essenciais.</span>
          </div>
        </div>
      </footer>

      {/* Responsible AI Educational Guide Modal */}
      <ResponsibleAiModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onAskAbout={(prompt) => handleSendMessage(prompt)}
      />
    </div>
  );
}
