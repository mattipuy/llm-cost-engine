import { Injectable } from '@angular/core';
import { LlmModel } from '../chatbot-simulator/logic.service';

// ============================================================================
// INTERFACES
// ============================================================================

export interface BatchApiInputs {
  records: number;
  avgInputTokens: number;
  avgOutputTokens: number;
}

export interface BatchApiResult {
  /** Total cost using real-time API */
  costRealTime: number;
  /** Total cost using Batch API */
  costBatch: number;
  /** Absolute savings (costRealTime - costBatch) */
  savings: number;
  /** Savings as percentage */
  savingsPercent: number;
  /** Cost per individual record (batch) */
  costPerRecord: number;
  /** Cost per individual record (real-time) */
  costPerRecordRealTime: number;
  /** Batch discount percentage derived from pricing data */
  batchDiscount: number;
  /** Total input tokens processed */
  totalInputTokens: number;
  /** Total output tokens processed */
  totalOutputTokens: number;
  /** Whether savings are negligible (< $0.01) */
  isTrivialSavings: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TOKENS_DIVISOR = 1_000_000;
const TRIVIAL_THRESHOLD = 0.01;

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class BatchApiLogicService {
  /**
   * Calculates batch vs real-time cost comparison for a given model.
   */
  calculate(inputs: BatchApiInputs, model: LlmModel): BatchApiResult {
    const P_input = model.pricing.input_1m / TOKENS_DIVISOR;
    const P_output = model.pricing.output_1m / TOKENS_DIVISOR;
    const P_batch_input = (model.pricing.batch_input_1m ?? model.pricing.input_1m) / TOKENS_DIVISOR;
    const P_batch_output = (model.pricing.batch_output_1m ?? model.pricing.output_1m) / TOKENS_DIVISOR;

    const totalInputTokens = inputs.records * inputs.avgInputTokens;
    const totalOutputTokens = inputs.records * inputs.avgOutputTokens;

    const costRealTime =
      totalInputTokens * P_input + totalOutputTokens * P_output;
    const costBatch =
      totalInputTokens * P_batch_input + totalOutputTokens * P_batch_output;

    const savings = costRealTime - costBatch;
    const savingsPercent = costRealTime > 0 ? (savings / costRealTime) * 100 : 0;

    const costPerRecord = inputs.records > 0 ? costBatch / inputs.records : 0;
    const costPerRecordRealTime = inputs.records > 0 ? costRealTime / inputs.records : 0;

    // Derive batch discount from pricing data (input-side)
    const batchDiscount =
      model.pricing.input_1m > 0
        ? (1 - (model.pricing.batch_input_1m ?? model.pricing.input_1m) / model.pricing.input_1m) * 100
        : 0;

    return {
      costRealTime: this.round(costRealTime),
      costBatch: this.round(costBatch),
      savings: this.round(savings),
      savingsPercent: this.round(savingsPercent, 1),
      costPerRecord: this.round(costPerRecord, 6),
      costPerRecordRealTime: this.round(costPerRecordRealTime, 6),
      batchDiscount: this.round(batchDiscount, 0),
      totalInputTokens,
      totalOutputTokens,
      isTrivialSavings: savings < TRIVIAL_THRESHOLD,
    };
  }

  /**
   * Filters models that support Batch API (have batch_input_1m defined and > 0).
   */
  filterBatchModels(models: LlmModel[]): LlmModel[] {
    return models.filter(
      (m) => m.pricing.batch_input_1m != null && m.pricing.batch_input_1m > 0,
    );
  }

  private round(value: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
