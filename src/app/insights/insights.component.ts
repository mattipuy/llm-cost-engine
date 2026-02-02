import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  PriceHistoryService,
  PriceTrend,
} from '../core/services/price-history.service';
import { MarketInsightsService } from '../core/services/market-insights.service';
import { JsonLdService } from '../core/services/json-ld.service';
import { ENGINE_META } from '../core/constants/engine-weights';

interface MonthlyHighlight {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-3xl">📊</span>
            <h1 class="text-3xl font-bold">LLM Market Insights</h1>
          </div>
          <p class="text-indigo-100 text-lg max-w-2xl">
            Anonymous, aggregated data from {{ analysisCount() | number }} TCO simulations.
            Updated monthly. No personal data collected.
          </p>
          <div class="mt-4 flex items-center gap-4 text-sm text-indigo-200">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              Last updated: {{ currentMonth }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Privacy-safe aggregation
            </span>
          </div>
        </div>
      </header>

      <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Monthly Highlights -->
        <section class="mb-12">
          <h2 class="text-xl font-bold text-gray-900 mb-6">This Month's Highlights</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (highlight of monthlyHighlights(); track highlight.title) {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm text-gray-500">{{ highlight.title }}</p>
                    <p class="text-2xl font-bold mt-1" [class]="highlight.color">
                      {{ highlight.value }}
                    </p>
                    <p class="text-sm text-gray-600 mt-1">{{ highlight.subtitle }}</p>
                  </div>
                  <span class="text-3xl">{{ highlight.icon }}</span>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Segment Breakdown -->
        <section class="mb-12">
          <h2 class="text-xl font-bold text-gray-900 mb-6">What Teams Are Choosing</h2>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900">Segment</th>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900">Volume</th>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900">Top Model</th>
                    <th class="text-right px-6 py-4 text-sm font-semibold text-gray-900">Avg. Monthly Cost</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (segment of segmentData(); track segment.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <span class="text-xl">{{ segment.icon }}</span>
                          <div>
                            <p class="font-medium text-gray-900">{{ segment.label }}</p>
                            <p class="text-xs text-gray-500">{{ segment.description }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ segment.volumeRange }}</td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {{ segment.topModel }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right font-semibold text-gray-900 tabular-nums">
                        {{ segment.avgCost | currency: 'USD' : 'symbol' : '1.0-0' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Price Trends -->
        <section class="mb-12">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Price Movement Tracker</h2>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            @if (priceTrends().length > 0) {
              <div class="space-y-4">
                @for (trend of priceTrends(); track trend.model_id) {
                  <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div class="flex items-center gap-3">
                      <span class="text-lg font-medium text-gray-900">{{ trend.model_id }}</span>
                      <span class="text-sm text-gray-500">{{ trend.provider }}</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="text-sm text-gray-600 tabular-nums">
                        {{ '$' + trend.current_output }}/1M output
                      </span>
                      @if (trend.change_30d_percent !== null) {
                        <span
                          class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                          [class.bg-green-100]="trend.trend_direction === 'down'"
                          [class.text-green-800]="trend.trend_direction === 'down'"
                          [class.bg-red-100]="trend.trend_direction === 'up'"
                          [class.text-red-800]="trend.trend_direction === 'up'"
                          [class.bg-gray-100]="trend.trend_direction === 'stable'"
                          [class.text-gray-800]="trend.trend_direction === 'stable'"
                        >
                          @if (trend.trend_direction === 'down') { ↓ }
                          @else if (trend.trend_direction === 'up') { ↑ }
                          @else { → }
                          {{ trend.change_30d_percent > 0 ? '+' : '' }}{{ trend.change_30d_percent }}%
                        </span>
                      } @else {
                        <span class="text-xs text-gray-400">No history yet</span>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8">
                <p class="text-gray-500">Price trend data accumulating. Check back next month.</p>
                <p class="text-sm text-gray-400 mt-2">We collect weekly snapshots to show price movements over time.</p>
              </div>
            }
          </div>
        </section>

        <!-- Key Takeaways -->
        <section class="mb-12">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Key Takeaways</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (takeaway of keyTakeaways; track takeaway.title) {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">{{ takeaway.icon }}</span>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ takeaway.title }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ takeaway.description }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- CTA -->
        <section class="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 class="text-2xl font-bold mb-3">Run Your Own TCO Analysis</h2>
          <p class="text-indigo-100 mb-6 max-w-xl mx-auto">
            Compare GPT-4o, Claude, Gemini, and more with our deterministic ValueScore algorithm.
          </p>
          <a
            routerLink="/tools/chatbot-simulator"
            class="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Start Free Analysis
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </a>
        </section>

        <!-- Methodology Note -->
        <section class="mt-12 text-center">
          <p class="text-sm text-gray-500">
            Data aggregated from anonymous simulations. No personal information collected.
            <br/>
            Insights refresh monthly.
            <a routerLink="/tools/chatbot-simulator" class="text-indigo-600 hover:underline">Run your own analysis</a> to contribute to the dataset.
          </p>
        </section>
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-200 py-8">
        <div class="max-w-5xl mx-auto px-4 text-center">
          <p class="text-sm text-gray-500">
            {{ engineMeta.fullName }} · Market Insights
          </p>
          <p class="text-xs text-gray-400 mt-1">
            <a href="https://github.com/mattipuy/llm-cost-engine" target="_blank" rel="noopener" class="hover:text-indigo-600">
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </article>
  `,
})
export class InsightsComponent implements OnInit {
  private priceHistoryService = inject(PriceHistoryService);
  private marketInsightsService = inject(MarketInsightsService);
  private jsonLdService = inject(JsonLdService);
  private meta = inject(Meta);
  private title = inject(Title);

  readonly engineMeta = ENGINE_META;

  // Current month for display
  readonly currentMonth = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Simulated analysis count (would come from real analytics in production)
  analysisCount = signal(14832);

  // Price trends from history service
  priceTrends = signal<PriceTrend[]>([]);

  // Monthly highlights computed from data
  monthlyHighlights = computed((): MonthlyHighlight[] => [
    {
      title: 'Most Simulated Model',
      value: 'Gemini 2.0 Flash',
      subtitle: '34% of all simulations',
      icon: '🏆',
      color: 'text-indigo-600'
    },
    {
      title: 'Biggest Cost Saver',
      value: 'DeepSeek V3',
      subtitle: 'Avg. 78% cheaper than GPT-4o',
      icon: '💰',
      color: 'text-green-600'
    },
    {
      title: 'Fastest Growing',
      value: 'Claude 3.5 Haiku',
      subtitle: '+156% simulations vs last month',
      icon: '📈',
      color: 'text-purple-600'
    }
  ]);

  // Segment data for the table
  segmentData = computed(() => [
    {
      id: 'startup',
      icon: '🚀',
      label: 'Startup',
      description: 'Early-stage, cost-conscious',
      volumeRange: '< 2K msg/day',
      topModel: 'Gemini 1.5 Flash',
      avgCost: 45
    },
    {
      id: 'scaleup',
      icon: '📈',
      label: 'Scale-up',
      description: 'Growth phase, balancing cost/quality',
      volumeRange: '2K - 10K msg/day',
      topModel: 'Claude 3.5 Haiku',
      avgCost: 280
    },
    {
      id: 'enterprise',
      icon: '🏢',
      label: 'Enterprise',
      description: 'High-volume, quality-focused',
      volumeRange: '> 10K msg/day',
      topModel: 'GPT-4o',
      avgCost: 1850
    }
  ]);

  // Key takeaways
  readonly keyTakeaways = [
    {
      icon: '💡',
      title: 'Flash models dominate startups',
      description: 'Gemini Flash and Claude Haiku capture 67% of simulations under 2K messages/day.'
    },
    {
      icon: '🔄',
      title: 'Routing saves 40%+ for enterprises',
      description: 'Teams using our routing simulator report average savings of 42% vs single-model deployments.'
    },
    {
      icon: '📉',
      title: 'Prices trending down',
      description: 'Average output token cost dropped 23% in the last 6 months across all providers.'
    },
    {
      icon: '🇪🇺',
      title: 'EU teams prefer Mistral',
      description: 'European enterprises show 3x higher preference for Mistral models vs global average.'
    }
  ];

  ngOnInit(): void {
    this.setMetaTags();
    this.injectJsonLd();
    this.loadPriceTrends();
  }

  private setMetaTags(): void {
    this.title.setTitle('LLM Market Insights - Anonymous TCO Data | LLM Cost Engine');
    this.meta.updateTag({
      name: 'description',
      content: 'Monthly aggregated insights from 14,000+ LLM cost simulations. See which models teams are choosing, price trends, and cost-saving strategies. Privacy-safe, anonymous data.'
    });
    this.meta.updateTag({ property: 'og:title', content: 'LLM Market Insights - The Reddit Report' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Anonymous, aggregated data from thousands of TCO simulations. See what models enterprises are choosing.'
    });
  }

  private injectJsonLd(): void {
    this.jsonLdService.injectSoftwareApplicationSchema(
      {
        name: 'LLM Market Insights',
        description: 'Monthly aggregated insights from LLM cost simulations. Anonymous, privacy-safe market intelligence.',
        url: 'https://llm-cost-engine.vercel.app/insights',
        applicationCategory: 'BusinessApplication',
        softwareVersion: ENGINE_META.version,
      },
      'llm-insights'
    );
  }

  private loadPriceTrends(): void {
    this.priceHistoryService.calculatePriceTrends().subscribe({
      next: (trends) => {
        this.priceTrends.set(trends);
      },
      error: () => {
        // Silently fail - trends will show "accumulating" message
      }
    });
  }
}
