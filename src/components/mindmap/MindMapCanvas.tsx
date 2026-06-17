import { useState, useRef, useCallback, useEffect } from 'react';
import type { MindMapNode } from '../../types';
import { ZoomIn, ZoomOut, Maximize2, Download, ChevronRight, ChevronDown } from 'lucide-react';

interface MindMapCanvasProps {
  data: MindMapNode;
}

const LEVEL_COLORS = [
  { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-600', light: 'bg-blue-50 dark:bg-blue-900/30', lightBorder: 'border-blue-200 dark:border-blue-700', line: '#3b82f6' },
  { bg: 'bg-violet-500', text: 'text-white', border: 'border-violet-500', light: 'bg-violet-50 dark:bg-violet-900/30', lightBorder: 'border-violet-200 dark:border-violet-700', line: '#8b5cf6' },
  { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/30', lightBorder: 'border-emerald-200 dark:border-emerald-700', line: '#10b981' },
  { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-500', light: 'bg-amber-50 dark:bg-amber-900/30', lightBorder: 'border-amber-200 dark:border-amber-700', line: '#f59e0b' },
  { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-500', light: 'bg-rose-50 dark:bg-rose-900/30', lightBorder: 'border-rose-200 dark:border-rose-700', line: '#ef4444' },
  { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-900/30', lightBorder: 'border-indigo-200 dark:border-indigo-700', line: '#6366f1' },
];

function getColor(depth: number) {
  return LEVEL_COLORS[depth % LEVEL_COLORS.length];
}

function MindMapNodeComponent({ node, depth, onToggle }: { node: MindMapNode; depth: number; onToggle: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const collapsed = node.collapsed;
  const color = getColor(depth);
  const isRoot = depth === 0;

  return (
    <div className="flex items-center">
      {/* Node */}
      <div
        className={`relative group flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 select-none border ${
          isRoot
            ? `${color.bg} ${color.text} border-transparent shadow-md hover:shadow-lg`
            : `${color.light} ${color.lightBorder} hover:shadow-sm`
        } ${hovered && !isRoot ? 'shadow-md scale-[1.02]' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        {hasChildren && (
          <span className="shrink-0 text-xs opacity-70">
            {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </span>
        )}
        <span className={`text-sm whitespace-nowrap font-medium ${isRoot ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
          {node.name}
        </span>
        {hasChildren && collapsed && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-black/10 dark:bg-white/10 font-medium">
            {node.children.length}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="flex items-center">
          {/* Horizontal connector */}
          <div className="w-6 h-px" style={{ backgroundColor: color.line + '60' }} />

          {/* Vertical line + children container */}
          <div className="relative flex flex-col">
            {node.children.length === 1 ? (
              <div className="py-1">
                <MindMapNodeComponent node={node.children[0]} depth={depth + 1} onToggle={onToggle} />
              </div>
            ) : (
              <>
                {/* Vertical line */}
                <div
                  className="absolute left-0 top-[14px] bottom-[14px] w-px"
                  style={{ backgroundColor: color.line + '40' }}
                />
                <div className="flex flex-col gap-1 py-1">
                  {node.children.map((child) => (
                    <div key={child.id} className="flex items-center">
                      {/* Horizontal branch line */}
                      <div className="w-4 h-px shrink-0" style={{ backgroundColor: color.line + '40' }} />
                      <MindMapNodeComponent node={child} depth={depth + 1} onToggle={onToggle} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MindMapCanvas({ data }: MindMapCanvasProps) {
  const [tree, setTree] = useState<MindMapNode>(data);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTree(data);
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [data]);

  const handleToggle = useCallback((id: string) => {
    setTree((prev) => toggleNode(prev, id));
  }, []);

  function toggleNode(node: MindMapNode, id: string): MindMapNode {
    if (node.id === id) {
      return { ...node, collapsed: !node.collapsed };
    }
    if (node.children) {
      return { ...node, children: node.children.map((c) => toggleNode(c, id)) };
    }
    return node;
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(2, Math.max(0.3, s + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart(pan);
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: panStart.x + (e.clientX - dragStart.x),
      y: panStart.y + (e.clientY - dragStart.y),
    });
  }, [isDragging, dragStart, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFitToView = useCallback(() => {
    if (!contentRef.current || !containerRef.current) return;
    const contentRect = contentRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const scaleX = (containerRect.width - 40) / contentRect.width;
    const scaleY = (containerRect.height - 40) / contentRect.height;
    const newScale = Math.min(scaleX, scaleY, 1.5);
    setScale(newScale);
    setPan({ x: 20, y: 20 });
  }, []);

  const handleExport = useCallback(() => {
    if (!contentRef.current) return;
    const content = contentRef.current;

    // Create a temporary canvas to render the DOM
    const rect = content.getBoundingClientRect();
    const dpr = 2;
    const canvas = document.createElement('canvas');
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Use SVG foreignObject to render HTML to canvas
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${content.outerHTML}
          </div>
        </foreignObject>
      </svg>`;

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = `mindmap-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.onerror = () => {
      // Fallback: export as SVG
      URL.revokeObjectURL(url);
      const svgBlob2 = new Blob([svgData], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `mindmap-${Date.now()}.svg`;
      link.href = URL.createObjectURL(svgBlob2);
      link.click();
    };
    img.src = url;
  }, []);

  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-gray-50/50 dark:bg-gray-950/50 rounded-b-xl">
      {/* Canvas area */}
      <div
        ref={containerRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={contentRef}
          className="inline-block p-5 origin-top-left transition-transform duration-100"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
        >
          <MindMapNodeComponent node={tree} depth={0} onToggle={handleToggle} />
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 shadow-sm">
        <button
          onClick={() => setScale((s) => Math.min(2, s + 0.15))}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="放大"
        >
          <ZoomIn size={15} />
        </button>
        <span className="text-[10px] text-gray-400 w-8 text-center font-mono">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale((s) => Math.max(0.3, s - 0.15))}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="缩小"
        >
          <ZoomOut size={15} />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
        <button
          onClick={handleFitToView}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="适配视图"
        >
          <Maximize2 size={15} />
        </button>
        <button
          onClick={handleExport}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="导出图片"
        >
          <Download size={15} />
        </button>
      </div>

      {/* Hint */}
      <div className="absolute top-2 left-3 text-[10px] text-gray-400 dark:text-gray-500 pointer-events-none">
        点击节点展开/收起 · 拖拽平移 · 滚轮缩放
      </div>
    </div>
  );
}
