// Vercel serverless function - Angular SSR entry point with error handling
import { app } from '../dist/llm-cost-engine/server/server.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the client-side HTML as fallback
let clientHtml;
try {
  const htmlPath = join(__dirname, '../dist/llm-cost-engine/browser/index.html');
  clientHtml = readFileSync(htmlPath, 'utf-8');
} catch (err) {
  console.error('Failed to read index.html:', err);
  clientHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>LLM Cost Engine</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
</head>
<body>
  <app-root></app-root>
</body>
</html>`;
}

export default async function handler(req, context) {
  const url = new URL(req.url, `https://${req.headers.get('host') || 'localhost'}`);

  // For model pages, skip SSR entirely (known to crash)
  if (url.pathname.startsWith('/models/')) {
    console.log('[SSR SKIP] Model page - serving client-side HTML:', url.pathname);
    return new Response(clientHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  }

  // For all other routes, try SSR with fallback
  try {
    console.log('[SSR] Attempting SSR for:', url.pathname);
    const response = await app(req, context);
    console.log('[SSR] Success for:', url.pathname);
    return response;
  } catch (error) {
    console.error('[SSR ERROR] Failed for:', url.pathname, error);
    // Fallback to client-side rendering
    return new Response(clientHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  }
}
