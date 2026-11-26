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

export type Document = {
  id: string;
  text: string;
  embedding: number[];
};

export interface ScoredDocument {
  id: string;
  text: string;
  score: number;
}

export interface MMRScoredDocument extends ScoredDocument {
  embedding: number[];
}
