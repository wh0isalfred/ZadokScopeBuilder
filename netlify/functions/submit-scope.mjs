import { randomBytes } from 'node:crypto';
import { endpoint, json, method, origin, body, HttpError } from './lib/responses.mjs';
import { readSession } from './lib/session.mjs';
import { catalog } from './lib/catalog.mjs';
import { calculate } from './lib/dependencies.mjs';
import { validateSubmission } from './lib/validation.mjs';
export const QUOTE_VALIDITY_DAYS = 30;
export function createQuotation(validated, recipient, now = Date.now()) {
  if (!/^[1-9]\d{7,14}$/.test(recipient || '')) throw new HttpError(503, 'WHATSAPP_NOT_CONFIGURED', 'The WhatsApp recipient is not configured correctly. Your draft is preserved.');
  const selection = calculate(validated.selectedIds, catalog);
  const timestamp = new Date(now).toISOString();
  const reference = `ZF-${timestamp.slice(0,10).replaceAll('-', '')}-${randomBytes(8).toString('hex').toUpperCase()}`;
  const summary = {
    ...selection, respondent: validated.respondent, reference, timestamp,
    unselectedModules: catalog.filter(item => item.category !== 'foundation' && !selection.selectedIds.includes(item.id)),
    validityDays: QUOTE_VALIDITY_DAYS,
    validUntil: new Date(now + QUOTE_VALIDITY_DAYS * 86400000).toISOString(),
  };
  const money = amount => new Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN', maximumFractionDigits:0 }).format(amount);
  const message = [
    'Zadok Farm project scope selection', `Quote reference: ${reference}`, `Submitted (UTC): ${timestamp}`, '',
    ...summary.modules.map(item => `${item.title}: ${item.provisional ? 'From ' : ''}${money(item.price)}${item.provisional ? ' (provisional)' : ''}`), '',
    `Total project fee: ${money(summary.total)}${summary.provisional ? ' (includes provisional accounting amount)' : ''}`,
    `Quote valid for ${summary.validityDays} days, until ${summary.validUntil}.`,
    'I acknowledge that this scope is subject to final written agreement.',
  ].join('\n');
  return { ...summary, whatsapp: { message, url:`https://wa.me/${recipient}?text=${encodeURIComponent(message)}` } };
}
export default endpoint(async request => {
  method(request, 'POST'); origin(request);
  if (!readSession(request)) throw new HttpError(401, 'SESSION_EXPIRED', 'Your session expired. Unlock the proposal again; your draft is preserved.');
  const validated = validateSubmission(await body(request), catalog);
  return json(createQuotation(validated, process.env.WHATSAPP_RECIPIENT_NUMBER));
});
