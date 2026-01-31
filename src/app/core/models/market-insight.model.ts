/**
 * LLM Cost Engine v1.0 - Market Insight Data Models
 *
 * Privacy-First Aggregated Data Structures:
 * - No user identifiers
 * - No IP addresses
 * - No session tracking
 * - Only aggregate-friendly metrics
 */

/**
 * Market segments based on messages/day volume.
 * Aligned with typical business stages.
 */
export type MarketSegment = 'startup' | 'scaleup' | 'enterprise';

/**
 * Segment thresholds (messages/day).
 */
export const SEGMENT_THRESHOLDS = {
  startup: { min: 0, max: 4999, label: 'Startup', description: '< 5K messages/day' },
  scaleup: { min: 5000, max: 49999, label: 'Scaleup', description: '5K - 50K messages/day' },
  enterprise: { min: 50000, max: Infinity, label: 'Enterprise', description: '> 50K messages/day' }
} as const;

/**
 * Technical sophistication classification based on cache rate.
 * Indicates the maturity of caching implementation.
 */
export type TechnicalSophistication = 'basic' | 'intermediate' | 'advanced';

/**
 * Workload type classification based on input/output token ratio.
 * Indicates the nature of the LLM use case.
 */
export type WorkloadType = 'creative' | 'balanced' | 'rag_analysis';

/**
 * Single simulation data point (privacy-safe).
 * Contains ONLY aggregate-friendly fields.
 */
export interface SimulationDataPoint {
  /** Date only (YYYY-MM-DD), no time for privacy */
  timestamp: string;
  /** Market segment classification */
  segment: MarketSegment;
  /** Winning model ID */
  winner_id: string;
  /** ValueScore gap vs runner-up (percentage) */
  value_score_gap: number;
  /** Cache hit rate (0-1), indicates technical sophistication */
  cache_rate: number;
  /** Input/output token ratio (tokensInput / tokensOutput) */
  input_output_ratio: number;
}

/**
 * Aggregated segment statistics.
 * Ready for public "Reddit Report" consumption.
 */
export interface SegmentInsight {
  /** Segment identifier */
  segment: MarketSegment;
  /** Human-readable segment name */
  segmentLabel: string;
  /** Total simulations in this segment */
  totalSimulations: number;
  /** Most frequently winning model */
  topWinner: {
    modelId: string;
    winCount: number;
    winPercentage: number;
  };
  /** Average ValueScore gap in this segment */
  averageGap: number;
  /** Median ValueScore gap */
  medianGap: number;
  /** Winner distribution */
  winnerDistribution: Record<string, number>;
}

/**
 * Complete market report structure.
 * The "Reddit Report" data payload.
 */
export interface MarketReport {
  /** Report generation timestamp */
  generatedAt: string;
  /** Reporting period */
  period: {
    start: string;
    end: string;
  };
  /** Total simulations across all segments */
  totalSimulations: number;
  /** Per-segment insights */
  segments: SegmentInsight[];
  /** Global winner (most wins overall) */
  globalWinner: {
    modelId: string;
    totalWins: number;
    winPercentage: number;
  };
  /** Average savings estimate across all segments */
  averageSavingsPercent: number;
}

/**
 * Classifies messages/day into market segment.
 */
export function classifySegment(messagesPerDay: number): MarketSegment {
  if (messagesPerDay < 5000) return 'startup';
  if (messagesPerDay < 50000) return 'scaleup';
  return 'enterprise';
}

/**
 * Gets segment metadata.
 */
export function getSegmentInfo(segment: MarketSegment): typeof SEGMENT_THRESHOLDS[MarketSegment] {
  return SEGMENT_THRESHOLDS[segment];
}

/**
 * Classifies technical sophistication based on cache rate.
 * - basic: No caching implemented (0%)
 * - intermediate: Partial caching (1-40%)
 * - advanced: Mature caching strategy (> 40%)
 */
export function classifySophistication(cacheRate: number): TechnicalSophistication {
  if (cacheRate <= 0) return 'basic';
  if (cacheRate <= 0.4) return 'intermediate';
  return 'advanced';
}

/**
 * Classifies workload type based on input/output token ratio.
 * - creative: Output-heavy workloads (ratio < 0.5)
 * - balanced: Equal input/output (ratio 0.5 - 1.0)
 * - rag_analysis: Input-heavy RAG/analysis workloads (ratio > 1.0)
 */
export function classifyWorkloadType(inputOutputRatio: number): WorkloadType {
  if (inputOutputRatio < 0.5) return 'creative';
  if (inputOutputRatio <= 1.0) return 'balanced';
  return 'rag_analysis';
}
