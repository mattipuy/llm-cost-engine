import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { LlmModel } from '../chatbot-simulator/logic.service';
import {
  CachingRoiLogicService,
  CachingRoiInputs,
} from './caching-roi-logic.service';
import {
  PricingDataService,
  PricingMetadata,
} from '../../core/services/pricing-data.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { PriceAlertModalComponent } from '../../shared/components/price-alert-modal/price-alert-modal.component';
import { ENGINE_META } from '../../core/constants/engine-weights';

@Component({
  selector: 'app-caching-roi',
  standalone: true,
  imports: [CommonModule, RouterLink, PriceAlertModalComponent],
  templateUrl: './caching-roi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
      .tabular-nums {
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
})
export class CachingRoiComponent implements OnInit {
  // ============================================================================
  // SIGNALS - User Inputs
  // ============================================================================

  selectedModelId = signal('claude-3.5-sonnet');
  staticTokens = signal(5000);
  dynamicTokens = signal(100);
  outputTokens = signal(200);
  requestsPerDay = signal(1000);
  cacheWritePercent = signal(10);

  // ============================================================================
  // SIGNALS - Data State
  // ============================================================================

  allModels = signal<LlmModel[]>([]);
  isLoading = signal(true);
  pricingMetadata = signal<PricingMetadata | null>(null);

  // ============================================================================
  // SIGNALS - Price Alert Modal
  // ============================================================================

  alertModalOpen = signal(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  /** Only models that support prompt caching */
  cacheableModels = computed(() =>
    this.logicService.filterCacheableModels(this.allModels()),
  );

  /** Currently selected model object */
  selectedModel = computed(() => {
    const id = this.selectedModelId();
    return this.cacheableModels().find((m) => m.id === id) ?? this.cacheableModels()[0] ?? null;
  });

  /** Calculation results */
  results = computed(() => {
    const model = this.selectedModel();
    if (!model) return null;

    const inputs: CachingRoiInputs = {
      staticTokens: this.staticTokens(),
      dynamicTokens: this.dynamicTokens(),
      outputTokens: this.outputTokens(),
      requestsPerDay: this.requestsPerDay(),
      cacheWritePercent: this.cacheWritePercent(),
    };

    return this.logicService.calculate(inputs, model);
  });

  /** Cache hit rate (inverse of write percent) for display */
  cacheHitRate = computed(() => 100 - this.cacheWritePercent());

  /** Bar width for visual comparison (cached as % of no-cache) */
  cachedBarWidth = computed(() => {
    const r = this.results();
    if (!r || r.costNoCache === 0) return 100;
    return Math.max(2, (r.costCached / r.costNoCache) * 100);
  });

  // ============================================================================
  // SERVICES
  // ============================================================================

  private logicService = inject(CachingRoiLogicService);
  private pricingService = inject(PricingDataService);
  private jsonLdService = inject(JsonLdService);
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);

  readonly engineMeta = ENGINE_META;

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  ngOnInit(): void {
    this.setMetaTags();
    this.injectJsonLd();
    this.loadPricingData();
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  onModelChange(modelId: string): void {
    this.selectedModelId.set(modelId);
    this.updateDynamicMeta();
  }

  onStaticTokensChange(value: number): void {
    this.staticTokens.set(Math.max(100, value));
  }

  onDynamicTokensChange(value: number): void {
    this.dynamicTokens.set(Math.max(1, value));
  }

  onOutputTokensChange(value: number): void {
    this.outputTokens.set(Math.max(1, value));
  }

  onRequestsChange(value: number): void {
    this.requestsPerDay.set(Math.max(1, value));
  }

  onCacheWriteChange(value: number): void {
    this.cacheWritePercent.set(Math.min(100, Math.max(1, value)));
  }

  // ============================================================================
  // PRICE ALERT
  // ============================================================================

  openPriceAlert(): void {
    this.alertModalOpen.set(true);
  }

  closePriceAlert(): void {
    this.alertModalOpen.set(false);
  }

  // ============================================================================
  // SEO & DATA
  // ============================================================================

  private loadPricingData(): void {
    this.isLoading.set(true);
    this.pricingService.loadPricingData().subscribe({
      next: (data) => {
        this.allModels.set(data.models);
        if (data.metadata) this.pricingMetadata.set(data.metadata);
        this.isLoading.set(false);

        // If default model not in cacheable list, select first available
        const cacheable = this.logicService.filterCacheableModels(data.models);
        if (cacheable.length > 0 && !cacheable.find((m) => m.id === this.selectedModelId())) {
          this.selectedModelId.set(cacheable[0].id);
        }
      },
      error: (err) => {
        console.error('Failed to load pricing data', err);
        this.isLoading.set(false);
      },
    });
  }

  private setMetaTags(): void {
    this.title.setTitle(
      'Prompt Caching ROI Calculator - Estimate Savings for Claude & Gemini',
    );
    this.meta.updateTag({
      name: 'description',
      content:
        'Calculate how much you save with prompt caching on Claude, GPT-4o, and Gemini. Deterministic Write/Read split analysis with break-even and annual projections.',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Prompt Caching ROI Calculator | LLM Cost Engine',
    });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Estimate prompt caching savings across all major LLM providers. See monthly ROI, break-even point, and annual projections.',
    });
  }

  private updateDynamicMeta(): void {
    const model = this.selectedModel();
    const r = this.results();
    if (!model || !r) return;

    const dynamicTitle = `Prompt Caching ROI: ${model.name} saves ${r.savingsPercent}% | LLM Cost Engine`;
    this.title.setTitle(dynamicTitle);
    this.meta.updateTag({
      name: 'description',
      content: `${model.name} prompt caching saves $${r.monthlySavings.toFixed(2)}/month (${r.savingsPercent}%). ${model.provider} offers a ${r.cacheDiscount}% cache discount. Break-even after ${r.breakEvenRequests} requests.`,
    });
  }

  private injectJsonLd(): void {
    this.jsonLdService.injectSoftwareApplicationSchema(
      {
        name: 'Prompt Caching ROI Calculator',
        description:
          'Calculate prompt caching savings across Claude, GPT-4o, Gemini, and DeepSeek. Deterministic Write/Read split analysis.',
        url: 'https://llm-cost-engine.vercel.app/tools/caching-roi',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web Browser',
        softwareVersion: ENGINE_META.version,
        featureList: [
          'Write/Read cache split analysis',
          'Break-even calculation',
          'Annual savings projection',
          'Multi-provider comparison',
        ],
      },
      'caching-roi',
    );
  }
}
