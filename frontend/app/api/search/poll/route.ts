import type { NextRequest } from 'next/server';
import { apifyFetch, resultCache } from '../route';

export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get('runId')?.trim();
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!runId) {
    return Response.json({ error: 'Missing runId' }, { status: 400 });
  }

  try {
    const statusResp = await apifyFetch('GET', `/actor-runs/${runId}`);
    const status: string = statusResp.data.status;

    if (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      // Still running — tell the client to keep polling
      return Response.json({ status });
    }

    if (status !== 'SUCCEEDED') {
      return Response.json({ status, error: `Run ended with status: ${status}` });
    }

    // ── Fetch results and cache them ────────────────────────────────────────
    const datasetId: string = statusResp.data.defaultDatasetId;
    const raw = await apifyFetch('GET', `/datasets/${datasetId}/items`);
    const items: object[] = Array.isArray(raw) ? raw : (raw.items ?? []);

    if (q) {
      resultCache.set(q.toLowerCase(), { data: items, ts: Date.now() });
    }

    return Response.json({ status: 'SUCCEEDED', results: items, count: items.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ status: 'FAILED', error: msg }, { status: 500 });
  }
}
