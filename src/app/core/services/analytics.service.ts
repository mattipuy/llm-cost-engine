import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MarketInsightsService } from './market-insights.service';
import { classifySegment, SimulationDataPoint } from '../models/market-insight.model';

/**
 * LLM Cost Engine v1.0 - Analytics Service
 *
 * Privacy-First Data Intelligence:
 * - No IP tracking
 * - No User Agent collection
 * - Only aggregated, anonymous simulation results
 *
 * Purpose: "The Reddit Report" - aggregate consensus data for
 * future analysis like "Who wins in 2026: Gemini vs GPT-4o?"
 */

/**
 * Payload for simulation_consensus event.
 * Minimal, anonymous data for aggregate analysis.
 */
export interface SimulationConsensusEvent {
  /** Winning model ID (e.g., "gemini-1.5-pro") */
  winner_id: string;
  /** Volume tier for segmentation ("startup" | "scaleup" | "enterprise") */
  scenario_volume: string;
  /** Gap percentage between winner and runner-up */
  competitor_gap_percent: number;
  /** Timestamp (ISO string, no timezone for privacy) */
  timestamp: string;
  /** Cache hit rate (0-1), indicates technical sophistication */
  cache_rate: number;
  /** Input/output token ratio (tokensInput / tokensOutput) */
  input_output_ratio: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private marketInsights = inject(MarketInsightsService);

  // Debounce state
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_MS = 2000; // 2 seconds per Architect spec

  // Batch sync configuration
  private readonly BATCH_SIZE = 10; // Sync after N events
  private pendingSync: SimulationDataPoint[] = [];

  // Prevent duplicate events for same state
  private lastEventHash: string | null = null;

  /**
   * Tracks simulation consensus with 2-second debounce.
   * Only fires after user stops interacting with sliders.
   *
   * Privacy guarantees:
   * - No IP collection
   * - No User Agent
   * - No cookies or persistent identifiers
   * - Only aggregate-friendly data
   *
   * @param winnerId The winning model ID
   * @param messagesPerDay Current volume for tier classification
   * @param gapPercent Percentage gap vs runner-up
   * @param cacheRate Cache hit rate (0-1), defaults to 0
   * @param inputOutputRatio Token input/output ratio, defaults to 1.0
   */
  trackSimulationConsensus(
    winnerId: string,
    messagesPerDay: number,
    gapPercent: number,
    cacheRate: number = 0,
    inputOutputRatio: number = 1.0
  ): void {
    // Only track in browser (not during SSR)
    if (!isPlatformBrowser(this.platformId)) return;

    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounce timer (2 seconds)
    this.debounceTimer = setTimeout(() => {
      this.fireConsensusEvent(winnerId, messagesPerDay, gapPercent, cacheRate, inputOutputRatio);
    }, this.DEBOUNCE_MS);
  }

  /**
   * Actually fires the consensus event after debounce.
   */
  private fireConsensusEvent(
    winnerId: string,
    messagesPerDay: number,
    gapPercent: number,
    cacheRate: number,
    inputOutputRatio: number
  ): void {
    // Create event hash to prevent duplicate fires
    const eventHash = `${winnerId}-${messagesPerDay}-${gapPercent.toFixed(1)}-${cacheRate.toFixed(2)}-${inputOutputRatio.toFixed(2)}`;
    if (eventHash === this.lastEventHash) {
      return; // Skip duplicate
    }
    this.lastEventHash = eventHash;

    const timestamp = new Date().toISOString().split('T')[0];
    const segment = classifySegment(messagesPerDay);

    const event: SimulationConsensusEvent = {
      winner_id: winnerId,
      scenario_volume: segment,
      competitor_gap_percent: Math.round(gapPercent * 10) / 10,
      timestamp,
      cache_rate: Math.round(cacheRate * 100) / 100,
      input_output_ratio: Math.round(inputOutputRatio * 100) / 100
    };

    // Record to MarketInsightsService for local aggregation
    this.marketInsights.recordSimulation(messagesPerDay, winnerId, gapPercent, cacheRate, inputOutputRatio);

    // Add to pending sync batch
    const dataPoint: SimulationDataPoint = {
      timestamp,
      segment,
      winner_id: winnerId,
      value_score_gap: Math.round(gapPercent * 10) / 10,
      cache_rate: Math.round(cacheRate * 100) / 100,
      input_output_ratio: Math.round(inputOutputRatio * 100) / 100
    };
    this.pendingSync.push(dataPoint);

    // Log to console in development
    if (typeof window !== 'undefined') {
      console.log('[Analytics] simulation_consensus:', event);

      // Batch sync to API when threshold reached
      if (this.pendingSync.length >= this.BATCH_SIZE) {
        this.syncToApi();
      }
    }
  }

  /**
   * Syncs pending data points to the API endpoint.
   * Uses sendBeacon for reliable delivery during page unload.
   */
  private syncToApi(): void {
    if (this.pendingSync.length === 0) return;

    const payload = JSON.stringify(this.pendingSync);
    const endpoint = '/api/insights';

    // Use sendBeacon for reliable delivery (doesn't block navigation)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const success = navigator.sendBeacon(endpoint, blob);
      if (success) {
        console.log(`📤 [Analytics] Synced ${this.pendingSync.length} data points to API`);
        this.pendingSync = [];
      }
    } else if (typeof fetch !== 'undefined') {
      // Fallback for environments without sendBeacon
      fetch(endpoint, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      })
        .then(() => {
          console.log(`📤 [Analytics] Synced ${this.pendingSync.length} data points to API`);
          this.pendingSync = [];
        })
        .catch(() => {
          // Silent fail - analytics should never break UX
          console.warn('📤 [Analytics] Sync failed, will retry');
        });
    }
  }

  /**
   * Forces immediate sync of pending events.
   * Call before page unload or component destroy.
   */
  flushPendingEvents(): void {
    if (this.pendingSync.length > 0) {
      this.syncToApi();
    }
  }

  /**
   * Cancels any pending debounced event.
   * Call on component destroy to prevent memory leaks.
   */
  cancelPendingEvents(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    // Flush any remaining events before cleanup
    this.flushPendingEvents();
  }

  /**
   * Gets the MarketInsightsService for direct access to aggregated data.
   * Useful for displaying insights in the UI.
   */
  getMarketInsights(): MarketInsightsService {
    return this.marketInsights;
  }

  // ==================== Vercel Analytics Integration ====================

  /**
   * Tracks custom event in Vercel Analytics.
   * Safe to call even if Vercel Analytics is not loaded (graceful degradation).
   *
   * Note: Vercel Analytics auto-tracks pageviews. Custom events are tracked via window.va().
   *
   * @param eventName Event name (e.g., "Email Signup", "PDF Export")
   * @param props Optional event properties (values must be strings or numbers)
   */
  trackEvent(eventName: string, props?: Record<string, string | number>): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Vercel Analytics custom events
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', eventName, props);
    }
  }

  /**
   * Tracks email signup for price alerts.
   * Goal: Measure conversion rate for email capture CTA.
   *
   * @param modelId Model ID user subscribed to (e.g., "gpt-4o")
   * @param source Where signup originated ("model-card-bell" | "banner-cta" | "other")
   */
  trackEmailSignup(modelId: string, source: string = 'model-card-bell'): void {
    this.trackEvent('Email Signup', { model: modelId, source });
  }

  /**
   * Tracks PDF export (Enterprise Analysis feature).
   * Goal: Understand which tools drive PDF downloads.
   *
   * @param toolName Tool name ("chatbot-simulator" | "batch-api" | "caching-roi" | "context-window")
   * @param modelCount Number of models in comparison (1-15)
   */
  trackPdfExport(toolName: string, modelCount: number): void {
    this.trackEvent('PDF Export', { tool: toolName, models: modelCount.toString() });
  }

  /**
   * Tracks tool usage (when user interacts with a calculator).
   * Goal: Understand which tools are most popular.
   *
   * @param toolName Tool name
   */
  trackToolUsage(toolName: string): void {
    this.trackEvent('Tool Usage', { tool: toolName });
  }

  /**
   * Tracks page view for SPA navigation.
   * Vercel Analytics auto-tracks pageviews, so this is optional for SPA route changes.
   *
   * @param path Page path (e.g., "/models/gpt-4o")
   */
  trackPageView(path?: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Vercel Analytics auto-tracks pageviews, but you can manually track if needed
    if (typeof window !== 'undefined' && (window as any).va && path) {
      (window as any).va('pageview', { path });
    }
  }
}
