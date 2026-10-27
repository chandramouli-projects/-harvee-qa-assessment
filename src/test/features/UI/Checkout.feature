# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 04: Checkout                                               ║
# ║   Manual cases : TC12, TC13, TC14, TC15, TC17                        ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# CHECKOUT STEPS: information → overview → complete
# TOTALS RULE   : Item total = sum of selected prices;
#                 Total = Item total + Tax, to the cent.
#                 The tax rate is not specified, so it is read, not assumed.
# ══════════════════════════════════════════════════════════════════════

@ui @checkout
Feature: Checkout
  As a shopper
  I want to pay for the products in my cart
  So that I receive my order at the correct price

  Background:
    Given I am logged in as the "standard" user

# ══════════════════════════════════════════════════════════════════════
# HAPPY PATH
# ══════════════════════════════════════════════════════════════════════

  @TC15 @smoke @P1
  Scenario: TC15 Checkout-HappyPath - Completing checkout with two products charges item total plus tax and empties the cart
    When I add the products "Sauce Labs Backpack, Sauce Labs Bolt T-Shirt" to the cart
    Then the cart badge should show 2
    When I open the cart
    Then the Cart page should be displayed
    And the cart should contain exactly the selected products at their listed prices
    When I proceed to checkout
    Then the checkout "information" step should be displayed
    When I submit valid checkout information
    Then the checkout "overview" step should be displayed
    And the overview should list exactly the selected products at their listed prices
    And the order totals should equal the selected prices plus tax
    When I finish the order
    Then the checkout "complete" step should be displayed
    And I should see the order confirmation "Thank you for your order!"
    And the cart badge should be hidden
    When I go back home from the confirmation
    Then the Products page should be displayed
    And the cart badge should be hidden
    And no product should show a "Remove" button
    When I open the cart
    Then the cart should be empty

# ══════════════════════════════════════════════════════════════════════
# VALIDATION
# ══════════════════════════════════════════════════════════════════════

  Scenario Outline: <id> Checkout-Validation - Checkout is blocked with the <field> error when <field> is missing
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    Then the checkout "information" step should be displayed
    When I submit checkout information with first name "<first_name>", last name "<last_name>" and postal code "<postal_code>"
    Then I should see the checkout error "<error>"
    And the checkout "information" step should be displayed

    @TC12 @P1
    Examples: First name missing
      | id   | field      | first_name | last_name | postal_code | error                          |
      | TC12 | first name |            | Customer  | 12345       | Error: First Name is required  |

    @TC13 @P1
    Examples: Last name missing
      | id   | field     | first_name | last_name | postal_code | error                         |
      | TC13 | last name | Test       |           | 12345       | Error: Last Name is required  |

    @TC14 @P1
    Examples: Postal code missing
      | id   | field       | first_name | last_name | postal_code | error                           |
      | TC14 | postal code | Test       | Customer  |             | Error: Postal Code is required  |

# ══════════════════════════════════════════════════════════════════════
# CANCELLATION
# ══════════════════════════════════════════════════════════════════════

  @TC17 @P2
  Scenario: TC17 Checkout-Cancel - Cancelling from the information step returns to the cart without placing an order
    When I add the product "Sauce Labs Fleece Jacket" to the cart
    And I open the cart
    And I proceed to checkout
    Then the checkout "information" step should be displayed
    When I cancel the checkout
    Then the Cart page should be displayed
    And the cart should contain exactly the selected products at their listed prices
    And the cart badge should show 1

  @TC17 @P2
  Scenario: TC17 Checkout-Cancel - Cancelling from the overview step leaves the order unplaced and the cart intact
    When I add the products "Sauce Labs Backpack, Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed
    When I cancel the checkout
    Then no order confirmation should be displayed
    And the Products page should be displayed
    And the cart badge should show 2
    When I open the cart
    Then the cart should contain exactly the selected products at their listed prices
