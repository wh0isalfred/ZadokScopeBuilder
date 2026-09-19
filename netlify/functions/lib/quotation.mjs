import { randomBytes, createHash } from 'node:crypto';
import { catalog } from './catalog.mjs';
import { calculate } from './dependencies.mjs';
import { HttpError } from './responses.mjs';
export const QUOTE_VALIDITY_DAYS = 30;
export function createQuotation(selectedIds, recipient, now = Date.now(), reference) {
  if (!/^[1-9]\d{7,14}$/.test(recipient || '')) throw new HttpError(503, 'WHATSAPP_NOT_CONFIGURED', 'The WhatsApp recipient is not configured correctly. Your draft is preserved.');
  const selection = calculate(selectedIds, catalog);
  const timestamp = new Date(now).toISOString();
  reference ||= `ZF-${timestamp.slice(0,10).replaceAll('-', '')}-${randomBytes(8).toString('hex').toUpperCase()}`;
  const automaticIds = selection.selectedIds.filter(id => !selectedIds.includes(id) && id !== 'foundation');
  const message = `Good evening Alfred. I\u2019ve reviewed the proposed Zadok Farm website scope and selected the features we want to proceed with. I\u2019ve attached the generated quotation for your review.\n\nReference: ${reference}`;
  return { ...selection, reference, timestamp, automaticIds,
    unselectedModules: catalog.filter(item => item.category !== 'foundation' && !selection.selectedIds.includes(item.id)),
    validityDays: QUOTE_VALIDITY_DAYS, validUntil: new Date(now + QUOTE_VALIDITY_DAYS * 86400000).toISOString(),
    acknowledgement: 'Project commencement remains subject to final written agreement.',
    whatsapp: { message, url: `https://wa.me/${recipient}?text=${encodeURIComponent(message)}` },
    filename: `Zadok-Farm-Project-Scope-${reference}.pdf`,
  };
}
export function quoteDigest(quote) { return createHash('sha256').update(JSON.stringify(quote)).digest('hex'); }
