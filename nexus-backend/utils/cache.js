/**
 * Nexus Intelligence Cache
 * Lightweight in-memory caching system with TTL support.
 * Designed for high-frequency profile lookups and AI draft caching.
 */
class NexusCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a value in cache
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlMs - Time to live in milliseconds
   */
  set(key, value, ttlMs = 300000) { // Default 5 minutes
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
    
    // Cleanup expired entry automatically (optional but good for long-lived servers)
    setTimeout(() => {
      if (this.cache.has(key) && this.cache.get(key).expiry <= Date.now()) {
        this.cache.delete(key);
      }
    }, ttlMs);
  }

  /**
   * Get a value from cache
   * @param {string} key 
   * @returns {any|null}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[CACHE_HIT] Resolved key: ${key}`);
    return entry.value;
  }

  /**
   * Delete a key
   * @param {string} key 
   */
  del(key) {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
  }
}

// Export singleton instance
export const cache = new NexusCache();
export default cache;
