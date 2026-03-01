import { TradeProposal } from './proposal.js';
import { AShareStock, UserIntent } from './intent.js';

// Additional domain types
export interface AnalysisResult {
  symbol: string;
  recommendations: string[];
  marketData: MarketData;
  stockContext?: AShareStock;
}

export interface MarketData {
  price: number;
  volume: number;
  peRatio: number;
  marketCap: number;
  volatility: number; // 0-1 scale
}

export interface StrategyResult {
  proposal: Partial<TradeProposal>;
}

export interface RiskEvaluation {
  proposal: TradeProposal;
  riskLevel: number;
  requiresApproval: boolean;
}

export interface ScoredCandidate {
  stock: AShareStock;
  score: number;
}

export interface SelectionResult {
  selected: AShareStock;
  shortlist: ScoredCandidate[];
  intent: UserIntent;
}
