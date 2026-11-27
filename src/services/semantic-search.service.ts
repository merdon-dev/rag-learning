import { prisma } from "../config/prisma.js";
import type { ScoredDocument } from "../types/embeddingType.js";

export async function semanticSearch(
  queryEmbedding: number[],
  topK: number,
): Promise<ScoredDocument[]> {
  if (!Number.isInteger(topK) || topK <= 0) {
    throw new Error("Top K must be a positive integer");
  }

  if (queryEmbedding.length !== 4) {
    throw new Error("Embedding vector must be 4-dimensional");
  }

  if (!queryEmbedding.every(Number.isFinite)) {
    throw new Error("Embedding values must be finite numbers");
  }

  const vector = `[${queryEmbedding}]`;

  const documents = await prisma.$queryRaw<ScoredDocument[]>`
    SELECT
      id,
      content,
      embedding <=> ${vector}::vector AS distance
    FROM documents
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${topK}
  `;

  return documents;
}
