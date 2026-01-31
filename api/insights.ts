/**
 * LLM Cost Engine v1.0 - Market Insights API
 *
 * Vercel Edge Function for aggregated market data.
 * Endpoint: /api/insights
 *
 * Privacy Guarantees:
 * - No user identifiers
 * - No IP logging
 * - Only aggregate statistics returned
 */

export const config = {
  runtime: 'edge',
};

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type MarketSegment = 'startup' | 'scaleup' | 'enterprise';

type TechnicalSophistication = 'basic' | 'intermediate' | 'advanced';

type WorkloadType = 'creative' | 'balanced' | 'rag_analysis';

interface SimulationDataPoint {
  timestamp: string;
  segment: MarketSegment;
  winner_id: string;
  value_score_gap: number;
  cache_rate: number;
  input_output_ratio: number;
}

interface SegmentInsight {
  segment: MarketSegment;
  segmentLabel: string;
  totalSimulations: number;
  topWinner: {
    modelId: string;
    winCount: number;
    winPercentage: number;
  };
  averageGap: number;
  medianGap: number;
  winnerDistribution: Record<string, number>;
}

interface MarketReport {
  generatedAt: string;
  period: { start: string; end: string };
  totalSimulations: number;
  segments: SegmentInsight[];
  globalWinner: {
    modelId: string;
    totalWins: number;
    winPercentage: number;
  };
  averageSavingsPercent: number;
}

// ─────────────────────────────────────────────────────────────────
// In-Memory Store (demo only - use Vercel KV in production)
// Note: Edge functions are stateless, so this resets per request
// For persistent storage, integrate Vercel KV or Upstash Redis
// ─────────────────────────────────────────────────────────────────

const SEGMENT_LABELS: Record<MarketSegment, string> = {
  startup: 'Startup',
  scaleup: 'Scaleup',
  enterprise: 'Enterprise'
};

// ─────────────────────────────────────────────────────────────────
// Classification Helpers
// ─────────────────────────────────────────────────────────────────

function classifySophistication(cacheRate: number): TechnicalSophistication {
  if (cacheRate <= 0) return 'basic';
  if (cacheRate <= 0.4) return 'intermediate';
  return 'advanced';
}

function classifyWorkloadType(inputOutputRatio: number): WorkloadType {
  if (inputOutputRatio < 0.5) return 'creative';
  if (inputOutputRatio <= 1.0) return 'balanced';
  return 'rag_analysis';
}

// ─────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────

function calculateWinnerDistribution(
  dataPoints: SimulationDataPoint[]
): Record<string, number> {
  return dataPoints.reduce((acc, dp) => {
    acc[dp.winner_id] = (acc[dp.winner_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function findTopWinner(
  distribution: Record<string, number>,
  totalCount: number
): { modelId: string; winCount: number; winPercentage: number } {
  const entries = Object.entries(distribution);
  if (entries.length === 0) {
    return { modelId: 'N/A', winCount: 0, winPercentage: 0 };
  }
  const [topModelId, topWinCount] = entries.reduce(
    (max, current) => (current[1] > max[1] ? current : max)
  );
  return {
    modelId: topModelId,
    winCount: topWinCount,
    winPercentage: totalCount > 0
      ? Math.round((topWinCount / totalCount) * 1000) / 10
      : 0
  };
}

function calculateSegmentInsight(
  segment: MarketSegment,
  dataPoints: SimulationDataPoint[]
): SegmentInsight {
  const winnerDistribution = calculateWinnerDistribution(dataPoints);
  const topWinner = findTopWinner(winnerDistribution, dataPoints.length);
  const gaps = dataPoints.map(dp => dp.value_score_gap).sort((a, b) => a - b);
  const averageGap = gaps.length > 0
    ? gaps.reduce((sum, g) => sum + g, 0) / gaps.length
    : 0;
  const medianGap = gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 0;

  return {
    segment,
    segmentLabel: SEGMENT_LABELS[segment],
    totalSimulations: dataPoints.length,
    topWinner,
    averageGap: Math.round(averageGap * 10) / 10,
    medianGap: Math.round(medianGap * 10) / 10,
    winnerDistribution
  };
}

function generateEmptyReport(): MarketReport {
  const segments: MarketSegment[] = ['startup', 'scaleup', 'enterprise'];
  const today = new Date().toISOString().split('T')[0];

  return {
    generatedAt: new Date().toISOString(),
    period: { start: today, end: today },
    totalSimulations: 0,
    segments: segments.map(segment => calculateSegmentInsight(segment, [])),
    globalWinner: { modelId: 'N/A', totalWins: 0, winPercentage: 0 },
    averageSavingsPercent: 0
  };
}

// ─────────────────────────────────────────────────────────────────
// Edge Handler
// ─────────────────────────────────────────────────────────────────

export default async function handler(request: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const segment = url.searchParams.get('segment') as MarketSegment | null;

  // ─────────────────────────────────────────────────────────────────
  // POST /api/insights - Record simulation data
  // Note: For persistent storage, integrate Vercel KV here
  // ─────────────────────────────────────────────────────────────────
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const dataPoints = Array.isArray(body) ? body : [body];

      // Validate data points
      for (const dp of dataPoints) {
        if (!dp.timestamp || !dp.segment || !dp.winner_id || dp.value_score_gap === undefined || dp.cache_rate === undefined || dp.input_output_ratio === undefined) {
          return new Response(
            JSON.stringify({
              error: 'Invalid data point',
              required: ['timestamp', 'segment', 'winner_id', 'value_score_gap', 'cache_rate', 'input_output_ratio']
            }),
            { status: 400, headers: corsHeaders }
          );
        }
      }

      // In production: Store to Vercel KV or database
      // For now, acknowledge receipt
      return new Response(
        JSON.stringify({
          success: true,
          recorded: dataPoints.length,
          message: 'Data received. Connect Vercel KV for persistent storage.',
          integration: {
            vercel_kv: 'https://vercel.com/docs/storage/vercel-kv',
            upstash: 'https://upstash.com/'
          }
        }),
        { status: 201, headers: corsHeaders }
      );
    } catch {
      return new Response(
        JSON.stringify({ error: 'Failed to parse request body' }),
        { status: 400, headers: corsHeaders }
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/insights - Get aggregated insights
  // Note: Returns demo data structure. Connect storage for real data.
  // ─────────────────────────────────────────────────────────────────
  if (request.method === 'GET') {
    // Full report
    if (type === 'report') {
      return new Response(
        JSON.stringify(generateEmptyReport()),
        { status: 200, headers: corsHeaders }
      );
    }

    // Segment-specific average savings
    if (type === 'savings' && segment) {
      return new Response(
        JSON.stringify({
          segment: SEGMENT_LABELS[segment] || segment,
          averageSavings: 0,
          sampleSize: 0,
          message: 'Connect Vercel KV for persistent data'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Segment-specific winners
    if (type === 'winners' && segment) {
      return new Response(
        JSON.stringify({
          segment: SEGMENT_LABELS[segment] || segment,
          winners: [],
          sampleSize: 0,
          message: 'Connect Vercel KV for persistent data'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Default: API documentation
    return new Response(
      JSON.stringify({
        name: 'LLM Cost Engine - Market Insights API',
        version: '1.1',
        status: 'operational',
        storage: 'pending_integration',
        endpoints: {
          summary: '/api/insights',
          report: '/api/insights?type=report',
          savings: '/api/insights?type=savings&segment=enterprise',
          winners: '/api/insights?type=winners&segment=startup'
        },
        segments: ['startup', 'scaleup', 'enterprise'],
        segmentation: {
          volume_thresholds: {
            startup: '< 5,000 msg/day',
            scaleup: '5,000 - 50,000 msg/day',
            enterprise: '> 50,000 msg/day'
          },
          technical_sophistication: {
            basic: 'cache_rate = 0%',
            intermediate: 'cache_rate 1-40%',
            advanced: 'cache_rate > 40%'
          },
          workload_types: {
            creative: 'input_output_ratio < 0.5',
            balanced: 'input_output_ratio 0.5 - 1.0',
            rag_analysis: 'input_output_ratio > 1.0'
          }
        },
        privacy: {
          ip_tracking: false,
          user_agent: false,
          cookies: false,
          data_collected: ['timestamp (date only)', 'segment', 'winner_id', 'value_score_gap', 'cache_rate', 'input_output_ratio']
        }
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: corsHeaders }
  );
}
