# SOP-02: Legal Company Name → Bill of Lading Query

> **Layer:** 1 — Architecture (SOP)
> **Version:** 1.0
> **Last Updated:** 2026-03-27
> **Status:** CONFIRMED ✅

---

## 🎯 Goal

Given a verified legal company name, query the BillOfLadingData.com API to retrieve all import shipment records where this company is the importer. Extract and return raw supplier (exporter) records.

---

## 📥 Input

```json
{
  "legal_company_name": "Gymshark Ltd",
  "brand_url": "https://gymshark.com",
  "date_range_days": 365
}
```

## 📤 Output

```json
{
  "company_name": "Gymshark Ltd",
  "total_records_found": 142,
  "raw_bol_records": [
    {
      "bill_of_lading_nbr": "ABC123",
      "exporter_name": "GUANGZHOU SPORTSWEAR CO LTD",
      "export_country": "CN",
      "hs_code": "611020",
      "product_desc": "ATHLETIC WEAR",
      "actual_arrival_date": "2024-09-15",
      "gross_weight": "5200 KG",
      "invoice_value": 85000.00
    }
  ],
  "query_metadata": {
    "date_from": "2023-03-27",
    "date_to": "2024-03-27",
    "pages_fetched": 15,
    "api_calls_used": 15
  }
}
```

---

## 🔄 Query Process

### Step 1: Company Detail Lookup (Fast Path)
```
POST /api/company/detail
{
  "companyName": "Gymshark Ltd"
}
```

Returns: `total_shipments`, `top_suppliers`, `top_hs_codes`.
Use this to quickly check if company has BOL records before running full query.

**If `total_shipments == 0`:** Try name variations (see Name Normalization below).
**If still 0:** Return empty result (not a failure — company may not import directly).

### Step 2: Paginated Bill Detail Query
```
POST /api/billdetail
{
  "pageNo": 1,
  "pageSize": 100,
  "searchKey": "Gymshark Ltd",
  "country": "US",
  "startDate": "2023-03-27",
  "endDate": "2024-03-27"
}
```

**Pagination logic:**
```python
page = 1
all_records = []
while True:
    response = query_bol(page=page)
    all_records.extend(response["data"]["records"])
    if len(all_records) >= response["data"]["total"]:
        break
    if page >= MAX_PAGES:  # Safety cap = 50 pages
        break
    page += 1
    time.sleep(0.5)  # Rate limit respect
```

### Step 3: Save to .tmp/
Write all records to `.tmp/{brand_slug}_bol_raw.json`

---

## 🔧 Name Normalization Strategy

Legal company names are stored inconsistently in BOL data. Try these variations:

```python
def generate_name_variants(legal_name: str) -> list[str]:
    variants = [legal_name]
    
    # Strip legal suffixes
    stripped = re.sub(r'\b(Ltd|Limited|LLC|Inc|Corp|GmbH|SAS|BV|AS|Pty)\b\.?', '', legal_name).strip()
    variants.append(stripped)
    
    # ALL CAPS (common in customs data)
    variants.append(legal_name.upper())
    variants.append(stripped.upper())
    
    # Remove punctuation
    no_punct = re.sub(r'[^\w\s]', '', legal_name).strip()
    variants.append(no_punct.upper())
    
    return list(dict.fromkeys(variants))  # deduplicate, preserve order
```

**Query each variant** until records are found (or all exhausted).

---

## 🌍 Country Strategy

BillOfLadingData.com covers 160+ countries. Query strategy:
1. Start with `country: "US"` (largest dataset, most e-commerce brands import to US)
2. If brand is UK-based, also query `country: "GB"`
3. Additional countries from company location signals

---

## ⚠️ Edge Cases

| Case | Handling |
|------|----------|
| Zero records found | Try name variants; if still 0, return empty with explanation |
| API rate limit (429) | Exponential backoff: wait(2^attempt seconds), max 3 retries |
| Partial company name match | Use `top_suppliers` from company detail as cross-reference |
| Very large result set (>5000 records) | Cap at 500 most recent records; note truncation in metadata |
| Mock mode (`USE_MOCK_BOL=true`) | Return fixture data from `tools/fixtures/bol_mock.json` |

---

## 🔐 Rate Limits & Quotas

- Max pages per query: 50 (safety cap)
- Delay between pages: 500ms
- On 429: exponential backoff (1s, 2s, 4s), then raise `BOLRateLimitError`
- On 500/503: raise `BOLAPIError` immediately (fail loudly)

---

## 📁 Output Files

- `.tmp/{brand_slug}_bol_raw.json` — All raw BOL records
- `.tmp/{brand_slug}_query_metadata.json` — Pages fetched, API calls used

---

## ✅ Success Criteria

- Successfully retrieves all paginated results for a company with known BOL records
- Handles name variations for imperfect company name matches
- Completes in < 30 seconds for companies with up to 500 records
- Raises explicit errors — never silently returns empty on API failure
