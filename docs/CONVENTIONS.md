# Coding Conventions

> **Source of truth** for how to write features, steps and page objects in this suite.

## Feature files

- **The manual test case Excel is the source:** `manual_test_cases/SauceDemo_Functional_Test_Cases.xlsx`. Every functional test case (core TC01–TC25 except TC23/TC24, extended TC26–TC98) has a scenario, and every functional scenario belongs to one Excel test case.
- One file per functional area in `src/test/features/UI/`, starting with the banner comment: feature number, a **"TEST CASES COVERED" list with each Excel ID and title**, and the rules that apply.
- Feature-level tags: `@ui` plus the area (`@authentication`, `@products`, `@catalogue`, `@product-detail`, `@cart`, `@checkout`, `@order-completion`, `@navigation`, `@security`, `@personas`, `@accessibility`).
- Scenario-level tags: the Excel test case ID (`@TC12`, exactly one per scenario), the suite (`@core` or `@extended`), the priority (`@P1`–`@P3`) and, where relevant, `@smoke`, `@regression`, `@security`.
- Scenario names: `<Excel ID> <Area>-<Case> - <what is proven>`, e.g. `TC12 Checkout-HappyPath - …`.
- Use `Scenario Outline` + `Examples` for data-driven cases. When rows map to different Excel IDs, split them into tagged `Examples` blocks (see `ProductSorting.feature`). Rows of one Excel case (e.g. TC53 names) share its tag.
- Accessibility checks are not in the Excel. They live in `src/test/features/Accessibility/Accessibility.feature` with `ACxx` IDs (`@AC01`…), so they never clash with `TCxx`. The standard is WCAG 2.0/2.1/2.2 A and AA; an axe scan fails on any WCAG violation, while axe "incomplete" and best-practice results are attached for manual review. Screens used by the checks are opened with `Given the "<screen>" screen is open`.
- Security checks are not in the Excel either. They live in `src/test/features/Security/Security.feature` with `SCxx` IDs. They must stay **passive**: read headers, redirects, cookies and browser storage, or do things that affect only the test's own browser. Never add attack traffic, active scanning, fuzzing or brute force against the public site.
- Write **business data** in the feature (product names, expected messages, invalid inputs) so a reviewer reads it next to the scenario. Never write credentials: refer to users by role (`"standard"`, `"locked out"`, `"problem"`, `"performance glitch"`, `"error"`, `"visual"`) or use `${VARIABLE}` placeholders resolved from config.
- **Bugs:** a scenario that finds a bug keeps the full assertion, is tagged `@known-defect @BUG-xx` (the ID in the Excel "Bugs" tab) and **fails in the report** while the bug exists; a comment above it says what was seen. Never weaken or delete the assertion. When the bug is fixed the scenario passes again.
- Where the Excel marks an ASSUMPTION (no business rule given), the scenario has a `# ASSUMPTION:` comment.
- Accessibility and security bugs follow the same rule with `@known-defect @AC-BUG-xx` / `@SC-BUG-xx` (listed in the feature banner and in `known-limitations.md`). The former DEF-02 is now AC-BUG-01.
- A check that cannot work in one browser for a browser reason (not a site bug) is skipped at runtime with the reason, e.g. `Given keyboard focus can move to links in this browser` skips WebKit.

## Step definitions

- Import `Given` / `When` / `Then` / `expect` / `logger` from `src/core/support/base-step.ts` only — never directly from `playwright-bdd` or `@playwright/test`.
- First argument is the fixtures object: `async ({ productsPage, testContext }, name: string) => { … }`.
- **Search `shared/common.steps.ts` and `STEP_REFERENCE.md` before adding a step.** Put a step in `shared/` only if two or more features use it; otherwise in the matching `domains/*.steps.ts`.
- Keep step bodies thin: call page-object methods and shared assertions. Log meaningful actions with `logger.info('>> [STEP] …')`.
- Share data between steps through `testContext.setValue` / `getValue` (scenario-scoped). `getValue` throws if the value was never set, so a missing earlier step fails loudly.
- Validate free-text parameters (e.g. sort direction) and throw a clear error for unknown values instead of silently passing.

## Page objects

- One class per page in `src/test/pages/`, shared header in `components/`. Every class extends `BasePage` and is exported from `pages/index.ts`, then exposed as a fixture in `src/core/support/fixtures.ts`.
- Locator priority: accessible role + name (`getByRole`) → label → `data-test` id (`getByTestId`, configured as `testIdAttribute`). No CSS chains, XPath or index-based selectors. Products are matched by **exact name inside the product card**.
- Methods that change state end with a web-first assertion that the change happened (e.g. `addToCart` waits for the "Remove" button).

## Assertions and waiting

- Web-first assertions only. **No fixed sleeps** — ESLint bans `waitForTimeout` and floating promises.
- Assert business outcomes, not just visibility: whole-list ordering (every adjacent pair), integer-cent totals, exact messages, and that nothing was lost or re-priced.
- Give `expect` a message that explains the rule being checked.

## Configuration

- New settings go into `config/testConfig.ts` with a validated reader and a line in `config/.env.example`. Document them in `RUNNING.md`.

## Documentation responsibility

| Change | Update |
| ------ | ------ |
| Add/remove a top-level folder or framework component | `ARCHITECTURE.md` |
| Change a coding rule or tag convention | this file |
| Add a step | `STEP_REFERENCE.md` |
| Add/change npm scripts | `COMMANDS.md` |
| Add/change env vars or tags | `RUNNING.md` |
| Add/change a scenario or its manual ID | the Excel test case, the feature banner list, `traceability-matrix.md` and the README mapping |
