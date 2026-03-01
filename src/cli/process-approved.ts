#!/usr/bin/env node

import { readFileSync, renameSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { TraderAgent } from '../agents/trader/trader.agent.js';
import { TradeProposalSchema } from '../domain/proposal.js';

// Process all approved trades
const approvedDir = join('./memory/approvals/approved');
const processedDir = join('./memory/approvals/processed');

// Make sure processed dir exists
if (!existsSync(processedDir)) {
  mkdirSync(processedDir, { recursive: true });
}

if (!existsSync(approvedDir)) {
  console.log('No approved trades to process');
  process.exit(0);
}

const approvedFiles = readdirSync(approvedDir);

if (approvedFiles.length === 0) {
  console.log('No approved trades to process');
  process.exit(0);
}

console.log(`Processing ${approvedFiles.length} approved trades...`);

const trader = new TraderAgent();

for (const file of approvedFiles) {
  if (file.endsWith('.json')) {
    try {
      const proposalPath = join(approvedDir, file);
      const proposalContent = readFileSync(proposalPath, 'utf8');
      const proposalJson = JSON.parse(proposalContent);
      
      // Validate the proposal with Zod
      const proposal = TradeProposalSchema.parse(proposalJson);
      
      // Check if already executed (if outcome file already exists)
      const outcomePath = join('./memory/outcomes/', `${proposal.id}.json`);
      if (existsSync(outcomePath)) {
        console.log(`Skipped ${proposal.id}. Trade already executed.`);
        
        // Move to processed regardless of duplicate execution
        const processedPath = join(processedDir, file);
        renameSync(proposalPath, processedPath);
        continue;
      }
      
      // Execute the trade
      await trader.run(proposal);
      
      // Mark as processed by moving to processed dir
      const processedPath = join(processedDir, file);
      renameSync(proposalPath, processedPath);
      
      console.log(`Processed and executed: ${proposal.id}`);
      
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error processing ${file}:`, error.message);
      } else {
        console.error(`Unknown error processing ${file}:`, error);
      }
    }
  }
}

console.log('Approved trades processing completed.');