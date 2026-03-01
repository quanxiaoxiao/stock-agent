# AGENT CONTEXT

This repository implements a controlled autonomous trading system.

Rules:

- Agents NEVER execute trades directly.
- All trades must be TradeProposal objects.
- RiskGuard determines approval level.
- Supervisor orchestrates workflow.
- JSON schemas must be respected.
- No hardcoded API keys or secrets (use env vars).