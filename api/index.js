// Vercel serverless function to handle Angular SSR
import app from '../dist/llm-cost-engine/server/server.mjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Minimal HTML shell for client-side only routes
const getMinimalHtml = (path) => {
  try {
    // Read the built index.html as base
    const indexPath = join(__dirname, '../dist/llm-cost-engine/browser/index.html');
    const html = readFileSync(indexPath, 'utf-8');

    // Return the HTML with proper title
    return html
      .replace(/<title>.*?<\/title>/, '<title>Model Pricing | LLM Cost Engine</title>')
      .replace('<!--nghm-->', ''); // Remove SSR hydration marker
  } catch (err) {
    console.error('Error reading index.html:', err);
    // Fallback minimal HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Model Pricing | LLM Cost Engine</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
</head>
<body>
  <app-root></app-root>
  <script src="/main.js" type="module"></script>
</body>
</html>`;
  }
};

// Wrapper to skip SSR for specific routes
export default async (req, context) => {
  const url = new URL(req.url, `https://${req.headers.get('host')}`);

  // Skip SSR for model detail pages (they crash during SSR due to HTTP fetch)
  if (url.pathname.startsWith('/models/')) {
    console.log('[SSR Skip] Model page:', url.pathname);
    return new Response(getMinimalHtml(url.pathname), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  }

  // Use Angular SSR for all other routes
  return app(req, context);
};
