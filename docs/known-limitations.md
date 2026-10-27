# Known Defects, Limitations and Investigation Notes

## Application defects found (evidence preserved, assertions not weakened)

| ID | Summary | Where found | Evidence | How the suite handles it |
|----|---------|-------------|----------|--------------------------|
| DEF-01 | Sorting has no effect for `problem_user`: after choosing "Price (low to high)" the list stays `[29.99, 9.99, 15.99, 49.99, 7.99, 15.99]` and the dropdown reverts to its default. | EX-01 charter / `ProductSorting.feature` → "TC06 Sorting-ProblemUser" | Assertion message in the HTML report (all 3 browsers); first seen in a live DOM probe. | Tagged `@known-defect @DEF-01 @fail`; `@fail` compiles to Playwright `test.fail()`, so the full assertion runs and the result is an *expected failure*. If fixed, Playwright reports an unexpected pass so the tag is removed. |
| DEF-02 | Login form controls (Username, Password, Login button) show **no visible focus indicator** when reached with Tab (WCAG 2.4.7 Focus Visible). Computed style `outline-style: none`; no box-shadow change. | `Accessibility.feature` → "TC19 Keyboard-FocusVisible" | Focused-state screenshots attached to the scenario in the HTML report. The method was validated with a positive control: injecting `input:focus{outline:3px solid red}` is detected by the same pixel comparison. | `@known-defect @DEF-02 @fail` with full assertion, as above. |

`problem_user` is a deliberately faulty demo persona, so DEF-01 is expected behaviour of the practice site. It is reported because the brief asks for genuine defects to be evidenced, not hidden.

## Intermittent failure investigation (test environment, not product)

| Item | Detail |
|------|--------|
| When | Before the suite was restructured into BDD (same page objects, same assertions); logs kept in `evidence/pre-bdd-migration/`. |
| Symptom | First all-browser run (`evidence/pre-bdd-migration/run-1-all-browsers-default-workers.log`): 112 passed, **2 failed, both Firefox only**. TC20 timed out on the Login click (the navigation never completed and browser-context teardown also hung); TC22's "Open Menu" click did not open the menu. |
| Reproduction | Firefox, the two tests, `--repeat-each=10`, retries 0: **2/20 and 1/20 failures with 4 workers; 0/20 with 1 worker**. Chromium full suite `--repeat-each=3`: 114/114 passed. |
| Supporting evidence | Firefox process logged `GraphicsCriticalError: RenderCompositorSWGL failed mapping default framebuffer` and context-close timeouts during the failing runs. |
| Probable root cause | Resource contention when several headless Firefox instances run in parallel on this Windows laptop. Not attributed to Sauce Demo: the same steps pass in Chromium and WebKit and pass consistently in Firefox at lower parallelism. Confidence: medium — not proven at the browser-engine level. |
| Action | Added a `WORKERS` setting (CI uses 2). Run with `WORKERS=2`: 114/114, 0 flaky (`evidence/pre-bdd-migration/run-2-all-browsers-2-workers.log`). The BDD suite is executed the same way (`evidence/bdd-run-all-browsers-2-workers.log`). Retries were **not** raised to hide the failure. |
| Follow-up | Monitor Firefox in CI (Linux runners); if failures recur at 2 workers, capture traces and raise with the Playwright/Firefox projects. |

## WebKit failures after the BDD restructure (test defects, fixed)

| Item | Detail |
|------|--------|
| Symptom | First all-browser BDD run (`evidence/bdd-run-1-all-browsers-3-webkit-failures.log`): 111 passed, **3 failed, all WebKit**. TC16 (two products) and TC17 (cancel from overview) stayed on checkout step one; TC10 read the cart list as 2 names / 0 prices. |
| Evidence | Page snapshot of the checkout failures: Last Name and Postal Code filled, **First Name empty**, error "First Name is required". The TC10 failure happened in a step that read the cart straight after clicking the cart link. |
| Root cause | Test synchronisation, not the product. (1) The first `fill()` ran while the checkout form was still mounting, and WebKit dropped the value; the same race existed before the restructure but had not shown up. (2) In the BDD version of TC10 the "Cart page displayed" wait that the old spec had was missing, so the list was read during navigation. Confidence: high for (2); medium for (1), since it is inferred from the snapshot, not from engine internals. |
| Fix | `CheckoutPage.fillInformation` waits for the information step and then asserts every field kept its value; `CartPage.getLineItems`/`expectEmpty` and `CheckoutPage.getOverviewItems` wait for their page first. No retries added. |
| Verification | Affected WebKit scenarios with `--repeat-each=5`: 50/50 passed. Final all-browser run: 114/114 (`evidence/bdd-run-2-all-browsers-2-workers.log`). |

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
