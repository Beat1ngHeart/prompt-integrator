import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Save, Trash2, Star, FileText, Download } from 'lucide-react';
import { db } from '../db/database';
import type { Prompt } from '../types';
import { useClipboard } from '../hooks/useClipboard';
import { useExport } from '../hooks/useExport';
import { MindMapCanvas } from '../components/mindmap/MindMapCanvas';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [editedTags, setEditedTags] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { copy } = useClipboard();
  const { exportAsMarkdown, exportAsJSON, exportAsText } = useExport();

  useEffect(() => {
    if (id) loadPrompt(id);
  }, [id]);

  // Auto-resize textarea in edit mode
  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = Math.max(300, el.scrollHeight) + 'px';
    }
  }, [editing, editedText]);

  async function loadPrompt(promptId: string) {
    setLoading(true);
    setNotFound(false);
    const p = await db.prompts.get(promptId);
    if (p) {
      setPrompt(p);
      setEditedText(p.structuredPrompt);
      setEditedTags(p.tags.join(', '));
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!prompt) return;
    await db.prompts.update(prompt.id, {
      structuredPrompt: editedText,
      tags: editedTags.split(',').map((t) => t.trim()).filter(Boolean),
      updatedAt: Date.now(),
    });
    toast.success('已保存');
    setEditing(false);
    loadPrompt(prompt.id);
  }

  async function handleDelete() {
    if (!prompt) return;
    await db.prompts.delete(prompt.id);
    toast.success('已删除');
    navigate('/library');
  }

  async function toggleFavorite() {
    if (!prompt) return;
    await db.prompts.update(prompt.id, { isFavorite: !prompt.isFavorite, updatedAt: Date.now() });
    loadPrompt(prompt.id);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">加载中...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <FileText size={28} className="text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">提示词不存在</p>
        <p className="text-sm text-gray-400">该提示词可能已被删除</p>
        <Button variant="secondary" onClick={() => navigate('/library')}>返回提示词库</Button>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/library')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{prompt.input}</h2>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
            <span>创建: {new Date(prompt.createdAt).toLocaleString('zh-CN')}</span>
            {prompt.updatedAt !== prompt.createdAt && (
              <span>· 更新: {new Date(prompt.updatedAt).toLocaleString('zh-CN')}</span>
            )}
            <span>· {prompt.provider}</span>
          </p>
        </div>
        <button onClick={toggleFavorite} className="text-gray-300 hover:text-yellow-400 transition-colors shrink-0">
          <Star size={20} fill={prompt.isFavorite ? '#facc15' : 'none'} color={prompt.isFavorite ? '#facc15' : 'currentColor'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Actions */}
        <div className="flex gap-2 flex-wrap bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
          {editing ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save size={14} className="mr-1" /> 保存
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setEditedText(prompt.structuredPrompt); setEditedTags(prompt.tags.join(', ')); }}>
                取消
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>编辑</Button>
              <Button variant="secondary" size="sm" onClick={() => copy(prompt.structuredPrompt)}>
                <Copy size={14} className="mr-1" /> 复制
              </Button>
              <Button variant="secondary" size="sm" onClick={() => exportAsMarkdown(prompt)}>
                <Download size={14} className="mr-1" /> 导出
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 size={14} className="mr-1" /> 删除
              </Button>
            </>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">标签</label>
          {editing ? (
            <input
              value={editedTags}
              onChange={(e) => setEditedTags(e.target.value)}
              placeholder="用逗号分隔标签，如：写作, 营销, AI"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          ) : (
            <div className="flex gap-1.5 flex-wrap">
              {prompt.tags.length > 0 ? prompt.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">{tag}</span>
              )) : <span className="text-xs text-gray-400">无标签</span>}
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <FileText size={15} className="text-blue-500" />
              结构化提示词
            </h3>
            {editing ? (
              <textarea
                ref={textareaRef}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full min-h-[300px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white font-mono leading-relaxed"
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-[600px] overflow-auto">
                {prompt.structuredPrompt}
              </pre>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-5 pt-4 pb-2 flex items-center gap-2">
              <Star size={15} className="text-violet-500" />
              思维导图
            </h3>
            <MindMapCanvas data={prompt.tree} />
          </div>
        </div>
      </div>
    </div>
  );
}
