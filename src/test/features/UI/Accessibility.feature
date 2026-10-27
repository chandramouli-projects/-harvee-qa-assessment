# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 07: Accessibility and Responsive Layout                    ║
# ║   Manual cases : TC19, TC20, TC21  (+ DEF-02 visible focus)          ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# LIMITS: axe-core covers only part of WCAG. Screen-reader announcements,
#         reading order and real devices still need manual testing.
# RESPONSIVE: viewport emulation in desktop engines, not real devices.
# ══════════════════════════════════════════════════════════════════════

@ui @accessibility
Feature: Accessibility and responsive layout
  As a shopper who uses a keyboard, assistive technology or a small screen
  I want to log in, shop and check out
  So that the shop works for me too

# ══════════════════════════════════════════════════════════════════════
# KEYBOARD (TC19)
# ══════════════════════════════════════════════════════════════════════

  @TC19 @P2
  Scenario: TC19 Keyboard-Only - A user can log in and add a product using only the keyboard
    Given I am on the login page
    When I log in as the "standard" user using only the keyboard
    Then the Products page should be displayed
    When I add "Sauce Labs Backpack" to the cart using only the keyboard
    Then the cart badge should show 1

  # Known defect DEF-02 (WCAG 2.4.7 Focus Visible). Verified with a positive
  # control: an injected outline IS detected by the same pixel comparison;
  # the site's own focus styling is not. Remove @fail once fixed.
  @TC19 @P2 @known-defect @DEF-02 @fail
  Scenario: TC19 Keyboard-FocusVisible - Focused login controls show a visible focus indicator
    Given I am on the login page
    Then every login control should show a visible focus indicator when reached with Tab

# ══════════════════════════════════════════════════════════════════════
# ACCESSIBLE NAMES AND AUTOMATED SCAN (TC20)
# ══════════════════════════════════════════════════════════════════════

  @TC20 @P2
  Scenario: TC20 A11y-LoginForm - Login form controls have accessible names and errors are visible
    Given I am on the login page
    Then the login form controls should be found by their accessible names
    When I log in with username "" and password ""
    Then I should see the login error "Epic sadface: Username is required"

  @TC20 @P2
  Scenario: TC20 A11y-ShopControls - Products and checkout controls have accessible names
    Given I am logged in as the "standard" user
    Then the sort control and menu button should be found by their accessible names
    And every product should have an "Add to cart" button
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    Then the checkout form controls should be found by their accessible names

  @TC20 @P2
  Scenario: TC20 A11y-AxeScan - axe scan finds no critical or serious WCAG A/AA violations on key pages
    Given I am on the login page
    When I scan the "Login" page with axe for WCAG 2 A and AA rules
    And I log in as the "standard" user
    Then the Products page should be displayed
    When I scan the "Products" page with axe for WCAG 2 A and AA rules
    And I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    Then the Cart page should be displayed
    When I scan the "Cart" page with axe for WCAG 2 A and AA rules
    Then no critical or serious accessibility violations should be found

# ══════════════════════════════════════════════════════════════════════
# RESPONSIVE (TC21)
# ══════════════════════════════════════════════════════════════════════

  @TC21 @P3
  Scenario Outline: TC21 Responsive - Key controls are usable without horizontal scrolling at <device> width
    Given the browser viewport is <width> x <height> pixels
    And I am logged in as the "standard" user
    Then the page should not scroll horizontally
    And the menu button, cart link and sort control should be within the viewport
    When I add the product "Sauce Labs Backpack" to the cart
    Then the cart badge should show 1
    And the page should not scroll horizontally

    Examples:
      | device  | width | height |
      | desktop | 1366  | 768    |
      | mobile  | 375   | 667    |
