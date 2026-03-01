#!/usr/bin/env node

import { existsSync, renameSync } from 'fs';
import { join } from 'path';
import { IntentAgent } from '../agents/intent/intent.agent.js';
import { FeedbackAction, UserFeedbackSchema } from '../domain/intent.js';
import { FileStore } from '../storage/fileStore.js';

function parseAdjustFlags(args: string[]): { adjustedSizePercent?: number; adjustedHoldingDays?: number; note?: string } {
  let adjustedSizePercent: number | undefined;
  let adjustedHoldingDays: number | undefined;
  const noteParts: string[] = [];

  for (const arg of args) {
    if (arg.startsWith('--size=')) {
      adjustedSizePercent = Number(arg.split('=')[1]);
      continue;
    }

    if (arg.startsWith('--days=')) {
      adjustedHoldingDays = Number(arg.split('=')[1]);
      continue;
    }

    noteParts.push(arg);
  }

  return {
    adjustedSizePercent,
    adjustedHoldingDays,
    note: noteParts.join(' ') || undefined,
  };
}

function maybeArchivePending(proposalId: string): void {
  const pendingFile = join('./memory/approvals/pending', `${proposalId}.json`);
  const processedFile = join('./memory/approvals/processed', `${proposalId}.json`);
  if (existsSync(pendingFile)) {
    renameSync(pendingFile, processedFile);
  }
}

async function main(): Promise<void> {
  const proposalId = process.argv[2];
  const actionRaw = process.argv[3];

  if (!proposalId || !actionRaw) {
    console.log('Usage: npm run feedback <proposal-id> <REJECT|ADJUST|WATCH> [--size=7] [--days=15] [note]');
    process.exit(1);
  }

  const action = actionRaw.toUpperCase() as FeedbackAction;
  if (!['REJECT', 'ADJUST', 'WATCH'].includes(action)) {
    console.log('Only REJECT / ADJUST / WATCH are supported in feedback command');
    process.exit(1);
  }

  const { adjustedSizePercent, adjustedHoldingDays, note } = parseAdjustFlags(process.argv.slice(4));
  const fileStore = new FileStore();
  const proposal = fileStore.findProposalById(proposalId);

  if (!proposal) {
    console.log(`Could not find proposal: ${proposalId}`);
    process.exit(1);
  }

  const feedback = UserFeedbackSchema.parse({
    proposalId: proposal.id,
    symbol: proposal.symbol,
    action,
    note,
    adjustedSizePercent,
    adjustedHoldingDays,
    timestamp: Date.now(),
  });

  const intentAgent = new IntentAgent(fileStore);
  const updatedIntent = await intentAgent.run(feedback);

  if (action === 'REJECT' || action === 'WATCH') {
    maybeArchivePending(proposal.id);
  }

  console.log(`Feedback recorded: ${action} for ${proposal.id}`);
  console.log(`Intent updated: riskTolerance=${updatedIntent.riskTolerance.toFixed(2)}, horizon=${updatedIntent.holdingHorizonDays}d`);
}

main().catch((error) => {
  console.error('Error while processing feedback:', error);
  process.exit(1);
});
