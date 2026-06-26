import type { Notification, ScoredNotification } from "./types.js";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const WEIGHT_MULTIPLIER = 1_000_000_000_000;

export function parseTimestamp(timestamp: string): number {
  const normalized = timestamp.includes("T")
    ? timestamp
    : timestamp.replace(" ", "T") + "Z";
  return Math.floor(new Date(normalized).getTime() / 1000);
}

export function calculatePriorityScore(notification: Notification): number {
  const weight = TYPE_WEIGHT[notification.Type] ?? 0;
  const recency = parseTimestamp(notification.Timestamp);
  return weight * WEIGHT_MULTIPLIER + recency;
}

export function getTopPriorityNotifications(
  notifications: Notification[],
  limit = 10
): ScoredNotification[] {
  const scored = notifications.map((notification) => ({
    ...notification,
    priorityScore: calculatePriorityScore(notification),
  }));

  scored.sort((a, b) => b.priorityScore - a.priorityScore);
  return scored.slice(0, limit);
}

class MinHeap {
  private items: ScoredNotification[] = [];

  get size(): number {
    return this.items.length;
  }

  peek(): ScoredNotification | undefined {
    return this.items[0];
  }

  push(item: ScoredNotification): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  replace(item: ScoredNotification): void {
    this.items[0] = item;
    this.bubbleDown(0);
  }

  toSortedArray(): ScoredNotification[] {
    return [...this.items].sort((a, b) => b.priorityScore - a.priorityScore);
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.items[parent].priorityScore <= this.items[index].priorityScore) {
        break;
      }
      [this.items[parent], this.items[index]] = [
        this.items[index],
        this.items[parent],
      ];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.items.length;

    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (
        left < length &&
        this.items[left].priorityScore < this.items[smallest].priorityScore
      ) {
        smallest = left;
      }

      if (
        right < length &&
        this.items[right].priorityScore < this.items[smallest].priorityScore
      ) {
        smallest = right;
      }

      if (smallest === index) {
        break;
      }

      [this.items[index], this.items[smallest]] = [
        this.items[smallest],
        this.items[index],
      ];
      index = smallest;
    }
  }
}

export function maintainTopPriorityNotifications(
  notifications: Notification[],
  limit = 10
): ScoredNotification[] {
  const heap = new MinHeap();

  for (const notification of notifications) {
    const scored: ScoredNotification = {
      ...notification,
      priorityScore: calculatePriorityScore(notification),
    };

    if (heap.size < limit) {
      heap.push(scored);
      continue;
    }

    const lowest = heap.peek();
    if (lowest && scored.priorityScore > lowest.priorityScore) {
      heap.replace(scored);
    }
  }

  return heap.toSortedArray();
}
