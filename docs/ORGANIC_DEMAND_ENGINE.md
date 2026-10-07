# Organic demand + traffic engine V1

This subsystem improves discovery of the existing high-intent tools. It is scheduled repository analysis, not a traffic generator, live search connection, or continuously earning system. Owner cost introduced: $0. No authenticated dashboard/search scraping, browser visits to providers, paid backend, auto-published articles, bot traffic or outreach.

## Interfaces and truth

`organic-demand-engine.js` is dependency-free UMD code. It defines ten opportunity types and eight lifecycle statuses from the work order, the eight money-page intent families, seasonal windows, aggregate import validation, event-travel matching, explainable funnel focus and deterministic ranking. Opportunities contain id/type/page/category/intent family/reason/evidence/priority/freshness/action/status/created/updated dates. Priority is an ordinal after sorting, not expected commission or an opaque AI score.

`generate({as_of, pages, health, registry, search, funnel, events, trip, previous})` consumes only explicitly supplied inputs. Default traffic sufficiency is UNKNOWN. No provider baseline count is an input. A future legitimate aligned-report adapter/owner can explicitly establish sufficiency booleans; a count or file import cannot establish it automatically. Focus moves from traffic to qualified intent, provider clicks, booking/provider fit, approval and clearing. Once a later stage is weak, conversion/routing/proof review outranks new content. This focus interface does not create revenue records or unlock money milestones.

Ranking first favors the earliest weak stage. Within that stage it favors explicit imported evidence, existing priority money pages, health/gap severity and stable ids. All these intent families concern real planning needs; no commission/payout input is read. Calendar leads are useful timing, not measured demand. Direct-route gaps remain deferred while existing Drive operates independently.

`validateOpportunity` and `validateReport` reject invalid types, states, paths, categories, dates, priorities, duplicate ids and future schema versions. Unchanged opportunities preserve lifecycle dates. Material fingerprints omit observation-only dates while retaining actual seasonal transitions, source-age status and health/content changes. The checked-in JSON/Markdown is a reviewed repository snapshot; scheduled observations do not silently replace it.

## Coverage and one selected page

All eight priority pages now contain unique visible planning answers/FAQs with `data-intent-family` markers for auditable coverage. The tool remains first. Calculator result → optional next decision ordering is preserved. Markers do not fabricate search demand; they identify answers actually present in the HTML. Examples are explicitly illustrative arithmetic, not quotes or live prices. Simple calculator blank optional fields are explained as arithmetic zeros, not verified no-charge facts; the hardened trip quote engines preserve UNKNOWN.

The engine selects one useful distinct candidate: `/flight-vs-driving-cost/`. It answers a mode-comparison question rather than duplicating airfare entry. It takes the complete group flight total from the existing flight planner and reuses `TransportLodgingIntelligence.drivingFuelCost` for road fuel. Known road extras are entered explicitly. All fields are required, route miles/MPG positive, USD only. It never ranks partial unknown quotes as cheapest or invents route data/time/vehicle wear. Original methodology, assumptions, example and questions explain same-scope comparison. Its next decisions lead to existing flight, road, transfer, insurance and trip tools. The exact original public Drive loader is present once.

Other candidates are deferred: group budgeting is already implemented in Plan My Trip; eSIM-vs-roaming can be answered on the existing eSIM page; rental-vs-transfer has existing component tools but no separate page justified by current evidence. At most four new pages are permitted; this implementation adds one. CI checks capability selection, substantial visible explanation, methodology, assumptions, example, tool links, disclosures, canonical and incoming links.

## Calendar and Events

`seasonalWindows(date)` uses UTC calendar arithmetic with lead and active ranges for Thanksgiving (US fourth Thursday), Christmas, New Years (cross-year), Spring Break, Memorial Day, summer travel, July 4, Labor Day, Halloween and fall travel. These are **SEASONAL PLANNING WINDOWS**, US-oriented heuristics, not universal school/holiday schedules, travel forecasts or trend claims. Every window exposes relevant pages and intent families. No event is manufactured.

The optional local event bridge calls the existing Events validator and trip matcher. Only valid known user-entered or fresh runtime-source-backed events that overlap the supplied trip and remain upcoming/in-progress can create a private EVENT_TRAVEL_DEMAND opportunity. Canceled/postponed, stale, past and unverified imported snapshots do not become current source-backed demand. Event titles, locations, traveler identity and attendance are not copied into the opportunity. No automatic event page or ticket scraping exists. Scheduled repository runs receive no browser trip/event records; this hook is available for explicit local use only.

## Search import — explicit, local, unverified

`data/private-import-example/search-performance.example.json` intentionally contains **zero records**; no illustrative search metrics are fabricated. A valid record has exactly:

```json
["query", "page", "impressions", "clicks", "average_position", "date_range_start", "date_range_end", "source"]
```

Use a version-1 `{ "version": 1, "records": [] }` envelope. Source labels are GOOGLE_SEARCH_CONSOLE, BING_WEBMASTER or OTHER_VERIFIED_SEARCH_REPORT; a source label is a user claim, not runtime verification. Dates must be real, ordered and no later than the analysis date. One source/date window per file, at most 1,000 records, unique query/page pairs, integer nonnegative counts, clicks ≤ impressions, positive finite positions (or null when zero impressions). No free-text page URL/query parameters, names, emails, contact/payment/account fields, visitor identifiers or raw private exports are accepted.

Queries must exactly match the public intent-family phrases in `FAMILIES`, paired with the relevant existing page or selected comparison page. This intentionally narrow V1 allowlist protects against private/sensitive search queries; it does not accept every raw Search Console export. Redact/filter outside the public repository. Extra fields and malformed imports are rejected atomically. Import never claims Google/Bing API connection or proves national/unique traffic.

The dashboard accepts the aggregate file in memory only, clears on reload or explicit clear, and shows SEARCH DATA IMPORTED / ORGANIC SOURCE UNVERIFIED. No local-storage export or remote transmission of search rows. Existing money reports remain separate and unverified. TRAFFIC OBSERVED BY PROVIDER is a supported categorical state only when an explicit provider observation is supplied to the interface; historical counts are linked documentation, never live counters.

For explicit private analysis:

```sh
node scripts/run-organic-demand.js --date YYYY-MM-DD --search-file /tmp/redacted-search.json --out-dir /tmp/private-organic-review
```

Search-import output must be outside the repository. The CLI refuses repository output when a search file is supplied. No actual private account file is committed. The public opportunity output does not copy row counts or raw exports. The explicit snippet-review rule is ≥20 impressions and <5% clicks in the single imported window; it suggests reviewing an existing title/answer, not a CTR guarantee. Imported clicks without aligned provider evidence suggest reconciliation, not an invented conversion failure. Tiny samples are not national trends.

## Daily analysis and distribution

`organic-demand-engine.yml` runs once daily at 11:23 UTC (7:23 a.m. Eastern during daylight time; 6:23 a.m. during standard time) and supports workflow_dispatch. GitHub can delay or skip scheduled starts; it is not a 24/7 runtime guarantee. Read-only repository permissions, five-minute limit, no push/commit. It creates artifacts in runner temp, validates opportunity/site health, publishes a summary, and retains artifacts seven days. Meaningful-change status ignores run dates alone. No unchanged URLs are submitted by this analysis job.

`node scripts/run-organic-demand.js --check` validates the checked-in report and current site health without rewriting files. `--out-dir /tmp/organic-review` produces a proposed snapshot for review. Running without an output path is an intentional local snapshot edit; it is not scheduled automation.

`organic-site-audit.js` inspects all public pages and builds a deterministic internal-link graph. It checks sitemap/canonical coverage, robots, reachability from homepage, broken links, title/description duplicates, public Drive/disclosures, visible/schema consistency, unsupported rating/review/offer/price markup, new-page limits/quality, source age and IndexNow setup. EIA warnings use retrieval freshness plus weekly period age (>9 days); a broken snapshot produces review-needed, not invented fuel. The source refresh engine is unchanged. Warnings remain observations; blockers fail CI/scheduled validation. Python static validation retains XML/JSON/link/secret checks.

GitHub API showed legacy Pages from main `/`, status built, on October 6, 2026. No Pages setting changed. The new canonical is included in the sitemap and reachable from homepage, flight and road pages. Existing main-publication IndexNow remains intact. GitHub Pages/IndexNow deployment and Google/Bing indexing after merge require independent verification; crawlability is not proof of indexing.

## Operational baseline and limits

See TRAFFIC_BASELINE_2026-10-06.md for owner-observed Drive Active/maximum and provider activity. Counts exist there only, never in the algorithm/dashboard. Current earliest weak stage is qualified traffic volume; this repository cannot measure site-wide organic acquisition. All 16 current opportunities are calendar/repository records, not 16 people or search queries. No verified direct affiliate route, search API, private provider report or cleared payout adapter is connected by this work. A booking still is not cleared money. Human review controls content changes; no broad travel module or automatic article factory is added.

## Reproduce validation

Run `node tests/run-tests.js`, `node scripts/run-organic-demand.js --check`, `python3 tests/validate-site.py` and `git diff --check`. The full model/static suite needs no installed dependencies. Optional `tests/browser-organic-smoke.js` uses Playwright plus `/usr/bin/chromium`; start `python3 -m http.server 8000 --bind 127.0.0.1` in the repository first. It blocks every external request and uses synthetic search-import fixtures only. Browser tooling is a local verification dependency, not shipped site code or a paid service.
