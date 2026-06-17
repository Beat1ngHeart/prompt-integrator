import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, GenerateOptions, ModelInfo } from '../../types';
import { CLAUDE_MODELS } from '../../constants/ai-models';
import { SYSTEM_PROMPT } from '../prompts';

export class ClaudeProvider implements AIProvider {
  name = 'Claude';
  id = 'claude';
  supportedModels: ModelInfo[] = CLAUDE_MODELS;

  private getClient(apiKey: string) {
    return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateStructuredPrompt(
    input: string,
    options: GenerateOptions,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const client = this.getClient(options.systemPrompt || '');
    const systemPrompt = options.systemPrompt || SYSTEM_PROMPT;

    const stream = client.messages.stream({
      model: options.model || 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: input }],
    });

    let fullText = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullText += event.delta.text;
        onChunk(event.delta.text);
      }
    }

    return fullText;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = this.getClient(apiKey);
      await client.messages.create({
        model: 'claude-haiku-35-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
