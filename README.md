# Harvee QA Automation Assessment — Sauce Demo

**Candidate:** Chandramouli Kancharla · **Role:** QA Automation Tester · **Use case:** Shop and check out on https://www.saucedemo.com

Playwright + TypeScript test suite with scenarios written in Gherkin ([playwright-bdd](https://github.com/vitalets/playwright-bdd)), plus the manual suite and written answers.

## Where to find each part of the brief

| Brief item | Where |
|------------|-------|
| **A1** questions and assumptions, 25 test cases, exploratory charter, strategy | [ANSWERS.md › A1](ANSWERS.md#section-a1--manual-test-suite) · full step-by-step cases with actual results: [manual_test_cases/SauceDemo_Functional_Test_Cases.xlsx](manual_test_cases/SauceDemo_Functional_Test_Cases.xlsx) (sheet *Core Test Cases (A1)*) |
| **A2** automation suite | this repository · [setup](#setup) · [run](#running-the-tests) · [manual → automated mapping](#manual-case--automated-test-mapping) · [200 tests](#growing-the-suite-to-200-tests) |
| **B1–B4** | [ANSWERS.md › B1](ANSWERS.md#section-b1--review-of-the-ai-generated-cart-total-test) … [B4](ANSWERS.md#section-b4--message-to-the-client) |
| **C** notes for the live discussion | [ANSWERS.md › C](ANSWERS.md#section-c--notes-for-the-live-discussion) |
| AI usage | [AI_USAGE.md](AI_USAGE.md) |
| Work beyond the brief (extra cases, accessibility, security) | [Beyond the brief](#beyond-the-brief) |
| Everything above in one Word document (the uploaded submission) | [submission/Chandramouli_Kancharla_QA_Automation_Assessment.docx](submission/Chandramouli_Kancharla_QA_Automation_Assessment.docx) |

## Setup

Needs Node.js 20 or newer (run on 24.19.0) and internet access to `www.saucedemo.com`.

```bash
npm ci                                            # exact versions from package-lock.json
npx playwright install chromium firefox webkit
cp config/.env.example config/.env.demo           # PowerShell: Copy-Item config/.env.example config/.env.demo
```

The base URL, the demo users and the password are read from `config/.env.demo` (or from environment variables with the same names in CI). They never appear in the tests. A missing or invalid value stops the run with an error that names the variable without printing its value. Every setting is listed in [docs/RUNNING.md](docs/RUNNING.md).

## Running the tests

| Goal | Command |
|------|---------|
| **The 25 core (A1) cases, Chromium** | `npm run test:core` |
| The 25 core cases in all three browsers | `npx cross-env BROWSER=all WORKERS=2 npm run test:core` |
| Smoke set (TC01, TC07, TC09, TC12, TC21) | `npm run test:smoke` |
| One manual case | `npx bddgen && npx playwright test --grep @TC12` |
| Everything (core + extended + accessibility + security) | `npm test` (Chromium) · `npx cross-env BROWSER=all WORKERS=2 npm test` (three browsers) |
| One browser | `npm run test:chromium` / `test:firefox` / `test:webkit` |
| Watch it run / debug | `npm run test:headed` / `test:debug` / `test:ui` |
| B1 rewrite as a plain Playwright test (no Gherkin), three browsers | `npm run test:b1-plain` |
| Static checks (TypeScript, ESLint, Prettier) | `npm run check` |

Every script first runs `bddgen`, which turns the `.feature` files into Playwright tests.

## Reports and failure evidence

| Output | Where |
|--------|-------|
| HTML report (steps, screenshots, traces) | `reports/html/index.html` → `npm run report` |
| JUnit XML | `reports/junit/results.xml` |
| Cucumber JSON and Spark report | `reports/cucumber/cucumber-report.json` · `npm run report:spark` |
| Screenshot, video and trace of each failed test | `test-results/<scenario>-<browser>/` |
| Logs of the runs used as evidence | [evidence/](evidence/) |

## Manual case → automated test mapping

Every automated scenario starts with its manual case ID and carries it as a tag. Results are from the final run, retries 0 (see [Results](#results)).

| Manual ID | Manual case | Automated test (feature file → scenario) | Result in Chromium / Firefox / WebKit |
|-----------|-------------|-------------------------------------------|---------------------------------------|
| TC01 | Login with a valid user | `Authentication.feature` → TC01 Login-HappyPath | Pass |
| TC02 | Login with a locked user | `Authentication.feature` → TC02 Login-LockedOut | Pass |
| TC03 | Login with a wrong password | `Authentication.feature` → TC03 Login-InvalidCredentials | Pass |
| TC04 | Login with both fields empty | `Authentication.feature` → TC04 Login-RequiredFields | Pass |
| TC05 | Sort by "Name (A to Z)" | `ProductSorting.feature` → TC05 Sorting (outline row) | Pass |
| TC06 | Sort by "Name (Z to A)" | `ProductSorting.feature` → TC06 Sorting (outline row) | Pass |
| TC07 | Sort by "Price (low to high)" – whole list | `ProductSorting.feature` → TC07 Sorting (outline row) | Pass |
| TC08 | Sort by "Price (high to low)" | `ProductSorting.feature` → TC08 Sorting (outline row) | Pass |
| TC09 | Add two products, remove one – badge and cart | `Cart.feature` → TC09 Cart-Badge | Pass |
| TC10 | Remove products on the Cart page | `Cart.feature` → TC10 Cart-Remove | Pass |
| TC11 | New session starts with an empty cart | `Cart.feature` → TC11 Cart-Empty | Pass |
| TC12 | Full checkout – Total = Item total + Tax, cart empty after | `Checkout.feature` → TC12 Checkout-HappyPath | Pass |
| TC13 | Checkout without First Name | `Checkout.feature` → Checkout-Validation (**one parameterized test**, row TC13) | Pass |
| TC14 | Checkout without Last Name | same test, row TC14 | Pass |
| TC15 | Checkout without Postal Code | same test, row TC15 | Pass |
| TC16 | Cancel on "Your Information" | `Checkout.feature` → TC16 Checkout-Cancel | Pass |
| TC17 | Cancel on "Overview" | `Checkout.feature` → TC17 Checkout-Cancel | Pass |
| TC18 | Order total for all six products | `OrderTotals.feature` → TC18 OrderTotal (outline row) | Pass |
| TC19 | Double-click Finish | `OrderCompletion.feature` → TC19 OrderComplete-DoubleClick | Pass (what the user sees; order count needs an API) |
| TC20 | Typed values stay after an error | `Checkout.feature` → TC20 Checkout-KeepValues | Pass |
| TC21 | Products page by URL after logout | `SessionSecurity.feature` → TC21 Session-Logout | Pass |
| TC22 | `/cart.html` without logging in | `SessionSecurity.feature` → TC22 Session-DeepLink | Pass |
| TC23 | Keyboard-only login and add to cart | `Accessibility.feature` → TC23 AC03 Keyboard-Login | Pass |
| TC24 | Mobile and desktop screen sizes | `Accessibility.feature` → TC24 AC14 Responsive (375 px and 1366 px) | Pass |
| TC25 | Price sort as `problem_user` | `ProductSorting.feature` → TC25 Sorting-ProblemUser | **Fails as expected – BUG-01** |
| EX-01 | Exploratory charter, `problem_user` | Manual only | – |

The six cases the brief requires are TC01 + TC02, TC07, TC09, TC12, TC13–TC15 and TC21. All 25 core cases are automated. Screen readers, real phones and the exploratory charter stay manual.

## Results

Final run on 28 Oct 2026: Windows 11, Node 24.19.0, Playwright 1.64.1, Chromium 156.0, Firefox 157.0, WebKit 27.2; 2 workers, **retries 0**.

**Core (A1) set:** 26 scenarios per browser (TC13–TC15 are 3 rows of one test, AC14 runs at 2 sizes).

| Browser | Passed | Failed (all known bugs) | Unexpected failures |
|---------|------:|------:|------:|
| Chromium | 25 | 1 (TC25 → BUG-01) | 0 |
| Firefox | 25 | 1 (TC25 → BUG-01) | 0 |
| WebKit | 25 | 1 (TC25 → BUG-01) | 0 |

A test for a known bug is tagged `@known-defect @BUG-xx` and keeps its full assertion, so it **fails while the bug exists** and starts passing when the bug is fixed. Log of the core run in all three browsers (75 passed, 3 failed = TC25 in each browser): [evidence/final-core-run-all-browsers-2-workers.log](evidence/final-core-run-all-browsers-2-workers.log). The same results appear in the full-suite logs [evidence/final-run-2-all-browsers-2-workers.log](evidence/final-run-2-all-browsers-2-workers.log) (Chromium, Firefox) and [evidence/final-run-3-webkit-2-workers.log](evidence/final-run-3-webkit-2-workers.log) (WebKit). Results for the whole suite are under [Beyond the brief](#beyond-the-brief).

## How the brief's rules are met

| Rule | How |
|------|-----|
| Page Object Model, no locators in tests | Locators live only in `src/test/pages/` (`LoginPage`, `ProductsPage`, `CartPage`, `CheckoutPage`, `ProductDetailPage`, `components/MenuComponent`). Feature files and steps call page-object methods. |
| No fixed sleeps | Only Playwright's auto-waiting assertions. ESLint fails the build on `waitForTimeout`. |
| Base URL and users in config | `config/testConfig.ts` reads `config/.env.<ENV>` or CI environment variables. Features refer to users by role (`"standard"`, `"locked out"`). |
| Each test runs alone and in any order | Every scenario gets a new browser context and logs in itself; nothing is shared. `fullyParallel: true`. |
| Screenshot on failure, readable report | `screenshot: 'only-on-failure'` plus video and trace on failure; HTML and JUnit XML reports. |
| Name starts with the manual ID | e.g. `TC07 Sorting - "Price (low to high)" orders the entire product list`, tagged `@TC07`. |
| Checks the whole result, not one item | Sorting checks every neighbouring pair; money is compared in whole cents; the tax is read from the page. |

## Growing the suite to 200 tests

The suite grows by adding feature files, page objects and step files for new areas, not by making the existing ones longer. Most new scenarios reuse existing steps (all listed in [docs/STEP_REFERENCE.md](docs/STEP_REFERENCE.md)), so a new case is usually a few lines of Gherkin. At 200 tests, logging in through the UI in every test becomes the main cost: log in once per worker and reuse the saved session (`storageState`), or set up state through an API on a real client system, and keep one UI login test. Tags already exist (`@smoke`, `@core`, `@P1`, area tags, `@TCxx`), so pull requests run `@smoke` and the full three-browser set runs nightly, split across CI machines with `--shard` and merged into one HTML report. Flaky tests are tracked from the JSON report, put in quarantine with an owner and a date, and fixed instead of hidden with retries. Checks that do not need a browser (tax, validation, sorting logic) move down to the API or unit layer, so the UI layer stays a small set of real journeys.

## Assumptions and limitations

Assumptions are the product-owner questions in [ANSWERS.md › A1.1](ANSWERS.md#a11-questions-for-the-product-owner-and-the-assumption-tested). Limitations are in [docs/known-limitations.md](docs/known-limitations.md). In short: UI-level checks only (no API or source was provided); passive security checks only; axe covers only part of WCAG; screen sizes are emulated in desktop browsers; Playwright WebKit is not branded Safari.

---

## Beyond the brief

Extra work, kept separate so the required parts above are easy to review.

### Extra suites

| Suite | IDs | Scenarios per browser | What it covers |
|-------|-----|:--:|----------------|
| Extended functional | TC26–TC98 | 78 | More login inputs, product page, cart state, input formats, order completion, menu, session timeout, and the other demo users (`error_user`, `visual_user`, `performance_glitch_user`) |
| Accessibility | AC01–AC15 | 32 | axe-core WCAG 2.2 A/AA scans of 11 screens, keyboard-only use, visible focus, accessible names, error announcements, alt text, page titles, 320 px reflow |
| Security (passive only) | SC01–SC14 | 19 | HTTPS, security headers, cookie flags, hand-made cookies, user enumeration, credentials in URL or storage, script input. No attack traffic. |

The extended cases are in the Excel sheet *Extended Test Cases* (73 cases, each with its recorded result).

### Whole-suite results (final run, retries 0)

| Browser | Scenarios | Passed | Failed – known bugs | Skipped | Unexpected failures |
|---------|---:|---:|---:|---:|---:|
| Chromium | 152 | 127 | 25 | 0 | 0 |
| Firefox | 152 | 127 | 25 | 0 | 0 |
| WebKit | 152 | 126 | 25 | 1 | 0 |
| **Total** | **456** | **380** | **75** | **1** | **0** |

The skipped test is AC05 (log out by keyboard) in WebKit, skipped on purpose: WebKit's Tab key does not move to links by default, so the result would not mean anything.

### Bugs found (25 failing scenarios per browser)

| Group | IDs | Examples |
|-------|-----|----------|
| Functional | BUG-01 – BUG-11 (BUG-05 found manually, still to confirm on screen) | sorting broken for `problem_user` (BUG-01), one user sees another user's cart (BUG-06, High), checkout accepts spaces-only names (BUG-02), empty-cart orders (BUG-03), the same cart ordered twice from two tabs (BUG-07), `visual_user` sees wrong prices (BUG-11, High) |
| Accessibility | AC-BUG-01 – AC-BUG-04 | no visible keyboard focus, cart link not reachable by Tab, no `autocomplete` on checkout fields, every page titled "Swag Labs" |
| Security | SC-BUG-01 – SC-BUG-05 | no HSTS or anti-framing headers, unprotected login cookie, **a hand-made `session-username` cookie opens the shop without a password** |

Each bug, with steps and evidence, is in the Excel sheet *Bugs* and in [docs/known-limitations.md](docs/known-limitations.md), along with the test-side flakiness found and fixed during the work (WebKit form filling, menu clicks, Firefox under parallel load).

### More documents

| Document | Contents |
|----------|----------|
| [docs/traceability-matrix.md](docs/traceability-matrix.md) | Every manual ID → scenario → result |
| [docs/test-strategy.md](docs/test-strategy.md) | Layers, scope, entry and exit criteria |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | Folder layout, how a run flows, coding rules |
| [docs/RUNNING.md](docs/RUNNING.md) · [docs/STEP_REFERENCE.md](docs/STEP_REFERENCE.md) | All settings and scripts; every Gherkin step |

### Project layout

```
config/                 testConfig.ts (loads and checks config/.env.<ENV>), environments.ts, .env.example
src/core/               framework: BasePage, fixtures, hooks, scenario context, logger
src/test/features/      UI/ (functional) · Accessibility/ · Security/
src/test/steps/         shared/ and one step file per area
src/test/pages/         page objects and components/MenuComponent
src/test/support/       money (whole cents), business-rule assertions, users, axe helpers
manual_test_cases/      Excel: Summary, Core Test Cases (A1), Extended Test Cases, Bugs
examples/               B1 rewrite as a plain Playwright test, with its own small config
evidence/               logs of the runs quoted in this README
.github/workflows/      CI: Playwright on pushes to main and on pull requests
playwright.config.ts    browsers, workers, reporters, screenshots and traces on failure
```
