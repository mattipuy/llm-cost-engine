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
      'A transparent breakdown of our deterministic LLM cost calculation methodology. 16 models, 7 providers, weekly tracking.';
    const imageAlt =
      'LLM TCO calculation formula showing input/output token pricing breakdown for GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro';

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

    // Track page view for manifesto blog post
    this.analytics.trackPageView('/blog/how-we-calculate-llm-tco');
  }
}
