import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface PriceAlertStats {
  priceInput: number;
  monthlyCost: number;
  simulationHash: string;
}

export interface PriceAlertResult {
  success: boolean;
  error?: string;
  modelId?: string;
}

@Injectable({ providedIn: 'root' })
export class PriceAlertService {
  private platformId = inject(PLATFORM_ID);
  private supabase: SupabaseClient | null = null;

  private getClient(): SupabaseClient | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    if (!this.supabase) {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }
    return this.supabase;
  }

  async subscribe(
    email: string,
    modelId: string,
    stats: PriceAlertStats,
    honeypot: string
  ): Promise<PriceAlertResult> {
    if (honeypot) return { success: true };

    const client = this.getClient();
    if (!client) return { success: false, error: 'Service unavailable' };

    try {
      const { error } = await client.functions.invoke('subscribe-to-alert', {
        body: { email, modelId, currentStats: stats },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async verify(token: string): Promise<PriceAlertResult> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Service unavailable' };

    try {
      const { error } = await client.functions.invoke('verify-token', {
        body: { token },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  }

  async unsubscribe(token: string): Promise<PriceAlertResult> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Service unavailable' };

    try {
      const { data, error } = await client.functions.invoke('unsubscribe', {
        body: { token },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, modelId: data?.modelId };
    } catch {
      return { success: false, error: 'Unsubscribe failed. Please try again.' };
    }
  }
}
