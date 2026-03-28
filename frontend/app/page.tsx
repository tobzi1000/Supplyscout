'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';
import { LogisticsHub } from '@/components/ui/LogisticsHub';

const DEMO_URLS = [
  'gymshark.com',
  'allbirds.com',
  'bombas.com',
  'rothys.com',
  'vuori.com',
];

const FEATURES = [
  {
    icon: '📦',
    title: 'Real Bill of Lading Records',
    desc: 'Every supplier is traced to an actual shipping record filed with customs authorities. Zero guesswork — 100% verifiable data.',
  },
  {
    icon: '🏛️',
    title: 'Auto Legal Name Discovery',
    desc: 'We scrape brand pages, query Companies House UK, Brønnøysund Register, and OpenCorporates to find the exact legal entity.',
  },
  {
    icon: '🌍',
    title: '160+ Countries Covered',
    desc: 'BOL records from US, UK, China, Vietnam, Bangladesh, India, Turkey and 150+ more. Refreshed every 7 days.',
  },
  {
    icon: '📊',
    title: 'Full Shipment Intelligence',
    desc: 'Supplier name, country, shipment count, latest date, HS codes, invoice value, gross weight — all in one clean table.',
  },
  {
    icon: '📥',
    title: 'One-Click CSV Export',
    desc: 'Download your full supplier list as a spreadsheet. Plug straight into Airtable, Notion, Excel, or your CRM.',
  },
  {
    icon: '🔐',
    title: 'Confidence Scoring',
    desc: 'Every supplier gets a confidence score (0–1) based on shipment recency, volume, and data quality. No noise — just signal.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Paste any brand URL',
    desc: 'Drop in a Shopify store, DTC brand, or any e-commerce URL. No login required to try.',
    icon: '🔗',
  },
  {
    num: '02',
    title: 'We find the legal entity',
    desc: 'SupplyScout auto-discovers the registered company name using multi-tier government APIs and smart web scraping.',
    icon: '🏛️',
  },
  {
    num: '03',
    title: 'Get verified suppliers',
    desc: "Receive a ranked list of suppliers with names, origins, shipment volumes, HS codes, and dates — straight from customs data.",
    icon: '📋',
  },
];

const PRICING = [
  {
    tier: 'Free',
    price: '$0',
    period: '',
    desc: 'Try before you commit',
    searches: '2 searches / month',
    cta: 'Get Started Free',
    ctaStyle: 'ghost',
    popular: false,
    features: [
      'Supplier names blurred',
      'Country & shipment count visible',
      'Confidence scores',
      'No credit card needed',
    ],
    missing: ['CSV export', 'Full supplier details', 'Bulk search'],
  },
  {
    tier: 'Starter',
    price: '$49',
    period: '/month',
    desc: 'For growing brands',
    searches: '20 searches / month',
    cta: 'Start Starter',
    ctaStyle: 'ghost',
    popular: false,
    features: [
      'Full supplier data — unblurred',
      'Names, countries, HS codes, dates',
      'CSV export',
      'Confidence scoring',
      'Search history',
    ],
    missing: ['Bulk search', 'API access'],
  },
  {
    tier: 'Pro',
    price: '$99',
    period: '/month',
    desc: 'For power sourcers',
    searches: '100 searches / month',
    cta: 'Go Pro',
    ctaStyle: 'primary',
    popular: true,
    features: [
      'Everything in Starter',
      'Bulk URL search',
      'Priority processing',
      'Advanced filters',
      'Team sharing',
    ],
    missing: ['API access', 'White-label'],
  },
  {
    tier: 'Agency',
    price: '$299',
    period: '/month',
    desc: 'For sourcing agencies',
    searches: 'Unlimited searches',
    cta: 'Contact Sales',
    ctaStyle: 'ghost',
    popular: false,
    features: [
      'Everything in Pro',
      'REST API access',
      'White-label reports',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    missing: [],
  },
];

const STATS = [
  { value: '1B+', label: 'Shipment Records' },
  { value: '160+', label: 'Countries Covered' },
  { value: '7 days', label: 'Data Refresh Cycle' },
  { value: '150+', label: 'Fields Per Record' },
];

export default function LandingPage() {
  const [searchVal, setSearchVal] = useState('');
  const [typedUrl, setTypedUrl] = useState('');
  const [urlIndex, setUrlIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Typing animation for demo input
  useEffect(() => {
    const url = DEMO_URLS[urlIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isTyping) {
      if (typedUrl.length < url.length) {
        timeout = setTimeout(() => {
          setTypedUrl(url.slice(0, typedUrl.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2200);
      }
    } else {
      if (typedUrl.length > 0) {
        timeout = setTimeout(() => {
          setTypedUrl(typedUrl.slice(0, -1));
        }, 45);
      } else {
        setUrlIndex((i) => (i + 1) % DEMO_URLS.length);
        setIsTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [typedUrl, isTyping, urlIndex]);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      {/* ── NAVBAR ── */}
      <nav className={`${styles.nav} ${navScrolled ? styles.navScrolled : ''}`}>
        <div className={`container ${styles.navInner}`}>
          <a href="/" className={styles.logo} aria-label="SupplyScout home">
            <span className={styles.logoMark}>⬡</span>
            <span className={styles.logoText}>
              Supply<span className={styles.logoAccent}>Scout</span>
            </span>
          </a>

          <ul className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksOpen : ''}`}>
            {['How it Works', 'Features', 'Pricing', 'Blog'].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className={styles.navLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.navActions}>
            <a href="/login" className={`btn btn-ghost btn-sm ${styles.navLoginBtn}`}>
              Log in
            </a>
            <a href="/signup" className="btn btn-primary btn-sm">
              Start Free →
            </a>
            <button
              className={styles.mobileToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero} ref={heroRef} id="hero">
        <div className={styles.heroBg} aria-hidden="true">
          <img
            src="/hero-bg.jpg"
            alt="Cargo ship carrying branded shipping containers"
            className={styles.heroBgImg}
          />
          <div className={styles.heroBgOverlay} />
          <div className={styles.heroBgGradient} />
        </div>

        {/* Floating particles */}
        <div className={styles.particles} aria-hidden="true">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroInner}>
            <div className="eyebrow reveal">
              <span className="eyebrow-dot" />
              Bill of Lading Intelligence
            </div>

            <h1 className={`${styles.heroTitle} reveal reveal-delay-1`}>
              Find who supplies
              <br />
              <span className="gradient-text">any brand.</span>
              <br />
              In seconds.
            </h1>

            <p className={`${styles.heroSubtitle} reveal reveal-delay-2`}>
              Paste a brand URL. SupplyScout auto-discovers the legal company
              name, queries real shipping records, and delivers a verified
              supplier list — names, countries, HS codes, shipment volumes.
            </p>

            {/* Live Demo Search */}
            <div className={`${styles.heroSearch} reveal reveal-delay-3`}>
              <div className={styles.searchBar}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={typedUrl || 'gymshark.com'}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  aria-label="Brand URL input"
                  id="hero-search"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchVal) {
                      window.location.href = '/signup';
                    }
                  }}
                />
                {!searchVal && (
                  <span className={styles.typingCursor} aria-hidden="true" />
                )}
                <button
                  className={`btn btn-primary ${styles.searchBtn}`}
                  onClick={() => (window.location.href = '/signup')}
                >
                  Find Suppliers
                </button>
              </div>
              <p className={styles.searchHint}>
                <span className={styles.searchHintDot}>✓</span> No credit card
                &nbsp;&nbsp;
                <span className={styles.searchHintDot}>✓</span> 2 free searches
                &nbsp;&nbsp;
                <span className={styles.searchHintDot}>✓</span> Real BOL data
              </p>
            </div>

            <div className={`${styles.heroCtas} reveal reveal-delay-4`}>
              <a href="/signup" className="btn btn-primary btn-lg">
                Start for Free →
              </a>
              <a href="#how-it-works" className="btn btn-ghost btn-lg">
                ▶ See how it works
              </a>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a href="#stats" className={styles.scrollCue} aria-label="Scroll down">
          <span className={styles.scrollCueArrow}>↓</span>
        </a>
      </section>

      {/* ── STATS STRIP ── */}
      <div className={styles.statsStrip} id="stats">
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <div key={i} className={`${styles.statItem} reveal`} style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.howSection} id="how-it-works">
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <div className="eyebrow">How It Works</div>
            <h2 className={styles.sectionTitle}>
              From brand URL to supplier list
              <br />
              <span className="gradient-text">in three steps.</span>
            </h2>
            <p className={styles.sectionDesc}>
              No manual digging. No spreadsheets. SupplyScout does the heavy
              lifting — querying government registers, scraping brand sites, and
              hitting the BOL API — so you get answers in seconds.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`${styles.stepCard} reveal reveal-delay-${i + 1}`}
              >
                <div className={styles.stepNumber}>{step.num}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className={styles.stepConnector} aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATA PIPELINE ── */}
      <section className={styles.pipelineSection} id="pipeline">
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <div className="eyebrow">Real-Time Data</div>
            <h2 className={styles.sectionTitle}>
              Direct connection to
              <br />
              <span className="gradient-text">global customs networks.</span>
            </h2>
            <p className={styles.sectionDesc}>
              Our data pipeline processes millions of BOL records daily, 
              connecting the dots between shipping containers and the suppliers 
              behind them.
            </p>
          </div>
          <div className={`${styles.pipelineVisual} reveal reveal-delay-2`}>
            <LogisticsHub className={styles.logisticsSvg} text="BOL HUB" width="100%" height="auto" />
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ── */}
      <section className={styles.demoSection}>
        <div className="container">
          <div className={styles.demoWrapper}>
            <div className={`${styles.demoBadge} reveal`}>
              <span className="eyebrow">Live Preview</span>
            </div>
            <h2 className={`${styles.sectionTitle} reveal`} style={{ textAlign: 'center' }}>
              What your results look like
            </h2>

            <div className={`${styles.demoCard} reveal`}>
              {/* Browser chrome */}
              <div className={styles.demoChrome}>
                <span className={styles.chromeDot} style={{ background: '#ff5f57' }} />
                <span className={styles.chromeDot} style={{ background: '#febc2e' }} />
                <span className={styles.chromeDot} style={{ background: '#28c840' }} />
                <div className={styles.chromeUrl}>
                  <span className={styles.chromeUrlIcon}>🔒</span>
                  app.supplyscout.io/search/gymshark
                </div>
              </div>

              {/* Results header */}
              <div className={styles.demoResultsHeader}>
                <div>
                  <div className={styles.demoResultsBrand}>
                    <span className={styles.demoResultsLogo}>GS</span>
                    <div>
                      <div className={styles.demoResultsBrandName}>Gymshark Ltd</div>
                      <div className={styles.demoResultsBrandUrl}>gymshark.com</div>
                    </div>
                  </div>
                </div>
                <div className={styles.demoResultsMeta}>
                  <span className={styles.tagGreen}>✓ Verified</span>
                  <span className={styles.tagYellow}>34 suppliers found</span>
                </div>
              </div>

              {/* Table */}
              <div className={styles.demoTable}>
                <div className={styles.demoTableHeader}>
                  <span>Supplier</span>
                  <span>Country</span>
                  <span>Shipments</span>
                  <span>Latest</span>
                  <span>HS Code</span>
                  <span>Score</span>
                </div>

                {[
                  { name: 'Guangzhou Fitlab Sportswear Co Ltd', country: '🇨🇳 China', shipments: 34, date: 'Sep 2024', hs: '611020', score: 0.94, blurred: false },
                  { name: 'Dhaka Activewear Manufacturing Ltd', country: '🇧🇩 Bangladesh', shipments: 21, date: 'Aug 2024', hs: '611030', score: 0.88, blurred: false },
                  { name: 'Hanoi Sportswear Exports Co', country: '🇻🇳 Vietnam', shipments: 17, date: 'Jul 2024', hs: '611020', score: 0.82, blurred: false },
                  { name: '••••••••••••••••', country: '🇮🇳 India', shipments: 12, date: '••••••', hs: '••••••', score: 0.76, blurred: true },
                  { name: '••••••••••••', country: '🇵🇰 Pakistan', shipments: 9, date: '••••••', hs: '••••••', score: 0.71, blurred: true },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={`${styles.demoTableRow} ${row.blurred ? styles.demoRowBlurred : ''}`}
                  >
                    <span className={styles.demoSupplierName}>{row.name}</span>
                    <span>{row.country}</span>
                    <span className={styles.demoShipCount}>{row.shipments}</span>
                    <span className={styles.demoDate}>{row.date}</span>
                    <span className={styles.demoHs}>{row.hs}</span>
                    <span>
                      <div className={styles.demoScore}>
                        <div
                          className={styles.demoScoreBar}
                          style={{ width: `${row.score * 100}%` }}
                        />
                        <span className={styles.demoScoreVal}>{row.score}</span>
                      </div>
                    </span>
                  </div>
                ))}
              </div>

              {/* Blur CTA */}
              <div className={styles.demoBlurCta}>
                <div className={styles.demoBlurCtaInner}>
                  <div className={styles.demoBlurCtaIcon}>🔒</div>
                  <div>
                    <div className={styles.demoBlurCtaTitle}>
                      31 more suppliers hidden on Free plan
                    </div>
                    <div className={styles.demoBlurCtaDesc}>
                      Upgrade to Starter to unlock full supplier names, contacts, and CSV export.
                    </div>
                  </div>
                  <a href="/signup" className="btn btn-primary btn-sm">
                    Unlock All →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.featuresSection} id="features">
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <div className="eyebrow">Features</div>
            <h2 className={styles.sectionTitle}>
              Everything you need to find
              <br />
              <span className="gradient-text">your next supplier.</span>
            </h2>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`${styles.featureCard} reveal reveal-delay-${(i % 3) + 1}`}
              >
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className={styles.pricingSection} id="pricing">
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <div className="eyebrow">Pricing</div>
            <h2 className={styles.sectionTitle}>
              Simple pricing.
              <br />
              <span className="gradient-text">Start free, scale fast.</span>
            </h2>
            <p className={styles.sectionDesc}>
              No contracts. No per-record fees. Cancel anytime.
            </p>
          </div>

          <div className={styles.pricingGrid}>
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className={`${styles.pricingCard} ${plan.popular ? styles.pricingCardPopular : ''} reveal reveal-delay-${i + 1}`}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>Most Popular</div>
                )}
                <div className={styles.pricingTier}>{plan.tier}</div>
                <div className={styles.pricingPrice}>
                  {plan.price}
                  <span className={styles.pricingPeriod}>{plan.period}</span>
                </div>
                <div className={styles.pricingDesc}>{plan.desc}</div>
                <div className={styles.pricingSearches}>{plan.searches}</div>

                <a
                  href="/signup"
                  className={`btn btn-${plan.ctaStyle} ${styles.pricingCta} ${plan.popular && plan.ctaStyle === 'primary' ? '' : ''}`}
                >
                  {plan.cta}
                </a>

                <div className={styles.pricingDivider} />

                <ul className={styles.pricingFeatures}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} className={styles.pricingFeatureItem}>
                      <span className={styles.pricingCheck}>✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f, fi) => (
                    <li
                      key={`m-${fi}`}
                      className={`${styles.pricingFeatureItem} ${styles.pricingFeatureMissing}`}
                    >
                      <span className={styles.pricingMiss}>✕</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={`${styles.ctaCard} reveal`}>
            <div className={styles.ctaGlow} aria-hidden="true" />
            <div className="eyebrow">Get Started Today</div>
            <h2 className={styles.ctaTitle}>
              Your competitors are already
              <br />
              <span className="gradient-text">tracking their suppliers.</span>
            </h2>
            <p className={styles.ctaDesc}>
              Join hundreds of e-commerce founders using real shipping data to
              source smarter. Start free — no credit card required.
            </p>
            <div className={styles.ctaActions}>
              <a href="/signup" className="btn btn-primary btn-lg">
                Start for Free →
              </a>
              <a href="/login" className="btn btn-ghost btn-lg">
                Already have an account
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <a href="/" className={styles.logo}>
                <span className={styles.logoMark}>⬡</span>
                <span className={styles.logoText}>
                  Supply<span className={styles.logoAccent}>Scout</span>
                </span>
              </a>
              <p className={styles.footerTagline}>
                Supply chain intelligence from real Bill of Lading shipping
                records. Built for e-commerce founders.
              </p>
            </div>

            <div className={styles.footerLinks}>
              {[
                {
                  heading: 'Product',
                  links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
                },
                {
                  heading: 'Company',
                  links: ['About', 'Blog', 'Careers', 'Press'],
                },
                {
                  heading: 'Legal',
                  links: ['Privacy Policy', 'Terms of Service', 'GDPR', 'Contact'],
                },
              ].map((col, i) => (
                <div key={i} className={styles.footerCol}>
                  <div className={styles.footerColHeading}>{col.heading}</div>
                  <ul className={styles.footerColLinks}>
                    {col.links.map((l) => (
                      <li key={l}>
                        <a href="#" className={styles.footerLink}>
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerCopy}>
              © 2026 SupplyScout. All rights reserved.
            </div>
            <div className={styles.footerMono}>
              Built on Bill of Lading data from 160+ countries
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
