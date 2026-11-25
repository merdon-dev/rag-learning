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

console.log(cosineSimilarity([1, 0, 0], [-1, 0, 0]));
