# Harvee Technologies — QA Automation Assessment Answers

**Candidate:** Chandramouli Kancharla
**Application under test:** https://www.saucedemo.com (public demo users only)
**Date of execution:** 2026-10-27

---

## Section A1 — Manual Test Suite

### A1.1 Test cases

Legend: **Type** = Positive / Negative / Boundary / Usability / Accessibility / Compatibility / Security. **Auto** = automation decision.
Common precondition "Logged in" = signed in as `standard_user` with an empty cart in a fresh browser session.

| ID | Area | Type | Title | Preconditions | Steps | Test Data | Expected Result | Priority | Automation Decision & Reason |
|----|------|------|-------|---------------|-------|-----------|-----------------|----------|------------------------------|
| TC01 | Auth | Positive | Valid login reaches Products | On login page | 1. Enter username and password<br>2. Click Login | `standard_user` / demo password | Products page (`/inventory.html`) shows the "Products" title and product list; no error | P1 | **Automate** — gateway to every journey, stable and high value |
| TC02 | Auth | Negative / Security | Locked-out user cannot log in | On login page | 1. Enter locked-out credentials<br>2. Click Login | `locked_out_user` / demo password | Error "Epic sadface: Sorry, this user has been locked out."; user stays on login page | P1 | **Automate** — access-control rule with an exact message |
| TC03 | Auth | Negative | Invalid credentials rejected | On login page | 1. Enter a valid user with a wrong password, then an unknown user with the right password<br>2. Click Login | `standard_user` + wrong password; `unknown_user` | Error "Username and password do not match any user in this service"; no access | P1 | **Automate** — data-driven, cheap |
| TC04 | Auth | Negative / Boundary | Empty login fields | On login page | 1. Leave both / username / password empty<br>2. Click Login | Empty strings | Username empty → "Username is required"; only password empty → "Password is required"; no access | P2 | **Automate** — parameterised validation |
| TC05 | Catalogue | Positive | Sort Name (A to Z) | Logged in; list sorted Z–A first | Select "Name (A to Z)" | 6 catalogue products | Every adjacent pair of names is in ascending order; same products and prices as before sorting | P2 | **Automate** — whole-list comparison is tedious manually |
| TC06 | Catalogue | Positive | Sort Price (low to high) | Logged in | Select "Price (low to high)" | 6 products incl. two at $15.99 | Every adjacent price is ≤ the next; equal prices accepted in any order; no product lost | P1 | **Automate** — regression risk (see B3) |
| TC07 | Catalogue | Positive | Sort Price (high to low) | Logged in | Select "Price (high to low)" | as above | Every adjacent price is ≥ the next | P2 | **Automate** |
| TC08 | Catalogue | Positive | Sort Name (Z to A) | Logged in | Select "Name (Z to A)" | as above | Every adjacent name is in descending order | P2 | **Automate** |
| TC09 | Cart | Positive | Badge on add/remove from Products page | Logged in | 1. Add Backpack and Bike Light<br>2. Remove Backpack on Products page<br>3. Open cart | Two named products | Badge 0→1→2→1; button toggles back to "Add to cart"; cart contains only Bike Light at its listed price | P1 | **Automate** — core state logic |
| TC10 | Cart | Positive | Remove items on Cart page | Logged in; 2 items in cart | 1. Open cart<br>2. Remove first item<br>3. Remove second item | Bolt T-Shirt, Onesie | Removed line disappears each time; badge 2→1→hidden; cart list empty | P1 | **Automate** |
| TC11 | Cart | Usability / Boundary | Empty cart behaviour | Logged in, nothing added | 1. Observe header<br>2. Open cart<br>3. Click Continue Shopping | – | No badge; cart has no items; returns to Products. *Note:* Checkout is still enabled with an empty cart (see Q1) | P2 | **Automate** the state checks; empty-cart checkout rule stays manual until clarified |
| TC12 | Checkout | Negative | Missing first name | Logged in; 1 item; on checkout step one | Fill last name and postal code, click Continue | First name empty | "Error: First Name is required"; stays on step one | P1 | **Automate** — parameterised (TC12–14) |
| TC13 | Checkout | Negative | Missing last name | as TC12 | Fill first name and postal code, click Continue | Last name empty | "Error: Last Name is required"; stays on step one | P1 | **Automate** |
| TC14 | Checkout | Negative | Missing postal code | as TC12 | Fill first and last name, click Continue | Postal code empty | "Error: Postal Code is required"; stays on step one | P1 | **Automate** |
| TC15 | Checkout | Positive | Complete order with two products | Logged in | 1. Add Backpack and Bolt T-Shirt; note prices<br>2. Cart → Checkout → valid details → Continue<br>3. Verify overview<br>4. Finish<br>5. Back Home | Test / Customer / 12345 | Cart and overview show the same items and prices; Item total = sum of prices; Total = Item total + Tax to the cent; "Thank you for your order!"; badge hidden and cart empty afterwards | P1 | **Automate** — main revenue journey |
| TC16 | Checkout | Positive / Boundary | Total calculation across basket sizes | Logged in | Repeat TC15 with 1, 2 and all 6 products | 3 baskets | Same rule holds for every basket; tax read from the page, not assumed | P1 | **Automate** — data-driven (also the B1 rewrite) |
| TC17 | Checkout | Usability | Cancel checkout without ordering | Logged in; items in cart | 1. Cancel on step one<br>2. Repeat to overview and Cancel | 1–2 items | No confirmation page; cart and badge unchanged; user leaves checkout (step one → Cart, overview → Products, as currently observed) | P2 | **Automate** |
| TC18 | Checkout | Negative / Security | Order integrity and duplicate submission | Logged in; on overview | 1. Double-click Finish quickly<br>2. After completion, press Back and Finish again<br>3. Refresh the complete page<br>4. Open checkout in two tabs and finish both | 1 item | Exactly one order recorded per intent; no duplicate charge; refresh/Back do not resubmit | P1 | **Manual only** — needs backend/order records, which Sauce Demo does not expose; automate at API level for a real system |
| TC19 | Accessibility | Accessibility | Keyboard-only use and visible focus | On login page | 1. Tab to Username, type; Tab to Password, type; Enter<br>2. Focus "Add to cart", press Enter<br>3. Observe a focus indicator on each control | Demo user | All steps operable by keyboard in a logical order; each focused control is visibly highlighted (WCAG 2.4.7) | P2 | **Automate** operability and pixel-diff focus check; **manual** confirmation of overall focus order. *Result: DEF-02 found* |
| TC20 | Accessibility | Accessibility | Accessible names, error visibility, automated scan | On login / logged in | 1. Inspect accessible names of inputs, buttons and the sort control<br>2. Submit empty login<br>3. Run axe on Login, Products, Cart | – | Controls have meaningful names; error is visible and specific; no critical/serious WCAG A/AA violations | P2 | **Automate** names and axe; **manual** screen-reader announcement check (NVDA/VoiceOver) |
| TC21 | UI | Compatibility / Usability | Responsive layout | Logged in | View Products at 375×667 and 1366×768; add a product | – | No horizontal scrolling; menu, cart and sort visible; add-to-cart works | P3 | **Automate** viewport smoke; **manual** visual review on real devices |
| TC22 | Security | Security | Protected page after logout | Logged in | 1. Menu → Logout<br>2. Navigate directly to `/inventory.html` | – | Login page with "You can only access '/inventory.html' when you are logged in."; no products shown | P1 | **Automate** — UI check only, not proof of backend authorisation |
| TC23 | Compatibility | Compatibility | Cross-browser smoke | Browsers installed | Run TC01–TC25 automated set on each engine | Chromium, Firefox, WebKit | Same results in every engine | P2 | **Automate** via Playwright projects; branded Safari/Edge remain manual |
| TC24 | Security | Security | Unauthenticated deep links | Fresh session, not logged in | Open `/cart.html`, `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html`, `/inventory-item.html?id=4` | – | Login page with the matching "You can only access …" error for each | P1 | **Automate** — parameterised |
| TC25 | Auth | Positive | performance_glitch_user can log in | On login page | Log in as `performance_glitch_user` | Demo user | Products page loads within the configured navigation timeout (15 s) | P3 | **Automate** — functional tolerance only, not a performance test |

### A1.2 Questions for the product owner (with working assumptions)

| # | Question | Assumption used until answered |
|---|----------|-------------------------------|
| Q1 | Should Checkout be possible with an empty cart? It currently is. | Not treated as a defect; recorded as an observation. |
| Q2 | What is the tax rule (rate, jurisdiction, rounding: per line or on the total)? | Tax is read from the page; only "Total = Item total + Tax to the cent" and "tax ≥ 0" are asserted. |
| Q3 | How should products with equal prices be ordered, and should name sorting be case- or locale-sensitive? | Ties may appear in any order; names are compared with English locale ordering. |
| Q4 | What are the validation rules for name and postal code (length, characters, whitespace-only, international formats)? | Only the documented "required" errors are tested; whitespace and format rules are left for clarification. |
| Q5 | Is the order idempotent: what should happen on double-clicking Finish, browser Back or refresh? | Expected exactly one order per checkout intent (TC18); not verifiable in this demo. |
| Q6 | Which browsers, devices and screen sizes are officially supported, and what accessibility standard is the target (WCAG 2.1/2.2 AA)? | Latest Chromium, Firefox and WebKit; 375 px and 1366 px widths; WCAG 2.1 AA. |
| Q7 | What should Cancel on the overview step do: return to the cart or to Products, and keep the cart? | Cart is kept; destination as currently observed. |

### A1.3 Exploratory testing charter — EX-01 (15 minutes)

**Charter:** Explore the catalogue, cart and checkout as `problem_user` to discover functional and visual defects that `standard_user` does not show.

| Item | Detail |
|------|--------|
| Time box | 15 min: 2 min setup, 11 min exploration, 2 min write-up |
| Scope | In scope: product list and images, product detail, all four sorts, add/remove, cart, checkout step one fields, overview totals, finish. Out of scope: other users, load, security probing. |
| Actions | Compare the product list against `standard_user` in a second browser profile. Try every sort option. Add and remove each product from both the list and the detail page. Open product details from image and title. Type into each checkout field and check the value sticks. Complete one order and compare totals with the item prices. Repeat one flow at 375 px width. |
| Observations to record | Timestamp; browser and version; viewport; exact steps; expected vs actual; screenshot or video; console errors; any network request failures visible in DevTools; whether it reproduces for `standard_user`. |
| Classifying findings | **Defect** (deviates from standard_user/expected behaviour) → severity by impact: S1 blocks purchase or wrong charge; S2 core feature wrong with a workaround (e.g. sorting); S3 cosmetic or minor. **Question** (behaviour unclear: raise with PO). **Test-data/environment issue** (reproduces only with specific data or an outage). **Idea** for new automated checks. |
| Debrief output | List of findings with IDs, severity, evidence and a suggestion for which to automate. |

*Already observed by automation (not a substitute for the session):* DEF-01, sorting has no effect for `problem_user`.

### A1.4 Testing strategy (under 150 words)

The UI layer keeps a thin, stable set of critical journeys. These run across three engines and assert business outcomes: whole-list ordering, subtotal + tax = total to the cent, an empty cart after an order, and blocked access after logout. Calculation rules, validation, comparators and authorisation belong in fast API and unit tests in the client's own codebase. They are not covered here because Sauce Demo exposes no supported API or source. Manual effort goes to exploratory charters, real-device and visual checks, screen-reader usability, and order-integrity scenarios that need backend visibility. **Largest remaining risk:** order integrity. The UI cannot confirm what the backend recorded or charged, whether a double submission creates duplicate orders, or whether protected endpoints enforce authorisation server-side.

---

## Section A2 — Automated Test Suite (summary)

The full framework and how to run it are in `README.md`; the case-by-case mapping is in `docs/traceability-matrix.md`.

- 38 tests per browser across 10 spec files, each prefixed with its manual ID. All mandatory scenarios are covered: TC01, TC02, TC06 plus the three other sorts, TC09 with cart-page removal and empty cart, TC15, the parameterised TC12–TC14, cancellation (TC17) and TC22.
- **Executed result (2026-10-27, retries 0):** 114/114 passed across Chromium 156, Firefox 157 and WebKit 27.2, including 6 expected failures for the two documented defects. 0 failed, 0 skipped, 0 flaky in the final run. The first run had 2 Firefox-only failures; these were investigated and attributed to local parallel-load contention (`docs/known-limitations.md`).

---

## Section B1 — Review of the AI-generated cart-total test

> **Note for the reviewer:** the original snippet was not available when this answer was prepared. The review below follows the defects listed in the assessment brief. Line references should be checked against the supplied code before submission.

### Defects found

| # | Defect | Why it matters | Fix in the rewrite |
|---|--------|----------------|--------------------|
| 1 | URL written in Markdown link form (e.g. `[https://...](https://...)`) inside `page.goto()` | Not a valid URL string, so navigation fails or goes to a wrong address | `baseURL` from `.env`; `page.goto('/')` inside `LoginPage` |
| 2 | Hard-coded URL and credentials | Cannot switch environments; credentials leak into source control | `utils/environment.ts` loads and validates `BASE_URL`, users and `PASSWORD` via dotenv/CI variables |
| 3 | No Page Object Model; raw selectors in the test | Duplication and brittle maintenance | `LoginPage`, `ProductsPage`, `CartPage`, `CheckoutPage`, `MenuComponent` |
| 4 | Ambiguous "Add to cart" locator (first/any button) | Adds an unknown product, or fails in strict mode | Button located inside the product card matched by **exact name** |
| 5 | No assertion that login succeeded | Later failures are misattributed; the test may run on the login page | `productsPage.expectLoaded()` (URL, title, items) |
| 6 | Fixed sleep (`waitForTimeout`) | Slow and flaky; hides timing problems | Web-first assertions only; ESLint rule bans `waitForTimeout` |
| 7 | Incomplete cart and checkout workflow | Does not exercise the total the test claims to check | Full journey: cart → information → overview → finish |
| 8 | Missing required checkout details | Checkout cannot continue; the test asserts nothing meaningful | `CUSTOMER` test data via `submitInformation()` |
| 9 | Weak truthy assertion (e.g. `expect(total).toBeTruthy()`) | Any non-empty text passes, including a wrong total | Exact integer-cent equality with descriptive messages |
| 10 | No subtotal + tax calculation | The business rule is never verified | `expectTotalsConsistent()`: Item total = Σ prices; Total = Item total + Tax |
| 11 | No currency parsing or cent-level comparison | Floating-point or string comparison gives false results | `parseMoneyToCents()` converts "$43.18" → 4318 |
| 12 | No order-completion or empty-cart check | A broken Finish step or leftover cart goes unnoticed | Asserts "Thank you for your order!", badge hidden, cart empty after Back Home |
| 13 | No manual test ID | No traceability to requirements | Titles prefixed `TC16` (and TC15 for the main journey) |

### Rewritten test (`tests/regression/b1-cart-total.spec.ts`, executed and passing ×3 browsers)

```ts
const BASKETS = [
  { case: 'one product', products: [PRODUCTS.onesie] },
  { case: 'two products', products: [PRODUCTS.backpack, PRODUCTS.bikeLight] },
  { case: 'all six products', products: Object.values(PRODUCTS) },
];

for (const basket of BASKETS) {
  test(`TC16 order total equals item total plus tax for ${basket.case}`, async ({
    loggedInProductsPage: productsPage, menu, cartPage, checkoutPage,
  }) => {
    const selected = await productsPage.addProductsToCart(basket.products);
    await menu.expectCartCount(selected.length);

    await menu.openCart();
    await cartPage.expectLoaded();
    expectSameLineItems(await cartPage.getLineItems(), selected, 'cart items and prices');
    await cartPage.checkout();
    await checkoutPage.submitInformation(CUSTOMER);
    await checkoutPage.expectStep('overview');

    expectSameLineItems(await checkoutPage.getOverviewItems(), selected, 'overview items');
    expectTotalsConsistent(selected, await checkoutPage.getTotals());

    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText(MESSAGES.orderComplete);
    await checkoutPage.backHome();
    await productsPage.expectLoaded();
    await menu.expectCartCount(0);
  });
}
```

The login, which includes the success assertion, happens in the `loggedInProductsPage` fixture. The tax rate is never hard-coded.

---

## Section B2 — AI Evaluation Plan: Test Case Generator

**System under evaluation:** an AI tool that takes a requirement or user story and returns test cases as JSON in a fixed schema.
**Evaluation set:** 30–50 curated requirements (simple, complex, ambiguous and adversarial), each with a reviewer-approved list of required test conditions and a list of explicitly out-of-scope behaviours.

| Check | Evaluation input | Expected outcome | Scoring method | Pass criteria | Failure severity |
|-------|------------------|------------------|----------------|---------------|------------------|
| **1. Requirement coverage** | Requirement + gold list of acceptance criteria / test conditions (positive, negative, boundary) | Every acceptance criterion is covered by at least one generated case that verifies it | **Rubric + human review.** An LLM or keyword pre-match proposes mappings and a QA reviewer confirms. Score = covered criteria ÷ total | ≥ 95% overall and 100% of P1/critical criteria per requirement | **High**: missed criteria give false confidence and let defects ship |
| **2. Invented or unsupported requirements** | Same requirement plus a list of known out-of-scope items, and "trap" requirements that deliberately omit details (e.g. no tax rate) | Cases only assert behaviour stated in, or directly implied by, the requirement; unknowns are raised as questions, not invented as expected results | **Human review with rubric**, assisted by automatic flagging of numbers, messages or rules not present in the input | 0 invented expected results in critical areas; ≤ 2% of cases flagged overall | **Critical**: invented rules become wrong assertions, wrong defects or wrong sign-off |
| **3. Duplicate / low-value cases** | Generated suite for each requirement | No two cases test the same condition with the same data; every case has a distinct purpose | **Automatic** similarity on normalised title, steps and expected result (e.g. embedding cosine > 0.9), then **human review** of flagged pairs | ≤ 5% near-duplicates; ≤ 10% of cases rated "low value" by the reviewer | **Medium**: wastes execution and maintenance effort and hides gaps |
| **4. Fixed JSON schema validity** | Raw model output for every requirement, including long and adversarial inputs | Output parses as JSON and validates against the agreed JSON Schema (required fields, enums such as priority P1–P3, types, no extra keys) | **Automatic**: `JSON.parse` + JSON Schema validator (e.g. Ajv) in CI | 100% of outputs valid; any failure blocks the release of the generator version | **Critical**: one invalid payload can break the import pipeline |

**Why these two failures are serious downstream:**
- **Invalid JSON** breaks the automated pipeline that imports cases into the test-management tool or generates test code. Depending on the parser, it either fails the whole batch or, worse, partially imports and drops cases silently. That creates coverage gaps no one sees, and tolerant parsers can mis-map fields (e.g. priority).
- **Invented requirements** look authoritative. Testers or generated scripts then assert behaviour the business never agreed to. This produces false defect reports, wasted developer time, or tests that "pass" against a fictional rule while the real rule is untested. In regulated or financial flows (tax, totals), that can mean signing off incorrect behaviour.

---

## Section B3 — Jira Defect Report

**Title:** `[Release 4.2.0][Catalogue] Price (low to high) displays $29.99 before $15.99`

| Field | Value |
|-------|-------|
| Project / Component | Web shop / Catalogue — product sorting |
| Issue type | Bug (regression) |
| Affects version | 4.2.0 |
| Environment | Environment name / URL: *to capture*. Browser and version: *to capture*. OS: *to capture*. Device / viewport: *to capture*. User account / role: *to capture*. Build number / commit: *to capture*. |
| Preconditions | Logged in to the shop on release 4.2.0; Products page contains items priced $15.99 and $29.99 (at minimum). |
| Reproducibility | Reproduced on **every observed run since release 4.2.0** (exact number of runs and dates: *to capture*). |

**Steps to reproduce**
1. Log in and open the Products page.
2. Open the sort dropdown and select **"Price (low to high)"**.
3. Read the product prices from top to bottom.

**Expected result:** Products are displayed in ascending price order: every price is less than or equal to the next. A $15.99 product appears before a $29.99 product.

**Actual result:** A product priced **$29.99 is displayed before a product priced $15.99**, so the list is not in ascending price order.

**Severity:** **Major (S2).** A core catalogue feature returns wrong results on every run, and customers comparing prices are shown a misleading order. It is not Critical because a workaround exists (scan the list or use another sort), and there is no evidence of data loss or wrong charges.
**Priority (recommendation):** **High.** It is a visible, fully reproducible regression in the release candidate, so it should be fixed before the 4.2.0 release or explicitly accepted by the product owner with mitigation (see B4).

**Business impact note:** Incorrect sorting harms the shopping experience and may reduce trust or conversion. **It does not by itself show that customers are charged incorrectly.** Order totals come from the cart and checkout, which need to be verified separately (checkout total tests were not reported as failing for this sorting issue).

**Evidence to attach:** screen recording of steps 1–3; screenshot of the incorrect order with prices visible; full list of displayed prices and names; browser console log; network request/response for the product list, if sorting is server-side; failing automated test output (e.g. TC06 assertion showing the out-of-order pair); build/version identifier; comparison with the last good release, if available.

**Additional information to capture:** whether other sorts (high→low, A–Z, Z–A) are affected; whether it affects all users or some; whether price formatting (e.g. string vs numeric comparison) is involved.

---

## Section B4 — Client Communication (Slack, under 150 words)

> Hi [PM name], status ahead of Friday's 4.2.0 release.
>
> **Recommendation: no-go for Friday as built; go as soon as the sorting fix is verified.**
>
> "Price (low to high)" has shown products in the wrong order on every run since 4.2.0. Shoppers comparing prices will see misleading results. It's a visible quality problem, though we have no evidence it changes what customers pay.
>
> **If Friday can't move:** release with that sort option hidden or defaulted to name order, plus a known-issue note and a dated follow-up fix.
>
> Separately, one checkout test fails about 1 run in 10 and passes on rerun. We don't yet know whether the cause is the test, test data/environment, or the product. Today we're reviewing traces and logs and re-running it repeatedly. I'll confirm by [time] whether it affects the decision.
>
> Happy to join a quick call. — Chandramouli

---

## Section C — Interview Preparation

### C1 — "Checkout is failing for some users. How do you investigate?"

1. **Clarify impact first.**
   - What does "failing" mean: an error, a hang, a wrong total, or payment declined?
   - Since when, how many users or what % of orders, and which regions, browsers, devices, payment methods, account types or cart contents?
   - Is revenue being lost now? This sets the severity and who to involve.
2. **Recent change history.**
   - Check releases, feature flags, configuration, infrastructure and third-party changes (payment gateway, tax or address service) in the window before the first report.
   - Correlate the start time with deployments.
3. **Gather evidence.**
   - Application and API logs filtered by error and correlation ID.
   - Monitoring dashboards: error rate, latency, checkout conversion.
   - Distributed traces for failed sessions, payment-provider status, browser console and network (HAR) captures from affected users, and support tickets.
4. **Reproduce safely.**
   - Use a test or staging environment, or production test accounts with sandbox payments. Never use real customer cards or data.
   - Reproduce with the affected users' characteristics (browser, locale, cart, coupon, address).
5. **Compare affected and unaffected users.**
   - Look for the differentiating factor: browser version, region or CDN node, account age, cart size, specific product, feature-flag cohort, payment method.
6. **Classify the cause.**
   - **Product defect:** code or logic error, reproducible with valid data.
   - **Test data:** a specific product, price or account state.
   - **Environment or config:** one node, a certificate, a cache, a flag.
   - **Dependency:** the payment or tax provider is degraded.
   - Rule each one in or out with evidence, not assumptions.
7. **Communicate and escalate.**
   - Give an early acknowledgement with the known impact, then updates at a fixed interval (e.g. every 30–60 min): what we know, what we don't, next step and ETA.
   - Escalate to on-call engineering, product and the vendor according to severity.
   - Keep one incident channel and a timeline.
8. **Confirm, mitigate, prevent.**
   - Confirm the root cause by reproducing it and showing that the fix removes it.
   - Mitigate fast: roll back, turn off the feature flag, or fail over.
   - Verify with monitoring after the fix.
   - Prevent recurrence:
     - an automated regression test at the right layer;
     - an alert on the leading signal;
     - a contract test for the dependency;
     - a blameless post-incident review with owners and dates for each action.

### C2 — "Tell us about a recent production issue you handled" (template)

> ⚠️ **PERSONALISE BEFORE SUBMISSION.** Fill every `[…]` with your own real experience. Do not use invented details. Delete this note when done.

| Part | What to say (fill in) |
|------|-----------------------|
| Context | `[Product/system, your role, team size, time period]` |
| Discovery | `[How it was found: monitoring alert / customer ticket / your test / exploratory session. Date and time]` |
| Impact | `[Who and how many were affected, business effect (orders, revenue, SLA), duration]` |
| Investigation | `[Evidence you gathered: logs, traces, reproduction steps; how you narrowed it down]` |
| Root cause | `[Technical cause and why existing tests didn't catch it]` |
| Client / stakeholder communication | `[Who you informed, when, how often; how you explained impact without jargon]` |
| Fix and mitigation | `[Immediate mitigation, permanent fix, how you verified it]` |
| Preventive actions | `[New automated tests, monitoring/alerts, process changes, owners]` |
| Evidence of effectiveness | `[Metric or observation after the change, e.g. "no recurrence in N releases", "alert caught a similar issue on DATE"]` |
| Lessons learned | `[What you would do differently; what you now do by default]` |

*Structure tip:* tell it in STAR order (Situation, Task, Action, Result) in about 2 minutes, and give concrete numbers only if they are real.
