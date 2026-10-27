# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 01: Authentication                                         ║
# ║   Application  : Sauce Demo — BASE_URL from config/.env.<ENV>        ║
# ║   Manual cases : TC01, TC02, TC03, TC04, TC25                        ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# USERS: referred to by role — "standard", "locked out", "problem",
#        "performance glitch". Usernames come from config, never from here.
# PLACEHOLDERS: ${STANDARD_USER} and ${PASSWORD} are resolved from config.
# ══════════════════════════════════════════════════════════════════════

@ui @authentication
Feature: Authentication
  As a shopper
  I want to sign in with my own account
  So that I can browse and buy products, while blocked or unknown accounts stay out

  Background:
    Given I am on the login page

# ══════════════════════════════════════════════════════════════════════
# HAPPY PATH
# ══════════════════════════════════════════════════════════════════════

  @TC01 @smoke @P1
  Scenario: TC01 Login-HappyPath - Standard user logs in and reaches the Products page
    When I log in as the "standard" user
    Then the Products page should be displayed
    And the product list should not be empty
    And the menu button should be visible
    And no login error should be displayed

  @TC25 @P3
  Scenario: TC25 Login-PerformanceGlitch - performance_glitch_user can log in and reach the Products page
    # Functional tolerance check only (navigation timeout 15 s) — not a performance measurement.
    When I log in as the "performance glitch" user
    Then the Products page should be displayed
    And the product list should not be empty

# ══════════════════════════════════════════════════════════════════════
# NEGATIVE
# ══════════════════════════════════════════════════════════════════════

  @TC02 @P1 @security
  Scenario: TC02 Login-LockedOut - Locked-out user sees the lock-out error and cannot log in
    When I log in as the "locked out" user
    Then I should see the login error "Epic sadface: Sorry, this user has been locked out."
    And I should remain on the login page

  @TC03 @P1
  Scenario Outline: TC03 Login-InvalidCredentials - Login is rejected for <case>
    When I log in with username "<username>" and password "<password>"
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"
    And I should remain on the login page

    Examples:
      | case             | username         | password              |
      | wrong password   | ${STANDARD_USER} | not_the_demo_password |
      | unknown username | unknown_user     | ${PASSWORD}           |

  @TC04 @P2
  Scenario Outline: TC04 Login-RequiredFields - Required-field validation when <case>
    When I log in with username "<username>" and password "<password>"
    Then I should see the login error "<error>"
    And I should remain on the login page

    Examples:
      | case               | username | password | error                              |
      | both fields empty  |          |          | Epic sadface: Username is required |
      | username empty     |          | any      | Epic sadface: Username is required |
      | password empty     | any      |          | Epic sadface: Password is required |
