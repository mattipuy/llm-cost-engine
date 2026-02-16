import { Routes } from '@angular/router';

export const routes: Routes = [
  // Primary SEO route: /tools/chatbot-simulator?m=10000&ti=500
  {
    path: 'tools/chatbot-simulator',
    loadComponent: () =>
      import('./engines/chatbot-simulator/chatbot-simulator.component').then(
        (m) => m.ChatbotSimulatorComponent,
      ),
    title: 'LLM Cost Engine',
  },
  // Micro-Tool: Prompt Caching ROI Calculator
  {
    path: 'tools/caching-roi',
    loadComponent: () =>
      import('./engines/caching-roi/caching-roi.component').then(
        (m) => m.CachingRoiComponent,
      ),
    title: 'Prompt Caching ROI Calculator | LLM Cost Engine',
  },
  // Micro-Tool: Context Window Comparator
  {
    path: 'tools/context-window',
    loadComponent: () =>
      import('./engines/context-window/context-window.component').then(
        (m) => m.ContextWindowComponent,
      ),
    title: 'LLM Context Window Comparator | LLM Cost Engine',
  },
  // Micro-Tool: Batch API Cost Calculator
  {
    path: 'tools/batch-api',
    loadComponent: () =>
      import('./engines/batch-api/batch-api.component').then(
        (m) => m.BatchApiComponent,
      ),
    title: 'Batch API Cost Calculator | LLM Cost Engine',
  },
  // Market Insights page - "The Reddit Report"
  {
    path: 'insights',
    loadComponent: () =>
      import('./insights/insights.component').then(
        (m) => m.InsightsComponent,
      ),
    title: 'LLM Market Insights | LLM Cost Engine',
  },
  // Price alert email verification
  {
    path: 'verify',
    loadComponent: () =>
      import('./pages/verify/verify.component').then(
        (m) => m.VerifyComponent,
      ),
    title: 'Verify Price Alert | LLM Cost Engine',
  },
  // Blog: Methodology manifesto
  {
    path: 'blog/how-we-calculate-llm-tco',
    loadComponent: () =>
      import('./pages/blog/how-we-calculate-llm-tco.component').then(
        (m) => m.HowWeCalculateLlmTcoComponent,
      ),
    title: 'How We Calculate LLM TCO | LLM Cost Engine',
  },
  // Price alert unsubscribe
  {
    path: 'unsubscribe',
    loadComponent: () =>
      import('./pages/unsubscribe/unsubscribe.component').then(
        (m) => m.UnsubscribeComponent,
      ),
    title: 'Unsubscribe | LLM Cost Engine',
  },
  // Model detail pages (SEO landing pages)
  {
    path: 'models/:modelId',
    loadComponent: () =>
      import('./pages/model-detail/model-detail.component').then(
        (m) => m.ModelDetailComponent,
      ),
    title: 'Model Pricing & Cost Analysis | LLM Cost Engine',
  },
  // Root redirect for convenience
  {
    path: '',
    redirectTo: 'tools/chatbot-simulator',
    pathMatch: 'full',
  },
];
