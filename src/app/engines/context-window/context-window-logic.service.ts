import { Injectable } from '@angular/core';
import { LlmModel } from '../chatbot-simulator/logic.service';

// ============================================================================
// INTERFACES
// ============================================================================

export type ContentUnit = 'tokens' | 'words' | 'pages';
export type SortMode = 'price' | 'size';

export interface ContextWindowResult {
  modelId: string;
  modelName: string;
  provider: string;
  contextWindow: number;
  /** Whether the model can handle the user's input */
  isValid: boolean;
  /** Percentage of context used (can exceed 100 for overflow) */
  usagePercent: number;
  /** Tokens that don't fit (0 if valid) */
  overflowTokens: number;
  /** Cost to process this specific input once */
  inputCost: number;
  /** Raw price per 1M input tokens */
  pricePerMillion: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TOKENS_PER_WORD = 1.33;
const WORDS_PER_PAGE = 500;
const TOKENS_PER_PAGE = TOKENS_PER_WORD * WORDS_PER_PAGE; // 665
const TOKENS_DIVISOR = 1_000_000;

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class ContextWindowLogicService {
  /**
   * Converts user input to normalized token count.
   */
  normalizeToTokens(size: number, unit: ContentUnit): number {
    switch (unit) {
      case 'words':
        return Math.round(size * TOKENS_PER_WORD);
      case 'pages':
        return Math.round(size * TOKENS_PER_PAGE);
      default:
        return size;
    }
  }

  /**
   * Analyzes all models against the user's content size.
   */
  analyze(models: LlmModel[], tokenCount: number): ContextWindowResult[] {
    return models.map((model) => {
      const contextWindow = model.capabilities.context_window ?? 0;
      const isValid = contextWindow >= tokenCount;
      const usagePercent =
        contextWindow > 0 ? (tokenCount / contextWindow) * 100 : Infinity;
      const overflowTokens = isValid ? 0 : tokenCount - contextWindow;
      const inputCost = (tokenCount / TOKENS_DIVISOR) * model.pricing.input_1m;

      return {
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        contextWindow,
        isValid,
        usagePercent: Math.round(usagePercent * 10) / 10,
        overflowTokens,
        inputCost: Math.round(inputCost * 10000) / 10000,
        pricePerMillion: model.pricing.input_1m,
      };
    });
  }

  /**
   * Sorts results by the chosen mode.
   * - 'price': valid models first (by inputCost ASC), then invalid (by contextWindow DESC)
   * - 'size': by contextWindow DESC
   */
  sort(results: ContextWindowResult[], mode: SortMode): ContextWindowResult[] {
    const sorted = [...results];

    if (mode === 'size') {
      sorted.sort((a, b) => b.contextWindow - a.contextWindow);
    } else {
      // Price mode: valid first sorted by cost, then invalid sorted by context (biggest first)
      sorted.sort((a, b) => {
        if (a.isValid && !b.isValid) return -1;
        if (!a.isValid && b.isValid) return 1;
        if (a.isValid && b.isValid) return a.inputCost - b.inputCost;
        return b.contextWindow - a.contextWindow;
      });
    }

    return sorted;
  }

  /**
   * Returns the maximum context window across all models (for bar normalization).
   */
  getMaxContext(models: LlmModel[]): number {
    return models.reduce(
      (max, m) => Math.max(max, m.capabilities.context_window ?? 0),
      0,
    );
  }
}
