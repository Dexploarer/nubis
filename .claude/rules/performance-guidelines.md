# ElizaOS Performance Guidelines

## Memory Management

### Memory Optimization Patterns

```typescript
class MemoryOptimizedService extends Service {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxCacheSize = 1000;

  async getCachedData(key: string): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const data = await this.fetchData(key);
    this.setCache(key, data, 300000); // 5 minutes TTL
    return data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    // Implement LRU eviction
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
}
```

### Memory Leak Prevention

```typescript
class MemorySafeService extends Service {
  private listeners = new Set<Function>();
  private timers = new Set<NodeJS.Timeout>();

  addListener(listener: Function): void {
    this.listeners.add(listener);
  }

  removeListener(listener: Function): void {
    this.listeners.delete(listener);
  }

  setTimer(callback: Function, delay: number): NodeJS.Timeout {
    const timer = setTimeout(callback, delay);
    this.timers.add(timer);
    return timer;
  }

  cleanup(): void {
    // Clean up all listeners and timers
    this.listeners.clear();
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}
```

## Database Performance

### Redis Optimization

```typescript
class OptimizedRedisService extends Service {
  private connectionPool: RedisClientType[] = [];
  private maxConnections = 10;

  async getConnection(): Promise<RedisClientType> {
    if (this.connectionPool.length < this.maxConnections) {
      const connection = createClient(this.config);
      await connection.connect();
      this.connectionPool.push(connection);
      return connection;
    }

    // Round-robin load balancing
    return this.connectionPool[Math.floor(Math.random() * this.connectionPool.length)];
  }

  async batchGet(keys: string[]): Promise<Record<string, any>> {
    const connection = await this.getConnection();
    const pipeline = connection.multi();

    keys.forEach((key) => pipeline.get(key));
    const results = await pipeline.exec();

    return keys.reduce(
      (acc, key, index) => {
        acc[key] = results[index];
        return acc;
      },
      {} as Record<string, any>,
    );
  }
}
```

### Query Optimization

```typescript
class QueryOptimizer extends Service {
  async optimizedSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    // Use Redis sorted sets for fast range queries
    const searchKey = `search:${this.hashQuery(query)}`;

    // Check cache first
    const cached = await this.redis.get(searchKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Perform optimized search
    const results = await this.performSearch(query, limit);

    // Cache results for 5 minutes
    await this.redis.setex(searchKey, 300, JSON.stringify(results));

    return results;
  }

  private hashQuery(query: string): string {
    return crypto.createHash('md5').update(query.toLowerCase()).digest('hex');
  }
}
```

## Async Operations

### Promise Optimization

```typescript
class AsyncOptimizer extends Service {
  async parallelProcessing<T>(items: T[], processor: (item: T) => Promise<any>): Promise<any[]> {
    // Process in batches to avoid overwhelming the system
    const batchSize = 10;
    const results: any[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }

    return results;
  }

  async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}
```

### Stream Processing

```typescript
class StreamProcessor extends Service {
  async processLargeDataset<T>(data: T[], processor: (item: T) => Promise<void>): Promise<void> {
    // Process data in chunks to manage memory
    const chunkSize = 100;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      // Process chunk in parallel
      await Promise.all(chunk.map(processor));

      // Allow garbage collection between chunks
      await new Promise((resolve) => setImmediate(resolve));
    }
  }
}
```

## Caching Strategies

### Multi-Level Caching

```typescript
class MultiLevelCache extends Service {
  private l1Cache = new Map<string, any>(); // In-memory cache
  private l2Cache: RedisClientType; // Redis cache

  async get(key: string): Promise<any> {
    // Check L1 cache first
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }

    // Check L2 cache
    const l2Value = await this.l2Cache.get(key);
    if (l2Value) {
      const parsed = JSON.parse(l2Value);
      this.l1Cache.set(key, parsed);
      return parsed;
    }

    // Fetch from source
    const value = await this.fetchFromSource(key);

    // Store in both caches
    this.l1Cache.set(key, value);
    await this.l2Cache.setex(key, 3600, JSON.stringify(value)); // 1 hour TTL

    return value;
  }
}
```

### Cache Invalidation

```typescript
class CacheManager extends Service {
  private invalidationPatterns = new Map<string, RegExp[]>();

  registerInvalidationPattern(cacheKey: string, patterns: string[]): void {
    this.invalidationPatterns.set(
      cacheKey,
      patterns.map((p) => new RegExp(p)),
    );
  }

  async invalidateCache(operation: string, data: any): Promise<void> {
    for (const [cacheKey, patterns] of this.invalidationPatterns) {
      if (patterns.some((pattern) => pattern.test(operation))) {
        await this.clearCache(cacheKey);
      }
    }
  }

  private async clearCache(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

## Network Performance

### Connection Pooling

```typescript
class ConnectionPool extends Service {
  private pools = new Map<string, any[]>();
  private maxConnections = 20;

  async getConnection(type: string): Promise<any> {
    if (!this.pools.has(type)) {
      this.pools.set(type, []);
    }

    const pool = this.pools.get(type)!;

    if (pool.length > 0) {
      return pool.pop();
    }

    if (pool.length < this.maxConnections) {
      return await this.createConnection(type);
    }

    // Wait for available connection
    return new Promise((resolve) => {
      const checkPool = () => {
        if (pool.length > 0) {
          resolve(pool.pop());
        } else {
          setTimeout(checkPool, 100);
        }
      };
      checkPool();
    });
  }

  releaseConnection(type: string, connection: any): void {
    const pool = this.pools.get(type);
    if (pool && pool.length < this.maxConnections) {
      pool.push(connection);
    }
  }
}
```

### Request Optimization

```typescript
class RequestOptimizer extends Service {
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private deduplicationMap = new Map<string, Promise<any>>();

  async optimizedRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const cacheKey = this.generateCacheKey(url, options);

    // Check cache
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) {
      // 5 minutes
      return cached.data;
    }

    // Check for duplicate requests
    if (this.deduplicationMap.has(cacheKey)) {
      return this.deduplicationMap.get(cacheKey);
    }

    // Make request
    const requestPromise = this.makeRequest<T>(url, options);
    this.deduplicationMap.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache result
      this.requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } finally {
      this.deduplicationMap.delete(cacheKey);
    }
  }
}
```

## Monitoring & Metrics

### Performance Monitoring

```typescript
class PerformanceMonitor extends Service {
  private metrics = {
    responseTimes: new Map<string, number[]>(),
    memoryUsage: [] as number[],
    errorRates: new Map<string, number>(),
  };

  startTimer(operation: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.recordResponseTime(operation, duration);
    };
  }

  private recordResponseTime(operation: string, duration: number): void {
    if (!this.metrics.responseTimes.has(operation)) {
      this.metrics.responseTimes.set(operation, []);
    }

    const times = this.metrics.responseTimes.get(operation)!;
    times.push(duration);

    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  getPerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      averageResponseTimes: {},
      memoryUsage: this.metrics.memoryUsage,
      errorRates: {},
    };

    for (const [operation, times] of this.metrics.responseTimes) {
      report.averageResponseTimes[operation] =
        times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    return report;
  }
}
```

### Resource Monitoring

```typescript
class ResourceMonitor extends Service {
  private thresholds = {
    memoryUsage: 0.8, // 80% of available memory
    cpuUsage: 0.9, // 90% of CPU
    diskUsage: 0.85, // 85% of disk space
  };

  async monitorResources(): Promise<ResourceStatus> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = await this.getCpuUsage();
    const diskUsage = await this.getDiskUsage();

    const status: ResourceStatus = {
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: memoryUsage.heapUsed / memoryUsage.heapTotal,
      },
      cpu: {
        usage: cpuUsage,
        threshold: this.thresholds.cpuUsage,
      },
      disk: {
        usage: diskUsage,
        threshold: this.thresholds.diskUsage,
      },
    };

    // Trigger alerts if thresholds exceeded
    if (status.memory.percentage > this.thresholds.memoryUsage) {
      await this.triggerAlert('HIGH_MEMORY_USAGE', status.memory);
    }

    return status;
  }
}
```

## Optimization Best Practices

### Code Optimization

```typescript
class CodeOptimizer extends Service {
  // Use efficient data structures
  private fastLookup = new Set<string>();
  private orderedData = new Map<string, number>();

  // Avoid unnecessary object creation
  private readonly defaultConfig = Object.freeze({
    timeout: 5000,
    retries: 3,
    cache: true,
  });

  // Use efficient loops
  processArray(items: any[]): void {
    // Use for...of for async operations
    for (const item of items) {
      this.processItem(item);
    }

    // Use forEach for synchronous operations
    items.forEach((item) => this.validateItem(item));
  }

  // Implement efficient string operations
  private buildQuery(params: Record<string, string>): string {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  }
}
```

### Algorithm Optimization

```typescript
class AlgorithmOptimizer extends Service {
  // Use efficient search algorithms
  binarySearch<T>(array: T[], target: T, compare: (a: T, b: T) => number): number {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = compare(array[mid], target);

      if (comparison === 0) return mid;
      if (comparison < 0) left = mid + 1;
      else right = mid - 1;
    }

    return -1;
  }

  // Implement efficient sorting for specific use cases
  sortByFrequency<T>(items: T[]): T[] {
    const frequency = new Map<T, number>();

    // Count frequencies
    for (const item of items) {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    }

    // Sort by frequency (descending)
    return items.sort((a, b) => {
      const freqA = frequency.get(a) || 0;
      const freqB = frequency.get(b) || 0;
      return freqB - freqA;
    });
  }
}
```
