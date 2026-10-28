# Known Defects, Limitations and Investigation Notes

## Application defects found (evidence preserved, assertions not weakened)

| ID | Summary | Where found | Evidence | How the suite handles it |
|----|---------|-------------|----------|--------------------------|
| BUG-01 | **Sorting does not work for problem_user.** The order does not change: $29.99, $9.99, $15.99, $49.99, $7.99, $15.99. The dropdown goes back to "Name (A to Z)". | TC25 (Sorting) | Failure message and screenshot in the HTML report; all 3 browsers. Severity Medium. | `@known-defect @BUG-01`; the scenario fails while the bug exists (Open - happens every time). |
| BUG-02 | **Checkout accepts names made of spaces only.** No error. The Overview page opens. | TC70 (Checkout) | Failure message and screenshot in the HTML report; all 3 browsers. Severity Medium. | `@known-defect @BUG-02`; the scenario fails while the bug exists (Open - happens every time (confirm the rule with the product owner)). |
| BUG-03 | **An order can be started with an empty cart.** Checkout opens with an empty cart. The Overview shows Total $0.00 and a Finish button. | TC72, TC73 (Checkout) | Failure message and screenshot in the HTML report; all 3 browsers. Severity Medium. | `@known-defect @BUG-03`; the scenario fails while the bug exists (Open - happens every time (confirm the rule with the product owner)). |
| BUG-04 | **"Reset App State" leaves a "Remove" button on the page.** Cart number disappears, but the products still show "Remove" until the page is refreshed. | TC86 (Navigation) | Failure message and screenshot in the HTML report; all 3 browsers. Severity Low. | `@known-defect @BUG-04`; the scenario fails while the bug exists (Open - happens every time). |
| BUG-05 | **Fields may stay red after closing the login error.** The error goes away, but the fields keep their error style (check if they still look red). | TC28 (Login) | Manual observation; to confirm on screen. Severity Low. | Not a failing automated check: the automated TC28 only checks that the error closes, and passes. Whether the fields stay red needs a look on screen (To confirm). |
| BUG-06 | **One user can see another user's cart.** The cart number shows 2 and the cart has standard_user's 2 products. | TC60 (Cart) | Failure message and screenshot in the HTML report; all 3 browsers. Severity High. | `@known-defect @BUG-06`; the scenario fails while the bug exists (Open - happens every time (confirm the rule with the product owner)). |
| BUG-07 | **The same cart can be ordered twice from two tabs.** Tab 2 also shows "Thank you for your order!" for the same cart. | TC82 (Order Completion) | Failure message and screenshot in the HTML report; all 3 browsers. Severity Medium. | `@known-defect @BUG-07`; the scenario fails while the bug exists (Open - happens every time). |
| BUG-08 | **error_user cannot remove a product.** Nothing happens: the button stays "Remove" and the cart number stays 1. | TC95 (Personas) | Failure message and screenshot in the HTML report; all 3 browsers. Severity Medium. | `@known-defect @BUG-08`; the scenario fails while the bug exists (Open - happens every time). |
| BUG-09 | **problem_user checkout form changes the typed names.** First Name shows "Customer" and Last Name stays empty - typing the last name goes into the First Name field. | TC96 (Personas) | Failure message and screenshot in the HTML report; all 3 browsers. Severity Medium. | `@known-defect @BUG-09`; the scenario fails while the bug exists (Open - happens every time). |
| BUG-10 | **problem_user sees the wrong product images.** Every product shows the same wrong picture. | TC97 (Personas) | Failure message and screenshot in the HTML report; all 3 browsers. Severity Low. | `@known-defect @BUG-10`; the scenario fails while the bug exists (Open - happens every time). |
| BUG-11 | **visual_user sees wrong prices and a moved cart icon.** Prices are different (for example $78.23 instead of $29.99) and the cart icon is in a different place. | TC98 (Personas) | Failure message and screenshot in the HTML report; all 3 browsers. Severity High. | `@known-defect @BUG-11`; the scenario fails while the bug exists (Open - happens every time). |
| AC-BUG-01 (was DEF-02) | **No visible focus indicator** on any control tested, when reached with Tab (WCAG 2.4.7 Focus Visible): login fields and button, sort control, Add to cart, Continue Shopping, Checkout, First Name, Continue. | `Accessibility/Accessibility.feature` → AC07 (4 screens) | Focused-state screenshots attached per control. The pixel comparison was validated with a positive control: an injected `input:focus{outline:3px solid red}` is detected. Same result in Chromium, Firefox, WebKit. | `@known-defect @AC-BUG-01`; the scenario fails while the bug exists. |
| AC-BUG-02 | The **cart link cannot take keyboard focus**: it is `<a role="button" aria-label="Cart, empty">` with no `href` or `tabindex`, so Tab skips it and a keyboard-only user cannot open the cart (WCAG 2.1.1 Keyboard, 4.1.2). | AC06; confirmed by Tab-order probes in Chromium and Firefox | Failure message shows the element's HTML; all 3 browsers. AC04 opens the cart with the mouse so the rest of the keyboard checkout is still tested. | `@known-defect @AC-BUG-02` |
| AC-BUG-03 | Checkout fields have **no `autocomplete` purpose** (`given-name`, `family-name`, `postal-code`) (WCAG 1.3.5 Identify Input Purpose). | AC11 | Failure lists each field and its missing value; all 3 browsers. | `@known-defect @AC-BUG-03` |
| SC-BUG-01 | **No `Strict-Transport-Security` header**, so a browser may still try plain HTTP first (OWASP ASVS V14.4). | `Security/Security.feature` → SC02 | Response headers attached; all 3 browsers. | `@known-defect @SC-BUG-01` |
| SC-BUG-02 | **The shop can be framed by any site** (no `X-Frame-Options`, no CSP `frame-ancestors`), allowing clickjacking. | SC04 | Response headers attached. | `@known-defect @SC-BUG-02` |
| SC-BUG-03 | **No `Content-Security-Policy`, `X-Content-Type-Options` or `Referrer-Policy` header.** | SC05 (3 rows) | Response headers attached. | `@known-defect @SC-BUG-03` |
| SC-BUG-04 | The **login cookie is unprotected**: the page writes `session-username=<user>; path=/; expires=…` with no `Secure` and no `SameSite`, and because page script writes it, it cannot be `HttpOnly`. | SC06 | The cookie string as written by the page is attached (value masked). Same in all 3 browsers. | `@known-defect @SC-BUG-04` |
| SC-BUG-05 | **Authentication bypass**: setting `session-username` to a valid username by hand (as anyone can in DevTools) opens the Products page **without the password**. Locked-out and unknown usernames are still refused (SC09). Login is checked only in the browser. | SC08 | Products page shown after the hand-made cookie; all 3 browsers. Affects only the tester's own browser. | `@known-defect @SC-BUG-05` |
| AC-BUG-04 | **Every page is titled "Swag Labs"**, so the title does not say which page the user is on (WCAG 2.4.2 Page Titled). | AC13 (Login, Products, Cart, Checkout) | Failure message lists the four titles; all 3 browsers. | `@known-defect @AC-BUG-04` |

Functional bugs use the IDs of the Excel **Bugs** sheet (BUG-01 – BUG-11) and the test-case IDs of the Excel (TCxx). BUG-01 and BUG-08 – BUG-11 come from the deliberately faulty demo users (`problem_user`, `error_user`, `visual_user`); they are reported because the brief asks for genuine defects to be evidenced, not hidden. BUG-02, BUG-03 and BUG-06 depend on business rules that are not written down; they are raised as product-owner questions Q1, Q4 and Q8 (ANSWERS.md A1.1) with the assumption tested.

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
| Seen again | In the first final run of the full suite (`evidence/final-run-1-all-browsers-webkit-fill-flake.log`) one WebKit scenario (TC76, order total for two products) failed once with "first name should keep the typed value": WebKit still occasionally drops a value typed while the form re-renders. |
| Second fix | `fillInformation` now types each value, re-types it if it was dropped (for up to 5 s), and then asserts all three values again. A field that never keeps its value still fails with a clear message, so the `problem_user` bug (TC96, BUG-09) is still caught. Verified in WebKit with `--repeat-each=3`: every checkout scenario passed and TC96 failed with "last name should keep the typed value". |
| Final runs | Full suite, 2 workers, retries 0: Chromium and Firefox in `evidence/final-run-2-all-browsers-2-workers.log`, WebKit in `evidence/final-run-3-webkit-2-workers.log` (run 2 was stopped after Chromium and Firefox finished, so WebKit was run on its own). 380 passed, 75 failed, 1 skipped (AC05 in WebKit, by design). All 75 failures are tagged `@known-defect`; the WebKit fill problem did not come back. |

## Menu click intermittently ignored (test defect, fixed)

| Item | Detail |
|------|--------|
| Symptom | Under parallel load, Logout occasionally timed out in Firefox and WebKit: "Open Menu" was clicked but the menu did not open. |
| Investigation | A first fix (click again if the Logout link is not visible) broke Chromium: Chromium reports the closed menu's Logout link as *visible* because it is only moved off-screen. A DOM probe showed the reliable signal is the menu's `aria-hidden` state, which flips as soon as the menu opens, in all three browsers. |
| Fix | `MenuComponent` finds the menu by role (`getByRole('navigation')`, which ignores `aria-hidden` elements) and clicks "Open Menu" again only while the menu is still closed. |
| Verification | Full three-browser run: every failure was a documented bug; no menu timeouts. |

## Observations needing a product decision (not asserted as defects)

- An exploratory axe probe with all rules flagged best-practice items (not WCAG A/AA criteria): `page-has-heading-one` and `region` (moderate) and `aria-allowed-role` (minor) on the Login page, and `page-has-heading-one` on Products. The automated test scans only WCAG 2 A/AA tags and found 0 violations of any impact in all three browsers.

## Limitations of this assessment

- **UI-only evidence.** TC21, TC22 and TC88 – TC94 show the UI blocks protected pages after logout, without login and after the session ends. They do not prove server-side authorisation; Sauce Demo is a client-side demo with no supported API.
- **No API or unit tests.** No source code or API contract was supplied, so none were written; no endpoints were probed. They are recommended for a client-owned system (see `docs/test-strategy.md`).
- **No performance or load testing; security testing is passive only.** TC26 only checks that `performance_glitch_user` can log in within the timeouts. `Security/Security.feature` (SC01–SC14) reads headers, redirects, cookies and browser storage and does things that affect only our own browser. No penetration testing, active scanning, fuzzing, brute force or stress testing was performed, because Sauce Demo is a third-party public site.
- **Accessibility automation is partial.** axe-core covers roughly a third to a half of WCAG success criteria. It cannot judge screen-reader announcements (e.g. whether the error message is announced), reading order, meaningful alt text or cognitive load. Manual testing with NVDA/VoiceOver is still required.
- **Responsive checks use viewport emulation** (375×667, 1366×768) in desktop engines. They do not emulate touch, real mobile browsers or devices.
- **Browsers executed:** Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2 (Playwright 1.64.1) on Windows 11. Playwright WebKit is not Safari on macOS/iOS; branded Chrome/Edge were not run.
- **Public shared site.** Sauce Demo is public and may change or be slow, which can break selectors or messages without notice. Exact error texts were verified against the live site on 2026-10-27.
- **Simulated or partial checks.** Session timeout (TC94) is simulated by removing the login cookie instead of waiting ~10 minutes. The PDF order (TC79) is checked as a downloaded, non-empty PDF; its content needs a manual look. External links (TC46, TC85) are checked by address only.
- **Credentials in artefacts.** Login values are public demo data, so traces and videos may contain them. For a real client system, authenticate with `storageState` or an API token, and mask secrets in traces.
