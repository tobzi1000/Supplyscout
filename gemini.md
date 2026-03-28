# SupplyScout — Project Constitution (`gemini.md`)

> **This file is LAW.** Update only when: a schema changes, a rule is added, or architecture is modified.
> Last updated: 2026-03-27

---

## 🎯 North Star

**SupplyScout** is a SaaS tool that lets e-commerce founders find any brand's product suppliers by pasting a brand URL. The system auto-discovers the brand's legal company name, queries Bill of Lading shipping records, and delivers a complete supplier list with names, countries, shipment volumes, dates, and HS codes.

**V1 Success Criterion:** Given any brand URL, return a verified list of suppliers from Bill of Lading data, with names, countries, shipment volumes, dates, and HS codes — within a web UI dashboard with CSV export.

---

## 🏗️ Architecture Overview (A.N.T. 3-Layer)

```
├── gemini.md               ← Project Constitution (this file)
├── .env                    ← API Keys & Secrets (never commit)
├── architecture/           ← Layer 1: SOPs (Markdown specs)
├── tools/                  ← Layer 3: Deterministic Python scripts
├── .tmp/                   ← Ephemeral intermediate files
├── frontend/               ← Next.js SaaS application (Phase 4)
└── task_plan.md / findings.md / progress.md ← Project memory
```

---

## 🖥️ Application Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Dark hero, live search demo, pricing |
| Signup | `/signup` | Supabase Auth |
| Login | `/login` | Supabase Auth + Google OAuth |
| Dashboard | `/dashboard` | Overview, usage stats, recent searches |
| Search | `/search` | URL input → progress steps → results table |
| History | `/history` | Past searches, re-run, export |
| Billing | `/billing` | Plan, usage bar, upgrade/downgrade |
| Settings | `/settings` | Profile, password, delete account |

---

## 💰 Pricing Tiers

| Tier | Price | Searches/mo | Features |
|------|-------|-------------|---------|
| Free | $0 | 2 | Blurred results |
| Starter | $49/mo | 20 | Full data, CSV export |
| Pro | $99/mo | 100 | Bulk search |
| Agency | $299/mo | Unlimited | API access, white-label |

---

## 📐 Data Schema (CONFIRMED ✅)

### Input Payload

```json
{
  "brand_url": "https://gymshark.com",
  "submitted_at": "2026-03-27T23:00:00Z",
  "user_id": "uuid"
}
```

### Intermediate Payload (`.tmp/`)

```json
{
  "brand_url": "string",
  "brand_name": "string",
  "legal_company_name": "string",
  "company_discovery_method": "scraping | companies_house | bronnoy | opencorporates",
  "raw_signals": {
    "bol_raw_records": [],
    "whois_data": {},
    "scraped_about_text": "string"
  }
}
```

### Output Payload (Final Delivery — CONFIRMED ✅)

```json
{
  "brand_url": "string",
  "brand_name": "string",
  "legal_company_name": "string",
  "suppliers": [
    {
      "name": "string",
      "country": "string",
      "shipment_count": 0,
      "latest_shipment_date": "ISO8601",
      "hs_codes": ["string"],
      "confidence_score": 0.0,
      "signals": ["bill_of_lading"],
      "contact": "string | null",
      "website": "string | null"
    }
  ],
  "generated_at": "ISO8601 timestamp",
  "data_sources_used": ["billofladingdata", "companies_house", "opencorporates"]
}
```

---

## 📏 Behavioral Rules (CONFIRMED ✅)

1. **No hallucinated suppliers** — Every supplier must be traceable to a real Bill of Lading record.
2. **Confidence scoring is mandatory** — All results must carry a `confidence_score` (0.0–1.0).
3. **Data freshness** — Prefer records updated within 90 days; flag stale data.
4. **Rate limits respected** — All API tools must implement exponential backoff.
5. **User privacy** — Never store raw brand URLs longer than needed for one job run.
6. **Fail loudly** — Tools must raise exceptions; silent failures are forbidden.
7. **Mock data mode** — `USE_MOCK_BOL=true` in `.env` enables full dev workflow without API calls.
8. **Tier enforcement** — Usage limits enforced server-side before any API call is made.
9. **Free tier blurring** — Supplier names/details blurred for Free tier users.

---

## 🔌 Integrations (CONFIRMED ✅)

| Service | Purpose | Key Status |
|---------|---------|------------|
| BillOfLadingData.com | Primary supplier data source (BOL records) | ❌ Not yet set |
| Supabase | Auth (email + Google OAuth) + PostgreSQL DB | ❌ Not yet set |
| Companies House UK | Legal company name discovery (UK brands) | ✅ Free, no key needed |
| Brønnøysund Register (NO) | Legal company name discovery (Norwegian brands) | ✅ Free, no key needed |
| OpenCorporates | Legal company name discovery (global fallback) | ❌ Key needed for full API |
| Firecrawl (MCP) | Web scraping for brand pages / company discovery | ✅ Active |
| Stripe | Payment processing for subscription billing | ❌ Not yet set |

---

## 🎨 Design System (LOCKED ✅)

```css
/* Colors */
--bg-base: #0A0A0A;
--bg-surface: #141414;
--primary: #FFCC00;       /* DHL Yellow */
--accent-red: #D40511;    /* DHL Red — CTAs, alerts, badges */
--text-primary: #F5F5F0;  /* Warm white */
--text-muted: #9A9A8E;
--success: #22C55E;
--border: #2A2A24;

/* Fonts */
--font-sans: 'Plus Jakarta Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**Aesthetic:** Dark, modern, bold logistics SaaS. DHL warm palette. No gray/cold tones.

---

## 🗄️ Database Schema (Supabase PostgreSQL)

### `users` (managed by Supabase Auth)
- `id`, `email`, `created_at`

### `user_profiles`
- `user_id` (FK → users.id)
- `tier` (free | starter | pro | agency)
- `searches_used_this_month`
- `searches_limit`
- `stripe_customer_id`

### `searches`
- `id`, `user_id` (FK)
- `brand_url`, `brand_name`, `legal_company_name`
- `status` (pending | processing | complete | failed)
- `result_json` (final output payload)
- `created_at`, `completed_at`

### `suppliers` (denormalized for fast queries)
- `id`, `search_id` (FK)
- `name`, `country`, `shipment_count`
- `latest_shipment_date`, `hs_codes[]`
- `confidence_score`

---

## 🔄 Maintenance Log

| Date | Change | Author |
|------|--------|--------|
| 2026-03-27 | Initial constitution created via B.L.A.S.T. Protocol 0 | System Pilot |
| 2026-03-27 | Full project brief received — all schemas, rules, integrations confirmed | System Pilot |
