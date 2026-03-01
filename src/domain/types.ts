import { TradeProposal } from './proposal.js';

// Additional domain types
export interface AnalysisResult {
  symbol: string;
  recommendations: string[];
  marketData: MarketData;
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