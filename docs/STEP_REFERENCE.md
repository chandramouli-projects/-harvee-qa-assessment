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

Roles: `standard`, `locked out`, `problem`, `performance glitch`.

## Authentication — `domains/auth.steps.ts`

| Pattern |
|---------|
| `the product list should not be empty` |
| `the menu button should be visible` |
| `no login error should be displayed` |

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

## Session — `domains/session.steps.ts`

| Pattern |
|---------|
| `I have not logged in` (asserts the fresh context has no session cookie) |
| `I log out` |
| `I navigate directly to {string}` |
| `no products should be displayed` |
| `the cart link should not be visible` |

## Accessibility — `domains/accessibility.steps.ts`

| Pattern | Notes |
|---------|-------|
| `I log in as the {string} user using only the keyboard` | Tab / type / Enter, asserting focus order |
| `I add {string} to the cart using only the keyboard` | Focus + Enter |
| `every login control should show a visible focus indicator when reached with Tab` | Pixel comparison before/after focus; screenshots attached |
| `the login form controls should be found by their accessible names` | |
| `the sort control and menu button should be found by their accessible names` | |
| `every product should have an {string} button` (`Add to cart`) | |
| `the checkout form controls should be found by their accessible names` | |
| `I scan the {string} page with axe for WCAG 2 A and AA rules` | axe JSON attached to the report |
| `no critical or serious accessibility violations should be found` | Across all pages scanned in the scenario |
| `the browser viewport is {int} x {int} pixels` | |
| `the page should not scroll horizontally` | |
| `the menu button, cart link and sort control should be within the viewport` | |
