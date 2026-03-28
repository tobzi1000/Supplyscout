# SOP-04: Tier Enforcement & Usage Metering

> **Layer:** 1 — Architecture (SOP)
> **Version:** 1.0
> **Last Updated:** 2026-03-27
> **Status:** CONFIRMED ✅

---

## 🎯 Goal

Before any API call is made, verify the user's tier and usage quota. Enforce limits server-side. Apply result blurring for Free tier.

---

## 💰 Tier Limits

| Tier | Searches/mo | Results blurred? | CSV Export | Bulk |
|------|-------------|-----------------|------------|------|
| free | 2 | ✅ Yes | ❌ No | ❌ No |
| starter | 20 | ❌ No | ✅ Yes | ❌ No |
| pro | 100 | ❌ No | ✅ Yes | ✅ Yes |
| agency | Unlimited | ❌ No | ✅ Yes | ✅ Yes |

---

## 🔄 Enforcement Flow

```
User submits brand URL
    │
    ▼
1. Verify authentication (Supabase session)
    │
    ▼
2. Fetch user_profiles row for user_id
    │
    ▼
3. Check: searches_used_this_month >= searches_limit?
    ├─ YES → Return 429: "Monthly limit reached. Upgrade to continue."
    └─ NO → Continue
    │
    ▼
4. Increment searches_used_this_month (Supabase RPC, atomic)
    │
    ▼
5. Create searches row: status = "processing"
    │
    ▼
6. Run pipeline (SOP-01 → 02 → 03)
    │
    ▼
7. Save results to searches.result_json + suppliers table
    │
    ▼
8. If tier == "free": Apply blurring to result before returning
    │
    ▼
9. Return results to client
```

---

## 🔒 Result Blurring (Free Tier)

```python
def apply_free_tier_blur(suppliers: list[dict]) -> list[dict]:
    """Blur supplier details for free tier users."""
    blurred = []
    for i, supplier in enumerate(suppliers):
        if i == 0:
            # First supplier: show country only, blur name
            blurred.append({
                **supplier,
                "name": blur_text(supplier["name"]),
                "contact": None,
                "website": None,
            })
        else:
            # All other suppliers: fully blurred
            blurred.append({
                "name": "••••••••••••",
                "country": supplier["country"],  # Keep country for teaser
                "shipment_count": supplier["shipment_count"],  # Keep count
                "latest_shipment_date": "••••••••",
                "hs_codes": ["••••••"],
                "confidence_score": supplier["confidence_score"],
                "signals": supplier["signals"],
                "contact": None,
                "website": None,
                "_blurred": True,
            })
    return blurred

def blur_text(text: str) -> str:
    """Reveal first 3 chars, blur the rest."""
    if len(text) <= 3:
        return "•" * len(text)
    return text[:3] + "•" * (len(text) - 3)
```

---

## 🗄️ Supabase Operations

### Atomic usage increment (prevent race conditions)
```sql
-- Supabase RPC function
CREATE OR REPLACE FUNCTION increment_search_count(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET searches_used_this_month = searches_used_this_month + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

### Monthly reset (runs on 1st of each month via Supabase cron)
```sql
UPDATE user_profiles SET searches_used_this_month = 0;
```

---

## ✅ Success Criteria

- Usage check happens BEFORE any API call is made (no waste of credits)
- Increment is atomic — no double-counting on concurrent requests
- Free tier blurring applied consistently — never exposes full supplier names
- 429 response includes upgrade CTA with pricing tier info
