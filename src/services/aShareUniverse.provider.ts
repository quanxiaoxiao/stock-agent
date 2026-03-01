import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { AShareStock, AShareStockSchema } from '../domain/intent.js';

const fallbackUniverse: AShareStock[] = [
  { symbol: '600519', name: '贵州茅台', sector: '消费', marketCap: 'LARGE', volatility: 0.28, momentumScore: 0.62, valueScore: 0.45, qualityScore: 0.95, liquidityScore: 0.9 },
  { symbol: '601318', name: '中国平安', sector: '金融', marketCap: 'LARGE', volatility: 0.24, momentumScore: 0.48, valueScore: 0.72, qualityScore: 0.83, liquidityScore: 0.88 },
  { symbol: '600036', name: '招商银行', sector: '金融', marketCap: 'LARGE', volatility: 0.22, momentumScore: 0.52, valueScore: 0.7, qualityScore: 0.86, liquidityScore: 0.87 },
  { symbol: '300750', name: '宁德时代', sector: '新能源', marketCap: 'LARGE', volatility: 0.42, momentumScore: 0.65, valueScore: 0.34, qualityScore: 0.84, liquidityScore: 0.9 },
  { symbol: '002594', name: '比亚迪', sector: '新能源', marketCap: 'LARGE', volatility: 0.4, momentumScore: 0.7, valueScore: 0.4, qualityScore: 0.82, liquidityScore: 0.89 },
  { symbol: '688981', name: '中芯国际', sector: '半导体', marketCap: 'LARGE', volatility: 0.45, momentumScore: 0.68, valueScore: 0.36, qualityScore: 0.8, liquidityScore: 0.86 },
  { symbol: '600276', name: '恒瑞医药', sector: '医药', marketCap: 'LARGE', volatility: 0.32, momentumScore: 0.58, valueScore: 0.5, qualityScore: 0.81, liquidityScore: 0.84 },
  { symbol: '000858', name: '五粮液', sector: '消费', marketCap: 'LARGE', volatility: 0.3, momentumScore: 0.56, valueScore: 0.48, qualityScore: 0.9, liquidityScore: 0.86 },
  { symbol: '002475', name: '立讯精密', sector: '电子', marketCap: 'MID', volatility: 0.38, momentumScore: 0.61, valueScore: 0.49, qualityScore: 0.77, liquidityScore: 0.8 },
  { symbol: '600309', name: '万华化学', sector: '化工', marketCap: 'LARGE', volatility: 0.34, momentumScore: 0.59, valueScore: 0.57, qualityScore: 0.8, liquidityScore: 0.83 },
];

export class AShareUniverseProvider {
  private readonly configPath: string;

  constructor(configPath: string = join(process.cwd(), 'config', 'a-share-universe.json')) {
    this.configPath = configPath;
  }

  loadUniverse(): AShareStock[] {
    if (!existsSync(this.configPath)) {
      return fallbackUniverse;
    }

    const raw = readFileSync(this.configPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('config/a-share-universe.json must be an array');
    }

    return parsed.map((item) => AShareStockSchema.parse(item));
  }
}
