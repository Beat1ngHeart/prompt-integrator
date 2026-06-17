import { useCallback } from 'react';
import type { Prompt } from '../types';
import toast from 'react-hot-toast';

export function useExport() {
  const exportAsMarkdown = useCallback((prompt: Prompt) => {
    const content = prompt.structuredPrompt;
    downloadFile(content, `prompt-${prompt.id}.md`, 'text/markdown');
    toast.success('已导出为 Markdown');
  }, []);

  const exportAsJSON = useCallback((prompt: Prompt) => {
    const content = JSON.stringify(prompt, null, 2);
    downloadFile(content, `prompt-${prompt.id}.json`, 'application/json');
    toast.success('已导出为 JSON');
  }, []);

  const exportAsText = useCallback((prompt: Prompt) => {
    downloadFile(prompt.structuredPrompt, `prompt-${prompt.id}.txt`, 'text/plain');
    toast.success('已导出为纯文本');
  }, []);

  const exportBatchJSON = useCallback((prompts: Prompt[]) => {
    const content = JSON.stringify(prompts, null, 2);
    downloadFile(content, `prompts-export-${Date.now()}.json`, 'application/json');
    toast.success(`已导出 ${prompts.length} 条提示词`);
  }, []);

  return { exportAsMarkdown, exportAsJSON, exportAsText, exportBatchJSON };
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
