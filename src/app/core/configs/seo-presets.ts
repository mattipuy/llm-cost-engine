/**
 * LLM Cost Engine v1.0 - SEO Presets Configuration
 *
 * These presets serve two purposes:
 * 1. Quick-start scenarios for users
 * 2. Static URLs for Google indexing (programmatic SEO)
 *
 * Each preset generates a unique URL like:
 * /calculator?m=50000&ti=150&to=250&cr=45
 *
 * This enables long-tail keyword targeting:
 * "LLM cost calculator 50000 messages enterprise"
 */

export interface SeoPreset {
  /** Unique identifier for the preset */
  id: string;
  /** URL-friendly slug */
  slug: string;
  /** Display name */
  name: string;
  /** SEO-optimized description */
  description: string;
  /** Meta title template */
  metaTitle: string;
  /** Meta description template */
  metaDescription: string;
  /** Simulation parameters */
  params: {
    messagesPerDay: number;
    tokensInput: number;
    tokensOutput: number;
    cacheHitRate: number;
  };
  /** Target keywords for this preset */
  keywords: string[];
}

/**
 * Pre-defined SEO presets for programmatic distribution.
 * These generate indexable URLs for long-tail search traffic.
 */
export const SEO_PRESETS: SeoPreset[] = [
  {
    id: 'startup-mvp',
    slug: 'startup-mvp',
    name: 'Startup MVP',
    description: 'Early-stage product with limited AI budget',
    metaTitle: 'LLM Cost Analysis: Startup MVP (~500 messages/day)',
    metaDescription: 'Calculate AI costs for early-stage startups. Compare GPT-4o vs Claude vs Gemini for 500 daily messages. Find the most cost-effective LLM for your MVP.',
    params: {
      messagesPerDay: 500,
      tokensInput: 150,
      tokensOutput: 300,
      cacheHitRate: 0.20
    },
    keywords: ['startup llm cost', 'mvp ai budget', 'cheap llm api']
  },
  {
    id: 'saas-growth',
    slug: 'saas-growth',
    name: 'SaaS Growth Stage',
    description: 'Scaling customer support with AI',
    metaTitle: 'LLM Cost Analysis: SaaS Growth (~5,000 messages/day)',
    metaDescription: 'TCO analysis for growing SaaS companies. Compare LLM providers for 5,000 daily customer interactions. Optimize your AI support costs.',
    params: {
      messagesPerDay: 5000,
      tokensInput: 200,
      tokensOutput: 400,
      cacheHitRate: 0.30
    },
    keywords: ['saas ai cost', 'customer support llm', 'chatbot pricing']
  },
  {
    id: 'enterprise-support',
    slug: 'enterprise-support',
    name: 'Enterprise Support Hub',
    description: 'High-volume enterprise deployment',
    metaTitle: 'LLM Cost Analysis: Enterprise (~50,000 messages/day)',
    metaDescription: 'Enterprise-grade TCO analysis for high-volume LLM deployments. Compare costs for 50,000+ daily messages. CTO/CFO procurement-ready reports.',
    params: {
      messagesPerDay: 50000,
      tokensInput: 150,
      tokensOutput: 250,
      cacheHitRate: 0.45
    },
    keywords: ['enterprise llm cost', 'high volume ai', 'llm procurement']
  },
  {
    id: 'dev-productivity',
    slug: 'dev-productivity',
    name: 'Developer Productivity',
    description: 'Internal coding assistant with rich context',
    metaTitle: 'LLM Cost Analysis: Dev Productivity (~1,000 messages/day)',
    metaDescription: 'Calculate costs for internal AI coding assistants. Compare LLMs for developer productivity tools with large context requirements.',
    params: {
      messagesPerDay: 1000,
      tokensInput: 800,
      tokensOutput: 1200,
      cacheHitRate: 0.15
    },
    keywords: ['coding assistant cost', 'developer ai tool', 'copilot alternative cost']
  },
  {
    id: 'content-generation',
    slug: 'content-generation',
    name: 'Content Generation',
    description: 'Marketing and content automation',
    metaTitle: 'LLM Cost Analysis: Content Generation (~2,000 messages/day)',
    metaDescription: 'TCO analysis for AI content generation. Compare LLM costs for marketing automation, blog writing, and content scaling.',
    params: {
      messagesPerDay: 2000,
      tokensInput: 300,
      tokensOutput: 800,
      cacheHitRate: 0.25
    },
    keywords: ['ai content cost', 'llm marketing', 'automated content pricing']
  }
];

/**
 * Generates URL query string from preset parameters.
 */
export function presetToQueryString(preset: SeoPreset): string {
  const { params } = preset;
  const queryParams = new URLSearchParams({
    m: params.messagesPerDay.toString(),
    ti: params.tokensInput.toString(),
    to: params.tokensOutput.toString(),
    cr: Math.round(params.cacheHitRate * 100).toString()
  });
  return queryParams.toString();
}

/**
 * Generates full URL path for a preset.
 * Uses /tools/chatbot-simulator path per Architect spec.
 */
export function getPresetUrl(preset: SeoPreset): string {
  return `/tools/chatbot-simulator?${presetToQueryString(preset)}`;
}

/**
 * Finds a preset by its ID.
 */
export function findPresetById(id: string): SeoPreset | undefined {
  return SEO_PRESETS.find(p => p.id === id);
}
