import { logger } from './logger';

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 8000,
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, initialDelay: number, maxDelay: number): number {
  const delay = initialDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, maxDelay);
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Attempt ${attempt}/${opts.maxRetries} failed`, {
        error: lastError.message,
      });

      if (attempt < opts.maxRetries) {
        const delay = calculateBackoff(attempt, opts.initialDelayMs, opts.maxDelayMs);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
