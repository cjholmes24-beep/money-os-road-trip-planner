# Public homepage commercial redesign

Starting main: `100ac0d272c1ad515a00db6609443c4e9acfc216` (remote main checked before editing). Branch: `codex/public-homepage-commercial-redesign-v1`. This is an unmerged visitor-facing presentation change; no product engine, calculator, dashboard or revenue-state model is added or rebuilt.

Read the current homepage, shared styles/navigation/calculator code, revenue model/UI, current tool titles/content, sitemap, canonical handoff and status. Preserved all calculator and trip functionality.

Replaced the old text-first hero and technical panels with consumer travel copy, two immediately visible actions and original local coastal travel artwork. Added concise capability cards, six prioritized featured tools, compact links to six remaining tools, a three-step planning path, visitor trust benefits and a booking-next-step banner. The banner routes to the existing planner rather than inventing a provider URL, price or offer. Simplified navigation/footer and corrected OpenGraph site branding to Suitcase Brain.

Removed homepage-visible Money OS, V1, canonical/building/module language, engineering/trademark language and the monetization section. Short affiliate disclosure remains visible. Existing opt-in controls live inside collapsed homepage privacy settings; default-off consent, local-only storage, opt-out and history management remain intact. Other pages retain their existing controls. The original Travelpayouts loader remains byte-for-byte unchanged, exactly once.

Visual asset source/usage: [original local artwork note](../HOMEPAGE_VISUAL_ASSETS.md); one 3,559-byte self-contained SVG plus original inline icons/CSS card art, no paid image service or hotlinks.

Local verification:

- **745 dependency-free assertions**: all 711 existing assertions plus 34 homepage presentation/preservation checks.
- **16 Google installer tests** pass.
- **105 homepage Chromium checks** pass across 360/390/412/768/1440px: above-fold primary action, artwork, mobile menu, no overflow before/after menu/privacy expansion, opt-in/off boundaries, existing featured links and exact verification-file delivery.
- **67 existing organic Chromium checks** pass, including calculator outputs/reset and private dashboard boundaries.
- GSC/indexing readiness: **PASS**, all 13 targets.
- Static/site validation and existing secret scanning: **PASS**.
- Organic validation: **16 valid opportunities, 0 blockers**, meaningful change YES (homepage metadata/coverage), no generated traffic. The checked-in queue need not be rewritten for this presentation change.
- JavaScript syntax and `git diff --check`: **PASS**.

Visually inspected rendered mobile hero/tools and desktop layout. Screenshots are test artifacts; CI adds browser regression execution without removing existing validation. All external browser requests were blocked. Remote CI outcome is reported on the PR after push, not inferred from local results.

Google verification file, sitemap, robots, indexing manifest and private dashboard remain unchanged. No invented fares, inventory, discounts, reviews, ratings or revenue. No main merge or deployment is performed by this task. Owner cost introduced: **$0**.
