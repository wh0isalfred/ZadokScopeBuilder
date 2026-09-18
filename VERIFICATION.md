# Local verification record

Verified on 18 September 2026. Nothing was committed, pushed or deployed.

## Executed checks

- `npm install`: succeeded and generated `package-lock.json`. The Windows npm shim required invoking npm's CLI through Node.
- `npm test`: **46 tests passed in 5 files** (pricing 7, dependencies 7, validation 13, sessions 9, endpoints 10).
- `npm run build`: copies only the six public assets into `dist`.
- Netlify Dev: all three Node Functions loaded and were exercised at **http://localhost:8888**.
- Initial plain Netlify Dev stalled preparing the unused Edge/Deno runtime in this environment. Local verification used `netlify dev --offline --internal-disable-edge-functions`; no Edge Functions are part of this application.
- `node tests/browser.mjs`: **25 checks passed**, with no page runtime errors. Used headless Microsoft Edge through Playwright; the agent-browser command was unavailable.
- `node tests/local-functions.mjs`: real local submission endpoint returned 401 without authentication, 422 for unknown module IDs, and 403 for an incorrect origin. Server catalogue, `.env` and `package.json` static paths returned 404. These requests did not reach the email provider.

## Browser coverage

Unlock and incorrect code; protected configuration and source; 360/390/768/1024/1440px layouts without horizontal overflow; automatic transitive dependencies; removal cancellation and confirmation; draft restoration; provisional accounting label; authoritative server review; modal keyboard containment; Escape and focus restoration; mobile review; validation; intercepted provider failure; session expiry during submission and reauthentication; intercepted success and draft clearing; print/PDF output; malformed configuration and retry recovery.

Captures in `artifacts/` include the access screen, each required proposal width, a print screenshot and `submission-summary.pdf`. The access, mobile and print captures were visually inspected. Visual review found a text-encoding defect, which was fixed. Keyboard testing found focus could leave the native dialog; an explicit focus loop was implemented and the tests passed on rerun. Generated browser receipts contain test data and an intercepted result, not a delivered submission.

## Dependencies and boundaries

The production dependency audit reports **0 vulnerabilities**. The development-tool audit reports **56 findings: 1 low, 19 moderate, 31 high and 5 critical**, principally in the Netlify CLI dependency tree, plus Vitest tooling. Compatible `npm audit fix` completed but did not eliminate them. A subsequent current-release upgrade was stopped during lengthy dependency resolution; the tested versions and lockfile were retained. Do not expose the development server publicly. Reassess tool updates before production handover. No development packages are imported by the application Functions.

Real Resend delivery, production Netlify behaviour and a comprehensive assistive-technology audit have not been verified. No email was sent by tests. Configure the environment, sender domain and recipients, then perform an authorised real delivery test. Provider mocks verify HTML escaping, plain text, internal recipient control, idempotent retry payloads, internal failure and respondent-confirmation failure handling.

This is a shared-code private proposal, not per-person authentication. No distributed rate limiting, persistent submissions database or permanent exactly-once email guarantee is claimed. See README for retry limits, secret rotation, storage privacy and handover steps.
