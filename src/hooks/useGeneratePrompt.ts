import { useRef, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { Prompt, MindMapNode } from '../types';
import { usePromptStore } from '../store';
import { useSettingsStore } from '../store';
import { getActiveProvider } from '../ai/registry';
import { SYSTEM_PROMPT } from '../ai/prompts';
import { addPrompt } from '../db/prompts';

function tryParseResponse(text: string): { structuredPrompt: string; tree: MindMapNode } | null {
  // Find JSON block - try ```json ... ``` first, then raw {...}
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1] : text.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonStr) return null;

  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.structured_prompt && parsed.tree) {
      return {
        structuredPrompt: parsed.structured_prompt,
        tree: normalizeTree(parsed.tree),
      };
    }
  } catch {
    // Try fixing common JSON issues (trailing commas)
    try {
      const fixed = jsonStr.replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(fixed);
      if (parsed.structured_prompt && parsed.tree) {
        return {
          structuredPrompt: parsed.structured_prompt,
          tree: normalizeTree(parsed.tree),
        };
      }
    } catch {}
  }
  return null;
}

function normalizeTree(node: any, depth = 0): MindMapNode {
  return {
    id: node.id || `node-${depth}-${nanoid(6)}`,
    name: node.name || '未命名',
    description: node.description,
    children: Array.isArray(node.children)
      ? node.children.map((c: any) => normalizeTree(c, depth + 1))
      : [],
    collapsed: depth >= 2,
  };
}

function fallbackMarkdownToTree(text: string): MindMapNode {
  const lines = text.split('\n');
  const root: MindMapNode = { id: 'root', name: '提示词结构', children: [] };
  const stack: { node: MindMapNode; level: number }[] = [{ node: root, level: 0 }];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const name = match[2].replace(/\*\*/g, '').trim();
      const newNode: MindMapNode = {
        id: `heading-${nanoid(6)}`,
        name,
        children: [],
        collapsed: level >= 3,
      };

      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      stack[stack.length - 1].node.children.push(newNode);
      stack.push({ node: newNode, level });
    }
  }

  return root;
}

export function useGeneratePrompt() {
  const settings = useSettingsStore((s) => s.settings);
  const abortRef = useRef<AbortController | null>(null);
  const store = usePromptStore();

  const generate = useCallback(async (input: string): Promise<Prompt | null> => {
    if (!input.trim()) return null;

    // Cancel any previous generation
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    store.setIsGenerating(true);
    store.setStreamedText('');
    store.setError(null);

    try {
      const providerId = settings.activeProviderId;
      const provider = getActiveProvider(providerId);
      const providerConfig = settings.providers[providerId];

      const rawResponse = await provider.generateStructuredPrompt(
        input,
        {
          model: providerConfig?.defaultModel || provider.supportedModels[0]?.id || 'mock-model',
          temperature: providerConfig?.temperature ?? 0.7,
          maxTokens: providerConfig?.maxTokens || 4096,
          systemPrompt: SYSTEM_PROMPT,
        },
        (chunk) => {
          if (controller.signal.aborted) return;
          store.appendStreamedText(chunk);
        }
      );

      if (controller.signal.aborted) return null;

      // Parse the response
      const parsed = tryParseResponse(rawResponse);
      const structuredPrompt = parsed?.structuredPrompt || rawResponse;
      const tree = parsed?.tree || fallbackMarkdownToTree(rawResponse);

      const prompt: Prompt = {
        id: nanoid(),
        input,
        structuredPrompt,
        tree,
        tags: [],
        category: '',
        provider: providerId,
        model: providerConfig?.defaultModel || provider.supportedModels[0]?.id || 'mock-model',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false,
        notes: '',
      };

      store.setCurrentPrompt(prompt);
      return prompt;
    } catch (err) {
      if (controller.signal.aborted) return null;
      const message = err instanceof Error ? err.message : '生成失败，请重试';
      store.setError(message);
      return null;
    } finally {
      if (!controller.signal.aborted) {
        store.setIsGenerating(false);
      }
      abortRef.current = null;
    }
  }, [settings, store]);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      store.setIsGenerating(false);
      store.setError(null);
    }
  }, [store]);

  const generateAndSave = useCallback(async (input: string): Promise<Prompt | null> => {
    const prompt = await generate(input);
    if (prompt) {
      await addPrompt(prompt);
    }
    return prompt;
  }, [generate]);

  return { generate, cancel, generateAndSave };
}
