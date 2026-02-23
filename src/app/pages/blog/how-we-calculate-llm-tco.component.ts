import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService, SeoMetaService, AnalyticsService } from '../../core/services';

@Component({
  selector: 'app-how-we-calculate-llm-tco',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './how-we-calculate-llm-tco.component.html',
})
export class HowWeCalculateLlmTcoComponent implements OnInit {
  private readonly seoMeta = inject(SeoMetaService);
  private readonly jsonLd = inject(JsonLdService);
  private readonly analytics = inject(AnalyticsService);

  private readonly CANONICAL_URL =
    'https://llm-cost-engine.com/blog/how-we-calculate-llm-tco';

  private readonly OG_IMAGE =
    'https://llm-cost-engine.com/assets/og-image.png'; // TODO: Create blog-specific image

  ngOnInit(): void {
    const title = 'How We Calculate LLM TCO | LLM Cost Engine';
    const headline = 'We Open-Sourced the Math Behind LLM Cost Rankings';
    const description =
      'A transparent breakdown of our deterministic LLM monthly cost calculation methodology. 15 models, 6 providers, weekly price tracking. Includes real-world cost scenarios for support bots, RAG, and dev tools.';
    const imageAlt =
      'LLM monthly cost estimation formula showing input/output token pricing breakdown for Claude Sonnet 4.6, GPT-5.1, and Gemini 3.1 Pro';

    // Update all SEO meta tags (OG + Twitter)
    this.seoMeta.updateMetaTags({
      title,
      description,
      url: this.CANONICAL_URL,
      type: 'article',
      image: this.OG_IMAGE,
      imageAlt,
      twitterCard: 'summary_large_image',
      publishedTime: '2026-02-10T00:00:00Z',
    });

    // Inject JSON-LD Article schema
    this.jsonLd.injectArticleSchema(
      {
        headline,
        description,
        datePublished: '2026-02-10T00:00:00Z',
        url: this.CANONICAL_URL,
        image: this.OG_IMAGE,
      },
      'blog-tco-article',
    );

    // Inject HowTo schema for Google rich snippets
    this.jsonLd.injectCustomSchema({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': 'How to Calculate Your Monthly LLM Cost',
      'description': 'Calculate the real monthly cost of an LLM deployment using volume, token mix, and cache hit rate — not just $/token.',
      'step': [
        {
          '@type': 'HowToStep',
          'name': 'Define your inputs',
          'text': 'Set your daily message volume (M), input tokens per message (Ti), output tokens per message (To), and cache hit rate (Cr).'
        },
        {
          '@type': 'HowToStep',
          'name': 'Apply the cost formula',
          'text': 'Monthly cost = ((M × Ti × (1-Cr) × P_input) + (M × Ti × Cr × P_cached) + (M × To × P_output)) × 30'
        },
        {
          '@type': 'HowToStep',
          'name': 'Calculate ValueScore for ranking',
          'text': 'ValueScore = (1/Cost)^0.65 × log10(Context)^0.35 × LatencyIndex. The model with the highest score wins for your workload.'
        },
        {
          '@type': 'HowToStep',
          'name': 'Compare across models',
          'text': 'Run the same formula for each provider using official pricing from the public registry at llm-cost-engine.com/data/llm-pricing.json'
        }
      ]
    }, 'blog-tco-howto');

    // Inject FAQ schema for rich snippets
    this.jsonLd.injectFAQPageSchema([
      {
        question: 'What is LLM Total Cost of Ownership (TCO)?',
        answer: 'LLM TCO is the real monthly cost of running an LLM workload, accounting for daily message volume, input/output token ratio, and prompt cache hit rate. It is different from the $/1M token list price, which ignores how your workload actually distributes across token types.'
      },
      {
        question: 'How does prompt caching reduce monthly LLM costs?',
        answer: 'Prompt caching lets providers reuse computed context for repeated prefixes (e.g., your system prompt). Cached tokens cost 50–90% less than fresh input tokens. A support bot with a shared system prompt and 40% cache hit rate can cut its effective input cost by 40%, which can change the winning model entirely.'
      },
      {
        question: 'What is ValueScore and how is it calculated?',
        answer: 'ValueScore is a deterministic ranking formula: (1/Cost)^0.65 × log10(Context)^0.35 × LatencyIndex. It weights cost efficiency at 65% and context capacity at 35%, then applies a latency multiplier. The weights are public constants in the source code. Any two users with the same inputs get the same ranking.'
      },
      {
        question: 'How often is the LLM pricing data updated?',
        answer: 'Pricing is verified weekly via automated snapshots every Sunday. Changes are recorded in a public price history registry. When any model drops ≥5%, subscribers receive an automatic email alert. All data is sourced exclusively from official provider pricing pages.'
      }
    ], 'blog-tco-faq');

    // Track page view for manifesto blog post
    this.analytics.trackPageView('/blog/how-we-calculate-llm-tco');
  }
}
