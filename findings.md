# SupplyScout — Findings & Research

> All discovered facts, constraints, API notes, and relevant resources.
> Last updated: 2026-03-27

---

## 🔌 BillOfLadingData.com API — CONFIRMED ✅

**Base URL:** `https://api.billofladingdata.com`
**Auth:** `Authorization: Bearer <API_KEY>` + `Content-Type: application/json`
**Status:** Paid API — requires key via sales contact. Starting from $79.

### API Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/billdetail` | POST | Full BOL shipment records (150+ fields) |
| `/api/customdata/filter` | POST | Filter by HS code + keyword |
| `/api/company/detail` | POST | Company profile: total shipments, top suppliers, top HS codes |
| `/api/shipping/records` | POST | Simplified shipping records |
| `/api/shipping/statistics` | POST | Aggregate stats by country/HS code |

### Key Fields Returned (Bill Detail)
- `importer_name`, `importer_country`, `importer_address_full`, `importer_tel`
- `exporter_name`, `exporter_id`, `export_country`, `exporter_city`, `exporter_address`
- `hs_code`, `hs_code_desc`, `product_desc`, `brand`
- `start_port`, `end_port`, `actual_arrival_date`
- `gross_weight`, `net_weight`, `invoice_value`, `total_value_usd`

### Critical Query Strategy
- **Use `/api/company/detail`** to get top suppliers by company name (fastest path)
- **Use `/api/billdetail`** with importer_name filter for detailed record lookup
- Pagination: `pageNo` + `pageSize` params (max pageSize TBD from API docs)
- Date filtering: `startDate` + `endDate` (ISO format)
- Country coverage: 160+ countries, refreshed every 7 days for most

### Data Coverage Countries (Relevant)
US, UK, China, Vietnam, Indonesia, India, Pakistan, Bangladesh, Mexico, Brazil, Turkey, Germany, France

---

## 🏛️ Companies House UK API — CONFIRMED ✅

**Base URL:** `https://api.company-information.service.gov.uk`
**Auth:** HTTP Basic Auth with API key as username, blank password
**Cost:** FREE — register at `developer.company-information.service.gov.uk`
**Coverage:** England, Wales, Scotland, Northern Ireland

### Key Endpoints
```
GET /search/companies?q={company_name}
GET /company/{company_number}
GET /company/{company_number}/officers
```

### Strategy for SupplyScout
1. Extract brand name from URL (regex + scraping)
2. Search CH: `GET /search/companies?q={brand_name}`
3. Match top result → extract registered company name
4. Use registered name for BOL query

---

## 🇳🇴 Brønnøysund Register (brreg.no) — CONFIRMED ✅

**Base URL:** `https://data.brreg.no/enhetsregisteret/api`
**Auth:** None — completely free, open API
**Coverage:** All Norwegian registered companies

### Key Endpoints
```
GET /enheter?navn={company_name}         → Search by name
GET /enheter/{orgnr}                     → Get by org number
```

### Response includes
- `navn` (legal name), `organisasjonsnummer`, `forretningsadresse`
- `naeringskode1` (industry code), `stiftelsesdato` (founding date)

---

## 🌍 OpenCorporates API

**Base URL:** `https://api.opencorporates.com/v0.4`
**Auth:** API token (free tier limited to ~10 req/min)
**Coverage:** 160+ jurisdictions globally — best global fallback

### Key Endpoints
```
GET /companies/search?q={name}&api_token={token}
GET /companies/{jurisdiction_code}/{company_number}
```

### Rate limits (free tier)
- ~10 requests/minute, 500/day
- Paid tier available for higher volume

---

## 🔍 Company Name Discovery — Waterfall Strategy

**Priority order for legal name resolution:**
1. **Firecrawl (MCP)** — Scrape brand site: About page, Privacy Policy, Terms of Service, footer
   - Look for: "© 2024 [Legal Name] Ltd", "Registered in...", "VAT number...", WHOIS
2. **Companies House UK** — If TLD is `.co.uk` or brand appears UK-based
3. **Brønnøysund** — If TLD is `.no` or brand appears Norwegian
4. **OpenCorporates** — Global fallback, any jurisdiction

**Scraping signals to extract:**
- Footer legal text: `© Year [Company] Ltd/Inc/GmbH`
- Privacy Policy: "Data Controller: [Legal Name]"
- Terms of Service: "These terms are between you and [Legal Entity]"
- WHOIS registrant org field

---

## 🏗️ Next.js + Supabase Stack Research

### Best Starter Templates Found
1. **Vercel official:** `stripe-supabase-saas-starter-kit`
   - URL: `vercel.com/templates/next.js/stripe-supabase-saas-starter-kit`
   - Includes: Supabase auth, Google OAuth, Stripe billing, Next.js
2. **Makerkit:** Production-ready, Next.js 16, Supabase, Tailwind 4
3. **Official Supabase guide:** `supabase.com/docs/guides/getting-started/tutorials/with-nextjs`

### Tech Stack Decision
- **Framework:** Next.js 14+ (App Router)
- **Auth:** Supabase Auth (`@supabase/ssr`)
- **Database:** Supabase PostgreSQL
- **Payments:** Stripe (`stripe` npm package)
- **Styling:** Vanilla CSS (per project constitution — no Tailwind)
- **Fonts:** Plus Jakarta Sans + JetBrains Mono (Google Fonts)

---

## ⚠️ Known Constraints & Gotchas

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| BOL API is paid | Can't dev without key | `USE_MOCK_BOL=true` mock mode |
| CH API needs registration | Small delay | Register free key immediately |
| OpenCorporates free tier: 500 req/day | Rate limit risk | Use as last resort in waterfall |
| Company name matching is fuzzy | False positives | Normalize names, use confidence scoring |
| Some brands won't be in BOL data | No results | Return empty with explanation |
| Supabase free tier: 500MB storage, 2 projects | Dev only concern | Upgrade for prod |
| Next.js App Router + Supabase auth SSR complexity | Auth middleware | Use `@supabase/ssr` package |

---

## 🐙 GitHub Resources

- `supabase/supabase` — Reference for auth patterns
- `vercel/next.js` — App Router examples
- `stripe-samples/stripe-node-react-starter` — Stripe + React patterns

---

## 💡 Mock Data Strategy (USE_MOCK_BOL=true)

When `USE_MOCK_BOL=true` in `.env`:
- `tools/04_mock_bol.py` returns pre-defined fixture data
- Fixture: gymshark.com → "Gymshark Ltd" → 3 mock factories in Bangladesh/China/Vietnam
- Enables full frontend dev without spending API credits
- ⚠️ Must clearly label mock results in UI (yellow badge)
