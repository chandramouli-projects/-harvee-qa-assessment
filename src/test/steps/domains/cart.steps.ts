import { When, Then, expect, logger } from '../../../core/support/base-step';
import { expectSameLineItems } from '../../support/assertions';
import { getSelectedItems, removeSelectedItem } from '../../support/selection';
import { splitList } from '../../support/users';

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

/** Exactly these products show "Remove"; every other product shows "Add to cart". */
Then(
  'only the products {string} should show a "Remove" button',
  async ({ productsPage }, names: string) => {
    const expected = splitList(names);
    for (const name of expected) await expect(productsPage.removeButton(name)).toBeVisible();
    await expect(productsPage.removeButtons, 'no other product should show "Remove"').toHaveCount(
      expected.length,
    );
  },
);

Then(
  'the cart line for {string} should show quantity {int}, a description, price {string} and a "Remove" button',
  async ({ cartPage }, name: string, quantity: number, price: string) => {
    await cartPage.expectLoaded();
    await expect(cartPage.lineQuantity(name)).toHaveText(String(quantity));
    await expect(cartPage.lineDescription(name)).not.toBeEmpty();
    await expect(cartPage.linePrice(name)).toHaveText(price);
    await expect(cartPage.lineRemoveButton(name)).toBeVisible();
  },
);

Then('every cart line should have quantity {int}', async ({ cartPage }, quantity: number) => {
  await cartPage.expectLoaded();
  const quantities = await cartPage.items.getByTestId('item-quantity').allInnerTexts();
  expect(quantities.length, 'cart should not be empty').toBeGreaterThan(0);
  expect(
    quantities.every((q) => q.trim() === String(quantity)),
    `quantities: ${quantities.join(', ')}`,
  ).toBe(true);
});

When(
  'I open the product {string} from the cart',
  async ({ cartPage, productDetailPage }, name: string) => {
    logger.info(`>> [STEP] Open "${name}" from the cart`);
    await cartPage.openItem(name);
    await productDetailPage.expectLoaded();
  },
);
