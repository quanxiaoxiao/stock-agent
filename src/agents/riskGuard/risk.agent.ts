import { Agent } from '../../core/agent.js';
import { TradeProposal } from '../../domain/proposal.js';
import { TradeProposalSchema } from '../../domain/proposal.js';
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
    
    // Determine execution mode based on risk level
    // Level 1-2: Auto execute
    // Level 3: Approval required 
    // Level 4+: Manual block (will require special handling outside of standard flow)
    const executionMode = this.getExecutionMode(proposalWithDefaults.riskLevel);
    
    // Mark for approval if in approval range, block if in manual block range
    proposalWithDefaults.requiresApproval = 
      executionMode === 'APPROVAL' || executionMode === 'MANUAL_BLOCK';
    
    // For demonstration purposes, let's also require approval for certain high-risk symbols
    // These are typically highly volatile stocks like VXX, UVXY, etc.
    const volatileSymbols = ['VXX', 'UVXY', 'TVIX', 'XIV', 'SVXY'];
    if (volatileSymbols.includes(proposalWithDefaults.symbol.toUpperCase())) {
      proposalWithDefaults.requiresApproval = true;
      proposalWithDefaults.riskLevel = 4; // Increase risk level for volatile symbols
    }
    
    // Validate using Zod schema before returning
    const validatedProposal = TradeProposalSchema.parse(proposalWithDefaults);
    
    return validatedProposal;
  }
  
  private getExecutionMode(riskLevel: number): string {
    if (riskLevel <= riskConfig.levels.auto) {
      return 'AUTO';
    } else if (riskLevel < riskConfig.levels.manual) {
      return 'APPROVAL';  // Level 3 
    } else {
      return 'MANUAL_BLOCK';  // Level 4+
    }
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
