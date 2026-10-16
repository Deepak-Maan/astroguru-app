import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class FastCacheService {
  private memoryStore = new Map<string, CacheEntry<any>>();
  private maxMemoryEntries = 200;

  /**
   * Instant Synchronous Memory Read (0ms latency)
   */
  getSync<T>(key: string): T | null {
    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Async Read with Persistent Fallback
   */
  async get<T>(key: string): Promise<T | null> {
    const syncVal = this.getSync<T>(key);
    if (syncVal !== null) return syncVal;

    try {
      const raw = await AsyncStorage.getItem(`fast_cache_${key}`);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() > entry.expiresAt) {
        AsyncStorage.removeItem(`fast_cache_${key}`).catch(() => {});
        return null;
      }

      // Populate memory cache
      this.setMemory(key, entry.data, entry.expiresAt);
      return entry.data;
    } catch {
      return null;
    }
  }

  /**
   * Save to Memory and Persist
   */
  async set<T>(key: string, data: T, ttlMs: number = 30 * 60 * 1000): Promise<void> {
    const expiresAt = Date.now() + ttlMs;
    this.setMemory(key, data, expiresAt);

    try {
      const entry: CacheEntry<T> = { data, expiresAt };
      await AsyncStorage.setItem(`fast_cache_${key}`, JSON.stringify(entry));
    } catch {}
  }

  private setMemory<T>(key: string, data: T, expiresAt: number) {
    if (this.memoryStore.size >= this.maxMemoryEntries) {
      // LRU Eviction: Remove oldest key
      const oldestKey = this.memoryStore.keys().next().value;
      if (oldestKey) this.memoryStore.delete(oldestKey);
    }
    this.memoryStore.set(key, { data, expiresAt });
  }

  delete(key: string): void {
    this.memoryStore.delete(key);
    AsyncStorage.removeItem(`fast_cache_${key}`).catch(() => {});
  }

  clear(): void {
    this.memoryStore.clear();
  }
}

export const fastCache = new FastCacheService();
