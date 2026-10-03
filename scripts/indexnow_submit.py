#!/usr/bin/env python3
"""Notify IndexNow about Suitcase Brain's public URLs.

IndexNow ownership keys are intentionally public and verified by hosting the
matching text file on the same host. No paid service or private API key is used.
"""
from __future__ import annotations

import json
import pathlib
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

HOST = "cjholmes24-beep.github.io"
KEY = "96df4ff75cc652635ffb9a6b80af194e"
KEY_LOCATION = f"https://{HOST}/money-os-road-trip-planner/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
SITEMAP = pathlib.Path("sitemap.xml")

def sitemap_urls():
    root = ET.parse(SITEMAP).getroot()
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    for node in root.findall("sm:url/sm:loc", ns):
        if node.text:
            url = node.text.strip()
            if url.startswith(f"https://{HOST}/money-os-road-trip-planner/"):
                urls.append(url)
    if not urls:
        raise RuntimeError("No Suitcase Brain URLs found in sitemap.xml")
    return sorted(set(urls))

def submit(urls, retries=3):
    payload = json.dumps({
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }).encode("utf-8")
    request = urllib.request.Request(
        ENDPOINT,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "SuitcaseBrain-IndexNow/1.0",
        },
    )
    last = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                code = response.getcode()
                if code in (200, 202):
                    print(f"IndexNow accepted {len(urls)} URLs with HTTP {code}")
                    return
                raise RuntimeError(f"unexpected IndexNow HTTP {code}")
        except urllib.error.HTTPError as exc:
            last = exc
            if exc.code not in (429, 500, 502, 503, 504) or attempt == retries:
                raise
        except Exception as exc:
            last = exc
            if attempt == retries:
                raise
        time.sleep(attempt * 5)
    raise RuntimeError(f"IndexNow submission failed: {last}")

def main():
    urls = sitemap_urls()
    submit(urls)

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"IndexNow notification failed: {exc}", file=sys.stderr)
        sys.exit(1)
