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
  auto: 2      # Trades up to level 2 execute automatically
  approval: 3  # Trades at level 3+ go to approval queue  
  manual: 4    # Trades at level 4+ require manual intervention
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

This moves trades from `memory/approvals/pending/` to `memory/approvals/approved/` allowing them to proceed.

### Development Commands

Watch files and rebuild automatically:
```bash
npm run dev
```

Type-check your code:
```bash
npm run lint
```

## Risk System

The system employs a 5-level risk scale (1-5) where:

- **Level 1-2**: Low to moderate risk, executed directly  
- **Level 3**: Higher risk, requires human approval  
- **Level 4+**: Very high risk, explicit manual approval needed  

Risk is calculated based on:
- **Trading Confidence**: Lower AI confidence increases risk score  
- **Position Size**: Large position sizes increase risk level
- **Symbol Volatility**: Highly volatile symbols (e.g., VXX, UVXY) automatically receive higher risk
- **Complex Factors**: Market conditions and external factors

## Data Persistence

The system uses a file-based storage system (no databases required):

```
memory/
├── proposals/      # All generated trade proposals
│   └── [proposal-id].json
├── approvals/      # Approval queues        
│   ├── pending/    # Trades waiting approval  
│   └── approved/   # Approved trades
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

For demonstration purposes, the following high-volatility symbols automatically trigger approval requirements:
- VXX, UVXY, TVIX, XIV, SVXY (Volatility ETNs/ETFs)

## Extending Agents

Each agent type exists in its own module under `src/agents/`:
- `analyst/` - Market analysis and data gathering  
- `strategist/` - Position sizing and timing
- `riskGuard/` - Risk assessment and approval triggers
- `trader/` - Trade execution and logging

To extend behavior, create a new agent class implementing the `Agent<InputType, OutputType>` interface.

## File-System Approval Workflow

```bash
# Check for pending approvals when risk > config threshold
npm run check-approvals 

# For each pending transaction you approve:
npm run approve [proposal-id]

# Execution automatically continues after approval
```

## Development

Building the project:
```bash
npm run build
```

This compiles all TypeScript to JavaScript in the `dist/` directory.

### Adding New Functionality

1. **New Agent Implementation**: Add to appropriate agent module  
2. **Update Supervisor**: Pass new agent to workflow in `src/core/supervisor.ts`  
3. **Update Domain Types**: Extend schemas in `src/domain/` if necessary
4. **Tests**: Add appropriate test cases (future integration)
5. **Documentation**: Update this readme as applicable

## Design Philosophy

This system was designed with the following principles in mind:

**Agent-First**: Each component behaves as a specialized agent with specific responsibilities  
**Strong Typing**: TypeScript schemas enforce data integrity at compile time  
**Safe by Default**: Conservative risk settings prevent harmful trades by default  
**Human Oversight**: Critical trade-offs require human validation  
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

## Contributing

This project welcomes contributions aligned with the agent-based trading architecture principle. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

---
*Built with TypeScript, Zod, and architectural principles for AI-first code*