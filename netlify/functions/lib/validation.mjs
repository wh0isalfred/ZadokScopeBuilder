import { HttpError } from './responses.mjs';
import { resolveSelection } from './dependencies.mjs';
export function validateSubmission(data, catalog) {
  const fields = {};
  const respondent = {};
  for (const [key, label, min, max] of [['name','Full name',2,120],['role','Role or relationship',2,120],['email','Email',3,254],['note','Note',0,2000]]) {
    const value = typeof data[key] === 'string' ? data[key].trim() : '';
    if (value.length < min || value.length > max || /[\u0000-\u0008\u000b-\u001f\u007f]/.test(value)) fields[key] = `${label} must contain ${min}–${max} characters.`;
    respondent[key] = value;
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(respondent.email)) fields.email = 'Enter a valid email address.';
  if (data.confirm !== true) fields.confirm = 'Confirm that this selection should be submitted for review.';
  if (data.website !== '' && data.website !== undefined) fields.website = 'The submission could not be accepted.';
  let ids = [];
  try {
    if (!Array.isArray(data.selectedIds) || data.selectedIds.length > 50 || data.selectedIds.some(id => typeof id !== 'string')) throw new Error();
    ids = resolveSelection(data.selectedIds, catalog);
  } catch { fields.selectedIds = 'The selection contains an unknown or invalid module. Reload the proposal.'; }
  if (Object.keys(fields).length) throw new HttpError(422, 'VALIDATION_ERROR', 'Please correct the highlighted details.', fields);
  return { respondent, selectedIds: ids };
}
export function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
