# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 05: Shopping Cart                                          ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC09 [core] - Add two products and remove one from the Products page
#   TC10 [core] - Remove products on the Cart page
#   TC11 [core] - New session starts with an empty cart
#   TC54 [ext ] - Cart item details
#   TC55 [ext ] - Cart stays the same when moving between pages
#   TC56 [ext ] - Cart stays after page refresh
#   TC57 [ext ] - "Continue Shopping" with items keeps the cart
#   TC58 [ext ] - Item name in the cart opens the product page
#   TC59 [ext ] - Cart after logout and login again (same user)
#   TC60 [ext ] - One user cannot see another user's cart              (BUG-06)
#   TC61 [ext ] - Add all 6 products
#   TC62 [ext ] - Remove all products from the Products page
#
# CART BADGE: hidden when the cart is empty, otherwise shows the count.
# CONTENTS  : the cart must hold exactly the products selected, at the
#             price shown on the Products page when they were added.
# ══════════════════════════════════════════════════════════════════════

@ui @cart
Feature: Shopping cart
  As a shopper
  I want to add and remove products and see an accurate cart
  So that I only buy what I chose

  Background:
    Given I am logged in as the "standard" user

# ══════════════════════════════════════════════════════════════════════
# POSITIVE
# ══════════════════════════════════════════════════════════════════════

  @TC09 @smoke @P1 @core
  Scenario: TC09 Cart-Badge - Badge tracks adding two products and removing one from the Products page
    When I add the products "Sauce Labs Backpack, Sauce Labs Bike Light" to the cart
    Then the cart badge should show 2
    When I remove "Sauce Labs Backpack" from the cart on the Products page
    Then the cart badge should show 1
    When I open the cart
    Then the Cart page should be displayed
    And the cart should contain exactly the selected products at their listed prices

  @TC10 @P1 @core
  Scenario: TC10 Cart-Remove - Removing products on the Cart page updates contents and badge
    When I add the products "Sauce Labs Bolt T-Shirt, Sauce Labs Onesie" to the cart
    And I open the cart
    Then the cart should contain exactly the selected products at their listed prices
    When I remove "Sauce Labs Bolt T-Shirt" on the Cart page
    Then the cart badge should show 1
    And the cart should contain exactly the selected products at their listed prices
    When I remove "Sauce Labs Onesie" on the Cart page
    Then the cart badge should be hidden
    And the cart should be empty

  @TC11 @P2 @core
  Scenario: TC11 Cart-Empty - A new session starts with an empty cart and Continue Shopping returns to Products
    Then the cart badge should be hidden
    And no product should show a "Remove" button
    When I open the cart
    Then the Cart page should be displayed
    And the cart should be empty
    When I continue shopping
    Then the Products page should be displayed
    And the cart badge should be hidden

  @TC54 @P1 @extended
  Scenario: TC54 Cart-LineDetails - A cart line shows quantity, name, description, price and Remove
    When I add the product "Sauce Labs Bolt T-Shirt" to the cart
    And I open the cart
    Then the cart line for "Sauce Labs Bolt T-Shirt" should show quantity 1, a description, price "$15.99" and a "Remove" button

  @TC55 @P1 @extended
  Scenario: TC55 Cart-AcrossPages - The cart stays the same when moving between pages
    When I add the products "Sauce Labs Backpack, Sauce Labs Bike Light" to the cart
    Then the cart badge should show 2
    When I open the product "Sauce Labs Backpack" by its name
    Then the cart badge should show 2
    When I go back to the products
    Then the cart badge should show 2
    When I open the cart
    Then the cart should contain exactly the selected products at their listed prices
    When I continue shopping
    Then the cart badge should show 2

  @TC56 @P1 @extended
  Scenario: TC56 Cart-Refresh - The cart stays after the page is refreshed
    When I add the products "Sauce Labs Backpack, Sauce Labs Bike Light" to the cart
    And I refresh the page
    Then the cart badge should show 2
    And only the products "Sauce Labs Backpack, Sauce Labs Bike Light" should show a "Remove" button
    When I open the cart
    And I refresh the page
    Then the cart should contain exactly the selected products at their listed prices

  @TC57 @P2 @extended
  Scenario: TC57 Cart-ContinueShopping - "Continue Shopping" with items keeps the cart
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    Then the cart should contain exactly the selected products at their listed prices
    When I continue shopping
    Then the Products page should be displayed
    And the cart badge should show 1
    And the product "Sauce Labs Onesie" should show a "Remove" button on the Products page

  @TC58 @P3 @extended
  Scenario: TC58 Cart-OpenItem - Clicking an item name in the cart opens its product page
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I open the product "Sauce Labs Onesie" from the cart
    Then the product page should show "Sauce Labs Onesie" at "$7.99"

  # ASSUMPTION: the cart is kept after logout (confirm with the product owner).
  @TC59 @P2 @extended
  Scenario: TC59 Cart-SameUserRelogin - The cart is kept after logging out and back in as the same user
    When I add the products "Sauce Labs Backpack, Sauce Labs Bike Light" to the cart
    Then the cart badge should show 2
    When I log out
    And I log in as the "standard" user
    Then the Products page should be displayed
    And the cart badge should show 2
    When I open the cart
    Then the cart should contain exactly the selected products at their listed prices

# ══════════════════════════════════════════════════════════════════════
# NEGATIVE
# ══════════════════════════════════════════════════════════════════════

  # ASSUMPTION: each user has their own cart (privacy; confirm with the product owner).
  # BUG-06: on 27-Oct-2026 problem_user saw standard_user's 2 items, so this fails.
  @TC60 @P1 @security @known-defect @BUG-06 @extended
  Scenario: TC60 Cart-OtherUser - A different user does not see the previous user's cart
    When I add the products "Sauce Labs Backpack, Sauce Labs Bike Light" to the cart
    Then the cart badge should show 2
    When I log out
    And I log in as the "problem" user
    Then the Products page should be displayed
    And the cart badge should be hidden
    When I open the cart
    Then the cart should be empty

# ══════════════════════════════════════════════════════════════════════
# BOUNDARY
# ══════════════════════════════════════════════════════════════════════

  @TC61 @P2 @extended
  Scenario: TC61 Cart-AllProducts - All 6 products can be added, each with quantity 1
    When I add the products "Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket, Sauce Labs Onesie, Test.allTheThings() T-Shirt (Red)" to the cart
    Then the cart badge should show 6
    When I open the cart
    Then the cart should contain exactly the selected products at their listed prices
    And every cart line should have quantity 1

  @TC62 @P2 @extended
  Scenario: TC62 Cart-RemoveAll - Removing every product hides the badge
    When I add the products "Sauce Labs Backpack, Sauce Labs Onesie" to the cart
    Then the cart badge should show 2
    When I remove "Sauce Labs Backpack" from the cart on the Products page
    And I remove "Sauce Labs Onesie" from the cart on the Products page
    Then the cart badge should be hidden
    And no product should show a "Remove" button
