# SOP-01: Brand URL → Legal Company Name Discovery

> **Layer:** 1 — Architecture (SOP)
> **Version:** 1.0
> **Last Updated:** 2026-03-27
> **Status:** CONFIRMED ✅

---

## 🎯 Goal

Given a brand URL (e.g. `https://gymshark.com`), reliably discover the legal registered company name that can be used to query Bill of Lading records.

---

## 📥 Input

```json
{
  "brand_url": "https://gymshark.com"
}
```

## 📤 Output

```json
{
  "brand_url": "https://gymshark.com",
  "brand_name": "Gymshark",
  "legal_company_name": "Gymshark Ltd",
  "company_discovery_method": "companies_house",
  "confidence": 0.95,
  "discovery_signals": [
    "© 2024 Gymshark Ltd found in footer",
    "Matched in Companies House: company #07453483"
  ]
}
```

---

## 🔄 Waterfall Discovery Process

```
Brand URL
    │
    ▼
Step 1: Extract Brand Name (always)
    │
    ▼
Step 2: Scrape brand site (Firecrawl)
    ├─ Found legal name? → DONE (confidence: 0.9)
    └─ Not found? → Step 3
    │
    ▼
Step 3: Companies House UK (if .co.uk or signals UK)
    ├─ Found? → DONE (confidence: 0.95)
    └─ Not found / not UK? → Step 4
    │
    ▼
Step 4: Brønnøysund / brreg.no (if .no or signals Norwegian)
    ├─ Found? → DONE (confidence: 0.95)
    └─ Not found? → Step 5
    │
    ▼
Step 5: OpenCorporates (global fallback)
    ├─ Found? → DONE (confidence: 0.8)
    └─ Not found? → Return brand_name with LOW confidence
```

---

## 📋 Step Details

### Step 1: Brand Name Extraction
- Strip protocol and `www.` from URL
- Extract domain name (before first `.`)
- Capitalize: `gymshark.com` → `Gymshark`
- **Tool:** Pure Python string manipulation (no API needed)

### Step 2: Firecrawl Web Scraping
**Target pages (in order):**
1. `/` (homepage) — look in footer, meta tags
2. `/privacy-policy` or `/privacy`
3. `/terms` or `/terms-of-service`
4. `/about` or `/about-us`

**Regex signals to detect:**
```python
LEGAL_NAME_PATTERNS = [
    r'©\s*\d{4}\s+([A-Z][a-zA-Z\s,\.]+(?:Ltd|LLC|Inc|GmbH|SAS|BV|AB|AS|Pty|Corp))',
    r'([A-Z][a-zA-Z\s,\.]+(?:Ltd|LLC|Inc|GmbH))\s+is\s+(?:registered|incorporated)',
    r'Data Controller[:\s]+([A-Z][a-zA-Z\s,\.]+(?:Ltd|LLC|Inc|GmbH))',
    r'Registered (?:company|business)[:\s]+([A-Z][a-zA-Z\s,\.]+)',
    r'VAT (?:number|no)[:\s#]+[A-Z]{2}\d+.*?([A-Z][a-zA-Z\s,\.]+(?:Ltd|LLC))',
]
```

**Confidence:** 0.9 if pattern matched, 0.6 if only brand name found.

### Step 3: Companies House UK
**API call:**
```
GET https://api.company-information.service.gov.uk/search/companies?q={brand_name}&items_per_page=5
Authorization: Basic {base64(api_key + ":")}
```

**Match logic:**
- Compare search results against extracted brand_name
- Use fuzzy string matching (difflib.SequenceMatcher ≥ 0.8)
- Prefer: `company_status == "active"`
- Extract: `title` (legal name), `company_number`, `company_type`

**Confidence:** 0.95 if fuzz ratio ≥ 0.9, 0.75 if 0.8–0.9.

### Step 4: Brønnøysund Register (Norway)
**API call:**
```
GET https://data.brreg.no/enhetsregisteret/api/enheter?navn={brand_name}&size=5
```

**Match logic:** Same fuzzy matching as Companies House.

**Confidence:** 0.95 if fuzz ratio ≥ 0.9.

### Step 5: OpenCorporates (Global Fallback)
**API call:**
```
GET https://api.opencorporates.com/v0.4/companies/search?q={brand_name}&api_token={key}
```

**Match logic:** Sort by `score`, take top result if score ≥ 0.7.

**Confidence:** 0.8 if high score, 0.6 if medium.

---

## ⚠️ Edge Cases

| Case | Handling |
|------|----------|
| Brand has no registration (sole trader) | Return brand_name, confidence 0.4, flag for review |
| Multiple company matches | Return top match by confidence; include alternatives in `raw_signals` |
| DBA brand (e.g. "BYLT" operating as "Bylt Basics Inc") | Scraping usually catches the DBA; fallback matches on trade name |
| Brand URL is a subdomain (e.g. `shop.brand.com`) | Strip to root domain before step 1 |
| Redirect chains | Firecrawl follows redirects automatically |
| Rate limit hit | Exponential backoff: wait(2^attempt * RETRY_DELAY_MS ms), max MAX_RETRIES |

---

## 🔐 Rate Limits

| Service | Limit | Backoff Strategy |
|---------|-------|-----------------|
| Firecrawl | Per MCP tier | 1s delay between calls |
| Companies House | 600 req/5min | Exponential backoff |
| Brønnøysund | Generous (no stated limit) | 500ms delay |
| OpenCorporates | 10 req/min (free) | 6s minimum between calls |

---

## 📁 Output File

Intermediate result saved to: `.tmp/{brand_slug}_company_discovery.json`

Example: `.tmp/gymshark_company_discovery.json`

---

## ✅ Success Criteria

- Returns `legal_company_name` in ≥ 80% of real-world brand URL tests
- Runs in < 10 seconds per brand URL
- Never silently fails — must raise `CompanyDiscoveryError` if all steps exhausted
