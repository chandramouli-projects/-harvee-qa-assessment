# Traceability Matrix

**Execution run:** 2026-10-27, Windows 11 (10.0.26300), Node 24.19.0, Playwright 1.64.1, playwright-bdd 9.2.1. Browsers: Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2.
**Command:** `npx cross-env BROWSER=all WORKERS=2 npm test` (retries 0).
**Result:** 114 scenarios run (38 per browser): 114 passed, 0 failed, 0 skipped, 0 flaky. That includes 6 *expected failures* (DEF-01, DEF-02 × 3 browsers).
**Evidence:** `evidence/bdd-run-2-all-browsers-2-workers.log`, `reports/html/index.html`, `reports/spark-report/index.html`, `reports/junit/results.xml`. The first BDD run had 3 WebKit failures caused by test synchronisation; they were fixed and are explained in `known-limitations.md` (`evidence/bdd-run-1-…log`).

"Pass ×3" = passed in Chromium, Firefox and WebKit. Every scenario carries its manual ID as a tag, so `npx playwright test --grep @TC15` runs exactly that case.

| Manual ID | Requirement / scenario | Feature file → scenario | Runs per browser | Status | Evidence / notes |
|-----------|------------------------|-------------------------|:-:|--------|------------------|
| TC01 | Valid login → Products | `Authentication.feature` → TC01 Login-HappyPath | 1 | Pass ×3 | |
| TC02 | Locked-out user error | `Authentication.feature` → TC02 Login-LockedOut | 1 | Pass ×3 | Exact message asserted |
| TC03 | Invalid credentials | `Authentication.feature` → TC03 Login-InvalidCredentials (outline: wrong password, unknown user) | 2 | Pass ×3 | |
| TC04 | Empty login fields | `Authentication.feature` → TC04 Login-RequiredFields (outline: both, username, password) | 3 | Pass ×3 | |
| TC05 | Sort Name A–Z, whole list | `ProductSorting.feature` → Sorting outline, `@TC05` examples | 1 | Pass ×3 | Starts from Z–A so the sort must actively reorder |
| TC06 | Sort Price low→high, whole list | `ProductSorting.feature` → Sorting outline, `@TC06` examples | 1 | Pass ×3 | Every adjacent pair checked; $15.99 tie allowed |
| TC06 (problem_user) | Same rule for `problem_user` | `ProductSorting.feature` → TC06 Sorting-ProblemUser | 1 | Expected failure ×3 | **DEF-01** (`@fail`) |
| TC07 | Sort Price high→low | `ProductSorting.feature` → `@TC07` examples | 1 | Pass ×3 | |
| TC08 | Sort Name Z–A | `ProductSorting.feature` → `@TC08` examples | 1 | Pass ×3 | |
| TC09 | Add 2, badge 2, remove 1 on Products, badge 1, cart contents | `Cart.feature` → TC09 Cart-Badge | 1 | Pass ×3 | |
| TC10 | Remove from Cart page | `Cart.feature` → TC10 Cart-Remove | 1 | Pass ×3 | |
| TC11 | Empty cart behaviour | `Cart.feature` → TC11 Cart-Empty | 1 | Pass ×3 | Empty-cart checkout is a PO question (Q1) |
| TC12 | Missing first name | `Checkout.feature` → Checkout-Validation, `@TC12` examples | 1 | Pass ×3 | |
| TC13 | Missing last name | `Checkout.feature` → Checkout-Validation, `@TC13` examples | 1 | Pass ×3 | |
| TC14 | Missing postal code | `Checkout.feature` → Checkout-Validation, `@TC14` examples | 1 | Pass ×3 | |
| TC15 | Full checkout, 2 products, totals, completion, empty cart | `Checkout.feature` → TC15 Checkout-HappyPath | 1 | Pass ×3 | Integer-cent comparison |
| TC16 | Total = item total + tax across baskets (B1 rewrite) | `OrderTotals.feature` → TC16 OrderTotal (outline: 1, 2, 6 items) | 3 | Pass ×3 | |
| TC17 | Cancel checkout (both steps) | `Checkout.feature` → two TC17 Checkout-Cancel scenarios | 2 | Pass ×3 | |
| TC18 | Order integrity / duplicate submission | Manual only | – | Not executed | Needs backend visibility |
| TC19 | Keyboard-only login and add to cart | `Accessibility.feature` → TC19 Keyboard-Only | 1 | Pass ×3 | |
| TC19 | Visible focus | `Accessibility.feature` → TC19 Keyboard-FocusVisible | 1 | Expected failure ×3 | **DEF-02** (`@fail`), screenshots attached |
| TC20 | Accessible names, error visibility, axe WCAG A/AA scan | `Accessibility.feature` → TC20 A11y-LoginForm, A11y-ShopControls, A11y-AxeScan | 3 | Pass ×3 | axe JSON attached; 0 critical/serious violations |
| TC21 | Responsive layout 375 px and 1366 px | `Accessibility.feature` → TC21 Responsive (outline) | 2 | Pass ×3 | Viewport emulation only |
| TC22 | Logout → direct `/inventory.html` blocked | `SessionSecurity.feature` → TC22 Session-Logout | 1 | Pass ×3 | UI-level only |
| TC23 | Browser compatibility | Whole suite via `BROWSER=all` | 38 | Pass ×3 | Chromium, Firefox, WebKit executed |
| TC24 | Unauthenticated deep links | `SessionSecurity.feature` → TC24 Session-DeepLink (outline: 5 URLs) | 5 | Pass ×3 | UI-level only |
| TC25 | `performance_glitch_user` login | `Authentication.feature` → TC25 Login-PerformanceGlitch | 1 | Pass ×3 | Functional only, not a performance test |
| EX-01 | `problem_user` exploratory charter | Manual | – | Charter written; not executed as a timed session | DEF-01 found by automation probe |
