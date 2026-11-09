import React, { useState } from 'react';
import { PromptSuggestion, TopicCategory } from '../types';
import { Sparkles, AlertOctagon, ShieldCheck, HelpCircle, Layers } from 'lucide-react';

const SUGGESTIONS: PromptSuggestion[] = [
  {
    id: '1',
    category: 'beneficios',
    title: 'Benefícios na Medicina & Ciência',
    prompt:
      'Quais são os maiores benefícios da Inteligência Artificial na medicina, saúde e aceleração de pesquisas científicas?',
    icon: '✨',
  },
  {
    id: '2',
    category: 'beneficios',
    title: 'Aumento de Produtividade',
    prompt:
      'Como a IA generativa está revolucionando a produtividade diária de estudantes, programadores e empresas?',
    icon: '⚡',
  },
  {
    id: '3',
    category: 'riscos',
    title: 'Principais Riscos da IA',
    prompt:
      'Quais são os maiores riscos éticos, sociais e de segurança envolvidos no avanço rápido da Inteligência Artificial?',
    icon: '⚠️',
  },
  {
    id: '4',
    category: 'riscos',
    title: 'Viés Algorítmico & Discriminação',
    prompt:
      'O que é viés algorítmico na IA, como ele se manifesta e quais são os perigos para a sociedade?',
    icon: '⚖️',
  },
  {
    id: '5',
    category: 'responsabilidade',
    title: 'Diretrizes de Uso Responsável',
    prompt:
      'Quais são as melhores práticas e diretrizes para usar a inteligência artificial com responsabilidade e ética?',
    icon: '🛡️',
  },
  {
    id: '6',
    category: 'responsabilidade',
    title: 'Privacidade & Proteção de Dados',
    prompt:
      'Como garantir a privacidade dos meus dados e segurança ao interagir com ferramentas de inteligência artificial?',
    icon: '🔒',
  },
  {
    id: '7',
    category: 'erros',
    title: 'Por que a IA comete erros?',
    prompt:
      'Por que a inteligência artificial comete erros e tem alucinações? Como posso identificar respostas incorretas?',
    icon: '🔍',
  },
  {
    id: '8',
    category: 'erros',
    title: 'Como Checar e Validar Respostas',
    prompt:
      'Dicas práticas para checar e validar fatos gerados por IA antes de utilizá-los em trabalhos ou decisões.',
    icon: '✅',
  },
];

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, disabled }) => {
  const [activeCategory, setActiveCategory] = useState<TopicCategory>('all');

  const categories: { id: TopicCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Todos os Tópicos', icon: <Layers size={13} /> },
    { id: 'beneficios', label: 'Benefícios', icon: <Sparkles size={13} /> },
    { id: 'riscos', label: 'Riscos', icon: <AlertOctagon size={13} /> },
    { id: 'responsabilidade', label: 'Uso Responsável', icon: <ShieldCheck size={13} /> },
    { id: 'erros', label: 'Erros & Alucinações', icon: <HelpCircle size={13} /> },
  ];

  const filtered =
    activeCategory === 'all'
      ? SUGGESTIONS
      : SUGGESTIONS.filter((s) => s.category === activeCategory);

  return (
    <div className="w-full space-y-3 pt-2 pb-1">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-purple-400/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-purple-500/15'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.slice(0, 4).map((s) => (
          <button
            key={s.id}
            disabled={disabled}
            onClick={() => onSelectPrompt(s.prompt)}
            className="group text-left p-3 rounded-xl bg-slate-900/40 hover:bg-gradient-to-br hover:from-blue-950/40 hover:to-purple-950/40 border border-purple-500/20 hover:border-purple-400/50 transition-all shadow-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] flex items-start gap-2.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="text-lg shrink-0 mt-0.5">{s.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                {s.title}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 group-hover:text-slate-300">
                {s.prompt}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
