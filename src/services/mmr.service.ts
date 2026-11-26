import type { MMRScoredDocument } from "../types/embeddingType.js";

export const mockDocuments: MMRScoredDocument[] = [
  {
    id: "doc-1",
    text: "How to reset your password",
    score: 0.96,
    embedding: [0.9, 0.1, 0.2, 0.1],
  },
  {
    id: "doc-2",
    text: "How to change your password",
    score: 0.94,
    embedding: [0.88, 0.15, 0.25, 0.1],
  },
  {
    id: "doc-3",
    text: "How to recover forgotten login credentials",
    score: 0.85,
    embedding: [0.2, 0.9, 0.1, 0.2],
  },
  {
    id: "doc-4",
    text: "How to enable two-factor authentication",
    score: 0.8,
    embedding: [0.1, 0.2, 0.9, 0.1],
  },
];
function dotProduct(a: number[], b: number[]): number {
  let product = 0;

  for (let i = 0; i < a.length; i++) {
    product += a[i] * b[i];
  }

  return product;
}

function magnitude(value: number[]): number {
  return Math.hypot(...value);
}

function validateVectors(a: number[], b: number[]): void {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same dimensions");
  }

  if (a.length === 0) {
    throw new Error("Vectors cannot be empty");
  }

  for (const value of a) {
    if (!Number.isFinite(value)) {
      throw new Error("Vector A must contain finite numbers");
    }
  }

  for (const value of b) {
    if (!Number.isFinite(value)) {
      throw new Error("Vector B must contain finite numbers");
    }
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  validateVectors(a, b);

  const magnitudeA = magnitude(a);
  const magnitudeB = magnitude(b);

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Cosine similarity is undefined for zero vectors");
  }

  const dot = dotProduct(a, b);

  const similarity = dot / (magnitudeA * magnitudeB);

  return Math.max(-1, Math.min(1, similarity));
}

export function selectMMRDocumentss(
  documents: MMRScoredDocument[],
  topK: number,
  lambda: number = 0.7,
): MMRScoredDocument[] {
  // Step 1: Validate inputs
  if (!Number.isInteger(topK) || topK <= 0) {
    throw new Error("Top K must be a positive integer");
  }

  if (!Number.isFinite(lambda) || lambda < 0 || lambda > 1) {
    throw new Error("Lambda must be between 0 and 1");
  }

  if (documents.length === 0) {
    return [];
  }

  // Step 2: Initialize collections
  const selectedDocs: MMRScoredDocument[] = [];
  const remainingDocs: MMRScoredDocument[] = [...documents];

  const highest = remainingDocs.reduce((best, current) => {
    return current.score > best.score ? current : best;
  });

  const highestIndex = remainingDocs.indexOf(highest);

  selectedDocs.push(highest);
  remainingDocs.splice(highestIndex, 1);

  // Step 4: Iteratively select documents using MMR
  while (selectedDocs.length < topK && remainingDocs.length > 0) {
    let bestCandidate: MMRScoredDocument | null = null;
    let bestMMRScore = Number.NEGATIVE_INFINITY;

    // Step 5: Evaluate every remaining candidate
    for (const candidate of remainingDocs) {
      let maxRedundancy = 0;

      // Compare candidate with already-selected documents
      for (const selected of selectedDocs) {
        const similarity = cosineSimilarity(
          candidate.embedding,
          selected.embedding,
        );

        maxRedundancy = Math.max(maxRedundancy, similarity);
      }

      // Step 6: Calculate MMR score
      const mmrScore = lambda * candidate.score - (1 - lambda) * maxRedundancy;

      // Step 7: Keep the candidate with the highest MMR score
      if (mmrScore > bestMMRScore) {
        bestMMRScore = mmrScore;
        bestCandidate = candidate;
      }
    }

    // Step 8: Move the winning candidate into selected documents
    if (!bestCandidate) {
      break;
    }

    selectedDocs.push(bestCandidate);

    const selectedIndex = remainingDocs.indexOf(bestCandidate);
    remainingDocs.splice(selectedIndex, 1);
  }

  // Step 9: Return selected documents
  return selectedDocs;
}

export function selectMMRDocuments(
  documents: MMRScoredDocument[],
  topK: number,
  lambda: number = 0.7,
): MMRScoredDocument[] {
  // Step 1: Validate inputs
  if (!Number.isInteger(topK) || topK <= 0) {
    throw new Error("Top K must be a positive integer");
  }

  if (!Number.isFinite(lambda) || lambda < 0 || lambda > 1) {
    throw new Error("Lambda must be between 0 and 1");
  }

  if (documents.length === 0) {
    return [];
  }

  // Step 2: Initialize collections
  const selectedDocs: MMRScoredDocument[] = [];
  const remainingDocs: MMRScoredDocument[] = [...documents];

  const highest = remainingDocs.reduce((best, current) => {
    return current.score > best.score ? current : best;
  });
  const highestIndex = remainingDocs.indexOf(highest);

  selectedDocs.push(highest);
  remainingDocs.splice(highestIndex, 1);

  while (selectedDocs.length < topK && remainingDocs.length > 0) {
    let bestCandidate: MMRScoredDocument | null = null;
    let bestMMRScore: number = Number.NEGATIVE_INFINITY;
    for (const candidate of remainingDocs) {
      let maxRedundancy = 0;
      for (const selected of selectedDocs) {
        const similarity = cosineSimilarity(
          candidate.embedding,
          selected.embedding,
        );

        maxRedundancy = Math.max(maxRedundancy, similarity);
      }
      const bestScore = lambda * candidate.score - (1 - lambda) * maxRedundancy;

      if (bestScore > bestMMRScore) {
        bestMMRScore = bestScore;
        bestCandidate = candidate;
      }
    }

    if (!bestCandidate) {
      break;
    }

    selectedDocs.push(bestCandidate);
    const selectedIndex = remainingDocs.indexOf(bestCandidate);
    remainingDocs.splice(selectedIndex, 1);
  }
  return selectedDocs;
}
const result = selectMMRDocuments(mockDocuments, 3, 0.7);

console.log({ result });
