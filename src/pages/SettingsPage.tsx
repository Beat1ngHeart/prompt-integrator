import { useState } from 'react';
import { Settings, Key, CheckCircle, AlertCircle, Sun, Moon, Monitor, Trash2, Thermometer } from 'lucide-react';
import { useSettingsStore, useUIStore } from '../store';
import { getProvider, getAllProviders } from '../ai/registry';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const themeIcons = { light: Sun, dark: Moon, system: Monitor };
const themeLabels = { light: '浅色模式', dark: '深色模式', system: '跟随系统' };

export default function SettingsPage() {
  const { settings, setProviderKey, setActiveProvider, setProviderModel, updateSettings } = useSettingsStore();
  const { theme, setTheme } = useUIStore();
  const [testStatus, setTestStatus] = useState<Record<string, 'testing' | 'ok' | 'fail'>>({});

  const providers = getAllProviders();

  async function handleTestKey(providerId: string) {
    const provider = getProvider(providerId);
    const config = settings.providers[providerId];
    if (!provider || !config?.apiKey) {
      toast.error('请先输入 API Key');
      return;
    }
    setTestStatus((s) => ({ ...s, [providerId]: 'testing' }));
    const valid = await provider.validateApiKey(config.apiKey);
    setTestStatus((s) => ({ ...s, [providerId]: valid ? 'ok' : 'fail' }));
    toast[valid ? 'success' : 'error'](valid ? 'API Key 验证成功' : 'API Key 验证失败');
  }

  function updateProviderConfig(providerId: string, field: string, value: any) {
    const providers = { ...settings.providers };
    providers[providerId] = { ...(providers[providerId] || { apiKey: '', defaultModel: '', temperature: 0.7, maxTokens: 4096 }), [field]: value };
    updateSettings({ providers });
  }

  function clearKey(providerId: string) {
    setProviderKey(providerId, '');
    setTestStatus((s) => { const n = { ...s }; delete n[providerId]; return n; });
    toast.success('已清除');
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings size={22} className="text-blue-500" />
          设置
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-2xl space-y-8">
        {/* Theme */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">外观</h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(themeLabels) as Array<keyof typeof themeLabels>).map((t) => {
              const Icon = themeIcons[t];
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    theme === t
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon size={20} className={`mx-auto mb-1 ${theme === t ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  <div className={`text-xs font-medium ${theme === t ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                    {themeLabels[t]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Provider */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">AI 模型</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProvider(p.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  settings.activeProviderId === p.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">{p.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {p.supportedModels.length} 个模型可用
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Provider Configs */}
        {providers.map((p) => (
          <div key={p.id}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Key size={14} />
              {p.name} 配置
            </h3>
            <div className="space-y-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              {p.id !== 'mock' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={settings.providers[p.id]?.apiKey || ''}
                      onChange={(e) => setProviderKey(p.id, e.target.value)}
                      placeholder={`输入 ${p.name} API Key`}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                    <Button variant="secondary" size="sm" onClick={() => handleTestKey(p.id)}>
                      {testStatus[p.id] === 'testing' ? '...' : '验证'}
                    </Button>
                    {settings.providers[p.id]?.apiKey && (
                      <Button variant="ghost" size="sm" onClick={() => clearKey(p.id)} className="text-red-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </Button>
                    )}
                    <div className="w-5 flex items-center justify-center shrink-0">
                      {testStatus[p.id] === 'ok' && <CheckCircle size={18} className="text-green-500" />}
                      {testStatus[p.id] === 'fail' && <AlertCircle size={18} className="text-red-500" />}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">默认模型</label>
                <select
                  value={settings.providers[p.id]?.defaultModel || p.supportedModels[0]?.id || ''}
                  onChange={(e) => setProviderModel(p.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  {p.supportedModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                  <Thermometer size={12} />
                  Temperature
                  <span className="ml-auto font-mono text-blue-600 dark:text-blue-400">
                    {(settings.providers[p.id]?.temperature ?? 0.7).toFixed(1)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.providers[p.id]?.temperature ?? 0.7}
                  onChange={(e) => updateProviderConfig(p.id, 'temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>精确 (0)</span>
                  <span>平衡 (1)</span>
                  <span>创意 (2)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">最大输出长度 (tokens)</label>
                <input
                  type="number"
                  min="256"
                  max="16384"
                  step="256"
                  value={settings.providers[p.id]?.maxTokens || 4096}
                  onChange={(e) => updateProviderConfig(p.id, 'maxTokens', parseInt(e.target.value) || 4096)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            API Key 仅存储在浏览器本地，不会上传到任何服务器。请勿在公共设备上使用。
          </p>
        </div>
      </div>
    </div>
  );
}
