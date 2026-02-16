import { Injectable, inject, PLATFORM_ID, TransferState, makeStateKey, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { Observable, of, tap } from 'rxjs';
import { LlmModel } from '../../engines/chatbot-simulator/logic.service';
import { SSR_PRICING_DATA } from '../tokens/ssr-pricing.token';

/**
 * Metadata from the pricing registry JSON.
 */
export interface PricingMetadata {
  version: string;
  name?: string;
  last_updated: string;
  last_verified?: string;
  base_currency?: string;
  pricing_unit?: string;
  maintained_by?: string;
  source_verification?: string;
  update_frequency?: string;
}

/**
 * Full pricing data structure including metadata and models.
 */
export interface PricingData {
  metadata?: PricingMetadata;
  models: LlmModel[];
}

/**
 * TransferState key for pricing data.
 * This ensures data fetched during SSR is transferred to the client.
 */
const PRICING_DATA_KEY = makeStateKey<PricingData>('llm-pricing-data');

/**
 * Service for loading LLM pricing data with SSR support via TransferState.
 *
 * How it works:
 * 1. During SSR: Fetches data from JSON, stores in TransferState
 * 2. During Hydration: Retrieves data from TransferState (no HTTP request)
 * 3. Result: Zero layout shift, instant data on client
 */
@Injectable({
  providedIn: 'root'
})
export class PricingDataService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private ssrPricingData = inject(SSR_PRICING_DATA, { optional: true });

  /**
   * Loads pricing data with TransferState caching.
   * On server: fetches and caches. On client: uses cached data.
   * Returns both metadata and models from the JSON registry.
   */
  loadPricingData(): Observable<PricingData> {
    // 1. Check TransferState first (client hydration after SSR)
    const cachedData = this.transferState.get(PRICING_DATA_KEY, null);
    if (cachedData) {
      this.transferState.remove(PRICING_DATA_KEY);
      return of(cachedData);
    }

    // 2. Check SSR injected data (server processing)
    if (this.ssrPricingData) {
      // We're on server and have injected data - use it
      this.transferState.set(PRICING_DATA_KEY, this.ssrPricingData);
      return of(this.ssrPricingData);
    }

    // 3. Fallback to HTTP fetch (client-side navigation, no SSR)
    return this.http.get<PricingData>('/data/llm-pricing.json').pipe(
      tap((data) => {
        // If on server, store in TransferState for client
        // (This path shouldn't happen with SSR token, but keep as fallback)
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(PRICING_DATA_KEY, data);
        }
      })
    );
  }
}
