# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 02: Products Page                                          ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC41 [ext ] - Every product shows full details
#   TC42 [ext ] - Product prices format
#   TC43 [ext ] - Product name opens the product detail page
#   TC44 [ext ] - Product image opens the product detail page
#   TC45 [ext ] - Default sort after login
#   TC46 [ext ] - Footer social links
#
# EXTERNAL SITES: footer links are checked for their address and "open in a
#                 new tab" setting only; the third-party pages are not tested.
# ══════════════════════════════════════════════════════════════════════

@ui @products
Feature: Products page
  As a shopper
  I want to see every product with its details
  So that I can choose what to buy

  Background:
    Given I am logged in as the "standard" user

  @TC41 @P1 @extended
  Scenario: TC41 Products-Details - Every product shows an image, name, description, price and "Add to cart" button
    Then the catalogue should show 6 products, each with an image, name, description, price and an "Add to cart" button

  @TC42 @P2 @extended
  Scenario: TC42 Products-PriceFormat - Every price starts with $ and has two decimals
    Then the product prices should be "$29.99, $9.99, $15.99, $49.99, $7.99, $15.99" in display order

  @TC43 @P2 @extended
  Scenario: TC43 Products-OpenByName - Clicking a product name opens its product page with the same details
    When I open the product "Sauce Labs Backpack" by its name
    Then the page URL should contain "inventory-item.html?id=4"
    And the product page should show "Sauce Labs Backpack" at "$29.99"
    And the product page should show the same description as the Products page
    And the product page should show a "Back to products" button

  @TC44 @P2 @extended
  Scenario: TC44 Products-OpenByImage - Clicking a product image opens its product page
    When I open the product "Sauce Labs Bike Light" by its image
    Then the product page should show "Sauce Labs Bike Light" at "$9.99"

  @TC45 @P2 @extended
  Scenario: TC45 Products-DefaultSort - Products are sorted by name A to Z after login
    Then the sort dropdown should show "Name (A to Z)"
    And the product names should be in ascending order

  @TC46 @P3 @extended
  Scenario: TC46 Products-FooterLinks - Footer social links open the Sauce Labs pages in a new tab
    Then the footer link "X" should open "https://x.com/saucelabs" in a new tab
    And the footer link "Facebook" should open "https://www.facebook.com/saucelabs" in a new tab
    And the footer link "LinkedIn" should open "https://www.linkedin.com/company/sauce-labs/" in a new tab
