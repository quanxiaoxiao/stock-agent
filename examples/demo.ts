#!/usr/bin/env node

import {
  MarketDataService,
  MockMarketDataProvider,
  EpisodicMemoryStore,
} from '../dist/index.js';
import { TradeProposal, TradeProposalSchema } from '../dist/domain/proposal.js';
import { v4 as uuidv4 } from 'uuid';

async function demoMarketData() {
  console.log('=== 市场数据同步服务演示 ===\n');

  const provider = new MockMarketDataProvider();
  const service = new MarketDataService(provider);

  console.log('1. 获取 AAPL 快照数据...');
  const snapshot = await service.getSnapshot('AAPL');
  console.log('   价格:', snapshot.price.toFixed(2));
  console.log('   涨跌幅:', snapshot.changePercent.toFixed(2) + '%');
  console.log('   成交量:', snapshot.volume.toLocaleString());
  console.log();

  console.log('2. 获取 AAPL 日线历史数据...');
  const history = await service.getHistory('AAPL', '1d');
  console.log('   K线数量:', history.bars.length);
  console.log('   最新收盘:', history.bars[history.bars.length - 1].close.toFixed(2));
  console.log();

  console.log('3. 获取技术指标...');
  const tech = await service.getTechnicalIndicators('AAPL');
  console.log('   RSI:', tech.rsi?.toFixed(2));
  console.log('   MA50:', tech.ma50?.toFixed(2));
  console.log('   MACD:', tech.macd?.macdLine.toFixed(4));
  console.log();

  console.log('4. 获取完整数据包...');
  const pkg = await service.getCompletePackage('AAPL');
  const quality = service.assessDataQuality(pkg);
  console.log('   数据完整性:', (quality.completeness * 100).toFixed(0) + '%');
  console.log('   数据新鲜度:', (quality.freshness * 100).toFixed(0) + '%');
  console.log();
}

async function demoMemory() {
  console.log('=== 自我操作记忆环路演示 ===\n');

  const memoryStore = new EpisodicMemoryStore();

  console.log('1. 记录交易记忆...');
  const proposal: TradeProposal = {
    id: uuidv4(),
    symbol: 'AAPL',
    action: 'BUY',
    sizePercent: 5,
    thesis: 'Breakout above resistance with strong volume',
    confidence: 0.85,
    expectedHoldingDays: 30,
    riskLevel: 2,
    requiresApproval: false,
    timestamp: Date.now(),
  };

  const memory = memoryStore.recordTrade(proposal, {
    executed: true,
    executionPrice: 175.50,
    executionTimestamp: Date.now(),
    result: 'WIN',
    returnPercent: 8.5,
    notes: 'Exited at resistance as planned',
  });

  console.log('   记忆ID:', memory.id);
  console.log('   标签:', memory.tags.join(', '));
  console.log('   情绪:', memory.emotion);
  console.log();

  console.log('2. 添加语义记忆（市场知识）...');
  const semantic = memoryStore.addSemanticMemory({
    category: 'MARKET_PATTERN',
    title: 'AAPL 季度财报后表现',
    content: 'AAPL tends to rally 3-5% in the week following strong earnings reports',
    source: 'EXPERIENCE',
    relatedSymbols: ['AAPL'],
    relatedTags: ['WIN'],
    confidence: 0.75,
  });
  console.log('   语义记忆ID:', semantic.id);
  console.log();

  console.log('3. 检索相关记忆...');
  const results = memoryStore.retrieve({
    symbols: ['AAPL'],
    tags: ['WIN'],
    limit: 10,
  });
  console.log('   找到', results.memories.length, '条相关记忆');
  results.memories.forEach((m, i) => {
    console.log(`   ${i + 1}. [${m.type}] ${m.id.slice(0, 8)}...`);
  });
  console.log();

  console.log('4. 记忆统计...');
  const stats = memoryStore.getStats();
  console.log('   情景记忆:', stats.episodicCount);
  console.log('   语义记忆:', stats.semanticCount);
  console.log('   过程记忆:', stats.proceduralCount);
  console.log('   覆盖股票:', stats.symbolCount);
  console.log('   标签数量:', stats.tagCount);
  console.log();
}

async function main() {
  try {
    await demoMarketData();
    await demoMemory();
    console.log('✅ 演示完成！');
  } catch (error) {
    console.error('❌ 演示出错:', error);
  }
}

main();
