import Dexie, { type Table } from 'dexie';
import type { Prompt } from '../types';

class PromptIntegratorDB extends Dexie {
  prompts!: Table<Prompt, string>;

  constructor() {
    super('PromptIntegratorDB');
    this.version(1).stores({
      prompts: 'id, input, category, *tags, createdAt, updatedAt, isFavorite, provider',
    });
  }
}

export const db = new PromptIntegratorDB();
