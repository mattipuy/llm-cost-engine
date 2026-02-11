import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoMetaTags {
  title: string;
  description: string;
  url: string;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  publishedTime?: string;
  modifiedTime?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoMetaService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  private readonly DEFAULT_IMAGE = 'https://llm-cost-engine.com/assets/og-image.png';
  private readonly DEFAULT_IMAGE_ALT = 'LLM Cost Engine - Enterprise TCO analysis for AI deployments';

  /**
   * Updates all SEO meta tags (OG + Twitter) in one atomic operation.
   * Prevents SSR/CSR conflicts by removing old tags before adding new ones.
   */
  updateMetaTags(tags: SeoMetaTags): void {
    // Update page title
    this.title.setTitle(tags.title);

    // Standard meta description
    this.meta.updateTag({ name: 'description', content: tags.description });

    // Open Graph tags
    this.updateTag({ property: 'og:title', content: tags.title });
    this.updateTag({ property: 'og:description', content: tags.description });
    this.updateTag({ property: 'og:url', content: tags.url });
    this.updateTag({ property: 'og:type', content: tags.type || 'website' });
    this.updateTag({ property: 'og:image', content: tags.image || this.DEFAULT_IMAGE });
    this.updateTag({ property: 'og:image:alt', content: tags.imageAlt || this.DEFAULT_IMAGE_ALT });
    this.updateTag({ property: 'og:site_name', content: 'LLM Cost Engine' });

    // Article-specific tags
    if (tags.type === 'article') {
      if (tags.publishedTime) {
        this.updateTag({ property: 'article:published_time', content: tags.publishedTime });
      }
      if (tags.modifiedTime) {
        this.updateTag({ property: 'article:modified_time', content: tags.modifiedTime });
      }
    }

    // Twitter Card tags (use 'name' attribute, not 'property')
    this.updateTag({ name: 'twitter:card', content: tags.twitterCard || 'summary_large_image' });
    this.updateTag({ name: 'twitter:title', content: tags.title });
    this.updateTag({ name: 'twitter:description', content: tags.description });
    this.updateTag({ name: 'twitter:image', content: tags.image || this.DEFAULT_IMAGE });
    this.updateTag({ name: 'twitter:image:alt', content: tags.imageAlt || this.DEFAULT_IMAGE_ALT });
  }

  /**
   * Wrapper around Meta.updateTag that handles both 'property' and 'name' attributes.
   */
  private updateTag(tag: { property?: string; name?: string; content: string }): void {
    if (tag.property) {
      this.meta.updateTag({ property: tag.property, content: tag.content });
    } else if (tag.name) {
      this.meta.updateTag({ name: tag.name, content: tag.content });
    }
  }

  /**
   * Removes specific meta tags (useful for cleanup during route transitions).
   */
  removeTag(selector: string): void {
    this.meta.removeTag(selector);
  }
}
