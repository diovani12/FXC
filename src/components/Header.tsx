import React from 'react';
import { Sparkles, Trash2, Download, ShieldCheck, Cpu } from 'lucide-react';

interface HeaderProps {
  onClear: () => void;
  onOpenGuide: () => void;
  onExport: () => void;
  hasMessages: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onClear,
  onOpenGuide,
  onExport,
  hasMessages,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#07080f]/90 backdrop-blur-md border-b border-purple-500/20 px-4 py-3 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.45)]">
              <div className="w-full h-full bg-[#090b14] rounded-[10px] flex items-center justify-center">
                <Cpu size={20} className="text-blue-400 group-hover:text-purple-300 transition-colors" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#090b14] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  FXC AI
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-purple-950/80 text-purple-300 border border-purple-500/30">
                <Sparkles size={10} className="text-purple-400" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Inteligência Artificial • Benefícios, Riscos & Uso Ético
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Guide Modal Trigger */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/40 to-blue-900/40 hover:from-purple-800/60 hover:to-blue-800/60 text-purple-200 border border-purple-500/30 text-xs font-medium transition shadow-sm hover:border-purple-400/50"
            title="Ver Guia de Benefícios, Riscos e Uso Responsável"
          >
            <ShieldCheck size={15} className="text-blue-400" />
            <span className="hidden md:inline">Pilares da IA</span>
          </button>

          {/* Export Chat */}
          {hasMessages && (
            <button
              onClick={onExport}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-purple-500/20 text-xs transition"
              title="Exportar conversa"
              aria-label="Exportar conversa"
            >
              <Download size={15} />
            </button>
          )}

          {/* Clear Chat */}
          {hasMessages && (
            <button
              onClick={onClear}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-purple-500/20 hover:border-rose-500/30 text-xs transition"
              title="Limpar conversa"
              aria-label="Limpar conversa"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
