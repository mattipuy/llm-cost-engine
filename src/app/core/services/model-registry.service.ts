import { Injectable } from '@angular/core';
import { LlmModel } from '../../engines/chatbot-simulator/logic.service';
import { PresetProfile } from './pricing-data.service';

/**
 * Canonical provider display order for sorting and top-per-provider selection.
 */
const PROVIDER_ORDER = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Meta', 'Mistral AI'];

/**
 * Pure stateless utility service for querying the LLM model registry.
 *
 * All methods are side-effect-free and take `models: LlmModel[]` as input.
 * Inject alongside PricingDataService — not as a replacement.
 *
 * Usage:
 *   const models = await pricingDataService.loadPricingData().toPromise();
 *   const best = registry.getBestCacheable(models.models, 'standard');
 */
@Injectable({ providedIn: 'root' })
export class ModelRegistryService {
  /**
   * Returns models sorted by canonical provider group order, then by
   * provider_rank ascending within each group.
   */
  sortedByProvider(models: LlmModel[]): LlmModel[] {
    return [...models].sort((a, b) => {
      const pa = PROVIDER_ORDER.indexOf(a.provider);
      const pb = PROVIDER_ORDER.indexOf(b.provider);
      const providerDiff = (pa === -1 ? 999 : pa) - (pb === -1 ? 999 : pb);
      if (providerDiff !== 0) return providerDiff;
      return (a.provider_rank ?? 99) - (b.provider_rank ?? 99);
    });
  }

  /**
   * Returns the first model matching the given tier and optional provider.
   * Ties are broken by provider_rank ascending (lowest rank = most powerful).
   */
  getByTierAndProvider(models: LlmModel[], tier: string, provider?: string): LlmModel | null {
    const filtered = models.filter(
      (m) => m.tier === tier && (!provider || m.provider === provider),
    );
    if (filtered.length === 0) return null;
    return filtered.sort((a, b) => (a.provider_rank ?? 99) - (b.provider_rank ?? 99))[0];
  }

  /**
   * Returns one representative model per provider — the model with the
   * lowest provider_rank (most powerful) within each provider group.
   * Results are ordered by canonical provider order.
   */
  getTopPerProvider(models: LlmModel[]): LlmModel[] {
    const byProvider = new Map<string, LlmModel>();
    for (const model of models) {
      const existing = byProvider.get(model.provider);
      if (!existing || (model.provider_rank ?? 99) < (existing.provider_rank ?? 99)) {
        byProvider.set(model.provider, model);
      }
    }
    return PROVIDER_ORDER.filter((p) => byProvider.has(p)).map((p) => byProvider.get(p)!);
  }

  /**
   * Returns the best cacheable model (cached_input_1m > 0) for a given tier.
   * If no model of that tier supports caching, falls back to any cacheable model.
   * Ties are broken by provider_rank ascending.
   */
  getBestCacheable(models: LlmModel[], tier?: string): LlmModel | null {
    const cacheable = models.filter((m) => (m.pricing.cached_input_1m ?? 0) > 0);
    if (cacheable.length === 0) return null;

    if (tier) {
      const tiered = cacheable.filter((m) => m.tier === tier);
      if (tiered.length > 0) {
        return tiered.sort((a, b) => (a.provider_rank ?? 99) - (b.provider_rank ?? 99))[0];
      }
    }
    return cacheable.sort((a, b) => (a.provider_rank ?? 99) - (b.provider_rank ?? 99))[0];
  }

  /**
   * Returns the best batch-capable model (batch_input_1m > 0) for a given tier.
   * If no model of that tier supports batch, falls back to any batch-capable model.
   * Ties are broken by provider_rank ascending.
   */
  getBestBatch(models: LlmModel[], tier?: string): LlmModel | null {
    const batchable = models.filter((m) => (m.pricing.batch_input_1m ?? 0) > 0);
    if (batchable.length === 0) return null;

    if (tier) {
      const tiered = batchable.filter((m) => m.tier === tier);
      if (tiered.length > 0) {
        return tiered.sort((a, b) => (a.provider_rank ?? 99) - (b.provider_rank ?? 99))[0];
      }
    }
    return batchable.sort((a, b) => (a.provider_rank ?? 99) - (b.provider_rank ?? 99))[0];
  }

  /**
   * Returns all models that include the given tag.
   */
  getByTag(models: LlmModel[], tag: string): LlmModel[] {
    return models.filter((m) => m.tags?.includes(tag) ?? false);
  }

  /**
   * Resolves a PresetProfile criteria (tier + provider) to a model.
   * Returns null if no matching model is found.
   */
  resolveProfile(models: LlmModel[], profile: PresetProfile): LlmModel | null {
    return this.getByTierAndProvider(models, profile.tier, profile.provider);
  }
}
