import { prisma } from "../config/prisma.js";
import { RETRIEVAL_QUERY } from "../index.js";
import type { DocumentWithSimilarity } from "../types/embeddingType.js";
import {
  EMBEDDING_DIMENSIONS,
  generateAIEmbedding,
} from "./embedding.service.js";

export async function queryDocuments(
  query: string,
  topK: number,
  threshold: number,
): Promise<DocumentWithSimilarity[]> {
  if (!Number.isInteger(topK) || topK <= 0) {
    throw new Error("Top K must be a positive integer");
  }

  if (query.trim() === "") {
    throw new Error("Search query must be not empty");
  }

  try {
    const queryEmbedding = await generateAIEmbedding(query, RETRIEVAL_QUERY);

    if (!queryEmbedding.embedding) {
      throw new Error("Gemini not return embedding for query");
    }
    if (queryEmbedding.embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Embedding vector must be ${EMBEDDING_DIMENSIONS}-dimensional`,
      );
    }

    if (!queryEmbedding.embedding.every(Number.isFinite)) {
      throw new Error("Embedding values must be finite numbers");
    }
    const vector = `[${queryEmbedding.embedding}]`;
    const result = await prisma.$queryRaw<DocumentWithSimilarity[]>`
SELECT
        id, content, ROUND(1- (embedding <=> ${vector}::vector)::number, 4) AS similarity
        FROM documents
        WHERE 1- (embedding <=> ${vector}::vector) >= ${threshold}
        ORDER BY embedding <=> ${vector}::vector
        LIMIT ${topK}
`;
    return result;
  } catch (error) {
    throw error;
  }
}
