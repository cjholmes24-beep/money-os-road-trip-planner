'use strict';
const fs=require('fs'),path=require('path'),O=require('../organic-demand-engine'),S=require('../source-intelligence');
const text=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&(?:amp|quot|lt|gt|#39);/g,' ').replace(/\s+/g,' ').trim();
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(m=>[m[1].toLowerCase(),m[2]]));
function parsePage(html,page){
 const tags=[...html.matchAll(/<(?:meta|link|a|script)\b[^>]*>/gi)].map(m=>({tag:m[0].slice(1).split(/[\s>]/)[0].toLowerCase(),...attrs(m[0])}));
 const json=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>attrs(m[1]).type==='application/ld+json').map(m=>{try{return JSON.parse(m[2]);}catch(_){return null;}});
 return{path:page,html,title:(html.match(/<title>([\s\S]*?)<\/title>/i)||[])[1]||'',description:tags.find(t=>t.tag==='meta'&&t.name==='description')?.content||'',canonical:tags.find(t=>t.tag==='link'&&t.rel==='canonical')?.href||'',noindex:tags.some(t=>t.name==='robots'&&/noindex/i.test(t.content||'')),links:tags.filter(t=>t.tag==='a').map(t=>t.href).filter(Boolean),intent_families:[...html.matchAll(/data-intent-family="([^"]+)"/g)].map(m=>m[1]),schemas:json,visible:text(html),drive_count:(html.match(/tp-em\.com\/NTgxMDU0\.js\?t=581054/g)||[]).length};
}
function inspectSite(root,asOf){
 const pageFiles=[path.join(root,'index.html'),...fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()&&!e.name.startsWith('.')).map(e=>path.join(root,e.name,'index.html')).filter(p=>fs.existsSync(p))];
 const pages=pageFiles.map(file=>parsePage(fs.readFileSync(file,'utf8'),file===path.join(root,'index.html')?'/':'/'+path.basename(path.dirname(file))+'/'));
 const publicPages=pages.filter(p=>!p.noindex),issues=[],edges=[];
 const add=(code,page,reason,action,type='DISTRIBUTION_GAP',severity='BLOCKER')=>issues.push({code,page,reason,action,type,severity});
 const read=file=>{try{return fs.readFileSync(path.join(root,file),'utf8');}catch(_){return '';}};
 const sitemap=read('sitemap.xml'),urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
 const robots=read('robots.txt');
 if(!sitemap)add('SITEMAP_UNAVAILABLE','/','Sitemap unavailable.','Restore the existing public sitemap.');
 if(!/^User-agent:\s*\*/m.test(robots)||/^Disallow:\s*\//m.test(robots)||!robots.includes(O.BASE+'/sitemap.xml'))add('ROBOTS_CONFIGURATION','/','Public crawling/sitemap configuration needs review.','Restore intended crawl permission and sitemap location.');
 if(new Set(urls).size!==urls.length)add('SITEMAP_DUPLICATES','/','Sitemap contains duplicate locations.','Remove duplicate canonical entries.');
 const titles=new Map(),descriptions=new Map();
 for(const page of publicPages){
  if(!urls.includes(O.BASE+page.path))add('SITEMAP_MISSING',page.path,'Public page missing from sitemap.','Add the canonical public URL.');
  if(page.canonical!==O.BASE+page.path)add('CANONICAL_MISSING',page.path,'Canonical missing or inconsistent.','Use this public page\'s exact canonical.','SEARCH_METADATA_GAP');
  if(!page.title||!page.description)add('METADATA_MISSING',page.path,'Missing title or description.','Describe the question the actual tool answers.','SEARCH_METADATA_GAP');
  for(const [value,map,code] of [[page.title,titles,'TITLE_DUPLICATE'],[page.description,descriptions,'DESCRIPTION_DUPLICATE']]){if(map.has(value))add(code,page.path,'Metadata duplicates '+map.get(value)+'.','Write a distinct truthful page description/title.','SEARCH_METADATA_GAP');else map.set(value,page.path);}
  if(O.MONEY_PAGES.includes(page.path)||!O.ORIGINAL_PAGES.includes(page.path)){if(page.drive_count!==1)add('DRIVE_LOADER',page.path,'Expected exactly one existing public Drive loader.','Restore original loader; never invent an identifier.');if(!page.visible.includes('Affiliate disclosure'))add('DISCLOSURE_MISSING',page.path,'Affiliate disclosure absent.','Explain eligible affiliate processing visibly.');}
  for(const href of page.links){
   if(/^(mailto:|tel:|#)/.test(href))continue;
   let url;try{url=new URL(href,O.BASE+page.path);}catch(_){add('INVALID_LINK',page.path,'Malformed internal link.','Repair actual destination.','INTERNAL_LINK_GAP');continue;}
   if(url.origin!==new URL(O.BASE).origin)continue;
   if(!url.pathname.startsWith('/money-os-road-trip-planner/'))continue;
   const target=url.pathname.replace('/money-os-road-trip-planner','');
   const file=path.join(root,target.endsWith('/')?target+'index.html':target);
   if(!fs.existsSync(file))add('BROKEN_INTERNAL_LINK',page.path,'Broken internal link to '+target,'Repair or remove the link.','INTERNAL_LINK_GAP');
   if(publicPages.some(p=>p.path===target))edges.push({from:page.path,to:target});
  }
  if(page.schemas.some(x=>x===null))add('STRUCTURED_JSON_INVALID',page.path,'Invalid schema.org JSON.','Repair or remove malformed markup.','SEARCH_METADATA_GAP');
  const walk=node=>{if(!node||typeof node!=='object')return;const types=[node['@type']].flat().filter(Boolean);if(types.some(t=>['AggregateRating','Review','Offer','Product'].includes(t)))add('UNSUPPORTED_STRUCTURED_FACT',page.path,'Structured reviews/offers/prices have no supported evidence path.','Remove unsupported markup.','SEARCH_METADATA_GAP');if(types.some(t=>!['WebApplication','Article','FAQPage','Question','Answer','Organization','WebSite'].includes(t)))add('STRUCTURED_TYPE',page.path,'Unsupported structured-data type for these pages.','Review against actual visible content.','SEARCH_METADATA_GAP');if(types.some(t=>['WebApplication','Article'].includes(t))&&((node.name&&!page.visible.includes(text(node.name)))||(node.headline&&!page.visible.includes(text(node.headline)))))add('STRUCTURED_NAME_NOT_VISIBLE',page.path,'Structured name/headline differs from visible page content.','Use the actual visible product/article identity.','SEARCH_METADATA_GAP');if(types.includes('Question')&&(typeof node.name!=='string'||!page.visible.includes(node.name)))add('FAQ_NOT_VISIBLE',page.path,'Structured question is not visibly present.','Match exact visible question/answer or remove schema.','SEARCH_METADATA_GAP');if(types.includes('Answer')&&(typeof node.text!=='string'||!page.visible.includes(text(node.text))))add('FAQ_ANSWER_NOT_VISIBLE',page.path,'Structured answer is not visibly present.','Use exact visible answer.','SEARCH_METADATA_GAP');Object.values(node).filter(v=>v&&typeof v==='object').forEach(v=>Array.isArray(v)?v.forEach(walk):walk(v));};page.schemas.forEach(walk);
  if(!page.schemas.length)add('STRUCTURED_DATA_MISSING',page.path,'No applicable structured description found.','Add truthful WebApplication/Article metadata when useful.','SEARCH_METADATA_GAP','WARNING');
 }
 const reached=new Set(['/']);for(let i=0;i<publicPages.length;i++)for(const edge of edges)if(reached.has(edge.from))reached.add(edge.to);
 for(const page of publicPages)if(!reached.has(page.path))add('ORPHAN_PAGE',page.path,'Public page is not reachable from homepage links.','Add a useful contextual incoming link.','INTERNAL_LINK_GAP');
 for(const url of urls)if(!publicPages.some(p=>O.BASE+p.path===url))add('SITEMAP_UNKNOWN_URL','/','Sitemap references a missing/private/foreign page.','Remove unsupported URL or restore intended public content.');
 const newPages=publicPages.filter(p=>!O.ORIGINAL_PAGES.includes(p.path));
 if(newPages.length>4)add('NEW_PAGE_LIMIT','/','More than four new public pages.','Keep V1 to at most four useful distinct pages.');
 for(const page of newPages){const candidate=O.NEW_PAGE_CANDIDATES.find(c=>c.useful&&c.page===page.path);if(!candidate||page.visible.split(' ').length<350||!page.html.includes('data-methodology')||!page.html.includes('data-example')||!page.html.includes('data-assumptions')||!page.links.some(link=>O.MONEY_PAGES.some(p=>link.includes(p.slice(1)))))add('NEW_PAGE_QUALITY',page.path,'New page lacks selected distinct capability, substantial explanation, method, assumptions, example, or tool links.','Review original value before publishing.','CONTENT_DEPTH_GAP');}
 const indexnow=read('.github/workflows/indexnow-notify.yml');
 if(!indexnow.includes('- main')||!indexnow.includes('python scripts/indexnow_submit.py')||!fs.existsSync(path.join(root,'96df4ff75cc652635ffb9a6b80af194e.txt')))add('INDEXNOW_CONFIGURATION','/','IndexNow main-only publication path incomplete.','Restore existing main distribution and ownership validation.');
 let fuel;try{fuel=JSON.parse(read('data/eia-gas-latest.json'));}catch(_){fuel={};}
 const freshness=S.classifyFreshness(fuel,Date.parse(asOf+'T00:00:00Z'));
 const releaseAge=(Date.parse(asOf)-Date.parse(fuel.period_end))/86400000;
 if(['aging','stale','unavailable'].includes(freshness.status)||!Number.isFinite(releaseAge)||releaseAge>9)add('EIA_REFERENCE_REVIEW','/road-trip-cost-calculator/','Weekly gasoline snapshot needs age/release review; it is not a station quote.','Check existing EIA refresh job/source timestamps; do not invent replacement fuel prices.','STALE_CONTENT','WARNING');
 return{pages,health:{as_of:asOf,public_page_count:publicPages.length,new_page_count:newPages.length,issues,internal_link_graph:edges.sort((a,b)=>(a.from+a.to).localeCompare(b.from+b.to)),pages_configuration:'Legacy Pages main / root observed through GitHub API on 2026-10-06; scheduled run checks repository configuration only, not deployment/indexing.',source_checks:{eia_retrieval_status:freshness.status,eia_period_end:fuel.period_end},indexing_proven:false}};
}
module.exports={parsePage,inspectSite};
