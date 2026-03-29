"""
02_query_bol_apify.py — Query ImportYeti via Apify actor for BOL supplier data.

This is the Apify/ImportYeti implementation of the BOL query step.
Use when BOL_DATA_SOURCE=apify in .env (free testing path).

Usage:
    python tools/02_query_bol_apify.py "Gymshark Ltd"
    python tools/02_query_bol_apify.py "Nike Inc" --max-results 10

Output schema (same as BillOfLadingData.com tool for drop-in compatibility):
    {
        "company_name": str,
        "source": "importyeti_apify",
        "suppliers": [
            {
                "supplier_name": str,
                "supplier_country": str,
                "shipment_count": int,
                "latest_shipment_date": str | null,
                "hs_codes": list[str],
                "raw": dict   # original ImportYeti record
            }
        ],
        "total_shipments": int,
        "error": str | null
    }
"""

import os
import sys
import json
import time
import argparse
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN", "")
ACTOR_ID = os.getenv("APIFY_IMPORTYETI_ACTOR_ID", "epctex/importyeti-scraper")
BASE_URL = "https://api.apify.com/v2"


def apify_request(method: str, path: str, body: dict | None = None) -> dict:
    url = f"{BASE_URL}{path}?token={APIFY_API_TOKEN}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def run_actor(company_name: str, max_results: int = 20, max_wait_secs: int = 180) -> list[dict]:
    """Start ImportYeti actor run and return raw dataset items."""
    run_resp = apify_request(
        "POST",
        f"/acts/{ACTOR_ID}/runs",
        body={"searchQuery": company_name, "type": "company", "maxItems": max_results},
    )
    run_id = run_resp["data"]["id"]

    deadline = time.time() + max_wait_secs
    while time.time() < deadline:
        status_resp = apify_request("GET", f"/actor-runs/{run_id}")
        status = status_resp["data"]["status"]
        if status in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
            break
        time.sleep(5)
    else:
        raise TimeoutError(f"Actor run timed out after {max_wait_secs}s")

    if status != "SUCCEEDED":
        raise RuntimeError(f"Actor run failed with status: {status}")

    dataset_id = status_resp["data"]["defaultDatasetId"]
    result = apify_request("GET", f"/datasets/{dataset_id}/items")
    return result if isinstance(result, list) else result.get("items", [])


def normalize_supplier(raw: dict) -> dict:
    """Map ImportYeti fields → SupplyScout supplier schema."""
    return {
        "supplier_name": raw.get("supplierName") or raw.get("name") or raw.get("companyName", ""),
        "supplier_country": raw.get("country") or raw.get("supplierCountry", ""),
        "shipment_count": int(raw.get("shipmentCount") or raw.get("totalShipments") or 0),
        "latest_shipment_date": raw.get("latestShipmentDate") or raw.get("lastShipment"),
        "hs_codes": raw.get("hsCodes") or [],
        "raw": raw,
    }


def query_bol(company_name: str, max_results: int = 20) -> dict:
    """Main entry point — returns normalized supplier list."""
    if not APIFY_API_TOKEN or "your_token" in APIFY_API_TOKEN:
        return {
            "company_name": company_name,
            "source": "importyeti_apify",
            "suppliers": [],
            "total_shipments": 0,
            "error": "APIFY_API_TOKEN not configured",
        }

    try:
        raw_items = run_actor(company_name, max_results=max_results)
    except Exception as e:
        return {
            "company_name": company_name,
            "source": "importyeti_apify",
            "suppliers": [],
            "total_shipments": 0,
            "error": str(e),
        }

    # ImportYeti actor may return company records with nested suppliers,
    # or flat supplier records — handle both shapes.
    suppliers = []
    total_shipments = 0

    for item in raw_items:
        nested = item.get("suppliers") or item.get("topSuppliers")
        if nested and isinstance(nested, list):
            # Company-level record with nested supplier list
            for sup in nested:
                suppliers.append(normalize_supplier(sup))
            total_shipments += int(item.get("totalShipments") or item.get("shipmentCount") or 0)
        else:
            # Flat supplier record
            suppliers.append(normalize_supplier(item))
            total_shipments += int(item.get("shipmentCount") or item.get("totalShipments") or 0)

    # Deduplicate by supplier name, keep highest shipment count
    seen: dict[str, dict] = {}
    for s in suppliers:
        key = s["supplier_name"].strip().lower()
        if key not in seen or s["shipment_count"] > seen[key]["shipment_count"]:
            seen[key] = s
    deduped = sorted(seen.values(), key=lambda x: x["shipment_count"], reverse=True)

    return {
        "company_name": company_name,
        "source": "importyeti_apify",
        "suppliers": deduped,
        "total_shipments": total_shipments,
        "error": None,
    }


def main():
    parser = argparse.ArgumentParser(description="Query ImportYeti via Apify for BOL data")
    parser.add_argument("company_name", help='Legal company name, e.g. "Gymshark Ltd"')
    parser.add_argument("--max-results", type=int, default=20, help="Max supplier results")
    parser.add_argument("--json", action="store_true", help="Output raw JSON only")
    args = parser.parse_args()

    if not args.json:
        print(f"\nQuerying ImportYeti for: {args.company_name}")
        print("(via Apify — may take 30-90s)\n")

    result = query_bol(args.company_name, max_results=args.max_results)

    if args.json:
        print(json.dumps(result, indent=2, default=str))
        return

    if result["error"]:
        print(f"[ERROR] {result['error']}")
        sys.exit(1)

    print(f"Source:          {result['source']}")
    print(f"Company:         {result['company_name']}")
    print(f"Total shipments: {result['total_shipments']}")
    print(f"Suppliers found: {len(result['suppliers'])}")
    print()

    for i, s in enumerate(result["suppliers"][:10], 1):
        print(f"  {i:2}. {s['supplier_name']}")
        print(f"      Country:   {s['supplier_country'] or 'unknown'}")
        print(f"      Shipments: {s['shipment_count']}")
        print(f"      HS codes:  {', '.join(s['hs_codes'][:3]) or 'n/a'}")
        print(f"      Last seen: {s['latest_shipment_date'] or 'n/a'}")
        print()


if __name__ == "__main__":
    main()
