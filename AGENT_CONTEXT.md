# AGENT CONTEXT

# AGENT CONTEXT

This repository implements a controlled autonomous trading system with multi-layered risk management.

## Core Principles

- Agents NEVER execute trades directly without proper validation
- All trades MUST be validated through TradeProposal objects with Zod schema
- RiskGuard determines approval requirements based on risk levels (1-5 scale)
- Supervisor orchestrates workflow between all agents
- YAML configuration drives behavior parameters
- File-based persistence (no database required)

## Technical Architecture

- Uses TypeScript strict mode with ESM modules
- Agent interface: `Agent<I, O> { name: string; run(input: I): Promise<O>; }`
- Zod schemas for all data validation (never trust agent outputs without schema validation)
- Strong typing between agent boundaries to catch integration issues at compile time

## System Flow

1. Analyst: Analyzes market data for symbol → returns AnalysisResult
2. Strategist: Processes analysis → returns partial TradeProposal  
3. RiskGuard: Evaluates proposal → finalizes TradeProposal with risk level and approval requirement
4. Trader: Executes approved proposals → records outcome to file system

## Special Symbols (Requires Approval)

The following symbols are automatically flagged as high-risk and require manual approval:
- VXX, UVXY, TVIX, XIV, SVXY (volatility ETNs/ETFs)

## Risk Thresholds

Stored in `config/risk-level.yaml`:
- Level 1-2: Automatic execution
- Level 3: Manual approval required  
- Level 4+: Explicit manual intervention required

## File-Based Storage

All persistent data stored in `memory/` directory:
- Proposals: `memory/proposals/`
- Pending approvals: `memory/approvals/pending/`
- Approved items: `memory/approvals/approved/`
- Execution outcomes: `memory/outcomes/`

Approved items are moved from pending to approved directory to trigger execution.

## Modification Guidelines

- Always maintain Zod schema validation when modifying types
- Update all affected agents when changing proposal schema
- Preserve approval workflow for risky trades
- Use FileStore wrapper for all persistence operations
- Respect the Agent interface contract for all agents
- Maintain compatibility with existing configuration files

## Integration Points

To connect to real broker APIs:
1. Modify TraderAgent to use broker SDK in `src/agents/trader/trader.agent.ts`
2. Ensure all trades still pass through approval system
3. Add necessary authentication and security measures

## Safety Constraints

- Never bypass the risk evaluation step
- Don't eliminate the approval workflow for high-risk items
- Maintain schema validation in all data transforms
- Keep human oversight for volatility-sensitive securities
- No hardcoded API keys or secrets (use env vars).