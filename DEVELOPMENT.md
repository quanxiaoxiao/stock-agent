# Development Guide

## Project Structure

```
stock-agent/
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .gitignore              # Git ignore rules
├── README.md               # Public documentation
├── DEVELOPMENT.md          # Developer guide (this file)
├── AGENT_CONTEXT.md        # Rules for AI development assistants
├── config/                 # Configuration files
│   ├── investor-profile.yaml # Investment preferences (placeholder)
│   ├── risk-level.yaml     # Risk approval thresholds
│   └── models.yaml         # AI model configurations
├── src/
│   ├── core/               # System-wide abstractions
│   │   ├── agent.ts        # Base Agent interface
│   │   ├── supervisor.ts   # Multi-agent workflow controller
│   │   ├── workflow.ts     # Workflow definitions (future)
│   │   └── types.ts        # Shared core types
│   ├── agents/             # Individual AI agents
│   │   ├── analyst/        # Market analysis agents  
│   │   │   └── analyst.agent.ts
│   │   ├── strategist/     # Strategy/positioning agents
│   │   │   └── strategist.agent.ts
│   │   ├── riskGuard/      # Risk management agents
│   │   │   └── risk.agent.ts
│   │   ├── trader/         # Execution agents
│   │   │   └── trader.agent.ts
│   │   └── reviewer/       # Post-trade analysis (future)
│   │       └── reviewer.agent.ts
│   ├── domain/             # Business/finance domain types
│   │   ├── proposal.ts     # Trade proposal schema
│   │   ├── risk.ts         # Risk evaluation types (future)
│   │   └── portfolio.ts    # Portfolio allocation types (future)
│   ├── prompts/            # AI prompt templates (future)
│   │   ├── analyst.prompt.ts
│   │   ├── strategist.prompt.ts
│   │   ├── risk.prompt.ts
│   │   └── approval.prompt.ts
│   ├── tools/              # Utility tools
│   │   ├── market.tool.ts  # Market data access
│   │   ├── broker.tool.ts  # Brokerage connection (future)
│   │   └── notify.tool.ts  # Communication tools
│   ├── storage/            # Data persistence layer
│   │   ├── fileStore.ts    # File-based persistence
│   │   └── approvalStore.ts# Approval-specific storage
│   ├── workflows/          # Multi-agent processes
│   │   └── decision.workflow.ts # Main decision flow
│   └── cli/                # Command-line interfaces
│       ├── run.ts          # Main execution entrypoint
│       ├── check-approvals.ts # Check pending approvals
│       └── approve.ts      # Approve pending trades
├── memory/                 # File-based storage (runtime data)
│   ├── proposals/          # Serialized trade proposals
│   ├── approvals/          # Approval state (pending/approved)
│   │   ├── pending/        # Awaiting human approval
│   │   └── approved/       # Human-approved items
│   └── outcomes/           # Execution results
└── tests/                  # Unit and integration tests
    ├── unit/
    ├── integration/
    └── fixtures/
```

## Architecture Concepts

### Agent Interface
All agents implement the universal interface:
```typescript
export interface Agent<I, O> {
  name: string;
  run(input: I): Promise<O>;
}
```

This allows for pluggable agents where the supervisor can swap out agent implementations without affecting the workflow logic.

### Type Safety
- Zod schemas define the shape and validation of data contracts  
- TypeScript generics enforce type safety across agent boundaries
- Runtime validation provides safety against unexpected data from any source

### Risk-First Approach
- Trade proposals must always be validated by the risk system before execution
- Risk levels are configurable but default to conservative levels
- High-volatility instruments are flagged automatically without needing rule modification

## Development Workflow

### Adding a New Agent
1. Create a new agent class in `src/agents/[group]/[name].agent.ts` implementing the Agent interface
2. Define the input/output types using Zod if creating new types
3. Register and inject the new agent in the appropriate workflow
4. Update the supervisor to coordinate with the new agent

### Adding a New Configuration Option
1. Add to appropriate YAML file in `config/`  
2. Use for appropriate agent behavior modification through runtime reads
3. Document effect and valid value ranges

### Modifying Trade Flows
1. Work within the `src/workflows/` modules to modify agent orchestration  
2. Maintain backward compatibility where practical
3. Preserve the approval workflow for risky scenarios

### Adding Data Models  
1. Define new schema in `src/domain/` using Zod (preferred) or TypeScript interfaces
2. Export from the domain module for consistent access
3. Apply consistent validation throughout the system

## Building and Testing

### Build process
```bash
# Compile TypeScript sources  
npm run build

# Watch for changes and rebuild automatically
npm run dev

# Just type checking
npm run lint
```

### Dependency Management
- Use npm for all dependencies
- Prefer ESM compatible packages (check package.json "type" field)
- Update tsconfig.json paths if adding aliases
- Verify type definition availability (Deno support for missing types)

### Local Development Setup
1. Install Node.js 20+ globally (preferably using nvm)
2. Clone repository
3. Run `npm install` followed by `npm run build`
4. Verify all build steps pass

## Testing Guidelines

### Test Organization
- Unit tests: Isolated functionality  
- Integration tests: Multi-component collaboration  
- End-to-end: Full system flows  

### Test File Placement
Locate tests adjacent to the module being tested with a `/tests/` directory parallel to the implementation:
- `src/agents/analyst/analyst.agent.ts`
- `src/agents/analyst/tests/analyst.agent.tests.ts`

### Testing Philosophy
- Test the agent contracts rather than internal implementations
- Validate data transformations through agents  
- Mock external dependencies (broker API, market feed)
- Verify approval flows handle risk categories correctly

## Code Quality Standards

### Naming Conventions
- File names: kebab-case ending with `.ts` (or `.test.ts` for tests)
- Type names: PascalCase
- Variable names: camelCase  
- Constants: UPPER_SNAKE_CASE

### Documentation Standards
- JSDoc for exports  
- Clear commit messages following conventional commits
- Update this guide when changing architecture

### Error Handling
- Errors from agent execution should be caught and logged appropriately
- Fail safely by deferring to human approval when uncertain
- Avoid catching errors inappropriately and continuing

## Performance Considerations

### Agent Execution
- Agents may have variable execution time as they could interact with LLM APIs
- Include timeouts for long-running operations to avoid stalls
- Batch operations when possible for efficiency

### File I/O Operations
- Use the FileStore wrapper consistently to handle file-based persistence
- Optimize for reads/writes to the same location when possible
- Consider impact of large numbers of files in storage directories

## Security Practices

### Input Validation
- All external input validated through Zod schemas
- No direct injection from external systems to file store
- Sanitize any symbols received from user input

### API Keys/Sensitive Information
- Store API keys in environment variables, not source code
- Use .env files with .gitignore for local development
- Never log sensitive information

## Contribution Process

1. **Fork** the repository
2. **Branch** from the latest main with a descriptive name  
3. **Develop** using TDD and following project patterns
4. **Test** changes with both unit and integration tests
5. **Document** changes that require new explanations  
6. **Submit** PR aligned with conventional commit standards

### Pull Request Requirements
- Clear description of changes made
- Relevant tests included or updated
- Pass all CI build/check steps  
- Updated documentation as needed
- Reference any related issues

## Debugging Strategies

### Using Approval Queue
The approval queue mechanism allows for visibility into the system's decision process:
- Check `memory/approvals/pending/` for high-risk decisions
- Manually approve or analyze decisions before automated execution  
- Add logging to track the progression of each proposal through agents

### Runtime Behavior
- Enable verbose logging to understand how proposals evolve between agents
- Use the `npm run check-approvals` script to validate decision tracking  
- Inspect generated JSON files in memory directories

## Future Extensions

Possible directions for system enhancement:
- Real-time market data feeds via WebSocket connections
- Multiple execution brokers connected in parallel
- Post-trade analysis and agent learning feedback loops
- Strategy backtesting harness against historical data
- Advanced dashboard for managing and reviewing agent decisions

---
Maintain this guide as the codebase evolves to keep it current with architecture changes.