# Test Strategy — Sauce Demo (Harvee Technologies assessment)

## Scope

Functional, accessibility, responsive, cross-browser and safe session checks of https://www.saucedemo.com, using the public demo users only. Out of scope: load, stress and penetration testing, API discovery, and any other system.

## Layers

| Layer | What belongs here | Status in this assessment |
|-------|-------------------|---------------------------|
| UI automation (Playwright) | Critical journeys: login and its errors, full-list sorting, cart badge and contents, checkout validation, totals and completion, cancellation, session protection, keyboard operability, axe scan, viewport checks. | Implemented, executed on Chromium, Firefox and WebKit. |
| API / unit | Price, tax and total calculation; sort comparators (including ties); field validation; authorisation of every protected endpoint; order idempotency. | **Not performed.** No source or API contract was supplied, so no endpoints were invented. Recommended for a client-owned system. |
| Manual / exploratory | `problem_user` charter, visual and responsive review on real devices, screen-reader usability, duplicate submission and order integrity, usability. | Designed (ANSWERS.md A1, EX-01). |

## Strategy summary (under 150 words)

The UI layer keeps a thin, stable set of critical journeys. These run across three engines and assert business outcomes: whole-list ordering, subtotal + tax = total to the cent, an empty cart after an order, and blocked access after logout. Calculation rules, validation, comparators and authorisation belong in fast API and unit tests in the client's own codebase. They are not covered here because Sauce Demo exposes no supported API or source. Manual effort goes to exploratory charters, real-device and visual checks, screen-reader usability, and order-integrity scenarios that need backend visibility. **Largest remaining risk:** order integrity. The UI cannot confirm what the backend recorded or charged, whether a double submission creates duplicate orders, or whether protected endpoints enforce authorisation server-side.

## Entry and exit criteria

- **Entry:** site reachable; `.env` configured; `npm run check` passes.
- **Exit:** every P1 case executed; all unexpected failures investigated and classified as product defect, test defect or environment; known defects tracked with evidence; no unexplained flaky tests.

## Reliability rules

No fixed sleeps (enforced by ESLint). Each test gets a fresh browser context and its own login. Retries default to 0 so first-run failures stay visible. Any intermittent failure is reproduced with `--repeat-each` before it is classified.
