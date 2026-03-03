import {
  MarketDataProvider,
  CachedData,
  CacheConfig,
  DEFAULT_CACHE_CONFIG,
} from './marketData.provider.js';
import {
  MarketDataPackage,
  MarketDataSnapshot,
  MarketDataHistory,
  TechnicalIndicators,
  FundamentalData,
  DataQualityMetrics,
  MarketDataSnapshotSchema,
  MarketDataHistorySchema,
  TechnicalIndicatorsSchema,
  FundamentalDataSchema,
} from '../domain/marketData.js';
import { FileStore } from '../storage/fileStore.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class MarketDataService {
  private provider: MarketDataProvider;
  private cacheConfig: CacheConfig;
  private cacheDir: string;
  private fileStore: FileStore;
  
  private snapshotCache: Map<string, CacheEntry<MarketDataSnapshot>> = new Map();
  private historyCache: Map<string, CacheEntry<MarketDataHistory>> = new Map();
  private technicalsCache: Map<string, CacheEntry<TechnicalIndicators>> = new Map();
  private fundamentalsCache: Map<string, CacheEntry<FundamentalData>> = new Map();

  constructor(
    provider: MarketDataProvider,
    cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG,
    basePath: string = './memory'
  ) {
    this.provider = provider;
    this.cacheConfig = cacheConfig;
    this.cacheDir = join(basePath, 'market-data');
    this.fileStore = new FileStore(basePath);
    
    this.ensureCacheDir();
    this.loadPersistentCache();
  }

  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private loadPersistentCache(): void {
    const snapshotPath = join(this.cacheDir, 'snapshots.json');
    const historyPath = join(this.cacheDir, 'history.json');
    const technicalsPath = join(this.cacheDir, 'technicals.json');
    const fundamentalsPath = join(this.cacheDir, 'fundamentals.json');

    if (existsSync(snapshotPath)) {
      const data = JSON.parse(readFileSync(snapshotPath, 'utf8'));
      Object.entries(data).forEach(([key, value]) => {
        this.snapshotCache.set(key, value as CacheEntry<MarketDataSnapshot>);
      });
    }

    if (existsSync(historyPath)) {
      const data = JSON.parse(readFileSync(historyPath, 'utf8'));
      Object.entries(data).forEach(([key, value]) => {
        this.historyCache.set(key, value as CacheEntry<MarketDataHistory>);
      });
    }

    if (existsSync(technicalsPath)) {
      const data = JSON.parse(readFileSync(technicalsPath, 'utf8'));
      Object.entries(data).forEach(([key, value]) => {
        this.technicalsCache.set(key, value as CacheEntry<TechnicalIndicators>);
      });
    }

    if (existsSync(fundamentalsPath)) {
      const data = JSON.parse(readFileSync(fundamentalsPath, 'utf8'));
      Object.entries(data).forEach(([key, value]) => {
        this.fundamentalsCache.set(key, value as CacheEntry<FundamentalData>);
      });
    }
  }

  private savePersistentCache(): void {
    writeFileSync(
      join(this.cacheDir, 'snapshots.json'),
      JSON.stringify(Object.fromEntries(this.snapshotCache), null, 2)
    );
    writeFileSync(
      join(this.cacheDir, 'history.json'),
      JSON.stringify(Object.fromEntries(this.historyCache), null, 2)
    );
    writeFileSync(
      join(this.cacheDir, 'technicals.json'),
      JSON.stringify(Object.fromEntries(this.technicalsCache), null, 2)
    );
    writeFileSync(
      join(this.cacheDir, 'fundamentals.json'),
      JSON.stringify(Object.fromEntries(this.fundamentalsCache), null, 2)
    );
  }

  private isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false;
    return Date.now() - entry.timestamp < entry.ttl;
  }

  async getSnapshot(symbol: string, forceRefresh = false): Promise<MarketDataSnapshot> {
    const cacheKey = symbol.toUpperCase();
    
    if (!forceRefresh) {
      const cached = this.snapshotCache.get(cacheKey);
      if (this.isCacheValid(cached)) {
        return cached!.data;
      }
    }

    const snapshot = await this.provider.getSnapshot(symbol);
    const validated = MarketDataSnapshotSchema.parse(snapshot);
    
    this.snapshotCache.set(cacheKey, {
      data: validated,
      timestamp: Date.now(),
      ttl: this.cacheConfig.snapshotTTL,
    });
    
    this.savePersistentCache();
    return validated;
  }

  async getHistory(
    symbol: string,
    timeframe: '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1M',
    startDate?: number,
    endDate?: number,
    forceRefresh = false
  ): Promise<MarketDataHistory> {
    const cacheKey = `${symbol.toUpperCase()}_${timeframe}`;
    
    if (!forceRefresh) {
      const cached = this.historyCache.get(cacheKey);
      if (this.isCacheValid(cached)) {
        return cached!.data;
      }
    }

    const history = await this.provider.getHistory(symbol, timeframe, startDate, endDate);
    const validated = MarketDataHistorySchema.parse(history);
    
    this.historyCache.set(cacheKey, {
      data: validated,
      timestamp: Date.now(),
      ttl: this.cacheConfig.historyTTL,
    });
    
    this.savePersistentCache();
    return validated;
  }

  async getTechnicalIndicators(symbol: string, forceRefresh = false): Promise<TechnicalIndicators> {
    const cacheKey = symbol.toUpperCase();
    
    if (!forceRefresh) {
      const cached = this.technicalsCache.get(cacheKey);
      if (this.isCacheValid(cached)) {
        return cached!.data;
      }
    }

    const technicals = await this.provider.getTechnicalIndicators(symbol);
    const validated = TechnicalIndicatorsSchema.parse(technicals);
    
    this.technicalsCache.set(cacheKey, {
      data: validated,
      timestamp: Date.now(),
      ttl: this.cacheConfig.technicalsTTL,
    });
    
    this.savePersistentCache();
    return validated;
  }

  async getFundamentalData(symbol: string, forceRefresh = false): Promise<FundamentalData> {
    const cacheKey = symbol.toUpperCase();
    
    if (!forceRefresh) {
      const cached = this.fundamentalsCache.get(cacheKey);
      if (this.isCacheValid(cached)) {
        return cached!.data;
      }
    }

    const fundamentals = await this.provider.getFundamentalData(symbol);
    const validated = FundamentalDataSchema.parse(fundamentals);
    
    this.fundamentalsCache.set(cacheKey, {
      data: validated,
      timestamp: Date.now(),
      ttl: this.cacheConfig.fundamentalsTTL,
    });
    
    this.savePersistentCache();
    return validated;
  }

  async getCompletePackage(symbol: string, forceRefresh = false): Promise<MarketDataPackage> {
    const [snapshot, history1d, history1h, history1w, technicals, fundamentals] = await Promise.all([
      this.getSnapshot(symbol, forceRefresh),
      this.getHistory(symbol, '1d', undefined, undefined, forceRefresh),
      this.getHistory(symbol, '1h', undefined, undefined, forceRefresh).catch(() => undefined),
      this.getHistory(symbol, '1w', undefined, undefined, forceRefresh).catch(() => undefined),
      this.getTechnicalIndicators(symbol, forceRefresh).catch(() => undefined),
      this.getFundamentalData(symbol, forceRefresh).catch(() => undefined),
    ]);

    return {
      snapshot,
      history: {
        '1d': history1d,
        '1h': history1h,
        '1w': history1w,
      },
      technicals,
      fundamentals,
      lastUpdated: Date.now(),
    };
  }

  assessDataQuality(pkg: MarketDataPackage): DataQualityMetrics {
    let completeness = 1.0;
    let accuracy = 1.0;
    let freshness = 1.0;
    let consistency = 1.0;

    const ageMs = Date.now() - pkg.lastUpdated;
    freshness = Math.max(0, 1 - ageMs / 3600000);

    if (!pkg.technicals) completeness -= 0.2;
    if (!pkg.fundamentals) completeness -= 0.2;
    if (!pkg.history['1h']) completeness -= 0.1;
    if (!pkg.history['1w']) completeness -= 0.1;

    if (pkg.history['1d'] && pkg.history['1d'].bars.length < 100) consistency -= 0.1;

    return {
      completeness: Math.max(0, completeness),
      accuracy: Math.max(0, accuracy),
      freshness: Math.max(0, freshness),
      consistency: Math.max(0, consistency),
    };
  }

  clearCache(symbol?: string): void {
    if (symbol) {
      const key = symbol.toUpperCase();
      this.snapshotCache.delete(key);
      this.technicalsCache.delete(key);
      this.fundamentalsCache.delete(key);
      
      for (const cacheKey of this.historyCache.keys()) {
        if (cacheKey.startsWith(key + '_')) {
          this.historyCache.delete(cacheKey);
        }
      }
    } else {
      this.snapshotCache.clear();
      this.historyCache.clear();
      this.technicalsCache.clear();
      this.fundamentalsCache.clear();
    }
    this.savePersistentCache();
  }

  async syncAll(symbols: string[]): Promise<Map<string, MarketDataPackage>> {
    const results = new Map<string, MarketDataPackage>();
    
    for (const symbol of symbols) {
      try {
        const pkg = await this.getCompletePackage(symbol, true);
        results.set(symbol, pkg);
      } catch (error) {
        console.error(`Failed to sync ${symbol}:`, error);
      }
    }
    
    return results;
  }
}
