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

## Events Intelligence Core V1 (pending PR review)

Schema V3 persists browser-local canonical events and explicit occurrences. The Plan My Trip event workspace supports add/edit/remove, local date/category/location/season/price/age/family/status filters, and explainable trip-date matches. Category does not imply age, cost, or family fit. Organizer status is independent of UPCOMING/IN_PROGRESS/PAST/DATE_UNKNOWN. Unknown prices stay null; complete required admission cost needs base and mandatory fees.

User-entered events cannot claim official runtime verification. Reload/import downgrades source-backed snapshots and candidate URLs require runtime trust to become official links. No live event feed, nationwide inventory, paid integration, affiliate event ranking, or vendor engine was connected. Source failures become UNAVAILABLE without replacing user records or breaking transport/lodging. See `docs/EVENT_INTELLIGENCE_ARCHITECTURE.md`, `docs/EVENT_SOURCE_AUDIT_2026-10-05.md`, and `data/event-source-registry.json`.

## Revenue Activation + Demand Capture V1 (task branch; pending review)

Existing high-intent tools and Plan My Trip now offer relevant comparison checklists with a reusable runtime-verified provider action gate. Drive and disclosures remain unchanged; no new direct affiliate URL or account approval is assumed. Optional local history is off by default and captures broad enumerated planning signals only, with view/clear/export at `/revenue-dashboard/`. It does not save destination text, exact budget/dates, identities, precise location, health, or payment data.

The dashboard separates ATTENTION, INTENT and MONEY. Clicks do not become bookings or revenue. Redacted provider-report JSON imports are labeled USER IMPORTED — UNVERIFIED and cannot unlock verified money milestones. With no live payout/report adapter, verified CLEARED REVENUE remains $0. The trip schema stays V3. No paid service, backend, customer payment, autonomous traffic, or national-trend claim was introduced. See `docs/REVENUE_ACTIVATION_ARCHITECTURE.md` and `docs/TRAVELPAYOUTS_REVENUE_ACTIVATION_AUDIT_2026-10-06.md`.

First-dollar sprint V1 improves existing result-to-decision paths and adds local Money Blockers/opportunity-gap diagnostics. No new verified direct provider route or reporting API is configured. See [money-path audit](docs/FIRST_DOLLAR_MONETIZATION_AUDIT_2026-10-06.md) and [operations checklist](docs/FIRST_DOLLAR_OPERATIONS.md). This task is pending independent review; no revenue is claimed.

Organic Demand Engine V1 adds daily read-only opportunity/site-health analysis, reviewed seasonal planning windows, visible answers on eight money pages, and one [flight-versus-driving comparison](flight-vs-driving-cost/). It generates neither visitors nor live search claims. See [architecture and import rules](docs/ORGANIC_DEMAND_ENGINE.md), [opportunity snapshot](docs/ORGANIC_OPPORTUNITIES_LATEST.md), and [dated owner-observed traffic baseline](docs/TRAFFIC_BASELINE_2026-10-06.md). Search imports stay unverified and memory-only in the local dashboard; no private report or provider token is published. This task is pending independent review and introduces $0 owner cost.
