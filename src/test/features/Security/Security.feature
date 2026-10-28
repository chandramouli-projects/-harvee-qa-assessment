# ╔══════════════════════════════════════════════════════════════════════╗
# ║   SECURITY (NON-FUNCTIONAL) — passive, client-side checks            ║
# ║   Cases        : SC01 - SC14   (19 scenarios per browser)            ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# SCOPE: Sauce Demo is a public third-party site, so only SAFE, PASSIVE
#   checks are run: reading response headers and cookies, inspecting
#   browser storage, and actions that only affect our own browser.
#   No attack traffic, no active scanning (ZAP active scan, fuzzing,
#   brute force) and no load. Based on OWASP ASVS / Top 10 areas.
# RELATED: the functional session cases (logout, deep links, Back after
#   logout, timeout) are TC21, TC22 and TC88 - TC94 in UI/SessionSecurity.feature.
# TOOLS: Playwright browser + APIRequestContext (headers, redirects),
#   browser cookies and storage.
#
# TEST CASES COVERED (ID - title):
#   SC01 - Plain HTTP is redirected to HTTPS
#   SC02 - HTTPS responses send Strict-Transport-Security      (SC-BUG-01)
#   SC03 - No request uses plain HTTP during a purchase
#   SC04 - Other sites cannot frame the shop (clickjacking)    (SC-BUG-02)
#   SC05 - Security headers are set (3 headers)                (SC-BUG-03)
#   SC06 - Session cookie is Secure, SameSite and HttpOnly     (SC-BUG-04)
#   SC07 - Logout removes the session cookie
#   SC08 - A hand-made session cookie does not log a user in   (SC-BUG-05)
#   SC09 - A hand-made cookie for a blocked or unknown user gives no access (2)
#   SC10 - Login errors do not reveal which usernames exist (3)
#   SC11 - Credentials never appear in the URL
#   SC12 - Password and customer details are not kept in browser storage
#   SC13 - HTML and script typed into fields are not executed
#   SC14 - Links that open a new tab do not give that tab access back
#
# BUGS: scenarios tagged @known-defect @SC-BUG-xx FAIL while the bug
#   exists; the failure message explains it. Assertions are never weakened.
#   SC-BUG-01  No Strict-Transport-Security header
#   SC-BUG-02  No X-Frame-Options / CSP frame-ancestors (page can be framed)
#   SC-BUG-03  No Content-Security-Policy, X-Content-Type-Options, Referrer-Policy
#   SC-BUG-04  session-username cookie has no Secure, no SameSite, not HttpOnly
#   SC-BUG-05  Setting session-username=<valid user> opens the shop without a
#              password (authentication is checked only in the browser)
#
# NOT COVERED (needs permission for active testing, or a server/API):
#   brute-force / rate limiting, active scanning, server-side
#   authorisation of APIs, TLS configuration grading.
# ══════════════════════════════════════════════════════════════════════

@security
Feature: Security
  As the shop owner
  I want the shop to protect sessions, credentials and customer data
  So that attackers cannot misuse accounts or trick shoppers

# ══════════════════════════════════════════════════════════════════════
# TRANSPORT (HTTPS)
# ══════════════════════════════════════════════════════════════════════

  @SC01 @P1
  Scenario: SC01 Transport-HttpsRedirect - Plain HTTP is redirected to HTTPS
    When I request the home page over plain HTTP
    Then I should be redirected permanently to the HTTPS address

  # SC-BUG-01: without HSTS a browser may still try plain HTTP first, where
  # traffic can be intercepted before the redirect.
  @SC02 @P1 @known-defect @SC-BUG-01
  Scenario: SC02 Transport-HSTS - HTTPS responses tell the browser to always use HTTPS
    When I request the home page over HTTPS
    Then the response header "Strict-Transport-Security" should contain "max-age="

  @SC03 @P1
  Scenario: SC03 Transport-NoMixedContent - No request uses plain HTTP during a purchase
    Given I watch every network request
    And I am logged in as the "standard" user
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    And I finish the order
    Then I should see the order confirmation "Thank you for your order!"
    And no request should have used plain HTTP

# ══════════════════════════════════════════════════════════════════════
# RESPONSE HEADERS
# ══════════════════════════════════════════════════════════════════════

  # SC-BUG-02: no X-Frame-Options and no CSP frame-ancestors, so any site can
  # show the shop in a hidden frame and trick users into clicking (clickjacking).
  @SC04 @P1 @known-defect @SC-BUG-02
  Scenario: SC04 Headers-Clickjacking - Other sites are not allowed to frame the shop
    When I request the home page over HTTPS
    Then the response should forbid framing by other sites

  # SC-BUG-03: these headers are missing.
  @SC05 @P2 @known-defect @SC-BUG-03
  Scenario Outline: SC05 Headers-<header> - The <header> header is set
    When I request the home page over HTTPS
    Then the response header "<header>" should contain "<expected>"

    Examples:
      | header                  | expected    |
      | Content-Security-Policy | default-src |
      | X-Content-Type-Options  | nosniff     |
      | Referrer-Policy         |             |

# ══════════════════════════════════════════════════════════════════════
# SESSION COOKIE
# ══════════════════════════════════════════════════════════════════════

  # SC-BUG-04: the page writes "session-username=<user>; path=/; expires=..."
  # with no Secure and no SameSite, and because page script writes it, it
  # cannot be HttpOnly (any script on the page can read it).
  @SC06 @P1 @known-defect @SC-BUG-04
  Scenario: SC06 Session-CookieFlags - The session cookie is Secure, SameSite and HttpOnly
    Given I record how the page writes cookies
    And I am logged in as the "standard" user
    Then the session cookie should be set with the protections "Secure, SameSite, HttpOnly"

  @SC07 @P1
  Scenario: SC07 Session-LogoutClearsCookie - Logout removes the session cookie
    Given I am logged in as the "standard" user
    When I log out
    Then the login page should be displayed
    And the session cookie should be removed

# ══════════════════════════════════════════════════════════════════════
# AUTHENTICATION
# ══════════════════════════════════════════════════════════════════════

  # SC-BUG-05: the cookie only holds the username and nothing checks it on a
  # server, so typing it into the browser opens the shop with no password.
  @SC08 @P1 @known-defect @SC-BUG-05
  Scenario: SC08 Auth-ForgedCookie - A hand-made session cookie for a valid user does not log in without a password
    Given I have not logged in
    When I set the session cookie to "${STANDARD_USER}" without logging in
    And I navigate directly to "/inventory.html"
    Then no products should be displayed
    And the login page should be displayed

  @SC09 @P1
  Scenario Outline: SC09 Auth-ForgedCookieBlocked - A hand-made session cookie for a <user> user gives no access
    Given I have not logged in
    When I set the session cookie to "<username>" without logging in
    And I navigate directly to "/inventory.html"
    Then no products should be displayed
    And the login page should be displayed

    Examples:
      | user       | username           |
      | locked-out | ${LOCKED_OUT_USER} |
      | unknown    | unknown_user       |

  # The locked-out message appears only with the correct password, so a
  # wrong password never reveals whether an account exists or is locked.
  @SC10 @P2
  Scenario Outline: SC10 Auth-NoUserEnumeration - The login error does not reveal the account for <case>
    Given I am on the login page
    When I log in with username "<username>" and password "<password>"
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"

    Examples:
      | case                          | username           | password              |
      | a valid user, wrong password  | ${STANDARD_USER}   | not_the_demo_password |
      | a locked user, wrong password | ${LOCKED_OUT_USER} | not_the_demo_password |
      | an unknown user               | unknown_user       | ${PASSWORD}           |

  @SC11 @P1
  Scenario: SC11 Auth-NoCredentialsInUrl - Credentials never appear in the URL
    Given I am on the login page
    When I log in as the "standard" user
    Then the Products page should be displayed
    And the page URL should not contain the username or the password

# ══════════════════════════════════════════════════════════════════════
# DATA PROTECTION AND INPUT HANDLING
# ══════════════════════════════════════════════════════════════════════

  @SC12 @P1
  Scenario: SC12 Data-BrowserStorage - The password and customer details are not kept in browser storage
    Given I am logged in as the "standard" user
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with first name "Zyxwvut", last name "Qponmlk" and postal code "QX9Z7W"
    And I finish the order
    Then browser storage and cookies should not contain the password or "Zyxwvut, Qponmlk, QX9Z7W"

  @SC13 @P1
  Scenario: SC13 Input-NoScriptExecution - HTML and script typed into fields are not executed
    Given I watch for browser pop-up dialogs
    And I am on the login page
    When I log in with username "<img src=x onerror=alert(1)>" and password "<script>alert(2)</script>"
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"
    When I log in as the "standard" user
    And I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with first name "<img src=x onerror=alert(3)>", last name "<script>alert(4)</script>" and postal code "12345"
    Then the checkout "overview" step should be displayed
    And no browser pop-up dialog should have appeared
    And the page should not contain elements created from the typed text

# ══════════════════════════════════════════════════════════════════════
# EXTERNAL LINKS
# ══════════════════════════════════════════════════════════════════════

  @SC14 @P3
  Scenario: SC14 Links-NoOpener - Links that open a new tab do not give that tab access back to the shop
    Given I am logged in as the "standard" user
    Then every link that opens a new tab should use "noopener" or "noreferrer"
