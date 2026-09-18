import { createHash } from 'node:crypto';
import { endpoint, json, method, origin, body, HttpError } from './lib/responses.mjs';
import { readSession, verify } from './lib/session.mjs';
import { catalog } from './lib/catalog.mjs';
import { calculate } from './lib/dependencies.mjs';
import { validateSubmission, escapeHtml } from './lib/validation.mjs';
export function emailContent(summary) {
  const money = amount => new Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN', maximumFractionDigits:0 }).format(amount);
  const lines = ['Zadok Farm project scope', `Reference: ${summary.reference}`, `Submitted (UTC): ${summary.timestamp}`, `Name: ${summary.respondent.name}`, `Role: ${summary.respondent.role}`, `Email: ${summary.respondent.email}`];
  for (const [category, title] of [['foundation','Required foundation'],['launch','Selected launch modules'],['addition','Selected possible additions']]) {
    lines.push('', title);
    const modules = summary.modules.filter(item => item.category === category);
    lines.push(...(modules.length ? modules.map(item => `${item.title}: ${item.provisional ? 'From ' : ''}${money(item.price)}${item.provisional ? ' (provisional)' : ''}`) : ['None selected']));
  }
  lines.push('', `Validated project total: ${money(summary.total)}${summary.provisional ? ' (includes provisional accounting amount)' : ''}`, 'Dependencies are included in this selection.', `Note: ${summary.respondent.note || 'No note provided.'}`, '', 'Submitting this selection does not initiate payment. It will be reviewed before the final quotation, agreement and invoice are issued. This is not proof of payment.');
  return { text: lines.join('\n'), html: `<html><body><h1>Zadok Farm project scope</h1>${lines.slice(1).map(line => `<p>${escapeHtml(line)}</p>`).join('')}</body></html>` };
}
async function send(payload, key) {
  const response = await fetch('https://api.resend.com/emails', { method:'POST', headers:{ Authorization:`Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type':'application/json', 'Idempotency-Key':key }, body:JSON.stringify(payload), signal:AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Email provider unavailable.');
}
export default endpoint(async request => {
  method(request, 'POST'); origin(request);
  if (!readSession(request)) throw new HttpError(401, 'SESSION_EXPIRED', 'Your session expired. Unlock the proposal again; your draft is preserved.');
  const data = await body(request);
  const token = verify(request.headers.get('x-submission-token'), 'submission');
  if (!token) throw new HttpError(409, 'RETRY_EXPIRED', 'The review window expired. If a prior attempt was uncertain, check with the project team before starting a new submission.');
  const validated = validateSubmission(data, catalog);
  const summary = { ...calculate(validated.selectedIds, catalog), respondent:validated.respondent, reference:token.reference, timestamp:new Date(token.iat).toISOString() };
  const content = emailContent(summary);
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || !process.env.QUOTE_RECIPIENT_EMAIL) throw new HttpError(503, 'EMAIL_NOT_CONFIGURED', 'Email delivery has not been configured. Your draft is preserved.');
  // Stable payload and key let the provider deduplicate uncertain retries within its 24-hour window.
  const digest = createHash('sha256').update(JSON.stringify(validated)).digest('hex');
  const base = { from:process.env.RESEND_FROM_EMAIL, subject:`Zadok Farm scope · ${summary.reference}`, ...content };
  try { await send({ ...base, to:[process.env.QUOTE_RECIPIENT_EMAIL], ...(process.env.QUOTE_CC_EMAIL ? { cc:[process.env.QUOTE_CC_EMAIL] } : {}) }, `${token.reference}-${digest}-internal`); }
  catch { throw new HttpError(502, 'EMAIL_PROVIDER_ERROR', 'Delivery could not be confirmed. Keep this selection unchanged and retry safely.'); }
  let confirmationSent = true;
  try { await send({ ...base, to:[validated.respondent.email] }, `${token.reference}-${digest}-respondent`); }
  catch { confirmationSent = false; }
  return json({ ...summary, confirmationSent });
});
