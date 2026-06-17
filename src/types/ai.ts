export interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  supportsStreaming: boolean;
}

export interface GenerateOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ProviderConfig {
  apiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
}

export interface AppSettings {
  activeProviderId: string;
  providers: Record<string, ProviderConfig>;
  theme: 'light' | 'dark' | 'system';
}

export interface AIProvider {
  name: string;
  id: string;
  supportedModels: ModelInfo[];
  generateStructuredPrompt(
    input: string,
    options: GenerateOptions,
    onChunk: (chunk: string) => void
  ): Promise<string>;
  validateApiKey(key: string): Promise<boolean>;
}
