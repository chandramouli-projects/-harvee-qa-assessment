# AI Usage Disclosure

## Tool used

**Claude Code (Anthropic), model Claude Opus 5.5**, run as a coding agent in VS Code on my machine on 2026-10-27.

## What I asked for

I gave the agent the full Harvee assessment brief. I asked it to build the Playwright/TypeScript project from an empty workspace, write the manual suite and written answers, run the tests against Sauce Demo, investigate failures, and report results truthfully.

## What the AI did

| Area | AI contribution |
|------|-----------------|
| Project setup | Ran `npm init`, installed dependencies and Playwright browsers, and wrote the configs (TypeScript, Playwright, ESLint, Prettier, dotenv, CI workflow) |
| Discovery | Ran throw-away scripts against the live site to confirm `data-test` attributes, exact error messages, protected URLs, and `problem_user` and keyboard/focus behaviour before writing assertions |
| Framework and tests | Wrote all page objects, fixtures, utilities and the 38 tests (per browser) |
| Debugging | Investigated failures. Two causes were in the AI's own test code and were fixed: (1) a focus check that clipped the outline area; (2) a Shift+Tab focus technique that did not work in Firefox. It confirmed DEF-02 with a positive control, and reproduced the Firefox-only intermittent failures with `--repeat-each` at different worker counts |
| Documentation | Drafted ANSWERS.md, README.md, the docs/ files and this file |

## Changes made during review

The AI changed the following after seeing actual results:
- **problem_user test:** it was failing at the dropdown wait rather than at the sort-order check, so it was changed to fail on the order evidence.
- **Visible-focus test:** reworked twice (padded capture, real Tab navigation).
- **WORKERS setting:** added after the Firefox contention investigation, instead of raising retries.

## What was verified, and how

| Verification | Result |
|--------------|--------|
| `npm run check` (tsc strict, ESLint type-checked, Prettier) | Passed |
| Full suite, Chromium, Firefox, WebKit, retries 0 | 114/114 passed, including 6 documented expected failures (`evidence/run-2-…log`, `reports/`) |
| First run (default workers) | 112 passed, 2 Firefox failures; investigated, see `docs/known-limitations.md` (`evidence/run-1-…log`) |
| Stability | Chromium suite repeated ×3: 114/114 passed |
| Word limits | Strategy 121 words, Slack message 141 words (counted with `wc -w`) |

## What I (the candidate) must still do and own

- [ ] Read and understand every file, and be able to explain the design and each test in the interview.
- [ ] Check the B1 review against the **actual supplied snippet**. The AI did not have it, and its review follows the defect list in the brief.
- [ ] Fill in C2 with my **own real** production-issue experience; the AI deliberately did not invent one.
- [ ] Re-run `npm run test:all-browsers` myself before submitting and confirm the results.
- [ ] Edit any wording I would not say myself.

The code and documents were generated with AI assistance. I am not claiming I wrote them unaided; my own review is recorded by the checklist above.
