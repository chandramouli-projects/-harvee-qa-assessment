# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 09: Navigation and Menu                                    ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC83 [ext ] - Menu opens and closes
#   TC84 [ext ] - "All Items" goes back to Products from any page
#   TC85 [ext ] - "About" link
#   TC86 [ext ] - "Reset App State" clears the cart                    (BUG-04)
#   TC87 [ext ] - Cart icon works from every page
#
# EXTERNAL SITES: the About link is checked for its address only.
# ══════════════════════════════════════════════════════════════════════

@ui @navigation
Feature: Navigation and menu
  As a shopper
  I want the menu and cart icon to take me where I expect
  So that I never get stuck on a page

  Background:
    Given I am logged in as the "standard" user

  @TC83 @P2 @extended
  Scenario: TC83 Navigation-Menu - The menu shows its five items and closes with X
    When I open the menu
    Then the menu should show "All Items, Dynamic Catalog, About, Logout, Reset App State"
    When I close the menu
    Then the menu should be closed

  @TC84 @P2 @extended
  Scenario: TC84 Navigation-AllItems - "All Items" returns to Products from the checkout page with the cart kept
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    Then the checkout "information" step should be displayed
    When I choose "All Items" from the menu
    Then the Products page should be displayed
    And the cart badge should show 1

  @TC85 @P3 @extended
  Scenario: TC85 Navigation-About - The About link points to the Sauce Labs website
    Then the "About" menu link should open "https://saucelabs.com/"

  # BUG-04: on 27-Oct-2026 the "Remove" buttons stayed after the reset (3 out of 3 tries), so this fails.
  @TC86 @P2 @known-defect @BUG-04 @extended
  Scenario: TC86 Navigation-ResetAppState - "Reset App State" empties the cart and resets every product button
    When I add the products "Sauce Labs Backpack, Sauce Labs Bike Light" to the cart
    Then the cart badge should show 2
    When I choose "Reset App State" from the menu
    Then the cart badge should be hidden
    And no product should show a "Remove" button

  @TC87 @P2 @extended
  Scenario: TC87 Navigation-CartIcon - The cart icon opens the cart from the Products, product and checkout pages
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    Then the Cart page should be displayed
    When I continue shopping
    And I open the product "Sauce Labs Onesie" by its name
    And I open the cart
    Then the Cart page should be displayed
    When I proceed to checkout
    And I open the cart
    Then the Cart page should be displayed
    And the cart should contain exactly the selected products at their listed prices
