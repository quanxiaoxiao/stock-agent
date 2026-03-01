import { z } from 'zod';

export const StrategyStyleSchema = z.enum(['VALUE', 'GROWTH', 'MOMENTUM', 'BALANCED']);
export type StrategyStyle = z.infer<typeof StrategyStyleSchema>;

export const MarketCapSchema = z.enum(['LARGE', 'MID', 'SMALL']);
export type MarketCap = z.infer<typeof MarketCapSchema>;

export const UserIntentSchema = z.object({
  riskTolerance: z.number().min(0).max(1),
  preferredSectors: z.array(z.string()),
  avoidSectors: z.array(z.string()),
  preferredMarketCaps: z.array(MarketCapSchema),
  style: StrategyStyleSchema,
  holdingHorizonDays: z.number().int().positive(),
  blacklistSymbols: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  updatedAt: z.number(),
});

export type UserIntent = z.infer<typeof UserIntentSchema>;

export const FeedbackActionSchema = z.enum(['APPROVE', 'REJECT', 'ADJUST', 'WATCH']);
export type FeedbackAction = z.infer<typeof FeedbackActionSchema>;

export const UserFeedbackSchema = z.object({
  proposalId: z.string(),
  symbol: z.string(),
  action: FeedbackActionSchema,
  note: z.string().optional(),
  adjustedSizePercent: z.number().min(0).max(100).optional(),
  adjustedHoldingDays: z.number().int().positive().optional(),
  timestamp: z.number(),
});

export type UserFeedback = z.infer<typeof UserFeedbackSchema>;

export const AShareStockSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  sector: z.string(),
  marketCap: MarketCapSchema,
  volatility: z.number().min(0).max(1),
  momentumScore: z.number().min(0).max(1),
  valueScore: z.number().min(0).max(1),
  qualityScore: z.number().min(0).max(1),
  liquidityScore: z.number().min(0).max(1),
});

export type AShareStock = z.infer<typeof AShareStockSchema>;

export function createDefaultIntent(): UserIntent {
  return {
    riskTolerance: 0.45,
    preferredSectors: [],
    avoidSectors: [],
    preferredMarketCaps: ['LARGE', 'MID'],
    style: 'BALANCED',
    holdingHorizonDays: 20,
    blacklistSymbols: [],
    confidence: 0.5,
    updatedAt: Date.now(),
  };
}
