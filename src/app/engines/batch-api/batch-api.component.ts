import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Meta, Title } from '@angular/platform-browser';
import { LlmModel } from '../chatbot-simulator/logic.service';
import {
  BatchApiLogicService,
  BatchApiInputs,
} from './batch-api-logic.service';
import {
  PricingDataService,
  PricingMetadata,
} from '../../core/services/pricing-data.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PriceAlertModalComponent } from '../../shared/components/price-alert-modal/price-alert-modal.component';
import { ENGINE_META } from '../../core/constants/engine-weights';

// Preset configuration for common batch scenarios
interface BatchPreset {
  id: string;
  name: string;
  description: string;
  records: number;
  avgInput: number;
  avgOutput: number;
}

@Component({
  selector: 'app-batch-api',
  standalone: true,
  imports: [CommonModule, RouterLink, PriceAlertModalComponent],
  templateUrl: './batch-api.component.html',
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
export class BatchApiComponent implements OnInit, OnDestroy {
  // ============================================================================
  // DEFAULTS & CONSTANTS
  // ============================================================================

  private readonly DEFAULT_RECORDS = 10000;
  private readonly DEFAULT_AVG_INPUT = 500;
  private readonly DEFAULT_AVG_OUTPUT = 100;

  readonly presets: BatchPreset[] = [
    {
      id: 'weekly-emails',
      name: 'Weekly Email Batch',
      description: 'Newsletter generation for 50K subscribers',
      records: 50000,
      avgInput: 150,
      avgOutput: 400,
    },
    {
      id: 'monthly-reports',
      name: 'Monthly Report Generation',
      description: 'Automated business reports for 1K clients',
      records: 1000,
      avgInput: 2000,
      avgOutput: 800,
    },
    {
      id: 'data-processing',
      name: 'Data Processing Pipeline',
      description: 'Classification/tagging of 100K records',
      records: 100000,
      avgInput: 200,
      avgOutput: 50,
    },
    {
      id: 'content-moderation',
      name: 'Content Moderation',
      description: 'Review and classify user-generated content',
      records: 25000,
      avgInput: 300,
      avgOutput: 100,
    },
  ];

  activePreset = signal<string | null>(null);

  // ============================================================================
  // LIFECYCLE & CLEANUP
  // ============================================================================

  private destroy$ = new Subject<void>();

  // ============================================================================
  // SIGNALS - User Inputs
  // ============================================================================

  selectedModelId = signal('gpt-4o');
  records = signal(this.DEFAULT_RECORDS);
  avgInputTokens = signal(this.DEFAULT_AVG_INPUT);
  avgOutputTokens = signal(this.DEFAULT_AVG_OUTPUT);

  // ============================================================================
  // SIGNALS - Data State
  // ============================================================================

  allModels = signal<LlmModel[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  isRetrying = signal(false);
  pricingMetadata = signal<PricingMetadata | null>(null);

  // ============================================================================
  // SIGNALS - Price Alert Modal
  // ============================================================================

  alertModalOpen = signal(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  /** Only models with batch API support */
  batchModels = computed(() =>
    this.logicService.filterBatchModels(this.allModels()),
  );

  /** Currently selected model */
  selectedModel = computed(() => {
    const id = this.selectedModelId();
    return this.batchModels().find((m) => m.id === id) ?? this.batchModels()[0] ?? null;
  });

  /** Calculation results */
  results = computed(() => {
    const model = this.selectedModel();
    if (!model) return null;

    const inputs: BatchApiInputs = {
      records: this.records(),
      avgInputTokens: this.avgInputTokens(),
      avgOutputTokens: this.avgOutputTokens(),
    };

    return this.logicService.calculate(inputs, model);
  });

  /** Batch bar width as percentage of real-time cost */
  batchBarWidth = computed(() => {
    const r = this.results();
    if (!r || r.costRealTime === 0) return 100;
    return Math.max(2, (r.costBatch / r.costRealTime) * 100);
  });

  // ============================================================================
  // SERVICES
  // ============================================================================

  private logicService = inject(BatchApiLogicService);
  private pricingService = inject(PricingDataService);
  private jsonLdService = inject(JsonLdService);
  private analytics = inject(AnalyticsService);
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
    // Track tool usage for analytics
    this.analytics.trackToolUsage('batch-api');
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  onModelChange(modelId: string): void {
    this.selectedModelId.set(modelId);
    this.updateDynamicMeta();
  }

  onRecordsChange(value: number): void {
    this.records.set(Math.max(1, value));
  }

  onAvgInputChange(value: number): void {
    this.avgInputTokens.set(Math.max(1, value));
  }

  onAvgOutputChange(value: number): void {
    this.avgOutputTokens.set(Math.max(1, value));
  }

  formatTokens(tokens: number): string {
    if (tokens >= 1_000_000_000) return (tokens / 1_000_000_000).toFixed(1) + 'B';
    if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1) + 'M';
    if (tokens >= 1_000) return (tokens / 1_000).toFixed(0) + 'K';
    return tokens.toString();
  }

  resetToDefaults(): void {
    this.records.set(this.DEFAULT_RECORDS);
    this.avgInputTokens.set(this.DEFAULT_AVG_INPUT);
    this.avgOutputTokens.set(this.DEFAULT_AVG_OUTPUT);
    this.activePreset.set(null);
  }

  applyPreset(preset: BatchPreset): void {
    this.activePreset.set(preset.id);
    this.records.set(preset.records);
    this.avgInputTokens.set(preset.avgInput);
    this.avgOutputTokens.set(preset.avgOutput);
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
    this.errorMessage.set(null);
    this.pricingService
      .loadPricingData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.allModels.set(data.models);
          if (data.metadata) this.pricingMetadata.set(data.metadata);
          this.isLoading.set(false);
          this.isRetrying.set(false);

          // If default model not in batch list, select first available
          const batch = this.logicService.filterBatchModels(data.models);
          if (
            batch.length > 0 &&
            !batch.find((m) => m.id === this.selectedModelId())
          ) {
            this.selectedModelId.set(batch[0].id);
          }
        },
        error: (err) => {
          console.error('Failed to load pricing data', err);
          this.isLoading.set(false);
          this.isRetrying.set(false);
          this.errorMessage.set(
            'Failed to load pricing data. Please check your connection and try again.',
          );
        },
      });
  }

  retryLoadData(): void {
    this.errorMessage.set(null);
    this.isRetrying.set(true);
    this.loadPricingData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setMetaTags(): void {
    this.title.setTitle(
      'Batch API Cost Calculator - 50% Savings on GPT-4o & Claude',
    );
    this.meta.updateTag({
      name: 'description',
      content:
        'Calculate how much you save with OpenAI and Anthropic Batch APIs. Trade 24h turnaround for 50% cost reduction on GPT-4o, Claude, and more.',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Batch API Cost Calculator | LLM Cost Engine',
    });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Estimate batch processing savings across OpenAI and Anthropic models. 50% discount for non-urgent workloads.',
    });
  }

  private updateDynamicMeta(): void {
    const model = this.selectedModel();
    const r = this.results();
    if (!model || !r) return;

    const dynamicTitle = `Batch API: ${model.name} saves ${r.savingsPercent}% | LLM Cost Engine`;
    this.title.setTitle(dynamicTitle);
    this.meta.updateTag({
      name: 'description',
      content: `${model.name} Batch API saves $${r.savings.toFixed(2)} (${r.savingsPercent}%) on ${this.records().toLocaleString()} records. ${model.provider} offers ${r.batchDiscount}% batch discount with ~24h turnaround.`,
    });
  }

  private injectJsonLd(): void {
    this.jsonLdService.injectSoftwareApplicationSchema(
      {
        name: 'Batch API Cost Calculator',
        description:
          'Calculate batch processing savings on GPT-4o, Claude, and more. Trade 24h turnaround for 50% cost reduction.',
        url: 'https://llm-cost-engine.com/tools/batch-api',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web Browser',
        softwareVersion: ENGINE_META.version,
        featureList: [
          'Real-time vs Batch cost comparison',
          'Per-record cost calculation',
          'OpenAI & Anthropic batch support',
          'Time vs Money trade-off visualization',
        ],
      },
      'batch-api',
    );
  }
}
