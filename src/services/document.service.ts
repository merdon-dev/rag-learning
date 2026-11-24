import { prisma } from "../config/prisma.js";
import {
  EMBEDDING_DIMENSIONS,
  generateAIEmbedding,
} from "./embedding.service.js";

export async function storeDocument(
  id: string,
  content: string,
): Promise<void> {
  const result = await generateAIEmbedding(content, "RETRIEVAL_DOCUMENT");

  if (result.embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error("Expected a 768-dimensional embedding");
  }

  const vector = `[${result.embedding}]`;

  await prisma.$executeRaw`
  INSERT INTO documents (id, content, embedding)
  VALUES (${id}, ${content}, ${vector}::vector)
  ON CONFLICT (id)
  DO UPDATE SET
    content = EXCLUDED.content,
    embedding = EXCLUDED.embedding
`;
}
