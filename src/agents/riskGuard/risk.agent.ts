import { Agent } from '../../core/agent';
import { TradeProposal } from '../../domain/proposal';
import { RiskEvaluation } from '../../domain/types';
import { readFileSync } from 'fs';
import { join } from 'path';
import YAML from 'yaml';

// Load risk configuration
const riskConfigContent = readFileSync(join(process.cwd(), 'config/risk-level.yaml'), 'utf8');
const riskConfig = YAML.parse(riskConfigContent);

export class RiskAgent implements Agent<Partial<TradeProposal>, TradeProposal> {
  name = 'risk-guard';
  
  async run(input: Partial<TradeProposal>): Promise<TradeProposal> {
    // Ensure all required fields are filled
    const proposalWithDefaults: TradeProposal = {
      id: input.id || `risk_${Math.random().toString(36).substr(2, 9)}`,
      symbol: input.symbol || 'UNKNOWN',
      action: input.action || 'BUY',
      sizePercent: input.sizePercent !== undefined ? input.sizePercent : 5,
      thesis: input.thesis || 'Default thesis',
      confidence: input.confidence !== undefined ? input.confidence : 0.5,
      expectedHoldingDays: input.expectedHoldingDays || 15,
      riskLevel: this.calculateRiskLevel(input),
      requiresApproval: false, // Will be determined based on risk level
      timestamp: Date.now(),
    };
    
    // Determine if approval is needed based on risk level
    proposalWithDefaults.requiresApproval = proposalWithDefaults.riskLevel >= riskConfig.levels.approval;
    
    // For demonstration purposes, let's also require approval for certain high-risk symbols
    // These are typically highly volatile stocks like VXX, UVXY, etc.
    const volatileSymbols = ['VXX', 'UVXY', 'TVIX', 'XIV', 'SVXY'];
    if (volatileSymbols.includes(proposalWithDefaults.symbol.toUpperCase())) {
      proposalWithDefaults.requiresApproval = true;
      proposalWithDefaults.riskLevel = 4; // Increase risk level for volatile symbols
    }
    
    return proposalWithDefaults;
  }
  
  private calculateRiskLevel(proposal: Partial<TradeProposal>): number {
    // Base risk calculation from confidence and size
    let riskLevel = 1; // Start with minimal risk
    
    // If confidence is low, increase risk
    if (proposal.confidence && proposal.confidence < 0.3) {
      riskLevel += 2;
    } else if (proposal.confidence && proposal.confidence < 0.6) {
      riskLevel += 1;
    }
    
    // If position size is larger than 12%, increase risk
    if (proposal.sizePercent && proposal.sizePercent > 12) {
      riskLevel += 1;
    }
    
    // Limit risk level to max of 5
    return Math.min(5, riskLevel);
  }
}