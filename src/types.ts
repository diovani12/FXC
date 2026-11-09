export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
}

export type TopicCategory = 'all' | 'beneficios' | 'riscos' | 'responsabilidade' | 'erros';

export interface PromptSuggestion {
  id: string;
  category: TopicCategory;
  title: string;
  prompt: string;
  icon: string;
}
