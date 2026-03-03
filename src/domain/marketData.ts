import { z } from 'zod';

export const MarketDataBarSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export const MarketDataSnapshotSchema = z.object({
  symbol: z.string(),
  timestamp: z.number(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  volume: z.number(),
  high: z.number(),
  low: z.number(),
  open: z.number(),
  previousClose: z.number(),
});

export const MarketDataHistorySchema = z.object({
  symbol: z.string(),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '1d', '1w', '1M']),
  bars: z.array(MarketDataBarSchema),
  lastUpdated: z.number(),
});

export const TechnicalIndicatorsSchema = z.object({
  symbol: z.string(),
  timestamp: z.number(),
  rsi: z.number().optional(),
  macd: z.object({
    macdLine: z.number(),
    signalLine: z.number(),
    histogram: z.number(),
  }).optional(),
  ma50: z.number().optional(),
  ma200: z.number().optional(),
  bollingerBands: z.object({
    upper: z.number(),
    middle: z.number(),
    lower: z.number(),
  }).optional(),
  volatility: z.number(),
});

export const FundamentalDataSchema = z.object({
  symbol: z.string(),
  timestamp: z.number(),
  peRatio: z.number().optional(),
  pbRatio: z.number().optional(),
  dividendYield: z.number().optional(),
  marketCap: z.number().optional(),
  eps: z.number().optional(),
  revenue: z.number().optional(),
  netIncome: z.number().optional(),
  debtToEquity: z.number().optional(),
  returnOnEquity: z.number().optional(),
  sector: z.string().optional(),
  industry: z.string().optional(),
});

export type MarketDataBar = z.infer<typeof MarketDataBarSchema>;
export type MarketDataSnapshot = z.infer<typeof MarketDataSnapshotSchema>;
export type MarketDataHistory = z.infer<typeof MarketDataHistorySchema>;
export type TechnicalIndicators = z.infer<typeof TechnicalIndicatorsSchema>;
export type FundamentalData = z.infer<typeof FundamentalDataSchema>;

export interface MarketDataPackage {
  snapshot: MarketDataSnapshot;
  history: {
    '1d'?: MarketDataHistory;
    '1h'?: MarketDataHistory;
    '1w'?: MarketDataHistory;
  };
  technicals?: TechnicalIndicators;
  fundamentals?: FundamentalData;
  lastUpdated: number;
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  freshness: number;
  consistency: number;
}
