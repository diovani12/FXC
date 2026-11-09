import React from 'react';
import { X, Sparkles, AlertOctagon, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface ResponsibleAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAbout: (topic: string) => void;
}

export const ResponsibleAiModal: React.FC<ResponsibleAiModalProps> = ({
  isOpen,
  onClose,
  onAskAbout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#090b16] border border-purple-500/30 p-6 shadow-[0_0_50px_rgba(139,92,246,0.25)] text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-950/40 transition"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <div className="w-full h-full bg-[#0b0e1c] rounded-[14px] flex items-center justify-center">
              <ShieldCheck size={24} className="text-purple-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Guia FXC: Benefícios, Riscos e Uso Ético da IA
            </h2>
            <p className="text-xs text-slate-400">
              Pilares fundamentais para navegar no futuro da inteligência artificial
            </p>
          </div>
        </div>

        {/* Warning Banner: AI Mistakes */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-300 text-sm">
              Lembre-se: A IA pode cometer erros e ter alucinações
            </h4>
            <p className="leading-relaxed text-amber-200/90">
              Modelos de linguagem prevêem sequências de palavras e não possuem consciência ou compreensão real de mundo. Por isso, a FXC AI e qualquer outra IA podem gerar respostas convincentes porém incorretas (alucinações). Nunca utilize saídas de IA em diagnósticos médicos, decisões judiciais ou investimentos sem validação humana especializada.
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Benefícios */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-blue-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-bold text-sm text-blue-300">1. Benefícios Transformadores</h3>
              </div>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong className="text-white">Medicina:</strong> Triagem acelerada e novos fármacos.</li>
              <li><strong className="text-white">Produtividade:</strong> Automação de tarefas repetitivas.</li>
              <li><strong className="text-white">Acessibilidade:</strong> Tradução em tempo real e apoio a PCDs.</li>
              <li><strong className="text-white">Educação:</strong> Tutoria hiperpersonalizada no ritmo do aluno.</li>
            </ul>
            <button
              onClick={() => {
                onAskAbout('Quais são os maiores benefícios da Inteligência Artificial na medicina e produtividade humana?');
                onClose();
              }}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <span>Perguntar sobre benefícios</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Pillar 2: Riscos */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-purple-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <AlertOctagon size={16} />
                </div>
                <h3 className="font-bold text-sm text-purple-300">2. Riscos & Desafios</h3>
              </div>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong className="text-white">Vieses Algorítmicos:</strong> Perpetuação de preconceitos históricos.</li>
              <li><strong className="text-white">Deepfakes:</strong> Desinformação e manipulação eleitoral.</li>
              <li><strong className="text-white">Privacidade:</strong> Vazamento de dados confidenciais e biométricos.</li>
              <li><strong className="text-white">Mercado de Trabalho:</strong> Deslocamento rápido de profissões.</li>
            </ul>
            <button
              onClick={() => {
                onAskAbout('Quais são os riscos mais graves do avanço descontrolado da inteligência artificial?');
                onClose();
              }}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <span>Perguntar sobre riscos</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Pillar 3: Uso Responsável */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-indigo-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="font-bold text-sm text-indigo-300">3. Uso Responsável & Ético</h3>
              </div>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong className="text-white">Supervisão Humana:</strong> Decisões finais com intervenção humana.</li>
              <li><strong className="text-white">Transparência:</strong> Informar quando um conteúdo foi gerado por IA.</li>
              <li><strong className="text-white">Conformidade:</strong> Respeito à LGPD e direitos autorais.</li>
              <li><strong className="text-white">Segurança:</strong> Auditorias constantes contra vulnerabilidades.</li>
            </ul>
            <button
              onClick={() => {
                onAskAbout('Como empresas e pessoas podem implementar diretrizes de uso responsável e ético da IA?');
                onClose();
              }}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <span>Perguntar sobre uso ético</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Pillar 4: Lidando com Erros */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-amber-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <h3 className="font-bold text-sm text-amber-300">4. Alucinações & Mitigação</h3>
              </div>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong className="text-white">Checagem Cruzada:</strong> Compare sempre com fontes originais.</li>
              <li><strong className="text-white">Prompts Claros:</strong> Peça justificativas e passos lógicos.</li>
              <li><strong className="text-white">Postura Crítica:</strong> Desconfie de dados sem citação verificável.</li>
              <li><strong className="text-white">Feedback Contínuo:</strong> Reporte erros para aperfeiçoar modelos.</li>
            </ul>
            <button
              onClick={() => {
                onAskAbout('Por que a IA inventa informações ou alucina, e como podemos nos prevenir contra erros da IA?');
                onClose();
              }}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <span>Perguntar sobre alucinações</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-purple-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-xs shadow-[0_0_20px_rgba(139,92,246,0.35)] transition"
          >
            Entendido, voltar ao chat
          </button>
        </div>
      </div>
    </div>
  );
};
