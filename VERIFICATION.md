# Verification: Select scope → Review quotation → Share PDF

Verified 19 September 2026. No commit, push, deployment, native OS share or WhatsApp message was performed during this revision.

## Results

- **42 automated tests passed across 5 files:** pricing 7, dependencies 7, selection validation 6, session security 8, quotation/PDF endpoints 14.
- **23 browser checks passed:** authentication/privacy, dependency addition/removal/cancellation, draft restoration, five editing widths, validation errors, single review validation, recoverable PDF failure, disabled generation actions, review contents/responsiveness, PDF preview/focus restoration, download filename, fallback sharing, simulated native File sharing, cancellation, native error recovery, back-to-edit and no runtime errors.
- **Real Netlify Functions:** authenticated quotation preparation returned the trusted total and automatic dependencies; signed PDF generation returned a valid `application/pdf` file. No outbound communication occurred.
- **PDF QA:** foundation-only 2 pages, dependency/provisional example 2 pages, full selection 4 pages. Rendered pages were visually inspected. Text was extracted successfully; A4 size and text bounds passed. Pagination was refined to keep section headings and the final acknowledgement with their content.
- Public build succeeded using the allowlisted `dist` assets.

Local server for this revision: **http://localhost:8890**. Normal project configuration remains port 8888. Isolated verification used ports 8890/4002/9997 to avoid existing local processes. The CLI's unused Edge runtime was disabled for local testing; production uses standard Node Functions.

## Security and correctness checks

The quotation endpoint accepts selected IDs and ignores browser prices, totals, names, validity and dependency results. Unknown modules and invalid recipient formats are rejected. Dependencies are resolved from the trusted catalogue, preserving which modules were explicitly requested.

PDF generation accepts a signed token, not a browser-owned quotation object. Tampering, expiry and changes to the catalogue/recipient after review are rejected. The PDF is reconstructed from exactly the server-validated values, checked using an integrity digest. Both endpoints enforce signed sessions and Origin checks.

Tests verify the exact short WhatsApp message and filename; supporting native shares receive a real PDF `File`, MIME type and short message. Unsupported sharing downloads the same file and exposes Open WhatsApp with instructions to attach it manually. Closing/cancelling the simulated native sheet returns to review without a delivery claim.

## Browser and device limitations

The browser suite uses headless Microsoft Edge with simulated `navigator.share`/`canShare`. It verifies application behaviour and payloads, not the operating system's actual UI or WhatsApp delivery. A manual check on the intended phone remains necessary after setting the actual recipient. The native sheet cannot force the app/contact; users select WhatsApp and Alfred themselves. The configured number controls the fallback Open WhatsApp link.

PDF preview depends on a browser PDF viewer. Download PDF remains available when inline preview is not supported. PDF text is selectable, rather than a screenshot; this is not a tagged-PDF accessibility certification. No comprehensive screen-reader audit was performed.

## Artifacts and operations

- `artifacts/browser-results.json`: browser result list.
- `artifacts/review-*.png`: review screens at the five required widths.
- `artifacts/generated-quotation.pdf`: browser download from the real Function during testing.
- `artifacts/pdf-qa/`: regenerated PDF fixtures, page images and text/bounds checks.

Artifacts use synthetic selections and format-only recipient fixtures. They are ignored by Git and not published. Actual recipient configuration, production hosting and device sharing remain manual handover checks. Quotations are not archived on the server. The existing free Netlify subdomain workflow and four environment variables remain sufficient.

The PDF library installation reported the existing 56 development-tool audit findings. They are not application delivery services; review toolchain updates before production handover and keep the local development server private. The final production dependency audit reported 0 vulnerabilities.
