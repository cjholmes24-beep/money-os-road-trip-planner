#!/usr/bin/env python3
import json,re,sys
from pathlib import Path
from html.parser import HTMLParser

root=Path(__file__).resolve().parents[1]
errors=[]

for p in root.rglob('*.json'):
    try:
        json.loads(p.read_text())
    except Exception as e:
        errors.append(f'{p.relative_to(root)} invalid JSON: {e}')

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        for k,v in attrs:
            if k in ('href','src') and v:
                self.links.append(v)

for p in root.rglob('*.html'):
    parser=Links(); parser.feed(p.read_text())
    for link in parser.links:
        if link.startswith(('http:','https:','#','mailto:','data:')):
            continue
        target=(root/link.lstrip('/').removeprefix('money-os-road-trip-planner/')) if link.startswith('/') else (p.parent/link)
        if link.endswith('/'):
            target=target/'index.html'
        if not target.exists():
            errors.append(f'{p.relative_to(root)} broken link: {link}')

sitemap=(root/'sitemap.xml').read_text()
for url in re.findall(r'<loc>(.*?)</loc>',sitemap):
    rel=url.split('/money-os-road-trip-planner/',1)[-1]
    target=root/rel
    if url.endswith('/'):
        target=target/'index.html'
    if not target.exists():
        errors.append(f'sitemap missing: {rel}')

html=(root/'plan-my-trip/index.html').read_text()
required=[
    'tp-em.com/NTgxMDU0.js','Affiliate disclosure','I NEED TO LEAVE THIS TRIP',
    'Live source not connected yet.','TRANSPORTATION INTELLIGENCE','LODGING INTELLIGENCE',
    'transport-lodging-intelligence.js','quoteTransportTaxes','quoteLodgingTaxes',
    'Use current EIA weekly reference'
]
for item in required:
    if item not in html:
        errors.append(f'planner missing: {item}')

# Public client code must not contain live credentials.
secret_pattern = '(sk' + r'_live_[A-Za-z0-9]{12,}|AKIA[0-9A-Z]{16}|Bearer\s+[A-Za-z0-9._-]{20,}|-----BEGIN (RSA |EC )?PRIVATE KEY|password\s*[:=]\s*[\"\'][^\"\']{8,})'
for p in root.rglob('*'):
    if p.is_file() and '.git' not in p.parts and re.search(secret_pattern,p.read_text(errors='ignore')):
        errors.append(f'possible secret: {p.relative_to(root)}')

registry=json.loads((root/'data/provider-capability-registry.json').read_text())
for provider in registry.get('providers',[]):
    if provider.get('requires_secret') and provider.get('browser_safe') is True:
        errors.append(f'provider registry exposes secret-required source as browser safe: {provider.get("id")}')
    if provider.get('connection_status') == 'CONNECTED' and provider.get('requires_secret') and provider.get('category') != 'affiliate_link_routing':
        errors.append(f'secret-required provider incorrectly marked CONNECTED: {provider.get("id")}')

if errors:
    print('\n'.join(errors))
    sys.exit(1)

print('Site validation passed: JSON, internal links, sitemap, disclosure, Drive, quote truth UI, provider boundaries, and secret patterns')
