import { InjectionToken } from '@angular/core';
import { PricingData } from '../services/pricing-data.service';

/**
 * Injection token for pricing data during SSR.
 * This data is read from filesystem during server initialization
 * to avoid HTTP fetch issues in Vercel serverless context.
 */
export const SSR_PRICING_DATA = new InjectionToken<PricingData>('SSR_PRICING_DATA');
