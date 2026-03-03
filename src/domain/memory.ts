import { z } from 'zod';
import { TradeProposal } from './proposal.js';
import { UserIntent } from './intent.js';
import { MarketDataPackage } from './marketData.js';

export const MemoryTagSchema = z.enum([
  'WIN',
  'LOSS',
  'BREAK_EVEN',
  'HIGH_CONFIDENCE',
  'LOW_CONFIDENCE',
  'HIGH_RISK',
  'LOW_RISK',
  'LEARNING',
  'STRATEGY_TEST',
  'MARKET_TREND_UP',
  'MARKET_TREND_DOWN',
  'MARKET_SIDEWAYS',
  'VOLATILE',
  'STABLE',
]);

export const MemoryEmotionSchema = z.enum([
  'CONFIDENT',
  'CAUTIOUS',
  'ANXIOUS',
  'EXCITED',
  'REGRET',
  'SATISFIED',
  'NEUTRAL',
]);

export const EpisodicMemorySchema = z.object({
  id: z.string(),
  type: z.literal('EPISODIC'),
  timestamp: z.number(),
  proposal: z.any(),
  outcome: z.object({
    executed: z.boolean(),
    executionPrice: z.number().optional(),
    executionTimestamp: z.number().optional(),
    result: z.enum(['WIN', 'LOSS', 'BREAK_EVEN', 'PENDING']).optional(),
    returnPercent: z.number().optional(),
    notes: z.string().optional(),
  }),
  marketContext: z.any().optional(),
  userIntent: z.any().optional(),
  tags: z.array(MemoryTagSchema),
  emotion: MemoryEmotionSchema,
  reflection: z.string().optional(),
  lessonsLearned: z.array(z.string()).optional(),
});

export const SemanticMemorySchema = z.object({
  id: z.string(),
  type: z.literal('SEMANTIC'),
  timestamp: z.number(),
  category: z.enum([
    'MARKET_PATTERN',
    'TRADING_RULE',
    'SECTOR_KNOWLEDGE',
    'SYMBOL_INSIGHT',
    'RISK_PRINCIPLE',
    'GENERAL_KNOWLEDGE',
  ]),
  title: z.string(),
  content: z.string(),
  source: z.enum(['EXPERIENCE', 'LEARNING', 'FEEDBACK', 'REFLECTION']),
  relatedSymbols: z.array(z.string()).optional(),
  relatedTags: z.array(MemoryTagSchema).optional(),
  confidence: z.number().min(0).max(1),
  lastVerified: z.number().optional(),
});

export const ProceduralMemorySchema = z.object({
  id: z.string(),
  type: z.literal('PROCEDURAL'),
  timestamp: z.number(),
  name: z.string(),
  description: z.string(),
  procedureType: z.enum(['ENTRY_STRATEGY', 'EXIT_STRATEGY', 'RISK_MANAGEMENT', 'POSITION_SIZING', 'PORTFOLIO_REBALANCE']),
  steps: z.array(z.string()),
  conditions: z.array(z.string()),
  successRate: z.number().min(0).max(1).optional(),
  useCount: z.number().optional(),
  lastUsed: z.number().optional(),
  isActive: z.boolean(),
  version: z.string(),
});

export const ReflectionInsightSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  periodStart: z.number(),
  periodEnd: z.number(),
  summary: z.string(),
  keyInsights: z.array(z.string()),
  performanceMetrics: z.object({
    totalTrades: z.number(),
    winRate: z.number(),
    averageReturn: z.number(),
    maxDrawdown: z.number(),
    sharpeRatio: z.number().optional(),
  }),
  suggestedImprovements: z.array(z.string()),
  intentAdjustments: z.any().optional(),
});

export type MemoryTag = z.infer<typeof MemoryTagSchema>;
export type MemoryEmotion = z.infer<typeof MemoryEmotionSchema>;
export type EpisodicMemory = z.infer<typeof EpisodicMemorySchema>;
export type SemanticMemory = z.infer<typeof SemanticMemorySchema>;
export type ProceduralMemory = z.infer<typeof ProceduralMemorySchema>;
export type ReflectionInsight = z.infer<typeof ReflectionInsightSchema>;

export type Memory = EpisodicMemory | SemanticMemory | ProceduralMemory;

export interface MemoryQuery {
  types?: Array<'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL'>;
  tags?: MemoryTag[];
  symbols?: string[];
  dateRange?: { start: number; end: number };
  limit?: number;
  minConfidence?: number;
}

export interface MemoryRetrievalResult {
  memories: Memory[];
  relevanceScores: Map<string, number>;
  query: MemoryQuery;
}
