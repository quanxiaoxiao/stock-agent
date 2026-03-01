# Development Guide

## Project Structure

```
stock-agent/
├── config/                 # Configuration files
├── src/
│   ├── core/              # Core abstractions
│   ├── agents/            # Individual AI agents
│   ├── domain/            # Domain schemas and types
│   ├── storage/           # Data persistence
│   ├── workflows/         # Orchestration logic
│   └── cli/               # Entry points
├── memory/                # Persistent data (file-based)
│   ├── proposals/         # Generated proposals
│   ├── approvals/         # Pending/approved trades
│   └── outcomes/          # Executed trades
```

## Running the System

```bash
# Analyze a stock
npm start AAPL
```

## How it Works

1. `Analyst Agent` analyzes market data for the given symbol
2. `Strategist Agent` creates a trade proposal with sizing and thesis  
3. `Risk Agent` evaluates risk level and determines if approval needed
4. If risk is below threshold, `Trader Agent` executes immediately
5. If risk exceeds threshold, proposal saved to `memory/approvals/pending/`

## Configuration

- Risk thresholds: `config/risk-level.yaml`
- Model settings: `config/models.yaml`
- Agent rules: `AGENT_CONTEXT.md`

## File-based Persistence

The system stores data in the `memory/` directory:
- Proposals: `memory/proposals/`
- Approvals: `memory/approvals/pending/` (requires manual moving to approved/)
- Outcomes: `memory/outcomes/`

## Testing Approval Workflow

For approval workflow, adjust risk config or mock a high-risk scenario in the RiskAgent to set requiresApproval = true.