import { When, Then, expect, logger } from '../../../core/support/base-step';
import { expectSameLineItems } from '../../support/assertions';
import { getSelectedItems, removeSelectedItem } from '../../support/selection';

/** Steps for Cart.feature (also reused by Checkout and OrderTotals). */

When(
  'I remove {string} from the cart on the Products page',
  async ({ productsPage, testContext }, name: string) => {
    logger.info(`>> [STEP] Remove on Products page: ${name}`);
    await productsPage.removeFromCart(name);
    removeSelectedItem(testContext, name);
  },
);

When('I remove {string} on the Cart page', async ({ cartPage, testContext }, name: string) => {
  logger.info(`>> [STEP] Remove on Cart page: ${name}`);
  await cartPage.removeItem(name);
  removeSelectedItem(testContext, name);
});

When('I continue shopping', async ({ cartPage }) => {
  await cartPage.continueShopping();
});

Then(
  'the cart should contain exactly the selected products at their listed prices',
  async ({ cartPage, testContext }) => {
    const selected = getSelectedItems(testContext);
    expectSameLineItems(
      await cartPage.getLineItems(),
      selected,
      `cart should contain exactly: ${selected.map((item) => item.name).join(', ')}`,
    );
  },
);

Then('the cart should be empty', async ({ cartPage }) => {
  await cartPage.expectEmpty();
});

Then('no product should show a {string} button', async ({ productsPage }, label: string) => {
  if (label !== 'Remove') throw new Error(`Only the "Remove" button is supported, got "${label}".`);
  await expect(productsPage.removeButtons).toHaveCount(0);
});
