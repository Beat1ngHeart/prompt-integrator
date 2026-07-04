<div align="center">

<img src="https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Vite-6-purple?logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind" />
<img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />

<br/>
<br/>

# Prompt Integrator

**一句话生成结构化提示词 + 交互式思维导图**
<br/>
**One sentence in, structured prompt + interactive mind map out.**

<p>
  <img src="https://img.shields.io/badge/中文-简体-orange?style=flat-square" alt="中文" />
  <img src="https://img.shields.io/badge/English-blue?style=flat-square" alt="English" />
</p>

</div>

---

## 为什么需要这个工具？ / Why?

向 AI 输入指令时，我们常常纠结提示词该怎么写，写出来又难以复用。**Prompt 整合器**解决这个问题：

We often struggle with crafting AI prompts — and even when we do, they're hard to reuse. **Prompt Integrator** solves this:

```
[1] 输入一句话          Describe your need in one sentence
        ↓
[2] AI 自动生成          AI generates a structured prompt
        ↓
[3] 思维导图可视化        Mind map visualization
        ↓
[4] 永久保存管理          Save, search & reuse anytime
```

---

## 功能特性 / Features

<table>
<tr>
<td width="50%">

### 一键生成 / One-Click Generation
输入简单描述，AI 自动生成结构化提示词（角色、任务、约束、输出格式...）

### 交互式思维导图 / Interactive Mind Map
点击展开/收起、拖拽平移、滚轮缩放、导出 PNG 图片

### 多模型支持 / Multi-Model
Claude · OpenAI · Mock 测试模式（开箱即用）

</td>
<td width="50%">

### 提示词库 / Prompt Library
搜索、标签筛选、排序（最新/最早/收藏优先）、批量操作

### 多格式导出 / Multi-Format Export
Markdown · JSON · 纯文本 三种格式随意切换

### 暗色模式 / Dark Mode
浅色 / 深色 / 跟随系统，自动切换

</td>
</tr>
</table>

> **安全提示 / Security:** API Key 仅存储在浏览器本地 IndexedDB，不会上传到任何服务器。
> API Keys are stored locally in IndexedDB — never uploaded to any server.

---

## 快速开始 / Quick Start

```bash
# 克隆项目 / Clone the repo
git clone https://github.com/Beat1ngHeart/prompt-integrator.git
cd prompt-integrator

# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start dev server
npm run dev
```

打开 http://localhost:5173 — 内置 Mock 模式可直接体验，无需配置 API Key。
前往「设置」页面配置 API Key 以使用真实 AI 模型。

Open http://localhost:5173 — Mock mode works out of the box, no API key needed.
Head to **Settings** to configure your API key for real AI models.

---

## 技术栈 / Tech Stack

```
React 18  ·  TypeScript  ·  Vite
Tailwind CSS v4  ·  Zustand  ·  Dexie.js (IndexedDB)
React Router v6  ·  @anthropic-ai/sdk  ·  openai
```

## 项目结构 / Project Structure

```
src/
├── ai/                 # AI 提供者抽象层 / AI provider abstraction
│   ├── providers/      # Claude / OpenAI / Mock implementations
│   ├── prompts.ts      # System prompt templates
│   └── registry.ts     # Provider registry
├── components/
│   ├── layout/         # Layout (sidebar, page frame)
│   ├── mindmap/        # Interactive mind map
│   ├── ui/             # Base UI components
│   └── ...
├── db/                 # IndexedDB data layer
├── hooks/              # Custom React hooks
├── pages/              # Pages (Generate, Library, Detail, Settings)
├── store/              # Zustand state management
└── types/              # TypeScript type definitions
```

---

## 截图 / Screenshots

<p align="center">
  <em>生成页 · 提示词库 · 思维导图 · 暗色模式</em>
  <br/>
  <em>Generation · Library · Mind Map · Dark Mode</em>
</p>

---

## License

[MIT](./LICENSE)
