import { endpoint, method, origin, body, HttpError } from './lib/responses.mjs';
import { readSession, verify, safeEqual } from './lib/session.mjs';
import { createQuotation, quoteDigest } from './lib/quotation.mjs';
import { generatePdf } from './lib/quote-document.mjs';
export default endpoint(async request => {
  method(request, 'POST'); origin(request);
  if (!readSession(request)) throw new HttpError(401, 'SESSION_EXPIRED', 'Your session expired. Return to edit and unlock the proposal again.');
  const data = await body(request), token = verify(data.pdfToken, 'quotation');
  if (!token) throw new HttpError(409, 'QUOTE_EXPIRED', 'This quotation preparation window expired. Return to edit and review the scope again.');
  const quote = createQuotation(token.selectedIds, process.env.WHATSAPP_RECIPIENT_NUMBER, token.iat, token.reference);
  if (!safeEqual(quoteDigest(quote), token.digest)) throw new HttpError(409, 'QUOTE_CHANGED', 'The catalogue changed. Return to edit and review the updated scope before sharing.');
  const bytes = await generatePdf(quote);
  return new Response(bytes, { headers:{ 'Content-Type':'application/pdf', 'Content-Disposition':`attachment; filename="${quote.filename}"`, 'Cache-Control':'no-store', 'X-Robots-Tag':'noindex, nofollow' } });
});
