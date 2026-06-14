export type KnowledgeSource = {
  id: string;
  user_id: string;
  filename: string;
  chunk_count: number;
  created_at: Date;
};

export type KnowledgeChunk = {
  id: string;
  user_id: string;
  source_id: string;
  chunk_text: string;
  chunk_index: number;
};

export type Intent = "price" | "availability" | "general";
