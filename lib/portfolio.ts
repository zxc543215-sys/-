export interface AssetPosition {
  id: string;
  symbol: string;
  name: string;
  category: 'TW_STOCK' | 'US_STOCK' | 'MUTUAL_FUND';
  shares: number;
  costBasis: number;
}

export interface PortfolioSummary {
  totalValueTWD: number;
  totalProfitTWD: number;
  totalProfitPercent: number;
  positions: Array<
    AssetPosition & {
      currentPrice: number;
      marketValueTWD: number;
      profitTWD: number;
      profitPercent: number;
    }
  >;
}

const mockPrices: Record<string, number> = {
  '2330.TW': 980.0,
  '0050.TW': 165.5,
  'AAPL': 225.0,
  'NVDA': 128.5,
};

export async function calculatePortfolio(
  positions: AssetPosition[],
  usdTwdRate: number = 32.2
): Promise<PortfolioSummary> {
  let totalValueTWD = 0;
  let totalCostTWD = 0;

  const calculatedPositions = positions.map((pos) => {
    const currentPrice = mockPrices[pos.symbol] || pos.costBasis;
    const isUS = pos.category === 'US_STOCK';
    const fx = isUS ? usdTwdRate : 1;

    const marketValueTWD = pos.shares * currentPrice * fx;
    const costTWD = pos.shares * pos.costBasis * fx;
    const profitTWD = marketValueTWD - costTWD;
    const profitPercent = costTWD > 0 ? (profitTWD / costTWD) * 100 : 0;

    totalValueTWD += marketValueTWD;
    totalCostTWD += costTWD;

    return {
      ...pos,
      currentPrice,
      marketValueTWD,
      profitTWD,
      profitPercent,
    };
  });

  const totalProfitTWD = totalValueTWD - totalCostTWD;
  const totalProfitPercent =
    totalCostTWD > 0 ? (totalProfitTWD / totalCostTWD) * 100 : 0;

  return {
    totalValueTWD,
    totalProfitTWD,
    totalProfitPercent,
    positions: calculatedPositions,
  };
}
