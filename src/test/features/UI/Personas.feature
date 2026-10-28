# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 11: Demo Personas                                          ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC95 [ext ] - error_user can complete an order                     (BUG-08)
#   TC96 [ext ] - problem_user checkout form keeps typed values        (BUG-09)
#   TC97 [ext ] - problem_user product images are correct              (BUG-10)
#   TC98 [ext ] - visual_user page looks the same as standard_user     (BUG-11)
#
# RULE: every persona should behave like standard_user. These demo users are
#       built with faults, so every difference is reported as a bug and the
#       scenario fails while the fault exists.
# ══════════════════════════════════════════════════════════════════════

@ui @personas
Feature: Demo personas
  As the shop owner
  I want every account to see and use the shop the same way
  So that no customer gets a broken experience

  # BUG-08: on 27-Oct-2026 "Remove" did nothing for error_user, so this fails.
  @TC95 @P2 @known-defect @BUG-08 @extended
  Scenario: TC95 Persona-ErrorUser - error_user can add, remove and order a product like standard_user
    Given I am logged in as the "error" user
    When I add the product "Sauce Labs Onesie" to the cart
    Then the cart badge should show 1
    When I remove "Sauce Labs Onesie" from the cart on the Products page
    Then the cart badge should be hidden
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed
    When I finish the order
    Then I should see the order confirmation "Thank you for your order!"

  # BUG-09: on 27-Oct-2026 typing the last name changed the first name field, so this fails.
  @TC96 @P2 @known-defect @BUG-09 @extended
  Scenario: TC96 Persona-ProblemUserCheckout - problem_user's checkout form keeps exactly what was typed
    Given I am logged in as the "problem" user
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed

  # BUG-10: on 27-Oct-2026 every product showed the same broken image, so this fails.
  @TC97 @P2 @known-defect @BUG-10 @extended
  Scenario: TC97 Persona-ProblemUserImages - problem_user sees the correct image for every product
    Given I am logged in as the "standard" user
    And I note the products, images and header layout
    When I log out
    And I log in as the "problem" user
    Then the Products page should be displayed
    And every product should show the same image as noted

  # BUG-11: on 27-Oct-2026 visual_user saw different prices and a moved cart icon, so this fails.
  @TC98 @P3 @known-defect @BUG-11 @extended
  Scenario: TC98 Persona-VisualUser - visual_user sees the same products, prices, images and layout as standard_user
    Given I am logged in as the "standard" user
    And I note the products, images and header layout
    When I log out
    And I log in as the "visual" user
    Then the Products page should be displayed
    And the product names and prices should be the same as noted
    And every product should show the same image as noted
    And the header controls should be in the same place as noted
