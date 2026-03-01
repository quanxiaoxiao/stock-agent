#!/usr/bin/env node

import { decisionFlow } from '../workflows/decision.workflow.js';

async function main(): Promise<void> {
  const symbol = process.argv[2];
  if (symbol) {
    console.log(`Starting stock analysis for: ${symbol.toUpperCase()}`);
  } else {
    console.log('Starting intent-driven stock analysis (auto select from A-share universe)');
  }
  
  try {
    await decisionFlow(symbol?.toUpperCase());
    console.log('Process completed successfully');
  } catch (error) {
    console.error('Error during execution:', error);
    process.exit(1);
  }
}

main();
