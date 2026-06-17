import { create } from 'zustand';
import type { Prompt } from '../types';

interface PromptState {
  currentInput: string;
  currentPrompt: Prompt | null;
  isGenerating: boolean;
  streamedText: string;
  error: string | null;

  setInput: (input: string) => void;
  setCurrentPrompt: (prompt: Prompt | null) => void;
  setIsGenerating: (generating: boolean) => void;
  appendStreamedText: (chunk: string) => void;
  setStreamedText: (text: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePromptStore = create<PromptState>((set) => ({
  currentInput: '',
  currentPrompt: null,
  isGenerating: false,
  streamedText: '',
  error: null,

  setInput: (input) => set({ currentInput: input }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  appendStreamedText: (chunk) => set((s) => ({ streamedText: s.streamedText + chunk })),
  setStreamedText: (text) => set({ streamedText: text }),
  setError: (error) => set({ error }),
  reset: () => set({ currentInput: '', currentPrompt: null, isGenerating: false, streamedText: '', error: null }),
}));
