import { Injectable } from '@angular/core';
import { VALUESCORE_ALPHA, VALUESCORE_BETA } from '../../core/constants/engine-weights';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * User input parameters for the chatbot cost simulation.
 */
export interface SimulatorInputs {
  /** M = Messages per day */
  messagesPerDay: number;
  /** Ti = Input tokens per message */
  tokensInputPerMessage: number;
  /** To = Output tokens per message */
  tokensOutputPerMessage: number;
  /** Cr = Cache hit rate (0.00 - 1.00) */
  cacheHitRate: number;
}

/**
 * Pricing structure from llm-pricing.json
 */
export interface ModelPricing {
  /** Price per 1M input tokens (USD) */
  input_1m: number;
  /** Price per 1M output tokens (USD) */
  output_1m: number;
  /** Price per 1M cached input tokens (USD) - may be 0 or missing */
  cached_input_1m?: number;
}

/**
 * Model capabilities from llm-pricing.json
 */
export interface ModelCapabilities {
  /** Maximum context window size in tokens */
  context_window?: number;
  /** Latency index (0-1 scale, higher is faster) */
  latency_index?: number;
}

/**
 * Full LLM model definition from registry
 */
export interface LlmModel {
  id: string;
  name: string;
  provider: string;
  pricing: ModelPricing;
  capabilities: ModelCapabilities;
}

/**
 * Breakdown of daily costs by category
 */
export interface DailyCostsBreakdown {
  /** Daily cost for non-cached input tokens */
  inputNonCached: number;
  /** Daily cost for cached input tokens */
  inputCached: number;
  /** Daily cost for output tokens */
  output: number;
  /** Total daily cost */
  total: number;
}

/**
 * Complete result for a single model simulation
 */
export interface SimulatorResult {
  modelId: string;
  modelName: string;
  provider: string;
  /** Breakdown of daily costs */
  dailyCosts: DailyCostsBreakdown;
  /** Total monthly cost (30 days) */
  monthlyCost: number;
  /** Calculated value score for ranking */
  valueScore: number;
  /** Human-readable explanation of the score */
  scoreExplanation: string;
  /** Context window size used in calculation */
  contextWindow: number;
  /** Latency index used in calculation */
  latencyIndex: number;
}

/**
 * Aggressive Comparison metrics for marketing (Winner vs Runner-Up)
 * Per spec section 3.1
 */
export interface AggressiveComparison {
  /** Winner model name */
  winnerName: string;
  /** Runner-up model name */
  runnerUpName: string;
  /** Savings% = (Cost_runnerUp - Cost_winner) / Cost_runnerUp × 100 */
  savingsPercent: number;
  /** Context_multiplier = Context_winner / Context_runnerUp */
  contextMultiplier: number;
  /** "Switching to [Winner] saves you X% monthly compared to [Runner-Up]." */
  savingsNarration: string;
  /** "[Winner] offers Xx more context memory than [Runner-Up]." (null if <= 1.0) */
  contextNarration: string | null;
  /** Raw cost difference (winner saves this amount) */
  monthlySavings: number;
}

/**
 * Sensitivity Analysis for traffic scaling projections.
 * Per spec section 6.1 - used in PDF Technical Report.
 */
export interface SensitivityAnalysis {
  /** Model identifier */
  modelId: string;
  /** Model display name */
  modelName: string;
  /** Cost at current traffic (1x) */
  cost1x: number;
  /** Cost at double traffic (2x) */
  cost2x: number;
  /** Cost at triple traffic (3x) */
  cost3x: number;
  /** Annual projected cost at 1x */
  annualCost1x: number;
  /** Annual projected cost at 2x */
  annualCost2x: number;
  /** Annual projected cost at 3x */
  annualCost3x: number;
}

// ============================================================================
// CONFIGURABLE CONSTANTS
// ============================================================================

/**
 * Weights for ValueScore calculation.
 * Imported from centralized constants for transparency and configurability.
 * - ALPHA: Weight for inverse cost (higher = cost matters more)
 * - BETA: Weight for context window (higher = context matters more)
 */
export const VALUE_SCORE_WEIGHTS = {
  ALPHA: VALUESCORE_ALPHA,
  BETA: VALUESCORE_BETA,
} as const;

/**
 * Constants used in cost calculations.
 */
export const CALCULATION_CONSTANTS = {
  /** Number of days in a billing month */
  DAYS_PER_MONTH: 30,
  /** Divisor for token pricing (prices are per 1M tokens) */
  TOKENS_DIVISOR: 1_000_000,
  /** Small value to prevent division by zero */
  EPSILON: 0.0001,
} as const;

/**
 * Default fallback values for missing model capabilities.
 */
export const DEFAULT_CAPABILITIES = {
  CONTEXT_WINDOW: 8000,
  LATENCY_INDEX: 0.5,
} as const;

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class ChatbotSimulatorLogicService {
  /**
   * Calculates the monthly cost for a given model and usage parameters.
   *
   * Formulas:
   * - C_input_nc = (M x Ti x (1 - Cr)) / 1,000,000 x P_input_1m
   * - C_input_c = (M x Ti x Cr) / 1,000,000 x P_cached_1m
   * - C_output = (M x To) / 1,000,000 x P_output_1m
   * - Cost_monthly = (C_input_nc + C_input_c + C_output) x 30
   *
   * @param inputs User-provided simulation parameters
   * @param model LLM model with pricing data
   * @returns Monthly cost rounded to 2 decimal places
   */
  calculateMonthlyCost(inputs: SimulatorInputs, model: LlmModel): number {
    const dailyCosts = this.calculateDailyCosts(inputs, model);
    const monthlyCost = dailyCosts.total * CALCULATION_CONSTANTS.DAYS_PER_MONTH;
    return this.roundToDecimals(monthlyCost, 2);
  }

  /**
   * Calculates the daily cost breakdown for a given model and usage parameters.
   *
   * @param inputs User-provided simulation parameters
   * @param model LLM model with pricing data
   * @returns Daily costs breakdown with all components
   */
  calculateDailyCosts(inputs: SimulatorInputs, model: LlmModel): DailyCostsBreakdown {
    const { messagesPerDay: M, tokensInputPerMessage: Ti, tokensOutputPerMessage: To, cacheHitRate: Cr } = inputs;

    const { pricing } = model;

    // Get cached price with fallback: if 0 or missing, use regular input price
    const cachedInputPrice = this.getCachedInputPrice(pricing);

    // C_input_nc = (M x Ti x (1 - Cr)) / 1,000,000 x P_input_1m
    const inputNonCached =
      (M * Ti * (1 - Cr) * pricing.input_1m) / CALCULATION_CONSTANTS.TOKENS_DIVISOR;

    // C_input_c = (M x Ti x Cr) / 1,000,000 x P_cached_1m
    const inputCached =
      (M * Ti * Cr * cachedInputPrice) / CALCULATION_CONSTANTS.TOKENS_DIVISOR;

    // C_output = (M x To) / 1,000,000 x P_output_1m
    const output =
      (M * To * pricing.output_1m) / CALCULATION_CONSTANTS.TOKENS_DIVISOR;

    const total = inputNonCached + inputCached + output;

    return {
      inputNonCached: this.roundToDecimals(inputNonCached, 2),
      inputCached: this.roundToDecimals(inputCached, 2),
      output: this.roundToDecimals(output, 2),
      total: this.roundToDecimals(total, 2),
    };
  }

  /**
   * Calculates the ValueScore for ranking models.
   *
   * Formula:
   * ValueScore = (1 / Cost_monthly)^ALPHA x log10(ContextWindow)^BETA x LatencyIndex
   *
   * If Cost_monthly = 0, uses EPSILON to prevent division by zero.
   *
   * @param monthlyCost The calculated monthly cost
   * @param model LLM model with capabilities data
   * @returns ValueScore rounded to 4 decimal places
   */
  calculateValueScore(monthlyCost: number, model: LlmModel): number {
    // Get capabilities with fallback defaults
    const contextWindow = this.getContextWindow(model);
    const latencyIndex = this.getLatencyIndex(model);

    // Prevent division by zero
    const safeCost = monthlyCost === 0 ? CALCULATION_CONSTANTS.EPSILON : monthlyCost;

    // ValueScore = (1 / Cost_monthly)^ALPHA x log10(ContextWindow)^BETA x LatencyIndex
    const inverseCostFactor = Math.pow(1 / safeCost, VALUE_SCORE_WEIGHTS.ALPHA);
    const contextFactor = Math.pow(Math.log10(contextWindow), VALUE_SCORE_WEIGHTS.BETA);
    const valueScore = inverseCostFactor * contextFactor * latencyIndex;

    return this.roundToDecimals(valueScore, 4);
  }

  /**
   * Generates a human-readable explanation comparing a model's score to others.
   *
   * @param currentModelId The ID of the model to explain
   * @param allResults All simulation results sorted by valueScore descending
   * @returns Explanation string
   */
  explainScore(currentModelId: string, allResults: SimulatorResult[]): string {
    if (allResults.length === 0) {
      return 'No results available for comparison.';
    }

    // Find the current model and the best model
    const currentResult = allResults.find((r) => r.modelId === currentModelId);
    if (!currentResult) {
      return 'Model not found in results.';
    }

    // Sort by valueScore descending to find the best
    const sortedResults = [...allResults].sort((a, b) => b.valueScore - a.valueScore);
    const bestResult = sortedResults[0];

    // Case 1: This model IS the best
    if (currentModelId === bestResult.modelId) {
      return 'This model is the #1 Best Value choice for your volume.';
    }

    const costDifference = currentResult.monthlyCost - bestResult.monthlyCost;

    // Case 2: Current model costs MORE than the best
    if (costDifference > 0) {
      return `Operating this model costs $${costDifference.toFixed(2)} more/mo than ${bestResult.modelName}. Ensure the Latency/Context justifies the premium.`;
    }

    // Case 3: Current model costs LESS but has lower score
    return `${currentResult.modelName} is cheaper, but ${bestResult.modelName} scores higher due to better Latency Index or Context Window.`;
  }

  /**
   * Runs a full simulation for a single model.
   *
   * @param inputs User-provided simulation parameters
   * @param model LLM model to simulate
   * @param allModels All models (needed for explanation comparison)
   * @returns Complete simulation result
   */
  simulateModel(
    inputs: SimulatorInputs,
    model: LlmModel,
    allModels?: LlmModel[]
  ): SimulatorResult {
    const dailyCosts = this.calculateDailyCosts(inputs, model);
    const monthlyCost = this.roundToDecimals(
      dailyCosts.total * CALCULATION_CONSTANTS.DAYS_PER_MONTH,
      2
    );
    const valueScore = this.calculateValueScore(monthlyCost, model);

    const result: SimulatorResult = {
      modelId: model.id,
      modelName: model.name,
      provider: model.provider,
      dailyCosts,
      monthlyCost,
      valueScore,
      scoreExplanation: '', // Will be filled after all results are computed
      contextWindow: this.getContextWindow(model),
      latencyIndex: this.getLatencyIndex(model),
    };

    return result;
  }

  /**
   * Runs a full simulation for all provided models and generates explanations.
   *
   * @param inputs User-provided simulation parameters
   * @param models Array of LLM models to simulate
   * @returns Array of simulation results sorted by valueScore descending
   */
  simulateAllModels(inputs: SimulatorInputs, models: LlmModel[]): SimulatorResult[] {
    // First pass: calculate all results without explanations
    const results = models.map((model) => this.simulateModel(inputs, model));

    // Sort by valueScore descending
    results.sort((a, b) => b.valueScore - a.valueScore);

    // Second pass: generate explanations now that we have all results
    results.forEach((result) => {
      result.scoreExplanation = this.explainScore(result.modelId, results);
    });

    return results;
  }

  /**
   * Finds the best value model from simulation results.
   *
   * @param results Array of simulation results
   * @returns The result with the highest valueScore, or null if empty
   */
  findBestValue(results: SimulatorResult[]): SimulatorResult | null {
    if (results.length === 0) {
      return null;
    }
    return results.reduce((best, current) =>
      current.valueScore > best.valueScore ? current : best
    );
  }

  /**
   * Calculates Aggressive Comparison metrics for marketing.
   * Compares Winner (🥇) vs Runner-Up (🥈) per spec section 3.1.
   *
   * Formulas:
   * - Savings% = (Cost_runnerUp - Cost_winner) / Cost_runnerUp × 100
   * - Context_multiplier = Context_winner / Context_runnerUp
   *
   * @param results Sorted simulation results (best first)
   * @returns AggressiveComparison metrics or null if < 2 results
   */
  calculateAggressiveComparison(results: SimulatorResult[]): AggressiveComparison | null {
    if (results.length < 2) {
      return null;
    }

    const winner = results[0];
    const runnerUp = results[1];

    // Savings% = (Cost_runnerUp - Cost_winner) / Cost_runnerUp × 100
    const monthlySavings = runnerUp.monthlyCost - winner.monthlyCost;
    const savingsPercent = runnerUp.monthlyCost > 0
      ? this.roundToDecimals((monthlySavings / runnerUp.monthlyCost) * 100, 1)
      : 0;

    // Context_multiplier = Context_winner / Context_runnerUp
    const contextMultiplier = runnerUp.contextWindow > 0
      ? this.roundToDecimals(winner.contextWindow / runnerUp.contextWindow, 1)
      : 1;

    // Generate narrations
    const savingsNarration = savingsPercent > 0
      ? `Switching to ${winner.modelName} saves you ${savingsPercent}% monthly compared to ${runnerUp.modelName}.`
      : `${winner.modelName} costs ${Math.abs(savingsPercent)}% more than ${runnerUp.modelName}, but delivers superior value.`;

    // Only show context narration if winner has more context (multiplier > 1.0)
    const contextNarration = contextMultiplier > 1.0
      ? `${winner.modelName} offers ${contextMultiplier}x more context memory than ${runnerUp.modelName}.`
      : null;

    return {
      winnerName: winner.modelName,
      runnerUpName: runnerUp.modelName,
      savingsPercent,
      contextMultiplier,
      savingsNarration,
      contextNarration,
      monthlySavings: this.roundToDecimals(monthlySavings, 2),
    };
  }

  /**
   * Calculates Sensitivity Analysis for traffic scaling projections.
   * Shows how costs scale when traffic doubles (2x) or triples (3x).
   * Per spec section 6.1 - used in PDF Technical Report.
   *
   * @param inputs Current simulation parameters
   * @param model LLM model to analyze
   * @returns SensitivityAnalysis with cost projections at 1x, 2x, 3x traffic
   */
  calculateSensitivityAnalysis(inputs: SimulatorInputs, model: LlmModel): SensitivityAnalysis {
    // Calculate cost at current traffic (1x)
    const cost1x = this.calculateMonthlyCost(inputs, model);

    // Calculate cost at 2x traffic
    const inputs2x: SimulatorInputs = {
      ...inputs,
      messagesPerDay: inputs.messagesPerDay * 2,
    };
    const cost2x = this.calculateMonthlyCost(inputs2x, model);

    // Calculate cost at 3x traffic
    const inputs3x: SimulatorInputs = {
      ...inputs,
      messagesPerDay: inputs.messagesPerDay * 3,
    };
    const cost3x = this.calculateMonthlyCost(inputs3x, model);

    // Annual projections (12 months)
    const annualCost1x = this.roundToDecimals(cost1x * 12, 2);
    const annualCost2x = this.roundToDecimals(cost2x * 12, 2);
    const annualCost3x = this.roundToDecimals(cost3x * 12, 2);

    return {
      modelId: model.id,
      modelName: model.name,
      cost1x,
      cost2x,
      cost3x,
      annualCost1x,
      annualCost2x,
      annualCost3x,
    };
  }

  /**
   * Calculates Sensitivity Analysis for multiple models.
   *
   * @param inputs Current simulation parameters
   * @param models Array of LLM models to analyze
   * @returns Array of SensitivityAnalysis results
   */
  calculateAllSensitivityAnalysis(inputs: SimulatorInputs, models: LlmModel[]): SensitivityAnalysis[] {
    return models.map((model) => this.calculateSensitivityAnalysis(inputs, model));
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Gets the cached input price with fallback logic.
   * If cached_input_1m is 0, undefined, or null, returns the regular input price.
   */
  private getCachedInputPrice(pricing: ModelPricing): number {
    const cachedPrice = pricing.cached_input_1m;
    if (cachedPrice === undefined || cachedPrice === null || cachedPrice === 0) {
      return pricing.input_1m;
    }
    return cachedPrice;
  }

  /**
   * Gets the context window with fallback to default value.
   */
  private getContextWindow(model: LlmModel): number {
    const contextWindow = model.capabilities?.context_window;
    if (contextWindow === undefined || contextWindow === null || contextWindow <= 0) {
      return DEFAULT_CAPABILITIES.CONTEXT_WINDOW;
    }
    return contextWindow;
  }

  /**
   * Gets the latency index with fallback to default value.
   */
  private getLatencyIndex(model: LlmModel): number {
    const latencyIndex = model.capabilities?.latency_index;
    if (latencyIndex === undefined || latencyIndex === null || latencyIndex <= 0) {
      return DEFAULT_CAPABILITIES.LATENCY_INDEX;
    }
    return latencyIndex;
  }

  /**
   * Rounds a number to the specified number of decimal places.
   */
  private roundToDecimals(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
