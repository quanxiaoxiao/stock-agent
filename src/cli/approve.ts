#!/usr/bin/env node

import { existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';
import { IntentAgent } from '../agents/intent/intent.agent.js';
import { UserFeedbackSchema } from '../domain/intent.js';
import { FileStore } from '../storage/fileStore.js';

async function main(): Promise<void> {
  const proposalId = process.argv[2];
  const note = process.argv.slice(3).join(' ') || undefined;

  if (!proposalId) {
    console.log('Usage: npm run approve <proposal-id> [note]');
    console.log('Example: npm run approve proposal_xxx "风险可接受"');
    process.exit(1);
  }

  const pendingDir = join('./memory/approvals/pending');
  const approvedDir = join('./memory/approvals/approved');
  const pendingFile = join(pendingDir, `${proposalId}.json`);
  const approvedFile = join(approvedDir, `${proposalId}.json`);

  if (!existsSync(approvedDir)) {
    mkdirSync(approvedDir, { recursive: true });
  }

  if (!existsSync(pendingFile)) {
    console.log(`Could not find: ${proposalId} in pending approvals`);
    process.exit(1);
  }

  const fileStore = new FileStore();
  const proposal = fileStore.findProposalById(proposalId);

  if (!proposal) {
    console.log(`Could not parse proposal ${proposalId}`);
    process.exit(1);
  }

  renameSync(pendingFile, approvedFile);

  const intentAgent = new IntentAgent(fileStore);
  const feedback = UserFeedbackSchema.parse({
    proposalId: proposal.id,
    symbol: proposal.symbol,
    action: 'APPROVE',
    note,
    timestamp: Date.now(),
  });
  const updatedIntent = await intentAgent.run(feedback);

  console.log(`Approved: ${proposalId}`);
  console.log(`Intent updated: riskTolerance=${updatedIntent.riskTolerance.toFixed(2)}, confidence=${updatedIntent.confidence.toFixed(2)}`);
}

main().catch((error) => {
  console.error('Error while approving proposal:', error);
  process.exit(1);
});
