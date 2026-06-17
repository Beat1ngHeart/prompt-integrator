import type { AIProvider } from '../types';
import { MockProvider } from './providers/mock';
import { ClaudeProvider } from './providers/claude';
import { OpenAIProvider } from './providers/openai';

const providers: Map<string, AIProvider> = new Map();

function register(provider: AIProvider) {
  providers.set(provider.id, provider);
}

register(new MockProvider());
register(new ClaudeProvider());
register(new OpenAIProvider());

export function getProvider(id: string): AIProvider | undefined {
  return providers.get(id);
}

export function getAllProviders(): AIProvider[] {
  return Array.from(providers.values());
}

export function getActiveProvider(activeProviderId: string): AIProvider {
  return providers.get(activeProviderId) || providers.get('mock')!;
}
