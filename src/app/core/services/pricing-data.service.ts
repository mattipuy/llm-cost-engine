import { Injectable, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { Observable, of, tap } from 'rxjs';
import { LlmModel } from '../../engines/chatbot-simulator/logic.service';

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

  /**
   * Loads pricing data with TransferState caching.
   * On server: fetches and caches. On client: uses cached data.
   * Returns both metadata and models from the JSON registry.
   */
  loadPricingData(): Observable<PricingData> {
    // Check if data exists in TransferState (client-side after SSR)
    const cachedData = this.transferState.get(PRICING_DATA_KEY, null);

    if (cachedData) {
      // Data was transferred from server - use it and remove from state
      this.transferState.remove(PRICING_DATA_KEY);
      return of(cachedData);
    }

    // Fetch data (happens on server during SSR, or client if no cache)
    // During SSR, use full URL to access the JSON file
    const url = isPlatformServer(this.platformId)
      ? 'https://llm-cost-engine.com/data/llm-pricing.json'
      : '/data/llm-pricing.json';

    return this.http.get<PricingData>(url).pipe(
      tap((data) => {
        // If on server, store in TransferState for client
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(PRICING_DATA_KEY, data);
        }
      })
    );
  }
}
