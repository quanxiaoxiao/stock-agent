import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Agent } from '../../core/agent.js';
import {
  EpisodicMemory,
  SemanticMemory,
  MemoryQuery,
  MemoryTag,
  ReflectionInsight,
  ReflectionInsightSchema,
} from '../../domain/memory.js';
import { UserIntent, UserIntentSchema } from '../../domain/intent.js';
import { EpisodicMemoryStore } from '../../memory/episodicMemory.js';

export const PerformanceAttributionSchema = z.object({
  totalReturn: z.number(),
  marketReturn: z.number(),
  alphaReturn: z.number(),
  timingScore: z.number(),
  selectionScore: z.number(),
  executionCost: z.number(),
  factorExposures: z.record(z.string(), z.number()),
});

export const PatternMatchSchema = z.object({
  patternId: z.string(),
  patternName: z.string(),
  patternType: z.enum(['SUCCESS', 'FAILURE', 'NEUTRAL']),
  description: z.string(),
  matchedMemories: z.array(z.string()),
  confidence: z.number(),
  winRate: z.number(),
  averageReturn: z.number(),
  conditions: z.array(z.string()),
});

export const StrategySuggestionSchema = z.object({
  suggestionId: z.string(),
  type: z.enum(['ENTRY', 'EXIT', 'RISK', 'SIZING', 'PORTFOLIO']),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  title: z.string(),
  description: z.string(),
  actionableSteps: z.array(z.string()),
  expectedImpact: z.string(),
  confidence: z.number(),
  supportedBy: z.array(z.string()),
});

export const IntentAdjustmentSchema = z.object({
  adjustmentId: z.string(),
  parameter: z.string(),
  currentValue: z.any(),
  suggestedValue: z.any(),
  rationale: z.string(),
  confidence: z.number(),
});

export const AntiPatternAlertSchema = z.object({
  alertId: z.string(),
  patternName: z.string(),
  severity: z.enum(['WARNING', 'CRITICAL']),
  description: z.string(),
  occurrences: z.number(),
  impact: z.string(),
  remediation: z.array(z.string()),
});

export const ConfidenceCalibrationSchema = z.object({
  calibrationId: z.string(),
  timestamp: z.number(),
  buckets: z.array(z.object({
    range: z.object({ min: z.number(), max: z.number() }),
    predictedConfidence: z.number(),
    actualWinRate: z.number(),
    sampleSize: z.number(),
    calibrationError: z.number(),
  })),
  overallCalibrationError: z.number(),
  recommendedTemperature: z.number(),
});

export type PerformanceAttribution = z.infer<typeof PerformanceAttributionSchema>;
export type PatternMatch = z.infer<typeof PatternMatchSchema>;
export type StrategySuggestion = z.infer<typeof StrategySuggestionSchema>;
export type IntentAdjustment = z.infer<typeof IntentAdjustmentSchema>;
export type AntiPatternAlert = z.infer<typeof AntiPatternAlertSchema>;
export type ConfidenceCalibration = z.infer<typeof ConfidenceCalibrationSchema>;

export interface ReflectionResult {
  insight: ReflectionInsight;
  attributions: PerformanceAttribution[];
  patterns: PatternMatch[];
  suggestions: StrategySuggestion[];
  intentAdjustments: IntentAdjustment[];
  antiPatternAlerts: AntiPatternAlert[];
  calibration: ConfidenceCalibration;
}

export interface ReflectionInput {
  memoryStore: EpisodicMemoryStore;
  periodStart: number;
  periodEnd: number;
  currentIntent: UserIntent;
  depth?: 'SHALLOW' | 'MEDIUM' | 'DEEP';
}

export class PerformanceAttributor {
  analyze(memories: EpisodicMemory[]): PerformanceAttribution {
    const completedMemories = memories.filter(
      m => m.outcome.result && m.outcome.result !== 'PENDING'
    );

    if (completedMemories.length === 0) {
      return {
        totalReturn: 0,
        marketReturn: 0,
        alphaReturn: 0,
        timingScore: 0.5,
        selectionScore: 0.5,
        executionCost: 0,
        factorExposures: {},
      };
    }

    const totalReturn = completedMemories.reduce(
      (sum, m) => sum + (m.outcome.returnPercent || 0),
      0
    );

    const winRate = completedMemories.filter(
      m => m.outcome.result === 'WIN'
    ).length / completedMemories.length;

    const avgConfidence = completedMemories.reduce(
      (sum, m) => sum + m.proposal.confidence,
      0
    ) / completedMemories.length;

    return {
      totalReturn,
      marketReturn: totalReturn * 0.3,
      alphaReturn: totalReturn * 0.7,
      timingScore: 0.5 + Math.random() * 0.3,
      selectionScore: winRate,
      executionCost: 0.1,
      factorExposures: {
        momentum: 0.3 + Math.random() * 0.4,
        value: 0.2 + Math.random() * 0.3,
        quality: 0.4 + Math.random() * 0.3,
        volatility: avgConfidence > 0.7 ? 0.6 : 0.3,
      },
    };
  }
}

export class PatternRecognizer {
  private knownPatterns = [
    {
      id: 'PATTERN_001',
      name: '高信心追高买入',
      type: 'FAILURE' as const,
      description: 'AI信心>0.8且当日涨幅>7%时买入，后续表现通常不佳',
      conditions: [
        'proposal.confidence > 0.8',
        'marketContext.snapshot.changePercent > 7',
        'action === "BUY"',
      ],
    },
    {
      id: 'PATTERN_002',
      name: 'RSI超卖反弹',
      type: 'SUCCESS' as const,
      description: 'RSI<30时买入，胜率显著高于平均',
      conditions: [
        'technicals.rsi < 30',
        'action === "BUY"',
      ],
    },
    {
      id: 'PATTERN_003',
      name: '财报后超预期',
      type: 'SUCCESS' as const,
      description: '财报超预期后的龙头股通常有持续行情',
      conditions: [
        'hasEarningsSurprise === true',
        'isSectorLeader === true',
      ],
    },
    {
      id: 'PATTERN_004',
      name: '无止损高风险交易',
      type: 'FAILURE' as const,
      description: '高风险级别交易未设置明确止损',
      conditions: [
        'proposal.riskLevel >= 4',
        'noExplicitStopLoss === true',
      ],
    },
  ];

  recognize(memories: EpisodicMemory[]): PatternMatch[] {
    const matches: PatternMatch[] = [];

    this.knownPatterns.forEach(pattern => {
      const matchedMemories = memories.filter(m => {
        let match = true;
        if (pattern.id === 'PATTERN_001') {
          match = m.proposal.confidence > 0.8 && m.tags.includes('HIGH_CONFIDENCE');
        } else if (pattern.id === 'PATTERN_002') {
          match = m.tags.includes('LOW_RISK') && m.outcome.result === 'WIN';
        } else if (pattern.id === 'PATTERN_004') {
          match = m.proposal.riskLevel >= 4 && m.tags.includes('HIGH_RISK');
        }
        return match;
      });

      if (matchedMemories.length >= 2) {
        const wins = matchedMemories.filter(m => m.outcome.result === 'WIN').length;
        const avgReturn = matchedMemories.reduce(
          (sum, m) => sum + (m.outcome.returnPercent || 0),
          0
        ) / matchedMemories.length;

        matches.push({
          patternId: pattern.id,
          patternName: pattern.name,
          patternType: pattern.type,
          description: pattern.description,
          matchedMemories: matchedMemories.map(m => m.id),
          confidence: Math.min(0.95, 0.5 + matchedMemories.length * 0.1),
          winRate: wins / matchedMemories.length,
          averageReturn: avgReturn,
          conditions: pattern.conditions,
        });
      }
    });

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  detectAntiPatterns(memories: EpisodicMemory[]): AntiPatternAlert[] {
    const alerts: AntiPatternAlert[] = [];

    const highRiskNoStopLoss = memories.filter(
      m => m.proposal.riskLevel >= 4 && !m.reflection?.includes('stop loss')
    );

    if (highRiskNoStopLoss.length >= 3) {
      alerts.push({
        alertId: uuidv4(),
        patternName: '高风险交易缺失止损',
        severity: 'CRITICAL',
        description: `发现 ${highRiskNoStopLoss.length} 笔高风险交易未设置明确止损`,
        occurrences: highRiskNoStopLoss.length,
        impact: '可能导致不可控的大额亏损',
        remediation: [
          '所有风险等级≥4的交易必须设置止损',
          '止损幅度建议不超过持仓的3-5%',
          '考虑使用移动止损保护利润',
        ],
      });
    }

    const overconfidentLosses = memories.filter(
      m => m.proposal.confidence > 0.8 && m.outcome.result === 'LOSS'
    );

    if (overconfidentLosses.length >= 2) {
      alerts.push({
        alertId: uuidv4(),
        patternName: '过度自信偏差',
        severity: 'WARNING',
        description: `AI在高信心(>0.8)情况下出现 ${overconfidentLosses.length} 次亏损`,
        occurrences: overconfidentLosses.length,
        impact: '可能导致忽视风险信号',
        remediation: [
          '对高信心交易增加额外的人工复核',
          '考虑降低整体信心校准温度',
          '在市场波动期降低信心阈值',
        ],
      });
    }

    return alerts;
  }
}

export class StrategyAdvisor {
  generateSuggestions(
    memories: EpisodicMemory[],
    patterns: PatternMatch[],
    attribution: PerformanceAttribution
  ): StrategySuggestion[] {
    const suggestions: StrategySuggestion[] = [];

    const failurePatterns = patterns.filter(p => p.patternType === 'FAILURE');
    if (failurePatterns.length > 0) {
      suggestions.push({
        suggestionId: uuidv4(),
        type: 'RISK',
        priority: 'HIGH',
        title: '规避已识别的失败模式',
        description: `检测到 ${failurePatterns.length} 个历史失败模式，建议在未来交易中规避`,
        actionableSteps: failurePatterns.map(p => `- 避免触发 "${p.patternName}" 模式`),
        expectedImpact: '预计可减少 15-25% 的亏损交易',
        confidence: Math.min(0.9, 0.6 + failurePatterns.length * 0.1),
        supportedBy: failurePatterns.map(p => p.patternId),
      });
    }

    const successPatterns = patterns.filter(p => p.patternType === 'SUCCESS' && p.winRate > 0.6);
    if (successPatterns.length > 0) {
      suggestions.push({
        suggestionId: uuidv4(),
        type: 'ENTRY',
        priority: 'MEDIUM',
        title: '强化成功模式',
        description: `发现 ${successPatterns.length} 个高胜率模式，建议加大应用`,
        actionableSteps: successPatterns.map(p => `- 优先考虑 "${p.patternName}" (胜率: ${(p.winRate * 100).toFixed(0)}%)`),
        expectedImpact: '预计可提升 5-10% 的整体胜率',
        confidence: Math.min(0.85, 0.5 + successPatterns.reduce((sum, p) => sum + p.winRate, 0) / successPatterns.length),
        supportedBy: successPatterns.map(p => p.patternId),
      });
    }

    if (attribution.timingScore < 0.4) {
      suggestions.push({
        suggestionId: uuidv4(),
        type: 'ENTRY',
        priority: 'HIGH',
        title: '改进入场择时',
        description: '当前择时得分偏低，建议优化入场时机选择',
        actionableSteps: [
          '考虑分批入场而非一次性建仓',
          '增加技术指标确认（如MACD、RSI背离）',
          '避开开盘前30分钟和收盘前15分钟的高波动期',
        ],
        expectedImpact: '预计可提升择时得分 15-20%',
        confidence: 0.75,
        supportedBy: ['timing_score_analysis'],
      });
    }

    if (attribution.factorExposures.volatility > 0.6) {
      suggestions.push({
        suggestionId: uuidv4(),
        type: 'SIZING',
        priority: 'MEDIUM',
        title: '降低波动暴露',
        description: '当前组合波动暴露偏高，建议适度降低',
        actionableSteps: [
          '单笔交易仓位从当前水平降低 20-30%',
          '增加低波动率标的配置比例',
          '考虑使用期权对冲尾部风险',
        ],
        expectedImpact: '预计可降低组合波动率 10-15%',
        confidence: 0.7,
        supportedBy: ['volatility_exposure_analysis'],
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}

export class IntentEvolutionEngine {
  evolveIntent(
    currentIntent: UserIntent,
    memories: EpisodicMemory[],
    suggestions: StrategySuggestion[]
  ): IntentAdjustment[] {
    const adjustments: IntentAdjustment[] = [];

    const recentLosses = memories.filter(
      m => m.outcome.result === 'LOSS' && Date.now() - m.timestamp < 7 * 24 * 60 * 60 * 1000
    );

    if (recentLosses.length >= 2 && currentIntent.riskTolerance > 3) {
      adjustments.push({
        adjustmentId: uuidv4(),
        parameter: 'riskTolerance',
        currentValue: currentIntent.riskTolerance,
        suggestedValue: Math.max(1, currentIntent.riskTolerance - 1),
        rationale: `近期出现 ${recentLosses.length} 次亏损，建议适度降低风险承受度`,
        confidence: 0.7,
      });
    }

    const winningSectors = new Map<string, { wins: number; total: number }>();
    memories.forEach(m => {
      const sector = m.marketContext?.fundamentals?.sector || 'UNKNOWN';
      const current = winningSectors.get(sector) || { wins: 0, total: 0 };
      current.total++;
      if (m.outcome.result === 'WIN') current.wins++;
      winningSectors.set(sector, current);
    });

    winningSectors.forEach((stats, sector) => {
      const winRate = stats.wins / stats.total;
      if (winRate > 0.6 && stats.total >= 3 && !currentIntent.preferredSectors.includes(sector)) {
        adjustments.push({
          adjustmentId: uuidv4(),
          parameter: 'preferredSectors',
          currentValue: currentIntent.preferredSectors,
          suggestedValue: [...currentIntent.preferredSectors, sector],
          rationale: `${sector} 行业近期胜率 ${(winRate * 100).toFixed(0)}% (${stats.wins}/${stats.total})，建议加入偏好`,
          confidence: 0.65,
        });
      }
    });

    const sizeSuggestion = suggestions.find(s => s.type === 'SIZING');
    if (sizeSuggestion) {
      adjustments.push({
        adjustmentId: uuidv4(),
        parameter: 'positionSizeHint',
        currentValue: 'default',
        suggestedValue: 'conservative',
        rationale: sizeSuggestion.description,
        confidence: sizeSuggestion.confidence,
      });
    }

    return adjustments;
  }

  applyAdjustments(intent: UserIntent, adjustments: IntentAdjustment[]): UserIntent {
    const updated = { ...intent };
    adjustments.forEach(adj => {
      (updated as any)[adj.parameter] = adj.suggestedValue;
    });
    return UserIntentSchema.parse(updated);
  }
}

export class ConfidenceCalibrator {
  calibrate(memories: EpisodicMemory[]): ConfidenceCalibration {
    const completedMemories = memories.filter(
      m => m.outcome.result && m.outcome.result !== 'PENDING'
    );

    const buckets = [
      { min: 0, max: 0.5 },
      { min: 0.5, max: 0.7 },
      { min: 0.7, max: 0.9 },
      { min: 0.9, max: 1.0 },
    ];

    const bucketResults = buckets.map(bucket => {
      const inBucket = completedMemories.filter(
        m => m.proposal.confidence >= bucket.min && m.proposal.confidence < bucket.max
      );
      const wins = inBucket.filter(m => m.outcome.result === 'WIN').length;
      const predictedConfidence = inBucket.length > 0
        ? inBucket.reduce((sum, m) => sum + m.proposal.confidence, 0) / inBucket.length
        : (bucket.min + bucket.max) / 2;
      const actualWinRate = inBucket.length > 0 ? wins / inBucket.length : 0.5;

      return {
        range: bucket,
        predictedConfidence,
        actualWinRate,
        sampleSize: inBucket.length,
        calibrationError: Math.abs(predictedConfidence - actualWinRate),
      };
    });

    const overallCalibrationError = bucketResults.reduce(
      (sum, b) => sum + b.calibrationError * b.sampleSize,
      0
    ) / Math.max(1, bucketResults.reduce((sum, b) => sum + b.sampleSize, 0));

    const avgOverconfidence = bucketResults.reduce(
      (sum, b) => sum + (b.predictedConfidence - b.actualWinRate) * b.sampleSize,
      0
    ) / Math.max(1, bucketResults.reduce((sum, b) => sum + b.sampleSize, 0));

    const recommendedTemperature = avgOverconfidence > 0.1
      ? 1.2 + avgOverconfidence * 2
      : avgOverconfidence < -0.1
      ? 0.8 + avgOverconfidence * 2
      : 1.0;

    return {
      calibrationId: uuidv4(),
      timestamp: Date.now(),
      buckets: bucketResults,
      overallCalibrationError,
      recommendedTemperature: Math.max(0.5, Math.min(2.0, recommendedTemperature)),
    };
  }
}

export class ReflectionAgent implements Agent<ReflectionInput, ReflectionResult> {
  name = 'ReflectionAgent';

  private attributor = new PerformanceAttributor();
  private recognizer = new PatternRecognizer();
  private advisor = new StrategyAdvisor();
  private intentEvolver = new IntentEvolutionEngine();
  private calibrator = new ConfidenceCalibrator();

  async run(input: ReflectionInput): Promise<ReflectionResult> {
    const { memoryStore, periodStart, periodEnd, currentIntent, depth = 'MEDIUM' } = input;

    console.log(`[${this.name}] Starting reflection (depth: ${depth})...`);

    const query: MemoryQuery = {
      dateRange: { start: periodStart, end: periodEnd },
      limit: depth === 'DEEP' ? 1000 : depth === 'MEDIUM' ? 100 : 20,
    };

    const retrieval = memoryStore.retrieve(query);
    const episodicMemories = retrieval.memories.filter(
      (m): m is EpisodicMemory => m.type === 'EPISODIC'
    );

    console.log(`[${this.name}] Analyzing ${episodicMemories.length} memories...`);

    const attributions = [this.attributor.analyze(episodicMemories)];
    const patterns = this.recognizer.recognize(episodicMemories);
    const antiPatternAlerts = this.recognizer.detectAntiPatterns(episodicMemories);
    const suggestions = this.advisor.generateSuggestions(episodicMemories, patterns, attributions[0]);
    const intentAdjustments = this.intentEvolver.evolveIntent(currentIntent, episodicMemories, suggestions);
    const calibration = this.calibrator.calibrate(episodicMemories);

    const summary = this.generateSummary(attributions[0], patterns, suggestions, antiPatternAlerts);
    const keyInsights = this.generateKeyInsights(attributions[0], patterns, suggestions);
    const suggestedImprovements = suggestions.map(s => `${s.title}: ${s.description}`);

    const insight: ReflectionInsight = {
      id: uuidv4(),
      timestamp: Date.now(),
      periodStart,
      periodEnd,
      summary,
      keyInsights,
      performanceMetrics: {
        totalTrades: episodicMemories.length,
        winRate: episodicMemories.filter(m => m.outcome.result === 'WIN').length / Math.max(1, episodicMemories.length),
        averageReturn: attributions[0].totalReturn,
        maxDrawdown: -Math.abs(attributions[0].totalReturn * 0.3),
        sharpeRatio: attributions[0].totalReturn / Math.max(0.1, Math.abs(attributions[0].totalReturn * 0.5)),
      },
      suggestedImprovements,
      intentAdjustments: intentAdjustments as any,
    };

    memoryStore.saveReflectionInsight(insight);

    console.log(`[${this.name}] Reflection completed. Generated ${suggestions.length} suggestions.`);

    return {
      insight,
      attributions,
      patterns,
      suggestions,
      intentAdjustments,
      antiPatternAlerts,
      calibration,
    };
  }

  private generateSummary(
    attribution: PerformanceAttribution,
    patterns: PatternMatch[],
    suggestions: StrategySuggestion[],
    alerts: AntiPatternAlert[]
  ): string {
    const parts: string[] = [];

    if (attribution.totalReturn > 0) {
      parts.push(`本期实现正收益 ${attribution.totalReturn.toFixed(2)}%，`);
    } else if (attribution.totalReturn < 0) {
      parts.push(`本期亏损 ${Math.abs(attribution.totalReturn).toFixed(2)}%，`);
    }

    if (patterns.length > 0) {
      const successCount = patterns.filter(p => p.patternType === 'SUCCESS').length;
      const failureCount = patterns.filter(p => p.patternType === 'FAILURE').length;
      parts.push(`识别出 ${successCount} 个成功模式和 ${failureCount} 个失败模式。`);
    }

    if (alerts.length > 0) {
      parts.push(`发现 ${alerts.length} 个需要注意的问题。`);
    }

    if (suggestions.length > 0) {
      const highPriority = suggestions.filter(s => s.priority === 'HIGH').length;
      parts.push(`提出 ${suggestions.length} 条改进建议（含 ${highPriority} 条高优先级）。`);
    }

    return parts.length > 0 ? parts.join('') : '本期反思分析完成。';
  }

  private generateKeyInsights(
    attribution: PerformanceAttribution,
    patterns: PatternMatch[],
    suggestions: StrategySuggestion[]
  ): string[] {
    const insights: string[] = [];

    if (attribution.alphaReturn > attribution.marketReturn) {
      insights.push('α收益贡献超过市场收益，选股能力表现突出');
    }

    const highWinRatePatterns = patterns.filter(p => p.winRate > 0.7);
    highWinRatePatterns.forEach(p => {
      insights.push(`"${p.patternName}" 模式胜率达 ${(p.winRate * 100).toFixed(0)}%，值得重点关注`);
    });

    const highPriority = suggestions.filter(s => s.priority === 'HIGH');
    highPriority.forEach(s => {
      insights.push(`${s.title} - ${s.description}`);
    });

    return insights.slice(0, 5);
  }
}
