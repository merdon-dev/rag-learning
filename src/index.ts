// import { semanticSearch } from "./services/semantic-search.service.js";

import { prisma } from "./config/prisma.js";
import { storeDocument } from "./services/document.service.js";
import {
  EMBEDDING_DIMENSIONS,
  generateAIEmbedding,
} from "./services/embedding.service.js";

// const queryEmbedding: number[] = [0.9, 0.15, 0.25, 0.1];
// const topK: number = 3;

// const main = async () => {
//   const result = await semanticSearch(queryEmbedding, topK);
//   console.log("semantic search result");
//   console.table(result);
// };

// main().catch(console.error);
export const RETRIEVAL_DOCUMENT = "RETRIEVAL_DOCUMENT";
export const RETRIEVAL_QUERY = "RETRIEVAL_QUERY";

// async function main() {
//   const result = await generateAIEmbedding(
//     "Users can reset their password from the login page.",
//     RETRIEVAL_DOCUMENT,
//   );

//   console.log("Original text:", result.text);
//   console.log("Embedding dimensions:", result.embedding.length);
//   console.log("First 5 values:", result.embedding.slice(0, 5));
// }

async function main() {
  await storeDocument(
    "doc-1",
    "Users can reset their password from the login page.",
  );

  console.log("Document stored successfully!");
}

main().catch(console.error);

main().catch(console.error);
