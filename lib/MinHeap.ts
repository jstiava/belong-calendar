export default class MinHeap<T> {
  private heap: [number, T][] = [];

  insert(key: number, value: T) {
    this.heap.push([key, value]);
    this.bubbleUp();
  }

  extractMin(): [number, T] | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    if (this.heap.length === 1) {
      return this.heap.pop();
    }
    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown();
    return min;
  }

  remove(key: number, value: T): void {
    const index = this.heap.findIndex(item => item[0] === key && item[1] === value);
    if (index !== -1) {
      this.heap[index] = this.heap.pop()!;
      this.bubbleDown();
      this.bubbleUp();
    }
  }

  peek(): [number, T] | undefined {
    return this.heap.length > 0 ? this.heap[0] : undefined;
  }

  entries(): [number, T][] {
    return this.heap.slice();
  }

  private bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index][0] >= this.heap[parentIndex][0]) {
        break;
      }
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown() {
    let index = 0;
    const length = this.heap.length;
    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let smallest = index;

      if (leftChildIndex < length && this.heap[leftChildIndex][0] < this.heap[smallest][0]) {
        smallest = leftChildIndex;
      }
      if (rightChildIndex < length && this.heap[rightChildIndex][0] < this.heap[smallest][0]) {
        smallest = rightChildIndex;
      }
      if (smallest === index) {
        break;
      }
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}
