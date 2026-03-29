'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupplierRecord {
  title?: string;
  countryCode?: string;
  type?: string;
  address?: string;
  totalShipments?: number;
  mostRecentShipment?: string; // "DD/MM/YYYY"
  topSuppliers?: string[];
  detailUrl?: string;
  description?: string;
}

interface SearchResponse {
  query: string;
  results: SupplierRecord[];
  count: number;
}

type TimeFilter = 'all' | '12m' | '6m' | '3m';
type SortKey = 'shipments' | 'recent' | 'name';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
  GB: 'United Kingdom', US: 'United States', CN: 'China', VN: 'Vietnam',
  BD: 'Bangladesh', IN: 'India', TR: 'Turkey', DE: 'Germany', FR: 'France',
  IT: 'Italy', ES: 'Spain', NL: 'Netherlands', PL: 'Poland', CA: 'Canada',
  AU: 'Australia', JP: 'Japan', KR: 'South Korea', TW: 'Taiwan', HK: 'Hong Kong',
  SG: 'Singapore', MY: 'Malaysia', TH: 'Thailand', ID: 'Indonesia', PH: 'Philippines',
  PK: 'Pakistan', LK: 'Sri Lanka', MM: 'Myanmar', KH: 'Cambodia', MX: 'Mexico',
  BR: 'Brazil', AR: 'Argentina', PT: 'Portugal', RO: 'Romania', CZ: 'Czech Republic',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', BE: 'Belgium',
  AT: 'Austria', CH: 'Switzerland', IE: 'Ireland', ZA: 'South Africa', EG: 'Egypt',
  MA: 'Morocco', AE: 'United Arab Emirates', SA: 'Saudi Arabia', IL: 'Israel',
};

function countryFlag(code?: string): string {
  if (!code || code.length !== 2) return '🌐';
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

function parseShipDate(str?: string): Date | null {
  if (!str) return null;
  const parts = str.split('/').map(Number);
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  return new Date(y, m - 1, d);
}

function formatDate(str?: string): string {
  const d = parseShipDate(str);
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysAgo(str?: string): number {
  const d = parseShipDate(str);
  if (!d) return Infinity;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

function recencyLabel(days: number): { label: string; cls: string } {
  if (days === Infinity) return { label: 'Unknown', cls: 'dim' };
  if (days <= 90) return { label: `${days}d ago`, cls: 'fresh' };
  if (days <= 365) return { label: `${Math.round(days / 30)}mo ago`, cls: 'recent' };
  return { label: `${Math.round(days / 365)}yr ago`, cls: 'stale' };
}

const FILTER_DAYS: Record<TimeFilter, number> = {
  all: Infinity,
  '12m': 365,
  '6m': 183,
  '3m': 92,
};

const FILTER_LABELS: Record<TimeFilter, string> = {
  all: 'All time',
  '12m': 'Last 12 months',
  '6m': 'Last 6 months',
  '3m': 'Last 3 months',
};

const FREE_VISIBLE_ROWS = 3;

// ─── Loading Stepper ──────────────────────────────────────────────────────────

const LOAD_STEPS = [
  { label: 'Connecting to customs database', icon: '🛰️' },
  { label: 'Querying bill of lading records', icon: '📦' },
  { label: 'Aggregating supplier intelligence', icon: '🔗' },
  { label: 'Ranking by confidence score', icon: '📊' },
];

function LoadingView({ query }: { query: string }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    // Drive step advancement and progress bar over ~80 seconds
    const stepMs = [8000, 20000, 20000, 20000];
    let current = 0;
    const advance = () => {
      if (current < LOAD_STEPS.length - 1) {
        current++;
        setStep(current);
      }
    };
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (let i = 0; i < LOAD_STEPS.length - 1; i++) {
      elapsed += stepMs[i];
      timers.push(setTimeout(advance, elapsed));
    }

    // Smooth progress bar
    let pct = 4;
    const tick = setInterval(() => {
      pct = Math.min(pct + 0.6, 92);
      setProgress(pct);
    }, 500);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, []);

  return (
    <div className={styles.loadingWrap}>
      {/* Animated radar ring */}
      <div className={styles.radar}>
        <div className={styles.radarRing} />
        <div className={styles.radarRing2} />
        <span className={styles.radarIcon}>📦</span>
      </div>

      <p className={styles.loadingTitle}>
        Searching <span className={styles.loadingQuery}>&ldquo;{query}&rdquo;</span>
      </p>
      <p className={styles.loadingSubtitle}>
        Scanning real customs records — this takes 30–90 seconds
      </p>

      {/* Progress bar */}
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.progressPct}>{Math.round(progress)}%</p>

      {/* Steps */}
      <div className={styles.steps}>
        {LOAD_STEPS.map((s, i) => (
          <div
            key={i}
            className={`${styles.stepRow} ${i < step ? styles.stepDone : ''} ${i === step ? styles.stepActive : ''}`}
          >
            <span className={styles.stepIcon}>{s.icon}</span>
            <span className={styles.stepLabel}>{s.label}</span>
            {i < step && <span className={styles.stepCheck}>✓</span>}
            {i === step && <span className={styles.stepSpinner} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error View ───────────────────────────────────────────────────────────────

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.errorWrap}>
      <span className={styles.errorIcon}>⚠️</span>
      <h2 className={styles.errorTitle}>Search failed</h2>
      <p className={styles.errorMsg}>{message}</p>
      <button className="btn btn-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

// ─── Empty View ───────────────────────────────────────────────────────────────

function EmptyView({ query }: { query: string }) {
  return (
    <div className={styles.emptyWrap}>
      <span className={styles.emptyIcon}>🔍</span>
      <h2 className={styles.emptyTitle}>No records found</h2>
      <p className={styles.emptyMsg}>
        No bill of lading records matched <strong>&ldquo;{query}&rdquo;</strong>.
        <br />
        Try a variation like a full legal name or remove &ldquo;Ltd&rdquo; / &ldquo;Inc&rdquo;.
      </p>
      <a href="/" className="btn btn-primary">
        ← New search
      </a>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResultsClient({ query }: { query: string }) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('shipments');
  const generation = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doFetch = () => {
    // Cancel any in-flight polling from a previous attempt
    if (pollTimer.current) clearTimeout(pollTimer.current);
    const gen = ++generation.current;

    setLoading(true);
    setError(null);
    setData(null);

    // ── Phase 1: start run (returns instantly with runId, or cached results) ──
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((json: { runId?: string; results?: object[]; count?: number; query?: string; error?: string; cached?: boolean }) => {
        if (generation.current !== gen) return;
        if (json.error) { setError(json.error); setLoading(false); return; }

        // Cache hit — done immediately
        if (json.results) {
          setData({ query: json.query ?? query, results: json.results as SupplierRecord[], count: json.count ?? 0 });
          setLoading(false);
          return;
        }

        // ── Phase 2: poll for completion ────────────────────────────────────
        const runId = json.runId;
        if (!runId) { setError('No run ID returned'); setLoading(false); return; }

        const poll = () => {
          if (generation.current !== gen) return;
          fetch(`/api/search/poll?runId=${runId}&q=${encodeURIComponent(query)}`)
            .then((r) => r.json())
            .then((p: { status: string; results?: object[]; count?: number; error?: string }) => {
              if (generation.current !== gen) return;
              if (p.status === 'SUCCEEDED' && p.results) {
                setData({ query, results: p.results as SupplierRecord[], count: p.count ?? 0 });
                setLoading(false);
              } else if (p.error || ['FAILED', 'ABORTED', 'TIMED-OUT'].includes(p.status)) {
                setError(p.error ?? `Run ended with status: ${p.status}`);
                setLoading(false);
              } else {
                // Still running — poll again in 4s
                pollTimer.current = setTimeout(poll, 4_000);
              }
            })
            .catch((e: Error) => {
              if (generation.current !== gen) return;
              setError(e.message);
              setLoading(false);
            });
        };
        pollTimer.current = setTimeout(poll, 4_000);
      })
      .catch((e: Error) => {
        if (generation.current !== gen) return;
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (query) doFetch();
    return () => { if (pollTimer.current) clearTimeout(pollTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // ── Filter & sort results ──────────────────────────────────────────────────
  const allResults: SupplierRecord[] = data?.results ?? [];

  const maxDays = FILTER_DAYS[timeFilter];
  const filtered = allResults.filter((r) => {
    if (maxDays === Infinity) return true;
    return daysAgo(r.mostRecentShipment) <= maxDays;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'shipments') return (b.totalShipments ?? 0) - (a.totalShipments ?? 0);
    if (sortKey === 'recent') return daysAgo(a.mostRecentShipment) - daysAgo(b.mostRecentShipment);
    return (a.title ?? '').localeCompare(b.title ?? '');
  });

  // ── Derived stats ─────────────────────────────────────────────────────────
  const uniqueCountries = new Set(filtered.map((r) => r.countryCode).filter(Boolean)).size;
  const totalShipments = filtered.reduce((sum, r) => sum + (r.totalShipments ?? 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return <LoadingView query={query} />;
  if (error) return <ErrorView message={error} onRetry={doFetch} />;
  if (!data || filtered.length === 0) {
    if (allResults.length > 0 && filtered.length === 0) {
      // Has results but filter is too narrow
      return (
        <div className={styles.emptyWrap}>
          <span className={styles.emptyIcon}>📅</span>
          <h2 className={styles.emptyTitle}>No recent shipments</h2>
          <p className={styles.emptyMsg}>
            No records match the <strong>{FILTER_LABELS[timeFilter]}</strong> filter.
            <br />
            Try widening the date range.
          </p>
          <button className="btn btn-ghost" onClick={() => setTimeFilter('all')}>
            Show all time →
          </button>
        </div>
      );
    }
    return <EmptyView query={query} />;
  }

  const visibleRows = sorted.slice(0, FREE_VISIBLE_ROWS);
  const hiddenCount = sorted.length - FREE_VISIBLE_ROWS;
  const blurredRows = sorted.slice(FREE_VISIBLE_ROWS);

  return (
    <div className={styles.resultsWrap}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className={styles.resultsHeader}>
        <a href="/" className={styles.backLink}>
          ← New search
        </a>
        <div className={styles.resultsTitle}>
          <div className={styles.eyebrowRow}>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Live BOL data
            </span>
            <span className={styles.sourceTag}>via ImportYeti · Apify</span>
          </div>
          <h1 className={styles.queryHeading}>
            Supplier intelligence for{' '}
            <span className="gradient-text">&ldquo;{query}&rdquo;</span>
          </h1>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <div className={styles.statsStrip}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{filtered.length}</span>
          <span className={styles.statLbl}>entities found</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>{uniqueCountries}</span>
          <span className={styles.statLbl}>countries</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>{totalShipments.toLocaleString()}</span>
          <span className={styles.statLbl}>total shipments</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>Today</span>
          <span className={styles.statLbl}>last queried</span>
        </div>
      </div>

      {/* ── Controls row ────────────────────────────────────────── */}
      <div className={styles.controlsRow}>
        {/* Time filter pills */}
        <div className={styles.filterPills}>
          {(Object.keys(FILTER_LABELS) as TimeFilter[]).map((k) => (
            <button
              key={k}
              className={`${styles.pill} ${timeFilter === k ? styles.pillActive : ''}`}
              onClick={() => setTimeFilter(k)}
            >
              {FILTER_LABELS[k]}
            </button>
          ))}
        </div>

        {/* Sort + export */}
        <div className={styles.controlsRight}>
          <select
            className={styles.sortSelect}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="shipments">Sort: Most shipments</option>
            <option value="recent">Sort: Most recent</option>
            <option value="name">Sort: Name A–Z</option>
          </select>

          <button className={`${styles.exportBtn} ${styles.exportBtnBlurred}`} title="Upgrade to export CSV">
            <span>⬇ Export CSV</span>
            <span className={styles.exportLock}>🔒</span>
          </button>
        </div>
      </div>

      {/* ── Results table ───────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thRank}>#</th>
              <th>Entity name</th>
              <th>Country</th>
              <th className={styles.thNum}>Shipments</th>
              <th className={styles.thDate}>Last seen</th>
              <th className={styles.thPartners}>Top trading partners</th>
              <th className={styles.thLink} />
            </tr>
          </thead>
          <tbody>
            {/* Visible rows */}
            {visibleRows.map((r, i) => {
              const days = daysAgo(r.mostRecentShipment);
              const rec = recencyLabel(days);
              const flag = countryFlag(r.countryCode);
              const country = (r.countryCode && COUNTRY_NAMES[r.countryCode]) || r.countryCode || '—';
              return (
                <tr key={i} className={styles.tableRow}>
                  <td className={styles.tdRank}>
                    <span className={styles.rankBadge}>{i + 1}</span>
                  </td>
                  <td className={styles.tdName}>
                    <span className={styles.companyName}>{r.title ?? '—'}</span>
                    {r.address && (
                      <span className={styles.companyAddr}>{r.address}</span>
                    )}
                  </td>
                  <td className={styles.tdCountry}>
                    <span className={styles.flagEmoji}>{flag}</span>
                    <span className={styles.countryName}>{country}</span>
                  </td>
                  <td className={styles.tdNum}>
                    <span className={styles.shipCount}>{(r.totalShipments ?? 0).toLocaleString()}</span>
                  </td>
                  <td className={styles.tdDate}>
                    <span className={`${styles.recency} ${styles[`recency_${rec.cls}`]}`}>
                      {rec.label}
                    </span>
                    <span className={styles.fullDate}>{formatDate(r.mostRecentShipment)}</span>
                  </td>
                  <td className={styles.tdPartners}>
                    <div className={styles.partnerList}>
                      {(r.topSuppliers ?? []).slice(0, 3).map((p, pi) => (
                        <span key={pi} className={styles.partnerChip}>{p}</span>
                      ))}
                      {(r.topSuppliers?.length ?? 0) > 3 && (
                        <span className={styles.partnerMore}>
                          +{(r.topSuppliers?.length ?? 0) - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.tdLink}>
                    {r.detailUrl && (
                      <a
                        href={r.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.detailLink}
                        title="View on ImportYeti"
                      >
                        ↗
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Blurred locked rows */}
            {blurredRows.map((r, i) => (
              <tr key={`blur-${i}`} className={`${styles.tableRow} ${styles.tableRowBlurred}`}>
                <td className={styles.tdRank}>
                  <span className={styles.rankBadge}>{FREE_VISIBLE_ROWS + i + 1}</span>
                </td>
                <td className={styles.tdName}>
                  <span className={styles.blurText}>████████████</span>
                </td>
                <td className={styles.tdCountry}>
                  <span className={styles.blurText}>🌐 ██████████</span>
                </td>
                <td className={styles.tdNum}>
                  <span className={styles.blurText}>██</span>
                </td>
                <td className={styles.tdDate}>
                  <span className={styles.blurText}>██████████</span>
                </td>
                <td className={styles.tdPartners}>
                  <span className={styles.blurText}>████████ █████ ████</span>
                </td>
                <td className={styles.tdLink} />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Blur upgrade overlay */}
        {hiddenCount > 0 && (
          <div className={styles.upgradeOverlay}>
            <div className={styles.upgradeCard}>
              <span className={styles.upgradeLock}>🔒</span>
              <p className={styles.upgradeTitle}>
                {hiddenCount} more {hiddenCount === 1 ? 'result' : 'results'} hidden
              </p>
              <p className={styles.upgradeDesc}>
                Upgrade to <strong>Starter</strong> to unlock all supplier records, full details, and CSV export.
              </p>
              <div className={styles.upgradeCtas}>
                <a href="/signup" className="btn btn-primary">
                  Upgrade to Starter — $49/mo →
                </a>
                <a href="/signup" className="btn btn-ghost">
                  Start free trial
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer note ─────────────────────────────────────────── */}
      <p className={styles.dataNote}>
        Data sourced from public bill of lading customs records via{' '}
        <a href="https://www.importyeti.com" target="_blank" rel="noopener noreferrer">
          ImportYeti
        </a>
        . Records are indicative — verify independently before making supply chain decisions.
      </p>
    </div>
  );
}
