import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Search, Star, Trash2, Copy, ArrowUpDown, CheckSquare, X } from 'lucide-react';
import { db } from '../db/database';
import type { Prompt } from '../types';
import { useClipboard } from '../hooks/useClipboard';
import { useExport } from '../hooks/useExport';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

type SortMode = 'newest' | 'oldest' | 'favorites';

export default function LibraryPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();
  const { copy } = useClipboard();
  const { exportBatchJSON } = useExport();

  useEffect(() => { loadPrompts(); }, []);

  async function loadPrompts() {
    const all = await db.prompts.toArray();
    setPrompts(all);
    const tags = new Set<string>();
    all.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    setAllTags(Array.from(tags).sort());
  }

  const filtered = useMemo(() => {
    let result = prompts.filter((p) => {
      const matchesSearch = !debouncedSearch ||
        p.input.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.structuredPrompt.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });

    switch (sortMode) {
      case 'newest': result.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'oldest': result.sort((a, b) => a.createdAt - b.createdAt); break;
      case 'favorites': result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || b.createdAt - a.createdAt); break;
    }

    return result;
  }, [prompts, debouncedSearch, activeTag, sortMode]);

  const hasSearchOrFilter = debouncedSearch || activeTag;

  async function toggleFavorite(prompt: Prompt) {
    await db.prompts.update(prompt.id, { isFavorite: !prompt.isFavorite, updatedAt: Date.now() });
    loadPrompts();
  }

  async function deletePrompt(id: string) {
    await db.prompts.delete(id);
    toast.success('已删除');
    loadPrompts();
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    await db.prompts.bulkDelete(Array.from(selected));
    toast.success(`已删除 ${selected.size} 条`);
    setSelected(new Set());
    setSelectMode(false);
    loadPrompts();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Library size={22} className="text-blue-500" />
              提示词库
              <span className="text-sm font-normal text-gray-400 ml-1">({filtered.length})</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">管理和复用你的提示词</p>
          </div>
          <div className="flex items-center gap-2">
            {selectMode && (
              <>
                <span className="text-xs text-gray-500">已选 {selected.size}</span>
                {selected.size > 0 && (
                  <button
                    onClick={deleteSelected}
                    className="px-3 py-1.5 text-xs bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    删除选中
                  </button>
                )}
                <button
                  onClick={() => { setSelectMode(false); setSelected(new Set()); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              </>
            )}
            {!selectMode && prompts.length > 0 && (
              <button
                onClick={() => setSelectMode(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="批量选择"
              >
                <CheckSquare size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索提示词..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="newest">最新</option>
            <option value="oldest">最早</option>
            <option value="favorites">收藏优先</option>
          </select>
        </div>
        {allTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${!activeTag ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${activeTag === tag ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prompts Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Library size={48} className="mb-4 opacity-30" />
            {hasSearchOrFilter ? (
              <>
                <p className="text-lg font-medium">未找到匹配的提示词</p>
                <p className="text-sm mt-1">尝试修改搜索关键词或筛选条件</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">暂无提示词</p>
                <p className="text-sm mt-1">去「生成提示词」页面创建你的第一个提示词</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((prompt) => (
              <div
                key={prompt.id}
                className={`bg-white dark:bg-gray-900 rounded-xl p-4 border transition-all cursor-pointer group ${
                  selectMode && selected.has(prompt.id)
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                }`}
                onClick={() => selectMode ? toggleSelect(prompt.id) : navigate(`/library/${prompt.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selected.has(prompt.id)}
                      onChange={() => toggleSelect(prompt.id)}
                      className="mr-2 mt-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
                    {prompt.input}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(prompt); }}
                    className="ml-2 text-gray-300 hover:text-yellow-400 transition-colors shrink-0"
                  >
                    <Star size={16} fill={prompt.isFavorite ? '#facc15' : 'none'} color={prompt.isFavorite ? '#facc15' : 'currentColor'} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">
                  {prompt.structuredPrompt.slice(0, 150)}
                </p>
                {prompt.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-2">
                    {prompt.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {new Date(prompt.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  {!selectMode && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); copy(prompt.structuredPrompt); }}
                        className="p-1 text-gray-400 hover:text-blue-500"
                        title="复制"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePrompt(prompt.id); }}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
