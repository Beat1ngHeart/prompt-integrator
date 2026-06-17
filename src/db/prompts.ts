import { db } from './database';
import type { Prompt } from '../types';

export async function addPrompt(prompt: Prompt): Promise<string> {
  return db.prompts.add(prompt);
}

export async function getPrompt(id: string): Promise<Prompt | undefined> {
  return db.prompts.get(id);
}

export async function updatePrompt(id: string, changes: Partial<Prompt>): Promise<number> {
  return db.prompts.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deletePrompt(id: string): Promise<void> {
  return db.prompts.delete(id);
}

export async function getAllPrompts(): Promise<Prompt[]> {
  return db.prompts.orderBy('createdAt').reverse().toArray();
}

export async function searchPrompts(query: string): Promise<Prompt[]> {
  const q = query.toLowerCase();
  return db.prompts
    .filter((p) =>
      p.input.toLowerCase().includes(q) ||
      p.structuredPrompt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    )
    .reverse()
    .sortBy('createdAt');
}

export async function getPromptsByTag(tag: string): Promise<Prompt[]> {
  return db.prompts.where('tags').equals(tag).reverse().sortBy('createdAt');
}

export async function getFavoritePrompts(): Promise<Prompt[]> {
  return db.prompts.where('isFavorite').equals(1).reverse().sortBy('createdAt');
}

export async function getAllTags(): Promise<string[]> {
  const prompts = await db.prompts.toArray();
  const tags = new Set<string>();
  prompts.forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}
