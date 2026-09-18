export class HttpError extends Error {
  constructor(status, code, message, fields) { super(message); Object.assign(this, { status, code, fields }); }
}
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', ...headers } });
}
export function endpoint(handler) {
  return async request => {
    try { return await handler(request); }
    catch (error) { return json({ error: { code: error.code || 'SERVER_ERROR', message: error.status ? error.message : 'The service is unavailable. Please try again later.', ...(error.fields ? { fields: error.fields } : {}) } }, error.status || 503); }
  };
}
export function method(request, expected) { if (request.method !== expected) throw new HttpError(405, 'METHOD_NOT_ALLOWED', `Use ${expected} for this request.`); }
export function origin(request) {
  const expected = process.env.SITE_ORIGIN;
  if (!expected || request.headers.get('origin') !== new URL(expected).origin) throw new HttpError(403, 'INVALID_ORIGIN', 'This request did not originate from the proposal site.');
}
export async function body(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new HttpError(415, 'CONTENT_TYPE', 'Send a JSON request.');
  const text = await request.text();
  if (text.length > 16000) throw new HttpError(413, 'TOO_LARGE', 'This request is too large.');
  try { const data = JSON.parse(text); if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error(); return data; }
  catch { throw new HttpError(400, 'INVALID_JSON', 'The request could not be read.'); }
}
