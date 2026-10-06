# Suitcase Brain — Current Handoff

Last updated: 2026-10-06
Canonical repository: `cjholmes24-beep/money-os-road-trip-planner`
Last verified product-code baseline before handoff-document commits: `57f17669d5335a2561eb289c85983ceac9a1ecdc`

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
- transportation quote intelligence: user-entered + EIA-derived driving fuel reference
- lodging quote intelligence: user-entered
- GTFS Schedule adapter foundation: no agency feed connected as nationwide/live inventory
- direct flight/rental/bus/rail/transfer/lodging inventory remains provider-access dependent
- provider cancellation facts remain unconnected unless user-entered or future trusted adapter supplies them

SOURCE/USER-INPUT READY BUT NOT LIVE-INVENTORY CONNECTED:
- events: user-entered Event/Occurrence intelligence, filtering, trip-date matching, seasonal tags; no nationwide live feed
- event source adapter architecture: NPS identified as a future free official path but currently blocked by private API key requirement
- transportation quote intelligence: user-entered + EIA-derived driving fuel reference
- lodging quote intelligence: user-entered
- GTFS Schedule adapter foundation: no agency feed connected as nationwide/live inventory
- direct flight/rental/bus/rail/transfer/lodging inventory remains provider-access dependent
- provider cancellation facts remain unconnected unless user-entered or future trusted adapter supplies them

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

Codex PR #11 built Events Intelligence Core V1 from main `12b8cc3f2edb3e1e969425ab37a97f4c46999015`.

Codex delivered:
- canonical Event and Occurrence models
- trip schema V3 with V1→V2→V3 and V2→V3 migration
- event temporal state separate from organizer status
- truthful event-price components and unknown handling
- user-entered event CRUD
- local event filters
- explainable trip-date matching
- seasonal tags
- source/freshness and runtime URL trust boundaries
- focused event-source audit and registry
- event workspace integrated into Plan My Trip
- expanded dependency-free regression coverage and static checks

Codex reported 262 assertions and a 19-check Chromium mobile smoke run before independent cleanup.

Independent cleanup then found and repaired:
- persisted SOURCE_BACKED event records retained a source-backed origin label after runtime trust was lost
- already imported snapshots could collapse UNKNOWN provenance into USER_ENTERED on a second reload
- source adapters could report AVAILABLE for valid but untrusted USER_ENTERED event records
- trusted adapters with missing/unsupported fact types could fall back to USER_ENTERED instead of UNKNOWN
- editing a single custom occurrence could silently collapse it into the concept-level event dates/status
- event counts did not clearly distinguish live runtime source records from imported unverified snapshots

Cleanup repairs:
- SOURCE_BACKED persisted records downgrade to IMPORTED
- repeated reloads preserve IMPORTED + UNKNOWN provenance
- source adapters require runtime-trusted SOURCE_BACKED records
- trusted fact-type uncertainty fails closed to UNKNOWN
- tested occurrence-mirror logic preserves custom single occurrences
- UI separates LIVE SOURCE-BACKED events from IMPORTED UNVERIFIED SNAPSHOTS
- regression tests added for each cleanup issue

PR #11 merged after latest-head CI success.

Verified product main:
`57f17669d5335a2561eb289c85983ceac9a1ecdc`

Post-merge verification:
- Suitcase Brain checks: SUCCESS
- IndexNow notification: SUCCESS
- GitHub Pages deployment: pending final post-merge confirmation at handoff-edit time
- owner cost introduced: $0
- no live event feed, ticket inventory, paid integration, vendor engine, or event affiliate-ranking system was introduced
- no post-cleanup browser smoke run is claimed; the recorded 19-check Chromium run occurred on the Codex candidate before independent cleanup

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

Primary next brick:
**REVENUE ACTIVATION + 24/7 DEMAND CAPTURE V1**

This brick moves monetization and measurable demand to the front of the line before more broad feature expansion.

Goals:
- instrument the funnel from visitor → planner engagement → high-intent action → eligible provider click → provider-reported booking/commission states where accessible
- create a first-party browser-local/zero-cost event model for conversion actions without collecting sensitive data
- expose clear, truthful monetizable next actions only where an approved/verified provider path exists
- preserve Travelpayouts Drive and existing affiliate disclosure
- build high-intent travel landing/workflow surfaces around already-supported monetizable categories without mass thin-page generation
- distinguish attention, intent, and actual provider-reported money
- create a revenue/opportunity dashboard with no fabricated earnings
- prepare always-on demand signals for later automation using $0 infrastructure
- preserve recommendation neutrality: commission never changes traveler ranking
- owner cost remains $0
- no paid ads, paid APIs, fake clicks, spam, customer-payment custody, or unverified affiliate URLs

Hard proof milestones:
FIRST ORGANIC VISITOR → FIRST QUALIFIED INTENT → FIRST ELIGIBLE PROVIDER CLICK → FIRST ATTRIBUTED BOOKING → FIRST APPROVED COMMISSION → FIRST CLEARED DOLLAR

Following large bricks after Revenue Activation:
1. Distribution / 24×7 Lead & Opportunity Engine
2. Destination Discovery + Itinerary Brain
3. Food / Culture / Vibe / Age-Fit / Local Discovery
4. Vendor / Exhibitor Opportunity Intelligence
5. Safety / Quality / Reviews
6. Group / Reunion / Business logistics expansion
7. National automation + search/AI authority
8. continued conversion/revenue optimization

## Revenue state

The product is revenue-capable through approved affiliate infrastructure, but no unverified claim of cleared revenue should be made.

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
