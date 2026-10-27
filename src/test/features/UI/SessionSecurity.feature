# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 06: Session Handling and Protected Pages                   ║
# ║   Manual cases : TC22, TC24                                          ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# SCOPE: UI-level checks only. They show the UI blocks protected pages;
#        they do NOT prove server-side authorisation.
# ══════════════════════════════════════════════════════════════════════

@ui @security
Feature: Session handling and protected pages
  As the shop owner
  I want signed-out visitors kept out of shopping and checkout pages
  So that a session cannot be reused after logout

  @TC22 @smoke @P1
  Scenario: TC22 Session-Logout - After logout, direct navigation to /inventory.html does not show the Products page
    Given I am logged in as the "standard" user
    When I log out
    Then the login page should be displayed
    When I navigate directly to "/inventory.html"
    Then I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."
    And the login page should be displayed
    And no products should be displayed

  @TC24 @P1
  Scenario Outline: TC24 Session-DeepLink - Unauthenticated deep link to <path> shows the login page
    Given I have not logged in
    When I navigate directly to "<url>"
    Then I should see the login error "Epic sadface: You can only access '<path>' when you are logged in."
    And the login page should be displayed
    And the cart link should not be visible

    Examples:
      | path                    | url                       |
      | /cart.html              | /cart.html                |
      | /checkout-step-one.html | /checkout-step-one.html   |
      | /checkout-step-two.html | /checkout-step-two.html   |
      | /checkout-complete.html | /checkout-complete.html   |
      | /inventory-item.html    | /inventory-item.html?id=4 |
