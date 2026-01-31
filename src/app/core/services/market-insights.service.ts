import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  MarketSegment,
  SimulationDataPoint,
  SegmentInsight,
  MarketReport,
  SEGMENT_THRESHOLDS,
  classifySegment,
  TechnicalSophistication,
  WorkloadType,
  classifySophistication,
  classifyWorkloadType
} from '../models/market-insight.model';

/**
 * LLM Cost Engine v1.0 - Market Insights Service
 *
 * Aggregated Market Intelligence:
 * - Collects anonymous simulation data
 * - Groups by market segment (Startup/Growth/Enterprise)
 * - Provides statistical insights for "The Reddit Report"
 *
 * Privacy Guarantees:
 * - No user identifiers stored
 * - No IP addresses
 * - No session tracking
 * - Date-only timestamps (no time precision)
 * - All data is aggregate-ready
 */

@Injectable({
  providedIn: 'root'
})
export class MarketInsightsService {
  private platformId = inject(PLATFORM_ID);

  /**
   * In-memory store for simulation data points.
   * In production, this would be backed by a database/API.
   */
  private dataPoints: SimulationDataPoint[] = [];

  /**
   * Maximum data points to keep in memory (rolling window).
   * Prevents memory bloat in long sessions.
   */
  private readonly MAX_DATA_POINTS = 1000;

  /**
   * Records a simulation result (privacy-safe).
   *
   * @param messagesPerDay Volume for segment classification
   * @param winnerId Winning model ID
   * @param valueScoreGap Gap percentage vs runner-up
   * @param cacheRate Cache hit rate (0-1), defaults to 0
   * @param inputOutputRatio Token input/output ratio, defaults to 1.0
   */
  recordSimulation(
    messagesPerDay: number,
    winnerId: string,
    valueScoreGap: number,
    cacheRate: number = 0,
    inputOutputRatio: number = 1.0
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const dataPoint: SimulationDataPoint = {
      timestamp: this.getPrivacySafeTimestamp(),
      segment: classifySegment(messagesPerDay),
      winner_id: winnerId,
      value_score_gap: Math.round(valueScoreGap * 10) / 10, // 1 decimal precision
      cache_rate: Math.round(cacheRate * 100) / 100, // 2 decimal precision
      input_output_ratio: Math.round(inputOutputRatio * 100) / 100 // 2 decimal precision
    };

    this.dataPoints.push(dataPoint);

    // Rolling window: remove oldest if over limit
    if (this.dataPoints.length > this.MAX_DATA_POINTS) {
      this.dataPoints.shift();
    }

    // Log for development
    console.log('[MarketInsights] Recorded:', dataPoint);
  }

  /**
   * Gets the technical sophistication classification for a cache rate.
   */
  getSophisticationLevel(cacheRate: number): TechnicalSophistication {
    return classifySophistication(cacheRate);
  }

  /**
   * Gets the workload type classification for an input/output ratio.
   */
  getWorkloadType(inputOutputRatio: number): WorkloadType {
    return classifyWorkloadType(inputOutputRatio);
  }

  /**
   * Gets insights for a specific market segment.
   */
  getSegmentInsight(segment: MarketSegment): SegmentInsight {
    const segmentData = this.dataPoints.filter(dp => dp.segment === segment);
    return this.calculateSegmentInsight(segment, segmentData);
  }

  /**
   * Gets insights for all segments.
   */
  getAllSegmentInsights(): SegmentInsight[] {
    const segments: MarketSegment[] = ['startup', 'scaleup', 'enterprise'];
    return segments.map(segment => this.getSegmentInsight(segment));
  }

  /**
   * Generates a complete market report.
   * This is the "Reddit Report" payload.
   */
  generateMarketReport(): MarketReport {
    const segments = this.getAllSegmentInsights();
    const allDataPoints = this.dataPoints;

    // Calculate global winner
    const globalWinnerDistribution = this.calculateWinnerDistribution(allDataPoints);
    const globalWinner = this.findTopWinner(globalWinnerDistribution, allDataPoints.length);

    // Calculate average savings across all segments
    const averageSavings = allDataPoints.length > 0
      ? allDataPoints.reduce((sum, dp) => sum + dp.value_score_gap, 0) / allDataPoints.length
      : 0;

    // Determine period from data
    const timestamps = allDataPoints.map(dp => dp.timestamp).sort();
    const periodStart = timestamps[0] || this.getPrivacySafeTimestamp();
    const periodEnd = timestamps[timestamps.length - 1] || this.getPrivacySafeTimestamp();

    return {
      generatedAt: new Date().toISOString(),
      period: {
        start: periodStart,
        end: periodEnd
      },
      totalSimulations: allDataPoints.length,
      segments,
      globalWinner: {
        modelId: globalWinner.modelId,
        totalWins: globalWinner.winCount,
        winPercentage: globalWinner.winPercentage
      },
      averageSavingsPercent: Math.round(averageSavings * 10) / 10
    };
  }

  /**
   * Gets average estimated savings for a segment.
   * Key metric for stakeholder reports.
   *
   * @example
   * const savings = service.getAverageSavings('enterprise');
   * // Returns: { segment: 'Enterprise', averageSavings: 42.3, sampleSize: 150 }
   */
  getAverageSavings(segment: MarketSegment): {
    segment: string;
    averageSavings: number;
    sampleSize: number;
  } {
    const segmentData = this.dataPoints.filter(dp => dp.segment === segment);
    const segmentInfo = SEGMENT_THRESHOLDS[segment];

    if (segmentData.length === 0) {
      return {
        segment: segmentInfo.label,
        averageSavings: 0,
        sampleSize: 0
      };
    }

    const totalGap = segmentData.reduce((sum, dp) => sum + dp.value_score_gap, 0);
    const averageSavings = totalGap / segmentData.length;

    return {
      segment: segmentInfo.label,
      averageSavings: Math.round(averageSavings * 10) / 10,
      sampleSize: segmentData.length
    };
  }

  /**
   * Gets winner distribution by segment.
   * Useful for "Who wins in segment X?" analysis.
   */
  getWinnersBySegment(segment: MarketSegment): {
    segment: string;
    winners: Array<{ modelId: string; wins: number; percentage: number }>;
  } {
    const segmentData = this.dataPoints.filter(dp => dp.segment === segment);
    const segmentInfo = SEGMENT_THRESHOLDS[segment];
    const distribution = this.calculateWinnerDistribution(segmentData);

    const winners = Object.entries(distribution)
      .map(([modelId, wins]) => ({
        modelId,
        wins,
        percentage: segmentData.length > 0
          ? Math.round((wins / segmentData.length) * 1000) / 10
          : 0
      }))
      .sort((a, b) => b.wins - a.wins);

    return {
      segment: segmentInfo.label,
      winners
    };
  }

  /**
   * Exports all data points for backend sync.
   * Call this before sending to analytics endpoint.
   */
  exportDataPoints(): SimulationDataPoint[] {
    return [...this.dataPoints];
  }

  /**
   * Imports data points (for hydration from backend).
   */
  importDataPoints(dataPoints: SimulationDataPoint[]): void {
    this.dataPoints = dataPoints.slice(-this.MAX_DATA_POINTS);
  }

  /**
   * Clears all stored data.
   */
  clearData(): void {
    this.dataPoints = [];
  }

  /**
   * Gets current data point count.
   */
  getDataPointCount(): number {
    return this.dataPoints.length;
  }

  // ─────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────

  /**
   * Calculates insight statistics for a segment.
   */
  private calculateSegmentInsight(
    segment: MarketSegment,
    dataPoints: SimulationDataPoint[]
  ): SegmentInsight {
    const segmentInfo = SEGMENT_THRESHOLDS[segment];
    const winnerDistribution = this.calculateWinnerDistribution(dataPoints);
    const topWinner = this.findTopWinner(winnerDistribution, dataPoints.length);

    // Calculate gap statistics
    const gaps = dataPoints.map(dp => dp.value_score_gap).sort((a, b) => a - b);
    const averageGap = gaps.length > 0
      ? gaps.reduce((sum, g) => sum + g, 0) / gaps.length
      : 0;
    // Correct median calculation for both odd and even array lengths
    const medianGap = gaps.length > 0
      ? gaps.length % 2 === 1
        ? gaps[Math.floor(gaps.length / 2)]
        : (gaps[Math.floor(gaps.length / 2) - 1] + gaps[Math.floor(gaps.length / 2)]) / 2
      : 0;

    return {
      segment,
      segmentLabel: segmentInfo.label,
      totalSimulations: dataPoints.length,
      topWinner,
      averageGap: Math.round(averageGap * 10) / 10,
      medianGap: Math.round(medianGap * 10) / 10,
      winnerDistribution
    };
  }

  /**
   * Calculates winner distribution from data points.
   */
  private calculateWinnerDistribution(
    dataPoints: SimulationDataPoint[]
  ): Record<string, number> {
    return dataPoints.reduce((acc, dp) => {
      acc[dp.winner_id] = (acc[dp.winner_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Finds the top winner from distribution.
   */
  private findTopWinner(
    distribution: Record<string, number>,
    totalCount: number
  ): { modelId: string; winCount: number; winPercentage: number } {
    const entries = Object.entries(distribution);

    if (entries.length === 0) {
      return { modelId: 'N/A', winCount: 0, winPercentage: 0 };
    }

    const [topModelId, topWinCount] = entries.reduce(
      (max, current) => current[1] > max[1] ? current : max
    );

    return {
      modelId: topModelId,
      winCount: topWinCount,
      winPercentage: totalCount > 0
        ? Math.round((topWinCount / totalCount) * 1000) / 10
        : 0
    };
  }

  /**
   * Returns privacy-safe timestamp (date only, no time).
   */
  private getPrivacySafeTimestamp(): string {
    return new Date().toISOString().split('T')[0];
  }
}
