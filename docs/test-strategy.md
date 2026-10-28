# Test Strategy — Sauce Demo "Shop and check out"

## Scope

Login, product sorting, cart, checkout, order completion and logged-out access on https://www.saucedemo.com, using only the published demo users. Also: cross-browser (Chrome, Firefox, Safari/WebKit), screen size, accessibility (WCAG 2.2 A/AA) and passive security checks.
Out of scope: load and stress testing, active security testing (scanning, fuzzing, brute force), API discovery, and any other system.

## Suites

| Suite | IDs | What it covers |
|-------|-----|----------------|
| **Core (A1)** | TC01–TC25 | The 25 cases that cover every business rule in the brief. 23 are in `src/test/features/UI/`; TC23 and TC24 are in the accessibility suite, named `TC23 AC03 …` and `TC24 AC14 …`. |
| **Extended functional** | TC26–TC98 | Extra input variations, product page, cart state, order integrity, navigation, session timeout and the other demo users. |
| **Accessibility** | AC01–AC15 | axe-core WCAG 2.2 A/AA scans, keyboard-only use, focus, names, alt text, page titles, reflow. |
| **Security (passive)** | SC01–SC14 | HTTPS, response headers, cookie flags, hand-made cookies, user enumeration, credentials in URL/storage, script input. |

The manual test cases (`manual_test_cases/SauceDemo_Functional_Test_Cases.xlsx`) are the source: every functional scenario has the same ID and title as its Excel row, so manual and automated results can be compared one to one.

## Layers

| Layer | What belongs here | Status |
|-------|-------------------|--------|
| UI automation | The core journeys and the extended, accessibility and security checks above, in three browsers. | Implemented and executed. |
| API / unit (client-owned system) | Total and tax calculation, sort logic, field validation, server-side login and session checks, one order per checkout. | Not possible here: no source or API contract was supplied, so no endpoints were invented. Recommended for a client system. |
| Manual / exploratory | `problem_user` charter, screen-reader use (NVDA/VoiceOver), real phones, browser zoom, the PDF order content, visual review. | Designed (ANSWERS.md A1.3); to be run before sign-off. |

## Strategy summary (under 150 words)

See ANSWERS.md, section A1.4. In short: the 25 core journeys run at the UI layer in three browsers; calculations, validation, sorting and server-side access rules belong at the API/unit layer if the client has one; exploratory, screen-reader, real-device and visual checks stay manual. **Biggest remaining risk:** login and the cart are enforced only in the browser (a hand-made login cookie opens the shop; one user's cart is shown to the next user), and the UI cannot prove what the server allows.

## Entry and exit criteria

- **Entry:** site reachable; `config/.env.demo` configured; `npm run check` passes.
- **Exit:** every P1 case executed in all three browsers; every failure investigated and classified as a product bug, a test problem or an environment problem; every remaining failure linked to a bug ID with evidence; no unexplained flaky tests.

## Reliability rules

No fixed sleeps (enforced by ESLint). Each scenario starts in a fresh browser context and logs in itself. Retries are 0, so first-run failures stay visible. Any intermittent failure is reproduced with `--repeat-each` before it is classified. The public practice site is not load-tested: repeat runs are kept to what is needed to diagnose a failure.
