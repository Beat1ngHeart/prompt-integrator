# Prompt 整合器

AI 驱动的提示词生成与管理工具。输入一句话，自动生成结构化提示词和交互式思维导图。

## 功能

- **一键生成** — 输入简单描述，AI 生成完整的结构化提示词
- **思维导图** — 交互式可视化，支持点击展开/收起、拖拽平移、缩放
- **提示词库** — 所有生成的提示词自动保存，支持搜索、标签筛选、排序
- **多模型支持** — Claude / OpenAI / Mock（测试模式，开箱即用）
- **导出** — 支持 Markdown、JSON、纯文本格式导出
- **暗色模式** — 浅色 / 深色 / 跟随系统

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:5173，使用内置的 Mock 模式即可体验。如需真实 AI 生成，前往「设置」页面配置 API Key。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 样式 | Tailwind CSS v4 |
| 状态 | Zustand |
| 存储 | Dexie.js (IndexedDB) |
| 路由 | React Router v6 |
| AI SDK | @anthropic-ai/sdk + openai |

## 项目结构

```
src/
├── ai/             # AI 提供者抽象层 (Claude / OpenAI / Mock)
├── components/     # UI 组件 (layout, mindmap, prompt, library)
├── db/             # IndexedDB 数据层
├── hooks/          # 自定义 Hooks
├── pages/          # 页面组件
├── store/          # Zustand 状态管理
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数
└── constants/      # 常量配置
```

## 安全说明

API Key 仅存储在浏览器本地 IndexedDB，不会上传到任何服务器。请勿在公共设备上使用。
