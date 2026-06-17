# Prompt Integrator / 提示词整合器

> 一句话生成结构化提示词 + 交互式思维导图，告别反复编写提示词的烦恼。

## 为什么需要这个工具？

向 AI 输入指令时，我们常常纠结提示词该怎么写，写出来又难以复用。**Prompt 整合器**解决这个问题：

1. **输入一句话** — 用自然语言描述你的需求
2. **AI 自动生成** — 输出完整的结构化提示词（角色、任务、约束、输出格式...）
3. **思维导图可视化** — 直观展示提示词的结构层次
4. **永久保存** — 所有提示词入库管理，随时搜索、复用、编辑

## 功能特性

| 功能 | 说明 |
|------|------|
| 一键生成 | 输入简单描述，AI 自动生成结构化提示词 |
| 交互式思维导图 | 点击展开/收起、拖拽平移、滚轮缩放、导出图片 |
| 提示词库管理 | 搜索、标签筛选、排序（最新/最早/收藏优先）、批量操作 |
| 多模型支持 | Claude / OpenAI / Mock 测试模式（开箱即用） |
| 导出 | Markdown / JSON / 纯文本三种格式 |
| 暗色模式 | 浅色 / 深色 / 跟随系统 |
| 本地存储 | 数据存在浏览器 IndexedDB，API Key 不上传服务器 |

## 快速开始

```bash
# 克隆项目
git clone https://github.com/你的用户名/prompt-integrator.git
cd prompt-integrator

# 安装依赖
npm install

# 启动
npm run dev
```

打开 http://localhost:5173，内置 Mock 模式可直接体验。前往「设置」页面配置 API Key 以使用真实 AI 模型。

## 技术栈

```
React 18 + TypeScript + Vite
Tailwind CSS v4  ·  Zustand  ·  Dexie.js (IndexedDB)
React Router v6  ·  @anthropic-ai/sdk  ·  openai
```

## 项目结构

```
src/
├── ai/                 # AI 提供者抽象层
│   ├── providers/      # Claude / OpenAI / Mock 实现
│   ├── prompts.ts      # 系统提示词模板
│   └── registry.ts     # 提供者注册中心
├── components/
│   ├── layout/         # 布局组件 (侧边栏、页面框架)
│   ├── mindmap/        # 交互式思维导图
│   ├── ui/             # 基础 UI 组件
│   └── ...
├── db/                 # IndexedDB 数据层
├── hooks/              # 自定义 Hooks
├── pages/              # 页面 (生成、库、详情、设置)
├── store/              # Zustand 状态管理
└── types/              # TypeScript 类型定义
```

## 截图

<p align="center">
  <em>生成页 · 提示词库 · 思维导图 · 暗色模式</em>
</p>

## 安全说明

API Key 仅存储在浏览器本地 IndexedDB，不会上传到任何服务器。请勿在公共设备上使用。

## License

MIT
