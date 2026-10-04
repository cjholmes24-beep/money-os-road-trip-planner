# Suitcase Brain / Road Trip Ledger

A zero-cost travel-intelligence property powered by Money OS. The current static site remains the revenue-capable foundation while Suitcase Brain grows into a budget-first trip, local-discovery, event, group-logistics and vendor-opportunity engine.

## Suitcase Brain Travel Intelligence V1

`/plan-my-trip/` is a nine-stage, browser-local trip workspace. Its versioned canonical record covers intent, people, dates, preferences, needs, modes, traveler commitments, reservations, hidden fees, and emergency planning. The resulting blueprint calculates spendable budget, actual funding, dropout scenarios, cancellation exposure, fee totals, and explainable resilience indicators. Save/load uses `localStorage`; import/export uses validated JSON. No trip record is sent to a Money OS backend because there is no backend.

Source-backed intelligence currently consists of the official weekly EIA gasoline snapshot and an explicit opt-in National Weather Service current-location forecast. Every other live module says it is not connected rather than inventing results. See `docs/SUITCASE_BRAIN_STATUS.md`, `docs/TRAVEL_INTELLIGENCE_DOCTRINE.md`, and `docs/BRAND_CLEARANCE_SUITCASE_BRAIN_2026-10-03.md`.

## Public tools

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

## Tests

```sh
node tests/run-tests.js
python3 tests/validate-site.py
node --check trip-intelligence.js
node --check source-intelligence.js
node --check plan-my-trip/planner-ui.js
```

The dependency-free harness covers schema serialization/import validation, budget and reserve math, funding and dropout scenarios, cancellation exposure, hidden fees, boundary cases, and freshness classification. Site validation checks JSON, local links, sitemap targets, disclosure/Travelpayouts preservation, expected truth labels, and common secret patterns.

## Architecture and next build order

The static architecture remains $0: semantic HTML/CSS, framework-free JavaScript, versioned browser-local JSON, checked-in government snapshots, and keyless official endpoints. New providers should normalize facts through the Source & Freshness Contract and must not add a link until the relationship and URL are account-verified. Next: connect official/provider-supported transportation and lodging facts, including provider cancellation terms, then add verified event/activity sources.


## Automated search distribution

IndexNow is wired at $0 owner cost. The public ownership file `96df4ff75cc652635ffb9a6b80af194e.txt` verifies the GitHub Pages host path, and `.github/workflows/indexnow-notify.yml` automatically submits sitemap URLs to IndexNow after relevant main-branch updates. This is a discovery notification, not a guarantee of crawl or ranking.

Google Search Console still requires account/property verification and is not replaced by IndexNow.


## Durable handoff

Before starting a new Suitcase Brain engineering thread, read `docs/CURRENT_HANDOFF.md` and `docs/BUILD_LEDGER.md`. They preserve the verified main SHA, finished bricks, failures/repairs, operating doctrine, build workflow, and immediate next engineering target.

## Transportation + lodging intelligence V1

Plan My Trip now stores schema V2 transportation and lodging options. Travelers can add, edit, remove, compare, save, export, and import quotes they obtained elsewhere. Every cost component keeps an explicit truth state; blank mandatory fees remain `UNKNOWN`, and lowest-known-total labels require comparable mandatory costs. Separate lenses cover cost, time, unknown exposure, cancellation flexibility, deposit/hold, group fit, parking, breakfast, and explicit location fit. Affiliate commission is never an input.

The reusable engine is `transport-lodging-intelligence.js`; provider capability decisions are in `data/provider-capability-registry.json`; research and architecture are documented in `docs/TRANSPORT_LODGING_SOURCE_AUDIT_2026-10-03.md` and `docs/TRANSPORT_LODGING_ARCHITECTURE.md`. The only factual connection newly exposed to driving comparisons is the existing EIA weekly reference. A GTFS Schedule adapter foundation is present, but no nationwide live feed or lodging/flight/rental inventory is claimed.
