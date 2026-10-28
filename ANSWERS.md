# Harvee Technologies — QA Automation Assessment Answers

**Name:** Chandramouli Kancharla
**Role:** QA Automation Tester
**Application under test:** https://www.saucedemo.com (public demo users only)
**Executed:** 27–28 October 2026, Chromium, Firefox and WebKit (Safari engine)

This file holds the written answers. How to set up and run the automation, and the manual-to-automated mapping, are in [README.md](README.md). The full manual suite with step-by-step expected results and actual results is in [manual_test_cases/SauceDemo_Functional_Test_Cases.xlsx](manual_test_cases/SauceDemo_Functional_Test_Cases.xlsx).

**Contents:** [A1 Manual suite](#section-a1--manual-test-suite) · [A2 Automation](#section-a2--automation-suite-summary) · [B1](#section-b1--review-of-the-ai-generated-cart-total-test) · [B2](#section-b2--ai-evaluation-plan-test-case-generator) · [B3](#section-b3--jira-defect-report) · [B4](#section-b4--message-to-the-client) · [C notes](#section-c--notes-for-the-live-discussion)

---

## Section A1 — Manual test suite

### A1.1 Questions for the product owner, and the assumption tested

| # | Question | Assumption used until answered |
|---|----------|-------------------------------|
| Q1 | Should Checkout be possible with an empty cart? Today it is, and the overview shows a $0.00 order with a Finish button. | An order needs at least one item. Tested in TC72/TC73 and reported as BUG-03, to be confirmed. |
| Q2 | What is the tax rule: rate, region, and rounding per line or on the total? | Tax is read from the page. Only "Item total = sum of prices", "Total = Item total + Tax to the cent" and "Tax ≥ 0" are asserted. |
| Q3 | How should products with the same price be ordered, and is name sorting case- or language-sensitive? | Equal prices may appear in either order. Names use English alphabetical order. |
| Q4 | Is the postal code checked against a format? Are names made only of spaces, very long names, or non-English letters allowed? | Only the three "is required" errors are confirmed rules. Spaces-only names are expected to be rejected (TC70, reported as BUG-02, to be confirmed). Other formats are accepted. |
| Q5 | Must one checkout create exactly one order, even after a double-click on Finish, Back, refresh, or finishing in two tabs? | Yes, one order per checkout (TC19, TC82). The real order count needs an API or database, which the demo does not expose. |
| Q6 | Which browsers, screen sizes and accessibility standard must be supported? | Latest Chrome, Firefox and Safari (WebKit), 375 px and 1366 px widths, WCAG 2.2 A/AA. |
| Q7 | What should Cancel on the overview do: back to the cart or to Products, and is the cart kept? | The cart is kept. The page it goes to is taken as currently observed (Products). |
| Q8 | Does a cart belong to a user? Should it be cleared on logout or hidden from the next user on the same browser? | Yes, a user must not see another user's cart (TC60, reported as BUG-06). The same user may get their cart back after logging in again (TC59). |

### A1.2 Test cases (25 core cases)

These are the 25 core cases from the Excel sheet **Core Test Cases (A1)**, where every step has its own expected result. Here the steps are shortened.
**Common pre-condition "Logged in":** a new private browser window, logged in as `standard_user` with password `secret_sauce`, empty cart.

| ID | Area | Type | Title | Pre-conditions | Steps | Test data | Expected result | Priority | Automate? and why |
|----|------|------|-------|----------------|-------|-----------|-----------------|:--:|-------------------|
| TC01 | Login | Positive | Login with a valid user | New private window, on login page | 1. Enter username and password 2. Click Login | `standard_user` / `secret_sauce` | Products page (`/inventory.html`), title "Products", products listed, no error, no cart number | P1 | Yes – smoke test on every build; every journey starts here |
| TC02 | Login | Negative | Login with a locked user | On login page | 1. Enter locked user and password 2. Click Login | `locked_out_user` | "Epic sadface: Sorry, this user has been locked out."; stays on login page | P1 | Yes – access rule with an exact message |
| TC03 | Login | Negative | Login with a wrong password | On login page | 1. Enter valid user, wrong password 2. Click Login | `standard_user` / `not_the_demo_password` | "Epic sadface: Username and password do not match any user in this service"; no access | P1 | Yes – access rule, cheap and stable |
| TC04 | Login | Negative / Boundary | Login with both fields empty | On login page | Click Login with both fields empty | (empty) / (empty) | "Epic sadface: Username is required"; no access | P2 | Yes – required-field rule |
| TC05 | Sorting | Positive | Sort by "Name (A to Z)" | Logged in | 1. Note all names and prices 2. Select Z to A, then A to Z 3. Read the whole list | 6 products | Every name ≤ the next; same 6 products and prices; dropdown shows "Name (A to Z)" | P2 | Yes – whole-list check is slow by hand |
| TC06 | Sorting | Positive | Sort by "Name (Z to A)" | Logged in | Select A to Z, then Z to A; read the whole list | 6 products | Every name ≥ the next; nothing lost or re-priced | P2 | Yes – whole-list check |
| TC07 | Sorting | Positive | Sort by "Price (low to high)" | Logged in | Select high to low, then low to high; read every price | 6 products, two at $15.99 | $7.99, $9.99, $15.99, $15.99, $29.99, $49.99 – every price ≤ the next | P1 | Yes – whole list; this is the B3 regression |
| TC08 | Sorting | Positive | Sort by "Price (high to low)" | Logged in | Select low to high, then high to low; read every price | 6 products | Every price ≥ the next | P2 | Yes – whole-list check |
| TC09 | Cart | Positive | Add two products and remove one from the Products page | Logged in | 1. Add Backpack and Bike Light 2. Remove Backpack on Products 3. Open cart | Backpack $29.99, Bike Light $9.99 | Badge 2, then 1; Backpack button back to "Add to cart"; cart holds only Bike Light $9.99 | P1 | Yes – core cart rule (badge and contents) |
| TC10 | Cart | Positive | Remove products on the Cart page | Logged in | 1. Add Bolt T-Shirt and Onesie 2. Open cart 3. Remove each | Bolt T-Shirt $15.99, Onesie $7.99 | Each line disappears; badge 2 → 1 → hidden; cart empty | P1 | Yes – core cart rule |
| TC11 | Cart | Positive | New session starts with an empty cart | Logged in | 1. Look at badge and buttons 2. Open cart 3. Continue Shopping | – | No badge, no "Remove" buttons, cart empty, back on Products | P2 | Yes – cheap empty-state check |
| TC12 | Checkout | Positive | Place an order with two products | Logged in | 1. Add Backpack and Bolt T-Shirt 2. Cart → Checkout → details → Continue 3. Check overview 4. Finish 5. Back Home, open cart | Test / Customer / 12345 | Same items and prices in cart and overview; Item total $45.98; Total = Item total + Tax to the cent; "Thank you for your order!"; cart empty | P1 | Yes – main money journey |
| TC13 | Checkout | Negative | Checkout without First Name | Logged in, Onesie in cart, on "Your Information" | Leave First Name empty, fill the rest, Continue | (empty) / Customer / 12345 | "Error: First Name is required"; stays on step one | P1 | Yes – one parameterized test with TC14, TC15 |
| TC14 | Checkout | Negative | Checkout without Last Name | as TC13 | Leave Last Name empty, Continue | Test / (empty) / 12345 | "Error: Last Name is required"; stays on step one | P1 | Yes – same parameterized test |
| TC15 | Checkout | Negative | Checkout without Zip/Postal Code | as TC13 | Leave Postal Code empty, Continue | Test / Customer / (empty) | "Error: Postal Code is required"; stays on step one | P1 | Yes – same parameterized test |
| TC16 | Checkout | Positive | Cancel on the "Your Information" page | Logged in, Fleece Jacket in cart | Cart → Checkout → Cancel | Fleece Jacket $49.99 | Back on the cart; item still there; badge 1; no order | P2 | Yes – Cancel must never place an order |
| TC17 | Checkout | Positive | Cancel on the "Overview" page | Logged in, Backpack and Onesie in cart | Checkout → details → Continue → Cancel | Test / Customer / 12345 | No confirmation; Products page; badge 2; both items still in the cart | P2 | Yes – Cancel must never place an order |
| TC18 | Order Total | Positive / Boundary | Order total for all six products | Logged in | Add all 6 → checkout → check totals → Finish → Back Home | All 6 products | Item total $129.94; Total = Item total + Tax; confirmation; cart empty | P1 | Yes – largest basket, boundary for the total rule |
| TC19 | Order Completion | Negative | Double-click Finish | Logged in, Onesie at overview | Double-click Finish very fast | Onesie | One "Thank you for your order!" page, no error | P1 | Yes – for what the user sees; the real order count needs an API/DB check |
| TC20 | Checkout | Usability | Typed values stay after an error | Logged in, Onesie in cart, on "Your Information" | Fill names, leave Postal Code empty, Continue | Test / Customer / (empty) | Postal-code error shown; "Test" and "Customer" are still in the fields | P3 | Yes – stable usability check |
| TC21 | Session | Security | Products page cannot be opened after logout | Logged in | 1. Menu → Logout 2. Type `/inventory.html` in the address bar | – | Login page with "Epic sadface: You can only access '/inventory.html' when you are logged in."; no products | P1 | Yes – security rule from the brief |
| TC22 | Session | Security | Open `/cart.html` without logging in | New private window, not logged in | Type `/cart.html` in the address bar | – | Login page with "You can only access '/cart.html' when you are logged in."; no cart icon | P1 | Yes – security rule, fast and stable |
| TC23 | Accessibility | Accessibility | Log in and add a product using only the keyboard | On login page, no mouse | Tab to Username, type; Tab to Password, type; Enter; focus "Add to cart" on Backpack, Enter | `standard_user` | Login and add-to-cart work by keyboard; button shows "Remove"; badge 1 | P2 | Yes – automated as AC03; screen-reader use stays manual |
| TC24 | Screen size | Compatibility | Products page works on a mobile and a desktop screen | Logged in | At 375×667 and at 1366×768: look at the page, add Backpack | Two window sizes | No sideways scrolling; menu, cart icon and sort visible; badge 1 | P3 | Yes – automated as AC14; real phones stay manual |
| TC25 | Sorting | Positive | Sort by "Price (low to high)" as problem_user | Logged in as `problem_user` | Select "Price (low to high)"; read every price | `problem_user` | Every price ≤ the next | P1 | Yes – known bug (BUG-01); the test shows when it is fixed |

**Coverage of the brief:** positive, negative and boundary (TC04, TC18); usability (TC20); browser and screen size (TC24, and every case runs in three browsers); accessibility (TC23); security (TC21, TC22). Every business rule in the brief has at least one P1 case.

**Executed result (manual, 27–28 Oct 2026, Chrome, Firefox and Safari engines):** 24 passed, 1 failed (TC25 → BUG-01).

### A1.3 Exploratory charter — EX-01 (15 minutes, `problem_user`)

**Charter:** Explore the catalogue, cart and checkout as `problem_user` to find defects that `standard_user` does not show.

| Item | Detail |
|------|--------|
| Time box | 15 min: 2 min setup, 11 min exploring, 2 min notes |
| Scope | In: product list and images, product page, the four sorts, add/remove, cart, checkout fields, overview totals, Finish. Out: other users, load, security probing. |
| Ideas to try | Compare the list with `standard_user` in a second private window. Try every sort. Add and remove each product from the list and from the product page. Open a product by image and by name. Type in each checkout field and check the value stays. Finish one order and compare totals with the prices. Repeat one flow at 375 px width. |
| Record | Time, browser and version, window size, exact steps, expected vs actual, screenshot or video, console errors, and whether `standard_user` shows the same. |
| Classify findings | **Bug**, with severity by impact: blocks purchase or wrong charge = High; core feature wrong with a workaround = Medium; cosmetic = Low. **Question** for the product owner. **Test data / environment** issue. **Idea** for a new automated check. |
| Output | Findings with IDs, severity and evidence, plus which ones to automate. |

*Already found during test design (the session is still to be run as a timed session):* sorting does nothing (BUG-01), the checkout form changes the typed names (BUG-09), every product shows the wrong image (BUG-10).

### A1.4 Strategy (under 150 words)

**UI automation, three browsers:** the 25 core journeys: login, all four sorts checked across the whole list, cart badge and contents, checkout errors, totals to the cent, Cancel, and blocked pages after logout. A smoke set runs on every build and the full set nightly.
**API or unit layer, if the client has one:** tax and total calculation, sort logic, field validation, server-side login and session checks, and one order per checkout. These are faster and more exact there.
**Manual:** the `problem_user` charter, screen readers, real phones, visual layout, and the open questions Q1–Q8 until they are answered.
**Biggest remaining risk to report:** login and the cart are enforced only in the browser. A hand-made cookie opens the shop without a password, one user's cart is shown to the next user, and the UI cannot prove what the server recorded or charged.

*(142 words)*

---

## Section A2 — Automation suite (summary)

Setup, run commands, the manual → automated mapping table and the "200 tests" paragraph are in [README.md](README.md).

- **Stack:** Playwright Test + TypeScript, scenarios written in Gherkin (playwright-bdd), Page Object Model, config in `config/.env.<ENV>`.
- **Required cases:** all 25 core cases are automated, each named and tagged with its manual ID (`TC07 Sorting - "Price (low to high)" orders the entire product list`). TC23 and TC24 live in the accessibility feature, named `TC23 AC03 Keyboard-Login …` and `TC24 AC14 Responsive …`. The six cases the brief requires: TC01 + TC02 (login and locked user), TC07 (price sort, whole list), TC09 (add two, remove one, badge and cart), TC12 (full checkout, Total = Item total + Tax, cart empty), TC13–TC15 (one parameterized test for the three errors), TC21 (Products page by URL after logout).
- **Result, final run (retries 0), core set** (`npm run test:core`, log `evidence/final-core-run-all-browsers-2-workers.log`): 26 scenarios per browser (TC03/TC04 single cases, TC13–TC15 three rows, AC14 two sizes): **25 passed + 1 expected failure (TC25, BUG-01) in each of Chromium, Firefox and WebKit.**
- **Requirements met:** no locators in steps or features (page objects only); no fixed sleeps (ESLint bans `waitForTimeout`); base URL and users from config/environment variables; each scenario opens a fresh browser context and logs in itself, and runs fully parallel in any order; screenshot, video and trace kept on failure; HTML, JUnit XML and Cucumber reports.

---

## Section B1 — Review of the AI-generated cart-total test

### Problems found

| # | Line in the snippet | Problem | Why it matters |
|---|---------------------|---------|----------------|
| 1 | Test name `'cart total is correct'` | The test does not check that the total is correct (see 12). No manual case ID. | The name promises something the test never checks. It can't be traced to a manual case. |
| 2 | `page.goto('https://www.saucedemo.com')` | Base URL hard-coded in the test. (As pasted in the brief it is even in Markdown link form `[url](url)`, which is not a valid URL if copied as is.) | Can't switch environments; every test needs editing when the URL changes. |
| 3 | `page.fill('#user-name', 'standard_user')`, `page.fill('#password', 'secret_sauce')` | User and password hard-coded. | Credentials end up in source control; no way to use other users or environments. |
| 4 | All lines | Raw selectors in the test body, no Page Object. Uses the old `page.fill`/`page.click` calls, not locators. | Selectors are repeated in every test; one UI change breaks many tests. |
| 5 | After `#login-button` | No check that login worked. | If login fails, the test fails later with a misleading error, or reads the wrong page. |
| 6 | `page.click('text=Add to cart')` | Matches **six** buttons. `page.click` takes the first one, whichever product that is. | The test doesn't know which product or price it added, so it can't calculate the expected total. |
| 7 | `page.waitForTimeout(3000)` | Fixed sleep. | Adds 3 s to every run, still flaky on a slow day, and hides timing problems. |
| 8 | After adding / `.shopping_cart_link` | No check of the badge, the cart contents or that the cart page opened. | A product that never reached the cart is not noticed until the end. |
| 9 | `'A'`, `'B'`, `'1'` | Throw-away data hard-coded in the test. | Not realistic data, and not reusable. |
| 10 | After `#continue` | No check that the Overview page opened. | If an error stopped checkout, `.summary_total_label` is never found and the test times out with an unclear error. |
| 11 | `textContent()` then `expect(...)` | Reads the text once instead of using an auto-waiting assertion. | Not a web-first assertion; can read the page before it is ready. |
| 12 | `expect(total).toBeTruthy()` | Any non-empty text passes: the label always says "Total: $…", so even "Total: $0.00" or a wrong total passes. | **The business rule is never checked.** The test can't fail for a wrong total. |
| 13 | Whole test | Item total and tax are not read; no check that Item total = sum of prices and Total = Item total + Tax; no money parsing (floating-point risk). | The thing the test is named for is missing. |
| 14 | Whole test | One basket only; the order is never finished; the empty cart afterwards is not checked. | One basket can hide a summing bug; the brief's "Finish empties the cart" rule is left out. |

### Rewritten test

On this framework it is the **TC18 / TC75 / TC76** scenario outline in [`src/test/features/UI/OrderTotals.feature`](src/test/features/UI/OrderTotals.feature). It runs and passes in all three browsers:

```gherkin
Background:
  Given I am logged in as the "standard" user        # asserts Products page and empty cart

Scenario Outline: <id> OrderTotal - Order total equals item total plus tax for <basket>
  When I add the products "<products>" to the cart   # each price is recorded as it is added
  Then the cart badge should show <count>
  When I open the cart
  Then the Cart page should be displayed
  And the cart should contain exactly the selected products at their listed prices
  When I proceed to checkout
  And I submit valid checkout information            # customer data from test data, not the test
  Then the checkout "overview" step should be displayed
  And the overview should list exactly the selected products at their listed prices
  And the order totals should equal the selected prices plus tax
  When I finish the order
  Then I should see the order confirmation "Thank you for your order!"
  When I go back home from the confirmation
  Then the Products page should be displayed
  And the cart badge should be hidden

  @TC75 @P1 @extended
  Examples: One product
    | id   | basket      | count | products          |
    | TC75 | one product | 1     | Sauce Labs Onesie |

  @TC76 @P1 @extended
  Examples: Two products
    | id   | basket       | count | products                                   |
    | TC76 | two products | 2     | Sauce Labs Backpack, Sauce Labs Bike Light |

  @TC18 @P1 @core
  Examples: All six products
    | id   | basket           | count | products                       |
    | TC18 | all six products | 6     | (all six product names)        |
```

The key check (`src/test/support/assertions.ts`), with money as integer cents:

```ts
export function expectTotalsConsistent(items: readonly LineItem[], totals: OrderTotals): void {
  const expectedSubtotal = sumCents(items.map((item) => item.priceCents));
  expect(totals.subtotalCents, `Item total ... should equal the sum of item prices ...`).toBe(expectedSubtotal);
  expect(totals.taxCents, 'Tax should not be negative').toBeGreaterThanOrEqual(0);
  expect(totals.totalCents, `Total ... should equal item total ... + tax ...`).toBe(
    totals.subtotalCents + totals.taxCents,
  );
}
```

How each problem is fixed: base URL and users come from `config/.env.<ENV>` (2, 3); all selectors live in `LoginPage`, `ProductsPage`, `CartPage`, `CheckoutPage` (4); login, cart, overview and confirmation pages are each asserted (5, 8, 10); products are picked by **exact name** inside their own card (6); only auto-waiting assertions, and ESLint fails the build on `waitForTimeout` (7, 11); customer data comes from `src/test/data` (9); the totals are read as cents and checked against the prices recorded when each product was added, the tax is read from the page and not assumed (12, 13); three basket sizes, Finish, and an empty cart at the end (14); the name starts with the manual ID (1).

---

## Section B2 — AI evaluation plan: test case generator

**Scenario chosen:** 3, the test case generator (user story in, test cases out in a fixed JSON format that is imported straight into the test management tool).
**Evaluation set:** 30–50 user stories (simple, complex, unclear and adversarial), each with a reviewer-approved list of the test conditions it must cover and a list of things that are out of scope.

| Check | Input | Expected outcome | How it is scored | Pass mark | Cost of failure |
|-------|-------|------------------|------------------|-----------|-----------------|
| **1. Coverage** | Story + agreed list of acceptance criteria (positive, negative, boundary) | Every criterion is covered by at least one generated case | **Rubric + human review.** A keyword or LLM pre-match proposes which case covers which criterion; a QA reviewer confirms. Score = covered ÷ total | ≥ 95% overall, 100% of P1 criteria | High – missed criteria give false confidence |
| **2. Invented requirements** | Same story, plus "trap" stories that leave details out (e.g. no tax rate) | Cases only assert what the story says or clearly implies; unknowns become questions | **Human review with a rubric**, helped by automatic flagging of numbers, messages and rules not found in the input | 0 invented expected results in critical areas; ≤ 2% overall | Critical – invented rules become wrong tests and wrong bug reports |
| **3. Duplicates** | The generated cases for each story | No two cases test the same condition with the same data | **Automatic** similarity on title, steps and expected result (e.g. embedding cosine > 0.9), then **human review** of flagged pairs | ≤ 5% near-duplicates | Medium – wasted runs and maintenance, hides gaps |
| **4. JSON format** | Raw output for every story, including very long and adversarial ones | Output parses and matches the agreed JSON Schema (required fields, enums such as P1–P3, types, no extra keys) | **Automatic:** `JSON.parse` + schema validator (e.g. Ajv) in CI | 100% valid; any failure blocks that generator version | Critical – one bad payload can break the import |

**Why the last two columns matter:** broken JSON either fails the whole import or, worse, imports part of it and silently drops cases. Invented requirements look official, so testers and scripts end up checking rules the business never agreed to: false bug reports, or tests that pass against a rule that does not exist while the real rule goes untested.

---

## Section B3 — Jira defect report

**Title:** `[4.2.0] Products: "Price (low to high)" shows $29.99 before $15.99`

| Field | Value |
|-------|-------|
| Project / Component | Web shop / Products – sorting |
| Issue type | Bug (regression) |
| Affects version | 4.2.0 |
| Environment | Release 4.2.0 on the QA environment (URL and build number from the CI run); Google Chrome desktop, exact version from `chrome://version`; Windows 11; 1366×768; user `standard_user` |
| Reproducibility | Every run since 4.2.0 (manual and automated, list of run dates attached). Not seen on the previous release. |
| Linked test | TC07 Sort by "Price (low to high)" (manual and automated) |

**Steps to reproduce**
1. Open the shop and log in as `standard_user`.
2. On the Products page, open the sort dropdown and select **"Price (low to high)"**.
3. Read the prices from top to bottom.

**Expected result:** prices go from lowest to highest; every price is less than or equal to the next. A $15.99 item appears before a $29.99 item.

**Actual result:** an item at **$29.99 is shown before an item at $15.99**, so the list is not in price order. The dropdown shows "Price (low to high)".

**Severity: Major.** A core shopping feature gives wrong results on every run, and customers comparing prices see a misleading order. Not Critical: shoppers can still find and buy every product, and nothing shows that the price charged is wrong.
**Priority (suggested): High.** It is a visible, always-reproducible regression in the release candidate. Fix before release, or have the product owner accept it with a workaround (see B4).

**Evidence to attach:** screen recording of steps 1–3; screenshot with the prices visible; the full list of names and prices as shown; the failing automated test output (TC07 message names the out-of-order pair) with its trace; browser console log; the product-list network response if sorting is done on the server; build number; the same steps passing on the previous release.

**Also check and note:** whether the other three sorts are affected; whether other browsers and users are affected; whether prices are compared as text instead of numbers.

---

## Section B4 — Message to the client

> Hi [name], here's where Friday's release stands.
>
> **One real problem:** sorting by "Price (low to high)" shows products in the wrong order, every time. Customers comparing prices would see a confusing list. Prices charged are not affected.
>
> **One unclear result:** one checkout test fails about 1 run in 10 and passes when re-run. We are checking today whether the test or the shop causes it, and I'll update you by 4 pm.
>
> **My recommendation:** release Friday only if the sorting fix is in and re-tested by Friday morning.
>
> **If the fix isn't ready:** release Friday with that one sort option hidden, add a short known-issue note, and ship the fix next week. Everything else is ready.
>
> Happy to talk it through on a quick call.
> Chandramouli

*(126 words.)*

---

## Section C — Notes for the live discussion

### C1 — "Checkout has been failing for some users since this morning"

1. **Ask first:** What does "failing" look like (error, hang, wrong total, payment declined)? Since when exactly? How many users, and which browsers, devices, regions, payment methods or account types? Is it still happening? Can you send a screenshot or an order ID?
2. **Check what changed:** releases, feature flags, config, infrastructure and third parties (payment, tax, address service) shortly before the first report. Line up the start time with deployments.
3. **Look at the evidence:** application and API logs filtered by error and correlation ID; dashboards (error rate, latency, checkout conversion); traces of failed sessions; payment provider status; console and network (HAR) captures from affected users; support tickets; last night's test results.
4. **Reproduce safely:** in test or staging, or with production test accounts and sandbox payments, never real cards. Copy the affected users' conditions (browser, cart, coupon, address).
5. **Narrow it down:** compare affected and unaffected users to find what differs: browser version, region, cart size, a specific product, a flag group, payment method.
6. **Classify it:** *product defect* (reproducible with valid data, follows a code change); *data* (one product, price or account state); *environment / config* (one server, a certificate, cache, flag); *third party* (provider degraded). Rule each in or out with evidence.
7. **Update the client:** acknowledge within minutes with what we know, then update at a fixed interval (e.g. every 30–60 min): what we know, what we don't, next step, next update time. Escalate to on-call engineering and the vendor by severity. One incident channel and a timeline.
8. **Close it out:** confirm the root cause (reproduce it, show the fix removes it); quick mitigation first (rollback, flag off, failover); watch monitoring after the fix; then a regression test at the right layer, an alert on the early signal, and a blameless review with owners and dates.

### C2 — A recent production issue

> I don't have a recent production incident that I can share in detail, so I'll answer from my experience of testing this application end to end, manually and with automation.

| Point | My answer |
|-------|-----------|
| **What happened and how I found it** | No production issue came up. While running the core journeys by hand and in three browsers, I also noted how easy each journey felt for a shopper. Two journeys stood out: the **cart journey is smooth**, and the **menu journey is harder than it needs to be**. |
| **What works well: adding to the cart** | One click on "Add to cart". The button changes to "Remove" straight away, the cart number updates, and the cart shows the same price as the Products page. Checkout is three short steps with clear error messages. A first-time user can buy without help. |
| **Why the menu feels harder (the "root cause")** | Everything outside shopping is hidden behind the ☰ icon, even on a wide desktop screen: All Items, Dynamic Catalog, About, Logout and Reset App State. Logging out takes two clicks and is not visible until the menu is opened. "Reset App State" and "Dynamic Catalog" are technical names that a shopper would not understand, and "Reset App State" sits right next to Logout. "About" takes the user out of the shop to the Sauce Labs website without saying so. |
| **Explaining it to the client** | In plain words: "Shopping and checkout are smooth. The menu is the one place customers may struggle: Logout and the other options are hidden behind an icon, and some options have technical names. It won't stop anyone from buying, but a small design change would make it clearer." I would share it as a usability observation with screenshots, not as a defect, and let the product owner decide. |
| **Suggestions to make it better** | Show Logout (or an account area) in the header on desktop. Rename "Reset App State" to something clear such as "Clear cart", or remove it from the customer menu. Mark "About" as an external link. Keep the menu tests (open, close, every item works, keyboard use) in the regression suite so a redesign doesn't break it. |
| **Looking back** | Functional tests tell me whether a journey works, not whether it is easy. Next time I would add a short usability check early: watch two or three people do the main journeys and note where they hesitate. |
