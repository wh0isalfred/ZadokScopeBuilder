# Zadok Farm scope builder

A private, lightweight scope-selection tool. The complete journey is **Select scope → Review quotation → Share quotation**. Nothing is communicated to Alfred from the website. The user decides whether to share the prepared PDF through WhatsApp.

## Architecture

Semantic HTML, modern CSS and vanilla JavaScript with Node ES module Netlify Functions. No database, mail provider, paid messaging API or custom domain is required. `pdf-lib` is a free open-source runtime dependency for selectable-text PDF generation; it does not capture screenshots. No frontend framework or PDF rendering library is shipped to the browser.

- `index.html`, `styles.css`, `app.js`: builder, full review view, PDF preview and user-controlled sharing.
- `netlify/functions/auth.mjs`: access-code authentication and four-hour signed session cookie.
- `netlify/functions/scope-config.mjs`: authenticated display catalogue.
- `netlify/functions/quotation.mjs`: one validation step returning an authoritative quotation and signed PDF authorization.
- `netlify/functions/quotation-pdf.mjs`: creates the PDF from the signed quotation; accepts no trusted browser prices.
- `netlify/functions/lib/catalog.mjs`: sole trusted catalogue, prices and dependencies.
- `netlify/functions/lib/quotation.mjs`: reference, dates, automatic dependency attribution, exclusions, message and integrity digest.
- `netlify/functions/lib/quote-document.mjs`: branded A4 PDF layout, wrapping, pagination and selectable text.
- Other `lib/` files: sessions, validation, responses and shared dependency exports.
- `shared/dependencies.mjs`: pure catalogue-parameterised calculations, resolution and removal impacts.
- `scripts/build.mjs`: explicit public-file allowlist into `dist`.
- `tests/`: Vitest suites, browser checks, live Function checks and PDF layout fixtures.
- `netlify.toml`, `robots.txt`, `.env.example`, `.gitignore`: hosting/privacy configuration.

Source stays at repository root; only `dist` is published so server files and trusted pricing cannot be downloaded as static assets. `submit-scope.mjs` was removed: there is no submission endpoint or second confirmation form.

## Setup (PowerShell)

Use a supported Node LTS release (Node 22 recommended) and npm. Microsoft Edge is used by optional browser tests.

```powershell
npm install
Copy-Item .env.example .env
# Configure the four variables below.
npm run build
npx netlify dev
```

Normal URL: http://localhost:8888. Re-run `npm run build` after editing public files. Function edits reload automatically. If a Windows npm shim fails, use `npm.cmd` or the npm CLI through Node. The test script invokes Vitest through Node to avoid a missing Windows `.cmd` shim.

If the CLI stalls downloading its unused Edge/Deno environment, the tested local fallback is `npx netlify dev --offline --internal-disable-edge-functions`. That internal option may change in future CLI versions; this app uses only Node Functions.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SCOPE_ACCESS_CODE` | Strong, privately distributed management access code. |
| `SCOPE_SESSION_SECRET` | Random secret of at least 32 characters. |
| `SITE_ORIGIN` | Exact localhost origin for development or `https://YOUR-SITE.netlify.app` in production. |
| `WHATSAPP_RECIPIENT_NUMBER` | Alfred's actual international number, digits only, without a plus sign, spaces or punctuation. |

The recipient validator accepts 8–15 digits starting with 1–9. Confirm the actual number with Alfred. Generate a random secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never commit `.env`. Secure cookies require HTTPS in production; modern Chromium browsers support them on localhost for testing.

## Pricing sections and recurring partnership

The builder, quotation review and PDF use this order: **Website Foundation ? Core Operational Features ? Ongoing Website Care & Improvement ? Optional Advancements ? Quotation Summary**. The full Quotation Summary follows the feature sections; the compact mobile bar remains a one-time fee preview.

Ongoing Website Care & Improvement is a standing recurring service in the proposal, **NGN 28,000/month**, with billing beginning **30 days after launch**. Its exact description, 12 inclusions, scope limits and domain-cost clarification are defined once in the `ongoingCare` export in `lib/catalog.mjs`. It is returned only after authentication and included in the signed quotation as `recurringService`.

This service is outside the one-time module catalogue. It does not change `total`, module dependency calculations or selectable module IDs. Quotation Summary separately shows the one-time project fee and the monthly amount. It does not project a start date because the launch date is not yet known. No subscription billing is initiated by this website.

Minor improvements to existing functionality are included. New modules, major features, redesigns and substantial content work require separate scope and approval before work begins. Domain administration/renewal management is included, while domain registration and renewal charges are payable by Zadok Farm at actual cost. This describes care for the planned Zadok platform; the scope builder itself still needs no custom domain or paid hosting add-on.

Changes to recurring-service terms invalidate an already prepared quotation token's integrity check, requiring a fresh review. Update recurring amounts only in the server-owned `ongoingCare` object. The pre-existing foundation price of NGN 112,000 is retained.

## Journey and state

1. **Select scope:** Review selected scope sends only selected IDs to the quotation Function. It rejects unknown IDs, enforces dependencies and calculates integer-naira totals. Extra browser prices, module objects, totals and dependency results are ignored.
2. **Review quotation:** one authoritative view displays descriptions, prices, automatic dependencies, exclusions, reference, generation time, validity and scope notes. Back to edit invalidates the prepared PDF. The draft remains available: reviewing or sharing does not clear it or imply delivery.
3. **Share quotation:** the server generates the PDF while the review is open. A loading state disables PDF actions until the browser has created a `File` with MIME type `application/pdf`. The user can preview, download or share it.

Internal UI states are `editing`, `validating`, `review_ready`, `generating_pdf`, and `share_opened`. Errors and cancellation return to an actionable review or editing state. No state claims recipient delivery.

PDF generation uses a signed token containing original explicit IDs, reference, generation time and a digest of the entire authoritative quotation. The Function reconstructs it from the server catalogue and compares the digest. Changed catalogue/recipient settings, tampering or expired authorization require a new review. Browser calculations never become the PDF's source of truth. Session authentication and Origin checks apply to both preparation endpoints.

Quote validity is **30 days**, controlled by `QUOTE_VALIDITY_DAYS` in `lib/quotation.mjs`. The PDF preparation token lasts four hours, separately from quote validity. After that period, review again to prepare a new PDF. No quotation archive is stored.

## PDF and sharing

The A4 PDF includes Zadok branding, Project Scope Selection, reference, UTC generation date, validity, selected descriptions/inclusions/prices, automatic dependencies, exclusions, final total and the written-agreement acknowledgement. It uses native text, restrained Helvetica typography, page numbers and green accents. Currency is labelled `NGN` in the PDF for reliable standard-font rendering. This is Nigerian naira, matching the browser totals.

Filename: `Zadok-Farm-Project-Scope-{{QUOTE_REFERENCE}}.pdf`.

The file is prepared before the Share button is enabled so that `navigator.share()` can run directly within the user's click activation. Both `navigator.share` and `navigator.canShare({files})` are checked. A supporting device opens its own share sheet; the user chooses WhatsApp. The native sheet cannot be forced to a specific app or contact. The configured recipient is used by the fallback's Open WhatsApp link.

When file sharing is unavailable, the same PDF is downloaded and the user is instructed to open WhatsApp and attach it manually. A separate Download PDF action always remains available once generation finishes. Cancelled native sharing is acknowledged as cancellation, not delivery. Other native errors expose a manual download fallback. Resolving the native share promise does not prove delivery.

The exact short message is:

> Good evening Alfred. I’ve reviewed the proposed Zadok Farm website scope and selected the features we want to proceed with. I’ve attached the generated quotation for your review.
>
> Reference: {{QUOTE_REFERENCE}}

The fallback message does not attach the file automatically. The user must attach it. The website never opens WhatsApp or sends anything without the user's action. See [Web Share API requirements](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) for browser support and activation constraints.

## Tests and PDF inspection

```powershell
npm test
# With local Netlify Dev running:
node tests/local-functions.mjs
npm run test:browser
node tests/pdf-fixtures.mjs
```

For isolated local tests use code `local-test-code`, a temporary session secret, the matching localhost origin and recipient fixture `2348000000000`. This number is only a format fixture; tests never contact it. `TEST_BASE_URL` optionally overrides the default test origin. Native-share behaviour is simulated in browser tests; real OS sheets and WhatsApp delivery are not automated.

`tests/pdf-fixtures.mjs` generates foundation-only, dependency and full-selection PDF fixtures under ignored `artifacts/pdf-qa`. PDF visual QA uses a local renderer (PyMuPDF in this environment) to inspect every page and extract selectable text; it is not an application dependency. See `VERIFICATION.md` for recorded results. Browser preview uses the browser's own PDF viewer; if unavailable, Download PDF remains available.

## Free Netlify deployment

Deployment remains manual and requires explicit owner authorization. Choose the Free plan and supplied `YOUR-SITE.netlify.app` address, keep paid add-ons disabled, and configure the four environment variables in the production Function context. The build command, `dist` publish directory, Functions and redirects are already in `netlify.toml`. No custom domain is needed. Free plans have usage limits; consult [Netlify pricing](https://www.netlify.com/pricing/) and its [default domain documentation](https://docs.netlify.com/manage/domains/domains-fundamentals/understand-domains/).

CSP allows same-origin scripts and connections and a blob frame for PDF preview. Permissions Policy explicitly allows same-origin Web Share; production HTTPS is required for device sharing support. No deployment was performed during this revision.

## Catalogue maintenance

Edit prices only in `lib/catalog.mjs`, using integer naira. The accounting module remains provisional with its starting amount. New modules need stable IDs, categories, prices, value statements, inclusions, warnings and dependency IDs. Keep exactly one foundation and no cycles. Update pricing tests and increment the catalogue/storage version for incompatible changes.

Basket requires catalogue; records require basket and staff; inventory requires catalogue and staff; training/enquiries require staff; overview requires records. Delivery requires basket; payments/accounts/outreach require records; certificates require training. AI has no forced business module beyond foundation. Removing a needed dependency requires confirmation of affected modules; unused automatic dependencies disappear when no longer required.

## Security and handover

Signed HMAC sessions use HttpOnly, Secure, SameSite=Strict cookies, safe comparisons and expiry. Functions check authentication, origin, JSON size and module IDs. No access code or session secret is shipped to the browser. No private payload is logged. Security headers include CSP, frame protection, no-sniff, referrer and permissions restrictions. Noindex directives are not authentication.

This is shared-code access, not individual identity management. There is no database, distributed rate limiter, submission ledger or delivery tracking. Authenticated users necessarily see prices. Downloaded PDFs and WhatsApp content can be edited by their holder; final written agreement is still required. Signed PDF preparation does not make a downloaded document a digitally signed legal instrument.

The local draft stores selected IDs only, never authentication data or independent totals. Legacy respondent details are ignored and removed by the next draft save. A failed validation/generation does not erase the selection. Save the PDF before closing the page if needed.

Hand over repository and Netlify ownership, the actual recipient number, access-code distribution and secret rotation procedures. Confirm quote validity and catalogue wording with management. Manually verify file sharing on the intended mobile device after deployment without claiming delivery from the website.

## Troubleshooting

- Access failure: check code, secret length, exact origin and environment context.
- Old screen: rebuild `dist` and reload.
- PDF preparation expired or catalogue changed: Back to edit, then Review selected scope.
- Generation fails: Retry PDF generation; the draft remains intact.
- Native share cancelled: use Share quotation again or Download PDF.
- File sharing blocked/unsupported: download and attach the PDF manually through Open WhatsApp.
- PDF preview unavailable: use Download PDF and a local PDF viewer.
- WhatsApp recipient error: correct the digits-only environment value, then restart/redeploy Functions.
- Missing saved quotation: no server archive exists; re-review the scope to generate a new reference and PDF.
