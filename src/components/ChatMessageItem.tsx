import React, { useState } from 'react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  User,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
} from 'lucide-react';

interface ChatMessageItemProps {
  message: Message;
  onRetry?: () => void;
  isLastAssistant?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRetry,
  isLastAssistant,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta síntese de voz.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    // Strip markdown formatting for cleaner speech
    const cleanText = message.content
      .replace(/[#*`_>~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;

    // Try finding pt-BR voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(
      (v) => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt')
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`w-full flex gap-3.5 transition-all ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="shrink-0 pt-0.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-[0_0_15px_rgba(139,92,246,0.35)]">
            <div className="w-full h-full bg-[#0b0d18] rounded-[10px] flex items-center justify-center">
              <Sparkles size={16} className="text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Message Card */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 transition-all ${
          isAssistant
            ? 'bg-[#0c0e1a]/90 border border-purple-500/25 shadow-[0_4px_25px_-5px_rgba(139,92,246,0.12)] text-slate-100 rounded-tl-sm'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_4px_20px_-3px_rgba(59,130,246,0.35)] rounded-tr-sm'
        }`}
      >
        {/* Header inside Bubble */}
        <div className="flex items-center justify-between gap-3 mb-2 text-xs opacity-75">
          <div className="flex items-center gap-1.5 font-semibold">
            {isAssistant ? (
              <>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  FXC AI
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 font-normal">
                  Assistente
                </span>
              </>
            ) : (
              <span>Você</span>
            )}
          </div>
          <span className="text-[10px] font-mono">{formattedTime}</span>
        </div>

        {/* Content Body */}
        {message.error ? (
          <div className="flex items-start gap-2.5 text-rose-300 text-sm py-1">
            <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-medium">{message.content}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 text-xs font-medium transition"
                >
                  <RotateCcw size={13} />
                  <span>Tentar novamente</span>
                </button>
              )}
            </div>
          </div>
        ) : isAssistant ? (
          <div className="text-sm">
            <MarkdownRenderer content={message.content} />
            {message.isStreaming && <span className="typing-cursor" />}
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )}

        {/* Action Toolbar for Assistant */}
        {isAssistant && !message.isStreaming && !message.error && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-purple-500/15 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-purple-950/40 hover:text-purple-300 transition text-[11px]"
                title="Copiar resposta"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-400" />
                ) : (
                  <Copy size={13} />
                )}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              {/* Text-to-Speech */}
              <button
                onClick={handleToggleAudio}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition text-[11px] ${
                  isPlayingAudio
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.6)]'
                    : 'hover:bg-purple-950/40 hover:text-purple-300'
                }`}
                title={isPlayingAudio ? 'Parar leitura' : 'Ouvir resposta (Voz)'}
              >
                {isPlayingAudio ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span>{isPlayingAudio ? 'Parar' : 'Ouvir'}</span>
              </button>

              {/* Regenerate if last assistant message */}
              {isLastAssistant && onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-purple-950/40 hover:text-purple-300 transition text-[11px]"
                  title="Regenerar resposta"
                >
                  <RotateCcw size={13} />
                  <span>Regenerar</span>
                </button>
              )}
            </div>

            {/* Thumbs Feedback */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                className={`p-1 rounded transition ${
                  feedback === 'up'
                    ? 'text-emerald-400 bg-emerald-950/40'
                    : 'hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Resposta útil"
              >
                <ThumbsUp size={13} />
              </button>
              <button
                onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                className={`p-1 rounded transition ${
                  feedback === 'down'
                    ? 'text-rose-400 bg-rose-950/40'
                    : 'hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Resposta não útil"
              >
                <ThumbsDown size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="shrink-0 pt-0.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 p-[1.5px] shadow-[0_0_15px_rgba(59,130,246,0.35)]">
            <div className="w-full h-full bg-[#0a0d1d] rounded-[10px] flex items-center justify-center">
              <User size={16} className="text-blue-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
