# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 03: Product Catalogue Sorting                              ║
# ║   Test cases   : manual_test_cases/SauceDemo_Functional_Test_Cases   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# TEST CASES COVERED (Excel ID - title):
#   TC05 [core] - Sort by "Name (A to Z)"
#   TC06 [core] - Sort by "Name (Z to A)"
#   TC07 [core] - Sort by "Price (low to high)"
#   TC08 [core] - Sort by "Price (high to low)"
#   TC25 [core] - Sort by "Price (low to high)" as problem_user        (BUG-01)
#   TC47 [ext ] - Added products keep "Remove" after sorting
#   TC48 [ext ] - Change sort many times
#
# RULE: the WHOLE list must be ordered — every adjacent pair is checked,
#       not just the first item. Equal prices (two products at $15.99)
#       may appear in either order.
# START: each case first applies the opposite sort, so the target sort
#        must actively re-order the list ("Name (A to Z)" is the default).
# BUGS: scenarios tagged @BUG-xx fail on purpose while the bug exists;
#       the failure message explains the bug (see the Bugs tab in Excel).
# ══════════════════════════════════════════════════════════════════════

@ui @catalogue
Feature: Product catalogue sorting
  As a shopper comparing products
  I want to sort the catalogue by name or price
  So that I can find what I want quickly

  Scenario Outline: <id> Sorting - "<sort>" orders the entire product list
    Given I am logged in as the "standard" user
    And I note the full product catalogue
    And the products are sorted by "<start_from>"
    When I sort the products by "<sort>"
    Then the product <key> should be in <direction> order
    And the catalogue should contain the same products and prices as before sorting
    And the sort dropdown should show "<sort>"

    @TC05 @P2 @core
    Examples: Name ascending
      | id   | sort          | start_from    | key   | direction |
      | TC05 | Name (A to Z) | Name (Z to A) | names | ascending |

    @TC07 @smoke @P1 @core
    Examples: Price ascending
      | id   | sort                | start_from          | key    | direction |
      | TC07 | Price (low to high) | Price (high to low) | prices | ascending |

    @TC08 @P2 @core
    Examples: Price descending
      | id   | sort                | start_from          | key    | direction  |
      | TC08 | Price (high to low) | Price (low to high) | prices | descending |

    @TC06 @P2 @core
    Examples: Name descending
      | id   | sort          | start_from    | key   | direction  |
      | TC06 | Name (Z to A) | Name (A to Z) | names | descending |

  # BUG-01: sorting has no effect for problem_user (the dropdown goes back to
  # "Name (A to Z)"), so this scenario fails until the bug is fixed.
  @TC25 @P1 @regression @known-defect @BUG-01 @core
  Scenario: TC25 Sorting-ProblemUser - "Price (low to high)" orders the entire product list for problem_user
    Given I am logged in as the "problem" user
    When I choose the sort option "Price (low to high)"
    Then the product prices should be in ascending order

  @TC47 @P2 @extended
  Scenario: TC47 Sorting-KeepsCartState - Products in the cart still show "Remove" after sorting
    Given I am logged in as the "standard" user
    When I add the products "Sauce Labs Backpack, Sauce Labs Onesie" to the cart
    Then the cart badge should show 2
    When I sort the products by "Price (high to low)"
    Then only the products "Sauce Labs Backpack, Sauce Labs Onesie" should show a "Remove" button
    And the cart badge should show 2

  @TC48 @P3 @extended
  Scenario: TC48 Sorting-ManyChanges - Every sort is correct when the sort is changed many times
    Given I am logged in as the "standard" user
    And I note the full product catalogue
    When I sort the products by "Name (Z to A)"
    Then the product names should be in descending order
    When I sort the products by "Price (low to high)"
    Then the product prices should be in ascending order
    When I sort the products by "Price (high to low)"
    Then the product prices should be in descending order
    When I sort the products by "Name (A to Z)"
    Then the product names should be in ascending order
    And the catalogue should contain the same products and prices as before sorting
