#!/usr/bin/env node

import { FileStore } from '../storage/fileStore.js';

async function checkApprovals(): Promise<void> {
  const store = new FileStore();
  const pending = await store.getPendingApprovals();
  
  if (pending.length === 0) {
    console.log('No pending approvals');
    return;
  }
  
  console.log(`Found ${pending.length} items awaiting approval:`);
  for (const item of pending) {
    console.log(`${item.id}: ${item.action} ${item.symbol} (${item.sizePercent}%) - Risk: ${item.riskLevel}`);
    console.log(`  Thesis: ${item.thesis}`);
    console.log('');
  }
}

checkApprovals();