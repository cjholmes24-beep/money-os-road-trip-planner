# Suitcase Brain — Current Handoff

Last updated: 2026-10-06
Canonical repository: `cjholmes24-beep/money-os-road-trip-planner`
Last verified product-code baseline before handoff-document commits: `7170e1b8a23c9b424777a2784f7d7bdd7899b932`

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

Codex PR #15 built First-Dollar Revenue Sprint V1 from main `7f580647c5de38669fd7f321297b2e6310e8b68a`.

Codex delivered:
- money-path audit across ten monetization categories
- eight priority high-intent pages strengthened around useful result → next decision → optional monetization
- search titles/descriptions and contextual internal money paths improved
- first-dollar control panel with deterministic MONEY BLOCKERS
- local opportunity-gap report and export
- stricter crawl/sitemap validation
- first-dollar operations checklist
- current Travelpayouts Drive installation/reporting audit
- first-dollar regression coverage and CI

Codex candidate verification reported:
- 507 dependency-free assertions passed
- 54 Chromium mobile checks passed with external network blocked
- no new verified direct provider URL, paid infrastructure, or fake traffic/revenue
- owner cost $0

Independent review:
- inspected the actual PR, revenue logic, dashboard, priority-page ordering, sitemap/static checks, and official Travelpayouts Drive documentation
- no merge-blocking code defect found
- confirmed Drive documentation still describes automatic monetization after installation and Content Analytics reporting for clicks/bookings/page performance
- confirmed the repository still cannot prove account-specific Drive Active status, enabled programs, or real provider earnings without authenticated account evidence

PR #15 merged after latest-head CI success.

Verified product main:
`7170e1b8a23c9b424777a2784f7d7bdd7899b932`

Post-merge verification:
- Suitcase Brain checks: SUCCESS
- IndexNow notification: SUCCESS
- GitHub Pages deployment: SUCCESS
- owner cost introduced: $0
- no revenue is claimed
- no direct affiliate route was fabricated
- current first-dollar blockers are operational/account/traffic evidence, not another missing general product engine

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
**FIRST-DOLLAR OPERATIONS — VERIFY MONETIZATION + GET REAL TRAFFIC**

Do not start another broad engineering brick before this gate is checked.

Immediate actions:
1. In the authenticated Travelpayouts account, verify the exact Suitcase Brain project shows Drive ACTIVE.
2. Verify which programs/brands are actually enabled/approved for this project.
3. Confirm Content Analytics begins showing real page/click activity when genuine users arrive.
4. If an account-approved exact provider route/tool is available and permitted, wire that specific route in a separate tightly scoped integration PR; do not guess URLs.
5. Get real organic visitors onto the eight deployed high-intent pages and watch the actual funnel.
6. Check Bookings / commission states / payouts from provider evidence.
7. Record FIRST ELIGIBLE PROVIDER CLICK → FIRST ATTRIBUTED BOOKING → FIRST APPROVED COMMISSION → FIRST CLEARED DOLLAR.

Only after this operational gate exposes the real bottleneck should the next engineering work be selected.

Likely follow-up if traffic is the blocker:
**24/7 Lead + Opportunity Engine V1**

Likely follow-up if provider routing is the blocker:
**Travelpayouts Verified Provider Routing V1**

Likely follow-up if clicks occur but bookings do not:
**Conversion Optimization V1**

Hard rule:
No unrelated product expansion jumps ahead of the first-dollar proof chain.

## Revenue state

The product is deployed with Revenue Activation + Demand Capture V1 and First-Dollar Revenue Sprint V1. The public Drive script is installed on the priority money pages, but authenticated account status/program approval and real traffic/booking evidence still must be verified. No verified cleared revenue has been proven. Browser-local clicks or imported claims do not count as earned money.

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
