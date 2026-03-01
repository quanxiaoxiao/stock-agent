import { Agent } from '../../core/agent';
import { AnalysisResult } from '../../domain/types';
import { TradeProposal } from '../../domain/proposal';
import { v4 as uuidv4 } from 'uuid';

export class StrategistAgent implements Agent<AnalysisResult, Partial<TradeProposal>> {
  name = 'strategist';

  async run(input: AnalysisResult): Promise<Partial<TradeProposal>> {
    const { symbol, marketData } = input;

    // Generate a basic proposal using simple strategy
    const confidence = Math.min(0.9, 1.0 - marketData.volatility);
    const sizePercent = marketData.volatility < 0.3 ? 10 : marketData.volatility < 0.5 ? 7 : 5;

    return {
      id: `proposal_${uuidv4()}`,
      symbol,
      action: Math.random() > 0.5 ? 'BUY' : 'SELL',
      sizePercent,
      thesis: `Technical analysis suggests movement based on volatility`,
      confidence,
      expectedHoldingDays: marketData.volatility < 0.3 ? 30 : marketData.volatility < 0.5 ? 15 : 7,
      timestamp: Date.now(),
    };
  }
}