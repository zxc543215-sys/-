interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store = new Map<string, CacheEntry<any>>();
  private defaultTTL = 300; // 5 minutes

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ?? this.defaultTTL;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new Cache();
