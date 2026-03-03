import { MarketDataProvider } from '../marketData.provider.js';
import {
  MarketDataSnapshot,
  MarketDataHistory,
  TechnicalIndicators,
  FundamentalData,
  MarketDataBar,
} from '../../domain/marketData.js';

export class MockMarketDataProvider implements MarketDataProvider {
  name = 'MockMarketDataProvider';

  private basePrices: Map<string, number> = new Map([
    ['AAPL', 175.50],
    ['GOOGL', 140.25],
    ['MSFT', 380.75],
    ['TSLA', 245.80],
    ['AMZN', 178.90],
    ['600519', 1680.00],
    ['000001', 11.25],
    ['601318', 45.80],
  ]);

  async getSnapshot(symbol: string): Promise<MarketDataSnapshot> {
    const basePrice = this.basePrices.get(symbol.toUpperCase()) || 100;
    const change = (Math.random() - 0.5) * 10;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol: symbol.toUpperCase(),
      timestamp: Date.now(),
      price: basePrice + change,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      high: basePrice + Math.abs(change) + Math.random() * 5,
      low: basePrice - Math.abs(change) - Math.random() * 5,
      open: basePrice + (Math.random() - 0.5) * 3,
      previousClose: basePrice,
    };
  }

  async getHistory(
    symbol: string,
    timeframe: '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1M',
    startDate?: number,
    endDate?: number
  ): Promise<MarketDataHistory> {
    const basePrice = this.basePrices.get(symbol.toUpperCase()) || 100;
    const now = endDate || Date.now();
    const bars: MarketDataBar[] = [];
    
    let barCount = 100;
    let timeIncrement: number;
    
    switch (timeframe) {
      case '1m':
        timeIncrement = 60 * 1000;
        barCount = 390;
        break;
      case '5m':
        timeIncrement = 5 * 60 * 1000;
        barCount = 390;
        break;
      case '15m':
        timeIncrement = 15 * 60 * 1000;
        barCount = 260;
        break;
      case '1h':
        timeIncrement = 60 * 60 * 1000;
        barCount = 250;
        break;
      case '1d':
        timeIncrement = 24 * 60 * 60 * 1000;
        barCount = 252;
        break;
      case '1w':
        timeIncrement = 7 * 24 * 60 * 60 * 1000;
        barCount = 52;
        break;
      case '1M':
        timeIncrement = 30 * 24 * 60 * 60 * 1000;
        barCount = 24;
        break;
    }

    let currentPrice = basePrice * (0.7 + Math.random() * 0.3);
    let currentTime = startDate || (now - barCount * timeIncrement);

    for (let i = 0; i < barCount; i++) {
      const volatility = 0.02;
      const change = currentPrice * (Math.random() - 0.5) * volatility * 2;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * Math.abs(change);
      const low = Math.min(open, close) - Math.random() * Math.abs(change);

      bars.push({
        timestamp: currentTime,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      });

      currentPrice = close;
      currentTime += timeIncrement;
    }

    return {
      symbol: symbol.toUpperCase(),
      timeframe,
      bars,
      lastUpdated: Date.now(),
    };
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    const history = await this.getHistory(symbol, '1d');
    const prices = history.bars.map(bar => bar.close);
    const latestPrice = prices[prices.length - 1];

    const rsi = 30 + Math.random() * 40;
    const ma50 = latestPrice * (0.95 + Math.random() * 0.1);
    const ma200 = latestPrice * (0.9 + Math.random() * 0.2);

    const macdLine = (Math.random() - 0.5) * 5;
    const signalLine = macdLine + (Math.random() - 0.5) * 2;

    const middle = ma50;
    const stdDev = latestPrice * 0.02;

    return {
      symbol: symbol.toUpperCase(),
      timestamp: Date.now(),
      rsi,
      macd: {
        macdLine,
        signalLine,
        histogram: macdLine - signalLine,
      },
      ma50,
      ma200,
      bollingerBands: {
        upper: middle + 2 * stdDev,
        middle,
        lower: middle - 2 * stdDev,
      },
      volatility: 0.15 + Math.random() * 0.2,
    };
  }

  async getFundamentalData(symbol: string): Promise<FundamentalData> {
    const basePrice = this.basePrices.get(symbol.toUpperCase()) || 100;
    
    return {
      symbol: symbol.toUpperCase(),
      timestamp: Date.now(),
      peRatio: 15 + Math.random() * 20,
      pbRatio: 2 + Math.random() * 5,
      dividendYield: Math.random() * 5,
      marketCap: 1000000000 + Math.random() * 2000000000000,
      eps: basePrice / (15 + Math.random() * 20),
      revenue: 10000000000 + Math.random() * 100000000000,
      netIncome: 1000000000 + Math.random() * 10000000000,
      debtToEquity: 0.5 + Math.random() * 1.5,
      returnOnEquity: 0.05 + Math.random() * 0.2,
      sector: ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy'][Math.floor(Math.random() * 5)],
      industry: ['Software', 'Hardware', 'Banking', 'Retail', 'Pharmaceutical'][Math.floor(Math.random() * 5)],
    };
  }

  async validateConnection(): Promise<boolean> {
    return true;
  }

  async getRateLimitStatus(): Promise<{
    remaining: number;
    resetTime: number;
  }> {
    return {
      remaining: 1000,
      resetTime: Date.now() + 3600000,
    };
  }
}
