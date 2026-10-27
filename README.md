# Harvee QA Automation Assessment — Sauce Demo

Playwright + TypeScript **BDD** test suite and written answers for the Harvee Technologies QA Automation assessment.
The application under test is https://www.saucedemo.com, using only its public demo users.

Scenarios are written in Gherkin and run by the Playwright Test runner through [playwright-bdd](https://github.com/vitalets/playwright-bdd). The suite keeps Playwright's cross-browser projects, parallel workers, traces and HTML report.

| Document | Contents |
|----------|----------|
| [ANSWERS.md](ANSWERS.md) | A1 manual suite (25 cases, PO questions, exploratory charter, strategy), B1–B4, C1–C2 |
| [docs/traceability-matrix.md](docs/traceability-matrix.md) | Manual ID → feature / scenario → execution status → evidence |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folder layout and how a run flows |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | Rules for features, tags, steps, page objects and assertions |
| [docs/RUNNING.md](docs/RUNNING.md) | npm scripts, tags, environment variables, reports |
| [docs/STEP_REFERENCE.md](docs/STEP_REFERENCE.md) | Every available Gherkin step |
| [docs/test-strategy.md](docs/test-strategy.md) | Layers, scope, entry/exit criteria |
| [docs/known-limitations.md](docs/known-limitations.md) | Defects found, failure investigations, limitations |
| [AI_USAGE.md](AI_USAGE.md) | Disclosure of AI assistance |

## Latest execution result

2026-10-27, Windows 11, Node 24.19.0, Playwright 1.64.1, playwright-bdd 9.2.1, command `npx cross-env BROWSER=all WORKERS=2 npm test`, retries 0:

| Browser | Version | Scenarios | Passed | Failed | Skipped | Flaky |
|---------|---------|----------:|-------:|-------:|--------:|------:|
| Chromium | 156.0.8078.4 | 38 | 38 | 0 | 0 | 0 |
| Firefox | 157.0 | 38 | 38 | 0 | 0 | 0 |
| WebKit | 27.2 | 38 | 38 | 0 | 0 | 0 |
| **Total** | | **114** | **114** | **0** | **0** | **0** |

"Passed" includes 2 scenarios per browser tagged `@fail` as **expected failures** for genuine defects: DEF-01 (`problem_user` sorting) and DEF-02 (no visible focus on the login form). Log: `evidence/bdd-run-2-all-browsers-2-workers.log`.

The first BDD run had 3 WebKit-only failures. The cause was test synchronisation (filling the checkout form while it was still mounting, and reading the cart before it loaded). They were fixed without retries and re-verified with `--repeat-each=5` (see [known limitations](docs/known-limitations.md)).

## Coverage at a glance

| Feature file | Scenarios (per browser) | Manual cases |
|--------------|:-----------------------:|--------------|
| `Authentication.feature` | 8 | TC01, TC02, TC03 ×2, TC04 ×3, TC25 |
| `ProductSorting.feature` | 5 | TC05, TC06, TC07, TC08, TC06 problem_user (DEF-01) |
| `Cart.feature` | 3 | TC09, TC10, TC11 |
| `Checkout.feature` | 6 | TC12, TC13, TC14, TC15, TC17 ×2 |
| `OrderTotals.feature` | 3 | TC16 (1, 2 and 6 products — B1 rewrite) |
| `SessionSecurity.feature` | 6 | TC22, TC24 ×5 |
| `Accessibility.feature` | 7 | TC19 ×2 (DEF-02), TC20 ×3, TC21 ×2 |
| **Total** | **38** | 24 of 25 manual cases automated (TC18 is manual only); TC23 = whole suite on 3 browsers |

## Project structure

```
├── config/
│   ├── testConfig.ts          # master config: loads config/.env.<ENV>, validates, never logs values
│   ├── environments.ts        # ENV registry (default: demo)
│   └── .env.example           # template → copy to config/.env.demo
├── src/
│   ├── core/                  # framework layer
│   │   ├── base/BasePage.ts   # navigation, URL, viewport, keyboard helpers
│   │   └── support/
│   │       ├── base-step.ts   # single import surface: Given/When/Then, expect, logger
│   │       ├── fixtures.ts    # page objects + scenario testContext as fixtures
│   │       ├── hooks.ts       # scenario start/finish + duration logging
│   │       ├── test-context.ts
│   │       └── logger.ts      # log4js → console + logs/test-execution.log
│   └── test/
│       ├── features/UI/       # 7 .feature files, tagged with manual IDs
│       ├── steps/
│       │   ├── shared/        # steps used by several features
│       │   └── domains/       # auth, catalogue, cart, checkout, session, accessibility
│       ├── pages/             # LoginPage, ProductsPage, CartPage, CheckoutPage, components/MenuComponent
│       ├── data/              # default customer, sort labels
│       └── support/           # money (integer cents), business-rule assertions, user roles
├── scripts/generate-report.js # Cucumber Spark report
├── docs/  evidence/
├── .vscode/                   # Cucumber autocomplete + recommended extensions
├── .github/workflows/playwright.yml
└── playwright.config.ts       # defineBddConfig + browser projects + reporters
```

## Prerequisites

- Node.js 20 or newer (verified on 24.19.0) and npm
- Internet access to `www.saucedemo.com` and the Playwright browser CDN

## Setup

```bash
npm ci                                            # installs exact versions from package-lock.json
npx playwright install chromium firefox webkit
cp config/.env.example config/.env.demo           # PowerShell: Copy-Item config/.env.example config/.env.demo
```

All settings (users, browser, timeouts, workers, retries, log level) are documented in [docs/RUNNING.md](docs/RUNNING.md). Missing or invalid values stop the run with a clear error that names the variable but never prints its value. `config/.env.demo` is git-ignored.

## Running tests

Every test script runs `bddgen` first, which turns the feature files into Playwright tests in `.features-gen/`.

| Goal | Command |
|------|---------|
| All scenarios, browsers from config (Chromium by default) | `npm test` |
| All three browsers | `npm run test:all-browsers` (add `WORKERS=2` locally) |
| One browser | `npm run test:firefox` / `test:webkit` / `test:chromium` |
| Smoke set | `npm run test:smoke` |
| One manual case | `npx bddgen && npx playwright test --grep @TC15` |
| One area | `npx bddgen && npx playwright test --grep @checkout` |
| Known-defect scenarios only | `npm run test:known-defects` |
| Headed / debugger / UI mode | `npm run test:headed` / `test:debug` / `test:ui` |
| Static checks (bddgen + tsc + ESLint + Prettier) | `npm run check` |

As executed for the evidence:

```bash
npx cross-env BROWSER=all WORKERS=2 npm test
```

## Reports and failure artefacts

| Output | Location |
|--------|----------|
| Playwright HTML report (Gherkin steps, attachments, traces) | `reports/html/index.html` — `npm run report` |
| Cucumber Spark report | `reports/spark-report/index.html` — `npm run report:spark` after a run |
| Cucumber JSON / JUnit XML | `reports/cucumber/cucumber-report.json`, `reports/junit/results.xml` |
| Screenshot, video, trace of failed scenarios | `test-results/<scenario>-<browser>/` |
| Step and scenario log | `logs/test-execution.log` |
| Execution logs kept as evidence | `evidence/` |

Screenshots, video and trace are kept **only on failure**. Expected-failure scenarios also keep them, so DEF-01 and DEF-02 have evidence. `npm run clean` removes all generated output.

## Example scenario

```gherkin
@TC15 @smoke @P1
Scenario: TC15 Checkout-HappyPath - Completing checkout with two products charges item total plus tax and empties the cart
  When I add the products "Sauce Labs Backpack, Sauce Labs Bolt T-Shirt" to the cart
  Then the cart badge should show 2
  When I open the cart
  Then the cart should contain exactly the selected products at their listed prices
  When I proceed to checkout
  And I submit valid checkout information
  Then the overview should list exactly the selected products at their listed prices
  And the order totals should equal the selected prices plus tax
  When I finish the order
  Then I should see the order confirmation "Thank you for your order!"
  ...
```

## Design decisions

- **BDD on the Playwright runner:** playwright-bdd compiles Gherkin into Playwright tests, so cross-browser projects, parallelism, `test.fail()`, traces and the HTML report all still apply. Gherkin tags are Playwright tags (`--grep @TC15`).
- **Readable data, no secrets in Gherkin:** product names, expected messages and invalid inputs are in the feature files. Users are referred to by role (`"standard"`, `"locked out"`); real values and `${PASSWORD}`-style placeholders are resolved from config.
- **Locators:** accessible roles and names where the UI provides them (also checks accessibility as a side effect), otherwise `data-test` ids. Products are matched by their exact name inside the product card, never by "first Add to cart button".
- **Isolation:** each scenario gets a fresh browser context and logs in itself, so cart state (localStorage) is never shared and scenarios run in any order or in parallel. Data between steps lives in a scenario-scoped `testContext`.
- **Business assertions:** sorting checks every adjacent pair, allows ties and confirms nothing was lost. The price of each product is recorded when it is added, and the cart, overview and totals are compared against it in integer cents. The tax rate is read from the page.
- **No sleeps:** web-first assertions only; ESLint forbids `waitForTimeout` and floating promises. Page-object actions end by asserting their effect (e.g. the form value stuck).
- **Known defects** are tagged `@known-defect @DEF-xx @fail` with the full assertion. If a defect is fixed, Playwright reports an unexpected pass so the tag is removed.

## Scaling to 200 tests

The structure scales by adding feature files, page objects and domain step files, not by growing existing ones.
- **Step reuse:** shared vocabulary lives in `steps/shared/` and is listed in `docs/STEP_REFERENCE.md`, so new scenarios are mostly composed from existing steps.
- **Speed and stability:** at 200 tests, UI login per scenario becomes the main cost. Log in once per worker in a setup project and reuse `storageState`, or seed state via API on a client system, keeping one explicit UI-login scenario.
- **Selection:** tags already exist (`@smoke`, `@P1`, area tags, `@TCxx`). Run `@smoke` on every PR and the full matrix nightly.
- **CI throughput:** shard across CI machines (`--shard=1/4`) and merge the blob reports into one HTML report.
- **Flakiness:** track it with the JSON/Cucumber report or a dashboard, quarantine flaky scenarios with an owner and an expiry date, and fix them rather than adding retries.
- **Right layer:** the strategy keeps most new checks at API or unit level where a client system allows it, so the UI layer stays a thin set of journeys.

## Assumptions and limitations

Assumptions are listed with the product-owner questions in [ANSWERS.md](ANSWERS.md#a12-questions-for-the-product-owner-with-working-assumptions). Limitations are in [docs/known-limitations.md](docs/known-limitations.md). In summary:
- UI-level session checks only.
- No API or unit testing, because no API contract or source was provided.
- No load or security testing.
- axe covers only part of WCAG.
- Responsive checks use viewport emulation.
- Playwright WebKit is not branded Safari.
