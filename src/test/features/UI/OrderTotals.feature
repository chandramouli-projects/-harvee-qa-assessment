# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 05: Order Total Calculation  (Section B1 rewrite)          ║
# ║   Manual case  : TC16                                                ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# The reviewed AI-generated cart-total test, rewritten on this framework
# and run over several baskets so "Item total + Tax = Total" is not
# proven on a single case. Money is compared as integer cents.
# ══════════════════════════════════════════════════════════════════════

@ui @checkout @regression
Feature: Order total calculation
  As the business
  I want every order total to equal the item total plus tax
  So that customers are always charged correctly

  Background:
    Given I am logged in as the "standard" user

  @TC16 @P1
  Scenario Outline: TC16 OrderTotal - Order total equals item total plus tax for <basket>
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

    Examples:
      | basket           | count | products                                                                                                                                                    |
      | one product      | 1     | Sauce Labs Onesie                                                                                                                                           |
      | two products     | 2     | Sauce Labs Backpack, Sauce Labs Bike Light                                                                                                                  |
      | all six products | 6     | Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket, Sauce Labs Onesie, Test.allTheThings() T-Shirt (Red)         |
