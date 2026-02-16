import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit {
  title = 'llm-cost-engine-temp';

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  ngOnInit(): void {
    // Inject Vercel Analytics script (only in browser, not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.injectVercelAnalytics();
    }
  }

  private injectVercelAnalytics(): void {
    // Check if script already exists
    if (this.document.querySelector('script[data-vercel-analytics]')) {
      return;
    }

    // Inject Vercel Analytics script
    const script = this.document.createElement('script');
    script.setAttribute('data-vercel-analytics', '');
    script.src = '/_vercel/insights/script.js';
    script.defer = true;
    this.document.head.appendChild(script);
  }
}
