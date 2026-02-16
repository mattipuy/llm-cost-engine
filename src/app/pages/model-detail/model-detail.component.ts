import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { PricingDataService } from '../../core/services/pricing-data.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { LlmModel } from '../../engines/chatbot-simulator/logic.service';
import { PriceAlertModalComponent } from '../../shared/components/price-alert-modal/price-alert-modal.component';

@Component({
  selector: 'app-model-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PriceAlertModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './model-detail.component.html',
  styles: [`
    :host {
      display: block;
    }
    .tabular-nums {
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class ModelDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pricingService = inject(PricingDataService);
  private analytics = inject(AnalyticsService);
  private jsonLdService = inject(JsonLdService);
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);

  // Signals
  modelId = signal<string | null>(null);
  model = signal<LlmModel | null>(null);
  allModels = signal<LlmModel[]>([]);
  isLoading = signal(true);
  notFound = signal(false);
  alertModalOpen = signal(false);

  // Computed
  providerModels = computed(() => {
    const current = this.model();
    if (!current) return [];
    return this.allModels().filter(m => m.provider === current.provider && m.id !== current.id);
  });

  competitorModels = computed(() => {
    const current = this.model();
    if (!current) return [];
    return this.allModels()
      .filter(m => m.provider !== current.provider)
      .slice(0, 5); // Top 5 competitors
  });

  ngOnInit(): void {
    // Subscribe to route param changes to handle navigation between models
    this.route.paramMap.subscribe(params => {
      const id = params.get('modelId');
      this.modelId.set(id);

      // Reset state
      this.isLoading.set(true);
      this.notFound.set(false);

      // Load pricing data
      this.loadModelData(id);

      // Track page view (only in browser)
      if (isPlatformBrowser(this.platformId)) {
        this.analytics.trackPageView(`/models/${id}`);
      }
    });
  }

  private async loadModelData(modelId: string | null): Promise<void> {
    if (!modelId) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    try {
      this.pricingService
        .loadPricingData()
        .subscribe({
          next: (data: { models: LlmModel[] }) => {
            this.allModels.set(data.models);
            const model = data.models.find((m: LlmModel) => m.id === modelId);

            if (model) {
              this.model.set(model);
              this.setMetaTags(model);
              this.injectJsonLd(model);
            } else {
              this.notFound.set(true);
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.notFound.set(true);
            this.isLoading.set(false);
          }
        });
    } catch (error) {
      this.notFound.set(true);
      this.isLoading.set(false);
    }
  }

  private setMetaTags(model: LlmModel): void {
    const titleText = `${model.name} Pricing & Cost Analysis | LLM Cost Engine`;
    const description = `${model.name} by ${model.provider}: $${model.pricing.input_1m}/1M input tokens, $${model.pricing.output_1m}/1M output. Compare pricing, context window (${model.capabilities.context_window?.toLocaleString()} tokens), and caching discounts.`;

    this.title.setTitle(titleText);
    this.meta.updateTag({ name: 'description', content: description });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: titleText });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: `https://llm-cost-engine.com/models/${model.id}` });
    this.meta.updateTag({ property: 'og:type', content: 'product' });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: titleText });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  private injectJsonLd(model: LlmModel): void {
    // Product Schema.org markup
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': model.name,
      'brand': {
        '@type': 'Brand',
        'name': model.provider
      },
      'description': `${model.name} Language Model API with ${model.capabilities.context_window?.toLocaleString()} token context window. Input: $${model.pricing.input_1m}/1M tokens, Output: $${model.pricing.output_1m}/1M tokens.`,
      'offers': {
        '@type': 'Offer',
        'price': model.pricing.input_1m.toString(),
        'priceCurrency': 'USD',
        'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        'availability': 'https://schema.org/InStock',
        'seller': {
          '@type': 'Organization',
          'name': model.provider
        }
      },
      'category': 'Large Language Model API',
      'additionalProperty': [
        {
          '@type': 'PropertyValue',
          'name': 'Context Window',
          'value': `${model.capabilities.context_window?.toLocaleString()} tokens`
        },
        {
          '@type': 'PropertyValue',
          'name': 'Output Pricing',
          'value': `$${model.pricing.output_1m}/1M tokens`
        }
      ]
    };

    if (model.pricing.cached_input_1m !== undefined) {
      productSchema.additionalProperty.push({
        '@type': 'PropertyValue',
        'name': 'Cached Input Pricing',
        'value': `$${model.pricing.cached_input_1m}/1M tokens`
      });
    }

    // Breadcrumb Schema.org markup
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://llm-cost-engine.com'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Models',
          'item': 'https://llm-cost-engine.com/models'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': model.name,
          'item': `https://llm-cost-engine.com/models/${model.id}`
        }
      ]
    };

    this.jsonLdService.injectCustomSchema(productSchema, 'model-product-schema');
    this.jsonLdService.injectCustomSchema(breadcrumbSchema, 'model-breadcrumb-schema');
  }

  openAlertModal(): void {
    this.alertModalOpen.set(true);
  }

  closeAlertModal(): void {
    this.alertModalOpen.set(false);
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) return 'N/A';
    return `$${price.toFixed(2)}`;
  }

  getCacheDiscount(model: LlmModel): number | null {
    if (!model.pricing.cached_input_1m || !model.pricing.input_1m) return null;
    return Math.round((1 - model.pricing.cached_input_1m / model.pricing.input_1m) * 100);
  }
}
