import { endpoint, json, method, origin, body, HttpError } from './lib/responses.mjs';
import { readSession } from './lib/session.mjs';
import { catalog, catalogVersion } from './lib/catalog.mjs';
import { calculate } from './lib/dependencies.mjs';
export default endpoint(async request => {
  if (!['GET','POST'].includes(request.method)) method(request,'GET');
  if (!readSession(request)) throw new HttpError(401, 'SESSION_EXPIRED', 'Please enter your access code to continue. Your draft is preserved.');
  if (request.method === 'POST') {
    origin(request); const data = await body(request);
    try { return json({ ...calculate(data.selectedIds,catalog) }); }
    catch { throw new HttpError(422,'INVALID_SELECTION','The selection contains an invalid module. Reload the proposal.'); }
  }
  return json({ catalog, version: catalogVersion });
});
