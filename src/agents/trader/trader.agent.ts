import { Agent } from '../../core/agent.js';
import { TradeProposal } from '../../domain/proposal.js';
import { FileStore } from '../../storage/fileStore.js';
import { TradeProposalSchema } from '../../domain/proposal.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class TraderAgent implements Agent<TradeProposal, void> {
  name = 'trader';
  private fileStore: FileStore;

  constructor() {
    this.fileStore = new FileStore();
  }

  async run(proposal: TradeProposal): Promise<void> {
    // Validate proposal with Zod before execution
    const validatedProposal = TradeProposalSchema.parse(proposal);
    
    // In a real implementation, this would connect to a broker API
    console.log(`Executing trade: ${validatedProposal.action} ${validatedProposal.symbol} - ${validatedProposal.sizePercent}%`);
    
    // Record outcome
    const outcome = {
      ...validatedProposal,
      executedAt: Date.now(),
      status: 'executed'
    };
    
    // Save to outcomes in memory
    const outcomePath = join('./memory/outcomes', `${validatedProposal.id}.json`);
    writeFileSync(outcomePath, JSON.stringify(outcome, null, 2));
    
    console.log(`Trade executed and recorded: ${validatedProposal.id}`);
  }
}