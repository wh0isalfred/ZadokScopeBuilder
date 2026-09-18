# Local verification record

Updated 18 September 2026 for server-generated quotations and manual WhatsApp sharing. This implementation does not perform email delivery or use a database, paid messaging service or custom domain. No commit, push, deployment or WhatsApp send was performed during this revision.

## Automated and local checks

- `npm test`: **53 tests passed in 5 files** — pricing 7, dependencies 7, validation 13, sessions 8, endpoints/quotations 18.
- `node scripts/build.mjs`: succeeded; only allowlisted public assets are published into `dist`.
- Netlify Dev: all three Node Functions loaded. This revision was verified at **http://localhost:8889** with isolated static and Function ports because another process occupied the standard local ports. The configured normal port remains 8888.
- `node tests/browser.mjs`: **26 checks passed**, including actual local quotation submission. Test submissions generated quotes but did not send messages.
- `node tests/local-functions.mjs`: actual Functions rejected unauthenticated requests (401), invalid IDs (422) and wrong origins (403); private static paths returned 404. A valid submission returned the recalculated fee, 30-day validity and WhatsApp link (200).

Local verification used temporary access/session values, an exact localhost origin and a format-only WhatsApp test number. No real recipient number is embedded in application code. CLI fallback: `netlify dev --offline --internal-disable-edge-functions --port 8889 --staticServerPort 4001 --functions-port 9998`. The application has no Edge Functions. Test runners accept `TEST_BASE_URL` for this isolated port.

## Coverage

Unit/endpoint checks cover trusted pricing and transitive dependencies; unknown/duplicate IDs; foundation; provisional accounting; respondent validation; session signing, expiry and malformed cookies; reference format and uniqueness; exact UTC validity; all omitted elective modules; digits-only recipient validation; ignored browser prices, totals, recipient and validity; WhatsApp text contents and URL encoding. Outbound `fetch` is prohibited in quotation endpoint tests and is never called.

Browser checks cover unlock and wrong code; authenticated catalogue and source isolation; 360/390/768/1024/1440px without overflow; dependency additions/removal/cancellation; draft restoration; provisional labels; server review; modal focus containment and Escape/restoration; mobile review; form validation; intercepted server failure; session expiry and reauthentication; actual quotation success and draft clearing; server-generated WhatsApp link and validity; print/PDF output; malformed configuration/retry; no runtime errors.

The current print quotation and its PDF are generated in ignored `artifacts/`. Visual inspection prompted hiding the keyboard skip link in print and compacting spacing. The printable quote contains reference, time, validity, respondent, selected modules and individual prices, total, omitted modules and agreement disclaimer. Navigation and sharing buttons are excluded. No WhatsApp action was clicked; real account/device handoff is a manual check after the actual recipient is configured.

## Remaining boundaries

No production deployment was performed. Set the four variables from `.env.example` on the intended free Netlify project, including the actual digits-only WhatsApp recipient and `SITE_ORIGIN=https://YOUR-SITE.netlify.app`. No custom domain is required. Free-plan usage limits still apply.

No quotation archive exists: save/print or manually share before closing the page. Retrying creates a new quote reference and timestamp but has no external delivery side effect. Quotation validity currently defaults to 30 days and can be changed in the server's `QUOTE_VALIDITY_DAYS` constant.

The previous dependency audit reported 0 production vulnerabilities and 56 development-tool findings (1 low, 19 moderate, 31 high, 5 critical). Dependencies were not changed in this revision; that audit has not been rerun. Keep local development private and reassess tool updates before production handover. Browser testing is not a comprehensive assistive-technology audit. There is no distributed rate limiter or individual identity management.
