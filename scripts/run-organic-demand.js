'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const O=require('../organic-demand-engine'),{inspectSite}=require('./organic-site-audit');
const root=path.resolve(__dirname,'..');
const args=process.argv.slice(2);function arg(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const date=arg('--date',new Date().toISOString().slice(0,10));
const output=path.resolve(arg('--out-dir',root)),check=args.includes('--check'),searchFile=arg('--search-file',null);
if(searchFile&&(output===root||output.startsWith(root+path.sep)))throw Error('Private search imports require an output directory outside the repository. Never commit real account exports.');
const {pages,health}=inspectSite(root,date);
const oldFile=path.join(root,'data/organic-opportunities-latest.json');const previous=fs.existsSync(oldFile)?JSON.parse(fs.readFileSync(oldFile,'utf8')):null;
const registry=JSON.parse(fs.readFileSync(path.join(root,'data/monetization-opportunity-registry.json'),'utf8'));
const search=searchFile?O.validateSearchImport(JSON.parse(fs.readFileSync(searchFile,'utf8')),date):null;
const report=O.generate({as_of:date,pages,health,registry,previous,search});
if(!O.validateReport(report))throw Error('Invalid organic opportunity output.');
const digest=x=>crypto.createHash('sha256').update(O.materialFingerprint(x)).digest('hex');
const changed=!previous||digest(previous)!==digest(report);
const lines=['# Organic opportunities — latest repository snapshot','',`Analysis date: ${date}. Deterministic repository observations, not traffic, search volume or indexing proof.`, '',`Earliest weak stage: **${report.earliest_weak_stage.stage}** — ${report.earliest_weak_stage.reason}`,'',`Health: ${health.issues.filter(i=>i.severity==='BLOCKER').length} blockers; ${health.issues.filter(i=>i.severity==='WARNING').length} warnings. Analysis dates alone do not constitute material change.`,'','Scheduled observations use workflow artifacts/summary, never automatic commits.','', '| Priority | Type | Page | Reason | Next action |','| --- | --- | --- | --- | --- |',...report.opportunities.map(o=>`| ${o.priority} | ${o.type} | ${o.target_page} | ${o.reason.replaceAll('|','/')} | ${o.recommended_action.replaceAll('|','/')} |`),'','## Health observations','',...health.issues.map(i=>`- ${i.severity}: ${i.code} — ${i.reason}`),'','## Seasonal planning windows','',...report.seasonal_windows.map(w=>`- ${w.theme}: ${w.phase}, ${w.active_start} through ${w.active_end}. Calendar heuristic, not a trend.`),'','Live Google/Bing/provider reports: NOT CONNECTED. Imported search reports, if explicitly supplied, remain user claims. No traffic generation, automatic public content, affiliate clicking, or paid infrastructure.',''];
if(check){if(!O.validateReport(previous))throw Error('Missing/invalid checked-in opportunity snapshot.');if(health.issues.some(i=>i.severity==='BLOCKER'))throw Error('Organic site health blockers: '+health.issues.filter(i=>i.severity==='BLOCKER').map(i=>i.code).join(', '));}
else{fs.mkdirSync(path.join(output,'data'),{recursive:true});fs.mkdirSync(path.join(output,'docs'),{recursive:true});fs.writeFileSync(path.join(output,'data/organic-opportunities-latest.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(output,'docs/ORGANIC_OPPORTUNITIES_LATEST.md'),lines.join('\n'));}
if(!check&&process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.slice(0,12).join('\n')+'\n\n'+report.opportunities.slice(0,8).map(o=>`${o.priority}. ${o.type}: ${o.target_page} — ${o.reason}`).join('\n')+'\n');
console.log(`Organic analysis: ${report.opportunities.length} valid opportunities; ${health.issues.filter(i=>i.severity==='BLOCKER').length} blockers; meaningful change ${changed?'YES':'NO'}. No traffic generated.`);
