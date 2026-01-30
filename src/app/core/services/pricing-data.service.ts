import { Injectable, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { Observable, of, tap } from 'rxjs';
import { LlmModel } from '../../engines/chatbot-simulator/logic.service';

/**
 * TransferState key for pricing data.
 * This ensures data fetched during SSR is transferred to the client.
 */
const PRICING_DATA_KEY = makeStateKey<{ models: LlmModel[] }>('llm-pricing-data');

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
   */
  loadPricingData(): Observable<{ models: LlmModel[] }> {
    // Check if data exists in TransferState (client-side after SSR)
    const cachedData = this.transferState.get(PRICING_DATA_KEY, null);

    if (cachedData) {
      // Data was transferred from server - use it and remove from state
      this.transferState.remove(PRICING_DATA_KEY);
      return of(cachedData);
    }

    // Fetch data (happens on server during SSR, or client if no cache)
    return this.http.get<{ models: LlmModel[] }>('/data/llm-pricing.json').pipe(
      tap((data) => {
        // If on server, store in TransferState for client
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(PRICING_DATA_KEY, data);
        }
      })
    );
  }
}
