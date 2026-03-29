"""
verify_bol_apify.py — Test Apify ImportYeti actor connectivity.

Usage:
    python tools/verify_bol_apify.py

Expects in .env:
    APIFY_API_TOKEN
    APIFY_IMPORTYETI_ACTOR_ID
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN", "")
ACTOR_ID = os.getenv("APIFY_IMPORTYETI_ACTOR_ID", "epctex/importyeti-scraper")
BASE_URL = "https://api.apify.com/v2"

TEST_COMPANY = "Gymshark"  # Known company with ImportYeti data


def apify_request(method: str, path: str, body: dict | None = None) -> dict:
    url = f"{BASE_URL}{path}?token={APIFY_API_TOKEN}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        raise RuntimeError(f"HTTP {e.code}: {body_text}") from e


def run_actor_sync(company_name: str, max_wait_secs: int = 120) -> list[dict]:
    """Start actor run, poll until finished, return dataset items."""
    print(f"  Starting actor run for: '{company_name}'...")

    # Start run
    run_resp = apify_request(
        "POST",
        f"/acts/{ACTOR_ID}/runs",
        body={"q": company_name, "maxItems": 5},
    )
    run_id = run_resp["data"]["id"]
    print(f"  Run ID: {run_id}")

    # Poll for completion
    deadline = time.time() + max_wait_secs
    while time.time() < deadline:
        status_resp = apify_request("GET", f"/actor-runs/{run_id}")
        status = status_resp["data"]["status"]
        print(f"  Status: {status}")
        if status in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
            break
        time.sleep(5)
    else:
        raise TimeoutError(f"Actor run did not finish within {max_wait_secs}s")

    if status != "SUCCEEDED":
        raise RuntimeError(f"Actor run ended with status: {status}")

    # Fetch dataset items
    dataset_id = status_resp["data"]["defaultDatasetId"]
    items_resp = apify_request("GET", f"/datasets/{dataset_id}/items")
    return items_resp if isinstance(items_resp, list) else items_resp.get("items", [])


def main():
    print("=" * 55)
    print("  SupplyScout — Apify/ImportYeti Connection Test")
    print("=" * 55)

    # 1. Check token
    if not APIFY_API_TOKEN or APIFY_API_TOKEN == "apify_api_your_token_here":
        print("[FAIL] APIFY_API_TOKEN not set in .env")
        sys.exit(1)
    print(f"[OK]   Token found: {APIFY_API_TOKEN[:12]}...")
    print(f"[OK]   Actor ID: {ACTOR_ID}")

    # 2. Verify token via user endpoint
    print("\n[1/3] Verifying token...")
    try:
        user = apify_request("GET", "/users/me")
        username = user["data"].get("username", "unknown")
        plan = user["data"].get("plan", {}).get("id", "unknown")
        print(f"[OK]   Authenticated as: {username} (plan: {plan})")
    except Exception as e:
        print(f"[FAIL] Token verification failed: {e}")
        sys.exit(1)

    # 3. Run actor with test company
    print(f"\n[2/3] Running ImportYeti actor for '{TEST_COMPANY}'...")
    print("      (This may take 30-90 seconds on first run)")
    try:
        items = run_actor_sync(TEST_COMPANY)
        print(f"[OK]   Actor returned {len(items)} result(s)")
    except Exception as e:
        print(f"[FAIL] Actor run failed: {e}")
        sys.exit(1)

    # 4. Show sample output
    print("\n[3/3] Sample result structure:")
    if items:
        sample = items[0]
        print(json.dumps(sample, indent=2, default=str)[:800])
        print("\n  Key fields present:")
        for field in ("companyName", "suppliers", "country", "shipmentCount", "url"):
            status = "[OK]" if field in sample else "[--]"
            print(f"  {status}  {field}")
    else:
        print("  (no items returned — check actor ID or company name)")

    print("\n" + "=" * 55)
    print("  Handshake: PASS" if items else "  Handshake: PARTIAL (no data)")
    print("=" * 55)


if __name__ == "__main__":
    main()
