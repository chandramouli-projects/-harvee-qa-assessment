# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 06: Checkout                                               ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC12 [core] - Place an order with two products
#   TC13 [core] - Checkout without First Name
#   TC14 [core] - Checkout without Last Name
#   TC15 [core] - Checkout without Zip/Postal Code
#   TC16 [core] - Cancel on the "Your Information" page
#   TC17 [core] - Cancel on the "Overview" page
#   TC20 [core] - Typed values stay after an error
#   TC63 [ext ] - Names with special and international letters
#   TC64 [ext ] - Different zip / postal code formats
#   TC65 [ext ] - Close the checkout error and fix it
#   TC66 [ext ] - Payment and shipping details on the Overview
#   TC67 [ext ] - Refresh the Overview page
#   TC68 [ext ] - Browser Back from Overview
#   TC69 [ext ] - Checkout with all fields empty
#   TC70 [ext ] - Checkout with only spaces in all fields              (BUG-02)
#   TC71 [ext ] - Script text in First Name is treated as plain text
#   TC72 [ext ] - Open the Overview page with an empty cart            (BUG-03)
#   TC73 [ext ] - Checkout button with an empty cart                   (BUG-03)
#   TC74 [ext ] - Very long name values
#
# CHECKOUT STEPS: information → overview → complete
# TOTALS RULE   : Item total = sum of selected prices;
#                 Total = Item total + Tax, to the cent.
#                 The tax rate is not specified, so it is read, not assumed.
# ══════════════════════════════════════════════════════════════════════

@ui @checkout
Feature: Checkout
  As a shopper
  I want to pay for the products in my cart
  So that I receive my order at the correct price

  Background:
    Given I am logged in as the "standard" user

# ══════════════════════════════════════════════════════════════════════
# POSITIVE
# ══════════════════════════════════════════════════════════════════════

  @TC12 @smoke @P1 @core
  Scenario: TC12 Checkout-HappyPath - Completing checkout with two products charges item total plus tax and empties the cart
    When I add the products "Sauce Labs Backpack, Sauce Labs Bolt T-Shirt" to the cart
    Then the cart badge should show 2
    When I open the cart
    Then the Cart page should be displayed
    And the cart should contain exactly the selected products at their listed prices
    When I proceed to checkout
    Then the checkout "information" step should be displayed
    When I submit valid checkout information
    Then the checkout "overview" step should be displayed
    And the overview should list exactly the selected products at their listed prices
    And the order totals should equal the selected prices plus tax
    When I finish the order
    Then the checkout "complete" step should be displayed
    And I should see the order confirmation "Thank you for your order!"
    And the cart badge should be hidden
    When I go back home from the confirmation
    Then the Products page should be displayed
    And the cart badge should be hidden
    And no product should show a "Remove" button
    When I open the cart
    Then the cart should be empty

  @TC16 @P2 @core
  Scenario: TC16 Checkout-Cancel - Cancelling from the information step returns to the cart without placing an order
    When I add the product "Sauce Labs Fleece Jacket" to the cart
    And I open the cart
    And I proceed to checkout
    Then the checkout "information" step should be displayed
    When I cancel the checkout
    Then the Cart page should be displayed
    And the cart should contain exactly the selected products at their listed prices
    And the cart badge should show 1

  @TC17 @P2 @core
  Scenario: TC17 Checkout-Cancel - Cancelling from the overview step leaves the order unplaced and the cart intact
    When I add the products "Sauce Labs Backpack, Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed
    When I cancel the checkout
    Then no order confirmation should be displayed
    And the Products page should be displayed
    And the cart badge should show 2
    When I open the cart
    Then the cart should contain exactly the selected products at their listed prices

  @TC63 @P2 @extended
  Scenario Outline: TC63 Checkout-SpecialNames - The first name "<first_name>" is accepted
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with first name "<first_name>", last name "Customer" and postal code "12345"
    Then the checkout "overview" step should be displayed

    Examples:
      | first_name |
      | O'Brien    |
      | José       |
      | Anne-Marie |
      | 李         |

  # ASSUMPTION: any postal code format is accepted (no rule published; confirm with the product owner).
  @TC64 @P3 @extended
  Scenario Outline: TC64 Checkout-PostalFormats - The postal code "<postal_code>" is accepted
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with first name "Test", last name "Customer" and postal code "<postal_code>"
    Then the checkout "overview" step should be displayed

    Examples:
      | postal_code |
      | 12345-6789  |
      | SW1A 1AA    |
      | 560001      |

  @TC20 @P3 @core
  Scenario: TC20 Checkout-KeepValues - Typed names stay in the form after a validation error
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with first name "Test", last name "Customer" and postal code ""
    Then I should see the checkout error "Error: Postal Code is required"
    And the checkout fields should still show first name "Test" and last name "Customer"

  @TC65 @P3 @extended
  Scenario: TC65 Checkout-CloseError - The checkout error can be closed and the form completed
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with first name "", last name "Customer" and postal code "12345"
    Then I should see the checkout error "Error: First Name is required"
    When I close the checkout error
    And I enter "Test" as the first name and continue
    Then the checkout "overview" step should be displayed

  @TC66 @P3 @extended
  Scenario: TC66 Checkout-PaymentShipping - The Overview shows the payment and shipping details
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed
    And the overview should show the payment information "SauceCard #31337" and shipping information "Free Pony Express Delivery!"

  @TC67 @P2 @extended
  Scenario: TC67 Checkout-RefreshOverview - Refreshing the Overview keeps the same items and totals
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed
    When I note the order totals
    And I refresh the page
    Then the overview should list exactly the selected products at their listed prices
    And the order totals should be the same as noted

  # No rule says whether the typed details are kept; only the page is checked.
  @TC68 @P3 @extended
  Scenario: TC68 Checkout-BackFromOverview - Browser Back from the Overview returns to the information step
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit valid checkout information
    Then the checkout "overview" step should be displayed
    When I go back in the browser
    Then the checkout "information" step should be displayed

# ══════════════════════════════════════════════════════════════════════
# NEGATIVE
# ══════════════════════════════════════════════════════════════════════

  Scenario Outline: <id> Checkout-Validation - Checkout is blocked with the <field> error when <field> is missing
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    Then the checkout "information" step should be displayed
    When I submit checkout information with first name "<first_name>", last name "<last_name>" and postal code "<postal_code>"
    Then I should see the checkout error "<error>"
    And the checkout "information" step should be displayed

    @TC13 @P1 @core
    Examples: First name missing
      | id   | field      | first_name | last_name | postal_code | error                         |
      | TC13 | first name |            | Customer  | 12345       | Error: First Name is required |

    @TC14 @P1 @core
    Examples: Last name missing
      | id   | field     | first_name | last_name | postal_code | error                        |
      | TC14 | last name | Test       |           | 12345       | Error: Last Name is required |

    @TC15 @P1 @core
    Examples: Postal code missing
      | id   | field       | first_name | last_name | postal_code | error                          |
      | TC15 | postal code | Test       | Customer  |             | Error: Postal Code is required |

  @TC69 @P2 @extended
  Scenario: TC69 Checkout-AllEmpty - With every field empty the first name error is shown first
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with first name "", last name "" and postal code ""
    Then I should see the checkout error "Error: First Name is required"
    And the checkout "information" step should be displayed

  # ASSUMPTION: a name made of spaces is not valid (confirm with the product owner).
  # BUG-02: on 27-Oct-2026 spaces were accepted and the Overview opened, so this fails.
  @TC70 @P2 @known-defect @BUG-02 @extended
  Scenario: TC70 Checkout-SpacesOnly - Details made of spaces only are rejected
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with first name "   ", last name "   " and postal code "   "
    Then a checkout error should be displayed
    And the checkout "information" step should be displayed

  @TC71 @P2 @security @extended
  Scenario: TC71 Checkout-ScriptText - Script text in the first name is treated as plain text
    # Safe check only: no real attack is performed.
    Given I watch for browser pop-up dialogs
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with first name "<img src=x onerror=alert(1)>", last name "Customer" and postal code "12345"
    Then the checkout "overview" step should be displayed
    And no browser pop-up dialog should have appeared

  # ASSUMPTION: an empty order must not be possible (confirm with the product owner).
  # BUG-03: on 27-Oct-2026 the Overview showed Total $0.00 with a Finish button, so this fails.
  @TC72 @P2 @known-defect @BUG-03 @extended
  Scenario: TC72 Checkout-EmptyCartOverview - An order cannot be finished when the cart is empty
    When I navigate directly to "/checkout-step-two.html"
    Then it should not be possible to finish an order with an empty cart

  # BUG-03: on 27-Oct-2026 Checkout opened with an empty cart, so this fails.
  @TC73 @P2 @known-defect @BUG-03 @extended
  Scenario: TC73 Checkout-EmptyCartButton - Checkout is blocked when the cart is empty
    When I open the cart
    Then the cart should be empty
    When I proceed to checkout
    Then checkout should be blocked for an empty cart

# ══════════════════════════════════════════════════════════════════════
# BOUNDARY
# ══════════════════════════════════════════════════════════════════════

  # No length rule is published: the page must keep working (Overview or an error).
  @TC74 @P3 @extended
  Scenario: TC74 Checkout-LongValues - 255-character details do not break the checkout page
    When I add the product "Sauce Labs Onesie" to the cart
    And I open the cart
    And I proceed to checkout
    And I submit checkout information with 255-character values
    Then the checkout page should still work
