import { calculate, resolveSelection, removalImpact } from '/shared/dependencies.mjs';
const $ = selector => document.querySelector(selector);
const money = amount => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const STORAGE = 'zadok-scope-draft-2026-09-v1';
let catalog = [], explicit = [], token = '', pending = null, busy = false, storageWarning = false, confirmAction;
const node = (tag, text, className) => { const element = document.createElement(tag); if (text !== undefined) element.textContent = text; if (className) element.className = className; return element; };
function announce(message) { $('#announcement').textContent = message; clearTimeout(announce.timer); announce.timer = setTimeout(() => $('#announcement').textContent = '', 9000); }
function details() { return Object.fromEntries(['name','role','email','note'].map(key => [key, $(`#${key}`).value])); }
function saveDraft() {
  try { localStorage.setItem(STORAGE, JSON.stringify({ explicit, details:details(), pending })); }
  catch { if (!storageWarning) announce('This browser cannot save your draft. Keep this tab open until you finish.'); storageWarning = true; }
}
function restoreDraft() {
  try {
    const raw = localStorage.getItem(STORAGE); if (!raw) return;
    const draft = JSON.parse(raw);
    explicit = Array.isArray(draft.explicit) ? [...new Set(draft.explicit.filter(id => catalog.some(item => item.id === id && item.category !== 'foundation')))] : [];
    resolveSelection(explicit, catalog);
    for (const [key, value] of Object.entries(draft.details || {})) if (['name','role','email','note'].includes(key) && typeof value === 'string') $(`#${key}`).value = value;
    if (draft.pending?.body && typeof draft.pending.token === 'string') pending = draft.pending;
    announce('Your saved draft has been restored.');
  } catch { announce('The saved draft could not be restored. A fresh selection is ready.'); explicit = []; pending = null; }
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
  if (!data || !Array.isArray(data.catalog) || data.catalog.length < 1 || typeof data.submissionToken !== 'string') return false;
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
    if (!validConfig(data)) throw new Error('The proposal configuration is incomplete. Please retry loading it.');
    catalog = data.catalog; token = data.submissionToken;
    restoreDraft(); renderModules(); update();
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
  for (const [category,title] of [['foundation','Required foundation · locked'],['launch','Selected launch modules'],['addition','Selected possible additions']]) {
    const group = node('div',undefined,'summary-group'); group.append(node('h3',title));
    const modules = summary.modules.filter(item => item.category === category);
    modules.forEach(item => { const line = node('div',undefined,'summary-item'); line.append(node('span',`${item.title}${item.provisional ? ' (provisional)' : ''}`), node('span',`${item.provisional ? 'From ' : ''}${money(item.price)}`)); group.append(line); });
    if (!modules.length) group.append(node('p','None selected','small'));
    container.append(group);
  }
  const total = node('div',undefined,'total-block'); total.append(node('p','One-time project total'),node('strong',money(summary.total)));
  if (summary.provisional) total.append(node('p','Includes a provisional accounting amount. Final scope and price are subject to review.','small'));
  container.append(total);
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
  if (pending) { update(); announce('A submission has an uncertain delivery status. Retry it from Review before changing this selection.'); return; }
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
$('#clear-draft').addEventListener('click', () => {
  const message = pending ? 'Delivery of your previous attempt is uncertain. Check with the project team before clearing it, as a new submission could duplicate one already received. Clear the draft and its retry information?' : 'This removes your optional selections and respondent details from this browser. The required foundation stays included.';
  ask(message, () => { pending = null; explicit = []; $('#submit-form').reset(); update(); announce('Draft cleared.'); },'Clear your draft?');
});
async function openReview() {
  summaryInto($('#review-summary'),calculate(explicit,catalog));
  $('#review-authority').textContent = 'Checking the selection with the server…'; $('#validation-summary').hidden = true; $('#submission-status').textContent = pending ? 'A previous attempt has uncertain delivery status. Retry the same submission safely.' : '';
  $('#respondent-fields').disabled = Boolean(pending); $('#submit-button').disabled = true;
  $('#review-dialog').showModal(); $('#review-title').focus();
  try {
    if (pending) { token = pending.token; $('#review-authority').textContent = 'The unchanged submission will be validated again by the server.'; }
    else {
      const result = await api('scope-config', { method:'POST', body:JSON.stringify({ selectedIds:explicit }) });
      if (!Number.isSafeInteger(result.total) || !Array.isArray(result.modules) || typeof result.submissionToken !== 'string') throw new Error('The review response could not be read. Close and reopen Review to retry.');
      token = result.submissionToken; summaryInto($('#review-summary'),result);
      $('#review-authority').textContent = 'Server-validated selection and provisional quotation total. Required dependencies are included.';
    }
    $('#submit-button').disabled = false;
  } catch(error) { $('#submission-status').textContent = error.message; if (error.code === 'SESSION_EXPIRED') expire(error.message); }
}
document.querySelectorAll('.review-button').forEach(button => button.addEventListener('click',openReview));
$('.close-dialog').addEventListener('click', () => { if (!busy) $('#review-dialog').close(); });
$('#review-dialog').addEventListener('cancel',event => { if (busy) event.preventDefault(); });
// Keep Tab within the dialog even when a browser would move focus to its chrome.
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('button,input,textarea,a[href],[tabindex]')].filter(element => !element.matches(':disabled') && element.tabIndex >= 0 && element.getClientRects().length && !element.closest('[aria-hidden="true"]'));
  const first = controls[0], last = controls.at(-1);
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
$('#submit-form').addEventListener('input',saveDraft);
function showValidation(fields) {
  const box = $('#validation-summary'); box.replaceChildren(node('p','Please check these details:'));
  const list = node('ul');
  for (const [key,message] of Object.entries(fields)) { const li = node('li'), link = node('a',message); link.href = `#${key}`; link.addEventListener('click',event => { event.preventDefault(); $(`#${key}`)?.focus(); }); li.append(link); list.append(li); $(`#${key}`)?.setAttribute('aria-invalid','true'); }
  box.append(list); box.hidden = false; box.focus();
}
function expire(message) { $('#review-dialog').close(); $('#proposal').hidden = true; $('#access').hidden = false; $('#access-status').textContent = message; $('#access-code').focus(); }
$('#submit-form').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  $('#validation-summary').hidden = true; document.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  const fields = {};
  if (!pending) for (const input of $('#respondent-fields').querySelectorAll('input,textarea')) if (!input.validity.valid || (input.required && input.type !== 'checkbox' && input.value.trim().length < (input.minLength > 0 ? input.minLength : 1))) fields[input.id] = input.type === 'checkbox' ? 'Confirm that this selection should be submitted for review.' : `Check ${input.labels[0].textContent.toLowerCase()}.`;
  if (Object.keys(fields).length) { showValidation(fields); return; }
  busy = true; $('#submit-button').disabled = true; $('#respondent-fields').disabled = true; $('.close-dialog').disabled = true; $('#submission-status').textContent = 'Submitting your selection for review…';
  try {
    if (!pending) {
      const prepared = await api('scope-config', { method:'POST', body:JSON.stringify({ selectedIds:explicit }) });
      if (typeof prepared.submissionToken !== 'string') throw new Error('The submission could not be prepared. Please retry.');
      pending = { token:prepared.submissionToken, body:{ selectedIds:explicit, ...details(), confirm:$('#confirm').checked, website:$('#website').value } };
      saveDraft();
    }
    const result = await api('submit-scope',{ method:'POST', headers:{ 'X-Submission-Token':pending.token }, body:JSON.stringify(pending.body) });
    if (typeof result.reference !== 'string' || !Array.isArray(result.modules) || !Number.isSafeInteger(result.total)) throw new Error('The submission response could not be confirmed. Retry the unchanged selection.');
    pending = null; try { localStorage.removeItem(STORAGE); } catch { announce('Submitted successfully, but browser storage could not be cleared.'); }
    $('#review-dialog').close(); $('#proposal').hidden = true; $('#success').hidden = false;
    const receipt = $('#receipt'); receipt.replaceChildren(node('p',`Reference: ${result.reference}`),node('p',`Recorded (UTC): ${result.timestamp}`),node('p',`${result.respondent.name} · ${result.respondent.role} · ${result.respondent.email}`));
    const selection = node('div'); summaryInto(selection,result); receipt.append(selection);
    if (result.respondent.note) receipt.append(node('p',`Your note: ${result.respondent.note}`));
    receipt.append(node('p',result.confirmationSent ? 'A confirmation email has been accepted for delivery to your email address.' : 'Your selection was received, but your confirmation email could not be sent. Please keep this reference.','small')); $('#success-title').focus();
  } catch(error) {
    $('#submission-status').textContent = error.message;
    if (['VALIDATION_ERROR','EMAIL_NOT_CONFIGURED'].includes(error.code)) { pending = null; $('#respondent-fields').disabled = false; saveDraft(); }
    if (error.fields) showValidation(error.fields);
    if (error.code === 'SESSION_EXPIRED') expire(error.message);
  } finally { if (!pending) $('#respondent-fields').disabled = false; busy = false; $('#submit-button').disabled = false; $('.close-dialog').disabled = false; }
});
$('#print').addEventListener('click',() => window.print());
loadConfig(true);
