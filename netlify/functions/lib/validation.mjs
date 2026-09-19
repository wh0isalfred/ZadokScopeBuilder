import { HttpError } from './responses.mjs';
import { resolveSelection } from './dependencies.mjs';
export function validateSelection(data, catalog) {
  if (data.website !== '' && data.website !== undefined) throw new HttpError(422, 'INVALID_SELECTION', 'The selection could not be validated.');
  try {
    if (!Array.isArray(data.selectedIds) || data.selectedIds.length > 50 || data.selectedIds.some(id => typeof id !== 'string')) throw new Error();
    resolveSelection(data.selectedIds, catalog);
    return [...new Set(data.selectedIds)];
  } catch { throw new HttpError(422, 'INVALID_SELECTION', 'The selection contains an unknown or invalid module. Reload the proposal.'); }
}
