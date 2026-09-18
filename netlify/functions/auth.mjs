import { endpoint, json, method, origin, body, HttpError } from './lib/responses.mjs';
import { safeEqual, issueSession, cookie } from './lib/session.mjs';
export default endpoint(async request => {
  method(request, 'POST'); origin(request);
  const data = await body(request);
  if (!process.env.SCOPE_ACCESS_CODE) throw new Error('Missing access configuration.');
  if (typeof data.code !== 'string' || data.code.length > 256 || !safeEqual(data.code, process.env.SCOPE_ACCESS_CODE)) throw new HttpError(401, 'INVALID_CODE', 'The access code is incorrect. Please try again.');
  return json({ ok: true }, 200, { 'Set-Cookie': cookie(issueSession()) });
});
