import { GEMINI_API_KEY } from "../config/env.js";
import { documents as knowledge } from "../data/knowledge.js";
import type { DocumentType, EmbeddingResult } from "../types/embeddingType.js";
import { GoogleGenAI } from "@google/genai";
import { MinHeap } from "./embedding.class.js";

export type EmbeddedDocument = {
  id: string;
  text: string;
  embedding: number[];
};

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

function validateEmbeddings(
  embeddings: Array<{ values?: number[] }>,
  expectedCount: number,
  expectedDimensions: number,
): void {
  // 1. Returned vector count matches input count.
  if (embeddings.length !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} embeddings, but got ${embeddings.length}`,
    );
  }

  for (const [index, item] of embeddings.entries()) {
    // 2. Every vector must have values.
    if (!item.values) {
      throw new Error(`Embedding ${index} is missing values`);
    }

    // 3. No empty vectors.
    if (item.values.length === 0) {
      throw new Error(`Embedding ${index} is empty`);
    }

    // 4. Every vector has the expected dimensions.
    if (item.values.length !== expectedDimensions) {
      throw new Error(
        `Embedding ${index} has ${item.values.length} dimensions. Expected ${expectedDimensions}`,
      );
    }

    // 5. Every value must be finite.
    for (const value of item.values) {
      if (!Number.isFinite(value)) {
        throw new Error(`Embedding ${index} contains a non-finite value`);
      }
    }
  }
}

export const generateEmbeddings = async (
  documents: DocumentType[],
): Promise<EmbeddedDocument[]> => {
  const validDocuments = documents.filter(
    (document) => document.text.trim().length > 0,
  );

  // Empty input is a valid no-op.
  if (validDocuments.length === 0) {
    return [];
  }

  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: validDocuments.map((document) => document.text),
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    // Runtime response validation.
    if (!response.embeddings) {
      throw new Error("No embeddings returned from Gemini");
    }

    const embeddings = response.embeddings;

    validateEmbeddings(embeddings, validDocuments.length, EMBEDDING_DIMENSIONS);

    // Associate each vector with its original document.
    const result: EmbeddedDocument[] = embeddings.map((item, index) => ({
      id: validDocuments[index].id,
      text: validDocuments[index].text,
      embedding: item.values!,
    }));
    console.log({ result });

    return result;
  } catch (error) {
    console.error("Failed to generate embeddings:", error);
    throw error;
  }
};

// generateEmbeddings(knowledge);

function validateVectors(a: number[], b: number[]): void {
  // Both vectors must have the same dimensions.
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same dimensions");
  }

  // Empty vectors are not valid.
  if (a.length === 0 || b.length === 0) {
    throw new Error("Vectors cannot be empty");
  }

  // Every value must be a finite number.
  for (const value of [...a, ...b]) {
    if (!Number.isFinite(value)) {
      throw new Error("Vectors must contain only finite numbers");
    }
  }
}

function dotProduct(a: number[], b: number[]): number {
  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }

  return result;
}

function magnitude(a: number[]): number {
  let sum = 0;

  for (const value of a) {
    sum += value * value;
  }

  return Math.sqrt(sum);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  validateVectors(a, b);

  const dot = dotProduct(a, b);
  const magnitudeA = magnitude(a);
  const magnitudeB = magnitude(b);

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error(
      "Cosine similarity is undefined for zero-magnitude vectors",
    );
  }

  const similarity = dot / (magnitudeA * magnitudeB);

  return Number(Math.max(-1, Math.min(1, similarity)).toFixed(3));
}

// Test
console.log(cosineSimilarity([1, 2], [3, 4]));
// Approximately 0.9839

export type Document = {
  id: string;
  text: string;
  embedding: number[];
};

export type ScoredDocument = {
  id: string;
  text: string;
  score: number;
};

export const documents: Document[] = [
  {
    id: "doc-1",
    text: "How to reset your password",
    embedding: [0.9, 0.1, 0.2, 0.1],
  },
  {
    id: "doc-2",
    text: "How to update your profile information",
    embedding: [0.2, 0.9, 0.1, 0.2],
  },
  {
    id: "doc-3",
    text: "I forgot my login credentials",
    embedding: [0.85, 0.2, 0.3, 0.1],
  },
  {
    id: "doc-4",
    text: "How to delete my account",
    embedding: [0.1, 0.2, 0.9, 0.1],
  },
  {
    id: "doc-5",
    text: "How to change my password",
    embedding: [0.88, 0.15, 0.25, 0.1],
  },
];

export const queryEmbedding: number[] = [0.9, 0.15, 0.25, 0.1];

function semanticSearch(
  queryEmbedding: number[],
  documents: Document[],
  topK: number,
): ScoredDocument[] {
  const scoredDocuments: ScoredDocument[] = [];

  for (const item of documents) {
    const similarity = cosineSimilarity(queryEmbedding, item.embedding);
    scoredDocuments.push({
      id: item.id,
      text: item.text,
      score: similarity,
    });
  }

  return scoredDocuments.sort((a, b) => b.score - a.score).slice(0, topK);
}

console.log(semanticSearch(queryEmbedding, documents, 3));

function retrieveTopK(
  queryEmbedding: number[],
  documents: Document[],
  topK: number,
): ScoredDocument[] {
  if (!Number.isInteger(topK) || topK < 1) {
    throw new Error("topK must be a positive integer");
  }

  const heap = new MinHeap();

  for (const doc of documents) {
    const similarity = cosineSimilarity(queryEmbedding, doc.embedding);

    const chunk: ScoredDocument = {
      id: doc.id,
      score: similarity,
      text: doc.text,
    };

    if (heap.getSize() < topK) {
      heap.insert(chunk);
    } else {
      const minimum = heap.peek();

      if (minimum && similarity > minimum.score) {
        heap.replaceMin(chunk);
      }
    }
  }

  return heap.getHeap().toSorted((a, b) => b.score - a.score);
}

console.log(retrieveTopK(queryEmbedding, documents, 3));

export async function generateAIEmbedding(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
): Promise<EmbeddingResult> {
  if (text.trim() === "") {
    throw new Error("Text cannot be empty");
  }
  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        taskType,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    if (!response.embeddings) {
      throw new Error("No Embeddings returned from Gemini");
    }

    return { text, embedding: response.embeddings[0].values! };
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    throw error;
  }
}
