# AI Usage Disclosure

## Tool used

**Claude Code (Anthropic), model Claude Opus 5.5**, run as a coding agent in VS Code on my machine on 2026-10-27.

## What I asked for

I gave the agent the full Harvee assessment brief. I asked it to build the Playwright/TypeScript project from an empty workspace, write the manual suite and written answers, run the tests against Sauce Demo, investigate failures, and report results truthfully.

I then asked it to restructure the suite into the BDD framework style I use day to day (Gherkin features, step definitions, `src/core` + `src/test` layout, `config/testConfig.ts`, log4js logging, Cucumber Spark report). I chose playwright-bdd so the Playwright runner, cross-browser projects and expected-failure handling stay. I decided to leave out the self-healing locator engine, SonarCloud, ZAP and recorder tooling from my framework because they do not fit this assessment.

## What the AI did

| Area | AI contribution |
|------|-----------------|
| Project setup | Ran `npm init`, installed dependencies and Playwright browsers, and wrote the configs (TypeScript, Playwright, ESLint, Prettier, dotenv, CI workflow) |
| Discovery | Ran throw-away scripts against the live site to confirm `data-test` attributes, exact error messages, protected URLs, and `problem_user` and keyboard/focus behaviour before writing assertions |
| Framework and tests | Wrote all page objects, utilities and the original 38 tests (per browser) |
| BDD restructure | Read my reference framework, moved the code into its layout, wrote the 7 feature files, step definitions, fixtures, hooks, logger, Spark report script and `.vscode` settings, keeping the same 38 cases and assertions |
| Debugging | Investigated failures. Causes in the AI's own test code were fixed: (1) a focus check that clipped the outline area; (2) a Shift+Tab focus technique that did not work in Firefox; (3) after the restructure, two WebKit synchronisation issues (checkout form filled while mounting; cart read before it loaded). It confirmed DEF-02 with a positive control, and reproduced intermittent failures with `--repeat-each` before classifying them |
| Documentation | Drafted ANSWERS.md, README.md, the docs/ files and this file |

## Changes made during review

The AI changed the following after seeing actual results:
- **problem_user test:** it was failing at the dropdown wait rather than at the sort-order check, so it was changed to fail on the order evidence.
- **Visible-focus test:** reworked twice (padded capture, real Tab navigation).
- **WORKERS setting:** added after the Firefox contention investigation, instead of raising retries.
- **Checkout form and cart reads:** wait for the right page and assert each typed value stuck, after the 3 WebKit failures in the first BDD run. Retries were not added.

## What was verified, and how

| Verification | Result |
|--------------|--------|
| `npm run check` (bddgen, tsc strict, ESLint type-checked, Prettier) | Passed |
| BDD suite, Chromium, Firefox, WebKit, retries 0 | 114/114 passed, including 6 documented expected failures (`evidence/bdd-run-2-…log`) |
| First BDD run | 111 passed, 3 WebKit failures; root-caused and fixed (`evidence/bdd-run-1-…log`, `docs/known-limitations.md`) |
| Fix stability | Affected WebKit scenarios `--repeat-each=5`: 50/50 passed |
| Expected failures fail for the right reason | DEF-01 fails on the price order `[29.99, 9.99, 15.99, 49.99, 7.99, 15.99]`; DEF-02 on "controls whose appearance does not change on focus" |
| Pre-restructure history | Firefox contention investigation and runs kept in `evidence/pre-bdd-migration/` |
| Word limits | Strategy 121 words, Slack message 141 words (counted with `wc -w`) |

## What I (the candidate) must still do and own

- [ ] Read and understand every file, and be able to explain the design and each scenario in the interview.
- [ ] Check the B1 review against the **actual supplied snippet**. The AI did not have it, and its review follows the defect list in the brief.
- [ ] Fill in C2 with my **own real** production-issue experience; the AI deliberately did not invent one.
- [ ] Re-run `npx cross-env BROWSER=all WORKERS=2 npm test` myself before submitting and confirm the results.
- [ ] Edit any wording I would not say myself.

The code and documents were generated with AI assistance. I am not claiming I wrote them unaided; my own review is recorded by the checklist above.
