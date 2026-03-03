import { v4 as uuidv4 } from 'uuid';
import {
  EpisodicMemory,
  SemanticMemory,
  ProceduralMemory,
  Memory,
  MemoryQuery,
  MemoryRetrievalResult,
  MemoryTag,
  MemoryEmotion,
  EpisodicMemorySchema,
  SemanticMemorySchema,
  ProceduralMemorySchema,
  ReflectionInsight,
  ReflectionInsightSchema,
} from '../domain/memory.js';
import { TradeProposal } from '../domain/proposal.js';
import { UserIntent } from '../domain/intent.js';
import { MarketDataPackage } from '../domain/marketData.js';
import { FileStore } from '../storage/fileStore.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export class EpisodicMemoryStore {
  private basePath: string;
  private fileStore: FileStore;
  
  private episodicIndex: Map<string, EpisodicMemory> = new Map();
  private semanticIndex: Map<string, SemanticMemory> = new Map();
  private proceduralIndex: Map<string, ProceduralMemory> = new Map();
  private symbolIndex: Map<string, Set<string>> = new Map();
  private tagIndex: Map<MemoryTag, Set<string>> = new Map();

  constructor(basePath: string = './memory') {
    this.basePath = basePath;
    this.fileStore = new FileStore(basePath);
    this.ensureDirectories();
    this.loadIndexes();
  }

  private ensureDirectories(): void {
    const dirs = [
      'memory/episodic',
      'memory/semantic',
      'memory/procedural',
      'memory/reflections',
    ];
    dirs.forEach(dir => {
      const dirPath = join(this.basePath, dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  private loadIndexes(): void {
    this.loadMemoryType('episodic', EpisodicMemorySchema, this.episodicIndex);
    this.loadMemoryType('semantic', SemanticMemorySchema, this.semanticIndex);
    this.loadMemoryType('procedural', ProceduralMemorySchema, this.proceduralIndex);
    this.rebuildSecondaryIndexes();
  }

  private loadMemoryType<T extends Memory>(
    subdir: string,
    schema: any,
    index: Map<string, T>
  ): void {
    const dirPath = join(this.basePath, 'memory', subdir);
    if (!existsSync(dirPath)) return;

    const files = readdirSync(dirPath).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      try {
        const content = readFileSync(join(dirPath, file), 'utf8');
        const parsed = JSON.parse(content);
        const validated = schema.parse(parsed);
        index.set(validated.id, validated);
      } catch (error) {
        console.error(`Failed to load memory ${file}:`, error);
      }
    });
  }

  private rebuildSecondaryIndexes(): void {
    this.symbolIndex.clear();
    this.tagIndex.clear();

    this.episodicIndex.forEach(memory => {
      const symbol = memory.proposal?.symbol;
      if (symbol) {
        if (!this.symbolIndex.has(symbol)) {
          this.symbolIndex.set(symbol, new Set());
        }
        this.symbolIndex.get(symbol)!.add(memory.id);
      }

      memory.tags.forEach(tag => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(memory.id);
      });
    });

    this.semanticIndex.forEach(memory => {
      memory.relatedSymbols?.forEach(symbol => {
        if (!this.symbolIndex.has(symbol)) {
          this.symbolIndex.set(symbol, new Set());
        }
        this.symbolIndex.get(symbol)!.add(memory.id);
      });

      memory.relatedTags?.forEach(tag => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(memory.id);
      });
    });
  }

  private saveMemory(memory: Memory): void {
    let subdir: string;
    let schema: any;

    switch (memory.type) {
      case 'EPISODIC':
        subdir = 'episodic';
        schema = EpisodicMemorySchema;
        break;
      case 'SEMANTIC':
        subdir = 'semantic';
        schema = SemanticMemorySchema;
        break;
      case 'PROCEDURAL':
        subdir = 'procedural';
        schema = ProceduralMemorySchema;
        break;
    }

    const validated = schema.parse(memory);
    const filePath = join(this.basePath, 'memory', subdir, `${validated.id}.json`);
    writeFileSync(filePath, JSON.stringify(validated, null, 2));

    if (memory.type === 'EPISODIC') {
      this.episodicIndex.set(memory.id, memory);
    } else if (memory.type === 'SEMANTIC') {
      this.semanticIndex.set(memory.id, memory);
    } else if (memory.type === 'PROCEDURAL') {
      this.proceduralIndex.set(memory.id, memory);
    }

    this.rebuildSecondaryIndexes();
  }

  recordTrade(
    proposal: TradeProposal,
    outcome: EpisodicMemory['outcome'],
    marketContext?: MarketDataPackage,
    userIntent?: UserIntent
  ): EpisodicMemory {
    const tags: MemoryTag[] = [];
    
    if (proposal.confidence > 0.8) tags.push('HIGH_CONFIDENCE');
    else if (proposal.confidence < 0.5) tags.push('LOW_CONFIDENCE');
    
    if (proposal.riskLevel >= 4) tags.push('HIGH_RISK');
    else if (proposal.riskLevel <= 2) tags.push('LOW_RISK');

    if (outcome.result === 'WIN') tags.push('WIN');
    else if (outcome.result === 'LOSS') tags.push('LOSS');
    else if (outcome.result === 'BREAK_EVEN') tags.push('BREAK_EVEN');

    let emotion: MemoryEmotion = 'NEUTRAL';
    if (outcome.result === 'WIN' && proposal.confidence > 0.7) emotion = 'SATISFIED';
    else if (outcome.result === 'LOSS' && proposal.confidence > 0.7) emotion = 'REGRET';
    else if (proposal.riskLevel >= 4) emotion = 'CAUTIOUS';

    const memory: EpisodicMemory = {
      id: uuidv4(),
      type: 'EPISODIC',
      timestamp: Date.now(),
      proposal,
      outcome,
      marketContext,
      userIntent,
      tags,
      emotion,
    };

    this.saveMemory(memory);
    return memory;
  }

  addSemanticMemory(
    memory: Omit<SemanticMemory, 'id' | 'type' | 'timestamp'>
  ): SemanticMemory {
    const semanticMemory: SemanticMemory = {
      id: uuidv4(),
      type: 'SEMANTIC',
      timestamp: Date.now(),
      ...memory,
    };

    this.saveMemory(semanticMemory);
    return semanticMemory;
  }

  addProceduralMemory(
    memory: Omit<ProceduralMemory, 'id' | 'type' | 'timestamp'>
  ): ProceduralMemory {
    const proceduralMemory: ProceduralMemory = {
      id: uuidv4(),
      type: 'PROCEDURAL',
      timestamp: Date.now(),
      ...memory,
    };

    this.saveMemory(proceduralMemory);
    return proceduralMemory;
  }

  retrieve(query: MemoryQuery): MemoryRetrievalResult {
    let candidates: Memory[] = [];

    if (!query.types || query.types.includes('EPISODIC')) {
      candidates.push(...Array.from(this.episodicIndex.values()));
    }
    if (!query.types || query.types.includes('SEMANTIC')) {
      candidates.push(...Array.from(this.semanticIndex.values()));
    }
    if (!query.types || query.types.includes('PROCEDURAL')) {
      candidates.push(...Array.from(this.proceduralIndex.values()));
    }

    if (query.symbols && query.symbols.length > 0) {
      const matchingIds = new Set<string>();
      query.symbols.forEach(symbol => {
        const ids = this.symbolIndex.get(symbol);
        if (ids) ids.forEach(id => matchingIds.add(id));
      });
      candidates = candidates.filter(m => matchingIds.has(m.id));
    }

    if (query.tags && query.tags.length > 0) {
      const matchingIds = new Set<string>();
      query.tags.forEach(tag => {
        const ids = this.tagIndex.get(tag);
        if (ids) ids.forEach(id => matchingIds.add(id));
      });
      candidates = candidates.filter(m => matchingIds.has(m.id));
    }

    if (query.dateRange) {
      candidates = candidates.filter(
        m => m.timestamp >= query.dateRange!.start && m.timestamp <= query.dateRange!.end
      );
    }

    if (query.minConfidence !== undefined) {
      candidates = candidates.filter(m => {
        if (m.type === 'SEMANTIC') {
          return m.confidence >= query.minConfidence!;
        }
        return true;
      });
    }

    candidates.sort((a, b) => b.timestamp - a.timestamp);

    if (query.limit) {
      candidates = candidates.slice(0, query.limit);
    }

    const relevanceScores = new Map<string, number>();
    candidates.forEach((m, i) => {
      relevanceScores.set(m.id, 1 - (i / candidates.length));
    });

    return {
      memories: candidates,
      relevanceScores,
      query,
    };
  }

  getEpisodicMemory(id: string): EpisodicMemory | undefined {
    return this.episodicIndex.get(id);
  }

  getSemanticMemory(id: string): SemanticMemory | undefined {
    return this.semanticIndex.get(id);
  }

  getProceduralMemory(id: string): ProceduralMemory | undefined {
    return this.proceduralIndex.get(id);
  }

  updateEpisodicMemory(
    id: string,
    updates: Partial<Omit<EpisodicMemory, 'id' | 'type' | 'timestamp'>>
  ): EpisodicMemory | undefined {
    const memory = this.episodicIndex.get(id);
    if (!memory) return undefined;

    const updated = { ...memory, ...updates };
    const validated = EpisodicMemorySchema.parse(updated);
    this.saveMemory(validated);
    return validated;
  }

  saveReflectionInsight(insight: Omit<ReflectionInsight, 'id'>): ReflectionInsight {
    const fullInsight: ReflectionInsight = {
      id: uuidv4(),
      ...insight,
    };

    const validated = ReflectionInsightSchema.parse(fullInsight);
    const filePath = join(this.basePath, 'memory', 'reflections', `${validated.id}.json`);
    writeFileSync(filePath, JSON.stringify(validated, null, 2));

    return validated;
  }

  getAllEpisodic(): EpisodicMemory[] {
    return Array.from(this.episodicIndex.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  getAllSemantic(): SemanticMemory[] {
    return Array.from(this.semanticIndex.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  getAllProcedural(): ProceduralMemory[] {
    return Array.from(this.proceduralIndex.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  getStats(): {
    episodicCount: number;
    semanticCount: number;
    proceduralCount: number;
    symbolCount: number;
    tagCount: number;
  } {
    return {
      episodicCount: this.episodicIndex.size,
      semanticCount: this.semanticIndex.size,
      proceduralCount: this.proceduralIndex.size,
      symbolCount: this.symbolIndex.size,
      tagCount: this.tagIndex.size,
    };
  }
}
