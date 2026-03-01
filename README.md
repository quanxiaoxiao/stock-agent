# Stock Trading Agent System

An autonomous agent system for stock trading with human oversight.

## Architecture

This system follows an agent-based architecture where each agent implements the core Agent interface:

- **Analyst Agent**: Analyzes market data and company fundamentals
- **Strategist Agent**: Determines position sizing and timing
- **Risk Agent**: Evaluates and controls risk levels
- **Trader Agent**: Executes approved trades
- **Reviewer Agent**: Post-trade analysis and learning

## Decision Process

1. Analyst creates trade recommendations
2. Strategist sets position size and entry points
3. Risk agent evaluates if approval needed
4. Trader executes approved trades

## Risk Levels

- Level 1-2: Automatic execution
- Level 3: Human approval required
- Level 4+: Manual intervention required