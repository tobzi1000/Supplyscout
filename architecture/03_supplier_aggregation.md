# SOP-03: Raw BOL Records → Supplier Aggregation

> **Layer:** 1 — Architecture (SOP)
> **Version:** 1.0
> **Last Updated:** 2026-03-27
> **Status:** CONFIRMED ✅

---

## 🎯 Goal

Given raw Bill of Lading records (from SOP-02), aggregate, deduplicate, and score suppliers to produce the final `suppliers[]` payload.

---

## 📥 Input

Array of raw BOL records (from `.tmp/{brand_slug}_bol_raw.json`)

## 📤 Output

```json
{
  "suppliers": [
    {
      "name": "Guangzhou Sportswear Co Ltd",
      "country": "China",
      "shipment_count": 34,
      "latest_shipment_date": "2024-09-15",
      "hs_codes": ["611020", "611030"],
      "confidence_score": 0.92,
      "signals": ["bill_of_lading"],
      "contact": null,
      "website": null
    }
  ]
}
```

---

## 🔄 Aggregation Process

### Step 1: Normalize Exporter Names
```python
def normalize_company_name(raw_name: str) -> str:
    # 1. Strip extra whitespace
    name = raw_name.strip().upper()
    # 2. Remove common filler words
    filler = ['CO', 'CO.', 'LTD', 'LIMITED', 'INC', 'CORP', 'LLC', 'GMBH', 'CO.,LTD', 'CO. LTD']
    for word in filler:
        name = re.sub(rf'\b{re.escape(word)}\b\.?', '', name).strip()
    # 3. Remove trailing commas/periods
    name = name.rstrip(',. ')
    return name
```

### Step 2: Group by Normalized Exporter Name
- Group all records by `normalize(exporter_name)`
- For each group, collect:
  - Raw exporter names seen (pre-normalization)
  - All HS codes
  - All shipment dates
  - Total shipment count

### Step 3: Fuzzy Deduplication
- After grouping, fuzzy-match group keys against each other
- If two normalized names have SequenceMatcher ratio ≥ 0.85 → merge groups
- Use the longer/cleaner name as canonical

### Step 4: Confidence Scoring

```python
def calculate_confidence(supplier: dict) -> float:
    score = 0.0
    
    # Base score for having BOL records (always present here)
    score += 0.5
    
    # Shipment volume (higher = more reliable)
    if supplier["shipment_count"] >= 10:
        score += 0.2
    elif supplier["shipment_count"] >= 3:
        score += 0.1
    
    # Data freshness (recent = more reliable)
    days_since_last = (datetime.now() - supplier["latest_shipment_date"]).days
    if days_since_last <= 90:
        score += 0.2
    elif days_since_last <= 365:
        score += 0.1
    
    # HS code presence (confirms product specificity)
    if supplier["hs_codes"]:
        score += 0.1
    
    return min(round(score, 2), 1.0)
```

### Step 5: Sort & Filter
- Sort by `shipment_count` descending (highest volume first)
- Filter: only include suppliers with `confidence_score >= 0.5`
- Cap at 50 suppliers in output (pagination handled by UI)

### Step 6: Country Code → Country Name
```python
COUNTRY_MAP = {
    "CN": "China", "VN": "Vietnam", "BD": "Bangladesh",
    "IN": "India", "PK": "Pakistan", "TR": "Turkey",
    "KH": "Cambodia", "ID": "Indonesia", "TH": "Thailand",
    # ... full ISO 3166-1 alpha-2 map
}
```

---

## ⚠️ Edge Cases

| Case | Handling |
|------|----------|
| Same supplier, different spellings | Fuzzy merge at ratio ≥ 0.85 |
| HS code missing from some records | Use codes present in other records for same supplier |
| All records older than 365 days | Flag: `data_freshness: "stale"` in output |
| Supplier with 1 shipment only | Include if recent (< 90 days), else filter out |
| Exporter name is generic ("FREIGHT FORWARDER") | Filter list of known freight forwarder names |

### Freight Forwarder Filter List
```python
EXCLUDE_PATTERNS = [
    "FREIGHT", "FORWARDER", "LOGISTICS", "SHIPPING CO",
    "CUSTOMS BROKER", "FREIGHT SERVICES", "CARGO",
    "DHL", "FEDEX", "UPS", "MAERSK", "MSC", "COSCO"
]
```

---

## 📁 Output

- `.tmp/{brand_slug}_suppliers_aggregated.json` — Final supplier list
- Written to Supabase `suppliers` table (via Next.js API route)

---

## ✅ Success Criteria

- Deduplication reduces raw exporter count by ≥ 30% for real datasets
- All suppliers have `confidence_score` between 0.0 and 1.0
- Freight forwarders filtered from results
- Runs in < 2 seconds on 500 raw records
