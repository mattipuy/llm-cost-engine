# Angular 19 SSR + Vercel: Dynamic Route Crash Issue

## 🚨 Problem

Angular 19 SSR app deployed on Vercel. **All routes work except `/models/:modelId`** which crashes with:

```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

- ✅ Other routes (`/`, `/verify`, `/blog/*`, etc.) → SSR works perfectly
- ❌ Model detail pages (`/models/gpt-4o`, `/models/claude-3-5-sonnet`) → 500 crash on refresh

## 📁 Project Structure

```
src/
├── app/
│   ├── pages/
│   │   └── model-detail/
│   │       ├── model-detail.component.ts
│   │       └── model-detail.component.html
│   ├── core/services/
│   │   └── pricing-data.service.ts (HttpClient + TransferState)
│   └── app.routes.ts
├── main.server.ts
└── server.ts
dist/
├── llm-cost-engine/
│   ├── browser/ (client bundle)
│   └── server/ (SSR bundle with server.mjs)
api/
└── index.js (Vercel serverless entry point)
```

## 🔍 Root Cause Analysis

The crash happens **during component construction**, before `ngOnInit()` runs. We know this because:

1. Adding `isPlatformBrowser` guard in `ngOnInit` → still crashes
2. Wrapping entire `ngOnInit` in try-catch → still crashes
3. Adding error handling at API level → still crashes before handler executes

**Likely culprit:** `PricingDataService` makes HTTP request during SSR, but in Vercel serverless context this fails.

## 📄 Relevant Code

### 1. Model Detail Component (`model-detail.component.ts`)

```typescript
export class ModelDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pricingService = inject(PricingDataService);
  private analytics = inject(AnalyticsService);
  private jsonLdService = inject(JsonLdService);
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);

  // Signals
  model = signal<LlmModel | null>(null);
  allModels = signal<LlmModel[]>([]);
  
  // Computed signals
  providerModels = computed(() => {
    const current = this.model();
    if (!current) return [];
    return this.allModels().filter(m => m.provider === current.provider);
  });

  ngOnInit(): void {
    // Even with this guard, crash happens BEFORE we reach here
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('modelId');
      this.loadModelData(id);
      this.analytics.trackPageView(`/models/${id}`);
    });
  }

  private loadModelData(modelId: string | null): void {
    this.pricingService
      .loadPricingData()
      .subscribe({
        next: (data) => {
          this.allModels.set(data.models);
          const model = data.models.find(m => m.id === modelId);
          if (model) {
            this.model.set(model);
            this.setMetaTags(model);
            this.injectJsonLd(model);
          }
        }
      });
  }
}
```

### 2. Pricing Data Service (`pricing-data.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class PricingDataService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  loadPricingData(): Observable<PricingData> {
    // Check TransferState cache (client after SSR)
    const cachedData = this.transferState.get(PRICING_DATA_KEY, null);
    if (cachedData) {
      this.transferState.remove(PRICING_DATA_KEY);
      return of(cachedData);
    }

    // Fetch data - THIS MIGHT BE FAILING DURING SSR
    return this.http.get<PricingData>('/data/llm-pricing.json').pipe(
      tap((data) => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(PRICING_DATA_KEY, data);
        }
      })
    );
  }
}
```

**Issue:** During SSR in Vercel serverless, `/data/llm-pricing.json` is a relative URL that might not resolve correctly.

### 3. Vercel Config (`vercel.json`)

```json
{
  "regions": ["fra1"],
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index" }
  ],
  "headers": [ /* cache headers */ ]
}
```

### 4. API Handler (`api/index.js`)

```javascript
import { app } from '../dist/llm-cost-engine/server/server.mjs';

export default async function handler(req, context) {
  try {
    return await app(req, context);
  } catch (error) {
    console.error('[SSR ERROR]', error);
    // Even this fallback doesn't catch the crash
    return new Response(clientHtml, { status: 200 });
  }
}
```

## 🔧 What We've Tried (All Failed)

1. ✗ **isPlatformBrowser guard in ngOnInit** → Crash happens before
2. ✗ **Try-catch in component** → Crash during construction
3. ✗ **Skip SSR at API level** → Crash happens before handler runs
4. ✗ **Use full URL during SSR** (`https://llm-cost-engine.com/data/...`) → Still crashes
5. ✗ **Error handling in api/index.js** → Doesn't catch the crash
6. ✗ **Vercel routes vs rewrites** → No difference
7. ✅ **Remove SSR completely** → Works but unacceptable (no SEO)

## ❓ Questions for Gemini

### 1. Vercel + Angular 19 SSR Configuration

Is there a **correct way to configure Vercel** for Angular 19 SSR with dynamic routes that fetch data?

- Should we use `rewrites`, `routes`, or something else?
- Is `api/index.js` the right pattern or should Vercel auto-detect?
- Do we need special build configuration?

### 2. HttpClient During SSR in Vercel

How do we properly handle **HttpClient requests during SSR** in a Vercel serverless function?

- Relative URLs (`/data/file.json`) don't work during SSR
- Full URLs (`https://...`) seem to timeout or fail
- Is there a pattern for reading local files during SSR?
- Should we use a different approach for data loading?

### 3. Why Component Construction Crashes

Why does the crash happen **before ngOnInit**? Possible causes:

- Service injection failures (Meta, Title, ActivatedRoute)?
- Computed signals evaluating too early?
- HttpClient module not configured for SSR?
- Something specific about Vercel's Node.js environment?

### 4. Alternative Approaches

What's the **best practice** for this use case?

- **Static Prerendering**: Prerender all `/models/*` at build time?
- **ISR (Incremental Static Regeneration)**: Is this possible on Vercel with Angular?
- **Hybrid**: SSR for some routes, static for others?
- **Data Strategy**: Different approach for loading pricing data during SSR?

### 5. TransferState

Is our **TransferState implementation correct**?

```typescript
const PRICING_DATA_KEY = makeStateKey<PricingData>('llm-pricing-data');

// During SSR
this.http.get('/data/llm-pricing.json').pipe(
  tap(data => {
    if (isPlatformServer(this.platformId)) {
      this.transferState.set(PRICING_DATA_KEY, data);
    }
  })
);

// During hydration
const cachedData = this.transferState.get(PRICING_DATA_KEY, null);
if (cachedData) return of(cachedData);
```

## 🎯 Desired Outcome

**Goal:** Keep SSR enabled for all routes including `/models/:modelId` for:
- SEO benefits (Google indexing model pages)
- Performance (fast initial load)
- Social media preview cards

**Current State:** 
- ✅ SSR works for all routes except `/models/*`
- ✅ Client-side only works (but no SSR)

**Need:** Working SSR for model pages without 500 crashes.

## 📊 Additional Context

- **Angular Version**: 19.2.18
- **Node Version**: 20.x
- **Vercel Region**: fra1 (Frankfurt)
- **Build Command**: `npm run build` (uses Angular CLI)
- **Framework Detection**: Vercel auto-detects Angular
- **Data File**: `public/data/llm-pricing.json` (~50KB JSON)
- **Number of Models**: ~40 model pages

## 🔗 Similar Issues?

Have you seen this pattern before? Any known issues with:
- Angular 19 SSR + Vercel serverless functions?
- HttpClient during SSR in Vercel context?
- Dynamic routes with data fetching crashing during SSR?

---

**Thank you for any guidance!** This is blocking production launch.
