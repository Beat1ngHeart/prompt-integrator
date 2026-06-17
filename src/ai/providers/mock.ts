import type { AIProvider, GenerateOptions, ModelInfo } from '../types';

const MOCK_RESPONSE = {
  structured_prompt: `# 角色
你是一位经验丰富的AI提示词工程师，擅长将模糊的需求转化为精确、可执行的指令。

# 背景
用户希望完成一个特定任务，需要一个结构化的提示词来指导AI助手高效完成工作。

# 任务
根据用户的简短描述，生成一份完整的、结构化的提示词，包含以下要素：
1. **角色定义**：明确AI应扮演的角色
2. **任务描述**：详细说明需要完成的工作
3. **约束条件**：设定输出的限制和要求
4. **输出格式**：指定期望的输出结构
5. **示例参考**：提供一个具体的示例

# 输出要求
- 使用清晰的标题和分段
- 语言简洁明了
- 包含可操作的具体指令
- 适配用户的原始需求场景`,

  tree: {
    id: 'mock-root',
    name: '提示词工程',
    children: [
      {
        id: 'mock-role',
        name: '角色定义',
        children: [
          { id: 'mock-role-1', name: 'AI提示词工程师', children: [] },
          { id: 'mock-role-2', name: '经验丰富', children: [] },
        ],
      },
      {
        id: 'mock-task',
        name: '任务描述',
        children: [
          { id: 'mock-task-1', name: '分析用户需求', children: [] },
          { id: 'mock-task-2', name: '生成结构化提示词', children: [] },
          { id: 'mock-task-3', name: '包含示例参考', children: [] },
        ],
      },
      {
        id: 'mock-constraints',
        name: '约束条件',
        children: [
          { id: 'mock-c1', name: '语言简洁', children: [] },
          { id: 'mock-c2', name: '可操作性', children: [] },
        ],
      },
      {
        id: 'mock-format',
        name: '输出格式',
        children: [
          { id: 'mock-f1', name: '标题分段', children: [] },
          { id: 'mock-f2', name: 'Markdown格式', children: [] },
        ],
      },
    ],
  },
};

export class MockProvider implements AIProvider {
  name = 'Mock (测试)';
  id = 'mock';
  supportedModels: ModelInfo[] = [
    { id: 'mock-model', name: 'Mock Model', contextWindow: 4096, supportsStreaming: true },
  ];

  async generateStructuredPrompt(
    input: string,
    _options: GenerateOptions,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const fullJson = JSON.stringify({
      structured_prompt: MOCK_RESPONSE.structured_prompt.replace(
        '用户希望完成一个特定任务',
        `用户的需求是：「${input}」`
      ),
      tree: { ...MOCK_RESPONSE.tree, name: input.slice(0, 20) || '提示词' },
    }, null, 2);

    // Simulate streaming
    const chars = fullJson.split('');
    for (let i = 0; i < chars.length; i += 3) {
      const chunk = chars.slice(i, i + 3).join('');
      await new Promise((r) => setTimeout(r, 20));
      onChunk(chunk);
    }

    return fullJson;
  }

  async validateApiKey(): Promise<boolean> {
    return true;
  }
}
