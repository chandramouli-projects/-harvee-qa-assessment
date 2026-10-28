# Step Reference

> **Source of truth** for the available Gherkin steps. Check here before writing a new step.
> Gherkin keywords are interchangeable (`And` / `But` follow the previous keyword); the pattern is what matters.

## Shared — `src/test/steps/shared/common.steps.ts`

| Pattern | What it does |
|---------|--------------|
| `I am on the login page` | Opens `/` and waits for the login form |
| `I am logged in as the {string} user` | Logs in by role, asserts the Products page and an empty cart |
| `I log in as the {string} user` | Submits the login form for a role (no outcome asserted) |
| `I log in with username {string} and password {string}` | Submits given values; `${VARIABLE}` placeholders are resolved from config |
| `I should see the login error {string}` | Exact login error text |
| `the login page should be displayed` | Username, password and Login button are visible |
| `I should remain on the login page` | Login form visible, URL is not `/inventory.html`, Products title hidden |
| `the Products page should be displayed` | URL, "Products" title and at least one product |
| `the Cart page should be displayed` | URL and "Your Cart" title |
| `the cart badge should show {int}` | Badge text equals the count |
| `the cart badge should be hidden` | No badge (empty cart) |
| `I open the cart` | Clicks the cart link |
| `I add the product {string} to the cart` | Adds one product; records its listed price |
| `I add the products {string} to the cart` | Comma-separated list; records each listed price |
| `I refresh the page` | Browser refresh (F5) |
| `I go back in the browser` | Browser Back button |
| `the page URL should contain {string}` | Plain text match on the URL |
| `I watch for browser pop-up dialogs` | Records any alert/confirm/prompt from now on |
| `no browser pop-up dialog should have appeared` | Proves script-like input was treated as text |

Roles: `standard`, `locked out`, `problem`, `performance glitch`, `error`, `visual`.

## Authentication — `domains/auth.steps.ts`

| Pattern |
|---------|
| `the product list should not be empty` |
| `the menu button should be visible` |
| `no login error should be displayed` |
| `I log in as the {string} user by pressing Enter` |
| `I close the login error` (clicks X; asserts the error is gone) |
| `I log in with a {int}-character username and password` |
| `the login fields should show the placeholders {string} and {string}` |
| `the login page should list the accepted usernames {string}` (comma list; `${VARIABLE}` allowed) |
| `the login page should show the password hint {string}` (`${VARIABLE}` allowed) |

## Products and product detail — `domains/products.steps.ts`

| Pattern | Notes |
|---------|-------|
| `the catalogue should show {int} products, each with an image, name, description, price and an "Add to cart" button` | |
| `the product prices should be {string} in display order` | Comma list; also checks the `$12.34` format |
| `I open the product {string} by its {word}` | `name` or `image`; notes the listing details first |
| `the footer link {string} should open {string} in a new tab` | Checks `href` and `target=_blank` only |
| `the product page should show {string} at {string}` | Name and price |
| `the product page should show the same description as the Products page` | Compares with the noted listing |
| `I add the product to the cart from its page` | |
| `I remove the product from its page` | |
| `the product page should show a {string} button` | `Remove`, `Add to cart`, `Back to products` |
| `I go back to the products` | "Back to products" button |
| `the product page should say {string}` | e.g. `ITEM NOT FOUND` |
| `the product {string} should show a {string} button on the Products page` | `Remove` or `Add to cart` |

## Catalogue — `domains/catalogue.steps.ts`

| Pattern | Notes |
|---------|-------|
| `I note the full product catalogue` | Stores names and prices for the later comparison |
| `the products are sorted by {string}` | Sorts and waits for the list to re-render (precondition) |
| `I sort the products by {string}` | Same, as the action under test |
| `I choose the sort option {string}` | Selects only, no wait for confirmation (problem_user) |
| `the product {word} should be in {word} order` | `names`/`prices`, `ascending`/`descending`; every adjacent pair checked, ties allowed |
| `the catalogue should contain the same products and prices as before sorting` | Nothing added, dropped or re-priced |
| `the sort dropdown should show {string}` | Select value and visible label |

Sort labels: `Name (A to Z)`, `Name (Z to A)`, `Price (low to high)`, `Price (high to low)`.

## Cart — `domains/cart.steps.ts`

| Pattern |
|---------|
| `I remove {string} from the cart on the Products page` |
| `I remove {string} on the Cart page` |
| `I continue shopping` |
| `the cart should contain exactly the selected products at their listed prices` |
| `the cart should be empty` |
| `no product should show a {string} button` (`Remove`) |
| `only the products {string} should show a "Remove" button` |
| `the cart line for {string} should show quantity {int}, a description, price {string} and a "Remove" button` |
| `every cart line should have quantity {int}` |
| `I open the product {string} from the cart` |

## Checkout — `domains/checkout.steps.ts`

| Pattern | Notes |
|---------|-------|
| `I proceed to checkout` | From the cart |
| `the checkout {string} step should be displayed` | `information`, `overview`, `complete` (URL + title) |
| `I submit valid checkout information` | Default customer from `data/test-data.ts` |
| `I submit checkout information with first name {string}, last name {string} and postal code {string}` | Empty strings allowed |
| `I cancel the checkout` | |
| `I finish the order` | |
| `I go back home from the confirmation` | |
| `I should see the checkout error {string}` | Exact text |
| `the overview should list exactly the selected products at their listed prices` | |
| `the order totals should equal the selected prices plus tax` | Item total = Σ prices; Total = Item total + Tax, in integer cents |
| `I should see the order confirmation {string}` | |
| `no order confirmation should be displayed` | Not on the complete URL; header hidden |
| `a checkout error should be displayed` | Any error; for inputs whose message is not specified |
| `I submit checkout information with {int}-character values` | |
| `the checkout fields should still show first name {string} and last name {string}` | |
| `I close the checkout error` | |
| `I enter {string} as the first name and continue` | |
| `the checkout page should still work` | Overview or information step, title visible |
| `the overview should show the payment information {string} and shipping information {string}` | |
| `I note the order totals` / `the order totals should be the same as noted` | |
| `I note the tax rate on the overview` / `the tax should use the same rate as noted, to within one cent` | Rate read from the page, not assumed |
| `the overview should list no products` | |
| `it should not be possible to finish an order with an empty cart` | Finish button hidden |
| `checkout should be blocked for an empty cart` | Not on the information step |

## Order completion — `domains/order-completion.steps.ts`

| Pattern | Notes |
|---------|-------|
| `the confirmation page should show {string} and {string}` | Heading and message |
| `the confirmation page should show the "Pony Express" image and a "Back Home" button` | |
| `I generate the PDF order` / `a PDF file named like {string} should be downloaded` | File name and non-empty file |
| `I double-click Finish` / `exactly one order confirmation should be displayed` | |
| `I open the same checkout overview in a second tab` | |
| `I finish the order in the second tab` / `the second tab should not show another order confirmation` | |

## Navigation — `domains/navigation.steps.ts`

| Pattern | Notes |
|---------|-------|
| `I open the menu` / `I close the menu` / `the menu should be closed` | |
| `the menu should show {string}` | Comma list, in order |
| `I choose {string} from the menu` | e.g. `All Items`, `Reset App State` |
| `the "About" menu link should open {string}` | Checks `href` only |

## Personas — `domains/personas.steps.ts`

| Pattern | Notes |
|---------|-------|
| `I note the products, images and header layout` | Baseline, usually as `standard` |
| `every product should show the same image as noted` | |
| `the product names and prices should be the same as noted` | |
| `the header controls should be in the same place as noted` | Cart link and sort control, 2px tolerance |

## Session — `domains/session.steps.ts`

| Pattern |
|---------|
| `I have not logged in` (asserts the fresh context has no session cookie) |
| `my session expires` (removes the login cookie to simulate the ~10 min timeout) |
| `I log out` |
| `I navigate directly to {string}` |
| `no products should be displayed` |
| `the cart link should not be visible` |

## Accessibility — `domains/accessibility.steps.ts`

Screens for `the {string} screen is open`: `Login`, `Login with error`, `Products`, `Products with menu open`, `Product detail`, `Cart with item`, `Empty cart`, `Checkout information`, `Checkout information with error`, `Checkout overview`, `Checkout complete`.

| Pattern | Notes |
|---------|-------|
| `the {string} screen is open` | Logs in and navigates to the screen the way a user would |
| `I scan the page with axe for WCAG 2.0, 2.1 and 2.2 A and AA rules` | Attaches WCAG and best-practice JSON; "incomplete" items become annotations |
| `the scan should find no WCAG violations` | Fails on any WCAG violation, whatever its impact |
| `I add a button with no name and an image with no alt text to the page` | Positive control content |
| `the scan should report the rules {string}` | Comma-separated rule ids |
| `I log in as the {string} user using only the keyboard` | Tab / type / Enter, asserting focus order |
| `I add {string} to the cart using only the keyboard` | Focus + Enter |
| `I start checkout using only the keyboard` | Tab to Checkout + Enter |
| `I enter valid checkout information and continue using only the keyboard` | Tab between fields, Enter on Continue |
| `I finish the order using only the keyboard` | Tab to Finish + Enter |
| `keyboard focus can move to links in this browser` | Skips WebKit (Tab skips links there by default) |
| `I open the menu using only the keyboard` / `I choose {string} from the menu using only the keyboard` | |
| `the cart link should be able to receive keyboard focus` | Calls `focus()` and checks the active element |
| `the controls {string} should show a visible focus indicator when reached with Tab` | Comma-separated control names; pixel comparison, screenshots attached |
| `the login form controls should be found by their accessible names` | |
| `the sort control and menu button should be found by their accessible names` | |
| `every product should have an {string} button` (`Add to cart`) | |
| `the checkout form controls should be found by their accessible names` | |
| `the error {string} should be in an alert region` | `role="alert"` with the exact text |
| `the checkout fields should declare the autocomplete purposes {string}, {string} and {string}` | |
| `every product image should have the product name as its alt text` | |
| `the product page image should have the alt text {string}` | |
| `I note the page title of the {string} screen` / `every noted page title should be different` | |
| `the browser viewport is {int} x {int} pixels` | |
| `the page should not scroll horizontally` | |
| `the menu button, cart link and sort control should be within the viewport` | |

## Security — `domains/security.steps.ts`

Passive checks only (see `CONVENTIONS.md`).

| Pattern | Notes |
|---------|-------|
| `I request the home page over plain HTTP` | GET with redirects not followed |
| `I should be redirected permanently to the HTTPS address` | 301 or 308 to `https://` |
| `I request the home page over HTTPS` | Stores and attaches the response headers |
| `the response header {string} should contain {string}` | Empty expected value = header must only be present |
| `the response should forbid framing by other sites` | `X-Frame-Options` DENY/SAMEORIGIN or CSP `frame-ancestors 'none'/'self'` |
| `I watch every network request` / `no request should have used plain HTTP` | |
| `I record how the page writes cookies` | Captures `document.cookie` writes (must run before login) |
| `the session cookie should be set with the protections {string}` | `Secure`, `SameSite`, `HttpOnly`; judged by what the site writes, not by browser defaults |
| `the session cookie should be removed` | After logout |
| `I set the session cookie to {string} without logging in` | `${VARIABLE}` placeholders allowed |
| `the page URL should not contain the username or the password` | |
| `browser storage and cookies should not contain the password or {string}` | Comma-separated values; values are never printed |
| `the page should not contain elements created from the typed text` | Use with `I watch for browser pop-up dialogs` |
| `every link that opens a new tab should use {string} or {string}` | `rel` values |
