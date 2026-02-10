import { Injectable } from '@angular/core';
import { LlmModel } from '../chatbot-simulator/logic.service';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CachingRoiInputs {
  staticTokens: number;
  dynamicTokens: number;
  outputTokens: number;
  requestsPerDay: number;
  /** Percentage of requests that are cache writes (0-100) */
  cacheWritePercent: number;
}

export interface CachingRoiResult {
  /** Monthly cost without caching */
  costNoCache: number;
  /** Monthly cost with caching */
  costCached: number;
  /** Monthly savings (costNoCache - costCached) */
  monthlySavings: number;
  /** Savings as percentage */
  savingsPercent: number;
  /** Annual savings projection */
  annualSavings: number;
  /** Requests needed for cache to pay for itself */
  breakEvenRequests: number;
  /** Cache discount percentage for this model */
  cacheDiscount: number;
  /** Daily cost without cache */
  dailyCostNoCache: number;
  /** Daily cost with cache */
  dailyCostCached: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;
const TOKENS_DIVISOR = 1_000_000;

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class CachingRoiLogicService {
  /**
   * Calculates the full caching ROI comparison for a given model.
   *
   * Write/Read split logic (from spec):
   * - Cache Write: requests where TTL expired or first call (pay full input price)
   * - Cache Read: requests that hit the cache (pay discounted cached_input price)
   * - Dynamic tokens: always pay full input price (not cacheable)
   * - Output tokens: always pay full output price
   */
  calculate(inputs: CachingRoiInputs, model: LlmModel): CachingRoiResult {
    const P_input = model.pricing.input_1m / TOKENS_DIVISOR;
    const P_cached = (model.pricing.cached_input_1m ?? model.pricing.input_1m) / TOKENS_DIVISOR;
    const P_output = model.pricing.output_1m / TOKENS_DIVISOR;

    const writeRate = inputs.cacheWritePercent / 100;
    const readRate = 1 - writeRate;
    const volMonthly = inputs.requestsPerDay * DAYS_PER_MONTH;

    // 1. Cost without cache (baseline)
    const dailyCostNoCache =
      inputs.requestsPerDay *
      ((inputs.staticTokens + inputs.dynamicTokens) * P_input + inputs.outputTokens * P_output);

    const costNoCache = dailyCostNoCache * DAYS_PER_MONTH;

    // 2. Cost with cache (Write/Read split on static tokens only)
    const dailyStaticWrite = inputs.requestsPerDay * writeRate * inputs.staticTokens * P_input;
    const dailyStaticRead = inputs.requestsPerDay * readRate * inputs.staticTokens * P_cached;
    const dailyDynamic = inputs.requestsPerDay * inputs.dynamicTokens * P_input;
    const dailyOutput = inputs.requestsPerDay * inputs.outputTokens * P_output;

    const dailyCostCached = dailyStaticWrite + dailyStaticRead + dailyDynamic + dailyOutput;
    const costCached = dailyCostCached * DAYS_PER_MONTH;

    // 3. Savings
    const monthlySavings = costNoCache - costCached;
    const savingsPercent = costNoCache > 0 ? (monthlySavings / costNoCache) * 100 : 0;
    const annualSavings = monthlySavings * MONTHS_PER_YEAR;

    // 4. Break-even: after how many requests does caching pay off?
    // One write costs: staticTokens * P_input
    // One read saves: staticTokens * (P_input - P_cached)
    // Break-even = ceil(writeCost / savingsPerRead) = ceil(1 / readRate) when simplified
    // More precisely: break-even is when cumulative savings >= 0, which happens at ceil(1 / (1 - writeRate))
    const savingsPerRead = inputs.staticTokens * (P_input - P_cached);
    const costPerWrite = inputs.staticTokens * P_input;
    const breakEvenRequests = savingsPerRead > 0 ? Math.ceil(costPerWrite / savingsPerRead) : 0;

    // 5. Cache discount for display
    const cacheDiscount =
      model.pricing.input_1m > 0
        ? (1 - (model.pricing.cached_input_1m ?? model.pricing.input_1m) / model.pricing.input_1m) * 100
        : 0;

    return {
      costNoCache: this.round(costNoCache),
      costCached: this.round(costCached),
      monthlySavings: this.round(monthlySavings),
      savingsPercent: this.round(savingsPercent, 1),
      annualSavings: this.round(annualSavings),
      breakEvenRequests,
      cacheDiscount: this.round(cacheDiscount, 0),
      dailyCostNoCache: this.round(dailyCostNoCache),
      dailyCostCached: this.round(dailyCostCached),
    };
  }

  /**
   * Filters models that support prompt caching (have cached_input_1m defined and > 0).
   */
  filterCacheableModels(models: LlmModel[]): LlmModel[] {
    return models.filter(
      (m) => m.pricing.cached_input_1m != null && m.pricing.cached_input_1m > 0,
    );
  }

  private round(value: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
