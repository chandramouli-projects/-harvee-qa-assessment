# Known Defects, Limitations and Investigation Notes

## Application defects found (evidence preserved, assertions not weakened)

| ID | Summary | Where found | Evidence | How the suite handles it |
|----|---------|-------------|----------|--------------------------|
| DEF-01 | Sorting has no effect for `problem_user`: after choosing "Price (low to high)" the list stays `[29.99, 9.99, 15.99, 49.99, 7.99, 15.99]` and the dropdown reverts to its default. | EX-01 charter / `tests/regression/problem-user.spec.ts` | Assertion message in the HTML report (all 3 browsers); first seen in a live DOM probe. | `test.fail()` with full assertion → reported as *expected failure*. If fixed, Playwright reports it as an unexpected pass so the marker is removed. |
| DEF-02 | Login form controls (Username, Password, Login button) show **no visible focus indicator** when reached with Tab (WCAG 2.4.7 Focus Visible). Computed style `outline-style: none`; no box-shadow change. | `tests/accessibility/keyboard.spec.ts` | Focused-state screenshots attached to the test in the HTML report. The method was validated with a positive control: injecting `input:focus{outline:3px solid red}` is detected by the same pixel comparison. | `test.fail()` with full assertion, as above. |

`problem_user` is a deliberately faulty demo persona, so DEF-01 is expected behaviour of the practice site. It is reported because the brief asks for genuine defects to be evidenced, not hidden.

## Intermittent failure investigation (test environment, not product)

| Item | Detail |
|------|--------|
| Symptom | First all-browser run (`evidence/run-1-all-browsers-default-workers.log`): 112 passed, **2 failed, both Firefox only**. TC20 timed out on the Login click (the navigation never completed and browser-context teardown also hung); TC22's "Open Menu" click did not open the menu. |
| Reproduction | Firefox, the two tests, `--repeat-each=10`, retries 0: **2/20 and 1/20 failures with 4 workers; 0/20 with 1 worker**. Chromium full suite `--repeat-each=3`: 114/114 passed. |
| Supporting evidence | Firefox process logged `GraphicsCriticalError: RenderCompositorSWGL failed mapping default framebuffer` and context-close timeouts during the failing runs. |
| Probable root cause | Resource contention when several headless Firefox instances run in parallel on this Windows laptop. Not attributed to Sauce Demo: the same steps pass in Chromium and WebKit and pass consistently in Firefox at lower parallelism. Confidence: medium — not proven at the browser-engine level. |
| Action | Added a `WORKERS` setting (CI uses 2). Final run with `WORKERS=2`: 114/114, 0 flaky (`evidence/run-2-all-browsers-2-workers.log`). Retries were **not** raised to hide the failure. |
| Follow-up | Monitor Firefox in CI (Linux runners); if failures recur at 2 workers, capture traces and raise with the Playwright/Firefox projects. |

## Observations needing a product decision (not asserted as defects)

- Checkout can be started with an **empty cart** (Cart → Checkout reaches step one). No rule says this is wrong; see PO question Q1.
- An exploratory axe probe with all rules flagged best-practice items (not WCAG A/AA criteria): `page-has-heading-one` and `region` (moderate) and `aria-allowed-role` (minor) on the Login page, and `page-has-heading-one` on Products. The automated test scans only WCAG 2 A/AA tags and found 0 violations of any impact in all three browsers.

## Limitations of this assessment

- **UI-only evidence.** TC22/TC24 show the UI blocks protected pages after logout/without login. They do not prove server-side authorisation; Sauce Demo is a client-side demo with no supported API.
- **No API or unit tests.** No source code or API contract was supplied, so none were written; no endpoints were probed. They are recommended for a client-owned system (see `docs/test-strategy.md`).
- **No performance, load or security testing.** TC25 only checks that `performance_glitch_user` can log in within the timeouts. No penetration, fuzzing or stress testing was performed.
- **Accessibility automation is partial.** axe-core covers roughly a third to a half of WCAG success criteria. It cannot judge screen-reader announcements (e.g. whether the error message is announced), reading order, meaningful alt text or cognitive load. Manual testing with NVDA/VoiceOver is still required.
- **Responsive checks use viewport emulation** (375×667, 1366×768) in desktop engines. They do not emulate touch, real mobile browsers or devices.
- **Browsers executed:** Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2 (Playwright 1.64.1) on Windows 11. Playwright WebKit is not Safari on macOS/iOS; branded Chrome/Edge were not run.
- **Public shared site.** Sauce Demo is public and may change or be slow, which can break selectors or messages without notice. Exact error texts were verified against the live site on 2026-10-27.
- **Credentials in artefacts.** Login values are public demo data, so traces and videos may contain them. For a real client system, authenticate with `storageState` or an API token, and mask secrets in traces.
