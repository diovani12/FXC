import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Mic, MicOff, Sparkles, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStop,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-[#090b16]/95 border border-purple-500/30 p-2 sm:p-2.5 shadow-[0_4px_30px_rgba(139,92,246,0.15)] focus-within:border-purple-400 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)] transition-all"
      >
        <div className="flex items-end gap-2">
          {/* Voice Input Button */}
          {recognitionRef.current && (
            <button
              type="button"
              onClick={toggleVoice}
              disabled={isLoading}
              className={`p-2.5 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-purple-950/40'
              }`}
              title={isListening ? 'Ouvindo... Clique para cancelar' : 'Falar pergunta (Microfone)'}
              aria-label="Entrada por voz"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte à FXC AI sobre benefícios, riscos, ética ou funcionamento da IA..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none resize-none py-1.5 px-2 max-h-[180px] leading-relaxed"
          />

          {/* Action Button: Stop or Send */}
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] transition shrink-0"
              title="Interromper geração"
            >
              <Square size={17} className="fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all shrink-0 group"
              title="Enviar pergunta (Enter)"
            >
              <Send size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-2 pt-1.5 mt-1 border-t border-purple-500/10 text-[10.5px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-purple-400" />
            <span>FXC AI conectada com Gemini 3.8 Flash</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <span>Pressione</span>
            <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px] border border-purple-500/20 flex items-center">
              Enter <CornerDownLeft size={8} className="ml-0.5" />
            </kbd>
            <span>para enviar</span>
          </div>
        </div>
      </form>
    </div>
  );
};
