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
  ContextWindowLogicService,
  ContextWindowResult,
  ContentUnit,
  SortMode,
} from './context-window-logic.service';
import {
  PricingDataService,
  PricingMetadata,
} from '../../core/services/pricing-data.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PriceAlertModalComponent } from '../../shared/components/price-alert-modal/price-alert-modal.component';
import { ENGINE_META } from '../../core/constants/engine-weights';

@Component({
  selector: 'app-context-window',
  standalone: true,
  imports: [CommonModule, RouterLink, PriceAlertModalComponent],
  templateUrl: './context-window.component.html',
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
export class ContextWindowComponent implements OnInit, OnDestroy {
  // ============================================================================
  // DEFAULTS & CONSTANTS
  // ============================================================================

  private readonly DEFAULT_CONTENT_SIZE = 30000;
  private readonly DEFAULT_CONTENT_UNIT: ContentUnit = 'tokens';
  private readonly DEFAULT_SORT_MODE: SortMode = 'price';

  // ============================================================================
  // LIFECYCLE & CLEANUP
  // ============================================================================

  private destroy$ = new Subject<void>();

  // ============================================================================
  // SIGNALS - User Inputs
  // ============================================================================

  contentSize = signal(this.DEFAULT_CONTENT_SIZE);
  contentUnit = signal<ContentUnit>(this.DEFAULT_CONTENT_UNIT);
  sortMode = signal<SortMode>(this.DEFAULT_SORT_MODE);

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
  alertModelId = signal('');
  alertModelName = signal('');
  alertPriceInput = signal(0);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  /** Normalized token count from user input */
  normalizedTokens = computed(() =>
    this.logicService.normalizeToTokens(this.contentSize(), this.contentUnit()),
  );

  /** Analysis results for all models */
  analysisResults = computed(() =>
    this.logicService.analyze(this.allModels(), this.normalizedTokens()),
  );

  /** Sorted results */
  sortedResults = computed(() =>
    this.logicService.sort(this.analysisResults(), this.sortMode()),
  );

  /** Max context window for bar normalization */
  maxContext = computed(() =>
    this.logicService.getMaxContext(this.allModels()),
  );

  /** Whether any model can handle the input */
  hasValidModel = computed(() =>
    this.sortedResults().some((r) => r.isValid),
  );

  /** Count of valid models */
  validCount = computed(() =>
    this.sortedResults().filter((r) => r.isValid).length,
  );

  // ============================================================================
  // SERVICES
  // ============================================================================

  private logicService = inject(ContextWindowLogicService);
  private pricingService = inject(PricingDataService);
  private jsonLdService = inject(JsonLdService);
  private analytics = inject(AnalyticsService);
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);

  readonly engineMeta = ENGINE_META;
  Math = Math; // Expose Math to template for min/max calculations

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  ngOnInit(): void {
    this.setMetaTags();
    this.injectJsonLd();
    this.loadPricingData();
    // Track tool usage for analytics
    this.analytics.trackToolUsage('context-window');
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  onContentSizeChange(value: number): void {
    this.contentSize.set(Math.max(1, value));
  }

  onUnitChange(unit: ContentUnit): void {
    this.contentUnit.set(unit);
  }

  onSortChange(mode: SortMode): void {
    this.sortMode.set(mode);
  }

  resetToDefaults(): void {
    this.contentSize.set(this.DEFAULT_CONTENT_SIZE);
    this.contentUnit.set(this.DEFAULT_CONTENT_UNIT);
    this.sortMode.set(this.DEFAULT_SORT_MODE);
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /** Bar width as percentage of max context window */
  contextBarWidth(result: ContextWindowResult): number {
    const max = this.maxContext();
    if (max === 0) return 0;
    return (result.contextWindow / max) * 100;
  }

  /** Usage bar width within the model's context bar */
  usageBarWidth(result: ContextWindowResult): number {
    if (result.contextWindow === 0) return 100;
    return Math.min(100, result.usagePercent);
  }

  /** Overflow bar width (extends beyond 100% of context) */
  overflowBarWidth(result: ContextWindowResult): number {
    if (result.isValid || result.contextWindow === 0) return 0;
    const max = this.maxContext();
    if (max === 0) return 0;
    return (result.overflowTokens / max) * 100;
  }

  formatTokens(tokens: number): string {
    if (tokens >= 1_000_000) return (tokens / 1_000_000).toFixed(1) + 'M';
    if (tokens >= 1_000) return (tokens / 1_000).toFixed(0) + 'K';
    return tokens.toString();
  }

  // ============================================================================
  // PRICE ALERT
  // ============================================================================

  openPriceAlert(modelId: string, modelName: string, priceInput: number): void {
    this.alertModelId.set(modelId);
    this.alertModelName.set(modelName);
    this.alertPriceInput.set(priceInput);
    this.alertModalOpen.set(true);
  }

  closePriceAlert(): void {
    this.alertModalOpen.set(false);
  }

  openGlobalPriceAlert(): void {
    // Open modal without specific model (user can select model inside modal)
    this.alertModelId.set('');
    this.alertModelName.set('All Models');
    this.alertPriceInput.set(0);
    this.alertModalOpen.set(true);
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
      'LLM Context Window Comparator - GPT-4o, Claude 3 & Gemini Limits',
    );
    this.meta.updateTag({
      name: 'description',
      content:
        'Compare LLM context window sizes across GPT-4o, Claude 3, Gemini, and more. See which models fit your document and find the cheapest option.',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'LLM Context Window Comparator | LLM Cost Engine',
    });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Visualize which AI models can handle your content size. Green = fits, Red = overflow. Find the cheapest model for your document.',
    });
  }

  private injectJsonLd(): void {
    this.jsonLdService.injectSoftwareApplicationSchema(
      {
        name: 'LLM Context Window Comparator',
        description:
          'Compare context window limits across GPT-4o, Claude 3, Gemini, and DeepSeek. Visualize which models fit your document size.',
        url: 'https://llm-cost-engine.com/tools/context-window',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web Browser',
        softwareVersion: ENGINE_META.version,
        featureList: [
          'Context window comparison across 15+ models',
          'Token/Word/Page unit conversion',
          'Input cost calculation per model',
          'Green/Red fit visualization',
        ],
      },
      'context-window',
    );
  }
}
