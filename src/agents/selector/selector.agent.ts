import { Agent } from '../../core/agent.js';
import { UserIntent, AShareStock } from '../../domain/intent.js';
import { ScoredCandidate, SelectionResult } from '../../domain/types.js';
import { AShareUniverseProvider } from '../../services/aShareUniverse.provider.js';

export class SelectorAgent implements Agent<UserIntent, SelectionResult> {
  name = 'selector';
  private universeProvider: AShareUniverseProvider;

  constructor(universeProvider: AShareUniverseProvider = new AShareUniverseProvider()) {
    this.universeProvider = universeProvider;
  }

  async run(intent: UserIntent): Promise<SelectionResult> {
    const universe = this.universeProvider.loadUniverse();
    const filtered = universe.filter((stock) => this.passesHardFilters(stock, intent));

    if (filtered.length === 0) {
      throw new Error('No stocks matched current intent filters. Please relax avoid/blacklist preferences.');
    }

    const shortlist = filtered
      .map((stock) => ({ stock, score: this.scoreStock(stock, intent) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      selected: shortlist[0].stock,
      shortlist,
      intent,
    };
  }

  private passesHardFilters(stock: AShareStock, intent: UserIntent): boolean {
    if (intent.blacklistSymbols.includes(stock.symbol)) {
      return false;
    }

    if (intent.avoidSectors.includes(stock.sector)) {
      return false;
    }

    if (intent.preferredMarketCaps.length > 0 && !intent.preferredMarketCaps.includes(stock.marketCap)) {
      return false;
    }

    return true;
  }

  private scoreStock(stock: AShareStock, intent: UserIntent): number {
    const targetVolatility = 0.15 + (intent.riskTolerance * 0.5);
    const riskFit = 1 - Math.abs(stock.volatility - targetVolatility);

    let styleScore = 0;
    switch (intent.style) {
      case 'VALUE':
        styleScore = stock.valueScore;
        break;
      case 'GROWTH':
        styleScore = (stock.momentumScore * 0.6) + (stock.qualityScore * 0.4);
        break;
      case 'MOMENTUM':
        styleScore = stock.momentumScore;
        break;
      case 'BALANCED':
        styleScore = (stock.momentumScore + stock.valueScore + stock.qualityScore) / 3;
        break;
      default:
        styleScore = 0.5;
    }

    const sectorBonus = intent.preferredSectors.includes(stock.sector) ? 0.2 : 0;
    return (riskFit * 0.4) + (styleScore * 0.35) + (stock.liquidityScore * 0.2) + sectorBonus;
  }
}
