import { z } from 'zod';

export const TradeProposalSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  action: z.enum(['BUY', 'SELL', 'ADJUST']),
  sizePercent: z.number().min(0).max(100),
  thesis: z.string(),
  confidence: z.number().min(0).max(1),
  expectedHoldingDays: z.number().int().positive(),
  riskLevel: z.number().min(1).max(5),
  requiresApproval: z.boolean(),
  timestamp: z.number().optional(),
});

export type TradeProposal = z.infer<typeof TradeProposalSchema>;