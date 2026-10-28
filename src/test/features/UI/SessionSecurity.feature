# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 10: Session Handling and Protected Pages                   ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC21 [core] - Products page cannot be opened after logout
#   TC22 [core] - Open /cart.html without logging in
#   TC88 [ext ] - Refresh keeps the user logged in
#   TC89 [ext ] - Open /checkout-step-one.html without logging in
#   TC90 [ext ] - Open /checkout-step-two.html without logging in
#   TC91 [ext ] - Open /checkout-complete.html without logging in
#   TC92 [ext ] - Open /inventory-item.html without logging in
#   TC93 [ext ] - Browser Back after logout
#   TC94 [ext ] - Session timeout
#
# SCOPE: UI-level checks only. They show the UI blocks protected pages;
#        they do NOT prove server-side authorisation.
# TIMEOUT (TC94): the login cookie expires after ~10 minutes. Instead of
#        waiting, the cookie is removed, which puts the browser in the same
#        state an idle user reaches after the timeout.
# ══════════════════════════════════════════════════════════════════════

@ui @security
Feature: Session handling and protected pages
  As the shop owner
  I want signed-out visitors kept out of shopping and checkout pages
  So that a session cannot be reused after logout

# ══════════════════════════════════════════════════════════════════════
# POSITIVE
# ══════════════════════════════════════════════════════════════════════

  @TC88 @P2 @extended
  Scenario: TC88 Session-Refresh - Refreshing a page keeps the user logged in on the same page
    Given I am logged in as the "standard" user
    When I refresh the page
    Then the Products page should be displayed
    When I open the cart
    And I refresh the page
    Then the Cart page should be displayed

# ══════════════════════════════════════════════════════════════════════
# NEGATIVE
# ══════════════════════════════════════════════════════════════════════

  @TC21 @smoke @P1 @core
  Scenario: TC21 Session-Logout - After logout, direct navigation to /inventory.html does not show the Products page
    Given I am logged in as the "standard" user
    When I log out
    Then the login page should be displayed
    When I navigate directly to "/inventory.html"
    Then I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."
    And the login page should be displayed
    And no products should be displayed

  Scenario Outline: <id> Session-DeepLink - Unauthenticated deep link to <path> shows the login page
    Given I have not logged in
    When I navigate directly to "<url>"
    Then I should see the login error "Epic sadface: You can only access '<path>' when you are logged in."
    And the login page should be displayed
    And the cart link should not be visible

    @TC22 @P1 @core
    Examples: Cart
      | id   | path       | url        |
      | TC22 | /cart.html | /cart.html |

    @TC89 @P1 @extended
    Examples: Checkout information
      | id   | path                    | url                     |
      | TC89 | /checkout-step-one.html | /checkout-step-one.html |

    @TC90 @P1 @extended
    Examples: Checkout overview
      | id   | path                    | url                     |
      | TC90 | /checkout-step-two.html | /checkout-step-two.html |

    @TC91 @P1 @extended
    Examples: Checkout complete
      | id   | path                    | url                     |
      | TC91 | /checkout-complete.html | /checkout-complete.html |

    @TC92 @P1 @extended
    Examples: Product page
      | id   | path                 | url                       |
      | TC92 | /inventory-item.html | /inventory-item.html?id=4 |

  @TC93 @P1 @extended
  Scenario: TC93 Session-BackAfterLogout - Browser Back after logout does not show the Products page
    Given I am logged in as the "standard" user
    When I log out
    Then the login page should be displayed
    When I go back in the browser
    Then I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."
    And no products should be displayed

  # ASSUMPTION: the session ends after about 10 minutes (confirm with the product owner).
  @TC94 @P2 @extended
  Scenario: TC94 Session-Timeout - After the session expires, the next click goes to the login page
    Given I am logged in as the "standard" user
    When my session expires
    And I open the cart
    Then I should see the login error "Epic sadface: You can only access '/cart.html' when you are logged in."
    And the login page should be displayed
