import { db } from './database';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants/defaults';

const SETTINGS_KEY = 'app-settings';

export async function loadSettings(): Promise<AppSettings> {
  const record = await db.prompts.get(SETTINGS_KEY) as unknown as AppSettings | undefined;
  if (!record) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...record };
}

// Settings stored in localStorage for simplicity (no need for IndexedDB indexes)
const STORAGE_KEY = 'prompt-integrator-settings';

export function loadSettingsSync(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
