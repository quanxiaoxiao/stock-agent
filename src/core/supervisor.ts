import { Agent } from './agent';
import { TradeProposal } from '../domain/proposal';
import { AnalysisResult, StrategyResult } from '../domain/types';
import { FileStore } from '../storage/fileStore';
import { v4 as uuidv4 } from 'uuid';

export class Supervisor {
  private fileStore: FileStore;

  constructor(
    private analyst: Agent<string, AnalysisResult>,
    private strategist: Agent<AnalysisResult, Partial<TradeProposal>>,
    private risk: Agent<Partial<TradeProposal>, TradeProposal>,
    private trader: Agent<TradeProposal, void>
  ) {
    this.fileStore = new FileStore();
  }

  async execute(symbol: string): Promise<void> {
    console.log(`Starting execution for symbol: ${symbol}`);

    const analysis = await this.analyst.run(symbol);
    console.log(`Analysis completed for ${symbol}`);

    const partialProposal = await this.strategist.run(analysis);
    console.log(`Strategy formed for ${symbol}`);

    const finalProposal = await this.risk.run(partialProposal);
    console.log(`Risk assessment completed for proposal ${finalProposal.id}`);

    if (!finalProposal.requiresApproval) {
      console.log(`Executing automatic trade for ${symbol}`);
      await this.trader.run(finalProposal);
    } else {
      console.log(`Saving proposal ${finalProposal.id} for approval`);
      await this.savePendingApproval(finalProposal);
    }
  }

  private async savePendingApproval(proposal: TradeProposal): Promise<void> {
    this.fileStore.saveForApproval(proposal);
  }
}