import type { ModelInfo } from '../types';

export const CLAUDE_MODELS: ModelInfo[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', contextWindow: 200000, supportsStreaming: true },
  { id: 'claude-haiku-35-20241022', name: 'Claude 3.5 Haiku', contextWindow: 200000, supportsStreaming: true },
];

export const OPENAI_MODELS: ModelInfo[] = [
  { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, supportsStreaming: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, supportsStreaming: true },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, supportsStreaming: true },
];

export const MOCK_MODELS: ModelInfo[] = [
  { id: 'mock-model', name: 'Mock Model (测试)', contextWindow: 4096, supportsStreaming: true },
];
