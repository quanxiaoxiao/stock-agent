#!/usr/bin/env node

import { decisionFlow } from '../workflows/decision.workflow';

async function main(): Promise<void> {
  const symbol = process.argv[2];
  
  if (!symbol) {
    console.error('Usage: npm start <SYMBOL>');
    console.error('Example: npm start AAPL');
    process.exit(1);
  }
  
  console.log(`Starting stock analysis for: ${symbol.toUpperCase()}`);
  
  try {
    await decisionFlow(symbol.toUpperCase());
    console.log('Process completed successfully');
  } catch (error) {
    console.error('Error during execution:', error);
    process.exit(1);
  }
}

main();