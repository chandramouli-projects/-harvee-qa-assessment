import { When, Then, logger } from '../../../core/support/base-step';
import { CUSTOMER } from '../../data/test-data';
import { CHECKOUT_STEPS, type CheckoutStep } from '../../pages';
import { expectSameLineItems, expectTotalsConsistent } from '../../support/assertions';
import { getSelectedItems } from '../../support/selection';

/** Steps for Checkout.feature and OrderTotals.feature. */

function toCheckoutStep(name: string): CheckoutStep {
  if (!(CHECKOUT_STEPS as string[]).includes(name)) {
    throw new Error(`Unknown checkout step "${name}". Use one of: ${CHECKOUT_STEPS.join(', ')}.`);
  }
  return name as CheckoutStep;
}

// ══════════════════════════════════════════════════════════════════════════════
// NAVIGATION THROUGH CHECKOUT
// ══════════════════════════════════════════════════════════════════════════════

When('I proceed to checkout', async ({ cartPage }) => {
  logger.info('>> [STEP] Proceed to checkout');
  await cartPage.checkout();
});

Then('the checkout {string} step should be displayed', async ({ checkoutPage }, step: string) => {
  await checkoutPage.expectStep(toCheckoutStep(step));
});

When('I submit valid checkout information', async ({ checkoutPage }) => {
  logger.info('>> [STEP] Submit checkout information (default customer)');
  await checkoutPage.submitInformation(CUSTOMER);
});

When(
  'I submit checkout information with first name {string}, last name {string} and postal code {string}',
  async ({ checkoutPage }, firstName: string, lastName: string, postalCode: string) => {
    logger.info('>> [STEP] Submit checkout information from the feature file');
    await checkoutPage.submitInformation({ firstName, lastName, postalCode });
  },
);

When('I cancel the checkout', async ({ checkoutPage }) => {
  logger.info('>> [STEP] Cancel checkout');
  await checkoutPage.cancel();
});

When('I finish the order', async ({ checkoutPage }) => {
  logger.info('>> [STEP] Finish the order');
  await checkoutPage.finish();
});

When('I go back home from the confirmation', async ({ checkoutPage }) => {
  await checkoutPage.backHome();
});

// ══════════════════════════════════════════════════════════════════════════════
// ASSERTIONS
// ══════════════════════════════════════════════════════════════════════════════

Then('I should see the checkout error {string}', async ({ checkoutPage }, message: string) => {
  logger.info(`>> [STEP] Expect checkout error: ${message}`);
  await checkoutPage.expectError(message);
});

Then(
  'the overview should list exactly the selected products at their listed prices',
  async ({ checkoutPage, testContext }) => {
    expectSameLineItems(
      await checkoutPage.getOverviewItems(),
      getSelectedItems(testContext),
      'overview items and prices',
    );
  },
);

/** Item total = sum of selected prices; Total = Item total + Tax (tax read from the page). */
Then(
  'the order totals should equal the selected prices plus tax',
  async ({ checkoutPage, testContext }) => {
    const totals = await checkoutPage.getTotals();
    logger.info(
      `>> [STEP] Totals (cents): item ${totals.subtotalCents}, tax ${totals.taxCents}, total ${totals.totalCents}`,
    );
    expectTotalsConsistent(getSelectedItems(testContext), totals);
  },
);

Then('I should see the order confirmation {string}', async ({ checkoutPage }, message: string) => {
  await checkoutPage.expectConfirmation(message);
});

Then('no order confirmation should be displayed', async ({ checkoutPage }) => {
  await checkoutPage.expectNoConfirmation();
});
