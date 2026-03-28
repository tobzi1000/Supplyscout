# SupplyScout — Task Plan

> **Protocol:** B.L.A.S.T. | **Status:** 🟡 Phase 2 Link ACTIVE (Phase 4 partially completed out-of-order)
> Last updated: 2026-03-28

---

## 🎯 Project Goal

SaaS tool: user pastes brand URL → system discovers legal company name → queries Bill of Lading import records → returns supplier list with names, countries, shipment volumes, dates, HS codes.

**Stack:** Next.js + Supabase (auth + DB) + BillOfLadingData.com API + Stripe

---

## 📋 Phase Checklist

### ✅ Protocol 0: Initialization
- [x] `gemini.md` created, rules/schemas locked ✅
- [x] Memory files (`task_plan.md`, `findings.md`, `progress.md`) initialized ✅
- [x] Discovery Q&A completed ✅
- [x] Directory scaffold created (`architecture/`, `tools/`, `.tmp/`) ✅

---

### ✅ Phase 1: B — Blueprint (Vision & Logic)
- [x] BillOfLadingData.com API endpoints documented → `findings.md`
- [x] Companies House UK API approach confirmed
- [x] Brønnøysund (NO) API confirmed free
- [x] Input/Output Data Schema defined in `gemini.md` (Data-First Rule)
- [x] Next.js + Supabase SaaS starter kit identified
- [ ] OpenCorporates API rate limits confirmed
- [ ] Companies House UK API key obtained (free, register at developer.company-information.service.gov.uk)

---

### 🟡 Phase 2: L — Link (Connectivity)
- [ ] `.env` created with all keys
- [ ] `tools/verify_bol_api.py` — tests BillOfLadingData.com connection
- [ ] `tools/verify_companies_house.py` — tests CH API
- [ ] `tools/verify_brreg.py` — tests Brønnøysund API
- [ ] `tools/verify_open_corporates.py` - tests OC API
- [ ] `tools/verify_supabase.py` — tests DB connection
- [ ] All handshakes passing

---

### 🔵 Phase 3: A — Architect (3-Layer Build)
*Layer 1: Architecture (SOPs)*
- [ ] SOP: Brand URL → Company Name Discovery (`architecture/01_company_discovery.md`)
- [ ] SOP: Company Name → BOL Query (`architecture/02_bol_query.md`)
- [ ] SOP: BOL records → Supplier Aggregation (`architecture/03_supplier_aggregation.md`)
- [ ] SOP: Tier enforcement + usage metering (`architecture/04_tier_enforcement.md`)
- [ ] SOP: Mock data mode (`architecture/05_mock_mode.md`)

*Layer 2 & 3: Navigation and Tools*
- [ ] `tools/01_discover_company.py` — brand URL → legal name
- [ ] `tools/02_query_bol.py` — company name → BOL records
- [ ] `tools/03_aggregate_suppliers.py` — BOL records → supplier list
- [ ] `tools/04_mock_bol.py` — mock BOL responses for `USE_MOCK_BOL=true`
- [ ] Full pipeline integration test

---

### 🟡 Phase 4: S — Stylize (Refinement & UI)
- [x] Initialize Next.js app in `frontend/`
- [x] Install: `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `next`
- [x] Set up design system in `frontend/src/app/globals.css` (Plus Jakarta Sans + JetBrains Mono)
- [x] Landing page (`/`) — dark hero, live search demo, pricing
- [ ] Auth pages (`/login`, `/signup`) — Supabase + Google OAuth
- [ ] Dashboard (`/dashboard`) — usage stats, recent searches
- [ ] Search page (`/search`) — URL input → progress → results table
- [ ] History (`/history`) — past searches, re-run, CSV export
- [ ] Billing (`/billing`) — plan, usage bar, upgrade
- [ ] Settings (`/settings`) — profile, password, delete account

---

### 🔵 Phase 5: T — Trigger (Deployment)
- [ ] Supabase project created (prod)
- [ ] Vercel deployment configured
- [ ] Stripe webhooks set up
- [ ] Production .env configured
- [ ] `gemini.md` Maintenance Log finalized

---

## 🚧 Immediate Next Steps (Priority Order)

1. **Obtain Companies House UK API key** (free, developer.company-information.service.gov.uk)
2. **Obtain BillOfLadingData.com API key**
3. **Obtain OpenCorporates API Token**
4. **Create Supabase project** → get `SUPABASE_URL` and `SUPABASE_ANON_KEY`
5. **Create `.env`** with all keys → kick off Phase 2 verification tools.
