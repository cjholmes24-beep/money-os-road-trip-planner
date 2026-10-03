# Suitcase Brain / Road Trip Ledger

A zero-cost travel-intelligence property powered by Money OS. The current static site remains the revenue-capable foundation while Suitcase Brain grows into a budget-first trip, local-discovery, event, group-logistics and vendor-opportunity engine.

## Suitcase Brain V1\n\n`/plan-my-trip/` is the first canonical trip-intake surface. It models purpose, budget, travelers, actual funding, contingency reserve, trip vibe, interests and resilience without fabricating live prices.\n\nSee `docs/TRAVEL_INTELLIGENCE_DOCTRINE.md` for the canonical product architecture and `docs/BRAND_CLEARANCE_SUITCASE_BRAIN_2026-10-03.md` for the preliminary working-name check.\n\n## Public tools

Eight calculators: gas, complete road trip, rental car, flight cost, airport transfer, travel eSIM, activities, and luggage storage.

Two guides: flight-delay compensation and travel insurance.

## Run locally

```sh
python3 -m http.server 8000
```

No build, database, paid API, external package, or paid hosting is required.

## Search setup

The repository includes sitemap.xml, robots.txt, canonical URLs, unique titles/descriptions, Open Graph metadata, internal links, and JSON-LD.

After GitHub Pages publishes, add the Pages URL as a URL-prefix property in Google Search Console and submit:
https://cjholmes24-beep.github.io/money-os-road-trip-planner/sitemap.xml

The same sitemap can be submitted to Bing Webmaster Tools.

## Monetization

Travelpayouts Drive remains installed on every indexed page. Affiliate disclosures explain that eligible offers or links may generate a commission at no additional cost to the traveler.

Direct provider URLs are intentionally not invented or hard-coded. Verified account-specific links/widgets can be added later with per-page attribution.

## Cost and privacy

Owner cost remains $0. No paid ads, hosting, domain, API, SEO tool, database, or account system is required. Calculator entries remain in the visitor's browser. Travelpayouts Drive may perform monetization/interaction processing as disclosed on the site.


## Connected source/freshness brick

- `data/source-registry.json` declares source authority, purpose, cost, auth and cadence.
- `data/eia-gas-latest.json` seeds the current official weekly EIA gasoline reference.
- `scripts/refresh_eia_gas.py` refreshes that snapshot from EIA's keyless PET bulk file.
- `.github/workflows/refresh-eia-gas.yml` refreshes the snapshot weekly after merge to the default branch and commits only when data changes.
- `source-intelligence.js` shows the most relevant available EIA reference for the entered destination and provides opt-in live National Weather Service weather for the traveler's current location.

No paid data service or API key is required for this brick.


## Automated search distribution

IndexNow is wired at $0 owner cost. The public ownership file `96df4ff75cc652635ffb9a6b80af194e.txt` verifies the GitHub Pages host path, and `.github/workflows/indexnow-notify.yml` automatically submits sitemap URLs to IndexNow after relevant main-branch updates. This is a discovery notification, not a guarantee of crawl or ranking.

Google Search Console still requires account/property verification and is not replaced by IndexNow.
