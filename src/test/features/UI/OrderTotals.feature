# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 07: Order Total Calculation  (Section B1 rewrite)          ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC18 [core] - Order total for all six products
#   TC75 [ext ] - Order total for one product
#   TC76 [ext ] - Order total for two products
#   TC77 [ext ] - Tax rate is the same for different orders
#
# The reviewed AI-generated cart-total test, rewritten on this framework
# and run over several baskets so "Item total + Tax = Total" is not
# proven on a single case. Money is compared as integer cents.
# The tax rate is not specified, so it is read from the page, not assumed.
# ══════════════════════════════════════════════════════════════════════

@ui @checkout @regression
Feature: Order total calculation
  As the business
  I want every order total to equal the item total plus tax
  So that customers are always charged correctly

  Background:
    Given I am logged in as the "standard" user

  Scenario Outline: <id> OrderTotal - Order total equals item total plus tax for <basket>
    When I add the products "<products>" to the cart
    Then the cart badge should show <count>
    When I open the cart
    Then the Cart page should be displayed
    And the cart should contain exactly the selected products at their listed prices
    When I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed
    And the overview should list exactly the selected products at their listed prices
    And the order totals should equal the selected prices plus tax
    When I finish the order
    Then I should see the order confirmation "Thank you for your order!"
    When I go back home from the confirmation
    Then the Products page should be displayed
    And the cart badge should be hidden

    @TC75 @P1 @extended
    Examples: One product
      | id   | basket      | count | products          |
      | TC75 | one product | 1     | Sauce Labs Onesie |

    @TC76 @P1 @extended
    Examples: Two products
      | id   | basket       | count | products                                   |
      | TC76 | two products | 2     | Sauce Labs Backpack, Sauce Labs Bike Light |

    @TC18 @P1 @core
    Examples: All six products
      | id   | basket           | count | products                                                                                                                                            |
      | TC18 | all six products | 6     | Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket, Sauce Labs Onesie, Test.allTheThings() T-Shirt (Red) |

  # The ~8% rate is what the site shows; the business has not given a rate (confirm with the product owner).
  @TC77 @P2 @extended
  Scenario: TC77 OrderTotal-TaxRate - Two different orders use the same tax rate
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed
    And the order totals should equal the selected prices plus tax
    When I note the tax rate on the overview
    And I cancel the checkout
    And I remove "Sauce Labs Onesie" from the cart on the Products page
    And I add the products "Sauce Labs Backpack, Sauce Labs Bike Light" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed
    And the order totals should equal the selected prices plus tax
    And the tax should use the same rate as noted, to within one cent
