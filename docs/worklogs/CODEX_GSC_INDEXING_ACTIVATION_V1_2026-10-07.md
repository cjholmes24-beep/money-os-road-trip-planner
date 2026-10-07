# Google Search Console activation readiness V1

Base: `daf2cc032f3fb4b7c860179f5483cced6911fb83`, independently checked against remote main before editing and before delivery. Task branch: `codex/gsc-indexing-activation-v1`. No main push, merge, Google account operation, verification value, paid infrastructure, new product feature or fabricated metric is part of this task.

Read the canonical handoff/ledger/status, sitemap, robots, homepage, IndexNow workflow and existing indexing/site audit code. Preserved canonical handoff and ledger, all product pages, schema V3, Events/Transport/Lodging, EIA/NWS, provider routing and existing scheduled workflows. The dependency-free Node/Python environment required no installation or reusable cloud configuration change.

Added a 13-target operational manifest, strict atomic/idempotent public Google verification installer, local and optional live readiness checker, two short Google-account operations runbooks, installer/security regression tests and indexing regression tests. Extended existing CI without removing tests; static validation retains secret scanning. The optional write-enabled installer workflow is omitted in favor of explicit local installation and review through a separate artifact PR.

The installer rejects blank/placeholder/meta injection, malformed Google filenames/content, traversal, symlink destinations and conflicting existing ownership values before modification. HTML-file bytes are preserved, including original final line endings. Meta installation changes only the homepage head and keeps one identical verification tag. `--verify-only --published-root` confirms an already produced output, including failure on missing/different output. No actual Google token or verification file is installed by this PR; test fixtures are synthetic and confined to temporary directories.

Audit outcome on 2026-10-07: local and live **PASS**, 13 targets, zero blockers. All 13 live canonical requests return HTTP 200 without redirect contradictions, with unique metadata, valid structured data matching visible content, exact Drive count/disclosure and connected internal navigation. Exact public sitemap coverage and robots declaration pass. The private revenue dashboard is noindex and absent from sitemap. Origin robots returns 404 (no blocking rules); project robots remains present with sitemap declaration. No pre-existing blocker required page edits. Readiness does not assert Google ownership, indexing, rankings or traffic. Requests fetch HTML without executing Drive or making provider clicks.

Validation:

- `node tests/run-tests.js`: **711 assertions passed**, including all 684 pre-existing assertions and 27 new indexing assertions.
- `python3 -m unittest discover -s tests -p test_google_verification.py`: **16 tests passed**, including rejection, preservation, idempotence, CLI logs and static-output checks.
- `node scripts/check-google-indexing-readiness.js --live --json`: **PASS**, 13 local/live targets, zero blockers.
- `python3 tests/validate-site.py`: **PASS**, existing links/sitemap/disclosure/Drive/provider boundaries and secret scanning.
- `node scripts/run-organic-demand.js --check`: **16 valid opportunities, 0 blockers, no meaningful change; no traffic generated**.
- JavaScript/Python syntax, registry JSON and `git diff --check`: **PASS**.

GitHub CI result is reported on the PR after push; this log records executed local checks, not a fabricated remote result. No public discovery/indexing submission is performed from an unmerged task branch.

External blocker: owner must add the exact project URL-prefix property in the intended Google account, obtain Google's real artifact, have it installed/reviewed/deployed and complete Google's Verify step. Only then can the connected GSC Wizard register/list it, submit the sitemap, inspect URLs and read actual reports. Task-start zero properties and owner-observed Drive ACTIVE/MAXIMUM / 12 visits / 3 provider clicks / 0 bookings / $0 earnings remain explicitly attributed observations, with acquisition source unproven. Owner cost introduced: **$0**.
