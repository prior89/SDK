import type { WrongAnswer, QueueItem, QueueStatus, SyncResult } from '../types';

export class Queue {
  private q: QueueItem[] = [];
  async enqueue(item: WrongAnswer) { this.q.push({ id: String(Date.now()), retryCount: 0, addedAt: new Date().toISOString(), ...item }); }
  async dequeue(): Promise<QueueItem | null> { return this.q.shift() ?? null; }
  async processBatch(): Promise<SyncResult> { const count = this.q.length; this.q = []; return { success: count, failed: 0, skipped: 0, movedToDeadLetter: 0, timestamp: new Date().toISOString() }; }
  async getStatus(): Promise<QueueStatus> { return { size: this.q.length, deadLetterSize: 0 }; }
  async clear() { this.q = []; }
}