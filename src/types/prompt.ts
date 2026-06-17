export interface MindMapNode {
  id: string;
  name: string;
  description?: string;
  children: MindMapNode[];
  collapsed?: boolean;
  color?: string;
  icon?: string;
}

export interface Prompt {
  id: string;
  input: string;
  structuredPrompt: string;
  tree: MindMapNode;
  tags: string[];
  category: string;
  provider: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
  notes: string;
}
