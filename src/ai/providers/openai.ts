import OpenAI from 'openai';
import type { AIProvider, GenerateOptions, ModelInfo } from '../../types';
import { OPENAI_MODELS } from '../../constants/ai-models';
import { SYSTEM_PROMPT } from '../prompts';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  id = 'openai';
  supportedModels: ModelInfo[] = OPENAI_MODELS;

  private getClient(apiKey: string) {
    return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateStructuredPrompt(
    input: string,
    options: GenerateOptions,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const client = this.getClient(options.systemPrompt || '');
    const systemPrompt = options.systemPrompt || SYSTEM_PROMPT;

    const stream = await client.chat.completions.create({
      model: options.model || 'gpt-4o',
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
    });

    let fullText = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    return fullText;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = this.getClient(apiKey);
      await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
