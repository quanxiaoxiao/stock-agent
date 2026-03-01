import { Supervisor } from '../core/supervisor.js';
import { AnalystAgent } from '../agents/analyst/analyst.agent.js';
import { StrategistAgent } from '../agents/strategist/strategist.agent.js';
import { RiskAgent } from '../agents/riskGuard/risk.agent.js';
import { TraderAgent } from '../agents/trader/trader.agent.js';
import { SelectorAgent } from '../agents/selector/selector.agent.js';
import { FileStore } from '../storage/fileStore.js';

export async function decisionFlow(
  symbol?: string
): Promise<void> {
  const store = new FileStore();
  const intent = store.loadUserIntent();
  const selectorAgent = new SelectorAgent();

  const selected = await selectorAgent.run(intent);
  const targetSymbol = symbol || selected.selected.symbol;

  if (!symbol) {
    console.log(`Selected by intent: ${selected.selected.symbol} ${selected.selected.name} (${selected.selected.sector})`);
  }

  console.log(`Starting decision flow for ${targetSymbol}`);
  
  // Create instances of all agents
  const analystAgent = new AnalystAgent();
  const strategistAgent = new StrategistAgent();
  const riskAgent = new RiskAgent();
  const traderAgent = new TraderAgent();
  
  // Create the supervisor with all agents
  const supervisor = new Supervisor(
    analystAgent,
    strategistAgent,
    riskAgent,
    traderAgent
  );
  
  // Execute the full workflow
  await supervisor.execute(targetSymbol);
  
  console.log(`Decision flow completed for ${targetSymbol}`);
}
