import { test } from '../../fixtures/test-fixtures';
import { env } from '../../utils/environment';
import { compareNumbers, expectSorted } from '../../utils/assertions';

// Known defect DEF-01 (found by the EX-01 problem_user charter): sorting has no effect for
// problem_user. test.fail() keeps the full assertion and records an "expected failure";
// if the defect is ever fixed, this test will be reported as unexpectedly passing.
test.describe('problem_user known defects', () => {
  test('TC06 [problem_user] "Price (low to high)" orders the entire product list', async ({
    loginPage,
    productsPage,
  }) => {
    test.info().annotations.push({
      type: 'known defect',
      description: 'DEF-01: product sorting has no effect for problem_user',
    });
    test.fail(true, 'DEF-01: product sorting has no effect for problem_user');

    await loginPage.goto();
    await loginPage.login(env.users.problem, env.password);
    await productsPage.expectLoaded();
    // selectOption directly: ProductsPage.sortBy() would stop early because the dropdown itself
    // reverts for problem_user, and we want the evidence to be the product order.
    await productsPage.sortSelect.selectOption('lohi');

    const prices = (await productsPage.getProducts()).map((product) => product.priceCents / 100);
    expectSorted(prices, compareNumbers, 'ascending', 'problem_user product prices');
  });
});
