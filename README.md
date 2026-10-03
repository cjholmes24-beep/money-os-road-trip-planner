# Road Trip Ledger

A zero-cost static travel-planning utility site. It includes focused calculators for gas, complete road trips, rental cars, airport transfers, travel eSIM data, activities, and luggage storage, plus a factual flight-delay compensation guide.

## Run locally

Serve the repository root with any static server, for example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. No build, account, database, paid API, or external package is required. Calculations run locally in the browser.

## Search setup

The repository contains `sitemap.xml`, `robots.txt`, canonical links, Open Graph tags, and JSON-LD. After GitHub Pages publishes, add the GitHub Pages URL as a URL-prefix property in Google Search Console, verify it using a supported no-cost method, and submit `sitemap.xml`. The same sitemap can be submitted to Bing Webmaster Tools.

## Monetization and disclosure

The existing Travelpayouts Drive loader remains installed. Pages contain an affiliate disclosure explaining that eligible links or offers may generate a commission at no additional cost to the traveler. No unverified direct affiliate program URLs are hard-coded.

## Privacy and costs

The site requires no paid hosting, domain, API, SEO tool, advertising, or social posting. It collects no form submissions; calculator inputs remain in the browser. Estimates are planning aids and should be checked against current provider prices and terms.
