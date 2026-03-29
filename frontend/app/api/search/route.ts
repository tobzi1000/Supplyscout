import type { NextRequest } from 'next/server';

const APIFY_BASE = 'https://api.apify.com/v2';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ── Shared in-memory cache (keyed by normalised query) ────────────────────────
export const resultCache = new Map<string, { data: object[]; ts: number }>();

export async function apifyFetch(method: string, path: string, body?: object) {
  const token = process.env.APIFY_API_TOKEN;
  const sep = path.includes('?') ? '&' : '?';
  const url = `${APIFY_BASE}${path}${sep}token=${token}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return Response.json({ error: 'Missing required query param: q' }, { status: 400 });
  }

  const token = process.env.APIFY_API_TOKEN;
  const actorId = process.env.APIFY_IMPORTYETI_ACTOR_ID ?? 'swLDk4QqugKTxAunl';

  if (!token || token.includes('your_token')) {
    return Response.json({ error: 'APIFY_API_TOKEN not configured' }, { status: 500 });
  }

  // ── Cache hit → return instantly ──────────────────────────────────────────
  const cacheKey = q.toLowerCase();
  const cached = resultCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return Response.json({
      query: q,
      results: cached.data,
      count: cached.data.length,
      cached: true,
    });
  }

  // ── Start actor run and return runId immediately ──────────────────────────
  try {
    const runResp = await apifyFetch(
      'POST',
      `/acts/${actorId}/runs?memory=1024`,
      { q, maxItems: 20 },
    );
    const runId: string = runResp.data.id;
    return Response.json({ query: q, runId, cached: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
