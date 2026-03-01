#!/usr/bin/env node

import { readFileSync, renameSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import YAML from 'yaml';
import { FileStore } from '../storage/fileStore.js';
import { TradeProposalSchema } from '../domain/proposal.js';
import { TraderAgent } from '../agents/trader/trader.agent.js';

// Load risk config
const riskConfig = YAML.parse(
  readFileSync(join(process.cwd(), 'config/risk-level.yaml'), 'utf8')
);

// Move a proposal from pending to approved
if (process.argv[2]) {
  const proposalId = process.argv[2];
  
  const pendingDir = join('./memory/approvals/pending');
  const approvedDir = join('./memory/approvals/approved');
  const pendingFile = join(pendingDir, `${proposalId}.json`);
  const approvedFile = join(approvedDir, `${proposalId}.json`);
  
  // Make sure approved dir exists
  if (!existsSync(approvedDir)) {
    mkdirSync(approvedDir, { recursive: true });
  }
  
  if (existsSync(pendingFile)) {
    renameSync(pendingFile, approvedFile);
    console.log(`Approved: ${proposalId}`);
    
    // Also trigger execution of approved trade (Part of the approval-to-execution loop)
    const proposalContent = readFileSync(approvedFile, 'utf8');
    const proposal = JSON.parse(proposalContent);
    
    // Validate the proposal with Zod
    try {
      const validatedProposal = TradeProposalSchema.parse(proposal);
      
      // Execute the trade
      const trader = new TraderAgent();
      trader.run(validatedProposal);
      console.log(`Executed trade for: ${validatedProposal.id}`);
    } catch (validationError) {
      console.error(`Validation error for proposal ${proposalId}:`, validationError);
    }
  } else {
    console.log(`Could not find: ${proposalId} in pending approvals`);
  }
} else {
  console.log('Usage: npm run approve <proposal-id>');
  console.log('Example: npm run approve abc123');
}