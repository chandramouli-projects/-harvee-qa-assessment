# Harvee QA Automation Assessment — Sauce Demo

Playwright + TypeScript test suite and written answers for the Harvee Technologies QA Automation assessment.
The application under test is https://www.saucedemo.com, using only its public demo users.

| Document | Contents |
|----------|----------|
| [ANSWERS.md](ANSWERS.md) | A1 manual suite (25 cases, PO questions, exploratory charter, strategy), B1–B4, C1–C2 |
| [docs/traceability-matrix.md](docs/traceability-matrix.md) | Manual ID → automated test → execution status → evidence |
| [docs/test-strategy.md](docs/test-strategy.md) | Layers, scope, entry/exit criteria |
| [docs/known-limitations.md](docs/known-limitations.md) | Defects found, flaky-test investigation, limitations |
| [AI_USAGE.md](AI_USAGE.md) | Disclosure of AI assistance |

## Latest execution result

2026-10-27, Windows 11, Node 24.19.0, Playwright 1.64.1, command `npx cross-env BROWSER=all WORKERS=2 npx playwright test`, retries 0:

| Browser | Version | Tests | Passed | Failed | Skipped | Flaky |
|---------|---------|------:|-------:|-------:|--------:|------:|
| Chromium | 156.0.8078.4 | 38 | 38 | 0 | 0 | 0 |
| Firefox | 157.0 | 38 | 38 | 0 | 0 | 0 |
| WebKit | 27.2 | 38 | 38 | 0 | 0 | 0 |
| **Total** | | **114** | **114** | **0** | **0** | **0** |

"Passed" includes 2 tests per browser marked as **expected failures** for genuine defects: DEF-01 (`problem_user` sorting) and DEF-02 (no visible focus on the login form). The first run with default parallelism had 2 Firefox-only failures; they were investigated and attributed to local resource contention (see [known limitations](docs/known-limitations.md)).

## Project structure

```
├── .env.example              # configuration template (copy to .env)
├── playwright.config.ts      # projects, timeouts, reporters, artefacts
├── pages/                    # Page Object Model
│   ├── LoginPage.ts  ProductsPage.ts  CartPage.ts  CheckoutPage.ts
│   └── MenuComponent.ts      # header: burger menu, logout, cart link and badge
├── fixtures/test-fixtures.ts # page-object fixtures + loggedInProductsPage
├── test-data/test-data.ts    # products, customer, expected messages, viewports
├── utils/
│   ├── environment.ts        # dotenv loading + validation (never logs values)
│   ├── money.ts              # "$43.18" → 4318 integer cents
│   └── assertions.ts         # whole-list sort check, totals rule, line-item comparison
├── tests/
│   ├── auth/  catalogue/  cart/  checkout/  security/
│   ├── accessibility/        # keyboard, focus, names, axe, responsive
│   └── regression/           # B1 rewrite (TC16), problem_user known defect
├── docs/  evidence/          # documentation, execution logs
└── .github/workflows/playwright.yml
```

## Prerequisites

- Node.js 20 or newer (verified on 24.19.0) and npm
- Internet access to `www.saucedemo.com` and the Playwright browser CDN

## Setup

```bash
npm ci                                       # installs exact versions from package-lock.json
npx playwright install chromium firefox webkit
cp .env.example .env                         # PowerShell: Copy-Item .env.example .env
```

### `.env` configuration

| Variable | Default in example | Purpose |
|----------|-------------------|---------|
| `BASE_URL` | `https://www.saucedemo.com` | Application URL (required, validated) |
| `STANDARD_USER`, `LOCKED_OUT_USER`, `PROBLEM_USER`, `PERFORMANCE_GLITCH_USER`, `PASSWORD` | public demo values | Required; missing values stop the run with a clear error that names the variable but never prints its value |
| `BROWSER` | `chromium` | `chromium`, `firefox`, `webkit`, a comma-separated list, or `all` |
| `HEADLESS` | `true` | `true`/`false` |
| `TEST_TIMEOUT`, `ACTION_TIMEOUT`, `NAVIGATION_TIMEOUT`, `EXPECT_TIMEOUT` | 30000 / 10000 / 15000 / 10000 | Milliseconds, validated as integers |
| `WORKERS` | `0` (Playwright default) | Use `2` for local cross-browser runs |
| `RETRIES` | `0` | Kept at 0 so first-run failures are visible |

Variables already set in the shell or CI take precedence over `.env`. `.env` is git-ignored.

## Running tests

| Goal | Command |
|------|---------|
| All tests, browsers from `.env` (Chromium by default) | `npm test` |
| All three browsers | `npm run test:all-browsers` (add `WORKERS=2` locally, see below) |
| One browser | `npm run test:firefox` / `test:webkit` / `test:chromium` |
| One folder or file | `npx playwright test tests/checkout` |
| By manual ID | `npx playwright test -g "TC15"` |
| Headed | `npm run test:headed` |
| Step-through debugger | `npm run test:debug -- -g "TC22"` |
| UI mode | `npm run test:ui` |
| Static checks (tsc + ESLint + Prettier) | `npm run check` |

Cross-browser on a laptop, as executed:

```bash
npx cross-env BROWSER=all WORKERS=2 npx playwright test
```

## Reports and failure artefacts

| Output | Location |
|--------|----------|
| HTML report | `reports/html/index.html`; open with `npm run report` |
| JUnit XML (for CI) | `reports/junit/results.xml` |
| Screenshots, videos, traces of failed tests | `test-results/<test-name>-<browser>/` (`test-failed-1.png`, `video.webm`, `trace.zip`) |
| View a trace | `npx playwright show-trace test-results/<dir>/trace.zip` |
| Execution logs kept as evidence | `evidence/` |

Screenshots, video and trace are kept **only on failure**. Expected-failure tests also keep artefacts, so DEF-01 and DEF-02 have evidence. `npm run clean` removes `reports/` and `test-results/`. Neither folder is committed.

## Manual case → automation mapping

| ID | Automated test | ID | Automated test |
|----|----------------|----|----------------|
| TC01 | `auth/login.spec.ts` | TC14 | `checkout/checkout.spec.ts` |
| TC02 | `auth/login.spec.ts` | TC15 | `checkout/checkout.spec.ts` |
| TC03 | `auth/login.spec.ts` | TC16 | `regression/b1-cart-total.spec.ts` |
| TC04 | `auth/login.spec.ts` | TC17 | `checkout/checkout.spec.ts` |
| TC05 | `catalogue/sorting.spec.ts` | TC18 | **Manual only** |
| TC06 | `catalogue/sorting.spec.ts`, `regression/problem-user.spec.ts` | TC19 | `accessibility/keyboard.spec.ts` |
| TC07 | `catalogue/sorting.spec.ts` | TC20 | `accessibility/a11y.spec.ts` |
| TC08 | `catalogue/sorting.spec.ts` | TC21 | `accessibility/responsive.spec.ts` |
| TC09 | `cart/cart.spec.ts` | TC22 | `security/session.spec.ts` |
| TC10 | `cart/cart.spec.ts` | TC23 | Whole suite with `BROWSER=all` |
| TC11 | `cart/cart.spec.ts` | TC24 | `security/session.spec.ts` |
| TC12 | `checkout/checkout.spec.ts` | TC25 | `auth/login.spec.ts` |
| TC13 | `checkout/checkout.spec.ts` | EX-01 | **Manual only** (exploratory charter) |

## Design decisions

- **Locators:** accessible roles and names where the UI provides them (also checks accessibility as a side effect). Otherwise `data-test` ids (`testIdAttribute: 'data-test'`). Products are matched by their exact name inside the product card, never by "first Add to cart button".
- **Isolation:** every test gets a fresh browser context and logs in through the fixture, so cart state (stored in localStorage) is never shared and tests can run in any order or in parallel.
- **Business assertions:** sorting checks every adjacent pair, allows ties in either order, and confirms no product was lost. Money is compared as integer cents. The tax rate is read from the page, not hard-coded.
- **No sleeps:** web-first assertions only; ESLint forbids `waitForTimeout` and floating promises.
- **Known defects** use `test.fail()` with the full assertion and an annotation. If a defect is fixed, Playwright reports an unexpected pass so the marker is removed.

## Scaling to 200 tests

The structure scales by adding page objects and specs per feature, not by growing existing files.
- **Speed and stability:** at 200 tests, UI login per test becomes the main cost. Log in once per worker in a setup project and reuse `storageState`, or seed state via API on a client system, keeping one explicit UI-login test.
- **Selection:** add tags (`@smoke`, `@regression`, `@a11y`) and run a short smoke set on every PR and the full matrix nightly.
- **CI throughput:** shard across CI machines (`--shard=1/4`) and merge the blob reports into one HTML report.
- **Shared code:** test data becomes builders or factories; common assertions stay in `utils/` so business rules are defined once.
- **Flakiness:** track it with the JSON reporter or a dashboard, quarantine flaky tests with an owner and an expiry date, and fix them rather than adding retries.
- **Right layer:** the strategy keeps most new checks at API or unit level where a client system allows it, so the UI layer stays a thin set of journeys.

## Assumptions and limitations

Assumptions are listed with the product-owner questions in [ANSWERS.md](ANSWERS.md#a12-questions-for-the-product-owner-with-working-assumptions). Limitations are in [docs/known-limitations.md](docs/known-limitations.md). In summary:
- UI-level session checks only.
- No API or unit testing, because no API contract or source was provided.
- No load or security testing.
- axe covers only part of WCAG.
- Responsive checks use viewport emulation.
- Playwright WebKit is not branded Safari.
