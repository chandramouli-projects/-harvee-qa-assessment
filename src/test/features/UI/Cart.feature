# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 03: Shopping Cart                                          ║
# ║   Manual cases : TC09, TC10, TC11                                    ║
# ╚══════════════════════════════════════════════════════════════════════╝
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

  @TC09 @smoke @P1
  Scenario: TC09 Cart-Badge - Badge tracks adding two products and removing one from the Products page
    When I add the products "Sauce Labs Backpack, Sauce Labs Bike Light" to the cart
    Then the cart badge should show 2
    When I remove "Sauce Labs Backpack" from the cart on the Products page
    Then the cart badge should show 1
    When I open the cart
    Then the Cart page should be displayed
    And the cart should contain exactly the selected products at their listed prices

  @TC10 @P1
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

  @TC11 @P2
  Scenario: TC11 Cart-Empty - A new session starts with an empty cart and Continue Shopping returns to Products
    Then the cart badge should be hidden
    And no product should show a "Remove" button
    When I open the cart
    Then the Cart page should be displayed
    And the cart should be empty
    When I continue shopping
    Then the Products page should be displayed
    And the cart badge should be hidden
