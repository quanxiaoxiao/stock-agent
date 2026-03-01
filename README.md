# Stock Trading Agent System

An advanced autonomous agent system for stock trading with intelligent human oversight and risk management.

## Overview

This system implements an agent-based architecture for automated stock trading with multiple layers of control and risk management. Instead of traditional code-based approaches, the trading logic is handled by AI agents orchestrated with strong type contracts and robust approval processes.

### Key Features
- 🤖 **Multi-Agent Architecture**: Separate specialists for analysis, strategy, risk control, and execution
- 🛡️ **Tiered Risk Management**: Configurable approval systems based on risk scores
- 🔒 **Safety First**: Proposals for high-risk scenarios are queued for human approval  
- 💾 **File-based Persistence**: Zero-dependency storage using file system
- 🔧 **Highly Configurable**: YAML-based configuration for all system behaviors
- 🔍 **Fully Auditable**: All proposals, approvals and outcomes logged for review
- ✨ **Codex-Ready**: TypeScript design optimized for AI development tools
- ✅ **Closed-loop Approval**: Full approval-to-execution workflow

## Architecture

The system follows a distributed agent architecture where individual specialized agents collaborate to make trading decisions:

```
┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐
│   Analyst       │   │   Strategist     │   │   Risk Agent    │
│   Agent         │   │   Agent          │   │   (RiskGuard)   │
│                 │   │                  │   │                 │
│ • Market data   │   │ • Position size  │   │ • Evaluate risk │
│ • Technical     │─→ │ • Entry points   │─→ │ • Approval req. │─→ Queue for 
│ • Fundamentals  │   │ • Timeframes     │   │ • Risk score    │   approval (L>3)
└─────────────────┘   └──────────────────┘   └─────────────────┘
                                                         │
┌─────────────────┐                                      │
│   Trader        │◀─────────────────────────────────────┘
│   Agent         │
│                 │
│ • Execute trades│
│ • Record result │
│ • Update status │
└─────────────────┘
```

## Installation

Prerequisites:
- Node.js 20+ with npm
- Git

Clone and setup:
```bash
# Clone the repository
git clone <repository-url>
cd stock-agent

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

The system uses a variety of configuration files located in the `config/` directory:

### Risk Management (`config/risk-level.yaml`)
Controls which risk levels require approval:
```yaml
levels:
  auto: 2            # Risk levels 1-2: Trades execute automatically
  approval: 3        # Risk level 3: Trades go to approval queue  
  manual: 4          # Risk levels 4+: Require manual intervention
executionModes:
  # Modes: 'AUTO', 'APPROVAL', 'MANUAL_BLOCK'
  1: "AUTO"
  2: "AUTO" 
  3: "APPROVAL"
  4: "MANUAL_BLOCK"
  5: "MANUAL_BLOCK"
```

### Model Settings (`config/models.yaml`)  
Controls AI model behavior:
```yaml
defaultModel: gpt-4
temperature: 0.3  # Lower = more consistent, higher = more variation
maxTokens: 4000
timeout: 30000
```

## Usage

### Basic Trading
Execute standard trading flow for a stock symbol:

```bash
npm start AAPL
```

This runs the complete workflow: Analyst → Strategist → RiskAgent → Trader

### Checking Pending Approvals
View any high-risk trades waiting for human approval:

```bash
npm run check-approvals
```

### Approving Trades
Manually approve a trade in the queue:

```bash
npm run approve [proposal-id]

# Example:
npm run approve proposal_a1b2c3d4-e5f6-7890-1234-567890abcdef
```

This moves trades from `memory/approvals/pending/` to `memory/approvals/approved/` AND executes the trade automatically.

### Processing All Approved Trades
Process all trades in the approved queue:

```bash
npm run process-approved
```

This finds all trades in `memory/approvals/approved/` and executes them, marking them as processed.

### Development Commands

Watch files and rebuild automatically:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Type-check your code:
```bash
npm run lint
```

Build distribution files:
```bash
npm run build
```

Or run the compiled distribution directly:
```bash
node dist/cli/run.js AAPL
```

## Risk System

The system employs a 5-level risk scale (1-5) where:

- **Level 1-2**: Low to moderate risk, executed automatically  
- **Level 3**: Higher risk, requires human approval (goes to queue)
- **Level 4-5**: Very high risk, blocked from execution without manual intervention

Risk is calculated based on:
- **Trading Confidence**: Lower AI confidence increases risk score  
- **Position Size**: Large position sizes increase risk level
- **Symbol Volatility**: Highly volatile symbols (e.g., VXX, UVXY) automatically receive higher risk rating and are blocked from auto-execution
- **Complex Factors**: Market conditions and external factors

## Data Persistence

The system uses a file-based storage system (no databases required):

```
memory/
├── proposals/      # All generated trade proposals
│   └── [proposal-id].json
├── approvals/      # Approval queues        
│   ├── pending/    # Trades waiting approval  
│   ├── approved/   # Approved trades ready to execute
│   └── processed/  # Trades that have been executed from approved
└── outcomes/       # Execution records  
    └── [proposal-id].json
```

All persistent data is stored as JSON files for easy inspection, backup and integration.

## Agent Contracts

The system uses strongly-typed agent interfaces defined as:

```typescript
export interface Agent<I, O> {
  name: string;
  run(input: I): Promise<O>;
}
```

This contract enforces type safety and enables predictable agent interactions throughout the system.

## Supported Symbols

For enhanced safety, the following high-volatility symbols automatically receive high risk ratings (level 4+):
- VXX, UVXY, TVIX, XIV, SVXY (Volatility ETNs/ETFs)

These will be automatically placed in approval queue and can be handled via the approval workflow.

## Approval Workflow

The system has a complete approval-to-execution cycle:

1. Risky trades (Risk Level ≥ 3) go to `memory/approvals/pending/`
2. Use `npm run check-approvals` to identify these trades
3. Use `npm run approve [ID]` to move to `memory/approvals/approved/` AND execute
4. Optionally, run `npm run process-approved` to execute all approved items not already executed

For safety, the system checks if a trade has already been executed when running the approving processing workflow (idempotency).

## File-System Approval Workflow

```bash
# Check for pending approvals when risk > config threshold
npm run check-approvals 

# For each pending transaction you approve:
npm run approve [proposal-id]

# OR process all approved after manual review
npm run process-approved
```

## Development

Building the project:
```bash
npm run build
```

This compiles all TypeScript to JavaScript in the `dist/` directory with correct NodeNext/ESM compatibility.

### Adding New Functionality

1. **New Agent Implementation**: Add to appropriate agent module  
2. **Update Supervisor**: Pass new agent to workflow in `src/core/supervisor.ts`  
3. **Update Domain Types**: Extend schemas in `src/domain/` if necessary
4. **Tests**: Add appropriate test cases in `tests/` directory
5. **Documentation**: Update this readme as applicable

## Design Philosophy

This system was designed with the following principles in mind:

**Agent-First**: Each component behaves as a specialized agent with specific responsibilities  
**Strong Typing**: TypeScript schemas enforce data integrity at compile time  
**Runtime Validation**: All data objects are validated via Zod schema at runtime  
**Safe by Default**: Conservative risk settings prevent harmful trades by default  
**Human Oversight**: Critical trade-offs require human validation  
**Complete Workflow**: Closed loop from approval to execution  
**Extensible Architecture**: Easy to add new agents and modify behavior

## Integration Points

To connect to real brokers:
1. Modify the `TraderAgent` to connect to your broker's API via their SDK
2. Update the trade execution logic in `src/agents/trader/trader.agent.ts`
3. Implement required broker-specific authentication and compliance procedures
4. Adjust risk levels accordingly to match broker requirements

## Troubleshooting

**Q: Why no trades appear in outcomes after execution?**  
A: Check if your trade risk level > 3 - higher risk trades need manual approval and won't execute automatically.

**Q: How to debug the approval workflow?**  
A: Examine files in `memory/approvals/pending/` for unprocessed trades, move them manually if needed.

**Q: Need to change risk thresholds?**  
A: Update `config/risk-level.yaml` accordingly.

**Q: Getting module resolution errors?**  
A: Ensure you're using NodeNext module resolution settings as configured in tsconfig.json.

## Contributing

This project welcomes contributions aligned with the agent-based trading architecture principle. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

---
*Built with TypeScript, Zod, and architectural principles for AI-first code*