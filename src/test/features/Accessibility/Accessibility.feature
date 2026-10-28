# ╔══════════════════════════════════════════════════════════════════════╗
# ║   ACCESSIBILITY (NON-FUNCTIONAL) — strict WCAG 2.2 A/AA              ║
# ║   Cases        : AC01 - AC15   (32 scenarios per browser)            ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# STANDARD: WCAG 2.0, 2.1 and 2.2, levels A and AA. A scan fails on ANY
#   WCAG violation, whatever its impact. axe "incomplete" results (needs
#   human review) and best-practice findings are attached to the report,
#   not counted as failures.
# TOOLS: axe-core via @axe-core/playwright; Playwright keyboard, focus,
#   screenshots and viewport emulation.
#
# TEST CASES COVERED (ID - title):
#   AC01 - axe strict scan of every page and state (11 states)
#   AC02 - Positive control: the scan detects known violations
#   AC03 - Keyboard-only login and add to cart  (= core case TC23)
#   AC04 - Keyboard-only checkout from the cart page
#   AC05 - Keyboard-only menu and logout
#   AC06 - Cart link can receive keyboard focus              (AC-BUG-02)
#   AC07 - Visible focus indicator on every page (4 pages)   (AC-BUG-01)
#   AC08 - Login form accessible names and visible errors
#   AC09 - Products and checkout accessible names
#   AC10 - Error messages are announced to screen readers (2 forms)
#   AC11 - Checkout fields declare their input purpose       (AC-BUG-03)
#   AC12 - Product images have meaningful alt text
#   AC13 - Every page has its own title                      (AC-BUG-04)
#   AC14 - Responsive layout at desktop and mobile width  (= core case TC24)
#   AC15 - Reflow at 320 px wide without horizontal scrolling (3 pages)
#
# BUGS: scenarios tagged @known-defect @AC-BUG-xx FAIL while the bug
#   exists; the failure message explains it. Assertions are never weakened.
#   AC-BUG-01  No visible focus indicator on any control       (WCAG 2.4.7)
#   AC-BUG-02  Cart link is an <a> without href, Tab skips it  (WCAG 2.1.1)
#   AC-BUG-03  Checkout fields have no autocomplete purpose    (WCAG 1.3.5)
#   AC-BUG-04  Every page is titled "Swag Labs"                (WCAG 2.4.2)
#
# BROWSERS: WebKit (like Safari's default setting) does not move Tab focus
#   to links, so AC05 is skipped in WebKit with that reason.
#
# MANUAL ONLY (not automatable — run before sign-off):
#   - NVDA: errors are announced; product list and checkout reading order
#   - Colour Contrast Analyser: the 3 Products-page items axe marks
#     "incomplete" for color-contrast
#   - Browser zoom 200% and 400% (text resize and reflow on real zoom)
#   - Accessibility Insights for Web guided assessment (Login, Products,
#     Checkout)
# ══════════════════════════════════════════════════════════════════════

@accessibility
Feature: Accessibility
  As a shopper who uses a keyboard, a screen reader or a small screen
  I want to log in, shop and check out
  So that the shop works for me too

# ══════════════════════════════════════════════════════════════════════
# AUTOMATED SCAN
# ══════════════════════════════════════════════════════════════════════

  @AC01 @P1
  Scenario Outline: AC01 Axe-Strict - The <screen> screen has no WCAG 2.2 A/AA violations
    Given the "<screen>" screen is open
    When I scan the page with axe for WCAG 2.0, 2.1 and 2.2 A and AA rules
    Then the scan should find no WCAG violations

    Examples:
      | screen                          |
      | Login                           |
      | Login with error                |
      | Products                        |
      | Products with menu open         |
      | Product detail                  |
      | Cart with item                  |
      | Empty cart                      |
      | Checkout information            |
      | Checkout information with error |
      | Checkout overview               |
      | Checkout complete               |

  # Proves the scan is really checking the page: with a button that has no
  # name and an image with no alt text added, axe must report both.
  @AC02 @P1
  Scenario: AC02 Axe-PositiveControl - The scan detects known violations when they are added
    Given the "Login" screen is open
    When I add a button with no name and an image with no alt text to the page
    And I scan the page with axe for WCAG 2.0, 2.1 and 2.2 A and AA rules
    Then the scan should report the rules "button-name, image-alt"

# ══════════════════════════════════════════════════════════════════════
# KEYBOARD (WCAG 2.1.1)
# ══════════════════════════════════════════════════════════════════════

  @TC23 @AC03 @P1 @core
  Scenario: TC23 AC03 Keyboard-Login - A user can log in and add a product using only the keyboard
    Given I am on the login page
    When I log in as the "standard" user using only the keyboard
    Then the Products page should be displayed
    When I add "Sauce Labs Backpack" to the cart using only the keyboard
    Then the cart badge should show 1

  # The cart is opened with the mouse here because of AC-BUG-02 (see AC06).
  @AC04 @P1
  Scenario: AC04 Keyboard-Checkout - A user can check out from the cart page using only the keyboard
    Given I am logged in as the "standard" user
    And I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    When I start checkout using only the keyboard
    Then the checkout "information" step should be displayed
    When I enter valid checkout information and continue using only the keyboard
    Then the checkout "overview" step should be displayed
    When I finish the order using only the keyboard
    Then I should see the order confirmation "Thank you for your order!"

  @AC05 @P2
  Scenario: AC05 Keyboard-Menu - A user can open the menu and log out using only the keyboard
    Given keyboard focus can move to links in this browser
    And I am logged in as the "standard" user
    When I open the menu using only the keyboard
    And I choose "Logout" from the menu using only the keyboard
    Then the login page should be displayed

  # AC-BUG-02: the cart link is an <a> with no href or tabindex, so it cannot
  # take focus, Tab never reaches it and a keyboard user cannot open the cart.
  @AC06 @P1 @known-defect @AC-BUG-02
  Scenario: AC06 Keyboard-CartLink - The cart link can receive keyboard focus
    Given I am logged in as the "standard" user
    Then the cart link should be able to receive keyboard focus

# ══════════════════════════════════════════════════════════════════════
# VISIBLE FOCUS (WCAG 2.4.7)
# Pixels around each control are compared before and after Tab focus;
# screenshots are attached. An injected outline IS detected by the same
# comparison (positive control done when DEF-02 was first found).
# ══════════════════════════════════════════════════════════════════════

  # AC-BUG-01: no control shows a focus indicator (no outline, no style change).
  @AC07 @P1 @known-defect @AC-BUG-01
  Scenario Outline: AC07 Focus-Visible - Controls on the <screen> screen show a visible focus indicator
    Given the "<screen>" screen is open
    Then the controls "<controls>" should show a visible focus indicator when reached with Tab

    Examples:
      | screen               | controls                                    |
      | Login                | Username field, Password field, Login button |
      | Products             | Sort control, Add to cart button            |
      | Cart with item       | Continue Shopping button, Checkout button   |
      | Checkout information | First Name field, Continue button           |

# ══════════════════════════════════════════════════════════════════════
# NAMES, ANNOUNCEMENTS AND INPUT PURPOSE (WCAG 1.1.1, 1.3.5, 4.1.2, 4.1.3)
# ══════════════════════════════════════════════════════════════════════

  @AC08 @P2
  Scenario: AC08 Names-LoginForm - Login form controls have accessible names and errors are visible
    Given I am on the login page
    Then the login form controls should be found by their accessible names
    When I log in with username "" and password ""
    Then I should see the login error "Epic sadface: Username is required"

  @AC09 @P2
  Scenario: AC09 Names-ShopControls - Products and checkout controls have accessible names
    Given I am logged in as the "standard" user
    Then the sort control and menu button should be found by their accessible names
    And every product should have an "Add to cart" button
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    Then the checkout form controls should be found by their accessible names

  @AC10 @P1
  Scenario Outline: AC10 Announce-Errors - The <form> error is announced to screen readers
    Given the "<screen>" screen is open
    Then the error "<message>" should be in an alert region

    Examples:
      | form          | screen                          | message                            |
      | login         | Login with error                | Epic sadface: Username is required |
      | checkout      | Checkout information with error | Error: First Name is required      |

  # AC-BUG-03: no autocomplete attribute, so browsers and assistive tools
  # cannot tell what each field is for.
  @AC11 @P2 @known-defect @AC-BUG-03
  Scenario: AC11 InputPurpose-Checkout - Checkout fields declare their input purpose
    Given the "Checkout information" screen is open
    Then the checkout fields should declare the autocomplete purposes "given-name", "family-name" and "postal-code"

  @AC12 @P2
  Scenario: AC12 AltText-Products - Product images have alt text that names the product
    Given I am logged in as the "standard" user
    Then every product image should have the product name as its alt text
    When I open the product "Sauce Labs Backpack" by its name
    Then the product page image should have the alt text "Sauce Labs Backpack"

# ══════════════════════════════════════════════════════════════════════
# PAGE TITLES (WCAG 2.4.2)
# ══════════════════════════════════════════════════════════════════════

  # AC-BUG-04: every page is titled "Swag Labs", so a screen-reader user
  # cannot tell from the title which page they are on.
  @AC13 @P2 @known-defect @AC-BUG-04
  Scenario: AC13 PageTitle-Unique - Every page has its own title
    When I note the page title of the "Login" screen
    And I note the page title of the "Products" screen
    And I note the page title of the "Cart with item" screen
    And I note the page title of the "Checkout information" screen
    Then every noted page title should be different

# ══════════════════════════════════════════════════════════════════════
# RESPONSIVE AND REFLOW (WCAG 1.4.10)
# Viewport emulation in desktop engines, not real devices.
# ══════════════════════════════════════════════════════════════════════

  @TC24 @AC14 @P3 @core
  Scenario Outline: TC24 AC14 Responsive - Key controls are usable without horizontal scrolling at <device> width
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

  @AC15 @P2
  Scenario Outline: AC15 Reflow-320 - The <screen> screen fits 320 px without horizontal scrolling
    Given the browser viewport is 320 x 640 pixels
    And the "<screen>" screen is open
    Then the page should not scroll horizontally

    Examples:
      | screen               |
      | Products             |
      | Cart with item       |
      | Checkout information |
