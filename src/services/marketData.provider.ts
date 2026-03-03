import {
  MarketDataSnapshot,
  MarketDataHistory,
  TechnicalIndicators,
  FundamentalData,
  DataQualityMetrics,
} from '../domain/marketData.js';

export interface MarketDataProvider {
  name: string;
  
  getSnapshot(symbol: string): Promise<MarketDataSnapshot>;
  
  getHistory(
    symbol: string,
    timeframe: '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1M',
    startDate?: number,
    endDate?: number
  ): Promise<MarketDataHistory>;
  
  getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators>;
  
  getFundamentalData(symbol: string): Promise<FundamentalData>;
  
  validateConnection(): Promise<boolean>;
  
  getRateLimitStatus(): Promise<{
    remaining: number;
    resetTime: number;
  }>;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  snapshotTTL: number;
  historyTTL: number;
  technicalsTTL: number;
  fundamentalsTTL: number;
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  snapshotTTL: 60000,
  historyTTL: 300000,
  technicalsTTL: 600000,
  fundamentalsTTL: 3600000,
};
