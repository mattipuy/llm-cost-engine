import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  OnDestroy,
  effect,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import {
  ChatbotSimulatorLogicService,
  SimulatorInputs,
  LlmModel,
  AggressiveComparison,
  SensitivityAnalysis,
} from './logic.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import {
  PricingDataService,
  PricingMetadata,
} from '../../core/services/pricing-data.service';
import {
  PriceHistoryService,
  PriceTrend,
} from '../../core/services/price-history.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PriceAlertModalComponent } from '../../shared/components/price-alert-modal/price-alert-modal.component';
import { MarketInsightsService } from '../../core/services/market-insights.service';
import {
  WEIGHT_DESCRIPTIONS,
  ENGINE_META,
} from '../../core/constants/engine-weights';
import { generateScenarioId } from '../../core/utils/scenario-id';
import {
  SEO_PRESETS,
  SeoPreset,
  getPresetUrl,
} from '../../core/configs/seo-presets';
import {
  MarketSegment,
  classifySegment,
  SEGMENT_THRESHOLDS,
} from '../../core/models/market-insight.model';

// Preset configurations for different use cases
interface UseCasePreset {
  id: string;
  name: string;
  description: string;
  messagesPerDay: number;
  tokensInput: number;
  tokensOutput: number;
  cacheHitRate: number;
}

// Snap point configuration
interface SnapPoint {
  value: number;
  label: string;
}

// Comparison insight for winner vs runner-up
interface ComparisonInsight {
  icon: string;
  text: string;
  highlight: string;
}

@Component({
  selector: 'app-chatbot-simulator',
  standalone: true,
  imports: [CommonModule, RouterLink, PriceAlertModalComponent],
  templateUrl: './chatbot-simulator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }

      /* Smooth transitions for all interactive elements */
      .transition-gpu {
        transition:
          transform 150ms ease-out,
          opacity 150ms ease-out;
        will-change: transform, opacity;
      }

      /* CLS Prevention: Fixed dimensions for model cards */
      .stable-height {
        min-height: 480px;
        max-height: 520px;
      }

      /* CLS Prevention: Fixed winner card height */
      .winner-card-stable {
        min-height: 180px;
      }

      /* CLS Prevention: Loading skeleton placeholder */
      .skeleton-card {
        min-height: 480px;
        background: linear-gradient(
          90deg,
          #f3f4f6 25%,
          #e5e7eb 50%,
          #f3f4f6 75%
        );
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.5s infinite;
      }

      @keyframes skeleton-shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      /* Ghost update fade effect */
      .ghost-fade {
        transition: opacity 200ms ease-in-out;
      }

      .ghost-updating {
        opacity: 0.6;
      }

      /* Prevent number jumps during updates */
      .tabular-nums {
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
})
export class ChatbotSimulatorComponent implements OnInit, OnDestroy {
  // ============================================================================
  // PRESET CONFIGURATIONS
  // ============================================================================

  readonly presets: UseCasePreset[] = [
    {
      id: 'saas-startup',
      name: 'Customer Support',
      description: 'SaaS Startup Scenario',
      messagesPerDay: 2000,
      tokensInput: 200,
      tokensOutput: 350,
      cacheHitRate: 0.3,
    },
    {
      id: 'enterprise-support',
      name: 'High-Volume Support',
      description: 'Enterprise Support Hub',
      messagesPerDay: 25000,
      tokensInput: 150,
      tokensOutput: 250,
      cacheHitRate: 0.45,
    },
    {
      id: 'dev-productivity',
      name: 'Internal Coding Bot',
      description: 'Internal Dev Productivity',
      messagesPerDay: 500,
      tokensInput: 800,
      tokensOutput: 1200,
      cacheHitRate: 0.15,
    },
    {
      id: 'rag-knowledge',
      name: 'RAG Knowledge Base',
      description: 'Document Search (Heavy Input)',
      messagesPerDay: 1000,
      tokensInput: 15000, // High context
      tokensOutput: 500,
      cacheHitRate: 0.8, // High reuse of doc embeddings
    },
    {
      id: 'content-gen',
      name: 'Blog/Email Generator',
      description: 'Marketing Content (Heavy Output)',
      messagesPerDay: 50,
      tokensInput: 200,
      tokensOutput: 3000, // Long articles
      cacheHitRate: 0.0,
    },
  ];

  // ============================================================================
  // SNAP POINTS FOR SLIDERS
  // ============================================================================

  readonly messageSnapPoints: SnapPoint[] = [
    { value: 100, label: 'Pilot' },
    { value: 500, label: 'Small Team' },
    { value: 2000, label: 'Department' },
    { value: 10000, label: 'Company' },
    { value: 25000, label: 'Enterprise' },
    { value: 50000, label: 'High-Volume' },
  ];

  readonly tokenSnapPoints: SnapPoint[] = [
    { value: 50, label: 'Minimal' },
    { value: 150, label: 'Standard' },
    { value: 500, label: 'Detailed' },
    { value: 1000, label: 'Rich Context' },
    { value: 2000, label: 'Long-form' },
  ];

  // ============================================================================
  // SIGNALS - User Inputs
  // ============================================================================

  messagesPerDay = signal(500);
  tokensInputPerMessage = signal(150);
  tokensOutputPerMessage = signal(300);
  cacheHitRate = signal(0.2);
  activePreset = signal<string | null>(null);

  // ============================================================================
  // SIGNALS - Data State
  // ============================================================================

  models = signal<LlmModel[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  // ============================================================================
  // SIGNALS - Social Proof
  // ============================================================================

  analysisCount = signal(14832); // Start with a realistic number

  // Pricing registry metadata (version, last_updated, etc.)
  pricingMetadata = signal<PricingMetadata | null>(null);

  // ============================================================================
  // SIGNALS - Price Trends (Data Moat)
  // ============================================================================

  // Historical price trend data for all models
  priceTrends = signal<Map<string, PriceTrend>>(new Map());

  // Data depth info (how much history we have)
  priceHistoryDepth = signal<{ snapshots: number; months: number } | null>(null);

  // ============================================================================
  // SIGNALS - Dynamic Model Filter
  // ============================================================================

  // All available models from JSON (populated on load)
  availableModels = signal<LlmModel[]>([]);

  // Selected model IDs for comparison (default: top 3 popular models)
  selectedModelIds = signal<Set<string>>(
    new Set(['gpt-4o', 'gemini-2.0-flash', 'claude-3.5-sonnet']),
  );

  // Computed: filtered models for display based on user selection
  activeModels = computed(() => {
    const selected = this.selectedModelIds();
    return this.models().filter((m) => selected.has(m.id));
  });

  // Ghost update pattern: tracks when explanation is updating
  private explanationUpdatePending = signal(false);
  private explanationVersion = signal(0);
  isExplanationUpdating = computed(() => this.explanationUpdatePending());

  // ============================================================================
  // SIGNALS - Price Alert Modal
  // ============================================================================

  alertModalOpen = signal(false);
  alertModelId = signal('');
  alertModelName = signal('');
  alertPriceInput = signal(0);
  alertMonthlyCost = signal(0);

  // ============================================================================
  // SIGNALS - Lead Capture (Export Options) - No-Friction Flow
  // ============================================================================

  showEmailForm = signal(false); // Email form appears only after clicking Export
  leadEmail = signal('');
  leadSubmitStatus = signal<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  );

  // ============================================================================
  // SIGNALS - Model Routing Simulator (Unique Feature)
  // ============================================================================

  // Enable/disable routing mode
  routingEnabled = signal(false);

  // Primary model (handles simple queries) - typically cheaper
  routingPrimaryModelId = signal<string | null>(null);

  // Secondary model (handles complex queries) - typically smarter
  routingSecondaryModelId = signal<string | null>(null);

  // Percentage of traffic to primary model (0-100)
  routingPrimaryPercent = signal(80);

  // Computed: Blended monthly cost when routing is enabled
  routedMonthlyCost = computed(() => {
    if (!this.routingEnabled()) return null;

    const primaryId = this.routingPrimaryModelId();
    const secondaryId = this.routingSecondaryModelId();
    if (!primaryId || !secondaryId) return null;

    const results = this.results();
    const primaryResult = results.find(r => r.modelId === primaryId);
    const secondaryResult = results.find(r => r.modelId === secondaryId);
    if (!primaryResult || !secondaryResult) return null;

    const primaryPercent = this.routingPrimaryPercent() / 100;
    const secondaryPercent = 1 - primaryPercent;

    const blendedCost = (primaryResult.monthlyCost * primaryPercent) +
                        (secondaryResult.monthlyCost * secondaryPercent);

    // Calculate savings vs using secondary model for everything
    const savingsVsSecondary = secondaryResult.monthlyCost - blendedCost;
    const savingsPercent = (savingsVsSecondary / secondaryResult.monthlyCost) * 100;

    return {
      blendedCost: Math.round(blendedCost * 100) / 100,
      primaryModel: primaryResult.modelName,
      secondaryModel: secondaryResult.modelName,
      primaryCost: primaryResult.monthlyCost,
      secondaryCost: secondaryResult.monthlyCost,
      savingsVsSecondary: Math.round(savingsVsSecondary * 100) / 100,
      savingsPercent: Math.round(savingsPercent * 10) / 10
    };
  });

  // ============================================================================
  // ENGINE METADATA & TRANSPARENCY
  // ============================================================================

  readonly engineMeta = ENGINE_META;
  readonly weightDescriptions = WEIGHT_DESCRIPTIONS;

  // ============================================================================
  // SEO PRESETS - For programmatic distribution
  // ============================================================================

  readonly seoPresets: SeoPreset[] = SEO_PRESETS;
  getPresetUrl = getPresetUrl; // Expose to template

  // Real-time email validation with Signal
  isEmailValid = computed(() => {
    const email = this.leadEmail();
    if (!email) return false;
    // Standard email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  });

  // Can submit only if email is valid and not already submitting
  canSubmitLead = computed(() => {
    return this.isEmailValid() && this.leadSubmitStatus() === 'idle';
  });

  // ============================================================================
  // COMPUTED - Results (instant update)
  // ============================================================================

  results = computed(() => {
    const inputs: SimulatorInputs = {
      messagesPerDay: this.messagesPerDay(),
      tokensInputPerMessage: this.tokensInputPerMessage(),
      tokensOutputPerMessage: this.tokensOutputPerMessage(),
      cacheHitRate: this.cacheHitRate(),
    };
    // Use activeModels() for filtered comparison instead of all models
    return this.logicService.simulateAllModels(inputs, this.activeModels());
  });

  bestModel = computed(() => this.logicService.findBestValue(this.results()));

  runnerUp = computed(() => {
    const all = this.results();
    return all.length > 1 ? all[1] : null;
  });

  // Aggressive Comparison (per spec 3.1) - uses service method
  aggressiveComparison = computed((): AggressiveComparison | null => {
    return this.logicService.calculateAggressiveComparison(this.results());
  });

  // Sensitivity Analysis (per spec 6.1) - cost projections at 2x and 3x traffic
  winnerSensitivity = computed((): SensitivityAnalysis | null => {
    const best = this.bestModel();
    const models = this.models();
    if (!best || models.length === 0) return null;

    const model = models.find((m) => m.id === best.modelId);
    if (!model) return null;

    const inputs: SimulatorInputs = {
      messagesPerDay: this.messagesPerDay(),
      tokensInputPerMessage: this.tokensInputPerMessage(),
      tokensOutputPerMessage: this.tokensOutputPerMessage(),
      cacheHitRate: this.cacheHitRate(),
    };
    return this.logicService.calculateSensitivityAnalysis(inputs, model);
  });

  // Scenario ID - Unique identifier for enterprise audit trails
  scenarioId = computed(() => {
    return generateScenarioId({
      messagesPerDay: this.messagesPerDay(),
      tokensInput: this.tokensInputPerMessage(),
      tokensOutput: this.tokensOutputPerMessage(),
      cacheHitRate: this.cacheHitRate(),
    });
  });

  // ============================================================================
  // COMPUTED - Market Segment Classification
  // ============================================================================

  /**
   * Current market segment based on message volume.
   * Used for "The Reddit Report" aggregation.
   */
  currentSegment = computed((): MarketSegment => {
    return classifySegment(this.messagesPerDay());
  });

  /**
   * Human-readable segment label with description.
   */
  segmentInfo = computed(() => {
    const segment = this.currentSegment();
    return SEGMENT_THRESHOLDS[segment];
  });

  /**
   * Real-time market insights for current segment.
   * Shows aggregate data from other users (privacy-safe).
   */
  marketInsightForSegment = computed(() => {
    const segment = this.currentSegment();
    return this.marketInsightsService.getSegmentInsight(segment);
  });

  /**
   * Average savings reported by users in same segment.
   */
  segmentAverageSavings = computed(() => {
    const segment = this.currentSegment();
    return this.marketInsightsService.getAverageSavings(segment);
  });

  // ============================================================================
  // COMPUTED - Dynamic Labels
  // ============================================================================

  messageVolumeLabel = computed(() => {
    const value = this.messagesPerDay();
    const snap = this.findClosestSnapPoint(value, this.messageSnapPoints);
    return snap?.label ?? 'Custom';
  });

  inputTokensLabel = computed(() => {
    const value = this.tokensInputPerMessage();
    const snap = this.findClosestSnapPoint(value, this.tokenSnapPoints);
    return snap?.label ?? 'Custom';
  });

  outputTokensLabel = computed(() => {
    const value = this.tokensOutputPerMessage();
    // Reuse token snap points with adjusted thresholds
    if (value <= 100) return 'Brief';
    if (value <= 300) return 'Standard';
    if (value <= 800) return 'Detailed';
    if (value <= 1500) return 'Comprehensive';
    return 'Extended';
  });

  cacheLabel = computed(() => {
    const rate = this.cacheHitRate();
    if (rate === 0) return 'No Caching';
    if (rate <= 0.15) return 'Minimal';
    if (rate <= 0.3) return 'Moderate';
    if (rate <= 0.5) return 'Optimized';
    if (rate <= 0.75) return 'Aggressive';
    return 'Maximum';
  });

  // ============================================================================
  // COMPUTED - Winner vs Runner-up Comparison Insights
  // ============================================================================

  comparisonInsights = computed((): ComparisonInsight[] => {
    const best = this.bestModel();
    const second = this.runnerUp();

    if (!best || !second) return [];

    const insights: ComparisonInsight[] = [];

    // Cost comparison
    const costDiff = second.monthlyCost - best.monthlyCost;
    const costPercent = (costDiff / second.monthlyCost) * 100;
    if (costDiff > 0) {
      insights.push({
        icon: '💰',
        text: 'costs less than',
        highlight: `${costPercent.toFixed(0)}% cheaper`,
      });
    }

    // Context window comparison
    const contextRatio = best.contextWindow / second.contextWindow;
    if (contextRatio > 1.5) {
      insights.push({
        icon: '🧠',
        text: 'context window is',
        highlight: `${contextRatio.toFixed(1)}x larger`,
      });
    } else if (contextRatio < 0.7) {
      insights.push({
        icon: '⚡',
        text: 'compensates smaller context with',
        highlight: 'lower cost',
      });
    }

    // Latency comparison
    const latencyDiff = best.latencyIndex - second.latencyIndex;
    if (latencyDiff > 0.05) {
      insights.push({
        icon: '🚀',
        text: 'faster response with',
        highlight: `${(latencyDiff * 100).toFixed(0)}% better latency`,
      });
    }

    // ValueScore advantage
    const scoreDiff =
      ((best.valueScore - second.valueScore) / second.valueScore) * 100;
    if (scoreDiff > 10) {
      insights.push({
        icon: '🏆',
        text: 'overall ValueScore is',
        highlight: `${scoreDiff.toFixed(0)}% higher`,
      });
    }

    return insights.slice(0, 3); // Max 3 insights
  });

  // ============================================================================
  // SERVICES
  // ============================================================================

  private pricingService = inject(PricingDataService);
  private priceHistoryService = inject(PriceHistoryService);
  private logicService = inject(ChatbotSimulatorLogicService);
  private jsonLdService = inject(JsonLdService);
  private analyticsService = inject(AnalyticsService);
  private marketInsightsService = inject(MarketInsightsService);
  private meta = inject(Meta);
  private title = inject(Title);
  private location = inject(Location);
  private platformId = inject(PLATFORM_ID);

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  constructor() {
    // Ghost update effect: trigger fade when inputs change
    effect(() => {
      // Track all inputs
      this.messagesPerDay();
      this.tokensInputPerMessage();
      this.tokensOutputPerMessage();
      this.cacheHitRate();

      // Trigger ghost update
      this.explanationUpdatePending.set(true);

      // Clear after 200ms (matches CSS transition)
      setTimeout(() => {
        this.explanationUpdatePending.set(false);
        this.explanationVersion.update((v) => v + 1);
      }, 200);
    });

    // URL sync effect: update URL when parameters change (browser only)
    effect(() => {
      const m = this.messagesPerDay();
      const ti = this.tokensInputPerMessage();
      const to = this.tokensOutputPerMessage();
      const cr = this.cacheHitRate();

      // Only update URL in browser (not during SSR)
      if (isPlatformBrowser(this.platformId)) {
        this.updateUrlParams(m, ti, to, cr);
        this.updateDynamicMetaTags(m, ti, to, cr);
      }
    });

    // Analytics effect: track simulation_consensus with 2s debounce
    // Per Architect spec: "The Reddit Report" anonymous data intelligence
    effect(() => {
      const winner = this.bestModel();
      const comparison = this.aggressiveComparison();
      const m = this.messagesPerDay();

      if (winner && comparison) {
        // Fire debounced analytics event (2s delay per spec)
        this.analyticsService.trackSimulationConsensus(
          winner.modelId,
          m,
          comparison.savingsPercent,
          this.cacheHitRate(),
          this.tokensInputPerMessage() / this.tokensOutputPerMessage(),
        );
      }
    });
  }

  ngOnInit(): void {
    this.hydrateFromUrl();
    this.setMetaTags();
    this.injectJsonLd();
    this.loadPricingData();
    this.loadPriceTrends();
  }

  ngOnDestroy(): void {
    // Cancel any pending analytics events to prevent memory leaks
    this.analyticsService.cancelPendingEvents();
  }

  // ============================================================================
  // PRESET HANDLERS
  // ============================================================================

  applyPreset(preset: UseCasePreset): void {
    this.activePreset.set(preset.id);
    this.messagesPerDay.set(preset.messagesPerDay);
    this.tokensInputPerMessage.set(preset.tokensInput);
    this.tokensOutputPerMessage.set(preset.tokensOutput);
    this.cacheHitRate.set(preset.cacheHitRate);
  }

  // ============================================================================
  // SLIDER HANDLERS WITH SNAP
  // ============================================================================

  onMessagesChange(value: number): void {
    this.activePreset.set(null); // Clear preset when manually changing
    const snapped = this.snapToNearest(value, this.messageSnapPoints, 500);
    this.messagesPerDay.set(snapped);
  }

  onInputTokensChange(value: number): void {
    this.activePreset.set(null);
    const snapped = this.snapToNearest(value, this.tokenSnapPoints, 50);
    this.tokensInputPerMessage.set(snapped);
  }

  onOutputTokensChange(value: number): void {
    this.activePreset.set(null);
    this.tokensOutputPerMessage.set(value);
  }

  onCacheRateChange(value: number): void {
    this.activePreset.set(null);
    this.cacheHitRate.set(value);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private snapToNearest(
    value: number,
    snapPoints: SnapPoint[],
    threshold: number,
  ): number {
    for (const snap of snapPoints) {
      if (Math.abs(value - snap.value) <= threshold) {
        return snap.value;
      }
    }
    return value;
  }

  private findClosestSnapPoint(
    value: number,
    snapPoints: SnapPoint[],
  ): SnapPoint | null {
    let closest: SnapPoint | null = null;
    let minDiff = Infinity;

    for (const snap of snapPoints) {
      const diff = Math.abs(value - snap.value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = snap;
      }
    }

    // Only return if reasonably close (within 30% of value)
    if (closest && minDiff <= value * 0.3) {
      return closest;
    }
    return null;
  }

  isBestModel(modelId: string): boolean {
    return this.bestModel()?.modelId === modelId;
  }

  /**
   * Determines if a model is recommended based on current usage context.
   * Logic:
   * - High Volume (>10k msg/day) -> Recommend Efficiency Models (Flash, Mini, Haiku)
   * - High Context (>200k tokens) -> Recommend Large Context Models
   * - Coding Preset -> Recommend Reasoning Models (Sonnet, GPT-5, Opus)
   */
  isRecommendedForContext(modelId: string): boolean {
    const m = this.messagesPerDay();
    const id = modelId.toLowerCase();

    // High Efficiency Context (lowered threshold to include Customer Support)
    if (m >= 2000) {
      return (
        id.includes('flash') ||
        id.includes('gpt-5-mini') ||
        id.includes('haiku') ||
        id.includes('deepseek')
      );
    }

    // High Context Logic (>100k tokens input)
    if (this.tokensInputPerMessage() >= 100000) {
      return (
        id.includes('pro') || // GPT-5.2 Pro / Gemini 3 Pro
        id.includes('flash') // Gemini Flash (1M)
      );
    }

    // Default/Reasoning Context (Low Volume)
    if (m < 2000) {
      return (
        id.includes('pro') ||
        id.includes('sonnet') ||
        (id.includes('gpt-5-2') && !id.includes('pro'))
      );
    }

    return false;
  }

  formatCacheRate(): string {
    return `${Math.round(this.cacheHitRate() * 100)}%`;
  }

  // ============================================================================
  // MODEL FILTER HANDLERS
  // ============================================================================

  /**
   * Toggles a model's selection state for comparison.
   * Enforces minimum 1 model and maximum 5 models constraint.
   */
  toggleModel(modelId: string): void {
    const current = this.selectedModelIds();
    const updated = new Set(current);

    if (updated.has(modelId)) {
      // Minimum 1 model required
      if (updated.size > 1) {
        updated.delete(modelId);
      }
    } else {
      // Maximum 5 models for readability
      if (updated.size < 5) {
        updated.add(modelId);
      }
    }

    this.selectedModelIds.set(updated);
  }

  /**
   * Checks if a model can be deselected (more than 1 model selected).
   */
  canDeselectModel(): boolean {
    return this.selectedModelIds().size > 1;
  }

  /**
   * Checks if more models can be selected (fewer than 5 selected).
   */
  canSelectMoreModels(): boolean {
    return this.selectedModelIds().size < 5;
  }

  /**
   * Checks if a model is currently selected for comparison.
   */
  isModelSelected(modelId: string): boolean {
    return this.selectedModelIds().has(modelId);
  }

  // ============================================================================
  // MODEL ROUTING HANDLERS
  // ============================================================================

  /**
   * Toggles routing mode on/off.
   * When enabled, allows splitting traffic between two models.
   */
  toggleRouting(): void {
    const newState = !this.routingEnabled();
    this.routingEnabled.set(newState);

    // Set defaults when enabling
    if (newState && this.activeModels().length >= 2) {
      const sorted = [...this.results()].sort((a, b) => a.monthlyCost - b.monthlyCost);
      // Primary = cheapest, Secondary = most expensive of selected
      this.routingPrimaryModelId.set(sorted[0]?.modelId ?? null);
      this.routingSecondaryModelId.set(sorted[sorted.length - 1]?.modelId ?? null);
    }
  }

  /**
   * Sets the primary (cheap) model for routing.
   */
  setRoutingPrimary(modelId: string): void {
    this.routingPrimaryModelId.set(modelId);
  }

  /**
   * Sets the secondary (smart) model for routing.
   */
  setRoutingSecondary(modelId: string): void {
    this.routingSecondaryModelId.set(modelId);
  }

  /**
   * Updates the routing percentage split.
   */
  setRoutingPercent(percent: number): void {
    this.routingPrimaryPercent.set(Math.min(100, Math.max(0, percent)));
  }

  // ============================================================================
  // PRICE ALERT HANDLERS
  // ============================================================================

  openPriceAlert(modelId: string, modelName: string, priceInput: number, monthlyCost: number): void {
    this.alertModelId.set(modelId);
    this.alertModelName.set(modelName);
    this.alertPriceInput.set(priceInput);
    this.alertMonthlyCost.set(monthlyCost);
    this.alertModalOpen.set(true);
  }

  closePriceAlert(): void {
    this.alertModalOpen.set(false);
  }

  // ============================================================================
  // LEAD CAPTURE HANDLERS
  // ============================================================================

  onExportClick(): void {
    // No-friction flow: reveal email form on first click
    this.showEmailForm.set(true);
  }

  onEmailChange(email: string): void {
    this.leadEmail.set(email.trim());
    // Reset status when email changes
    if (this.leadSubmitStatus() !== 'idle') {
      this.leadSubmitStatus.set('idle');
    }
  }

  onDownloadReport(): void {
    if (!this.canSubmitLead()) return;

    this.leadSubmitStatus.set('submitting');

    const sensitivity = this.winnerSensitivity();
    const currentScenarioId = this.scenarioId();

    // Collect lead data with current simulation parameters (per spec 6.2)
    const leadData = {
      userEmail: this.leadEmail(),
      scenarioId: currentScenarioId,
      simulationId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      inputs: {
        messagesPerDay: this.messagesPerDay(),
        tokens: {
          input: this.tokensInputPerMessage(),
          output: this.tokensOutputPerMessage(),
        },
        cacheRate: this.cacheHitRate(),
        activePreset: this.activePreset(),
      },
      results: {
        winnerId: this.bestModel()?.modelId,
        winnerName: this.bestModel()?.modelName,
        savingsVsRunnerUp: this.aggressiveComparison()?.savingsPercent ?? 0,
        annualProjectedCost: sensitivity?.annualCost1x ?? 0,
        allModels: this.results().map((r) => ({
          id: r.modelId,
          name: r.modelName,
          monthlyCost: r.monthlyCost,
          valueScore: r.valueScore,
        })),
      },
      sensitivityAnalysis: sensitivity
        ? {
            cost1x: sensitivity.cost1x,
            cost2x: sensitivity.cost2x,
            cost3x: sensitivity.cost3x,
            annualCost1x: sensitivity.annualCost1x,
            annualCost2x: sensitivity.annualCost2x,
            annualCost3x: sensitivity.annualCost3x,
          }
        : null,
    };

    // Mock execution: log to console
    console.log('📧 Lead Captured:', leadData);

    // Dynamic import for client-side PDF generation
    if (isPlatformBrowser(this.platformId)) {
      // Use functional approach: autoTable(doc, options) instead of doc.autoTable()
      Promise.all([import('jspdf'), import('jspdf-autotable')])
        .then(([jsPDFModule, autoTableModule]) => {
          const jsPDF = jsPDFModule.default;
          const autoTable = autoTableModule.default;
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.width;

          // --- Header ---
          doc.setFontSize(20);
          doc.setTextColor(40, 40, 40);
          doc.text('LLM Cost Analysis: Executive Report', 14, 22);

          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Generated for: ${this.leadEmail()}`, 14, 30);
          doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
          doc.text(`Scenario ID: ${currentScenarioId}`, 14, 40);
          if (this.pricingMetadata()) {
            doc.text(
              `Pricing Benchmark: v${this.pricingMetadata()?.version}`,
              14,
              45,
            );
          }

          // --- Executive Summary (Winner) ---
          const winner = this.bestModel();
          if (winner) {
            doc.setFillColor(240, 248, 255); // AliceBlue
            doc.rect(14, 50, pageWidth - 28, 40, 'F');

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Recommendation: ' + winner.modelName, 20, 60);

            doc.setFontSize(11);
            doc.setTextColor(60);
            doc.text(
              `Annual Projected Cost: $${(sensitivity?.annualCost1x || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              20,
              70,
            );

            if (this.aggressiveComparison()?.savingsPercent) {
              doc.setTextColor(0, 100, 0); // Green
              doc.text(
                `Savings vs Runner-up: ${this.aggressiveComparison()?.savingsPercent}%`,
                20,
                80,
              );
            }
          }

          // --- Inputs ---
          doc.setTextColor(0);
          doc.setFontSize(12);
          doc.text('Scenario Parameters', 14, 105);

          const inputsData = [
            ['Messages / Day', this.messagesPerDay().toLocaleString()],
            ['Input Tokens', this.tokensInputPerMessage().toLocaleString()],
            ['Output Tokens', this.tokensOutputPerMessage().toLocaleString()],
            ['Cache Hit Rate', `${Math.round(this.cacheHitRate() * 100)}%`],
          ];

          // Use functional call: autoTable(doc, options)
          autoTable(doc, {
            startY: 110,
            head: [['Parameter', 'Value']],
            body: inputsData,
            theme: 'plain',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [220, 220, 220] },
          });

          // --- Detailed Comparison ---
          // Get finalY from doc.lastAutoTable (set by autoTable function)
          const firstTableY = (doc as any).lastAutoTable?.finalY || 150;
          doc.text('Model Comparison (Monthly TCO)', 14, firstTableY + 15);

          const comparisonData = this.results().map((r, index) => [
            r.modelName,
            `$${r.monthlyCost.toFixed(2)}`,
            r.valueScore.toFixed(4),
            index === 0 ? 'WINNER' : `#${index + 1}`,
          ]);

          autoTable(doc, {
            startY: firstTableY + 20,
            head: [['Model', 'Monthly Cost', 'ValueScore™', 'Rank']],
            body: comparisonData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
          });

          // --- Disclaimer ---
          const secondTableY = (doc as any).lastAutoTable?.finalY || 200;
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            'DISCLAIMER: This report is a deterministic engineering simulation based on public pricing.',
            14,
            secondTableY + 15,
          );
          doc.text(
            'It does not constitute financial advice or a binding procurement offer.',
            14,
            secondTableY + 20,
          );

          // Add pricing version
          const pricingVersion = this.pricingMetadata()?.version || '1.0.0';
          doc.text(
            `Generated by LLM Cost Engine · Pricing Data v${pricingVersion}`,
            14,
            secondTableY + 25,
          );

          // Save
          doc.save(`LLM_Analysis_${currentScenarioId}.pdf`);

          this.leadSubmitStatus.set('success');
        })
        .catch((err) => {
          console.error('PDF generation failed:', err);
          this.leadSubmitStatus.set('error');
        });
    } else {
      // Fallback for SSR
      this.leadSubmitStatus.set('success');
    }
  }

  resetLeadForm(): void {
    this.showEmailForm.set(false);
    this.leadEmail.set('');
    this.leadSubmitStatus.set('idle');
  }

  /**
   * Quick PDF export - No email required.
   * Generates a basic comparison PDF for casual users.
   */
  downloadQuickPdf(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    Promise.all([import('jspdf'), import('jspdf-autotable')])
      .then(([jsPDFModule, autoTableModule]) => {
        const jsPDF = jsPDFModule.default;
        const autoTable = autoTableModule.default;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('LLM Cost Comparison', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
        doc.text(`Scenario: ${this.scenarioId()}`, 14, 33);

        // Quick comparison table
        const data = this.results().map((r, i) => [
          i === 0 ? '>> ' + r.modelName : r.modelName,
          r.provider,
          `$${r.monthlyCost.toFixed(2)}`,
          r.valueScore.toFixed(4),
        ]);

        autoTable(doc, {
          startY: 45,
          head: [['Model', 'Provider', 'Monthly Cost', 'ValueScore']],
          body: data,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] },
        });

        // Footer
        const finalY = (doc as any).lastAutoTable?.finalY || 100;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Quick export from LLM Cost Engine', 14, finalY + 15);
        doc.text(
          'For detailed analysis with sensitivity projections, use "Get Enterprise Report"',
          14,
          finalY + 20,
        );

        doc.save(`LLM_Quick_${this.scenarioId()}.pdf`);
      })
      .catch((err) => {
        console.error('Quick PDF generation failed:', err);
      });
  }

  retryLoad(): void {
    this.loadError.set(null);
    this.loadPricingData();
  }

  // ============================================================================
  // URL PARAMETER HYDRATION (Deep Linking)
  // ============================================================================

  /**
   * Reads URL parameters and initializes signals.
   * URL format: ?m=500&ti=150&to=300&cr=20
   */
  private hydrateFromUrl(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const params = new URLSearchParams(window.location.search);

    const m = params.get('m');
    const ti = params.get('ti');
    const to = params.get('to');
    const cr = params.get('cr');

    if (m) {
      const value = parseInt(m, 10);
      if (!isNaN(value) && value >= 100 && value <= 100000) {
        this.messagesPerDay.set(value);
      }
    }

    if (ti) {
      const value = parseInt(ti, 10);
      if (!isNaN(value) && value >= 50 && value <= 5000) {
        this.tokensInputPerMessage.set(value);
      }
    }

    if (to) {
      const value = parseInt(to, 10);
      if (!isNaN(value) && value >= 50 && value <= 10000) {
        this.tokensOutputPerMessage.set(value);
      }
    }

    if (cr) {
      const value = parseInt(cr, 10);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        this.cacheHitRate.set(value / 100);
      }
    }
  }

  /**
   * Updates URL parameters without page reload.
   * Uses replaceState to avoid polluting browser history.
   * Path: /tools/chatbot-simulator?m=X&ti=X&to=X&cr=X
   */
  private updateUrlParams(m: number, ti: number, to: number, cr: number): void {
    const params = new URLSearchParams({
      m: m.toString(),
      ti: ti.toString(),
      to: to.toString(),
      cr: Math.round(cr * 100).toString(),
    });

    // Always use the canonical path for SEO consistency
    const newUrl = `/tools/chatbot-simulator?${params.toString()}`;
    this.location.replaceState(newUrl);
  }

  /**
   * Updates meta tags dynamically based on current parameters.
   * Enables unique SEO for each parameter combination.
   * Implements Programmatic SEO: ogni stato = URL unico = landing page indicizzabile.
   */
  private updateDynamicMetaTags(
    m: number,
    ti: number,
    to: number,
    cr: number,
  ): void {
    const winner = this.bestModel();
    const formattedMessages =
      m >= 1000 ? `${(m / 1000).toFixed(0)}K` : m.toString();

    // Dynamic title based on volume - Long-tail keyword targeting
    let volumeDesc = 'Custom';
    if (m <= 500) volumeDesc = 'Startup';
    else if (m <= 5000) volumeDesc = 'Growth Stage';
    else if (m <= 25000) volumeDesc = 'Enterprise';
    else volumeDesc = 'High-Volume';

    // Long-tail optimized: "Costo chatbot 10000 messaggi" → matches search intent
    const dynamicTitle = winner
      ? `LLM Cost Analysis: ${formattedMessages} messages/day - ${winner.modelName} wins`
      : `LLM Cost Analysis: ${formattedMessages} messages/day | ${ENGINE_META.fullName}`;

    const dynamicDescription = winner
      ? `TCO analysis for ${volumeDesc} deployment (${formattedMessages} msg/day). ${winner.modelName} offers best value at $${winner.monthlyCost.toFixed(2)}/mo. Compare GPT-4o, Claude, Gemini.`
      : `Calculate LLM costs for ${formattedMessages} messages/day. Compare GPT-4o, Claude 3.5, and Gemini pricing with our deterministic ValueScore algorithm.`;

    // Update meta tags
    this.title.setTitle(dynamicTitle);
    this.meta.updateTag({ name: 'description', content: dynamicDescription });
    this.meta.updateTag({ property: 'og:title', content: dynamicTitle });
    this.meta.updateTag({
      property: 'og:description',
      content: dynamicDescription,
    });

    // Canonical URL - Critical for Programmatic SEO (prevents duplicate content)
    const canonicalUrl = `https://llm-cost-engine.vercel.app/tools/chatbot-simulator?m=${m}&ti=${ti}&to=${to}&cr=${Math.round(cr * 100)}`;
    this.updateCanonicalLink(canonicalUrl);

    // Open Graph URL for social sharing
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
  }

  /**
   * Updates or creates the canonical link element.
   * Each unique parameter combination = unique canonical URL.
   */
  private updateCanonicalLink(url: string): void {
    let link = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  // ============================================================================
  // META & SEO
  // ============================================================================

  private injectJsonLd(): void {
    // SoftwareApplication schema
    this.jsonLdService.injectSoftwareApplicationSchema(
      {
        name: ENGINE_META.fullName,
        description:
          'Enterprise-grade TCO analysis for LLM deployments. Compare GPT-4o, Gemini 1.5 Pro, and Claude 3.5 Sonnet with deterministic ValueScore methodology.',
        url: 'https://llm-cost-engine.vercel.app',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        softwareVersion: ENGINE_META.version,
        featureList: [
          'Multi-provider LLM TCO comparison',
          'Real-time cost calculation with Angular Signals',
          'Prompt Caching ROI estimation',
          'Deterministic ValueScore algorithm',
          'Sensitivity Analysis (2x/3x traffic projections)',
          'Export signed PDF for CTO/CFO approval',
        ],
        aggregateRating: {
          ratingValue: '4.8',
          ratingCount: '127',
        },
      },
      'llm-cost-engine',
    );

    // FAQPage schema for rich snippets
    this.jsonLdService.injectFAQPageSchema(
      [
        {
          question: 'Why do input and output tokens have different prices?',
          answer:
            'LLM providers charge more for generation (output) than for reading (input). Output requires more computational resources as the model predicts each token sequentially. LLM Cost Engine separates these costs for accurate TCO projections.',
        },
        {
          question: 'How does Prompt Caching affect TCO?',
          answer:
            'Prompt Caching stores static prompt components (system instructions, knowledge bases) for reuse at significant discounts (50-90% cheaper). Without cache, you pay full price for system prompts on every API call. With cache, you pay a one-time write cost, then discounted read costs on subsequent calls.',
        },
        {
          question: 'Why is Context Window factored into ValueScore?',
          answer:
            'For enterprise LLM deployments, context capacity is critical for maintaining conversation state, processing documents, and avoiding context overflow errors. We apply logarithmic scaling to acknowledge diminishing returns while ensuring we recommend models that succeed at production workloads.',
        },
        {
          question: 'Can I use the TCO Analysis for procurement?',
          answer:
            'Yes. The exported PDF includes a signed analysis with deterministic methodology, sensitivity projections, and vendor comparison matrix — formatted for CTO/CFO review and procurement documentation.',
        },
      ],
      'llm-cost-engine-faq',
    );
  }

  private setMetaTags(): void {
    this.title.setTitle(
      `${ENGINE_META.fullName}: TCO Analysis for GPT-4o, Claude 3.5 & Gemini`,
    );
    this.meta.updateTag({
      name: 'description',
      content:
        'Enterprise TCO analysis for LLM deployments. Compare monthly costs for GPT-4o, Gemini 1.5 Pro, and Claude 3.5 Sonnet. Export signed PDF reports for CTO/CFO approval.',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: `${ENGINE_META.fullName} - Enterprise LLM Cost Analysis`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Deterministic TCO analysis for LLM vendor selection. ValueScore methodology balances cost efficiency with contextual capacity for data-driven decisions.',
    });
  }

  private loadPricingData(): void {
    this.isLoading.set(true);
    // Uses TransferState: SSR fetches once, client reuses cached data (zero CLS)
    this.pricingService.loadPricingData().subscribe({
      next: (data) => {
        this.models.set(data.models);
        // Populate availableModels with all models from JSON for filter UI
        this.availableModels.set(data.models);
        // Store metadata if present in the JSON registry
        if (data.metadata) {
          this.pricingMetadata.set(data.metadata);
        }
        this.isLoading.set(false);
        this.loadError.set(null);
      },
      error: (err) => {
        console.error('Failed to load pricing data', err);
        this.isLoading.set(false);
        this.loadError.set('Failed to load pricing data. Please check your connection and try again.');
      },
    });
  }

  /**
   * Loads historical price trend data for the Data Moat feature.
   * This runs asynchronously and doesn't block the main UI.
   */
  private loadPriceTrends(): void {
    // Load price trends in background (non-blocking)
    this.priceHistoryService.calculatePriceTrends().subscribe({
      next: (trends) => {
        const trendMap = new Map<string, PriceTrend>();
        trends.forEach(trend => trendMap.set(trend.model_id, trend));
        this.priceTrends.set(trendMap);
      },
      error: (err) => {
        // Silently fail - trends are a nice-to-have feature
        console.warn('Failed to load price trends:', err);
      },
    });

    // Load data depth info
    this.priceHistoryService.getDataDepth().subscribe({
      next: (depth) => {
        this.priceHistoryDepth.set({ snapshots: depth.snapshots, months: depth.months });
      },
      error: () => {
        // Silently ignore
      },
    });
  }

  /**
   * Gets the price trend for a specific model.
   * Returns null if no trend data available.
   */
  getPriceTrend(modelId: string): PriceTrend | null {
    return this.priceTrends().get(modelId) ?? null;
  }

  /**
   * Gets a human-readable trend indicator for a model.
   */
  getTrendIndicator(modelId: string): { icon: string; label: string; color: string } | null {
    const trend = this.getPriceTrend(modelId);
    if (!trend || trend.change_30d_percent === null) return null;

    if (trend.trend_direction === 'down') {
      return {
        icon: '↓',
        label: `${Math.abs(trend.change_30d_percent)}% cheaper`,
        color: 'text-green-600'
      };
    } else if (trend.trend_direction === 'up') {
      return {
        icon: '↑',
        label: `${Math.abs(trend.change_30d_percent)}% increase`,
        color: 'text-red-600'
      };
    }
    return {
      icon: '→',
      label: 'Stable',
      color: 'text-gray-500'
    };
  }
}
