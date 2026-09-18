# Zadok Farm project scope builder

A private management tool for selecting a proposed digital platform, reviewing its one-time investment, and requesting a final quotation. It is neither a payment flow nor a contract.

## Architecture and files

- `index.html`, `styles.css`, `app.js`: semantic, responsive vanilla interface; native checkboxes, disclosures and modal dialogs; print receipt.
- `netlify/functions/auth.mjs`: access-code verification and signed four-hour session cookie.
- `netlify/functions/scope-config.mjs`: authenticated catalogue GET and authoritative selection-preview POST.
- `netlify/functions/submit-scope.mjs`: validated server calculation and Resend HTTP delivery, with escaped HTML and plain text.
- `netlify/functions/lib/catalog.mjs`: the only authoritative catalogue and prices.
- `netlify/functions/lib/{session,validation,responses,dependencies}.mjs`: server helpers.
- `shared/dependencies.mjs`: pure catalogue-parameterised resolution, pricing and removal functions. This contains no catalogue or prices.
- `scripts/build.mjs`: copies an explicit public-file allowlist into `dist/`.
- `tests/*.test.mjs`, `vitest.config.mjs`: Vitest business-rule and server tests.
- `tests/browser.mjs`: Playwright checks using installed Microsoft Edge, including intercepted submission outcomes. No live email is sent.
- `netlify.toml`, `robots.txt`, `.env.example`, `.gitignore`, `package.json`, `package-lock.json`: hosting, privacy and reproducible tooling.

**Structure adjustment:** source remains at the repository root, but Netlify publishes `dist/`. Publishing the whole repository could expose the trusted catalogue and source files as static assets. The shared dependency module avoids duplicating rules. The extra build and browser-test files support that isolation and verification.

No runtime package, database, CMS, UI framework or PDF library is used. Vitest uses Vite internally as a test runner dependency; the application does not use Vite or a Vite build.

## Local setup (PowerShell)

Use Node 22 LTS or a newer supported LTS release, npm, and Microsoft Edge for the optional browser suite.

```powershell
cd C:\Users\USER\Dev\Web\Zadok\ZadokScopeBuilder
npm install
Copy-Item .env.example .env
# Edit .env with your own values before running the server.
npm run build
npx netlify dev
```

Open http://localhost:8888. Re-run `npm run build` after editing public source files; Netlify Dev serves the generated files. Function edits reload automatically. Do not use a generic static server for authenticated testing.

If Windows resolves an extensionless `npm` shim incorrectly, use `npm.cmd`, or `node C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js` on this machine. This is an environment workaround, not an application requirement.

If Netlify Dev hangs downloading its unused Deno/Edge runtime, this CLI version supports the local diagnostic command below. This project has no Edge Functions. The internal option may change in future CLI versions.

```powershell
npx netlify dev --offline --internal-disable-edge-functions
```

## Environment

| Variable | Purpose |
| --- | --- |
| `SCOPE_ACCESS_CODE` | A strong, privately distributed access code; never shipped to browsers. |
| `SCOPE_SESSION_SECRET` | Random secret of at least 32 characters. Rotating it invalidates all sessions and retry tokens. |
| `RESEND_API_KEY` | Resend sending API key; server only. |
| `RESEND_FROM_EMAIL` | Sender on a verified Resend domain. |
| `QUOTE_RECIPIENT_EMAIL` | Fixed internal recipient controlled by the operator. |
| `QUOTE_CC_EMAIL` | Optional internal CC; leave blank to omit. |
| `SITE_ORIGIN` | Exact origin, e.g. `http://localhost:8888` locally or the HTTPS production site origin. |

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never commit `.env` or paste secrets into browser code. No real secrets are included.

Secure cookies remain Secure locally. Use `localhost`, which modern Chromium browsers treat as trustworthy for this purpose; arbitrary plain-HTTP LAN hostnames will not work. Production requires HTTPS.

## Tests

```powershell
npm test
# With Netlify Dev running using the temporary test code local-test-code:
npm run test:browser
```

The browser harness assumes `http://localhost:8888` and `SCOPE_ACCESS_CODE=local-test-code` for an isolated local test process only. Never configure that code in production. Set a temporary session secret and local origin too. No Resend credentials are needed. The harness verifies real local authentication/configuration functions but intercepts submission requests. Endpoint unit tests exercise successful/failing Resend responses through mocks.

Browser captures, a print PDF and JSON results are saved under ignored `artifacts/`. Required widths are 360, 390, 768, 1024 and 1440 pixels. Tests cover pricing, direct/transitive dependencies, removals, duplicate/unknown IDs, validation, HTML escaping, secure sessions, token expiry, authoritative totals and retry keys.

## Resend configuration

Verify a sending domain in Resend and configure its DNS records. Create a sending key, set the sender, internal recipient and optional CC in the environment, then restart local Functions. The respondent address is used only for the separate confirmation email. It never controls internal recipients.

The internal notification must be accepted by Resend before the application reports success. If the respondent copy fails, the receipt explicitly says so. Provider acceptance is not proof of inbox delivery; monitor Resend delivery events separately. A real end-to-end delivery test requires an authorised manual submission after credentials are supplied.

## Retry and privacy boundaries

Sessions use HMAC-SHA256 with constant-time comparisons, explicit token purposes and expiry. Cookies are HttpOnly, Secure, SameSite=Strict and path-scoped. All protected Functions check the session. State-changing requests check `Origin`. JSON is size-limited and validated; browser prices, titles, recipients and totals are ignored. Honeypot validation discourages simple bots.

The static publish allowlist prevents downloading server sources. CSP blocks third-party scripts, inline scripts, framing and external connections. Security headers include frame protection, no-sniff, referrer and permissions restrictions. HTML, robots and response headers discourage indexing. These indexing directives are not authentication.

An authenticated user can inspect or copy the catalogue: this is necessary to review the proposal. The shared access code is not individual identity management. There is no per-user revocation, audit database, distributed rate limiter or permanent submission ledger. Configure Netlify platform-level abuse controls before broad exposure; do not treat an in-memory counter as distributed protection.

A signed four-hour submission token supplies a stable reference and UTC record time. Resend receives distinct idempotency keys for internal and respondent messages; its documented deduplication window is 24 hours. The shorter signed-token lifetime bounds allowed retries. On uncertain delivery, the unchanged submission and retry token are preserved in localStorage, and editing is blocked until retry succeeds. This token is not an authentication credential: a valid session is still required. If it expires, contact the project team to check receipt before starting again; do not blindly resubmit. After checking, Clear draft lets you explicitly discard the uncertain attempt and its retry information. No database means permanent exactly-once delivery cannot be promised. Changing secrets or catalogue pricing during an outstanding retry can interfere with retries, so coordinate releases.

Drafts contain selections and respondent details on the current browser. They do not store access codes, session cookies, or derived totals. Use a trusted device and clear the draft when appropriate. Successful submission clears it. Browser storage may be unavailable or user-cleared; the UI reports persistence failures. Printing or saving a PDF creates a private document on the user's device.

## Deployment (manual, after review)

Do not deploy until the owner authorises it. Connect this repository to a Netlify site or use the CLI manually after approval. `netlify.toml` sets `npm run build`, `dist` and the Functions directory. Configure the environment variables in Netlify for the intended context, set `SITE_ORIGIN` to the actual HTTPS origin, and keep preview environments separately configured. Rebuild after catalogue or source changes. Review headers and unauthenticated catalogue access on the deployed origin, and perform an authorised real-email smoke test. No deployment has been performed as part of implementation.

## Updating the scope safely

Edit prices only in `netlify/functions/lib/catalog.mjs`; use integer naira. The accounting item uses `provisional: true` and its starting amount. Never add browser price constants. Run tests, review totals and rebuild.

To add a module, assign a stable unique ID, category (`launch` or `addition`), price, value statement, inclusions, warning, provisional flag and dependency IDs. Update expected pricing tests. To remove or replace modules, increment the catalogue version and versioned storage key in `app.js`, and recheck restoration. Preserve exactly one foundation. Avoid circular dependencies; resolver tests reject them.

Dependencies are explicit catalogue edges. Basket requires catalogue; records require basket and staff; inventory requires catalogue and staff; training/enquiries require staff; overview requires records. Maps require basket; payments/accounts/outreach require records; certificates require training. AI has no forced business module beyond the foundation. Overview summarises other operational modules only when selected. Auto-included modules disappear when no remaining explicit selection needs them; removing a needed dependency requires confirmation of affected selections.

## Handover and troubleshooting

Hand over repository access, Netlify ownership, Resend ownership, environment configuration and a private access-code delivery process. Rotate test credentials, confirm recipient addresses, review catalogue copy with management, then perform an approved delivery test. Use the print receipt and Resend dashboard for follow-up; there is no backend submissions database.

- **Access fails:** verify access code, session-secret length and environment scope; restart Netlify Dev after environment edits.
- **Session repeatedly expires:** check HTTPS/localhost, cookie support, secret rotation, clock and exact origin.
- **Configuration does not load:** check Function logs without logging payloads/secrets; inspect the JSON error code. The retry control reloads configuration.
- **Old interface appears:** rebuild `dist` and reload.
- **Email not configured:** set the Resend key, sender and internal recipient. Failed submission preserves the draft.
- **Provider failure:** check Resend configuration and status; retry the unchanged pending selection within four hours.
- **Expired retry window:** check with the recipient before making a new submission.
- **No saved draft:** browser storage may be blocked or cleared; do not assume a shared or private-browsing device retains it.
- **Dependency surprise:** read the displayed requirements and removal confirmation before confirming.

See `VERIFICATION.md` for the actual local verification record and remaining limitations.

## Platform references

- [Netlify Functions API](https://docs.netlify.com/build/functions/api/) — Request/Response handlers and ES module entrypoints.
- [Netlify local Functions](https://docs.netlify.com/api-and-cli-guides/cli-guides/manage-functions/) — local invocation and development.
- [Resend idempotency](https://resend.com/blog/engineering-idempotency-keys) — provider retry deduplication and its time window.
