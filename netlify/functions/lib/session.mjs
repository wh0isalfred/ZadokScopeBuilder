import { createHmac, timingSafeEqual, createHash, randomBytes } from 'node:crypto';
export const SESSION_SECONDS = 14400;
function secret() {
  const value = process.env.SCOPE_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('Session configuration unavailable.');
  return value;
}
export function safeEqual(a, b) {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}
export function sign(data) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('base64url')}`;
}
export function verify(token, kind, now = Date.now()) {
  try {
    if (typeof token !== 'string' || token.length > 2048) return null;
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra || !safeEqual(signature, createHmac('sha256', secret()).update(payload).digest('base64url'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.kind === kind && Number.isFinite(data.exp) && data.exp > now && data.iat <= now ? data : null;
  } catch { return null; }
}
export function issueSession(now = Date.now()) {
  return sign({ kind: 'session', iat: now, exp: now + SESSION_SECONDS * 1000, nonce: randomBytes(16).toString('hex') });
}
export function readSession(request) {
  const cookies = (request.headers.get('cookie') || '').split(';').map(x => x.trim()).filter(x => x.startsWith('zadok_session='));
  return cookies.length === 1 ? verify(cookies[0].slice(14), 'session') : null;
}
export function cookie(token) { return `zadok_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`; }
