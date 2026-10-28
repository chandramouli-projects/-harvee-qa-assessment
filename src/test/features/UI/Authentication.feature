# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 01: Authentication (Login)                                 ║
# ║   Application  : Sauce Demo — BASE_URL from config/.env.<ENV>        ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC01 [core] - Login with a valid user
#   TC02 [core] - Login with a locked user
#   TC03 [core] - Login with a wrong password
#   TC04 [core] - Login with both fields empty
#   TC26 [ext ] - Login with the slow user (performance_glitch_user)
#   TC27 [ext ] - Login using the Enter key
#   TC28 [ext ] - Close the login error message                        (BUG-05)
#   TC29 [ext ] - Login as problem_user
#   TC30 [ext ] - Login as error_user
#   TC31 [ext ] - Login as visual_user
#   TC32 [ext ] - Login page content
#   TC33 [ext ] - Login with a username that does not exist
#   TC34 [ext ] - Login with username empty
#   TC35 [ext ] - Login with password empty
#   TC36 [ext ] - Username is case-sensitive
#   TC37 [ext ] - Username with spaces before and after
#   TC38 [ext ] - Password is case-sensitive
#   TC39 [ext ] - Script text in username is treated as plain text
#   TC40 [ext ] - Very long username and password
#
# USERS: referred to by role — "standard", "locked out", "problem",
#        "performance glitch", "error", "visual". Usernames come from config.
# PLACEHOLDERS: ${STANDARD_USER}, ${PASSWORD}, … are resolved from config.
# ══════════════════════════════════════════════════════════════════════

@ui @authentication
Feature: Authentication
  As a shopper
  I want to sign in with my own account
  So that I can browse and buy products, while blocked or unknown accounts stay out

  Background:
    Given I am on the login page

# ══════════════════════════════════════════════════════════════════════
# POSITIVE
# ══════════════════════════════════════════════════════════════════════

  @TC01 @smoke @P1 @core
  Scenario: TC01 Login-HappyPath - Standard user logs in and reaches the Products page
    When I log in as the "standard" user
    Then the Products page should be displayed
    And the product list should not be empty
    And the menu button should be visible
    And no login error should be displayed

  @TC26 @P3 @extended
  Scenario: TC26 Login-PerformanceGlitch - performance_glitch_user can log in and reach the Products page
    # Functional tolerance check only (navigation timeout 15 s) — not a performance measurement.
    When I log in as the "performance glitch" user
    Then the Products page should be displayed
    And the product list should not be empty

  @TC27 @P2 @extended
  Scenario: TC27 Login-EnterKey - Pressing Enter in the password field logs the user in
    When I log in as the "standard" user by pressing Enter
    Then the Products page should be displayed

  @TC28 @P3 @extended
  Scenario: TC28 Login-CloseError - The login error disappears when its X button is clicked
    When I log in with username "" and password ""
    Then I should see the login error "Epic sadface: Username is required"
    When I close the login error
    Then no login error should be displayed

  Scenario Outline: <id> Login-Persona - The <role> user can log in and reach the Products page
    When I log in as the "<role>" user
    Then the Products page should be displayed
    And the product list should not be empty

    @TC29 @P2 @extended
    Examples: problem_user
      | id   | role    |
      | TC29 | problem |

    @TC30 @P2 @extended
    Examples: error_user
      | id   | role  |
      | TC30 | error |

    @TC31 @P2 @extended
    Examples: visual_user
      | id   | role   |
      | TC31 | visual |

  @TC32 @P3 @extended
  Scenario: TC32 Login-PageContent - The login page shows placeholders, accepted usernames and the password hint
    Then the login fields should show the placeholders "Username" and "Password"
    And the login page should list the accepted usernames "${STANDARD_USER}, ${LOCKED_OUT_USER}, ${PROBLEM_USER}, ${PERFORMANCE_GLITCH_USER}, ${ERROR_USER}, ${VISUAL_USER}"
    And the login page should show the password hint "Password for all users: ${PASSWORD}"

# ══════════════════════════════════════════════════════════════════════
# NEGATIVE
# ══════════════════════════════════════════════════════════════════════

  @TC02 @P1 @security @core
  Scenario: TC02 Login-LockedOut - Locked-out user sees the lock-out error and cannot log in
    When I log in as the "locked out" user
    Then I should see the login error "Epic sadface: Sorry, this user has been locked out."
    And I should remain on the login page

  Scenario Outline: <id> Login-InvalidCredentials - Login is rejected for <case>
    When I log in with username "<username>" and password "<password>"
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"
    And I should remain on the login page

    @TC03 @P1 @core
    Examples: Wrong password
      | id   | case           | username         | password              |
      | TC03 | wrong password | ${STANDARD_USER} | not_the_demo_password |

    @TC33 @P1 @extended
    Examples: Unknown username
      | id   | case             | username     | password    |
      | TC33 | unknown username | unknown_user | ${PASSWORD} |

  Scenario Outline: <id> Login-RequiredFields - Required-field validation when <case>
    When I log in with username "<username>" and password "<password>"
    Then I should see the login error "<error>"
    And I should remain on the login page

    @TC04 @P2 @core
    Examples: Both fields empty
      | id   | case              | username | password | error                              |
      | TC04 | both fields empty |          |          | Epic sadface: Username is required |

    @TC34 @P2 @extended
    Examples: Username empty
      | id   | case           | username | password | error                              |
      | TC34 | username empty |          | any      | Epic sadface: Username is required |

    @TC35 @P2 @extended
    Examples: Password empty
      | id   | case           | username | password | error                              |
      | TC35 | password empty | any      |          | Epic sadface: Password is required |

  # ASSUMPTION (TC36, TC37): usernames are case-sensitive and spaces are not removed —
  # confirm with the product owner. This is the behaviour seen on 27-Oct-2026.
  Scenario Outline: <id> Login-InputVariation - Login is rejected when <case>
    When I log in with username "<username>" and password "<password>"
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"
    And I should remain on the login page

    @TC36 @P2 @extended
    Examples: Username in capital letters
      | id   | case                               | username      | password    |
      | TC36 | the username is in capital letters | STANDARD_USER | ${PASSWORD} |

    @TC38 @P2 @extended
    Examples: Password in capital letters
      | id   | case                               | username         | password     |
      | TC38 | the password is in capital letters | ${STANDARD_USER} | SECRET_SAUCE |

  # A separate scenario because table cells drop leading/trailing spaces.
  @TC37 @P3 @extended
  Scenario: TC37 Login-InputVariation - Login is rejected when the username has spaces around it
    When I log in with username " ${STANDARD_USER} " and password "${PASSWORD}"
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"
    And I should remain on the login page

  @TC39 @P2 @security @extended
  Scenario: TC39 Login-ScriptText - Script text in the username is treated as plain text
    # Safe check only: no real attack is performed.
    Given I watch for browser pop-up dialogs
    When I log in with username "<script>alert(1)</script>" and password "${PASSWORD}"
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"
    And no browser pop-up dialog should have appeared

# ══════════════════════════════════════════════════════════════════════
# BOUNDARY
# ══════════════════════════════════════════════════════════════════════

  @TC40 @P3 @extended
  Scenario: TC40 Login-LongInput - A 1000-character username and password are rejected without breaking the page
    When I log in with a 1000-character username and password
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"
    And I should remain on the login page
