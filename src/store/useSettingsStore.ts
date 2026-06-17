import { create } from 'zustand';
import type { AppSettings } from '../types';
import { loadSettingsSync, saveSettings } from '../db/settings';
import { DEFAULT_SETTINGS } from '../constants/defaults';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  setProviderKey: (providerId: string, apiKey: string) => void;
  setActiveProvider: (providerId: string) => void;
  setProviderModel: (providerId: string, model: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: loadSettingsSync(),

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    saveSettings(updated);
  },

  setProviderKey: (providerId, apiKey) => {
    const settings = get().settings;
    const providers = { ...settings.providers };
    providers[providerId] = {
      ...DEFAULT_SETTINGS.providers[providerId],
      ...(providers[providerId] || {}),
      apiKey,
    };
    const updated = { ...settings, providers };
    set({ settings: updated });
    saveSettings(updated);
  },

  setActiveProvider: (providerId) => {
    get().updateSettings({ activeProviderId: providerId });
  },

  setProviderModel: (providerId, model) => {
    const settings = get().settings;
    const providers = { ...settings.providers };
    if (providers[providerId]) {
      providers[providerId] = { ...providers[providerId], defaultModel: model };
    }
    const updated = { ...settings, providers };
    set({ settings: updated });
    saveSettings(updated);
  },
}));
