import { RETRIEVAL_QUERY } from "../config/embedding.config.js";
import { prisma } from "../config/prisma.js";
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

  if (!query.trim()) {
    throw new Error("Search query must not be empty");
  }

  if (!Number.isFinite(threshold) || threshold < -1 || threshold > 1) {
    throw new Error("Threshold must be between -1 and 1");
  }

  const queryEmbedding = await generateAIEmbedding(query, RETRIEVAL_QUERY);

  const embedding = queryEmbedding.embedding;

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected ${EMBEDDING_DIMENSIONS}-dimensional embedding`);
  }

  if (!embedding.every(Number.isFinite)) {
    throw new Error("Embedding values must be finite numbers");
  }

  const vector = `[${embedding.join(",")}]`;

  return prisma.$queryRaw<DocumentWithSimilarity[]>`
    SELECT
      id,
      content,
      ROUND(
        (1 - (embedding <=> ${vector}::vector))::numeric,
        4
      ) AS similarity
    FROM documents
    WHERE
      1 - (embedding <=> ${vector}::vector) >= ${threshold}
    ORDER BY embedding <=> ${vector}::vector ASC
    LIMIT ${topK}
  `;
}
