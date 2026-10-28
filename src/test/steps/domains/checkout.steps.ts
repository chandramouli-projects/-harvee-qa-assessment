import { When, Then, expect, logger } from '../../../core/support/base-step';
import { CUSTOMER } from '../../data/test-data';
import { CHECKOUT_STEPS, type CheckoutStep } from '../../pages';
import {
  expectSameLineItems,
  expectTotalsConsistent,
  type OrderTotals,
} from '../../support/assertions';
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

/** For inputs whose exact message is not specified (e.g. spaces only): any validation error. */
Then('a checkout error should be displayed', async ({ checkoutPage }) => {
  await expect(checkoutPage.errorMessage, 'an error should block invalid details').toBeVisible();
});

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

// ══════════════════════════════════════════════════════════════════════════════
// INFORMATION FORM
// ══════════════════════════════════════════════════════════════════════════════

When(
  'I submit checkout information with {int}-character values',
  async ({ checkoutPage }, length: number) => {
    logger.info(`>> [STEP] Submit ${length}-character checkout values`);
    const text = 'a'.repeat(length);
    await checkoutPage.submitInformation({ firstName: text, lastName: text, postalCode: text });
  },
);

Then(
  'the checkout fields should still show first name {string} and last name {string}',
  async ({ checkoutPage }, firstName: string, lastName: string) => {
    await expect(checkoutPage.firstNameInput).toHaveValue(firstName);
    await expect(checkoutPage.lastNameInput).toHaveValue(lastName);
  },
);

When('I close the checkout error', async ({ checkoutPage }) => {
  logger.info('>> [STEP] Close the checkout error');
  await checkoutPage.closeError();
});

When(
  'I enter {string} as the first name and continue',
  async ({ checkoutPage }, firstName: string) => {
    await checkoutPage.firstNameInput.fill(firstName);
    await checkoutPage.continueButton.click();
  },
);

/** No length rule is published: the page must still work, showing either the Overview or an error. */
Then('the checkout page should still work', async ({ page, checkoutPage }) => {
  await expect(checkoutPage.title).toBeVisible();
  await expect(page).toHaveURL(/\/checkout-step-(one|two)\.html$/);
  logger.info(`>> [STEP] Long values led to: ${page.url()}`);
});

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════

Then(
  'the overview should show the payment information {string} and shipping information {string}',
  async ({ checkoutPage }, payment: string, shipping: string) => {
    await expect(checkoutPage.paymentInfo).toHaveText(payment);
    await expect(checkoutPage.shippingInfo).toHaveText(shipping);
  },
);

const NOTED_TOTALS = 'notedTotals';
const TAX_RATE = 'notedTaxRate';

When('I note the order totals', async ({ checkoutPage, testContext }) => {
  testContext.setValue<OrderTotals>(NOTED_TOTALS, await checkoutPage.getTotals());
});

Then('the order totals should be the same as noted', async ({ checkoutPage, testContext }) => {
  expect(await checkoutPage.getTotals(), 'totals after refresh').toEqual(
    testContext.getValue<OrderTotals>(NOTED_TOTALS),
  );
});

When('I note the tax rate on the overview', async ({ checkoutPage, testContext }) => {
  const totals = await checkoutPage.getTotals();
  const rate = totals.taxCents / totals.subtotalCents;
  logger.info(`>> [STEP] Tax rate seen: ${(rate * 100).toFixed(2)}%`);
  testContext.setValue<number>(TAX_RATE, rate);
});

/** The rate itself is not specified, so the noted rate is reused; tax is rounded, so 1 cent is allowed. */
Then(
  'the tax should use the same rate as noted, to within one cent',
  async ({ checkoutPage, testContext }) => {
    const totals = await checkoutPage.getTotals();
    const expectedTax = Math.round(totals.subtotalCents * testContext.getValue<number>(TAX_RATE));
    expect(
      Math.abs(totals.taxCents - expectedTax),
      `tax ${totals.taxCents}c should be about ${expectedTax}c (same rate as the first order)`,
    ).toBeLessThanOrEqual(1);
  },
);

Then('the overview should list no products', async ({ checkoutPage }) => {
  await checkoutPage.expectStep('overview');
  await expect(checkoutPage.items).toHaveCount(0);
});

Then(
  'it should not be possible to finish an order with an empty cart',
  async ({ checkoutPage }) => {
    await expect(
      checkoutPage.finishButton,
      'Finish must not be offered for an empty cart',
    ).toBeHidden();
  },
);

Then('checkout should be blocked for an empty cart', async ({ page }) => {
  await expect(page, 'checkout must not open with an empty cart').not.toHaveURL(
    /checkout-step-one\.html/,
  );
});
