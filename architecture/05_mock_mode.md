# SOP-05: Mock Data Mode

> **Layer:** 1 — Architecture (SOP)
> **Version:** 1.0
> **Last Updated:** 2026-03-27
> **Status:** CONFIRMED ✅

---

## 🎯 Goal

When `USE_MOCK_BOL=true` in `.env`, substitute all BillOfLadingData.com API calls with realistic fixture data. This enables full frontend development, testing, and demos without spending API credits.

---

## 🔄 Mock Activation

Every tool that calls the BOL API checks this flag first:

```python
import os

USE_MOCK = os.environ.get("USE_MOCK_BOL", "false").lower() == "true"

def query_bol(company_name: str, **kwargs) -> dict:
    if USE_MOCK:
        return load_mock_response(company_name)
    return _real_bol_query(company_name, **kwargs)
```

---

## 📦 Mock Fixture Data

Stored in: `tools/fixtures/bol_mock.json`

### Fixture brands

**gymshark.com** → "Gymshark Ltd"
```json
{
  "company_name": "Gymshark Ltd",
  "total_records_found": 142,
  "raw_bol_records": [
    {
      "bill_of_lading_nbr": "MOCK-GS-001",
      "exporter_name": "GUANGZHOU FITLAB SPORTSWEAR CO LTD",
      "export_country": "CN",
      "hs_code": "611020",
      "product_desc": "ATHLETIC WEAR - LEGGINGS AND SHORTS",
      "actual_arrival_date": "2024-09-15",
      "gross_weight": "5200 KG",
      "invoice_value": 85000.00
    },
    {
      "bill_of_lading_nbr": "MOCK-GS-002",
      "exporter_name": "DHAKA ACTIVEWEAR MANUFACTURING LTD",
      "export_country": "BD",
      "hs_code": "611030",
      "product_desc": "ATHLETIC T-SHIRTS",
      "actual_arrival_date": "2024-08-20",
      "gross_weight": "3100 KG",
      "invoice_value": 42000.00
    },
    {
      "bill_of_lading_nbr": "MOCK-GS-003",
      "exporter_name": "HANOI SPORTSWEAR EXPORTS CO",
      "export_country": "VN",
      "hs_code": "611020",
      "product_desc": "TRAINING APPAREL",
      "actual_arrival_date": "2024-07-10",
      "gross_weight": "2800 KG",
      "invoice_value": 38500.00
    }
  ]
}
```

**allbirds.com** → "Allbirds Inc"
**gymshark.com**, **allbirds.com**: covered as default fixtures.
Any other brand → returns generic 2-supplier fixture.

---

## 🎭 Mock Discovery

When in mock mode, company discovery also returns mock data:

```python
MOCK_COMPANY_LOOKUP = {
    "gymshark.com": {"legal_company_name": "Gymshark Ltd", "method": "mock", "confidence": 1.0},
    "allbirds.com": {"legal_company_name": "Allbirds Inc", "method": "mock", "confidence": 1.0},
}

def mock_discover_company(brand_url: str) -> dict:
    domain = extract_domain(brand_url)
    return MOCK_COMPANY_LOOKUP.get(domain, {
        "legal_company_name": f"{domain.title()} Ltd",
        "method": "mock_generic",
        "confidence": 0.8
    })
```

---

## 🎨 UI Mock Badge

When results are from mock data, the UI must display a clear badge:
- **Component:** Yellow `[DEMO DATA]` badge in results header
- **Color:** `--primary: #FFCC00` background, `--bg-base: #0A0A0A` text
- **Tooltip:** "This is sample data. Add your API key to see real supplier records."

---

## ✅ Success Criteria

- When `USE_MOCK_BOL=true`, zero real API calls are made (verified by unit test)
- Mock data produces a realistic full pipeline run including company discovery, BOL query, and supplier aggregation
- Mock results look visually identical to real results (except for the DEMO badge)
- Switching mock off requires only changing `.env` — no code changes
