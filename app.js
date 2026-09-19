import { calculate, resolveSelection, removalImpact } from '/shared/dependencies.mjs';
const $ = selector => document.querySelector(selector);
const money = amount => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const STORAGE = 'zadok-scope-draft-2026-09-v1';
let catalog = [], recurringService = null, explicit = [], storageWarning = false, confirmAction;
const node = (tag, text, className) => { const element = document.createElement(tag); if (text !== undefined) element.textContent = text; if (className) element.className = className; return element; };
function announce(message) { $('#announcement').textContent = message; clearTimeout(announce.timer); announce.timer = setTimeout(() => $('#announcement').textContent = '', 9000); }
function saveDraft() {
  try { localStorage.setItem(STORAGE, JSON.stringify({ explicit })); }
  catch { if (!storageWarning) announce('This browser cannot save your draft. Keep this tab open until you finish.'); storageWarning = true; }
}
function restoreDraft() {
  try {
    const raw = localStorage.getItem(STORAGE); if (!raw) return;
    const draft = JSON.parse(raw);
    explicit = Array.isArray(draft.explicit) ? [...new Set(draft.explicit.filter(id => catalog.some(item => item.id === id && item.category !== 'foundation')))] : [];
    resolveSelection(explicit, catalog);
    announce('Your saved draft has been restored.');
  } catch { announce('The saved draft could not be restored. A fresh selection is ready.'); explicit = []; }
}
async function api(path, options = {}) {
  let response;
  try { response = await fetch(`/api/${path}`, { ...options, headers:{ ...(options.body ? { 'Content-Type':'application/json' } : {}), ...options.headers }, signal:AbortSignal.timeout(30000) }); }
  catch { throw Object.assign(new Error('The connection was interrupted. Your draft is preserved; please try again.'), { code:'NETWORK_ERROR' }); }
  let data; try { data = await response.json(); } catch { throw new Error('The server returned an unreadable response. Please retry.'); }
  if (!response.ok) throw Object.assign(new Error(data.error?.message || 'The request failed. Please retry.'), data.error);
  return data;
}
function validConfig(data) {
  if (!data || !Array.isArray(data.catalog) || data.catalog.length < 1) return false;
  const ids = new Set();
  for (const item of data.catalog) {
    if (!item || typeof item.id !== 'string' || ids.has(item.id) || typeof item.title !== 'string' || !Number.isSafeInteger(item.price) || item.price < 0 || !['foundation','launch','addition'].includes(item.category) || !Array.isArray(item.dependencies) || !Array.isArray(item.inclusions) || item.inclusions.some(x => typeof x !== 'string') || typeof item.value !== 'string' || typeof item.warning !== 'string') return false;
    ids.add(item.id);
  }
  if (data.catalog.filter(item => item.category === 'foundation').length !== 1) return false;
  try { resolveSelection([...ids], data.catalog); } catch { return false; }
  return true;
}
async function loadConfig(initial = false) {
  $('#access-status').textContent = 'Loading the private proposal…'; $('#retry-config').hidden = true;
  try {
    const data = await api('scope-config');
    if (!validConfig(data) || !validRecurring(data.recurringService)) throw new Error('The proposal configuration is incomplete. Please retry loading it.');
    catalog = data.catalog; recurringService = data.recurringService;
    restoreDraft(); renderModules(); renderCare($('#care-details'), recurringService); update();
    $('#access').hidden = true; $('#proposal').hidden = false; $('#access-status').textContent = '';
    $('#proposal-title').focus();
  } catch (error) {
    $('#access-status').textContent = initial && error.code === 'SESSION_EXPIRED' ? '' : error.message;
    $('#retry-config').hidden = error.code === 'SESSION_EXPIRED';
  }
}
$('#unlock-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = $('#unlock-button'); button.disabled = true; $('#access-status').textContent = 'Checking access…';
  try { await api('auth', { method:'POST', body:JSON.stringify({ code:$('#access-code').value }) }); $('#access-code').value = ''; await loadConfig(); }
  catch (error) { $('#access-status').textContent = error.message; $('#access-code').focus(); }
  finally { button.disabled = false; }
});
$('#toggle-code').addEventListener('click', () => { const show = $('#access-code').type === 'password'; $('#access-code').type = show ? 'text' : 'password'; $('#toggle-code').textContent = show ? 'Hide' : 'Show'; $('#toggle-code').setAttribute('aria-pressed', String(show)); });
$('#retry-config').addEventListener('click', () => loadConfig());
function inclusionDetails(item) {
  const disclosure = node('details'), summary = node('summary','Full inclusions'), list = node('ul');
  item.inclusions.forEach(text => list.append(node('li',text))); disclosure.append(summary,list);
  return disclosure;
}
function validRecurring(service) {
  return service && typeof service.title === 'string' && Number.isSafeInteger(service.amount) && service.amount >= 0 && service.interval === 'month' && Number.isSafeInteger(service.startsAfterLaunchDays) && service.startsAfterLaunchDays >= 0 && ['description','billingNote','scopeClarification','domainClarification'].every(key => typeof service[key] === 'string') && Array.isArray(service.inclusions) && service.inclusions.every(value => typeof value === 'string');
}
function renderCare(container, service) {
  container.replaceChildren(node('p',`${money(service.amount)}/${service.interval}`,'care-price'),node('p',service.billingNote,'selection-label'),node('p',service.description));
  const list=node('ul',undefined,'care-inclusions');service.inclusions.forEach(value=>list.append(node('li',value)));container.append(list,node('p',service.scopeClarification,'warning'),node('p',service.domainClarification,'warning'));
}
function recurringSummary(service) {
  const summary=node('div',undefined,'recurring-summary');summary.append(node('p',service.title),node('strong',`${money(service.amount)}/${service.interval}`),node('p',service.billingNote,'small'),node('p','Recurring service, separate from the one-time project fee.','small'));return summary;
}
function renderModules() {
  for (const id of ['foundation','launch-modules','addition-modules']) $(`#${id}`).replaceChildren();
  for (const item of catalog) {
    if (item.category === 'foundation') {
      const box = node('div',undefined,'foundation-box'); box.append(node('span','✓ Always included · Locked foundation','selection-label'), node('h3',item.title), node('p',money(item.price),'price'), node('p',item.value), inclusionDetails(item), node('p',item.warning,'warning')); $('#foundation').append(box); continue;
    }
    const row = node('article',undefined,'module'); row.id = `module-${item.id}`;
    const main = node('div',undefined,'module-main'), input = node('input'); input.type = 'checkbox'; input.id = `select-${item.id}`;
    const label = node('label',item.title); label.htmlFor = input.id;
    const price = node('span',`${item.provisional ? 'From ' : ''}${money(item.price)}`,'price');
    const body = node('div',undefined,'module-body'), value = node('p',item.value), state = node('span',undefined,'selection-label'); state.id = `state-${item.id}`;
    body.append(value,state);
    const dependency = node('p', `Requires: ${item.dependencies.map(id => catalog.find(other => other.id === id).title).join('; ') || 'No business-module dependency'}.`, 'dependency'); dependency.id = `dependency-${item.id}`; input.setAttribute('aria-describedby',dependency.id); body.append(dependency);
    if (item.warning) body.append(node('p',item.warning,`warning${item.provisional ? ' attention' : ''}`));
    body.append(inclusionDetails(item)); main.append(input,label,price); row.append(main,body);
    input.addEventListener('change', () => changeSelection(item.id,input.checked));
    $(`#${item.category === 'launch' ? 'launch' : 'addition'}-modules`).append(row);
  }
}
function summaryInto(container, summary) {
  container.replaceChildren();
  for (const [category,title] of [['foundation','Website Foundation'],['launch','Core Operational Features'],['addition','Optional Advancements']]) {
    const group = node('div',undefined,'summary-group'); group.append(node('h3',title));
    const modules = summary.modules.filter(item => item.category === category);
    modules.forEach(item => { const line = node('div',undefined,'summary-item'); line.append(node('span',`${item.title}${item.provisional ? ' (provisional)' : ''}`), node('span',`${item.provisional ? 'From ' : ''}${money(item.price)}`)); group.append(line); });
    if (!modules.length) group.append(node('p','None selected','small'));
    container.append(group);
  }
  const total = node('div',undefined,'total-block'); total.append(node('p','One-time project total'),node('strong',money(summary.total)));
  if (summary.provisional) total.append(node('p','Includes a provisional accounting amount. Final scope and price are subject to review.','small'));
  container.append(total,recurringSummary(recurringService));
}
function update() {
  const summary = calculate(explicit,catalog);
  for (const item of catalog.filter(item => item.category !== 'foundation')) {
    const selected = summary.selectedIds.includes(item.id), automatic = selected && !explicit.includes(item.id);
    $(`#select-${item.id}`).checked = selected; $(`#module-${item.id}`).classList.toggle('selected',selected);
    const requiredBy = summary.modules.filter(other => other.dependencies.includes(item.id)).map(other => other.title);
    $(`#state-${item.id}`).textContent = automatic ? `Automatically included${requiredBy.length ? ` for ${requiredBy.join('; ')}` : ''}` : selected ? 'Selected' : 'Not selected';
  }
  summaryInto($('#desktop-summary'),summary); $('#mobile-total').textContent = money(summary.total); $('#mobile-provisional').textContent = summary.provisional ? 'Includes provisional amount' : '';
  saveDraft();
}
function ask(message, action, title = 'Change your selection?') { confirmAction = action; $('#confirm-title').textContent = title; $('#confirm-message').textContent = message; $('#confirm-dialog').showModal(); }
$('#cancel-change').addEventListener('click', () => $('#confirm-dialog').close());
$('#confirm-change').addEventListener('click', () => { $('#confirm-dialog').close(); confirmAction?.(); });
function changeSelection(id, checked) {
  const before = calculate(explicit,catalog).selectedIds;
  if (checked) {
    explicit.push(id); const added = resolveSelection(explicit,catalog).filter(value => !before.includes(value) && value !== id);
    update(); announce(added.length ? `Also included: ${added.map(value => catalog.find(item => item.id === value).title).join('; ')}. Required for your selection.` : 'Selection added.');
  } else {
    const impact = removalImpact(id,before,catalog);
    const remove = () => { explicit = explicit.filter(value => !impact.includes(value)); update(); announce('Selection updated. Dependencies that are no longer needed have been removed.'); };
    if (impact.length > 1) { update(); ask(`Removing ${catalog.find(item => item.id === id).title} will also remove: ${impact.filter(value => value !== id).map(value => catalog.find(item => item.id === value).title).join('; ')}.`,remove); }
    else remove();
  }
}
let state = 'editing', quotation = null, pdfFile = null, pdfUrl = '', sharePending = false, lastReviewButton;
function setState(next) {
  state = next; $('#main').dataset.state = next;
  const generating = next === 'generating_pdf';
  $('#quotation-review').setAttribute('aria-busy',String(generating));
  document.querySelectorAll('.review-button').forEach(button => {button.disabled = next === 'validating';});
  document.querySelectorAll('[data-pdf-action]').forEach(button => {button.disabled = generating || !pdfFile || sharePending;});
  $('#back-edit').disabled = generating;
}
function discardPdf() { if(pdfUrl) URL.revokeObjectURL(pdfUrl); pdfUrl='';pdfFile=null; }
$('#clear-draft').addEventListener('click', () => ask('This removes your optional selections from this browser. The required foundation stays included.', () => { explicit=[];update();announce('Draft cleared.'); },'Clear your draft?'));
function showReview() { $('#quotation-share').hidden=true;$('#quotation-review').hidden=false;$('#review-title').focus(); }
function renderQuotation(quote) {
  const date = value => new Date(value).toLocaleString('en-GB',{timeZone:'UTC'});
  $('#quote-metadata').replaceChildren(node('p',`Reference: ${quote.reference}`),node('p',`Generated: ${date(quote.timestamp)} UTC`),node('p',`Valid for ${quote.validityDays} days, until ${date(quote.validUntil)} UTC`));
  const content=$('#review-content');content.replaceChildren();
  for(const [category,label] of [['foundation','Website Foundation'],['launch','Core Operational Features'],['care','Ongoing Website Care & Improvement'],['addition','Optional Advancements']]) {
    const section=node('section',undefined,'review-section');section.append(node('h2',label));
    if(category==='care'){section.classList.add('care-section');const details=node('div');renderCare(details,quote.recurringService);section.append(details);content.append(section);continue;}
    const items=quote.modules.filter(item=>item.category===category);
    if(!items.length)section.append(node('p','None selected.'));
    for(const item of items){
      const row=node('article',undefined,'review-module');const header=node('div',undefined,'review-module-heading');
      header.append(node('h3',item.title),node('strong',`${item.provisional?'From ':''}${money(item.price)}`));row.append(header,node('p',item.value));
      if(quote.automaticIds.includes(item.id))row.append(node('p',`Automatically included for: ${quote.modules.filter(other=>other.dependencies.includes(item.id)).map(other=>other.title).join('; ')}.`,'selection-label'));
      else if(category==='foundation')row.append(node('p','Required foundation - always included.','selection-label'));
      row.append(inclusionDetails(item));if(item.warning)row.append(node('p',item.warning,'warning'));section.append(row);
    }
    content.append(section);
  }
  const summary=node('section',undefined,'review-summary-section');summary.append(node('h2','Quotation Summary'));
  const total=node('div',undefined,'total-block');total.append(node('p','One-time project fee'),node('strong',money(quote.total)));if(quote.provisional)total.append(node('p','Includes a provisional accounting-platform amount; final scope and price depend on the provider and available API.','small'));summary.append(total,recurringSummary(quote.recurringService));content.append(summary);
  const exclusions=node('section',undefined,'quote-exclusions');exclusions.append(node('h3','Optional modules not selected'));
  const list=node('ul');quote.unselectedModules.forEach(item=>list.append(node('li',item.title)));exclusions.append(quote.unselectedModules.length?list:node('p','None; all optional modules are selected.'));content.append(exclusions,node('p',quote.acknowledgement,'review-notice'));
}
async function reviewScope(event) {
  if(state==='validating')return;
  lastReviewButton=event.currentTarget;setState('validating');announce('Validating your selected scope and total...');
  try {
    const result=await api('quotation',{method:'POST',body:JSON.stringify({selectedIds:explicit})});
    if(!validConfig({catalog:result.modules}) || !validRecurring(result.recurringService) || !Array.isArray(result.automaticIds) || !Array.isArray(result.unselectedModules) || !Number.isSafeInteger(result.total) || typeof result.pdfToken!=='string' || !/^ZF-\d{8}-[A-F0-9]{16}$/.test(result.reference) || !Number.isFinite(Date.parse(result.timestamp)) || !Number.isFinite(Date.parse(result.validUntil)) || !/^https:\/\/wa\.me\/[1-9]\d{7,14}\?text=/.test(result.whatsapp?.url||''))throw new Error('The quotation response could not be read. Please try again.');
    quotation=result;discardPdf();renderQuotation(result);$('#proposal').hidden=true;showReview();setState('review_ready');announce('Your quotation is ready for review. Nothing has been sent.');await preparePdf();
  }catch(error){setState('editing');announce(error.message);if(error.code==='SESSION_EXPIRED'){$('#proposal').hidden=true;$('#access').hidden=false;$('#access-status').textContent=error.message;$('#access-code').focus();}}
}
document.querySelectorAll('.review-button').forEach(button=>button.addEventListener('click',reviewScope));
async function preparePdf() {
  if(state==='generating_pdf')return;
  setState('generating_pdf');$('#pdf-status').textContent='Generating your print-quality quotation PDF...';$('#retry-pdf').hidden=true;
  try {
    const response=await fetch('/api/quotation-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pdfToken:quotation.pdfToken}),signal:AbortSignal.timeout(30000)});
    if(!response.ok){const data=await response.json();throw new Error(data.error?.message||'The PDF could not be generated. Please retry.');}
    if(!response.headers.get('content-type')?.includes('application/pdf'))throw new Error('An invalid PDF response was returned. Please retry.');
    const bytes=await response.arrayBuffer();
    if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('The PDF could not be read. Please retry.');
    pdfFile=new File([bytes],quotation.filename,{type:'application/pdf',lastModified:Date.parse(quotation.timestamp)});pdfUrl=URL.createObjectURL(pdfFile);
    $('#pdf-status').textContent='Your quotation PDF is ready to preview, download or share.';
  }catch(error){$('#pdf-status').textContent=error.message||'The PDF could not be generated. Please retry.';$('#retry-pdf').hidden=false;}
  finally{setState('review_ready');}
}
$('#retry-pdf').addEventListener('click',preparePdf);
$('#back-edit').addEventListener('click',()=>{discardPdf();quotation=null;$('#quotation-review').hidden=true;$('#quotation-share').hidden=true;$('#proposal').hidden=false;setState('editing');lastReviewButton?.focus();});
function downloadPdf(){if(!pdfFile)return;const link=node('a');link.href=pdfUrl;link.download=pdfFile.name;document.body.append(link);link.click();link.remove();announce('Your quotation PDF download has been requested.');}
document.querySelectorAll('.download-pdf').forEach(button=>button.addEventListener('click',downloadPdf));
$('#preview-pdf').addEventListener('click',()=>{$('#pdf-preview').src=pdfUrl;$('#preview-dialog').showModal();});
$('#close-preview').addEventListener('click',()=>$('#preview-dialog').close());
function shareView(fallback){
  $('#quotation-review').hidden=true;$('#quotation-share').hidden=false;$('#open-whatsapp').hidden=!fallback;$('#share-again').hidden=fallback;
  $('#open-whatsapp').href=quotation.whatsapp.url;$('#share-reference').textContent=`Reference: ${quotation.reference}`;
  $('#share-message').textContent=fallback?'Your quotation has been downloaded. Open WhatsApp and attach the downloaded PDF to complete the process.':'Your device\u2019s share options have been opened. Select WhatsApp and send the attached quotation to complete the process.';
  $('#share-error').textContent='';setState('share_opened');$('#share-title').focus();
}
async function shareQuotation(){
  if(!pdfFile||sharePending||state==='generating_pdf')return;
  let supported=false;
  try{supported=typeof navigator.share==='function' && typeof navigator.canShare==='function' && navigator.canShare({files:[pdfFile]});}catch{supported=false;}
  if(!supported){downloadPdf();shareView(true);return;}
  sharePending=true;setState(state);
  try{
    // The already prepared File preserves transient user activation for the native share call.
    const sharing=navigator.share({files:[pdfFile],title:'Zadok Farm - Project Scope Selection',text:quotation.whatsapp.message});
    shareView(false);await sharing;
  }catch(error){
    showReview();setState('review_ready');
    $('#pdf-status').textContent=error.name==='AbortError'?'Sharing was cancelled. Your quotation is still ready to download or share.':'The device could not open file sharing. Download the PDF and open WhatsApp to attach it manually.';
    if(error.name!=='AbortError'){$('#share-error').textContent='File sharing is unavailable on this device.';$('#manual-fallback').hidden=false;}
  }finally{sharePending=false;setState(state);}
}
$('#share-quote').addEventListener('click',shareQuotation);$('#share-again').addEventListener('click',shareQuotation);
const fallback=node('button','Download and open sharing instructions');fallback.id='manual-fallback';fallback.type='button';fallback.hidden=true;$('#pdf-status').after(fallback);fallback.addEventListener('click',()=>{downloadPdf();shareView(true);});
$('#return-quote').addEventListener('click',()=>{showReview();setState('review_ready');});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button,a[href],iframe')].filter(element=>!element.matches(':disabled')&&element.getClientRects().length);const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
setState('editing');loadConfig(true);
