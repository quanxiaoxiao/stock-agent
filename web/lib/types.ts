// 类型定义 - 从后端项目复用

export type Action = 'BUY' | 'SELL' | 'ADJUST';
export type StrategyStyle = 'VALUE' | 'GROWTH' | 'MOMENTUM' | 'BALANCED';
export type MarketCap = 'LARGE' | 'MID' | 'SMALL';
export type FeedbackAction = 'APPROVE' | 'REJECT' | 'ADJUST' | 'WATCH';
export type MemoryTag = 
  | 'WIN' | 'LOSS' | 'BREAK_EVEN' 
  | 'HIGH_CONFIDENCE' | 'LOW_CONFIDENCE'
  | 'HIGH_RISK' | 'LOW_RISK' | 'LEARNING'
  | 'MARKET_TREND_UP' | 'MARKET_TREND_DOWN' | 'MARKET_SIDEWAYS'
  | 'VOLATILE' | 'STABLE';
export type MemoryEmotion = 'CONFIDENT' | 'CAUTIOUS' | 'ANXIOUS' | 'EXCITED' | 'REGRET' | 'SATISFIED' | 'NEUTRAL';

export interface TradeProposal {
  id: string;
  symbol: string;
  action: Action;
  sizePercent: number;
  thesis: string;
  confidence: number;
  expectedHoldingDays: number;
  riskLevel: number;
  requiresApproval: boolean;
  timestamp: number;
}

export interface UserIntent {
  riskTolerance: number;
  preferredSectors: string[];
  avoidSectors: string[];
  preferredMarketCaps: MarketCap[];
  style: StrategyStyle;
  holdingHorizonDays: number;
  blacklistSymbols: string[];
  confidence: number;
  updatedAt: number;
}

export interface UserFeedback {
  proposalId: string;
  symbol: string;
  action: FeedbackAction;
  note?: string;
  adjustedSizePercent?: number;
  adjustedHoldingDays?: number;
  timestamp: number;
}

export interface TradeOutcome {
  executed: boolean;
  executionPrice?: number;
  executionTimestamp?: number;
  result?: 'WIN' | 'LOSS' | 'BREAK_EVEN' | 'PENDING';
  returnPercent?: number;
  notes?: string;
}

export interface EpisodicMemory {
  id: string;
  type: 'EPISODIC';
  timestamp: number;
  proposal: TradeProposal;
  outcome: TradeOutcome;
  tags: MemoryTag[];
  emotion: MemoryEmotion;
  reflection?: string;
  lessonsLearned?: string[];
}

export interface ReflectionInsight {
  id: string;
  timestamp: number;
  periodStart: number;
  periodEnd: number;
  summary: string;
  keyInsights: string[];
  performanceMetrics: {
    totalTrades: number;
    winRate: number;
    averageReturn: number;
    maxDrawdown: number;
    sharpeRatio?: number;
  };
  suggestedImprovements: string[];
}

export interface DecisionResult {
  proposal: TradeProposal;
  executed: boolean;
  message: string;
}
