export type DocumentType = {
  id: string;
  text: string;
};

export interface EmbeddingResult {
  text: string;
  embedding: number[];
}
export interface DocumentWithSimilarity {
  id: string;
  content: string;
  similarity: number;
}
