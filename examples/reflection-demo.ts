#!/usr/bin/env node

import {
  EpisodicMemoryStore,
  ReflectionAgent,
  createDefaultIntent,
} from '../dist/index.js';
import type { ReflectionInput } from '../dist/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { TradeProposal } from '../dist/domain/proposal.js';

async function generateSampleMemories(memoryStore: EpisodicMemoryStore) {
  console.log('生成样本交易记忆...\n');

  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
  const results = ['WIN', 'LOSS', 'WIN', 'WIN', 'LOSS', 'WIN', 'BREAK_EVEN', 'WIN', 'LOSS', 'WIN'];

  for (let i = 0; i < 10; i++) {
    const symbol = symbols[i % symbols.length];
    const result = results[i % results.length] as 'WIN' | 'LOSS' | 'BREAK_EVEN';
    const basePrice = [175, 140, 380, 245, 178][i % 5];
    const returnPercent = result === 'WIN' ? (2 + Math.random() * 8) : result === 'LOSS' ? (-8 - Math.random() * 5) : 0;
    const confidence = 0.5 + Math.random() * 0.45;
    const riskLevel = Math.floor(Math.random() * 5) + 1;
    const timestamp = Date.now() - (10 - i) * 24 * 60 * 60 * 1000;

    const proposal: TradeProposal = {
      id: uuidv4(),
      symbol,
      action: 'BUY',
      sizePercent: 3 + Math.random() * 7,
      thesis: `Sample thesis for ${symbol} trade`,
      confidence,
      expectedHoldingDays: 15 + Math.floor(Math.random() * 30),
      riskLevel,
      requiresApproval: riskLevel >= 3,
      timestamp,
    };

    memoryStore.recordTrade(
      proposal,
      {
        executed: true,
        executionPrice: basePrice + (Math.random() - 0.5) * 5,
        executionTimestamp: timestamp + 3600000,
        result,
        returnPercent,
        notes: result === 'WIN' ? 'Good trade' : result === 'LOSS' ? 'Cut loss' : 'No change',
      }
    );

    console.log(`  [${i + 1}] ${symbol} - ${result} (${returnPercent.toFixed(2)}%) - Conf: ${(confidence * 100).toFixed(0)}% - Risk: ${riskLevel}`);
  }
  console.log();
}

async function demoReflection() {
  console.log('=== 反思代理 (Reflection Agent) 演示 ===\n');

  const memoryStore = new EpisodicMemoryStore();
  const reflectionAgent = new ReflectionAgent();
  const currentIntent = createDefaultIntent();

  await generateSampleMemories(memoryStore);

  const stats = memoryStore.getStats();
  console.log('记忆统计:');
  console.log(`  情景记忆: ${stats.episodicCount}`);
  console.log(`  语义记忆: ${stats.semanticCount}`);
  console.log(`  过程记忆: ${stats.proceduralCount}`);
  console.log(`  覆盖股票: ${stats.symbolCount}`);
  console.log(`  标签数量: ${stats.tagCount}`);
  console.log();

  console.log('运行深度反思分析...\n');

  const input: ReflectionInput = {
    memoryStore,
    periodStart: Date.now() - 30 * 24 * 60 * 60 * 1000,
    periodEnd: Date.now(),
    currentIntent,
    depth: 'DEEP',
  };

  const result = await reflectionAgent.run(input);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    反思洞察报告');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📊 业绩归因:');
  result.attributions.forEach(attr => {
    console.log(`  总收益: ${attr.totalReturn.toFixed(2)}%`);
    console.log(`  α收益: ${attr.alphaReturn.toFixed(2)}%`);
    console.log(`  β收益: ${attr.marketReturn.toFixed(2)}%`);
    console.log(`  择时得分: ${(attr.timingScore * 100).toFixed(0)}%`);
    console.log(`  选股得分: ${(attr.selectionScore * 100).toFixed(0)}%`);
    console.log(`  因子暴露:`, Object.entries(attr.factorExposures).map(([k, v]) => `${k}: ${(v as number).toFixed(2)}`).join(', '));
  });
  console.log();

  console.log('🔍 模式识别:');
  if (result.patterns.length > 0) {
    result.patterns.forEach(pattern => {
      const icon = pattern.patternType === 'SUCCESS' ? '✅' : pattern.patternType === 'FAILURE' ? '❌' : '➖';
      console.log(`  ${icon} ${pattern.patternName}`);
      console.log(`     描述: ${pattern.description}`);
      console.log(`     置信度: ${(pattern.confidence * 100).toFixed(0)}%, 胜率: ${(pattern.winRate * 100).toFixed(0)}%`);
      console.log(`     平均收益: ${pattern.averageReturn.toFixed(2)}%, 匹配: ${pattern.matchedMemories.length}次`);
    });
  } else {
    console.log('  未识别到明显模式');
  }
  console.log();

  console.log('⚠️ 反模式警告:');
  if (result.antiPatternAlerts.length > 0) {
    result.antiPatternAlerts.forEach(alert => {
      const severityIcon = alert.severity === 'CRITICAL' ? '🔴' : '🟡';
      console.log(`  ${severityIcon} [${alert.severity}] ${alert.patternName}`);
      console.log(`     描述: ${alert.description}`);
      console.log(`     影响: ${alert.impact}`);
      console.log(`     修复建议:`);
      alert.remediation.forEach(r => console.log(`       - ${r}`));
    });
  } else {
    console.log('  未检测到反模式 ✅');
  }
  console.log();

  console.log('💡 策略优化建议:');
  result.suggestions.forEach((suggestion, idx) => {
    const priorityIcon = suggestion.priority === 'HIGH' ? '🔴' : suggestion.priority === 'MEDIUM' ? '🟡' : '🟢';
    console.log(`  ${idx + 1}. ${priorityIcon} [${suggestion.priority}] ${suggestion.title}`);
    console.log(`     描述: ${suggestion.description}`);
    console.log(`     置信度: ${(suggestion.confidence * 100).toFixed(0)}%`);
    console.log(`     预期影响: ${suggestion.expectedImpact}`);
    console.log(`     可行步骤:`);
    suggestion.actionableSteps.forEach(step => console.log(`       - ${step}`));
  });
  console.log();

  console.log('🎯 意图进化建议:');
  if (result.intentAdjustments.length > 0) {
    result.intentAdjustments.forEach(adj => {
      console.log(`  • ${adj.parameter}: ${JSON.stringify(adj.currentValue)} → ${JSON.stringify(adj.suggestedValue)}`);
      console.log(`    理由: ${adj.rationale}`);
      console.log(`    置信度: ${(adj.confidence * 100).toFixed(0)}%`);
    });
  } else {
    console.log('  当前意图配置良好，无需调整');
  }
  console.log();

  console.log('📐 信心校准报告:');
  console.log(`  整体校准误差: ${(result.calibration.overallCalibrationError * 100).toFixed(2)}%`);
  console.log(`  建议温度参数: ${result.calibration.recommendedTemperature.toFixed(2)}`);
  console.log(`  分桶详情:`);
  result.calibration.buckets.forEach(bucket => {
    console.log(`    [${(bucket.range.min * 100).toFixed(0)}-${(bucket.range.max * 100).toFixed(0)}%]: ` +
      `预测置信 ${(bucket.predictedConfidence * 100).toFixed(0)}%, ` +
      `实际胜率 ${(bucket.actualWinRate * 100).toFixed(0)}%, ` +
      `样本 ${bucket.sampleSize}`);
  });
  console.log();

  console.log('📝 核心洞察:');
  result.insight.keyInsights.forEach((insight, idx) => {
    console.log(`  ${idx + 1}. ${insight}`);
  });
  console.log();

  console.log('📈 业绩指标:');
  const metrics = result.insight.performanceMetrics;
  console.log(`  总交易次数: ${metrics.totalTrades}`);
  console.log(`  胜率: ${(metrics.winRate * 100).toFixed(2)}%`);
  console.log(`  平均收益: ${metrics.averageReturn.toFixed(2)}%`);
  console.log(`  最大回撤: ${metrics.maxDrawdown.toFixed(2)}%`);
  console.log(`  夏普比率: ${metrics.sharpeRatio?.toFixed(2) || 'N/A'}`);
  console.log();

  console.log('✅ 反思分析完成！');
}

demoReflection().catch(console.error);
