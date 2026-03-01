import { Agent } from '../../core/agent';
import { TradeProposal } from '../../domain/proposal';
import { FileStore } from '../../storage/fileStore';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class TraderAgent implements Agent<TradeProposal, void> {
  name = 'trader';
  private fileStore: FileStore;

  constructor() {
    this.fileStore = new FileStore();
  }

  async run(proposal: TradeProposal): Promise<void> {
    // In a real implementation, this would connect to a broker API
    console.log(`Executing trade: ${proposal.action} ${proposal.symbol} - ${proposal.sizePercent}%`);
    
    // Record outcome
    const outcome = {
      ...proposal,
      executedAt: Date.now(),
      status: 'executed'
    };
    
    // Save to outcomes in memory
    const outcomePath = join('./memory/outcomes', `${proposal.id}.json`);
    writeFileSync(outcomePath, JSON.stringify(outcome, null, 2));
    
    console.log(`Trade executed and recorded: ${proposal.id}`);
  }
}