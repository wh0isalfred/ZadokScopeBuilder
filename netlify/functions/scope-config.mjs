import { endpoint, json, method, HttpError } from './lib/responses.mjs';
import { readSession } from './lib/session.mjs';
import { catalog, catalogVersion } from './lib/catalog.mjs';
export default endpoint(async request => {
  method(request, 'GET');
  if (!readSession(request)) throw new HttpError(401, 'SESSION_EXPIRED', 'Please enter your access code to continue. Your draft is preserved.');
  return json({ catalog, version: catalogVersion });
});
