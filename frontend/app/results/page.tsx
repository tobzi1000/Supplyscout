import ResultsClient from './ResultsClient';
import styles from './page.module.css';

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw ?? '').trim();

  return (
    <div className={styles.page}>
      {/* Minimal fixed navbar */}
      <nav className={styles.nav}>
        <a href="/" className={styles.navLogo}>
          <span className={styles.navMark}>⬡</span>
          <span className={styles.navName}>SupplyScout</span>
        </a>
        <div className={styles.navRight}>
          <a href="/signup" className="btn btn-ghost btn-sm">Log in</a>
          <a href="/signup" className="btn btn-primary btn-sm">Start Free</a>
        </div>
      </nav>

      {/* Main content — client handles fetch + rendering */}
      <main className={styles.main}>
        {query ? (
          <ResultsClient query={query} />
        ) : (
          <div className={styles.noQuery}>
            <p>No search query provided.</p>
            <a href="/" className="btn btn-primary">← Back to search</a>
          </div>
        )}
      </main>
    </div>
  );
}
