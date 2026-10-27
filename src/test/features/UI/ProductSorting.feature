# ╔══════════════════════════════════════════════════════════════════════╗
# ║   FEATURE 02: Product Catalogue Sorting                              ║
# ║   Manual cases : TC05, TC06, TC07, TC08  (+ DEF-01 for problem_user) ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# RULE: the WHOLE list must be ordered — every adjacent pair is checked,
#       not just the first item. Equal prices (two products at $15.99)
#       may appear in either order.
# START: each case first applies the opposite sort, so the target sort
#        must actively re-order the list ("Name (A to Z)" is the default).
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

    @TC05 @P2
    Examples: Name ascending
      | id   | sort          | start_from    | key   | direction |
      | TC05 | Name (A to Z) | Name (Z to A) | names | ascending |

    @TC06 @smoke @P1
    Examples: Price ascending
      | id   | sort                | start_from          | key    | direction |
      | TC06 | Price (low to high) | Price (high to low) | prices | ascending |

    @TC07 @P2
    Examples: Price descending
      | id   | sort                | start_from          | key    | direction  |
      | TC07 | Price (high to low) | Price (low to high) | prices | descending |

    @TC08 @P2
    Examples: Name descending
      | id   | sort          | start_from    | key   | direction  |
      | TC08 | Name (Z to A) | Name (A to Z) | names | descending |

# ══════════════════════════════════════════════════════════════════════
# KNOWN DEFECT DEF-01 (found by the EX-01 problem_user charter)
# @fail = Playwright test.fail(): the FULL assertion still runs and the
# result is an "expected failure". If the defect is fixed, the scenario
# is reported as an unexpected pass so the tag is removed.
# ══════════════════════════════════════════════════════════════════════

  @TC06 @regression @known-defect @DEF-01 @fail
  Scenario: TC06 Sorting-ProblemUser - "Price (low to high)" orders the entire product list for problem_user
    Given I am logged in as the "problem" user
    When I choose the sort option "Price (low to high)"
    Then the product prices should be in ascending order
