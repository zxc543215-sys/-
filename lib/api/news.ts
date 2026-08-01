import { cache } from '../utils/cache';
import { retryAsync } from '../utils/retry';
import { logger } from '../utils/logger';

export interface NewsItem {
  id: string;
  time: string;
  title: string;
  url: string;
  ai_analysis: {
    impact_assets: string[];
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    impact_level: 'High' | 'Medium' | 'Low';
    zh_summary: string;
  };
}

const CACHE_KEY = 'market_news';
const CACHE_TTL = parseInt(process.env.CACHE_TTL_NEWS || '300', 10);

export async function fetchNewsData(): Promise<NewsItem[]> {
  // Check cache first
  const cached = cache.get<NewsItem[]>(CACHE_KEY);
  if (cached) {
    logger.debug('News data retrieved from cache');
    return cached;
  }

  try {
    // Fetch with retry logic
    const newsData = await retryAsync(async () => {
      const response = await fetch('/data/news.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }
      return response.json();
    });

    // Validate response
    if (!Array.isArray(newsData)) {
      throw new Error('Invalid news data format');
    }

    // Cache the result
    cache.set(CACHE_KEY, newsData, CACHE_TTL);
    logger.info('News data fetched and cached', { count: newsData.length });

    return newsData;
  } catch (error) {
    logger.error('Failed to fetch news data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return [];
  }
}
