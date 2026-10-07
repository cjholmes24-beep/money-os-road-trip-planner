(function(){
 'use strict';const O=window.OrganicDemandEngine,$=id=>document.getElementById(id);if(!O||!$('organicAcquisitionStates'))return;
 let imported=null;
 const render=()=>{$('organicAcquisitionStates').textContent=O.acquisitionStatus(imported).states.join(' · ');};
 $('importSearchPerformance').addEventListener('change',async event=>{try{const file=event.target.files?.[0];if(!file)return;if(file.size>1000000)throw Error('Aggregate report exceeds 1 MB.');const candidate=O.validateSearchImport(JSON.parse(await file.text()));imported=candidate;render();$('searchImportStatus').textContent=`${candidate.records.length} user-imported aggregate records accepted in memory only. No live search connection or independent verification.`;}catch(error){$('searchImportStatus').textContent='Import rejected: '+error.message;}finally{event.target.value='';}});
 $('clearSearchPerformance').addEventListener('click',()=>{imported=null;render();$('searchImportStatus').textContent='In-memory search report cleared.';});
 render();
})();
