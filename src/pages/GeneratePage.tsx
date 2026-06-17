import { useState, useRef, useEffect } from 'react';
import { Sparkles, Save, Copy, RotateCcw, Download, FileText, FileJson, File, StopCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useGeneratePrompt } from '../hooks/useGeneratePrompt';
import { useClipboard } from '../hooks/useClipboard';
import { useExport } from '../hooks/useExport';
import { usePromptStore } from '../store';
import { MindMapCanvas } from '../components/mindmap/MindMapCanvas';
import { addPrompt } from '../db/prompts';
import toast from 'react-hot-toast';

export default function GeneratePage() {
  const [input, setInput] = useState('');
  const { generate, cancel } = useGeneratePrompt();
  const { isGenerating, streamedText, currentPrompt, error } = usePromptStore();
  const { copy } = useClipboard();
  const { exportAsMarkdown, exportAsJSON, exportAsText } = useExport();
  const [saved, setSaved] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Close export menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;
    setSaved(false);
    await generate(input.trim());
  };

  const handleSave = async () => {
    if (!currentPrompt) return;
    await addPrompt(currentPrompt);
    setSaved(true);
    toast.success('已保存到提示词库');
  };

  const handleCopy = () => {
    if (currentPrompt?.structuredPrompt) {
      copy(currentPrompt.structuredPrompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles size={22} className="text-blue-500" />
          提示词生成器
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          输入一句话，AI 为你生成结构化提示词和思维导图
        </p>
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你想要的提示词，例如：帮我写一个能够生成高质量营销文案的提示词"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white placeholder:text-gray-400 overflow-hidden"
            style={{ minHeight: '56px', maxHeight: '200px' }}
            rows={1}
          />
          {isGenerating ? (
            <Button
              variant="danger"
              onClick={cancel}
              className="shrink-0"
            >
              <StopCircle size={16} className="mr-1.5" />
              取消
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!input.trim()}
              className="shrink-0"
            >
              <Sparkles size={16} className="mr-1.5" />
              生成
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-3">
          <span>Ctrl+Enter 快速生成</span>
          {isGenerating && (
            <span className="inline-flex items-center gap-1.5 text-blue-500">
              <span className="animate-pulse">●</span> AI 正在生成中...
            </span>
          )}
        </p>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <span className="shrink-0">⚠️</span>
            {error}
          </div>
        )}

        {!currentPrompt && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <Sparkles size={36} className="text-blue-300 dark:text-blue-600" />
            </div>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">输入一句话开始生成</p>
            <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">AI 将为你生成结构化的提示词和思维导图</p>
          </div>
        )}

        {isGenerating && (
          <div className="space-y-4">
            {streamedText && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 relative">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                  {streamedText}
                  <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
                </pre>
              </div>
            )}
          </div>
        )}

        {currentPrompt && !isGenerating && (
          <div className="space-y-4">
            {/* Action bar */}
            <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saved}>
                <Save size={14} className="mr-1.5" />
                {saved ? '已保存' : '保存到库'}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                <Copy size={14} className="mr-1.5" />
                复制
              </Button>

              {/* Export dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <Button variant="secondary" size="sm" onClick={() => setShowExportMenu(!showExportMenu)}>
                  <Download size={14} className="mr-1.5" />
                  导出
                </Button>
                {showExportMenu && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-20 py-1">
                    <button
                      onClick={() => { currentPrompt && exportAsMarkdown(currentPrompt); setShowExportMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FileText size={14} /> Markdown
                    </button>
                    <button
                      onClick={() => { currentPrompt && exportAsJSON(currentPrompt); setShowExportMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FileJson size={14} /> JSON
                    </button>
                    <button
                      onClick={() => { currentPrompt && exportAsText(currentPrompt); setShowExportMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <File size={14} /> 纯文本
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => { setSaved(false); generate(input); }}>
                <RotateCcw size={14} className="mr-1.5" />
                重新生成
              </Button>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Structured Prompt */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-blue-500" />
                  结构化提示词
                </h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-[500px] overflow-auto">
                  {currentPrompt.structuredPrompt}
                </pre>
              </div>

              {/* Mind Map */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-5 pt-4 pb-2 flex items-center gap-2">
                  <Sparkles size={15} className="text-violet-500" />
                  思维导图
                </h3>
                <MindMapCanvas data={currentPrompt.tree} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
