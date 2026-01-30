/**
 * LLM Cost Engine v1.0 - Scenario ID Generator
 *
 * Generates unique, traceable scenario IDs for enterprise budget simulations.
 * Format: LLM-YYYY-XXXX where XXXX is derived from parameters hash.
 *
 * Purpose:
 * - Enables audit trails for procurement decisions
 * - Links exported PDFs to specific simulation states
 * - Provides reproducible references for stakeholder communication
 */

/**
 * Generates a deterministic scenario ID based on simulation parameters.
 *
 * Format: LLM-{YEAR}-{HASH}
 * Example: LLM-2026-A7F3
 *
 * The hash is derived from:
 * - messagesPerDay
 * - tokensInput
 * - tokensOutput
 * - cacheHitRate
 * - timestamp (minute-level granularity for uniqueness)
 *
 * @param params Simulation parameters
 * @returns Unique scenario ID string
 */
export function generateScenarioId(params: {
  messagesPerDay: number;
  tokensInput: number;
  tokensOutput: number;
  cacheHitRate: number;
}): string {
  const now = new Date();
  const year = now.getFullYear();

  // Create a hash from parameters + timestamp (minute granularity)
  const hashInput = [
    params.messagesPerDay,
    params.tokensInput,
    params.tokensOutput,
    Math.round(params.cacheHitRate * 100),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  ].join('-');

  // Simple but effective hash function
  const hash = hashString(hashInput);

  // Convert to 4-character hex-like string (uppercase)
  const shortHash = hash.toString(16).toUpperCase().slice(-4).padStart(4, '0');

  return `LLM-${year}-${shortHash}`;
}

/**
 * Simple string hash function (djb2 algorithm).
 * Fast, deterministic, good distribution.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Parses a scenario ID to extract metadata.
 * Useful for validation and logging.
 *
 * @param scenarioId The scenario ID to parse
 * @returns Parsed components or null if invalid
 */
export function parseScenarioId(scenarioId: string): {
  prefix: string;
  year: number;
  hash: string;
} | null {
  const match = scenarioId.match(/^(LLM)-(\d{4})-([A-F0-9]{4})$/);
  if (!match) return null;

  return {
    prefix: match[1],
    year: parseInt(match[2], 10),
    hash: match[3]
  };
}

/**
 * Validates a scenario ID format.
 */
export function isValidScenarioId(scenarioId: string): boolean {
  return /^LLM-\d{4}-[A-F0-9]{4}$/.test(scenarioId);
}
