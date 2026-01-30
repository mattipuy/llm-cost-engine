/**
 * LLM Cost Engine v1.0 - Parametric Weights Configuration
 *
 * These weights control the ValueScore calculation formula:
 * ValueScore = (1/Cost)^ALPHA × log10(Context)^BETA × LatencyIndex
 *
 * Rationale:
 * - ALPHA (0.65): Cost efficiency is the primary driver for ROI decisions
 * - BETA (0.35): Context capacity provides diminishing returns at scale
 *
 * These values are intentionally exposed for transparency and future A/B testing.
 */

/**
 * Weight for inverse cost factor in ValueScore calculation.
 * Higher values = cost matters more in the final score.
 */
export const VALUESCORE_ALPHA = 0.65;

/**
 * Weight for context window factor in ValueScore calculation.
 * Higher values = context capacity matters more in the final score.
 */
export const VALUESCORE_BETA = 0.35;

/**
 * Human-readable descriptions for transparency section.
 */
export const WEIGHT_DESCRIPTIONS = {
  costEfficiency: {
    weight: VALUESCORE_ALPHA,
    percentage: Math.round(VALUESCORE_ALPHA * 100),
    label: 'cost efficiency'
  },
  contextCapacity: {
    weight: VALUESCORE_BETA,
    percentage: Math.round(VALUESCORE_BETA * 100),
    label: 'contextual capacity'
  }
} as const;

/**
 * Engine metadata for branding.
 */
export const ENGINE_META = {
  name: 'LLM Cost Engine',
  version: '1.0',
  fullName: 'LLM Cost Engine v1.0'
} as const;
