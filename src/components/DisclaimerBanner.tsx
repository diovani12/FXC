import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div className="max-w-5xl mx-auto px-4 pt-2">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-1.5 text-[11px] text-amber-400/90 hover:text-amber-300 bg-amber-950/20 px-2.5 py-1 rounded-full border border-amber-500/20 transition mx-auto"
        >
          <AlertTriangle size={12} />
          <span>A IA pode cometer erros • Clique para ver aviso</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pt-3">
      <div className="relative flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-950/30 via-purple-950/20 to-blue-950/30 border border-amber-500/30 text-amber-200/90 text-xs shadow-[0_0_15px_rgba(245,158,11,0.08)]">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <AlertTriangle size={13} />
          </div>
          <p className="truncate sm:whitespace-normal text-[11.5px] leading-snug">
            <strong className="text-amber-300 font-semibold">Aviso Importante:</strong> A FXC AI
            pode cometer erros e gerar alucinações. Sempre confirme informações críticas e use a
            inteligência artificial com responsabilidade.
          </p>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="text-amber-400/70 hover:text-amber-300 p-1 rounded-md transition hover:bg-amber-500/10 shrink-0"
          title="Minimizar aviso"
          aria-label="Minimizar aviso"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
