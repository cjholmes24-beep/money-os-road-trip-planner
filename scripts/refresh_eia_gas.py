#!/usr/bin/env python3
"""Refresh Suitcase Brain's keyless EIA weekly gasoline snapshot.

Uses EIA's official PET bulk file, so no API key or paid service is required.
If the download or parse fails, the existing snapshot is left untouched.
"""
from __future__ import annotations

import io
import json
import pathlib
import sys
import urllib.request
import zipfile
from datetime import datetime, timezone

BULK_URL = "https://api.eia.gov/bulk/PET.zip"
OUT = pathlib.Path("data/eia-gas-latest.json")

TARGETS = {
    "U.S. average": ("PET.EMM_EPM0_PTE_NUS_DPG.W", ["united states", "us", "u.s."]),
    "East Coast": ("PET.EMM_EPM0_PTE_R10_DPG.W", ["east coast"]),
    "New England": ("PET.EMM_EPM0_PTE_R1X_DPG.W", ["new england"]),
    "Central Atlantic": ("PET.EMM_EPM0_PTE_R1Y_DPG.W", ["central atlantic"]),
    "Lower Atlantic": ("PET.EMM_EPM0_PTE_R1Z_DPG.W", ["lower atlantic"]),
    "Midwest": ("PET.EMM_EPM0_PTE_R20_DPG.W", ["midwest"]),
    "Gulf Coast": ("PET.EMM_EPM0_PTE_R30_DPG.W", ["gulf coast"]),
    "Rocky Mountain": ("PET.EMM_EPM0_PTE_R40_DPG.W", ["rocky mountain", "rockies"]),
    "West Coast": ("PET.EMM_EPM0_PTE_R50_DPG.W", ["west coast"]),
    "California": ("PET.EMM_EPM0_PTE_SCA_DPG.W", ["california", "ca"]),
    "Colorado": ("PET.EMM_EPM0_PTE_SCO_DPG.W", ["colorado", "co"]),
    "Florida": ("PET.EMM_EPM0_PTE_SFL_DPG.W", ["florida", "fl"]),
    "Massachusetts": ("PET.EMM_EPM0_PTE_SMA_DPG.W", ["massachusetts", "ma"]),
    "Minnesota": ("PET.EMM_EPM0_PTE_SMN_DPG.W", ["minnesota", "mn"]),
    "New York": ("PET.EMM_EPM0_PTE_SNY_DPG.W", ["new york", "ny"]),
    "Ohio": ("PET.EMM_EPM0_PTE_SOH_DPG.W", ["ohio", "oh"]),
    "Texas": ("PET.EMM_EPM0_PTE_STX_DPG.W", ["texas", "tx"]),
    "Washington": ("PET.EMM_EPM0_PTE_SWA_DPG.W", ["washington state", "washington", "wa"]),
    "Boston": ("PET.EMM_EPM0_PTE_YBOS_DPG.W", ["boston"]),
    "Chicago": ("PET.EMM_EPM0_PTE_YORD_DPG.W", ["chicago"]),
    "Cleveland": ("PET.EMM_EPM0_PTE_YCLE_DPG.W", ["cleveland"]),
    "Denver": ("PET.EMM_EPM0_PTE_YDEN_DPG.W", ["denver"]),
    "Houston": ("PET.EMM_EPM0_PTE_Y44HO_DPG.W", ["houston"]),
    "Los Angeles": ("PET.EMM_EPM0_PTE_Y05LA_DPG.W", ["los angeles", "la"]),
    "Miami": ("PET.EMM_EPM0_PTE_YMIA_DPG.W", ["miami"]),
    "New York City": ("PET.EMM_EPM0_PTE_Y35NY_DPG.W", ["new york city", "nyc"]),
    "San Francisco": ("PET.EMM_EPM0_PTE_Y05SF_DPG.W", ["san francisco"]),
    "Seattle": ("PET.EMM_EPM0_PTE_Y48SE_DPG.W", ["seattle"]),
}
SID_TO_META = {sid: (label, aliases) for label, (sid, aliases) in TARGETS.items()}

def normalize_period(raw):
    s = str(raw).strip().replace("-", "")
    if len(s) == 8 and s.isdigit():
        return f"{s[:4]}-{s[4:6]}-{s[6:8]}"
    raise ValueError(f"unexpected weekly period {raw!r}")

def latest_point(obj):
    points = []
    for pair in obj.get("data") or []:
        if not isinstance(pair, (list, tuple)) or len(pair) < 2:
            continue
        period, raw = pair[0], pair[1]
        try:
            date = normalize_period(period)
            value = float(raw)
        except (TypeError, ValueError):
            continue
        if 0.5 <= value <= 15:
            points.append((date, value))
    if not points:
        return None
    return max(points, key=lambda item: item[0])

def download():
    req = urllib.request.Request(
        BULK_URL,
        headers={"User-Agent": "SuitcaseBrain/1.0 (public travel intelligence; source refresh)"},
    )
    with urllib.request.urlopen(req, timeout=180) as response:
        return response.read()

def main():
    try:
        payload = download()
        found = {}
        with zipfile.ZipFile(io.BytesIO(payload)) as archive:
            names = [name for name in archive.namelist() if name.lower().endswith(".txt")]
            if not names:
                raise RuntimeError("EIA PET archive contained no .txt data file")
            with archive.open(names[0]) as handle:
                for raw_line in handle:
                    try:
                        obj = json.loads(raw_line)
                    except Exception:
                        continue
                    sid = obj.get("series_id")
                    meta = SID_TO_META.get(sid)
                    if not meta:
                        continue
                    point = latest_point(obj)
                    if point:
                        label, aliases = meta
                        date, value = point
                        found[label] = {
                            "label": label,
                            "series_id": sid,
                            "aliases": aliases,
                            "value": value,
                            "period_end": date,
                        }
                    if len(found) == len(TARGETS):
                        break
        if "U.S. average" not in found:
            raise RuntimeError("national gasoline series was not found in EIA bulk data")
        latest = max(item["period_end"] for item in found.values())
        for item in found.values():
            item.pop("period_end", None)
        output = {
            "schema_version": 1,
            "fact_type": "WEEKLY_GOVERNMENT_DATA",
            "product": "All Grades All Formulations Retail Gasoline Prices",
            "unit": "USD_per_gallon_including_taxes",
            "source": {
                "id": "eia_weekly_gasoline",
                "name": "U.S. Energy Information Administration",
                "url": "https://www.eia.gov/petroleum/gasdiesel/",
                "machine_source": BULK_URL,
            },
            "period_end": latest,
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "status": "fresh",
            "confidence": "high",
            "note": "Weekly reference averages, not a promise of the price at a specific station.",
            "places": [found[label] for label in TARGETS if label in found],
        }
        OUT.parent.mkdir(parents=True, exist_ok=True)
        tmp = OUT.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
        tmp.replace(OUT)
        print(f"refreshed {len(found)} EIA gasoline series through {latest}")
    except Exception as exc:
        print(f"refresh failed; existing snapshot preserved: {exc}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
