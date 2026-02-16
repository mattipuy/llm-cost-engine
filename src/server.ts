import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';
import bootstrap from './main.server';
import { SSR_PRICING_DATA } from './app/core/tokens/ssr-pricing.token';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

// DEBUG: Log path resolution
console.log('[SSR DEBUG] import.meta.url:', import.meta.url);
console.log('[SSR DEBUG] serverDistFolder:', serverDistFolder);
console.log('[SSR DEBUG] browserDistFolder:', browserDistFolder);

// DEBUG: List files in server folder
try {
  console.log('[SSR DEBUG] Files in serverDistFolder:', readdirSync(serverDistFolder).slice(0, 10));
  console.log('[SSR DEBUG] Files in browserDistFolder:', readdirSync(browserDistFolder).slice(0, 10));
  const dataFolder = join(browserDistFolder, 'data');
  console.log('[SSR DEBUG] Files in data folder:', readdirSync(dataFolder));
} catch (e) {
  console.error('[SSR DEBUG] Error listing files:', e);
}

// Read pricing data from filesystem for SSR (avoids HTTP fetch issues in Vercel)
let pricingData: any = null;
try {
  const pricingPath = join(browserDistFolder, 'data/llm-pricing.json');
  console.log('[SSR DEBUG] Attempting to read:', pricingPath);
  const pricingContent = readFileSync(pricingPath, 'utf-8');
  console.log('[SSR DEBUG] File size:', pricingContent.length, 'bytes');
  pricingData = JSON.parse(pricingContent);
  console.log('[SSR] ✅ Pricing data loaded successfully. Models count:', pricingData.models?.length);
} catch (error) {
  console.error('[SSR] ❌ Failed to load pricing data:', error);
  console.error('[SSR] Error stack:', (error as Error).stack);
}

const app = express();
const commonEngine = new CommonEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        ...(pricingData ? [{ provide: SSR_PRICING_DATA, useValue: pricingData }] : []),
      ],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
