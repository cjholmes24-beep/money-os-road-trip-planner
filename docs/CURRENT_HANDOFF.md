# Suitcase Brain — Current Handoff

Last updated: 2026-10-07
Canonical repository: `cjholmes24-beep/money-os-road-trip-planner`
Last verified product-code baseline before handoff-document commits: `156b56393a9cf9e70b52884bd695063b9195d780`

**Before every new work order, read GitHub `main` directly and use the current HEAD SHA. Do not assume the SHA written in this handoff is still the repository HEAD, because documentation/maintenance commits may legitimately advance `main`.**

## Purpose of this file

This is the durable thread-to-thread handoff. A new ChatGPT/Codex session should read this file before proposing new work so it can continue from the current verified state without repeating finished bricks or losing doctrine.

## Owner operating doctrine

- Owner cost remains **$0 unless explicitly approved**.
- Earn first → reinvest second → scale third.
- Do not add paid APIs, hosting, domains, ads, databases, subscriptions, inventory, deposits, or speculative spend without explicit approval.
- Never fabricate prices, availability, reviews, events, safety facts, discounts, provider rules, or revenue.
- Recommendation quality and traveler safety outrank affiliate commission.
- Do not collect customer travel payments in the current phase.
- Direct affiliate URLs must be account-verified before being hard-coded.
- Travelpayouts Drive is the currently approved monetization surface.
- Public/product logic can be open; proprietary Money OS decision logic should remain private where disclosure is unnecessary.

## Working brand

Consumer-facing working name: **Suitcase Brain**
Positioning: travel intelligence powered by Money OS.

Suitcase Brain is a working brand, not a completed trademark clearance. A preliminary collision review found no obvious exact-match travel-planning software brand, but legal/common-law/state/international clearance has not been completed.

## Current production state

The public site is deployed on GitHub Pages and currently includes:

- Suitcase Brain homepage positioning
- Plan My Trip Travel Intelligence V1
- nine-stage mobile-first trip intake
- versioned canonical browser-local trip record, now schema V3 with V1→V2→V3 and V2→V3 migration
- provider-neutral transportation and lodging option models
- mobile transportation/lodging quote workspaces with add/edit/remove/compare/save/export/import
- mode-aware transportation known-cost completeness
- lodging known-cost completeness with mandatory-vs-optional separation
- mixed-currency comparison fail-closed behavior until FX is connected
- cancellation exposure and policy-completeness handling for transport/lodging quotes
- runtime-only verified booking-link trust gate
- GTFS Schedule normalization foundation without claiming nationwide/live feed coverage
- provider capability registry separating source authority, access, secrets, and affiliate relationship
- Events Intelligence Core V1 with canonical Event + Occurrence models
- user-entered event add/edit/remove workspace
- event date/category/location/season/price/age/family/status filters
- explainable trip-date event matching
- seasonal event tags
- event price truth and source/freshness handling
- imported event snapshots downgraded from runtime trust
- focused event-source audit/registry; no live event feed connected yet
- traveler commitment/funding records
- group funding-gap logic
- one-person and two-person dropout scenarios
- unpaid-traveler scenario
- reservation/cancellation exposure records
- “What if we cancel today?” output
- 27-category hidden-fee auditor
- explainable resilience indicators
- emergency “I need to leave this trip” mode
- local save/load/start-over
- validated JSON export/import
- reusable booking-opportunity placeholders
- source/freshness contract and reusable truth states
- EIA official weekly gasoline reference
- scheduled keyless EIA fuel refresh
- opt-in National Weather Service current-location forecast
- Travelpayouts Drive
- Revenue Activation + Demand Capture V1
- ten-category monetization-opportunity registry with no fabricated direct affiliate URLs
- intent-matched next-action checklists on existing high-intent travel tools and Plan My Trip
- opt-in browser-local demand telemetry with broad non-sensitive bands only
- revenue dashboard separating ATTENTION, INTENT, and MONEY
- redacted provider-report import path that remains USER_IMPORTED — UNVERIFIED
- runtime-only provider-action and provider-report trust gates for future verified adapters
- proof milestones from qualified intent through cleared revenue without inferring money from clicks
- First-Dollar Revenue Sprint V1 with eight priority money pages strengthened for result → next-decision flow
- first-dollar control panel, MONEY BLOCKERS, and opportunity-gap report
- improved crawl/search metadata on priority money pages and corrected sitemap XML
- first-dollar monetization audit and owner operations checklist
- Organic Demand Engine V1 with daily read-only repository opportunity analysis
- seasonal planning windows and site-health/internal-link/metadata audits
- eight money pages expanded with visible planning answers/FAQs
- one distinct flight-vs-driving cost comparison page
- safe in-memory aggregate search-performance import interface
- owner-observed Travelpayouts baseline documented separately from live dashboard truth
- visible affiliate disclosure
- sitemap/canonical metadata/robots
- IndexNow automated distribution
- dependency-free test harness
- GitHub Actions Suitcase Brain validation gate

## Current truth/source status

SOURCE-BACKED:
- U.S. Energy Information Administration weekly gasoline reference
- National Weather Service on-demand current-location forecast
- Travelpayouts Drive as an approved monetization surface only

SOURCE/USER-INPUT READY BUT NOT LIVE-INVENTORY CONNECTED:
- events: user-entered Event/Occurrence intelligence, filtering, trip-date matching, seasonal tags; no nationwide live feed
- event source adapter architecture: NPS identified as a future free official path but currently blocked by private API key requirement
- transportation quote intelligence: user-entered + EIA-derived driving fuel reference
- lodging quote intelligence: user-entered
- GTFS Schedule adapter foundation: no agency feed connected as nationwide/live inventory
- direct flight/rental/bus/rail/transfer/lodging inventory remains provider-access dependent
- provider cancellation facts remain unconnected unless user-entered or future trusted adapter supplies them
- monetization opportunity registry and revenue funnel are connected locally, but account-specific direct provider URLs remain unverified
- Travelpayouts reporting APIs are not connected; browser-local imports cannot become verified money proof

UI-READY BUT NOT LIVE-CONNECTED:
- food
- activities
- culture/community
- nightlife/age-fit
- safety
- discounts
- pets/accessibility
- business records
- provider cancellation facts
- booking opportunities

Do not display simulated live data in these modules.

## Latest completed engineering cycle

Codex PR #17 built Organic Demand Engine V1 on updated main `8555df876bd2677a0af7264c4463b0f8d400d135` after the scheduled EIA-only refresh.

Codex delivered:
- deterministic organic opportunity types/statuses and money-first intent families
- daily read-only GitHub Actions analysis with artifacts/summary and no auto-push
- seasonal planning windows
- internal-link, metadata, canonical, sitemap, structured-data, source-age and Drive/disclosure audits
- eight money pages expanded with original visible planning answers/FAQs
- one new `/flight-vs-driving-cost/` page using the existing driving fuel formula and entered flight total
- strict in-memory aggregate search-performance import
- local Events-to-travel opportunity bridge
- checked-in opportunity snapshot and documentation

Candidate verification:
- 684 dependency-free assertions passed
- 67 Chromium mobile checks passed with external requests blocked
- 16 reviewed repository/calendar opportunities and zero health blockers
- owner cost $0
- no fake traffic, search volume, booking, or revenue

Independent review:
- inspected the actual engine, workflow, site audit, search-import boundary, dashboard wiring, comparison page, generated opportunity snapshot, and tests
- found no merge-blocking implementation defect
- corrected stale README/status labels that still described already-merged Events, Revenue Activation, and First-Dollar work as pending review
- latest-head PR CI passed

PR #17 merge:
`156b56393a9cf9e70b52884bd695063b9195d780`

Post-merge verification:
- Suitcase Brain checks: SUCCESS
- IndexNow notification: SUCCESS
- GitHub Pages deployment: SUCCESS
- owner cost introduced: $0

Operational evidence supplied by the owner on 2026-10-06:
- Travelpayouts Drive ACTIVE
- Monetization boost MAXIMUM
- 12 unique visits
- 3 provider-side clicks
- Kiwi.com received 3 clicks
- 0 bookings
- $0 earnings
- acquisition source of those visits remains unproven

The engine can prioritize and prepare acquisition work, but it does not itself manufacture visitors. Real qualified traffic and booking conversion remain the first-dollar bottlenecks.

## Standard build workflow

This workflow is mandatory for large future bricks:

1. ChatGPT inspects current main and defines the next large coherent work package.
2. ChatGPT provides the owner a complete copy/paste Codex work order with exact starting SHA.
3. Codex creates a task branch, performs the job, tests it, opens a PR, and DOES NOT merge.
4. Owner returns the Codex completion report.
5. ChatGPT audits the actual GitHub PR/code, not only the report.
6. ChatGPT performs cleanup: missing requirements, bad assumptions, math/data errors, security/privacy issues, regressions, weak tests, broken wiring.
7. ChatGPT strengthens tests/CI as needed.
8. CI must pass before merge.
9. ChatGPT merges only after verification.
10. ChatGPT verifies post-merge deployment/distribution and updates this handoff plus the build ledger.
11. Repeat.

Codex is the heavy construction crew.
ChatGPT is architecture, inspection, cleanup, final merge gate, and handoff keeper.
Owner controls priorities and green-lights the sequence.

## Current next engineering brick

Primary next gate:
**REAL SEARCH DISCOVERY + TRAFFIC PROOF**

Do not start another broad travel feature brick.

Immediate actions:
1. Verify Google Search Console property access for the GitHub Pages site and submit/confirm the sitemap if not already done.
2. Verify Bing Webmaster access/submission if available.
3. Observe a real aligned search/report window and import only aggregate search-performance data through the new safe interface when available.
4. Continue watching Travelpayouts Content Analytics for genuine visits, provider clicks, bookings, approved commission, and payout evidence.
5. Use the earliest weak stage to choose the next engineering job:
   - no impressions/indexing → indexing/search-discovery repair
   - impressions but weak clicks → title/snippet/content optimization
   - site clicks but weak provider clicks → conversion/routing optimization
   - provider clicks but no bookings → provider/action-fit optimization
   - bookings but no cleared money → provider reconciliation/payout tracking

Hard rule:
No unrelated product expansion jumps ahead of the first-dollar proof chain.

## Revenue state

The product is deployed with Revenue Activation + Demand Capture V1, First-Dollar Revenue Sprint V1, and Organic Demand Engine V1. Authenticated Travelpayouts screenshots confirm Drive is active at maximum monetization and provider-side visits/clicks are occurring. The observed baseline is 12 unique visits, 3 Kiwi.com clicks, 0 bookings, and $0 earnings; acquisition source remains unproven. No verified cleared revenue has been proven. Browser-local clicks or imported claims do not count as earned money.

Canonical revenue proof sequence:
FIRST ORGANIC VISITOR → FIRST AFFILIATE CLICK → FIRST BOOKING → FIRST CONFIRMED COMMISSION → FIRST CLEARED DOLLAR

Affiliate money states:
ATTRIBUTED → PENDING → PROVIDER_APPROVED → CLEARED

Only cleared provider-paid revenue counts as earned Money OS revenue.

## Handoff maintenance rule

After every meaningful build, cleanup, merge, provider integration, revenue milestone, deployment change, architecture decision, failure, or repair:

- update this file with the last verified product baseline, current capability state, and immediate next brick; always resolve the actual current main SHA live before issuing a work order
- append the event to `docs/BUILD_LEDGER.md`
- update `docs/SUITCASE_BRAIN_STATUS.md` when capability status changes
- record failures and repairs, not just successes
- never erase prior history merely because an issue was fixed

This repository documentation is the canonical operational handoff for Suitcase Brain.
