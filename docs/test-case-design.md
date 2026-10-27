# Test Case Design — Sauce Demo (from scratch)

**Author:** Chandramouli Kancharla · **Application:** https://www.saucedemo.com · **Analysis date:** 2026-10-27
**Purpose:** show the full design process, from understanding the application to detailed test cases. The 25 cases in `ANSWERS.md` (A1) are the assessment's required subset; this document is the complete design they were selected from.

**Contents**
1. [Understand the application](#1-understand-the-application)
2. [Derived requirements](#2-derived-requirements-no-written-spec-was-supplied)
3. [Risk analysis and prioritisation](#3-risk-analysis-and-prioritisation)
4. [Test dimensions](#4-test-dimensions--the-checklist-applied-to-every-feature)
5. [Test design techniques](#5-test-design-techniques-and-where-they-were-applied)
6. [Test scenarios](#6-test-scenarios-what-to-test)
7. [Detailed test cases](#7-detailed-test-cases-how-to-test) (138 cases)
8. [Observations found during design](#8-observations-found-during-design)
9. [Questions for the product owner](#9-questions-for-the-product-owner)
10. [Test data and environment matrix](#10-test-data-and-environment-matrix)
11. [Coverage summary](#11-coverage-summary)
12. [Mapping to the assessment's 25 cases](#12-mapping-to-the-assessments-25-cases-answersmd-a1)

---

## 1. Understand the application

Before writing any case, I explored the live site as a user and inspected the page structure. Nothing below is assumed; each item was observed on 2026-10-27.

### 1.1 Application map

```
Login (/)
 └─► Products (/inventory.html) ──► Product detail (/inventory-item.html?id=N)
       │  sort · add/remove · cart icon · burger menu · footer links
       ▼
     Cart (/cart.html) ──► Checkout: Information (/checkout-step-one.html)
                              ──► Checkout: Overview (/checkout-step-two.html)
                                    ──► Checkout: Complete (/checkout-complete.html)
                                          └─ Back Home · Generate PDF order
Burger menu (every signed-in page): All Items · Dynamic Catalog (Lazy Load, Spinner, Slider) · About · Logout · Reset App State
```

### 1.2 Users (personas) published on the login page

| User | Purpose (as a tester sees it) |
|------|-------------------------------|
| `standard_user` | Baseline: expected behaviour |
| `locked_out_user` | Access control: must be refused |
| `problem_user` | Deliberately faulty UI (e.g. sorting has no effect) |
| `performance_glitch_user` | Deliberately slow responses |
| `error_user` | Deliberately triggers errors in some actions |
| `visual_user` | Deliberately visual/layout differences |

All users share the published demo password.

### 1.3 Facts observed that shape the test design

| # | Observation | Design impact |
|---|-------------|---------------|
| F1 | Six products; two share a price ($15.99) | Sorting must allow ties |
| F2 | Default sort is "Name (A to Z)" | An A–Z test must re-sort from another order first |
| F3 | No `maxlength` on any input (login and checkout) | Long-input boundary cases |
| F4 | Username is case-sensitive and not trimmed (`" standard_user "` is rejected) | EP/boundary cases + PO question |
| F5 | Session is a `session-username` cookie expiring after ~10 minutes | Session-timeout case |
| F6 | Cart has no quantity control (quantity is always 1) | Quantity question for the PO |
| F7 | Unknown product id shows an "ITEM NOT FOUND" page | Error-handling cases |
| F8 | Overview shows Payment "SauceCard #31337" and "Free Pony Express Delivery!"; tax on $7.99 was $0.64 | Totals cases; tax rate not documented, so not hard-coded |
| F9 | Completion page offers "Generate PDF order" | New feature with no stated behaviour |
| F10 | Login error has a close (X) button | Usability case |

---

## 2. Derived requirements (no written spec was supplied)

With no specification, I derive testable requirements from the visible application and the assessment brief, and mark anything uncertain as a question rather than a rule.

| ID | Requirement | Source |
|----|-------------|--------|
| R01 | Only valid, non-locked users can sign in; failures show a specific error | Login page, brief |
| R02 | Signed-out users cannot view any signed-in page | Brief (TC22) |
| R03 | The catalogue lists every product with name, description, price, image and an add/remove control | UI |
| R04 | Each sort option orders the **whole** list correctly | Sort control, brief |
| R05 | The cart badge always equals the number of items in the cart | UI, brief |
| R06 | Items can be added and removed from Products, Product detail and Cart | UI |
| R07 | First name, last name and postal code are required at checkout | Error messages |
| R08 | Overview item total = sum of item prices; Total = item total + tax, to the cent | Brief |
| R09 | Finishing places the order, shows confirmation and empties the cart | UI, brief |
| R10 | Cancelling checkout does not place an order | UI, brief |
| R11 | The site is usable by keyboard and assistive technology | Brief (accessibility) |
| R12 | The site works in supported browsers and screen sizes | Brief (compatibility) |

---

## 3. Risk analysis and prioritisation

Risk = **business impact × likelihood**. Priority follows risk.

| Area | Impact if broken | Likelihood | Risk | Priority |
|------|------------------|-----------|------|----------|
| Checkout totals and order completion | Wrong charge, lost revenue, legal | Medium | **High** | P1 |
| Login / access control / session | Locked out customers or unauthorised access | Medium | **High** | P1 |
| Cart state (badge, contents, persistence) | Wrong items ordered | Medium | **High** | P1 |
| Order integrity (duplicates) | Double charge | Low–Medium | **High** | P1 |
| Sorting | Misleading shopping, lower conversion | Medium (regression seen in B3) | Medium | P2 |
| Product detail, navigation, menu | Friction, dead ends | Low | Medium | P2 |
| Accessibility | Excludes users, compliance exposure | Medium | Medium | P2 |
| Responsive / cross-browser | Lost mobile or Safari users | Medium | Medium | P2 |
| Visual polish, footer links, Dynamic Catalog demos | Cosmetic | Low | Low | P3 |

---

## 4. Test dimensions — the checklist applied to every feature

For each feature I ask the same questions. This is what keeps the design complete rather than limited to happy paths.

| # | Dimension | Question I ask |
|---|-----------|----------------|
| D1 | Functional — positive | Does it do what it should with valid input? |
| D2 | Functional — negative | Does it reject invalid input with a clear, specific message and no side effects? |
| D3 | Boundary / limits | What happens at empty, minimum, maximum, ties and precision limits? |
| D4 | State and data flow | Does state stay correct across pages, refresh, back/forward, tabs and logout? |
| D5 | Data consistency | Is the same value (name, price) identical everywhere it appears? |
| D6 | Calculation | Are totals mathematically correct to the cent, for any basket? |
| D7 | Error handling and recovery | Do bad URLs, missing data and interrupted flows fail gracefully? |
| D8 | Navigation | Can the user always get back; do links go where they say? |
| D9 | Session and security | Is access controlled; are credentials protected; is input treated as text? |
| D10 | Order integrity | Can one intent ever create zero or two orders? |
| D11 | Persona / role | Do different users behave as their role implies? |
| D12 | Usability | Is feedback immediate, are actions reversible, is the empty state clear? |
| D13 | Accessibility | Keyboard, focus, names, announcements, contrast, zoom |
| D14 | Compatibility / responsive | Browsers, engines, viewports, orientation, touch |
| D15 | Performance (perceived, single user) | Is anything noticeably slow? (No load testing on a public site.) |

---

## 5. Test design techniques and where they were applied

| Technique | What it means | Applied to |
|-----------|---------------|-----------|
| **Equivalence partitioning (EP)** | Split inputs into classes that behave the same; test one per class | Users (valid / locked / unknown / wrong password); name characters (ASCII / accented / CJK / symbols) |
| **Boundary value analysis (BVA)** | Test at and around limits | Empty input; 0/1/2/6 cart items; very long input; price ties; cent precision |
| **Decision table** | Combinations of conditions → outcomes | Login (username empty?, password empty?, valid?) and checkout (each of 3 fields present/absent) |
| **State transition** | Test every valid and invalid move between states | Cart badge 0→1→2→1→0; signed-in → signed-out → direct URL; checkout steps and Cancel/Back |
| **Use case / end-to-end** | Complete real user journeys | Browse → add → cart → checkout → complete |
| **Error guessing** | Experience-based guesses where bugs hide | Spaces only, double-click Finish, Back after order, invalid product id, two tabs |
| **Pairwise / matrix** | Cover combinations efficiently | Persona × journey; browser × viewport |
| **Exploratory (charter-based)** | Time-boxed, learning-driven testing | `problem_user`, `error_user`, `visual_user`, Dynamic Catalog |
| **Risk-based testing** | Effort proportional to risk | Priorities P1–P3 (section 3) |

---

## 6. Test scenarios (what to test)

A scenario is a one-line "what"; each expands into detailed cases in section 7.

| Scenario | Module | Description | Cases |
|----------|--------|-------------|-------|
| TS-01 | Login | Valid users can sign in | LGN-01–03 |
| TS-02 | Login | Invalid, locked and empty credentials are refused with the right message | LGN-04–09 |
| TS-03 | Login | Input variations (case, spaces, length, special characters) are handled safely | LGN-10–15 |
| TS-04 | Login | Login page usability and content | LGN-16–19 |
| TS-05 | Products | Catalogue displays complete, consistent product data | PRD-01–07 |
| TS-06 | Products | Default state and footer | PRD-08–09 |
| TS-07 | Sorting | Each sort orders the whole list; ties and data integrity | SRT-01–06 |
| TS-08 | Sorting | Sorting interacts correctly with cart state and navigation | SRT-07–10 |
| TS-09 | Product detail | Detail page matches listing and supports add/remove | PDP-01–05 |
| TS-10 | Product detail | Invalid or unauthorised detail URLs fail gracefully | PDP-06–08 |
| TS-11 | Cart | Badge and contents stay correct on add/remove, including boundaries | CRT-01–07 |
| TS-12 | Cart | Cart state persists correctly across navigation, refresh, logout, users and tabs | CRT-08–15 |
| TS-13 | Checkout information | Required fields and validation | CHI-01–06 |
| TS-14 | Checkout information | Input variety, retention, cancel and safety | CHI-07–13 |
| TS-15 | Checkout overview | Items and totals are correct to the cent | CHO-01–06 |
| TS-16 | Checkout overview | Cancel, Back, refresh and empty-cart access | CHO-07–10 |
| TS-17 | Order completion | Confirmation and cart reset | CHC-01–03 |
| TS-18 | Order integrity | No duplicate or phantom orders | CHC-04–08 |
| TS-19 | Navigation | Menu, links and cart icon work from every page | NAV-01–03, NAV-08–10 |
| TS-20 | Session | Logout, reset, timeout and Back behaviour | NAV-04–07 |
| TS-21 | Personas | Each demo persona behaves as its role implies | PER-01–06 |
| TS-22 | Accessibility | Keyboard, focus, names, announcements, contrast, zoom, scan | A11Y-01–11 |
| TS-23 | Compatibility | Browsers, viewports, orientation, touch | CMP-01–07 |
| TS-24 | Security | Access control, credential handling, input safety, transport | SEC-01–09 |
| TS-25 | Performance (perceived) | Single-user timings only | PERF-01–03 |

---

## 7. Detailed test cases (how to test)

**Legend**
- **Tech:** EP, BVA, DT (decision table), ST (state transition), UC (use case), EG (error guessing), MX (matrix), EXP (exploratory).
- **Pri:** P1 (critical) to P3 (low).
- **Auto:** ✅ automated in this repo · 🟡 good automation candidate · ✋ manual (needs human judgement, backend access or a real device).
- **Logged in:** signed in as `standard_user`, empty cart, fresh browser session.
- **Q#:** expected result depends on an open product-owner question (section 9). The current behaviour is recorded, not assumed correct.

### 7.1 Login (LGN)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| LGN-01 | Valid login via Login button | Positive | EP | On login page | Enter credentials, click Login | `standard_user` | Products page; title "Products"; 6 products; no error | P1 | ✅ |
| LGN-02 | Valid login via Enter key | Positive | UC | On login page | Enter credentials, press Enter in password field | `standard_user` | Same as LGN-01 | P2 | ✅ |
| LGN-03 | Every non-locked persona can sign in | Positive | EP/MX | On login page | Repeat login for each user | standard, problem, performance_glitch, error, visual | Products page for each user | P1 | 🟡 |
| LGN-04 | Locked-out user refused | Negative / Security | EP | On login page | Log in | `locked_out_user` | "Epic sadface: Sorry, this user has been locked out."; stays on login | P1 | ✅ |
| LGN-05 | Wrong password refused | Negative | EP | On login page | Log in | `standard_user` + wrong password | "Username and password do not match any user in this service" | P1 | ✅ |
| LGN-06 | Unknown username refused | Negative | EP | On login page | Log in | `unknown_user` + demo password | Same message as LGN-05 (does not reveal which field is wrong) | P1 | ✅ |
| LGN-07 | Both fields empty | Negative | DT/BVA | On login page | Click Login | – | "Username is required" | P2 | ✅ |
| LGN-08 | Username empty only | Negative | DT | On login page | Fill password, click Login | – | "Username is required" | P2 | ✅ |
| LGN-09 | Password empty only | Negative | DT | On login page | Fill username, click Login | – | "Password is required" | P2 | ✅ |
| LGN-10 | Username case sensitivity | Negative | EP | On login page | Log in | `STANDARD_USER` | Current: refused with mismatch error (Q5) | P2 | 🟡 |
| LGN-11 | Leading/trailing spaces in username | Boundary | BVA/EG | On login page | Log in | `" standard_user "` | Current: refused; no trimming (Q5) | P3 | 🟡 |
| LGN-12 | Password case sensitivity | Negative | EP | On login page | Log in | demo password in upper case | Refused with mismatch error | P2 | 🟡 |
| LGN-13 | Very long input | Boundary | BVA | On login page | Enter 1,000-character username and password, click Login | 1,000 × "a" | Standard mismatch error; no crash, freeze or layout break | P3 | 🟡 |
| LGN-14 | Script-like / SQL-like text treated as text | Security | EG | On login page | Log in | `<b>x</b>`, `' OR '1'='1` | Mismatch error; text not rendered as HTML; no script runs; page intact | P2 | 🟡 |
| LGN-15 | Password is masked | Security | – | On login page | Type password | any | Characters masked (`type=password`); not in URL | P1 | ✅ |
| LGN-16 | Error can be dismissed | Usability | – | Error displayed | Click the X on the error | – | Error disappears. Note OBS-04: field error styling may remain | P3 | 🟡 |
| LGN-17 | Error updates on corrected retry | Usability | ST | Error displayed | Fix the input, submit again | valid user | Old error gone; user signed in | P3 | 🟡 |
| LGN-18 | Signed-in user opens login URL | State | ST/EG | Logged in | Navigate to `/` | – | Record behaviour (stays signed in or shows login); clarify Q6 | P3 | ✋ |
| LGN-19 | Login page content | UI | – | On login page | Inspect page | – | Logo, Username/Password fields with placeholders, Login button, accepted-users and password hints visible | P3 | 🟡 |

### 7.2 Products listing (PRD)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| PRD-01 | Every product shows complete data | Positive | – | Logged in | Inspect each card | 6 products | Each has image, name, description, price, "Add to cart" | P1 | 🟡 |
| PRD-02 | Price format | UI / Data | EP | Logged in | Read every price | – | Every price matches `$<digits>.<2 digits>` | P2 | 🟡 |
| PRD-03 | No duplicate or blank product names | Data | – | Logged in | Read names | – | 6 unique, non-empty names | P3 | 🟡 |
| PRD-04 | Name link opens the matching detail page | Positive | – | Logged in | Click each product name | – | Detail page for the same product | P2 | 🟡 |
| PRD-05 | Image link opens the matching detail page | Positive | – | Logged in | Click each product image | – | Detail page for the same product | P2 | 🟡 |
| PRD-06 | Images load | UI | – | Logged in | Check each image | – | No broken images (loaded, non-zero size); each image matches its product | P2 | 🟡 |
| PRD-07 | Price is consistent across pages | Data consistency | – | Logged in | Compare one product's price on listing, detail, cart, overview | Backpack | Identical price on all four pages | P1 | ✅ (cart/overview) |
| PRD-08 | Default sort | Positive | – | Logged in | Observe sort control and order | – | "Name (A to Z)" selected; list in A–Z order | P2 | 🟡 |
| PRD-09 | Footer social links | Navigation | – | Logged in | Check X, Facebook, LinkedIn links | – | Each points to the matching Sauce Labs profile and opens in a new tab (external content not tested) | P3 | 🟡 |

### 7.3 Sorting (SRT)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| SRT-01 | Name A→Z, whole list | Positive | – | Logged in; sorted Z→A first | Select "Name (A to Z)" | 6 products | Every adjacent pair ascending | P2 | ✅ |
| SRT-02 | Name Z→A, whole list | Positive | – | Logged in | Select "Name (Z to A)" | – | Every adjacent pair descending | P2 | ✅ |
| SRT-03 | Price low→high, whole list | Positive | – | Logged in; sorted high→low first | Select "Price (low to high)" | – | Every price ≤ next | P1 | ✅ |
| SRT-04 | Price high→low, whole list | Positive | – | Logged in | Select "Price (high to low)" | – | Every price ≥ next | P2 | ✅ |
| SRT-05 | Equal prices allowed in any order | Boundary | BVA | Logged in | Sort by price both ways | two products at $15.99 | Tied items adjacent; either order accepted (Q3) | P2 | ✅ |
| SRT-06 | Sorting keeps data intact | Data | – | Logged in | Compare product/price set before and after each sort | – | Same 6 products, same prices; none added or lost | P1 | ✅ |
| SRT-07 | Sort after adding items keeps button states | State | ST | Logged in; 2 items added | Change sort | – | The two added products still show "Remove"; badge unchanged | P2 | 🟡 |
| SRT-08 | Sort persistence after navigation | State | ST/EG | Logged in; sorted by price | Open a product, click Back to products | – | Record whether the sort is kept (Q3) | P3 | ✋ |
| SRT-09 | Rapid sort changes | Robustness | EG | Logged in | Cycle A–Z → Z–A → low–high → high–low → A–Z | – | Each result correct; no stale order | P3 | 🟡 |
| SRT-10 | Selected label shown | UI | – | Logged in | Select each option | – | Control shows the selected option's label | P3 | ✅ |

### 7.4 Product detail (PDP)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| PDP-01 | Detail matches listing | Data consistency | – | Logged in | Open each product | 6 products | Same name, description, price, image as listing | P1 | 🟡 |
| PDP-02 | Add from detail | Positive | ST | Logged in | Open Backpack, click Add to cart | – | Badge 1; button changes to Remove | P1 | 🟡 |
| PDP-03 | Remove from detail | Positive | ST | Backpack in cart; on its detail page | Click Remove | – | Badge hidden; button back to Add to cart | P2 | 🟡 |
| PDP-04 | Back to products | Navigation | – | On a detail page with 1 item in cart | Click Back to products | – | Products page; badge still 1 | P2 | 🟡 |
| PDP-05 | Detail and listing stay in sync | State | ST | Logged in | Add on detail, go back to listing | – | Listing shows Remove for that product | P2 | 🟡 |
| PDP-06 | Unknown product id | Negative / Error handling | EG/BVA | Logged in | Open `/inventory-item.html?id=99` | id=99 | Friendly "ITEM NOT FOUND" message; navigation still works; no crash | P3 | 🟡 |
| PDP-07 | Non-numeric or missing id | Negative | EG | Logged in | Open `?id=abc` and no `id` | – | Graceful message, no crash; record behaviour | P3 | 🟡 |
| PDP-08 | Detail URL without login | Security | ST | Signed out | Open `/inventory-item.html?id=4` | – | Login page with "You can only access '/inventory-item.html' when you are logged in." | P1 | ✅ |

### 7.5 Cart (CRT)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| CRT-01 | Add one product | Positive | ST | Logged in | Add Backpack | – | Badge 1; button shows Remove | P1 | ✅ |
| CRT-02 | Add two, remove one on listing | Positive | ST | Logged in | Add Backpack + Bike Light, remove Backpack, open cart | – | Badge 0→1→2→1; cart contains only Bike Light | P1 | ✅ |
| CRT-03 | Add every product (maximum) | Boundary | BVA | Logged in | Add all 6 | – | Badge 6; cart lists 6 lines | P2 | ✅ |
| CRT-04 | Remove everything (minimum) | Boundary | BVA/ST | 6 items in cart | Remove all on listing | – | Badge disappears (not "0"); all buttons Add to cart | P2 | 🟡 |
| CRT-05 | Cart line content | Positive | – | 2 items in cart | Open cart | – | Each line: quantity 1, name, description, price matching listing | P1 | ✅ |
| CRT-06 | Remove on cart page | Positive | ST | 2 items in cart | Remove each item on cart page | – | Line disappears; badge 2→1→hidden | P1 | ✅ |
| CRT-07 | Empty cart page | Usability / Boundary | BVA | Logged in, empty cart | Open cart | – | No lines; Continue Shopping visible. Checkout is enabled (OBS-03, Q1) | P2 | ✅ |
| CRT-08 | Continue Shopping keeps cart | Navigation | ST | 1 item in cart, on cart page | Click Continue Shopping | – | Products page; badge 1 | P2 | ✅ |
| CRT-09 | Cart persists across pages | State | ST | 2 items | Listing → detail → cart → listing | – | Badge 2 and same items throughout | P1 | 🟡 |
| CRT-10 | Cart persists after refresh | State | ST | 2 items | Refresh on listing and on cart page | – | Badge 2; same items | P1 | 🟡 |
| CRT-11 | Cart after logout and re-login (same user) | State | ST/EG | 2 items | Logout, log in again as same user | – | Record behaviour (kept or cleared) (Q7) | P2 | ✋ |
| CRT-12 | Cart isolation between users | Security / Data | EG | User A has 2 items | Logout, log in as `problem_user` | – | Assumed privacy expectation: B does not see A's items (Q7). Record actual | P1 | 🟡 |
| CRT-13 | Quantity cannot be changed | Usability | – | 1 item in cart | Look for quantity control | – | No control; quantity fixed at 1 (Q8) | P3 | ✋ |
| CRT-14 | Cart item link opens detail | Navigation | – | 1 item in cart | Click the item name in cart | – | Matching detail page | P3 | 🟡 |
| CRT-15 | Two tabs share the cart | State | EG | Logged in, two tabs | Add in tab 1, refresh tab 2 | – | Tab 2 shows the same badge and items | P3 | ✋ |

### 7.6 Checkout — information (CHI)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| CHI-01 | Valid details proceed | Positive | EP | 1 item; on step one | Fill all fields, Continue | Test / Customer / 12345 | Overview page | P1 | ✅ |
| CHI-02 | First name missing | Negative | DT | as CHI-01 | Leave first name empty, Continue | – | "Error: First Name is required"; stays on step one | P1 | ✅ |
| CHI-03 | Last name missing | Negative | DT | as CHI-01 | Leave last name empty, Continue | – | "Error: Last Name is required" | P1 | ✅ |
| CHI-04 | Postal code missing | Negative | DT | as CHI-01 | Leave postal code empty, Continue | – | "Error: Postal Code is required" | P1 | ✅ |
| CHI-05 | All empty: validation order | Negative | DT | as CHI-01 | Continue with all fields empty | – | First error shown is "First Name is required" | P2 | 🟡 |
| CHI-06 | Whitespace-only fields | Boundary / Negative | BVA/EG | as CHI-01 | Enter three spaces in each field, Continue | `"   "` | **Current: accepted, goes to overview (OBS-02).** Expected per Q4: likely rejected | P2 | 🟡 |
| CHI-07 | International and special characters | Positive | EP | as CHI-01 | Fill and Continue | `O'Brien`, `José`, `李`, `Anne-Marie` | Accepted; proceeds to overview | P2 | 🟡 |
| CHI-08 | Very long values | Boundary | BVA | as CHI-01 | Fill 255 and 1,000 characters | – | No crash or layout break; record behaviour (Q4) | P3 | 🟡 |
| CHI-09 | Postal code formats | Boundary | EP | as CHI-01 | Try each format | `12345`, `12345-6789`, `SW1A 1AA`, `ABCDE` | Record acceptance; no format rule is published (Q4) | P3 | 🟡 |
| CHI-10 | Error dismiss and correction | Usability | ST | Error shown | Click X; fix field; Continue | – | Error hidden; proceeds after correction | P3 | 🟡 |
| CHI-11 | Values retained after an error | Usability | EG | as CHI-01 | Fill first and last name, leave postal empty, Continue | – | First and last name still filled | P3 | 🟡 |
| CHI-12 | Cancel returns to cart | Usability | ST | as CHI-01 | Click Cancel | – | Cart page; items unchanged; no order | P2 | ✅ |
| CHI-13 | Script-like text is harmless | Security | EG | as CHI-01 | Enter `<img src=x onerror=alert(1)>` as first name, Continue | – | No dialog or script; treated as text | P2 | 🟡 |

### 7.7 Checkout — overview and totals (CHO)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| CHO-01 | Overview items match cart | Data consistency | – | 2 items; valid details | Reach overview | Backpack, Bolt T-Shirt | Same names, quantities, prices as cart | P1 | ✅ |
| CHO-02 | Item total = sum of prices | Calculation | – | as CHO-01 | Read Item total | – | Equals the sum to the cent | P1 | ✅ |
| CHO-03 | Total = item total + tax | Calculation | – | as CHO-01 | Read Item total, Tax, Total | – | Total = Item total + Tax, exact to the cent (integer cents) | P1 | ✅ |
| CHO-04 | Tax rate consistent across baskets | Calculation | EG | Several baskets | Compute tax ÷ item total for each basket | 1, 2, 6 items | Same effective rate within rounding (rate itself not hard-coded; Q2) | P2 | 🟡 |
| CHO-05 | Minimum and maximum basket totals | Boundary | BVA | Logged in | Overview with cheapest single item, then all 6 | $7.99; all items | CHO-02/03 hold for both | P1 | ✅ |
| CHO-06 | Payment and shipping info shown | UI | – | as CHO-01 | Inspect | – | "SauceCard #31337" and "Free Pony Express Delivery!" displayed | P3 | 🟡 |
| CHO-07 | Cancel on overview | Usability | ST | as CHO-01 | Click Cancel | – | No confirmation; Products page; badge 2 | P2 | ✅ |
| CHO-08 | Browser Back to information step | Navigation | ST/EG | as CHO-01 | Press browser Back | – | Step one shown; record whether details are kept | P3 | ✋ |
| CHO-09 | Refresh on overview | State | EG | as CHO-01 | Refresh | – | Same items and totals | P2 | 🟡 |
| CHO-10 | Overview reachable with empty cart | Negative / Integrity | EG | Logged in, empty cart | Open `/checkout-step-two.html` directly | – | **Current: Total $0.00 with Finish available (OBS-03).** Expected per Q1: blocked | P2 | 🟡 |

### 7.8 Order completion and integrity (CHC)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| CHC-01 | Confirmation shown | Positive | UC | On overview with items | Click Finish | – | "Thank you for your order!", dispatch message and image | P1 | ✅ |
| CHC-02 | Cart cleared after order | Positive | ST | as CHC-01 | Finish | – | Badge hidden | P1 | ✅ |
| CHC-03 | Back Home resets shop | Positive | ST | On complete page | Click Back Home, open cart | – | Products page; every button Add to cart; cart empty | P1 | ✅ |
| CHC-04 | Browser Back after order | Integrity | EG | On complete page | Press browser Back, try Finish | – | Cart stays empty; no second order. Current: overview with 0 items | P1 | 🟡 |
| CHC-05 | Double-click Finish | Integrity | EG | On overview | Double-click Finish quickly | – | Exactly one order (needs backend/order log) | P1 | ✋ |
| CHC-06 | Refresh complete page | Integrity | EG | On complete page | Refresh | – | No duplicate order; page stable | P2 | ✋ |
| CHC-07 | Generate PDF order | Positive | EXP | On complete page | Click "Generate PDF order" | – | Record behaviour; if a PDF is produced, it shows the right items and total (Q9) | P3 | ✋ |
| CHC-08 | Concurrent checkout in two tabs | Integrity | EG | Same cart open in two tabs at overview | Finish in both | – | One order per intent; second tab handled clearly | P2 | ✋ |

### 7.9 Navigation, menu and session (NAV)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| NAV-01 | Menu opens and closes | Navigation | – | Logged in | Open menu, close with X | – | Menu shows All Items, Dynamic Catalog, About, Logout, Reset App State; closes on X | P2 | 🟡 |
| NAV-02 | All Items from any page | Navigation | – | On cart / detail / checkout | Menu → All Items | – | Products page; cart unchanged | P2 | 🟡 |
| NAV-03 | About link | Navigation | – | Logged in | Inspect About link | – | Points to saucelabs.com (external site not tested) | P3 | 🟡 |
| NAV-04 | Logout | Session | ST | Logged in | Menu → Logout | – | Login page; session cookie removed | P1 | ✅ |
| NAV-05 | Reset App State | State | ST | 2 items added | Menu → Reset App State | – | Badge hidden **and** every button Add to cart. **Current: a Remove button stayed until reload (OBS-01)** | P2 | 🟡 |
| NAV-06 | Session timeout | Session | ST | Logged in | Wait past cookie expiry (~10 min), then navigate | – | Redirected to login with an access message (Q6) | P2 | ✋ |
| NAV-07 | Browser Back after logout | Security | ST | Logged out after browsing | Press browser Back | – | Products page not usable; login shown | P1 | 🟡 |
| NAV-08 | Refresh keeps page and state | State | – | On each signed-in page | Refresh | – | Same page and cart | P2 | 🟡 |
| NAV-09 | Cart icon from every page | Navigation | – | On listing, detail, checkout steps | Click cart icon | – | Cart page | P2 | 🟡 |
| NAV-10 | Dynamic Catalog options | Exploratory | EXP | Logged in | Menu → Dynamic Catalog → Lazy Load / Spinner / Slider | – | Each option loads without errors; record behaviour (Q10) | P3 | ✋ |

### 7.10 Personas (PER)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| PER-01 | problem_user sorting | Persona / Negative | MX | Logged in as problem_user | Sort by price low→high | – | Should match SRT-03. **Current: no effect (DEF-01)** | P2 | ✅ |
| PER-02 | problem_user exploratory | Exploratory | EXP | problem_user | 15-min charter EX-01 (images, add/remove, checkout fields) | – | Findings logged with evidence | P2 | ✋ |
| PER-03 | performance_glitch_user responsiveness | Performance (perceived) | – | On login page | Log in; time to Products | – | Completes within navigation timeout (15 s); record duration | P3 | ✅ |
| PER-04 | error_user full journey | Exploratory | EXP | error_user | Add/remove, sort, checkout, finish | – | Record each error with evidence | P2 | ✋ |
| PER-05 | visual_user comparison | Visual | MX | visual_user and standard_user | Screenshot listing for both; compare | – | Differences logged as visual defects | P3 | 🟡 |
| PER-06 | Persona × journey matrix | Persona | MX | – | Run login → add → checkout → finish for every persona | 5 non-locked users | Matrix of pass/fail per step | P2 | 🟡 |

### 7.11 Accessibility (A11Y)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| A11Y-01 | Keyboard-only login | Accessibility | – | On login page | Tab, type, Tab, type, Enter | – | Signed in without a mouse | P2 | ✅ |
| A11Y-02 | Keyboard-only purchase | Accessibility | UC | Logged in | Complete a full order with Tab/Enter/Space only | – | Every step operable | P2 | 🟡 |
| A11Y-03 | Visible focus everywhere (WCAG 2.4.7) | Accessibility | – | Any page | Tab through all controls | – | Each focused control visibly highlighted. **Current: login controls fail (DEF-02)** | P2 | ✅ |
| A11Y-04 | Logical focus order | Accessibility | – | Each page | Tab through | – | Order follows visual layout | P2 | ✋ |
| A11Y-05 | Accessible names | Accessibility | – | Each page | Inspect with accessibility tree | – | Inputs, buttons, sort control, menu and cart have meaningful names | P2 | ✅ |
| A11Y-06 | Image alternative text | Accessibility | – | Listing and detail | Inspect images | – | Product images have alt text naming the product | P3 | 🟡 |
| A11Y-07 | Errors announced | Accessibility | – | NVDA/VoiceOver running | Trigger login and checkout errors | – | Error is announced without moving focus manually | P2 | ✋ |
| A11Y-08 | Colour contrast | Accessibility | – | Each page | axe + manual check | – | Text contrast ≥ 4.5:1 (WCAG 1.4.3) | P3 | 🟡 |
| A11Y-09 | Zoom 200% | Accessibility | – | Each page | Browser zoom to 200% | – | No content or function lost | P3 | ✋ |
| A11Y-10 | Automated WCAG A/AA scan | Accessibility | – | Each page | Run axe | Login, Products, Detail, Cart, Step 1, Overview, Complete | No critical/serious violations | P2 | ✅ (3 pages) |
| A11Y-11 | Headings and landmarks | Accessibility | – | Each page | Inspect structure | – | One `h1`, main landmark (best practice; axe flagged gaps) | P3 | 🟡 |

### 7.12 Compatibility and responsive (CMP)

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| CMP-01 | Engine regression | Compatibility | MX | – | Run automated suite | Chromium, Firefox, WebKit | Identical results | P2 | ✅ |
| CMP-02 | Branded browsers | Compatibility | MX | Real browsers | Smoke journey | Chrome, Edge, Safari (macOS/iOS) | Identical behaviour | P2 | ✋ |
| CMP-03 | Mobile width | Responsive | BVA | – | View all pages at 375×667 | – | No horizontal scroll; menu, cart, sort visible; actions work | P2 | ✅ (listing) |
| CMP-04 | Tablet width | Responsive | BVA | – | 768×1024 | – | Layout intact | P3 | 🟡 |
| CMP-05 | Large desktop | Responsive | BVA | – | 1920×1080 | – | Layout intact, no stretching | P3 | 🟡 |
| CMP-06 | Orientation change | Responsive | ST | Real phone | Rotate portrait ↔ landscape mid-checkout | – | No data loss; layout adapts | P3 | ✋ |
| CMP-07 | Touch interaction | Compatibility | – | Real phone | Tap controls, open menu | – | All controls respond to touch | P3 | ✋ |

### 7.13 Security (SEC) — safe, non-destructive checks only

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| SEC-01 | Protected pages without login | Security | ST | Signed out | Open cart, step one, step two, complete, detail URLs | 5 URLs | Login page with matching "You can only access …" message each time | P1 | ✅ |
| SEC-02 | Protected page after logout | Security | ST | Logged out | Open `/inventory.html` | – | Blocked with access message | P1 | ✅ |
| SEC-03 | Locked user cannot bypass by URL | Security | EG | Failed login as locked user | Open `/inventory.html` | – | Blocked | P1 | 🟡 |
| SEC-04 | Client-side session cookie | Security | EG | Signed out; own browser | Create cookie `session-username=standard_user` in DevTools, open `/inventory.html` | – | Record result. If access is granted, report as a client-side auth weakness; UI cannot prove backend rules | P2 | ✋ |
| SEC-05 | Cookie attributes | Security | – | Logged in | Inspect cookie in DevTools | – | Record Secure / HttpOnly / SameSite flags; recommend hardening if missing | P3 | ✋ |
| SEC-06 | Input rendered as text | Security | EG | Login and checkout | Covered by LGN-14, CHI-13 | – | No HTML or script execution | P2 | 🟡 |
| SEC-07 | Credentials not in URL or storage | Security | – | During login | Inspect URL, localStorage, sessionStorage | – | Password never appears | P1 | 🟡 |
| SEC-08 | HTTPS enforced | Security | – | – | Open `http://www.saucedemo.com` | – | Redirects to HTTPS | P2 | 🟡 |
| SEC-09 | Error messages do not leak detail | Security | EP | On login page | Compare wrong-password and unknown-user errors | – | Same generic message (no user enumeration) | P2 | ✅ |

### 7.14 Performance — perceived, single user only (PERF)

No load or stress testing on a public site.

| ID | Title | Type | Tech | Preconditions | Steps | Test data | Expected result | Pri | Auto |
|----|-------|------|------|---------------|-------|-----------|-----------------|-----|------|
| PERF-01 | Page timings | Performance | – | Logged in | Record navigation timing for each page (one user) | – | Informational baseline; flag any page > 3 s | P3 | 🟡 |
| PERF-02 | Glitch user delay | Performance | – | On login page | Time login for performance_glitch_user vs standard_user | – | Informational; difference recorded | P3 | 🟡 |
| PERF-03 | Image weight | Performance | – | Listing page | DevTools Network panel | – | Record image sizes; recommend optimisation if very large | P3 | ✋ |

---

## 8. Observations found during design

Seen once during exploration on 2026-10-27 (Chromium). Each must be **reproduced and evidenced before being raised as a defect**.

| ID | Observation | Related cases | Proposed classification |
|----|-------------|---------------|-------------------------|
| OBS-01 | After Menu → Reset App State, the badge cleared but a "Remove" button stayed on the listing until the page was reloaded | NAV-05 | Probable defect, S3 (state not reset in UI) |
| OBS-02 | Checkout accepts whitespace-only first name, last name and postal code | CHI-06 | Question (Q4); defect if names must be non-blank |
| OBS-03 | `/checkout-step-two.html` with an empty cart shows Total $0.00 and an active Finish button | CHO-10, CRT-07 | Question (Q1); integrity risk if empty orders are possible |
| OBS-04 | After dismissing the login error with X, the input keeps its error CSS class | LGN-16 | Cosmetic; confirm visually |
| OBS-05 | Usernames are case-sensitive and not trimmed | LGN-10, LGN-11 | Question (Q5) |
| — | DEF-01 (problem_user sorting) and DEF-02 (no visible focus) are already confirmed with automated evidence | PER-01, A11Y-03 | Defects (see `docs/known-limitations.md`) |

---

## 9. Questions for the product owner

| # | Question | Working assumption |
|---|----------|--------------------|
| Q1 | Should checkout (and the overview) be reachable with an empty cart? | Not a defect until answered; flagged as an integrity risk |
| Q2 | What is the tax rule (rate, jurisdiction, per-line or total rounding)? | Read tax from the page; assert only the arithmetic and a consistent rate |
| Q3 | Required order for equal prices? Should the sort choice persist after navigation? | Ties in any order; persistence recorded, not asserted |
| Q4 | Validation rules for names and postal codes (blank, whitespace, length, characters, formats)? | Only "required" is asserted |
| Q5 | Should usernames be case-insensitive or trimmed? | Current strict behaviour treated as intended |
| Q6 | Session timeout duration, and what a signed-in user sees on the login URL? | ~10-minute cookie observed; behaviour recorded |
| Q7 | Should the cart persist after logout, and is it isolated per user? | Isolation assumed as a privacy expectation |
| Q8 | Should quantity be editable in the cart? | No; quantity is always 1 |
| Q9 | What should "Generate PDF order" produce? | Record behaviour |
| Q10 | What are the Dynamic Catalog (Lazy Load, Spinner, Slider) pages expected to do? | Exploratory only |
| Q11 | Supported browsers, devices and the accessibility target (WCAG 2.1 or 2.2 AA)? | Latest Chromium/Firefox/WebKit; WCAG 2.1 AA |

---

## 10. Test data and environment matrix

| Data | Values | Why |
|------|--------|-----|
| Users | 6 published personas (section 1.2) | EP over user roles |
| Products | Cheapest $7.99 (Onesie), most expensive $49.99 (Fleece Jacket), tie at $15.99 (Bolt T-Shirt, Red T-Shirt) | BVA on price and ties |
| Baskets | 0, 1, 2, 6 items | BVA on quantity |
| Customer | `Test / Customer / 12345` (valid); blanks; spaces; accented, apostrophe and CJK names; 255 and 1,000 characters | EP + BVA |
| Postal codes | `12345`, `12345-6789`, `SW1A 1AA`, `ABCDE` | EP over formats |
| Safe injection strings | `<b>x</b>`, `<img src=x onerror=alert(1)>`, `' OR '1'='1` | Output encoding check only |

| Environment | Values |
|-------------|--------|
| Engines (automated) | Chromium 156, Firefox 157, WebKit 27.2 via Playwright 1.64.1 |
| Branded browsers (manual) | Chrome, Edge, Safari macOS, Safari iOS, Chrome Android |
| Viewports | 375×667, 768×1024, 1366×768, 1920×1080 |
| Assistive tech (manual) | NVDA + Firefox, VoiceOver + Safari |

---

## 11. Coverage summary

| Module | Cases | P1 | P2 | P3 | ✅ Automated | 🟡 Candidate | ✋ Manual |
|--------|------:|---:|---:|---:|------:|------:|------:|
| Login (LGN) | 19 | 6 | 7 | 6 | 9 | 9 | 1 |
| Products (PRD) | 9 | 2 | 5 | 2 | 1 | 8 | 0 |
| Sorting (SRT) | 10 | 2 | 5 | 3 | 7 | 2 | 1 |
| Product detail (PDP) | 8 | 3 | 3 | 2 | 1 | 7 | 0 |
| Cart (CRT) | 15 | 7 | 5 | 3 | 7 | 5 | 3 |
| Checkout info (CHI) | 13 | 4 | 5 | 4 | 5 | 8 | 0 |
| Checkout overview (CHO) | 10 | 4 | 4 | 2 | 5 | 4 | 1 |
| Completion/integrity (CHC) | 8 | 5 | 2 | 1 | 3 | 1 | 4 |
| Navigation/session (NAV) | 10 | 2 | 6 | 2 | 1 | 7 | 2 |
| Personas (PER) | 6 | 0 | 4 | 2 | 2 | 2 | 2 |
| Accessibility (A11Y) | 11 | 0 | 7 | 4 | 4 | 4 | 3 |
| Compatibility (CMP) | 7 | 0 | 3 | 4 | 2 | 2 | 3 |
| Security (SEC) | 9 | 4 | 4 | 1 | 3 | 4 | 2 |
| Performance (PERF) | 3 | 0 | 0 | 3 | 0 | 2 | 1 |
| **Total** | **138** | **39** | **60** | **39** | **50** | **65** | **23** |

"✅ Automated" means the condition is verified by the current Playwright suite; "🟡 Candidate" means it is stable and deterministic and would be the next automation backlog.

---

## 12. Mapping to the assessment's 25 cases (ANSWERS.md A1)

| A1 case | Design cases | A1 case | Design cases |
|---------|--------------|---------|--------------|
| TC01 | LGN-01 | TC14 | CHI-04 |
| TC02 | LGN-04 | TC15 | CHO-01–03, CHC-01–03 |
| TC03 | LGN-05, LGN-06 | TC16 | CHO-05, CHO-02/03 |
| TC04 | LGN-07–09 | TC17 | CHI-12, CHO-07 |
| TC05 | SRT-01 | TC18 | CHC-04–06, CHC-08 |
| TC06 | SRT-03, SRT-05, SRT-06 | TC19 | A11Y-01, A11Y-03 |
| TC07 | SRT-04 | TC20 | A11Y-05, A11Y-10 |
| TC08 | SRT-02 | TC21 | CMP-03 |
| TC09 | CRT-02 | TC22 | SEC-02, NAV-04 |
| TC10 | CRT-06 | TC23 | CMP-01 |
| TC11 | CRT-07, CRT-08 | TC24 | SEC-01, PDP-08 |
| TC12 | CHI-02 | TC25 | PER-03 |
| TC13 | CHI-03 | EX-01 | PER-02 |
