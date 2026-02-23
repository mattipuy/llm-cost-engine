import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService, SeoMetaService, AnalyticsService } from '../../core/services';

@Component({
  selector: 'app-how-to-choose-llm-for-production',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './how-to-choose-llm-for-production.component.html',
})
export class HowToChooseLlmForProductionComponent implements OnInit {
  private readonly seoMeta = inject(SeoMetaService);
  private readonly jsonLd = inject(JsonLdService);
  private readonly analytics = inject(AnalyticsService);

  private readonly CANONICAL_URL =
    'https://llm-cost-engine.com/blog/how-to-choose-llm-for-production';

  private readonly OG_IMAGE =
    'https://llm-cost-engine.com/assets/og-image.png';

  ngOnInit(): void {
    const title = 'How to Choose an LLM for Production | LLM Cost Engine';
    const headline = 'How to Choose an LLM for Production: A Decision Framework Based on Real Monthly Costs';
    const description =
      'A practical decision framework for choosing the right LLM for your production workload. Three questions that determine your optimal model based on volume, cache strategy, and latency requirements.';

    this.seoMeta.updateMetaTags({
      title,
      description,
      url: this.CANONICAL_URL,
      type: 'article',
      image: this.OG_IMAGE,
      imageAlt: 'LLM decision framework showing how to choose between Claude, GPT, Gemini, and DeepSeek for production deployments',
      twitterCard: 'summary_large_image',
      publishedTime: '2026-02-23T00:00:00Z',
    });

    this.jsonLd.injectArticleSchema(
      {
        headline,
        description,
        datePublished: '2026-02-23T00:00:00Z',
        url: this.CANONICAL_URL,
        image: this.OG_IMAGE,
      },
      'blog-how-to-choose',
    );

    this.analytics.trackPageView('/blog/how-to-choose-llm-for-production');
  }
}
