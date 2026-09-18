# Zadok Farm project scope builder

A private scope-selection and quotation tool for Zadok Farm management. Select capabilities, validate the selection on the server, print a quotation and manually share it via WhatsApp. It is not a payment flow or binding agreement.

## Architecture and files

- `index.html`, `styles.css`, `app.js`: semantic vanilla interface, native checkboxes/disclosures, accessible modal review, local draft and professional print quotation.
- `netlify/functions/auth.mjs`: access-code verification and signed four-hour session cookie.
- `netlify/functions/scope-config.mjs`: authenticated catalogue GET and authoritative review POST.
- `netlify/functions/submit-scope.mjs`: validates submitted IDs and respondent details; resolves dependencies; recalculates integer-naira prices; generates the quotation and WhatsApp message entirely from trusted values. Makes no outbound network request.
- `netlify/functions/lib/catalog.mjs`: sole authoritative catalogue and prices.
- `netlify/functions/lib/{session,validation,responses,dependencies}.mjs`: server helpers.
- `shared/dependencies.mjs`: pure resolution, calculation and removal functions; contains no trusted catalogue or prices.
- `scripts/build.mjs`: explicit allowlist of public files copied into `dist/`.
- `tests/*.test.mjs`: automated unit and Function tests.
- `tests/browser.mjs`, `tests/local-functions.mjs`: local browser and actual Function checks.
- `netlify.toml`, `robots.txt`, `.env.example`, `.gitignore`, `package.json`, `package-lock.json`, `vitest.config.mjs`: configuration and tooling.

The repository root contains source; Netlify publishes only `dist`. Publishing the source root would risk exposing the private catalogue and development files. The shared dependency module avoids duplicated business rules. No application framework, database, mail service, paid API or PDF library is required. Vitest uses Vite internally as a test dependency; the application does not use Vite.

## Local setup (PowerShell)

Use a supported Node LTS release (Node 22 recommended), npm and Microsoft Edge for the browser tests.

```powershell
cd C:\Users\USER\Dev\Web\Zadok\ZadokScopeBuilder
npm install
Copy-Item .env.example .env
# Fill in all four variables in .env.
npm run build
npx netlify dev
```

Open http://localhost:8888. Re-run `npm run build` after public source changes. Function source changes reload automatically. Secure cookies work on modern browsers' trusted localhost exception; use HTTPS in production, not a plain-HTTP LAN hostname.

If the Windows extensionless npm shim fails, use `npm.cmd` or this machine's `node C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js` workaround.

This CLI version may stall preparing its unused Deno runtime locally. This app uses Node Functions only. The tested local fallback is:

```powershell
npx netlify dev --offline --internal-disable-edge-functions
```

That internal CLI option may change between versions.

## Required environment variables

Exactly four variables are used:

| Variable | Value |
| --- | --- |
| `SCOPE_ACCESS_CODE` | Strong code privately shared with management. |
| `SCOPE_SESSION_SECRET` | Random secret of at least 32 characters. |
| `SITE_ORIGIN` | `http://localhost:8888` locally; `https://YOUR-SITE.netlify.app` in production, without a path. |
| `WHATSAPP_RECIPIENT_NUMBER` | Actual recipient in international format: digits only, country code first, no plus sign, spaces or punctuation. |

The recipient validator accepts 8–15 digits beginning with 1–9. A syntactically valid number must still belong to the intended WhatsApp recipient. Configure the real number before sharing the app. No recipient is accepted from browser input.

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Do not commit `.env`. Rotating the session secret invalidates existing sessions.

## Submission, quotation and WhatsApp

The browser sends selected module IDs, respondent details, review confirmation and the honeypot field. It sends no trusted prices. Unknown IDs are rejected, duplicates are deduplicated, required dependencies and foundation are included, and browser-supplied totals, module objects, validity and recipients are ignored.

The Function returns:

- `reference`: collision-resistant `ZF-YYYYMMDD-<16 hex characters>` quote reference;
- `timestamp`: UTC submission time;
- `selectedIds`, `modules`: canonical selection including dependencies and individual trusted prices;
- `unselectedModules`: all unselected elective launch modules and possible additions, excluding the required foundation;
- `total`, `provisional`: integer-naira project fee and provisional-accounting indicator;
- `validityDays`, `validUntil`: **30 days**, configured by `QUOTE_VALIDITY_DAYS` in `submit-scope.mjs`;
- `respondent`: validated respondent details;
- `whatsapp.message`, `whatsapp.url`: server-generated text and encoded `https://wa.me/` handoff link.

The WhatsApp text contains the Zadok scope heading, quote reference, selected modules with prices, total fee, validity and acknowledgement that the scope is subject to final written agreement. Provisional accounting pricing remains labelled. It uses the server quotation, never the browser preview. The message is URL-encoded; the frontend inserts text through DOM textContent and restricts the returned link to the expected wa.me URL format.

Submission generates a quotation only. Nothing is automatically sent to management. The user clicks **Send selection via WhatsApp**, reviews the prepared message in WhatsApp and chooses to send. The app does not claim WhatsApp delivery or contact WhatsApp during quotation generation. Respondent email is retained as a contact detail on the quotation; it is not used for delivery. Printing uses `window.print()` and A4 print CSS, hiding interactive controls and retaining reference, UTC dates, respondent, selections, exclusions, fee and agreement disclaimer.

No quotations are stored on the server. The user should print/save the quotation or send the WhatsApp message before closing the page. Network failures preserve the editable local draft; retrying has no delivery side effect, though it generates a new reference and timestamp. Success clears the draft. Buttons are disabled while a submission is pending.

## Free Netlify subdomain deployment

Do not deploy until explicitly authorised after review. Use the Netlify **Free** plan and its supplied `YOUR-SITE.netlify.app` address. No custom domain, DNS purchase, database, messaging API subscription or paid add-on is needed.

After approval, connect the repository to a Netlify project, retain its default subdomain, and set the four variables above in the production Function environment. `netlify.toml` already sets the build command (`npm run build`), publish directory (`dist`), Functions directory and redirects/security headers. Set `SITE_ORIGIN` to the actual HTTPS Netlify subdomain before production testing. Keep preview/local origins configured separately. Use the account's free-plan limits; do not enable paid upgrades or add-ons. Free hosting has usage limits, not unlimited capacity.

Netlify documents its [default netlify.app address](https://docs.netlify.com/manage/domains/domains-fundamentals/understand-domains/) and [current Free plan limits](https://www.netlify.com/pricing/). No production deployment has been performed here.

## Tests

```powershell
npm test
# While local Netlify Dev is running with the test environment:
node tests/local-functions.mjs
npm run test:browser
```

For these local integration tests use `SCOPE_ACCESS_CODE=local-test-code`, a temporary 32+ character session secret, `SITE_ORIGIN=http://localhost:8888`, and `WHATSAPP_RECIPIENT_NUMBER=2348000000000` (a format-only test fixture, not an intended recipient). Never use these fixtures in production. Set `$env:TEST_BASE_URL='http://localhost:8889'` to test a server on another port, and match its `SITE_ORIGIN`. Tests do not click the WhatsApp action or send messages. Endpoint tests explicitly prohibit outbound fetch calls.

Vitest covers pricing, direct/transitive dependencies, removals, duplicates, unknown IDs, validation, sessions, references, UTC validity, unselected modules, authoritative totals, recipient validation and exact WhatsApp payload encoding. Browser checks cover all five requested widths, modal keyboard behaviour, draft restoration, errors, actual local quotation generation, WhatsApp link contents and print/PDF output. Captures and JSON results live in ignored `artifacts/`. See `VERIFICATION.md` for actual results and limitations.

## Updating the catalogue and rules

Edit prices only in `netlify/functions/lib/catalog.mjs`, using integer naira. Accounting uses `provisional: true` with its starting amount. Do not add browser price constants. Update pricing tests, run all tests and rebuild.

New modules need a stable unique ID, category (`launch` or `addition`), integer price, value, inclusions, warning, provisional flag and dependency IDs. Keep exactly one foundation. For incompatible catalogue changes, increment both `catalogVersion` and the versioned storage key in `app.js`. Obsolete selected IDs are filtered during restoration and dependencies are resolved again.

Basket requires catalogue; records require basket and staff; inventory requires catalogue and staff; training/enquiries require staff; overview requires records. Delivery requires basket; payments/accounts/outreach require records; certificates require training. AI has no forced business module beyond the foundation. Overview displays only selected operational modules. Cycles are rejected. Removing a needed dependency requires confirmation of affected selections. Automatically required modules disappear when no remaining explicit selection needs them.

## Security, privacy and handover

Sessions use signed HMAC-SHA256 tokens, constant-time comparisons, four-hour expiry and HttpOnly/Secure/SameSite=Strict cookies. Protected Functions authenticate every request. State-changing requests check Origin. Inputs are size-limited and validated; the honeypot discourages simple bots. The publish allowlist isolates server sources. CSP, frame protection, no-sniff, referrer/permissions restrictions and noindex headers are configured. Indexing directives are not access control.

This is a shared access code, not individual identity management. There is no database, submission ledger, individual revocation, distributed rate limiter or digital signature proving a printed quote's authenticity. Authenticated users can inspect the displayed catalogue. A PDF or WhatsApp text can be edited by its holder, so final written agreement remains necessary. No secret or complete private submission is logged by application code.

Drafts contain selected IDs and respondent details on the current browser, but never the access code, session cookie or stored totals. Browser storage may be blocked or cleared; the interface reports failures. Use a trusted device and clear drafts when appropriate. Retained legacy retry state from older drafts is ignored.

Hand over the repository and Netlify project ownership, actual recipient number, private access-code distribution and secret-rotation procedure. Remove any obsolete mail-provider variables from existing Netlify environments. Review the catalogue, quote validity and recipient with management, then perform an authorised manual WhatsApp handoff check. No paid service is necessary.

## Troubleshooting

- **Access fails:** check the code, secret length, environment context and exact origin; restart local Functions after changing environment variables.
- **Session keeps expiring:** check HTTPS/localhost, cookie support, secret rotation and machine time.
- **Configuration fails:** use Retry loading proposal; inspect JSON error codes without logging private payloads.
- **Old interface:** rebuild `dist` and reload.
- **WhatsApp configuration error:** enter only international digits, without `+`, whitespace or punctuation; restart/redeploy the Functions after correcting it.
- **Network error:** the draft remains editable; retry when connectivity returns. Nothing was automatically sent.
- **WhatsApp does not open:** verify WhatsApp is available on the device and the configured number is correct; retain the printable quotation.
- **Lost quotation after closing the page:** there is no server archive. Generate a new quote from your selection and save it.
- **Dependency surprise:** read the displayed requirements and removal confirmation before accepting a change.
