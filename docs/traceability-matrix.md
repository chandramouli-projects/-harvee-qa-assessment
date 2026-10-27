# Traceability Matrix

**Execution run:** 2026-10-27, Windows 11 (10.0.26300), Node 24.19.0, Playwright 1.64.1. Browsers: Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2.
**Command:** `npx cross-env BROWSER=all WORKERS=2 npx playwright test` (retries 0).
**Result:** 114 tests (38 per browser): 114 passed, 0 failed, 0 skipped, 0 flaky. That includes 6 *expected failures* (DEF-01, DEF-02 × 3 browsers).
**Evidence:** `reports/html/index.html`, `reports/junit/results.xml`, `evidence/run-2-all-browsers-2-workers.log`. First run with default workers: `evidence/run-1-all-browsers-default-workers.log` (112 passed, 2 Firefox failures, investigated in `known-limitations.md`).

"Pass ×3" = passed in Chromium, Firefox and WebKit.

| Manual ID | Requirement / scenario | Automated test(s) | Tests per browser | Status | Evidence / notes |
|-----------|------------------------|-------------------|:-:|--------|------------------|
| TC01 | Valid login → Products | `tests/auth/login.spec.ts` | 1 | Pass ×3 | |
| TC02 | Locked-out user error | `tests/auth/login.spec.ts` | 1 | Pass ×3 | Exact message asserted |
| TC03 | Invalid credentials | `tests/auth/login.spec.ts` (wrong password, unknown user) | 2 | Pass ×3 | |
| TC04 | Empty login fields | `tests/auth/login.spec.ts` (both, username, password) | 3 | Pass ×3 | |
| TC05 | Sort Name A–Z, whole list | `tests/catalogue/sorting.spec.ts` | 1 | Pass ×3 | Starts from Z–A so the sort must actively reorder |
| TC06 | Sort Price low→high, whole list | `tests/catalogue/sorting.spec.ts` | 1 | Pass ×3 | Every adjacent pair checked; $15.99 tie allowed |
| TC06 (problem_user) | Same rule for `problem_user` | `tests/regression/problem-user.spec.ts` | 1 | Expected failure ×3 | **DEF-01** |
| TC07 | Sort Price high→low | `tests/catalogue/sorting.spec.ts` | 1 | Pass ×3 | |
| TC08 | Sort Name Z–A | `tests/catalogue/sorting.spec.ts` | 1 | Pass ×3 | |
| TC09 | Add 2, badge 2, remove 1 on Products, badge 1, cart contents | `tests/cart/cart.spec.ts` | 1 | Pass ×3 | |
| TC10 | Remove from Cart page | `tests/cart/cart.spec.ts` | 1 | Pass ×3 | |
| TC11 | Empty cart behaviour | `tests/cart/cart.spec.ts` | 1 | Pass ×3 | Empty-cart checkout is a PO question (Q1) |
| TC12 | Missing first name | `tests/checkout/checkout.spec.ts` (parameterised) | 1 | Pass ×3 | |
| TC13 | Missing last name | `tests/checkout/checkout.spec.ts` (parameterised) | 1 | Pass ×3 | |
| TC14 | Missing postal code | `tests/checkout/checkout.spec.ts` (parameterised) | 1 | Pass ×3 | |
| TC15 | Full checkout, 2 products, totals, completion, empty cart | `tests/checkout/checkout.spec.ts` | 1 | Pass ×3 | Integer-cent comparison |
| TC16 | Total = item total + tax across baskets (B1 rewrite) | `tests/regression/b1-cart-total.spec.ts` (1, 2, 6 items) | 3 | Pass ×3 | |
| TC17 | Cancel checkout (both steps) | `tests/checkout/checkout.spec.ts` | 2 | Pass ×3 | |
| TC18 | Order integrity / duplicate submission | Manual only | – | Not executed | Needs backend visibility |
| TC19 | Keyboard-only login and add to cart | `tests/accessibility/keyboard.spec.ts` | 1 | Pass ×3 | |
| TC19 | Visible focus | `tests/accessibility/keyboard.spec.ts` | 1 | Expected failure ×3 | **DEF-02**, screenshots attached |
| TC20 | Accessible names, error visibility, axe WCAG A/AA scan | `tests/accessibility/a11y.spec.ts` | 3 | Pass ×3 | axe JSON attached; 0 violations |
| TC21 | Responsive layout 375 px and 1366 px | `tests/accessibility/responsive.spec.ts` | 2 | Pass ×3 | Viewport emulation only |
| TC22 | Logout → direct `/inventory.html` blocked | `tests/security/session.spec.ts` | 1 | Pass ×3 | UI-level only |
| TC23 | Browser compatibility | Whole suite via `BROWSER=all` | 38 | Pass ×3 | Chromium, Firefox, WebKit executed |
| TC24 | Unauthenticated deep links | `tests/security/session.spec.ts` (5 URLs) | 5 | Pass ×3 | UI-level only |
| TC25 | `performance_glitch_user` login | `tests/auth/login.spec.ts` | 1 | Pass ×3 | Functional only, not a performance test |
| EX-01 | `problem_user` exploratory charter | Manual | – | Charter written; not executed as a timed session | DEF-01 found by automation probe |
