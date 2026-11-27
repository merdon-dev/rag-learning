import {
  EMBEDDING_DIMENSIONS,
  RETRIEVAL_QUERY,
} from "../config/embedding.config.js";
import { generateAIEmbedding } from "./embedding.service.js";

async function searchDocuments(query: string) {
  if (query.trim() === "") {
    throw new Error("Query cannot be empty");
  }

  const queryEmbedding = await generateAIEmbedding(query, RETRIEVAL_QUERY);

  if (!queryEmbedding.embedding) {
    throw new Error("Failed to generate embedding for query");
  }
  if (!queryEmbedding.embedding.every(Number.isFinite)) {
    throw new Error("The query embeddings must be finite numbers");
  }
  if (queryEmbedding.embedding.length !== EMBEDDING_DIMENSIONS) {
  }
}
