import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export interface SoftwareApplicationSchema {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  softwareVersion?: string;
  featureList?: string[];
  aggregateRating?: {
    ratingValue: string;
    ratingCount: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class JsonLdService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  /**
   * Injects SoftwareApplication schema.
   * Works on both SSR and browser for Google to see structured data.
   */
  injectSoftwareApplicationSchema(data: SoftwareApplicationSchema, schemaId: string): void {
    // Remove existing to avoid duplicates during hydration
    this.removeExistingSchema(schemaId);

    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": data.name,
      "description": data.description,
      "url": data.url,
      "applicationCategory": data.applicationCategory ?? "BusinessApplication",
      "operatingSystem": data.operatingSystem ?? "Web Browser",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "softwareVersion": data.softwareVersion ?? "1.0.0",
      "author": {
        "@type": "Organization",
        "name": "LLM Cost Engine",
        "url": "https://llm-cost-engine.vercel.app"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      ...(data.aggregateRating && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": data.aggregateRating.ratingValue,
          "ratingCount": data.aggregateRating.ratingCount,
          "bestRating": "5",
          "worstRating": "1"
        }
      }),
      ...(data.featureList && { "featureList": data.featureList }),
      "dateModified": new Date().toISOString().split('T')[0]
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', schemaId);
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  /**
   * Injects FAQPage schema for rich snippets in search results.
   * Works on both SSR and browser.
   */
  injectFAQPageSchema(faqs: FAQItem[], schemaId: string): void {
    this.removeExistingSchema(schemaId);

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', schemaId);
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  /**
   * Injects BlogPosting schema for article pages.
   * Works on both SSR and browser for Google to see structured data.
   */
  injectArticleSchema(
    data: {
      headline: string;
      description: string;
      datePublished: string;
      url: string;
      image?: string;
    },
    schemaId: string,
  ): void {
    this.removeExistingSchema(schemaId);

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: data.headline,
      description: data.description,
      datePublished: data.datePublished,
      url: data.url,
      author: {
        '@type': 'Organization',
        name: 'LLM Cost Engine',
        url: 'https://llm-cost-engine.vercel.app',
      },
      publisher: {
        '@type': 'Organization',
        name: 'LLM Cost Engine',
        url: 'https://llm-cost-engine.vercel.app',
      },
    };

    if (data.image) {
      schema['image'] = data.image;
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', schemaId);
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  /**
   * Removes existing schema to avoid duplicates during hydration.
   * Works on both SSR and browser via DOCUMENT token.
   */
  removeExistingSchema(schemaId: string): void {
    try {
      const existingScript = this.document.querySelector(`script[data-schema="${schemaId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    } catch {
      // Ignore errors during SSR if DOM operations fail
    }
  }
}
