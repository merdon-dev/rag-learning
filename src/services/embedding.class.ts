import type { ScoredDocument } from "./embedding.service.js";

class Counter {
  private count: number;

  constructor(initialValue: number) {
    this.count = initialValue;
  }

  increment() {
    this.count++;
  }

  getCount() {
    return this.count;
  }
}

const counter = new Counter(10);

counter.increment();

console.log(counter.getCount()); // 11

// TypeScript error:
// console.log(counter.count);

export class MinHeap {
  private heap: ScoredDocument[] = [];

  getHeap(): readonly ScoredDocument[] {
    return this.heap;
  }

  public insert(value: ScoredDocument): void {
    this.heap.push(value);

    let currentIndex = this.heap.length - 1;
    let parentIndex = Math.floor((currentIndex - 1) / 2);
    while (
      parentIndex >= 0 &&
      this.heap[currentIndex].score < this.heap[parentIndex].score
    ) {
      [this.heap[parentIndex], this.heap[currentIndex]] = [
        this.heap[currentIndex],
        this.heap[parentIndex],
      ];

      currentIndex = parentIndex;
      parentIndex = Math.floor((currentIndex - 1) / 2);
    }
  }

  public peek() {
    return this.heap[0];
  }

  public getSize() {
    return this.heap.length;
  }

  private siftDown(index: number): void {
    const leftIndex = 2 * index + 1;
    const rightIndex = 2 * index + 2;
    console.log({ index });

    let smallestIndex = index;

    // Step 1: Check the left child
    if (
      leftIndex < this.heap.length &&
      this.heap[leftIndex].score < this.heap[smallestIndex].score
    ) {
      smallestIndex = leftIndex;
    }

    // Step 2: Check the right child
    if (
      rightIndex < this.heap.length &&
      this.heap[rightIndex].score < this.heap[smallestIndex].score
    ) {
      smallestIndex = rightIndex;
    }
    console.log({ smallestIndex });

    // Step 3: If the parent is already smallest, stop
    if (smallestIndex === index) return;

    // Step 4: Swap parent with the smallest child
    [this.heap[index], this.heap[smallestIndex]] = [
      this.heap[smallestIndex],
      this.heap[index],
    ];

    // Step 5: Continue downward
    this.siftDown(smallestIndex);
  }

  public extractMin(): ScoredDocument | undefined {
    // Step 1: Handle an empty heap
    if (this.heap.length === 0) {
      return undefined;
    }

    // Step 2: Save the minimum value
    const root = this.heap[0];

    // Step 3: Remove the last element
    const last = this.heap.pop();

    // Step 4: Move the last element to the root
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0].score = last.score;

      // Step 5: Restore Min-Heap property
      this.siftDown(0);
    }

    // Step 6: Return the original minimum
    return root;
  }

  public replaceMin(value: ScoredDocument): void {
    if (this.heap.length === 0) {
      throw new Error("Cannot replace minimum of an empty heap");
    }

    this.heap[0] = value;
    this.siftDown(0);
  }
}

const heap = new MinHeap();

[10, 5, 20, 3, 15].forEach((value) => {
  heap.insert({ id: "1", score: value, text: "" });
});

console.log(heap.getHeap());
console.log(heap.extractMin());
console.log(heap.getHeap());
