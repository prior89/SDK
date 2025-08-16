export class Storage {
  private mem = new Map<string, any>();
  async get<T>(key: string): Promise<T | null> { return this.mem.has(key) ? this.mem.get(key) as T : null; }
  async set<T>(key: string, value: T): Promise<void> { this.mem.set(key, value); }
  async remove(key: string): Promise<void> { this.mem.delete(key); }
  async clear(): Promise<void> { this.mem.clear(); }
  async getAllKeys(): Promise<string[]> { return Array.from(this.mem.keys()); }
}