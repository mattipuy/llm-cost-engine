import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '../../core/services/json-ld.service';

@Component({
  selector: 'app-how-we-calculate-llm-tco',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './how-we-calculate-llm-tco.component.html',
})
export class HowWeCalculateLlmTcoComponent implements OnInit {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly jsonLd = inject(JsonLdService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly CANONICAL_URL =
    'https://llm-cost-engine.vercel.app/blog/how-we-calculate-llm-tco';

  ngOnInit(): void {
    this.title.setTitle(
      'How We Calculate LLM TCO | LLM Cost Engine',
    );

    const description =
      'A transparent breakdown of our deterministic LLM cost calculation methodology. 16 models, 7 providers, weekly tracking.';

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      property: 'og:title',
      content: 'We Open-Sourced the Math Behind LLM Cost Rankings',
    });
    this.meta.updateTag({
      property: 'og:description',
      content: description,
    });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({
      property: 'og:url',
      content: this.CANONICAL_URL,
    });

    this.jsonLd.injectArticleSchema(
      {
        headline: 'We Open-Sourced the Math Behind LLM Cost Rankings',
        description,
        datePublished: '2026-02-10',
        url: this.CANONICAL_URL,
      },
      'blog-tco-article',
    );
  }
}
