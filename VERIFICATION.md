# Verification: recurring care and reordered pricing

Verified 19 September 2026. No commit, push, deployment or WhatsApp message was performed during this revision.

## Current results

- **45 automated tests passed across 5 files:** pricing 8, dependencies 7, selection validation 6, session security 8, quotation/PDF endpoints 16.
- **25 browser checks passed:** the existing selection/review/PDF/share flow plus exact five-section order, all 12 care inclusions, billing/domain clarifications, unchanged one-time foundation price, and separate monthly care in the review summary.
- All five requested widths (360, 390, 768, 1024 and 1440px) passed overflow checks in editing and review views.
- Real local Netlify Functions returned the authoritative quotation and generated a signed PDF without outbound sharing.
- Public asset build succeeded.

## Pricing boundaries

The repository already had a foundation price of **NGN 112,000** before this revision; that price is retained. Earlier test expectations still used the former foundation amount and were corrected to match the existing catalogue. Current tested one-time totals include 112,000 for foundation alone, 207,000 for basket with its required catalogue, 252,000 for training/staff/accounting, and 722,000 for all modules.

Ongoing Website Care & Improvement is **NGN 28,000/month**, separate from every one-time total, beginning 30 days after launch. It is not a selectable one-time module or an unselected optional feature. Tests reject browser attempts to override recurring price and require a fresh review if recurring terms change after token creation.

## PDF verification

Foundation-only: 3 pages. Dependency/provisional example: 3 pages. Full selection: 5 pages. All fixtures passed A4 dimensions, selectable-text extraction and page-bound checks. Text checks verify exact section order, monthly amount, billing start, technical-partnership description, scope limits, domain actual-cost clarification and unchanged one-time fees.

Care and quotation-summary pages were rendered and visually inspected for clarity and separation of charges. The mobile care section was also inspected. Artifacts remain under ignored `artifacts/`, including `care-*.png`, `review-*.png`, `generated-quotation.pdf`, and `pdf-qa/`.

## Local environment and limitations

Verification used **http://localhost:8890**, with isolated static/Function ports 4002/9997 and temporary test credentials. Normal project configuration remains localhost:8888. Native sharing is simulated in the browser suite; actual device share-sheet behaviour and WhatsApp delivery remain manual checks. No delivery claim is made by the app.

No production deployment or subscription billing is performed. The four existing environment variables remain sufficient. The PDF continues to use selectable standard-font text and ISO `NGN` currency notation. The monthly billing start is relative to launch, not a fabricated calendar date.

The previous production audit reported 0 vulnerabilities; the known 56 development-tool findings remain documented from earlier verification. No dependencies changed in this revision and the audit was not rerun.
