# Traceability Matrix

**Final run:** 28 Oct 2026, Windows 11, Node 24.19.0, Playwright 1.64.1, playwright-bdd 9.2.1; Chromium 156.0, Firefox 157.0, WebKit 27.2; 2 workers, retries 0.
**Evidence:** Chromium and Firefox in `evidence/final-run-2-all-browsers-2-workers.log`; WebKit in `evidence/final-run-3-webkit-2-workers.log` (run 2 was stopped after Chromium and Firefox finished, so WebKit was run on its own with the same settings).
**Result:** 456 scenarios (152 per browser): 380 passed, 75 failed, 1 skipped. Every failure is a test tagged `@known-defect` for a documented bug; there are no unexpected failures. The skip is AC05 in WebKit, by design.

**How to read it:** "Manual result" is the Excel *Status* column (manual run in three browsers). "Pass ×3" means the automated scenario passed in Chromium, Firefox and WebKit. "Fails ×3 (known bug)" means it failed in all three because the bug is still there; the assertion is not weakened, so the test will pass once the bug is fixed. Every scenario is tagged with its ID, so `npx playwright test --grep @TC12` runs one case. TC23 and TC24 are in the accessibility feature, named `TC23 AC03 …` and `TC24 AC14 …`. The core set was run again on its own in all three browsers after that rename: 75 passed, 3 failed (TC25 / BUG-01 in each browser), log `evidence/final-core-run-all-browsers-2-workers.log`. This file is generated from the Excel workbook and the two run logs.

## Core suite (A1) — TC01–TC25

| Manual ID | Manual case | Manual result | Automated scenario (feature file) | Runs per browser | Automated result | Bug |
|---|---|---|---|:-:|---|---|
| TC01 | Login with a valid user | Pass | TC01 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC02 | Login with a locked user | Pass | TC02 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC03 | Login with a wrong password | Pass | TC03 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC04 | Login with both fields empty | Pass | TC04 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC05 | Sort by "Name (A to Z)" | Pass | TC05 in `UI/ProductSorting.feature` | 1 | Pass ×3 |  |
| TC06 | Sort by "Name (Z to A)" | Pass | TC06 in `UI/ProductSorting.feature` | 1 | Pass ×3 |  |
| TC07 | Sort by "Price (low to high)" | Pass | TC07 in `UI/ProductSorting.feature` | 1 | Pass ×3 |  |
| TC08 | Sort by "Price (high to low)" | Pass | TC08 in `UI/ProductSorting.feature` | 1 | Pass ×3 |  |
| TC09 | Add two products and remove one from the Products page | Pass | TC09 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC10 | Remove products on the Cart page | Pass | TC10 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC11 | New session starts with an empty cart | Pass | TC11 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC12 | Place an order with two products | Pass | TC12 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC13 | Checkout without First Name | Pass | TC13 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC14 | Checkout without Last Name | Pass | TC14 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC15 | Checkout without Zip/Postal Code | Pass | TC15 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC16 | Cancel on the "Your Information" page | Pass | TC16 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC17 | Cancel on the "Overview" page | Pass | TC17 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC18 | Order total for all six products | Pass | TC18 in `UI/OrderTotals.feature` | 1 | Pass ×3 |  |
| TC19 | Double-click Finish | Pass | TC19 in `UI/OrderCompletion.feature` | 1 | Pass ×3 |  |
| TC20 | Typed values stay after an error | Pass | TC20 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC21 | Products page cannot be opened after logout | Pass | TC21 in `UI/SessionSecurity.feature` | 1 | Pass ×3 |  |
| TC22 | Open /cart.html without logging in | Pass | TC22 in `UI/SessionSecurity.feature` | 1 | Pass ×3 |  |
| TC23 | Log in and add a product using only the keyboard | Pass | TC23 AC03 in `Accessibility/Accessibility.feature` | 1 | Pass ×3 |  |
| TC24 | Products page works on a mobile and a desktop screen | Pass | TC24 AC14 in `Accessibility/Accessibility.feature` | 2 | Pass ×3 |  |
| TC25 | Sort by "Price (low to high)" as problem_user | Fail | TC25 in `UI/ProductSorting.feature` | 1 | Fails ×3 (known bug) | BUG-01 |
| EX-01 | Exploratory charter, `problem_user` | Charter written | Manual only | – | – | |

## Extended functional suite — TC26–TC98 (beyond the brief)

| Manual ID | Manual case | Manual result | Automated scenario (feature file) | Runs per browser | Automated result | Bug |
|---|---|---|---|:-:|---|---|
| TC26 | Login with the slow user (performance_glitch_user) | Pass | TC26 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC27 | Login using the Enter key | Pass | TC27 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC28 | Close the login error message | Pass | TC28 in `UI/Authentication.feature` | 1 | Pass ×3 | BUG-05 |
| TC29 | Login as problem_user | Pass | TC29 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC30 | Login as error_user | Pass | TC30 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC31 | Login as visual_user | Pass | TC31 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC32 | Login page content | Pass | TC32 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC33 | Login with a username that does not exist | Pass | TC33 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC34 | Login with username empty | Pass | TC34 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC35 | Login with password empty | Pass | TC35 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC36 | Username is case-sensitive | Pass | TC36 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC37 | Username with spaces before and after | Pass | TC37 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC38 | Password is case-sensitive | Pass | TC38 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC39 | Script text in username is treated as plain text | Pass | TC39 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC40 | Very long username and password | Pass | TC40 in `UI/Authentication.feature` | 1 | Pass ×3 |  |
| TC41 | Every product shows full details | Pass | TC41 in `UI/Products.feature` | 1 | Pass ×3 |  |
| TC42 | Product prices format | Pass | TC42 in `UI/Products.feature` | 1 | Pass ×3 |  |
| TC43 | Product name opens the product detail page | Pass | TC43 in `UI/Products.feature` | 1 | Pass ×3 |  |
| TC44 | Product image opens the product detail page | Pass | TC44 in `UI/Products.feature` | 1 | Pass ×3 |  |
| TC45 | Default sort after login | Pass | TC45 in `UI/Products.feature` | 1 | Pass ×3 |  |
| TC46 | Footer social links | Pass | TC46 in `UI/Products.feature` | 1 | Pass ×3 |  |
| TC47 | Added products keep "Remove" after sorting | Pass | TC47 in `UI/ProductSorting.feature` | 1 | Pass ×3 |  |
| TC48 | Change sort many times | Pass | TC48 in `UI/ProductSorting.feature` | 1 | Pass ×3 |  |
| TC49 | Add to cart from the product page | Pass | TC49 in `UI/ProductDetail.feature` | 1 | Pass ×3 |  |
| TC50 | Remove from the product page | Pass | TC50 in `UI/ProductDetail.feature` | 1 | Pass ×3 |  |
| TC51 | "Back to products" keeps the cart | Pass | TC51 in `UI/ProductDetail.feature` | 1 | Pass ×3 |  |
| TC52 | Unknown product id | Pass | TC52 in `UI/ProductDetail.feature` | 1 | Pass ×3 |  |
| TC53 | Product id is not a number | Pass | TC53 in `UI/ProductDetail.feature` | 1 | Pass ×3 |  |
| TC54 | Cart item details | Pass | TC54 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC55 | Cart stays the same when moving between pages | Pass | TC55 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC56 | Cart stays after page refresh | Pass | TC56 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC57 | "Continue Shopping" with items keeps the cart | Pass | TC57 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC58 | Item name in the cart opens the product page | Pass | TC58 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC59 | Cart after logout and login again (same user) | Pass | TC59 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC60 | One user cannot see another user's cart | Fail | TC60 in `UI/Cart.feature` | 1 | Fails ×3 (known bug) | BUG-06 |
| TC61 | Add all 6 products | Pass | TC61 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC62 | Remove all products from the Products page | Pass | TC62 in `UI/Cart.feature` | 1 | Pass ×3 |  |
| TC63 | Names with special and international letters | Pass | TC63 in `UI/Checkout.feature` | 4 | Pass ×3 |  |
| TC64 | Different zip / postal code formats | Pass | TC64 in `UI/Checkout.feature` | 3 | Pass ×3 |  |
| TC65 | Close the checkout error and fix it | Pass | TC65 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC66 | Payment and shipping details on the Overview | Pass | TC66 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC67 | Refresh the Overview page | Pass | TC67 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC68 | Browser Back from Overview | Pass | TC68 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC69 | Checkout with all fields empty | Pass | TC69 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC70 | Checkout with only spaces in all fields | Fail | TC70 in `UI/Checkout.feature` | 1 | Fails ×3 (known bug) | BUG-02 |
| TC71 | Script text in First Name is treated as plain text | Pass | TC71 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC72 | Open the Overview page with an empty cart | Fail | TC72 in `UI/Checkout.feature` | 1 | Fails ×3 (known bug) | BUG-03 |
| TC73 | Checkout button with an empty cart | Fail | TC73 in `UI/Checkout.feature` | 1 | Fails ×3 (known bug) | BUG-03 |
| TC74 | Very long name values | Pass | TC74 in `UI/Checkout.feature` | 1 | Pass ×3 |  |
| TC75 | Order total for one product | Pass | TC75 in `UI/OrderTotals.feature` | 1 | Pass ×3 |  |
| TC76 | Order total for two products | Pass | TC76 in `UI/OrderTotals.feature` | 1 | Pass ×3 |  |
| TC77 | Tax rate is the same for different orders | Pass | TC77 in `UI/OrderTotals.feature` | 1 | Pass ×3 |  |
| TC78 | Order confirmation page content | Pass | TC78 in `UI/OrderCompletion.feature` | 1 | Pass ×3 |  |
| TC79 | "Generate PDF order" button | Pass | TC79 in `UI/OrderCompletion.feature` | 1 | Pass ×3 |  |
| TC80 | Browser Back after the order is placed | Pass | TC80 in `UI/OrderCompletion.feature` | 1 | Pass ×3 |  |
| TC81 | Refresh the confirmation page | Pass | TC81 in `UI/OrderCompletion.feature` | 1 | Pass ×3 |  |
| TC82 | Finish the same cart in two tabs | Fail | TC82 in `UI/OrderCompletion.feature` | 1 | Fails ×3 (known bug) | BUG-07 |
| TC83 | Menu opens and closes | Pass | TC83 in `UI/Navigation.feature` | 1 | Pass ×3 |  |
| TC84 | "All Items" goes back to Products from any page | Pass | TC84 in `UI/Navigation.feature` | 1 | Pass ×3 |  |
| TC85 | "About" link | Pass | TC85 in `UI/Navigation.feature` | 1 | Pass ×3 |  |
| TC86 | "Reset App State" clears the cart | Fail | TC86 in `UI/Navigation.feature` | 1 | Fails ×3 (known bug) | BUG-04 |
| TC87 | Cart icon works from every page | Pass | TC87 in `UI/Navigation.feature` | 1 | Pass ×3 |  |
| TC88 | Refresh keeps the user logged in | Pass | TC88 in `UI/SessionSecurity.feature` | 1 | Pass ×3 |  |
| TC89 | Open /checkout-step-one.html without logging in | Pass | TC89 in `UI/SessionSecurity.feature` | 1 | Pass ×3 |  |
| TC90 | Open /checkout-step-two.html without logging in | Pass | TC90 in `UI/SessionSecurity.feature` | 1 | Pass ×3 |  |
| TC91 | Open /checkout-complete.html without logging in | Pass | TC91 in `UI/SessionSecurity.feature` | 1 | Pass ×3 |  |
| TC92 | Open /inventory-item.html without logging in | Pass | TC92 in `UI/SessionSecurity.feature` | 1 | Pass ×3 |  |
| TC93 | Browser Back after logout | Pass | TC93 in `UI/SessionSecurity.feature` | 1 | Pass ×3 |  |
| TC94 | Session timeout | Pass | TC94 in `UI/SessionSecurity.feature` | 1 | Pass ×3 |  |
| TC95 | error_user can complete an order | Fail | TC95 in `UI/Personas.feature` | 1 | Fails ×3 (known bug) | BUG-08 |
| TC96 | problem_user checkout form keeps typed values | Fail | TC96 in `UI/Personas.feature` | 1 | Fails ×3 (known bug) | BUG-09 |
| TC97 | problem_user product images are correct | Fail | TC97 in `UI/Personas.feature` | 1 | Fails ×3 (known bug) | BUG-10 |
| TC98 | visual_user page looks the same as standard_user | Fail | TC98 in `UI/Personas.feature` | 1 | Fails ×3 (known bug) | BUG-11 |

## Accessibility suite — AC01–AC15 (beyond the brief)

| ID | Feature file | Runs per browser | Automated result | Bug |
|---|---|:-:|---|---|
| AC01 | `Accessibility/Accessibility.feature` | 11 | Pass ×3 |  |
| AC02 | `Accessibility/Accessibility.feature` | 1 | Pass ×3 |  |
| AC03 | `Accessibility/Accessibility.feature` | 1 | Pass ×3 |  |
| AC04 | `Accessibility/Accessibility.feature` | 1 | Pass ×3 |  |
| AC05 | `Accessibility/Accessibility.feature` | 1 | Chromium 1 pass; Firefox 1 pass; WebKit 1 skipped |  |
| AC06 | `Accessibility/Accessibility.feature` | 1 | Fails ×3 (known bug) | AC-BUG-02 |
| AC07 | `Accessibility/Accessibility.feature` | 4 | Fails ×3 (known bug) | AC-BUG-01 |
| AC08 | `Accessibility/Accessibility.feature` | 1 | Pass ×3 |  |
| AC09 | `Accessibility/Accessibility.feature` | 1 | Pass ×3 |  |
| AC10 | `Accessibility/Accessibility.feature` | 2 | Pass ×3 |  |
| AC11 | `Accessibility/Accessibility.feature` | 1 | Fails ×3 (known bug) | AC-BUG-03 |
| AC12 | `Accessibility/Accessibility.feature` | 1 | Pass ×3 |  |
| AC13 | `Accessibility/Accessibility.feature` | 1 | Fails ×3 (known bug) | AC-BUG-04 |
| AC14 | `Accessibility/Accessibility.feature` | 2 | Pass ×3 |  |
| AC15 | `Accessibility/Accessibility.feature` | 3 | Pass ×3 |  |

## Security suite, passive — SC01–SC14 (beyond the brief)

| ID | Feature file | Runs per browser | Automated result | Bug |
|---|---|:-:|---|---|
| SC01 | `Security/Security.feature` | 1 | Pass ×3 |  |
| SC02 | `Security/Security.feature` | 1 | Fails ×3 (known bug) | SC-BUG-01 |
| SC03 | `Security/Security.feature` | 1 | Pass ×3 |  |
| SC04 | `Security/Security.feature` | 1 | Fails ×3 (known bug) | SC-BUG-02 |
| SC05 | `Security/Security.feature` | 3 | Fails ×3 (known bug) | SC-BUG-03 |
| SC06 | `Security/Security.feature` | 1 | Fails ×3 (known bug) | SC-BUG-04 |
| SC07 | `Security/Security.feature` | 1 | Pass ×3 |  |
| SC08 | `Security/Security.feature` | 1 | Fails ×3 (known bug) | SC-BUG-05 |
| SC09 | `Security/Security.feature` | 2 | Pass ×3 |  |
| SC10 | `Security/Security.feature` | 3 | Pass ×3 |  |
| SC11 | `Security/Security.feature` | 1 | Pass ×3 |  |
| SC12 | `Security/Security.feature` | 1 | Pass ×3 |  |
| SC13 | `Security/Security.feature` | 1 | Pass ×3 |  |
| SC14 | `Security/Security.feature` | 1 | Pass ×3 |  |
