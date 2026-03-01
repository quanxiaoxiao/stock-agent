import { Supervisor } from '../core/supervisor';
import { AnalystAgent } from '../agents/analyst/analyst.agent';
import { StrategistAgent } from '../agents/strategist/strategist.agent';
import { RiskAgent } from '../agents/riskGuard/risk.agent';
import { TraderAgent } from '../agents/trader/trader.agent';

export async function decisionFlow(
  symbol: string
): Promise<void> {
  console.log(`Starting decision flow for ${symbol}`);
  
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
  await supervisor.execute(symbol);
  
  console.log(`Decision flow completed for ${symbol}`);
}