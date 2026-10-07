'use strict';
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const {parsePage,inspectSite}=require('./organic-site-audit');
const BASE='https://cjholmes24-beep.github.io/money-os-road-trip-planner',PROPERTY=BASE+'/';
const EXPECTED=['/','/flight-cost-planner/','/flight-vs-driving-cost/','/road-trip-cost-calculator/','/gas-trip-calculator/','/rental-car-trip-cost/','/airport-transfer-cost-planner/','/travel-esim-cost-planner/','/travel-activities-budget/','/travel-insurance-guide/','/flight-delay-compensation-guide/','/luggage-storage-cost-planner/','/plan-my-trip/'];
const PRIVATE='/revenue-dashboard/',GOOGLE_FILE=/^google[0-9a-f]{16}\.html$/;
const attr=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(m=>[m[1].toLowerCase(),m[2]]));
function sitemapUrls(xml){
 const code='import sys,json,xml.etree.ElementTree as E\nr=E.fromstring(sys.stdin.read())\nns="{http://www.sitemaps.org/schemas/sitemap/0.9}"\nassert r.tag==ns+"urlset"\nassert all(c.tag==ns+"url" for c in r)\nassert all(len(c.findall(ns+"loc"))==1 for c in r)\nprint(json.dumps([c.find(ns+"loc").text for c in r]))';
 const result=spawnSync('python3',['-c',code],{input:xml,encoding:'utf8'});if(result.status!==0)throw Error('Sitemap XML is malformed or has missing/ambiguous locations.');return JSON.parse(result.stdout);
}
function robotsAllows(raw,url,agent='googlebot'){
 const groups=[];let group=null,rules=false;
 for(const line of raw.split(/\r?\n/)){const clean=line.replace(/#.*/,'').trim();const match=clean.match(/^([^:]+):\s*(.*)$/);if(!match)continue;const name=match[1].trim().toLowerCase(),value=match[2].trim();
  if(name==='user-agent'){if(!group||rules){group={agents:[],rules:[]};groups.push(group);rules=false;}group.agents.push(value.toLowerCase());}
  else if(['allow','disallow'].includes(name)&&group){rules=true;if(value)group.rules.push({allow:name==='allow',pattern:value});}
 }
 const exact=groups.filter(g=>g.agents.includes(agent));const applicable=exact.length?exact:groups.filter(g=>g.agents.includes('*'));
 const pathname=new URL(url).pathname;const matches=applicable.flatMap(g=>g.rules).filter(r=>{const pattern='^'+r.pattern.split('*').map(p=>p.replace(/[.+?^{}()|[\]\\]/g,'\\$&')).join('.*').replace(/\\\$$/,'$');return new RegExp(pattern).test(pathname);});
 matches.sort((a,b)=>b.pattern.replaceAll('*','').length-a.pattern.replaceAll('*','').length||Number(b.allow)-Number(a.allow));return !matches.length||matches[0].allow;
}
function checkPage(html,url,required=true){
 const errors=[],page=parsePage(html,new URL(url).pathname.replace('/money-os-road-trip-planner',''));
 const tags=[...html.matchAll(/<(?:link|meta)\b[^>]*>/gi)].map(m=>attr(m[0]));
 const canonicals=tags.filter(t=>(t.rel||'').split(/\s+/).includes('canonical'));
 if(canonicals.length!==1||canonicals[0].href!==url)errors.push('Canonical must occur exactly once and equal the expected HTTPS URL.');
 if(tags.some(t=>['robots','googlebot'].includes((t.name||'').toLowerCase())&&/\b(noindex|none)\b/i.test(t.content||'')))errors.push('Public page has a noindex/none directive.');
 if(!page.title.trim())errors.push('Title missing.');if(!page.description.trim())errors.push('Description missing.');
 if(page.schemas.length===0||page.schemas.some(s=>s===null))errors.push('Structured data missing or malformed.');
 if(required){if(page.drive_count!==1)errors.push('Travelpayouts Drive must appear exactly once.');if(!page.visible.includes('Affiliate disclosure'))errors.push('Affiliate disclosure missing.');}
 if(tags.some(t=>(t['http-equiv']||'').toLowerCase()==='refresh'))errors.push('Meta redirect contradicts a direct indexable target.');
 return{page,errors};
}
function checkLocal(root){
 const blockers=[],add=(url,reason)=>blockers.push({url,reason}),read=file=>{try{return fs.readFileSync(path.join(root,file),'utf8');}catch(_){return '';}};
 let manifest;try{manifest=JSON.parse(read('data/google-indexing-targets.json'));}catch(_){add(PROPERTY,'Indexing target manifest is malformed.');return{status:'BLOCKED',blockers,target_count:0};}
 if(!manifest||typeof manifest!=='object'){add(PROPERTY,'Indexing target manifest must be an object.');return{status:'BLOCKED',blockers,target_count:0};}
 const targets=manifest.targets;
 if(manifest.version!==1||manifest.property_url!==PROPERTY||!Array.isArray(targets)){add(PROPERTY,'Invalid manifest version/property/targets.');return{status:'BLOCKED',blockers,target_count:0};}
 const fields=['url','priority_role','intent_family','monetization_surface','indexing_required'];
 for(const t of targets)if(!t||Object.keys(t).sort().join()!==fields.slice().sort().join()||!EXPECTED.some(p=>BASE+p===t.url)||!['ENTRY','MONEY_TOOL','COMPARISON','SUPPORT_TOOL','GUIDE','TRIP_WORKSPACE'].includes(t.priority_role)||typeof t.intent_family!=='string'||!t.intent_family.trim()||typeof t.monetization_surface!=='boolean'||t.indexing_required!==true)add(t?.url||PROPERTY,'Malformed or non-public indexing target.');
 const expected=EXPECTED.map(p=>BASE+p),targetUrls=targets.map(t=>t?.url);
 if(targets.length!==expected.length||new Set(targetUrls).size!==targets.length||expected.some(u=>!targetUrls.includes(u)))add(PROPERTY,'Manifest must exactly cover the 13 current public pages with no duplicates/private targets.');
 let urls=[];try{urls=sitemapUrls(read('sitemap.xml'));}catch(e){add(BASE+'/sitemap.xml',e.message);}
 if(urls.length!==expected.length||new Set(urls).size!==urls.length||expected.some(u=>!urls.includes(u))||urls.some(u=>!expected.includes(u)))add(BASE+'/sitemap.xml','Sitemap must exactly cover the public targets; no private, verification, duplicate or malformed URL.');
 const robots=read('robots.txt');const declarations=[...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gim)].map(m=>m[1]);
 if(!declarations.includes(BASE+'/sitemap.xml'))add(BASE+'/robots.txt','Exact sitemap declaration missing.');
 const titles=new Map(),descriptions=new Map(),canonicals=new Map();
 for(const p of EXPECTED){const url=BASE+p,html=read(p==='/'?'index.html':p.slice(1)+'index.html');if(!html){add(url,'Target HTML missing.');continue;}
  const result=checkPage(html,url,targets.find(t=>t?.url===url)?.monetization_surface!==false);result.errors.forEach(e=>add(url,e));
  for(const [value,map,name] of [[result.page.title,titles,'title'],[result.page.description,descriptions,'description'],[result.page.canonical,canonicals,'canonical']]){const normalized=value.trim().toLowerCase().replace(/\s+/g,' ');if(map.has(normalized))add(url,'Duplicate '+name+' also used by '+map.get(normalized));else map.set(normalized,url);}
  if(!robotsAllows(robots,url))add(url,'robots.txt blocks Googlebot.');
 }
 const dashboard=parsePage(read('revenue-dashboard/index.html'),PRIVATE);if(!dashboard.noindex)add(BASE+PRIVATE,'Private dashboard must remain noindex.');if(urls.includes(BASE+PRIVATE))add(BASE+PRIVATE,'Private dashboard must not be in sitemap.');
 for(const file of fs.readdirSync(root).filter(f=>/^google.*\.html$/i.test(f))){if(!GOOGLE_FILE.test(file))add(PROPERTY,'Unrecognized Google verification filename in published root.');const body=read(file);if(!new RegExp('^google-site-verification: '+file.replace('.','\\.')+'(?:\\r?\\n)?$').test(body))add(PROPERTY,'Google verification file has malformed content.');}
 const navigation=[read('index.html'),dashboard.html,...EXPECTED.filter(p=>p!=='/').map(p=>read(p.slice(1)+'index.html'))].join('\n');
 for(const m of navigation.matchAll(/<a\b[^>]*>/gi)){const href=attr(m[0]).href;if(!href)continue;try{if(/^google.*\.html$/i.test(path.posix.basename(new URL(href,PROPERTY).pathname)))add(PROPERTY,'Verification artifact must not be linked in navigation.');}catch(_){add(PROPERTY,'Malformed navigation URL.');}}
 try{const {health}=inspectSite(root,new Date().toISOString().slice(0,10));health.issues.filter(i=>i.severity==='BLOCKER').forEach(i=>add(BASE+i.page,i.code+': '+i.reason));}catch(_){add(PROPERTY,'Existing site-health audit could not complete.');}
 return{status:blockers.length?'BLOCKED':'PASS',blockers,target_count:targets.length};
}
function fetchLive(urls){
 const python='import sys,json,urllib.request,urllib.error\nout=[]\nfor u in json.loads(sys.argv[1]):\n try:\n  with urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"SuitcaseBrainIndexingReadiness/1.0"}),timeout=30) as r:out.append({"url":u,"status":r.status,"final_url":r.url,"x_robots_tag":r.headers.get("X-Robots-Tag",""),"body":r.read().decode("utf-8")})\n except urllib.error.HTTPError as e:out.append({"url":u,"status":e.code,"final_url":e.url,"body":"","x_robots_tag":""})\n except Exception:out.append({"url":u,"status":0,"final_url":u,"body":"","x_robots_tag":""})\nprint(json.dumps(out))';
 const result=spawnSync('python3',['-c',python,JSON.stringify(urls)],{encoding:'utf8',maxBuffer:8*1024*1024});if(result.status!==0)throw Error('Live audit could not fetch public HTML safely.');return JSON.parse(result.stdout);
}
function checkLive(records){
 const blockers=[],add=(url,reason)=>blockers.push({url,reason}),titles=new Set(),descriptions=new Set();
 const originRobots=records.find(r=>r.url==='https://cjholmes24-beep.github.io/robots.txt');
 if(!originRobots||![200,404].includes(originRobots.status))add('https://cjholmes24-beep.github.io/robots.txt','Origin robots availability is unresolved.');
 for(const p of EXPECTED){const url=BASE+p,r=records.find(r=>r.url===url);if(!r||r.status!==200){add(url,'Live page did not return HTTP 200.');continue;}if(r.final_url!==url)add(url,'Live redirect target differs from canonical request.');if(/\b(noindex|none)\b/i.test(r.x_robots_tag))add(url,'Live X-Robots-Tag blocks indexing.');
  const result=checkPage(r.body,url);result.errors.forEach(e=>add(url,e));if(titles.has(result.page.title))add(url,'Live duplicate title.');if(descriptions.has(result.page.description))add(url,'Live duplicate description.');titles.add(result.page.title);descriptions.add(result.page.description);
  if(originRobots?.status===200&&!robotsAllows(originRobots.body,url))add(url,'Origin-level robots.txt blocks Googlebot.');
 }
 // Audit the delivered navigation graph, not merely the checked-in graph.
 const graph=new Map();
 for(const p of EXPECTED){const url=BASE+p,r=records.find(r=>r.url===url);if(!r||r.status!==200)continue;const page=parsePage(r.body,p),edges=[];
  for(const href of page.links){try{const target=new URL(href,url);if(target.origin===new URL(BASE).origin){target.hash='';target.search='';const destination=records.find(record=>record.url===target.href);if(!destination||destination.status!==200)add(url,'Live internal link is outside the checked public targets or unavailable: '+target.href);else edges.push(target.href);}}catch(_){add(url,'Malformed live navigation URL.');}}
  graph.set(url,edges);
  const text=value=>String(value).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const walk=node=>{if(!node||typeof node!=='object')return;const types=[node['@type']].flat().filter(Boolean);if(types.some(t=>!['WebApplication','Article','FAQPage','Question','Answer','Organization','WebSite'].includes(t)))add(url,'Live structured data contains unsupported factual claims/type.');for(const key of ['name','headline'])if(types.some(t=>['WebApplication','Article','Question'].includes(t))&&node[key]&&!page.visible.includes(text(node[key])))add(url,'Live structured identity/question is absent from visible content.');if(types.includes('Answer')&&node.text&&!page.visible.includes(text(node.text)))add(url,'Live structured answer is absent from visible content.');Object.values(node).filter(v=>v&&typeof v==='object').forEach(v=>Array.isArray(v)?v.forEach(walk):walk(v));};page.schemas.forEach(walk);
 }
 const reached=new Set(),visit=url=>{if(reached.has(url))return;reached.add(url);(graph.get(url)||[]).forEach(visit);};visit(PROPERTY);for(const p of EXPECTED)if(!reached.has(BASE+p))add(BASE+p,'Live public page is orphaned from homepage navigation.');
 const sitemap=records.find(r=>r.url===BASE+'/sitemap.xml'),robots=records.find(r=>r.url===BASE+'/robots.txt');
 try{if(!sitemap||sitemap.status!==200||sitemap.final_url!==sitemap.url)throw Error('Live sitemap unavailable or redirected.');const urls=sitemapUrls(sitemap.body);if(urls.length!==EXPECTED.length||new Set(urls).size!==urls.length||EXPECTED.some(p=>!urls.includes(BASE+p)))throw Error('Live sitemap does not exactly cover public targets.');}catch(e){add(BASE+'/sitemap.xml',e.message);}
 if(!robots||robots.status!==200||robots.final_url!==robots.url||!robots.body.includes('Sitemap: '+BASE+'/sitemap.xml'))add(BASE+'/robots.txt','Live project robots/sitemap declaration unavailable or inconsistent.');
 const privatePage=records.find(r=>r.url===BASE+PRIVATE);if(!privatePage||privatePage.status!==200||!parsePage(privatePage.body,PRIVATE).noindex)add(BASE+PRIVATE,'Live private dashboard noindex could not be confirmed.');
 return{status:blockers.length?'BLOCKED':'PASS',blockers,target_count:EXPECTED.length,origin_robots_status:originRobots?.status};
}
if(require.main===module){const args=process.argv.slice(2),i=args.indexOf('--site-root'),root=i<0?path.resolve(__dirname,'..'):path.resolve(args[i+1]);let result=checkLocal(root);
 if(args.includes('--live')){try{const live=checkLive(fetchLive([...EXPECTED.map(p=>BASE+p),BASE+'/sitemap.xml',BASE+'/robots.txt',BASE+PRIVATE,'https://cjholmes24-beep.github.io/robots.txt']));result={...result,status:result.status==='PASS'&&live.status==='PASS'?'PASS':'BLOCKED',blockers:[...result.blockers,...live.blockers],live,checked_at:new Date().toISOString()};}catch(e){result.status='BLOCKED';result.blockers.push({url:PROPERTY,reason:e.message});}}
 console.log(result.status+': '+result.target_count+' indexing targets; repository/live readiness only, not Google verification or indexing.');result.blockers.forEach(b=>console.log(b.url+' — '+b.reason));if(args.includes('--json'))console.log(JSON.stringify(result,null,2));if(result.status!=='PASS')process.exitCode=1;
}
module.exports={BASE,PROPERTY,EXPECTED,sitemapUrls,robotsAllows,checkPage,checkLocal,checkLive};
