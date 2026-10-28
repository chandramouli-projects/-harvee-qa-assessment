# Settings and Tags

How to run things is in [COMMANDS.md](../COMMANDS.md). This page lists the settings and tags those commands use.

## Settings (`config/.env.<ENV>`)

Copy `config/.env.example` to `config/.env.demo`. A value set in the shell or in CI (for example `npx cross-env BROWSER=all npm test`) overrides the file.

| Variable | Default in example | Purpose |
|----------|-------------------|---------|
| `ENV` | `demo` | Selects `config/.env.<ENV>` (registry: `config/environments.ts`). Set in the shell, not in the file. |
| `BASE_URL` | `https://www.saucedemo.com` | Application URL (required, validated) |
| `STANDARD_USER`, `LOCKED_OUT_USER`, `PROBLEM_USER`, `PERFORMANCE_GLITCH_USER`, `ERROR_USER`, `VISUAL_USER`, `PASSWORD` | public demo values | Required. A missing value stops the run with an error that names the variable but never prints its value |
| `BROWSER` | `chromium` | `chromium`, `firefox`, `webkit`, a comma-separated list, or `all` |
| `HEADLESS` | `true` | `false` opens a visible browser window |
| `SLOWMO` | `0` | Delay in ms between actions, for watching a headed run |
| `TEST_TIMEOUT`, `ACTION_TIMEOUT`, `NAVIGATION_TIMEOUT`, `EXPECT_TIMEOUT` | 30000 / 10000 / 15000 / 10000 | Milliseconds, validated as integers |
| `RESPONSE_TIME_THRESHOLD` | `15000` | Scenarios slower than this are logged as a warning (not asserted) |
| `WORKERS` | `0` (Playwright default) | Tests run at the same time; use `2` for local three-browser runs |
| `RETRIES` | `0` | Kept at 0 so first-run failures are visible |
| `LOG_LEVEL` | `warn` | Terminal detail for step logs; the log file always records `info` |

## Tags

Gherkin tags are Playwright tags, so `npm test -- --grep <tag>` selects them.

| Tag | Meaning |
|-----|---------|
| `@TC01` … `@TC98` | Manual case ID from the Excel (see `traceability-matrix.md`) |
| `@AC01` … `@AC15`, `@SC01` … `@SC14` | Accessibility and security case IDs |
| `@core` / `@extended` | Core suite (A1, TC01–TC25) / extended functional suite (TC26–TC98). TC23 and TC24 are tagged `@core` in the accessibility feature, so `npm run test:core` runs all 25 core cases |
| `@P1` / `@P2` / `@P3` | Priority from the manual suite |
| `@smoke` | Five key journeys for every change |
| `@regression` | Regression set |
| Area tags | `@authentication`, `@catalogue`, `@products`, `@product-detail`, `@cart`, `@checkout`, `@order-completion`, `@navigation`, `@personas`, `@security`, `@accessibility` |
| `@known-defect` + `@BUG-xx` / `@AC-BUG-xx` / `@SC-BUG-xx` | A real bug: the full check is kept, so the test fails while the bug exists and passes once it is fixed |
