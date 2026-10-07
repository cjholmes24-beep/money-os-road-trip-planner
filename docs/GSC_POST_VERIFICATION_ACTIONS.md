# Post-verification operations

Run only after Google confirms ownership of URL-prefix property:
`https://cjholmes24-beep.github.io/money-os-road-trip-planner/`.

Use the connected GSC Wizard operations with that exact property:

1. Register/list the property; confirm it appears in the connected Google account.
2. Submit `https://cjholmes24-beep.github.io/money-os-road-trip-planner/sitemap.xml`.
3. List sitemap status. Record the actual submission/processing response and errors.
4. Inspect the homepage.
5. Inspect every URL in `data/google-indexing-targets.json` (13 current public targets). This is our operational list, not a Google priority setting. Do not inspect the private revenue dashboard as a public indexing target.
6. For each inspection, record the actual verdict, coverage state, indexing state, robots state, page-fetch state and last-crawl time, along with URL, retrieval time and source. Missing fields remain **UNKNOWN**. Submission or successful inspection does not itself prove indexing. Preserve actual API errors rather than inventing a result.
7. Pull a 28-day Search Console summary once real data exists. Record dates, search type, impressions, clicks, CTR and position, and note Google's reporting delay. Unavailable data remains unavailable; do not substitute browser-local activity.
8. Pull top pages for the same reporting window.
9. Pull top queries for the same reporting window. Keep account/report exports out of the public repository; redact personal information before sharing diagnostics.
10. Decide the next bottleneck from the evidence:

| Evidence | Next investigation |
| --- | --- |
| Fetch/indexing/robots errors | Indexing problem |
| Indexed pages with few real impressions | Search discovery/impression problem |
| Impressions with low CTR | Search result relevance/CTR problem |
| Real visits without eligible provider clicks | Provider-action problem |
| Provider-reported clicks without bookings | Booking problem |

GSC clicks are search clicks, not affiliate/provider clicks. Booking, approval and cleared revenue require actual provider reports. Do not build another content engine or claim rankings, indexing, acquisition source or earnings from readiness tests. Keep verification material deployed for continued ownership checks. No paid service or credential creation is needed by this repository subsystem.
