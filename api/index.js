// Vercel serverless function - Angular SSR entry point
// Pricing data is now injected via SSR_PRICING_DATA token (no HTTP fetch during SSR)
export { default } from '../dist/llm-cost-engine/server/server.mjs';
