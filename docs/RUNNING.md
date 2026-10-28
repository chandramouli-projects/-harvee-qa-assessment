# Running the Suite

> **Source of truth** for npm scripts, environment variables, tags and reports.

## Setup

```bash
npm ci                                            # exact versions from package-lock.json
npx playwright install chromium firefox webkit
cp config/.env.example config/.env.demo           # PowerShell: Copy-Item config/.env.example config/.env.demo
```

Every test script runs `bddgen` first, so the generated tests in `.features-gen/` are always in step with the feature files.

## npm scripts

| Goal | Command |
|------|---------|
| All scenarios, browsers from config (Chromium by default) | `npm test` |
| All three browsers | `npm run test:all-browsers` (locally add `WORKERS=2`, see known limitations) |
| One browser | `npm run test:chromium` / `test:firefox` / `test:webkit` |
| Smoke set (`@smoke`) | `npm run test:smoke` |
| Only the known-defect scenarios | `npm run test:known-defects` |
| Headed / debugger / UI mode | `npm run test:headed` / `test:debug` / `test:ui` |
| Static checks (bddgen + tsc + ESLint + Prettier) | `npm run check` |
| Playwright HTML report | `npm run report` |
| Cucumber Spark report (after a run) | `npm run report:spark` |
| Delete generated output | `npm run clean` |

## Selecting scenarios by tag

Gherkin tags are Playwright tags, so `--grep` works on them:

```bash
npx bddgen && npx playwright test --grep @TC12                  # one manual case
npx bddgen && npx playwright test --grep "@checkout"            # one area
npx bddgen && npx playwright test --grep @P1 --grep-invert @known-defect
npx cross-env BROWSER=all WORKERS=2 npm test                    # as executed for the evidence
```

| Tag | Meaning |
|-----|---------|
| `@TC01` … `@TC98` | Manual case ID from the Excel (see `traceability-matrix.md`) |
| `@core` / `@extended` | Core suite (A1, TC01–TC25) / extended functional suite (TC26–TC98). TC23 and TC24 are tagged `@core` in the accessibility feature, so `npm run test:core` runs all 25 core cases |
| `@P1` / `@P2` / `@P3` | Priority from the manual suite |
| `@smoke` | Short critical-path set for every change |
| `@regression`, `@security` | Regression baskets; session / access checks |
| `@ui` + area tag | `@authentication`, `@catalogue`, `@cart`, `@checkout`, `@accessibility` |
| `@known-defect @DEF-xx @fail` | Genuine defect, full assertion kept, reported as expected failure |

## Environment variables (`config/.env.<ENV>`)

| Variable | Default in example | Purpose |
|----------|-------------------|---------|
| `ENV` | `demo` | Selects `config/.env.<ENV>` (registry: `config/environments.ts`). Set in the shell, not in the file. |
| `BASE_URL` | `https://www.saucedemo.com` | Application URL (required, validated) |
| `STANDARD_USER`, `LOCKED_OUT_USER`, `PROBLEM_USER`, `PERFORMANCE_GLITCH_USER`, `ERROR_USER`, `VISUAL_USER`, `PASSWORD` | public demo values | Required. A missing value stops the run with an error that names the variable but never prints its value |
| `BROWSER` | `chromium` | `chromium`, `firefox`, `webkit`, a comma-separated list, or `all` |
| `HEADLESS` | `true` | `true`/`false` |
| `SLOWMO` | `0` | Slow-motion delay in ms for watching a headed run |
| `TEST_TIMEOUT`, `ACTION_TIMEOUT`, `NAVIGATION_TIMEOUT`, `EXPECT_TIMEOUT` | 30000 / 10000 / 15000 / 10000 | Milliseconds, validated as integers |
| `RESPONSE_TIME_THRESHOLD` | `15000` | Scenarios slower than this are logged as a warning (not asserted) |
| `WORKERS` | `0` (Playwright default) | Use `2` for local cross-browser runs |
| `RETRIES` | `0` | Kept at 0 so first-run failures are visible |
| `LOG_LEVEL` | `warn` | Console level for step traces; the log file always records `info` |

Variables already set in the shell or CI take precedence over the file.

## Reports and artefacts

| Output | Location |
|--------|----------|
| Playwright HTML report (steps, attachments, traces) | `reports/html/index.html` — `npm run report` |
| JUnit XML for CI | `reports/junit/results.xml` |
| Cucumber JSON | `reports/cucumber/cucumber-report.json` |
| Cucumber Spark HTML report | `reports/spark-report/index.html` — `npm run report:spark` |
| Screenshot, video, trace of failed scenarios | `test-results/<scenario>-<browser>/` |
| View a trace | `npx playwright show-trace test-results/<dir>/trace.zip` |
| Step / scenario log | `logs/test-execution.log` |

Screenshots, video and trace are kept **only on failure**. Bug scenarios fail, so they keep them too and every known defect has evidence.

Accessibility suite only (strict WCAG 2.2 A/AA, axe JSON attached per screen):

```bash
npx bddgen && npx cross-env BROWSER=all WORKERS=2 playwright test --grep @accessibility
```

Security suite only (passive checks; `@security` alone would also pick up the functional session scenarios TC21, TC22 and TC88–TC94):

```bash
npx bddgen && npx cross-env BROWSER=all WORKERS=2 playwright test --grep "@SC[0-9]"
```
