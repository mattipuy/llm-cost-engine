import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

/**
 * Price snapshot for a single model at a point in time.
 */
export interface ModelPriceSnapshot {
  id: string;
  provider: string;
  input_1m: number;
  output_1m: number;
  cached_1m: number;
}

/**
 * Full snapshot of all model prices at a specific date.
 */
export interface PriceSnapshot {
  date: string;
  models: ModelPriceSnapshot[];
}

/**
 * Price change event for tracking when providers update pricing.
 */
export interface PriceChange {
  date: string;
  model_id: string;
  provider: string;
  field: 'input_1m' | 'output_1m' | 'cached_1m';
  old_value: number;
  new_value: number;
  change_percent: number;
}

/**
 * Full price history data structure.
 */
export interface PriceHistoryData {
  metadata: {
    version: string;
    description: string;
    first_snapshot: string;
    last_snapshot: string;
    snapshot_frequency: string;
    data_retention: string;
  };
  snapshots: PriceSnapshot[];
  price_changes: PriceChange[];
}

/**
 * Price trend analysis result.
 */
export interface PriceTrend {
  model_id: string;
  provider: string;
  current_input: number;
  current_output: number;
  trend_direction: 'up' | 'down' | 'stable';
  change_30d_percent: number | null;
  change_90d_percent: number | null;
}

/**
 * Service for loading and analyzing historical LLM pricing data.
 *
 * This service provides the foundation for:
 * - Price trend visualization
 * - Provider pricing comparison over time
 * - Price change alerts
 * - Market intelligence reports
 *
 * Data Moat Strategy: Accumulating weekly snapshots creates
 * unique historical data that competitors cannot replicate.
 */
@Injectable({
  providedIn: 'root'
})
export class PriceHistoryService {
  private http = inject(HttpClient);

  // Cache the data to avoid multiple HTTP requests
  private cachedData$: Observable<PriceHistoryData> | null = null;

  /**
   * Loads the price history data from JSON.
   * Results are cached for the session.
   */
  loadPriceHistory(): Observable<PriceHistoryData> {
    if (!this.cachedData$) {
      this.cachedData$ = this.http.get<PriceHistoryData>('/data/price-history.json').pipe(
        shareReplay(1)
      );
    }
    return this.cachedData$;
  }

  /**
   * Gets the latest price snapshot.
   */
  getLatestSnapshot(): Observable<PriceSnapshot | null> {
    return this.loadPriceHistory().pipe(
      map(data => data.snapshots.length > 0 ? data.snapshots[data.snapshots.length - 1] : null)
    );
  }

  /**
   * Gets price snapshots for a specific model across all dates.
   * Useful for charting price evolution.
   */
  getModelPriceHistory(modelId: string): Observable<Array<{ date: string; input: number; output: number }>> {
    return this.loadPriceHistory().pipe(
      map(data => {
        return data.snapshots.map(snapshot => {
          const model = snapshot.models.find(m => m.id === modelId);
          return {
            date: snapshot.date,
            input: model?.input_1m ?? 0,
            output: model?.output_1m ?? 0
          };
        }).filter(item => item.input > 0 || item.output > 0);
      })
    );
  }

  /**
   * Calculates price trends for all models.
   * Compares current prices to historical data.
   */
  calculatePriceTrends(): Observable<PriceTrend[]> {
    return this.loadPriceHistory().pipe(
      map(data => {
        if (data.snapshots.length === 0) return [];

        const latest = data.snapshots[data.snapshots.length - 1];
        const snapshot30d = this.findSnapshotByDaysAgo(data.snapshots, 30);
        const snapshot90d = this.findSnapshotByDaysAgo(data.snapshots, 90);

        return latest.models.map(model => {
          const price30d = snapshot30d?.models.find(m => m.id === model.id);
          const price90d = snapshot90d?.models.find(m => m.id === model.id);

          const change30d = price30d
            ? ((model.output_1m - price30d.output_1m) / price30d.output_1m) * 100
            : null;

          const change90d = price90d
            ? ((model.output_1m - price90d.output_1m) / price90d.output_1m) * 100
            : null;

          let direction: 'up' | 'down' | 'stable' = 'stable';
          if (change30d !== null) {
            if (change30d > 5) direction = 'up';
            else if (change30d < -5) direction = 'down';
          }

          return {
            model_id: model.id,
            provider: model.provider,
            current_input: model.input_1m,
            current_output: model.output_1m,
            trend_direction: direction,
            change_30d_percent: change30d ? Math.round(change30d * 10) / 10 : null,
            change_90d_percent: change90d ? Math.round(change90d * 10) / 10 : null
          };
        });
      })
    );
  }

  /**
   * Gets all recorded price changes (for alerting/notification features).
   */
  getPriceChanges(): Observable<PriceChange[]> {
    return this.loadPriceHistory().pipe(
      map(data => data.price_changes)
    );
  }

  /**
   * Gets the number of data points available (snapshots count).
   * Useful for showing data depth to users.
   */
  getDataDepth(): Observable<{ snapshots: number; months: number; firstDate: string }> {
    return this.loadPriceHistory().pipe(
      map(data => ({
        snapshots: data.snapshots.length,
        months: this.calculateMonthsBetween(data.metadata.first_snapshot, data.metadata.last_snapshot),
        firstDate: data.metadata.first_snapshot
      }))
    );
  }

  /**
   * Finds a snapshot closest to N days ago.
   */
  private findSnapshotByDaysAgo(snapshots: PriceSnapshot[], daysAgo: number): PriceSnapshot | null {
    if (snapshots.length === 0) return null;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const targetStr = targetDate.toISOString().split('T')[0];

    // Find the closest snapshot to the target date
    let closest: PriceSnapshot | null = null;
    let closestDiff = Infinity;

    for (const snapshot of snapshots) {
      const snapshotDate = new Date(snapshot.date);
      const diff = Math.abs(snapshotDate.getTime() - targetDate.getTime());
      if (diff < closestDiff) {
        closestDiff = diff;
        closest = snapshot;
      }
    }

    return closest;
  }

  /**
   * Calculates months between two date strings.
   */
  private calculateMonthsBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  }
}
