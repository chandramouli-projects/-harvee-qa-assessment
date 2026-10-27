# Coding Conventions

> **Source of truth** for how to write features, steps and page objects in this suite.

## Feature files

- One file per functional area in `src/test/features/UI/`, starting with the banner comment (feature number, manual case IDs, rules that apply).
- Feature-level tags: `@ui` plus the area (`@authentication`, `@catalogue`, `@cart`, `@checkout`, `@security`, `@accessibility`).
- Scenario-level tags: the manual case ID (`@TC15`), the priority (`@P1`–`@P3`) and, where relevant, `@smoke`, `@regression`, `@security`.
- Scenario names: `<ID> <Area>-<Case> - <what is proven>`, e.g. `TC15 Checkout-HappyPath - …`.
- Use `Scenario Outline` + `Examples` for data-driven cases. When rows map to different manual IDs, split them into tagged `Examples` blocks (see `ProductSorting.feature`).
- Write **business data** in the feature (product names, expected messages, invalid inputs) so a reviewer reads it next to the scenario. Never write credentials: refer to users by role (`"standard"`, `"locked out"`, `"problem"`, `"performance glitch"`) or use `${VARIABLE}` placeholders resolved from config.
- **Known defects** keep the full assertion and are tagged `@known-defect @DEF-xx @fail`. `@fail` makes the result an expected failure; if the defect is fixed, Playwright reports an unexpected pass and the tag must be removed. Never weaken or delete the assertion.

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
| Add/change npm scripts or env vars | `RUNNING.md` |
| Add/change a scenario or its manual ID | `traceability-matrix.md` and the README mapping |
