# Architecture

> **Source of truth** for the directory layout, what each folder does, and how a run flows.
> When you add or remove a top-level folder, update this file.

## What this is

A Playwright + TypeScript BDD suite for https://www.saucedemo.com. Scenarios are written in Gherkin and executed by the **Playwright Test runner** through [`playwright-bdd`](https://github.com/vitalets/playwright-bdd). The suite keeps Playwright's browser projects, parallel workers, traces, videos and HTML report, and adds readable `.feature` files, a Cucumber JSON report and a Spark HTML report.

## Directory layout

| Path | Role |
| ---- | ---- |
| `config/` | `testConfig.ts` (master config, validation), `environments.ts` (ENV registry), `.env.example` (template). `.env.<env>` files are git-ignored. |
| `src/core/` | Framework code. Change it only for framework-level behaviour. |
| `src/core/base/` | `BasePage`: navigation, URL, viewport and keyboard helpers shared by all page objects. |
| `src/core/support/` | `base-step.ts` (single import surface for steps), `fixtures.ts` (page-object and `testContext` fixtures), `hooks.ts` (scenario logging), `test-context.ts` (scenario data store), `logger.ts` (log4js). |
| `src/test/features/UI/` | Gherkin `.feature` files, one per functional area. Each scenario is tagged with its manual case ID. |
| `src/test/features/Accessibility/` | `Accessibility.feature`: strict WCAG 2.2 A/AA checks (AC01–AC15), kept apart from the functional features. |
| `src/test/features/Security/` | `Security.feature`: passive security checks (SC01–SC14) — headers, HTTPS, cookies, storage, input handling. |
| `src/test/steps/shared/` | Steps used by several features (login, page checks, cart badge, adding products). |
| `src/test/steps/domains/` | Steps unique to one area (auth, catalogue, cart, checkout, session, accessibility). |
| `src/test/pages/` | Page objects (`LoginPage`, `ProductsPage`, `CartPage`, `CheckoutPage`) and `components/MenuComponent`; `index.ts` re-exports them. |
| `src/test/data/` | Static data used by steps (default customer, sort labels). |
| `src/test/support/` | Test helpers: money parsing, business-rule assertions, user roles and placeholders, selected-items tracking. |
| `scripts/` | `generate-report.js` (Cucumber Spark report). |
| `docs/` | This file, `CONVENTIONS.md`, `RUNNING.md` (settings and tags), `STEP_REFERENCE.md`, test strategy, traceability and limitations. |
| `evidence/` | Execution logs kept as evidence. |
| `.features-gen/`, `reports/`, `test-results/`, `logs/` | Generated output. Git-ignored. |

## Runtime pipeline

```
src/test/features/{UI,Accessibility,Security}/*.feature
    │  npx bddgen  ◄── playwright.config.ts (defineBddConfig)
    ▼
.features-gen/UI/*.feature.spec.js   (generated Playwright tests)
    │  npx playwright test   ◄── one project per browser in BROWSER
    ▼
steps (src/test/steps)  →  fixtures (page objects, testContext)  →  Playwright page
    │
    ▼
reports/html  ·  reports/junit/results.xml  ·  reports/cucumber/cucumber-report.json
test-results/ (screenshot, video, trace on failure)  ·  logs/test-execution.log
    │  npm run report:spark
    ▼
reports/spark-report/index.html
```

1. `config/testConfig.ts` loads `config/.env.<ENV>` (default `demo`) and validates every value. A missing or invalid value stops the run with a message that names the variable but never prints its value.
2. `bddgen` turns each scenario (and each `Examples` row) into a Playwright test. Gherkin tags become Playwright tags, so `--grep @TC12` or `--grep @smoke` select scenarios. `@fail` becomes `test.fail()`.
3. Each scenario gets a **fresh browser context and page**, so cookies and the localStorage cart never leak between scenarios, and scenarios can run in any order or in parallel.
4. Steps receive page objects and the scenario's `testContext` as fixtures. Page objects use role, label and `data-test` locators with web-first assertions.
5. `hooks.ts` logs scenario start/finish and duration to `logs/test-execution.log`. Screenshots, video and trace on failure come from `playwright.config.ts`.
