import { cache } from '../utils/cache';
import { retryAsync } from '../utils/retry';
import { logger } from '../utils/logger';

export interface CongressTrade {
  representative: string;
  ticker: string;
  type: 'purchase' | 'sale';
  amount: string;
  date: string;
}

export interface TrumpHolding {
  asset: string;
  type: string;
  shares?: string;
  value_est?: string;
  holding?: string;
  sentiment: string;
}

export interface PoliticalRadar {
  updated_at: string;
  key_holdings: TrumpHolding[];
  recent_activity: Array<{
    person: string;
    action: string;
    target: string;
    date: string;
  }>;
  congress_trades: CongressTrade[];
}

const CACHE_KEY = 'political_radar';
const CACHE_TTL = parseInt(process.env.CACHE_TTL_POLITICAL || '300', 10);

export async function fetchPoliticalData(): Promise<PoliticalRadar | null> {
  // Check cache first
  const cached = cache.get<PoliticalRadar>(CACHE_KEY);
  if (cached) {
    logger.debug('Political data retrieved from cache');
    return cached;
  }

  try {
    // Fetch with retry logic
    const politicalData = await retryAsync(async () => {
      const response = await fetch('/data/political_radar.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch political data: ${response.statusText}`);
      }
      return response.json();
    });

    // Validate response
    if (!politicalData || typeof politicalData !== 'object') {
      throw new Error('Invalid political data format');
    }

    // Cache the result
    cache.set(CACHE_KEY, politicalData, CACHE_TTL);
    logger.info('Political data fetched and cached', {
      Congress_trades: politicalData.congress_trades?.length || 0,
    });

    return politicalData;
  } catch (error) {
    logger.error('Failed to fetch political data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}
