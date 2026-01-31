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

@Injectable({
  providedIn: 'root'
})
export class JsonLdService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  injectSoftwareApplicationSchema(data: SoftwareApplicationSchema, schemaId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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

  removeExistingSchema(schemaId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const existingScript = this.document.querySelector(`script[data-schema="${schemaId}"]`);
    if (existingScript) {
      existingScript.remove();
    }
  }
}
