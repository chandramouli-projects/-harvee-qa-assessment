# Commands

Every command you need to run this project, and what each one does. Run them from the project folder in a terminal (PowerShell, Command Prompt or Git Bash all work).

> **How settings work:** `npx cross-env NAME=value <command>` sets a setting for that one run only. It works the same on Windows, Mac and Linux. Settings you don't pass come from `config/.env.demo`.

---

## 1. One-time setup

```bash
npm ci                                          # install the exact package versions
npx playwright install chromium firefox webkit  # download the three browsers
cp config/.env.example config/.env.demo         # create your settings file
```

In PowerShell, use `Copy-Item config/.env.example config/.env.demo` for the last line.

---

## 2. The commands you will use most

| What it runs | Command |
|--------------|---------|
| **The 25 core (A1) test cases**, Chrome | `npm run test:core` |
| The 25 core cases in **all three browsers** | `npx cross-env BROWSER=all WORKERS=2 npm run test:core` |
| **Everything** (core + extended + accessibility + security), Chrome | `npm test` |
| Everything in all three browsers (as used for the evidence) | `npx cross-env BROWSER=all WORKERS=2 npm test` |
| Smoke set: 5 key journeys (TC01, TC07, TC09, TC12, TC21) | `npm run test:smoke` |
| Open the last HTML report | `npm run report` |

---

## 3. Headless or headed (watch the browser)

By default the browser is **headless**: it runs in the background and you see only the results in the terminal.

| What you want | Command |
|---------------|---------|
| Headless (default) | `npm test` |
| **Headed**: see the browser window | `npm run test:headed` |
| Headed and slowed down, so you can follow each step (500 ms per action) | `npx cross-env HEADLESS=false SLOWMO=500 npm test -- --grep @TC12` |
| **UI mode**: a window that lists every test; click to run, see each step and the page | `npm run test:ui` |
| **Debug mode**: step through one test line by line in the Playwright Inspector | `npm run test:debug -- --grep @TC12` |

---

## 4. Choose the browser

| Browser | Command |
|---------|---------|
| Chrome (Chromium), the default | `npm run test:chromium` |
| Firefox | `npm run test:firefox` |
| Safari engine (WebKit) | `npm run test:webkit` |
| All three | `npx cross-env BROWSER=all WORKERS=2 npm test` |

`WORKERS=2` runs two tests at a time. On a laptop, more than that can slow Firefox down (see `docs/known-limitations.md`).

You can combine a browser with any selection below, for example:
`npx cross-env BROWSER=firefox npm test -- --grep @TC07`

---

## 5. Choose which tests to run

Everything after `--` is passed to Playwright. `--grep` picks tests by tag; every test is tagged with its ID, area and priority.

| What it runs | Command |
|--------------|---------|
| One test case (by manual ID) | `npm test -- --grep @TC12` |
| Several test cases (`\|` means "or") | `npm test -- --grep "@TC01\|@TC02"` |
| One area | `npm test -- --grep @checkout` |
| All P1 (highest priority) cases | `npm test -- --grep @P1` |
| Extended cases only (TC26–TC98) | `npm run test:extended` |
| Accessibility suite only (AC01–AC15) | `npm test -- --grep @accessibility` |
| Security suite only (SC01–SC14) | `npm test -- --grep "@SC[0-9]"` |
| Only the tests for known bugs (they fail while the bug exists) | `npm run test:known-defects` |
| Everything **except** the known-bug tests | `npm test -- --grep-invert @known-defect` |
| See which tests would run, without running them | `npm test -- --grep @checkout --list` |
| B1 rewrite as a plain Playwright test (three browsers) | `npm run test:b1-plain` |

**Area tags:** `@authentication`, `@catalogue` (sorting), `@products`, `@product-detail`, `@cart`, `@checkout`, `@order-completion`, `@navigation`, `@personas`, `@security`, `@accessibility`.

---

## 6. Reports and failure evidence

| What you want | Command / location |
|---------------|--------------------|
| Open the Playwright HTML report (steps, screenshots, traces) | `npm run report` |
| Build and open the Cucumber Spark report (after a run) | `npm run report:spark` |
| Replay a failed test step by step | `npx playwright show-trace test-results/<test folder>/trace.zip` |
| Screenshot, video and trace of each failed test | `test-results/<test name>-<browser>/` |
| JUnit XML (for CI tools) | `reports/junit/results.xml` |
| Step-by-step log of the run | `logs/test-execution.log` |

---

## 7. Other useful commands

| What it does | Command |
|--------------|---------|
| Check the code: TypeScript, ESLint, Prettier and the feature files | `npm run check` |
| Fix code formatting | `npm run format` |
| Delete all reports, results and logs | `npm run clean` |
| Retry failed tests (off by default, so problems stay visible) | `npx cross-env RETRIES=1 npm test` |
| Show more detail in the terminal while tests run | `npx cross-env LOG_LEVEL=info npm test -- --grep @TC12` |

All settings (users, timeouts, log levels) are listed in [docs/RUNNING.md](docs/RUNNING.md).
