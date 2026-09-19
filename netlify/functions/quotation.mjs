import { endpoint, json, method, origin, body, HttpError } from './lib/responses.mjs';
import { readSession, sign, SESSION_SECONDS } from './lib/session.mjs';
import { catalog } from './lib/catalog.mjs';
import { validateSelection } from './lib/validation.mjs';
import { createQuotation, quoteDigest } from './lib/quotation.mjs';
export default endpoint(async request => {
  method(request, 'POST'); origin(request);
  if (!readSession(request)) throw new HttpError(401, 'SESSION_EXPIRED', 'Your session expired. Unlock the proposal again; your draft is preserved.');
  const selectedIds = validateSelection(await body(request), catalog);
  const now = Date.now();
  const quote = createQuotation(selectedIds, process.env.WHATSAPP_RECIPIENT_NUMBER, now);
  return json({ ...quote, pdfToken: sign({ kind:'quotation', iat:now, exp:now + SESSION_SECONDS * 1000, selectedIds, reference:quote.reference, digest:quoteDigest(quote) }) });
});
