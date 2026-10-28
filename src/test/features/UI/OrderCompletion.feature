# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 08: Order Completion and Order Integrity                   ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC19 [core] - Double-click Finish
#   TC78 [ext ] - Order confirmation page content
#   TC79 [ext ] - "Generate PDF order" button
#   TC80 [ext ] - Browser Back after the order is placed
#   TC81 [ext ] - Refresh the confirmation page
#   TC82 [ext ] - Finish the same cart in two tabs                     (BUG-07)
#
# SCOPE: the UI only. Sauce Demo has no order list, so "only one order"
#        is checked through what the shopper sees, not a backend record.
# ══════════════════════════════════════════════════════════════════════

@ui @order-completion
Feature: Order completion
  As a shopper
  I want a clear confirmation and exactly one order per checkout
  So that I am never charged twice

  Background:
    Given I am logged in as the "standard" user
    And I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    And the checkout "overview" step should be displayed

# ══════════════════════════════════════════════════════════════════════
# POSITIVE
# ══════════════════════════════════════════════════════════════════════

  @TC78 @P1 @extended
  Scenario: TC78 OrderComplete-Content - The confirmation page shows the heading, message, image and Back Home
    When I finish the order
    Then the confirmation page should show "Thank you for your order!" and "Your order has been dispatched, and will arrive just as fast as the pony can get there!"
    And the confirmation page should show the "Pony Express" image and a "Back Home" button
    And the cart badge should be hidden

  # The PDF's text content still needs a manual look; the download itself is checked here.
  @TC79 @P3 @extended
  Scenario: TC79 OrderComplete-PDF - "Generate PDF order" downloads a PDF of the order
    When I finish the order
    And I generate the PDF order
    Then a PDF file named like "swag-labs-order-" should be downloaded

# ══════════════════════════════════════════════════════════════════════
# NEGATIVE (order integrity)
# ══════════════════════════════════════════════════════════════════════

  @TC19 @P1 @core
  Scenario: TC19 OrderComplete-DoubleClick - Double-clicking Finish shows a single confirmation
    When I double-click Finish
    Then exactly one order confirmation should be displayed
    And the cart badge should be hidden

  @TC80 @P1 @extended
  Scenario: TC80 OrderComplete-BackAfterOrder - Browser Back after ordering does not bring the order back
    When I finish the order
    Then I should see the order confirmation "Thank you for your order!"
    When I go back in the browser
    Then the overview should list no products
    And the cart badge should be hidden

  @TC81 @P2 @extended
  Scenario: TC81 OrderComplete-Refresh - Refreshing the confirmation page keeps it and the empty cart
    When I finish the order
    And I refresh the page
    Then I should see the order confirmation "Thank you for your order!"
    And the cart badge should be hidden

  # BUG-07: on 27-Oct-2026 the second tab also showed "Thank you for your order!", so this fails.
  @TC82 @P2 @known-defect @BUG-07 @extended
  Scenario: TC82 OrderComplete-TwoTabs - Finishing the same cart in a second tab does not confirm a second order
    When I open the same checkout overview in a second tab
    And I finish the order
    Then I should see the order confirmation "Thank you for your order!"
    When I finish the order in the second tab
    Then the second tab should not show another order confirmation
