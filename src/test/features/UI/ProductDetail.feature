# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 04: Product Detail Page                                    ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC49 [ext ] - Add to cart from the product page
#   TC50 [ext ] - Remove from the product page
#   TC51 [ext ] - "Back to products" keeps the cart
#   TC52 [ext ] - Unknown product id
#   TC53 [ext ] - Product id is not a number
# ══════════════════════════════════════════════════════════════════════

@ui @product-detail
Feature: Product detail page
  As a shopper
  I want to open a product and add or remove it there
  So that I can decide with all the details in front of me

  Background:
    Given I am logged in as the "standard" user

  @TC49 @P1 @extended
  Scenario: TC49 ProductDetail-Add - Adding to the cart on the product page updates the button and badge
    When I open the product "Sauce Labs Backpack" by its name
    And I add the product to the cart from its page
    Then the product page should show a "Remove" button
    And the cart badge should show 1

  @TC50 @P2 @extended
  Scenario: TC50 ProductDetail-Remove - Removing on the product page updates the button and badge
    When I open the product "Sauce Labs Backpack" by its name
    And I add the product to the cart from its page
    Then the cart badge should show 1
    When I remove the product from its page
    Then the product page should show a "Add to cart" button
    And the cart badge should be hidden

  @TC51 @P2 @extended
  Scenario: TC51 ProductDetail-Back - "Back to products" returns to Products with the cart kept
    When I open the product "Sauce Labs Backpack" by its name
    And I add the product to the cart from its page
    And I go back to the products
    Then the Products page should be displayed
    And the cart badge should show 1
    And the product "Sauce Labs Backpack" should show a "Remove" button on the Products page

  Scenario Outline: <id> ProductDetail-NotFound - An invalid product id (<case>) shows "ITEM NOT FOUND"
    When I navigate directly to "/inventory-item.html?id=<product_id>"
    Then the product page should say "ITEM NOT FOUND"
    When I go back to the products
    Then the Products page should be displayed

    @TC52 @P3 @extended
    Examples: Unknown id
      | id   | case       | product_id |
      | TC52 | unknown id | 99         |

    @TC53 @P3 @extended
    Examples: Not a number
      | id   | case         | product_id |
      | TC53 | not a number | abc        |
