import { test, expect } from '../../fixtures/test-fixtures';
import { expectSameLineItems, expectTotalsConsistent } from '../../utils/assertions';
import { CUSTOMER, MESSAGES, PRODUCTS } from '../../test-data/test-data';

test.describe('Checkout', () => {
  test('TC15 completing checkout with two products charges item total plus tax and empties the cart', async ({
    loggedInProductsPage: productsPage,
    menu,
    cartPage,
    checkoutPage,
  }) => {
    const selected = await productsPage.addProductsToCart([PRODUCTS.backpack, PRODUCTS.boltTShirt]);
    await menu.expectCartCount(2);

    await menu.openCart();
    await cartPage.expectLoaded();
    expectSameLineItems(await cartPage.getLineItems(), selected, 'cart items and prices');

    await cartPage.checkout();
    await checkoutPage.expectStep('information');
    await checkoutPage.submitInformation(CUSTOMER);

    await checkoutPage.expectStep('overview');
    expectSameLineItems(
      await checkoutPage.getOverviewItems(),
      selected,
      'overview items and prices',
    );
    expectTotalsConsistent(selected, await checkoutPage.getTotals());

    await checkoutPage.finish();
    await checkoutPage.expectStep('complete');
    await expect(checkoutPage.completeHeader).toHaveText(MESSAGES.orderComplete);
    await menu.expectCartCount(0);

    await checkoutPage.backHome();
    await productsPage.expectLoaded();
    await menu.expectCartCount(0);
    await expect(productsPage.items.getByRole('button', { name: 'Remove' })).toHaveCount(0);
    await menu.openCart();
    await expect(cartPage.items).toHaveCount(0);
  });

  const missingFieldCases = [
    {
      id: 'TC12',
      field: 'first name',
      customer: { ...CUSTOMER, firstName: '' },
      error: MESSAGES.firstNameRequired,
    },
    {
      id: 'TC13',
      field: 'last name',
      customer: { ...CUSTOMER, lastName: '' },
      error: MESSAGES.lastNameRequired,
    },
    {
      id: 'TC14',
      field: 'postal code',
      customer: { ...CUSTOMER, postalCode: '' },
      error: MESSAGES.postalCodeRequired,
    },
  ];
  for (const missing of missingFieldCases) {
    test(`${missing.id} checkout is blocked with the ${missing.field} error when ${missing.field} is missing`, async ({
      loggedInProductsPage: productsPage,
      menu,
      cartPage,
      checkoutPage,
    }) => {
      await productsPage.addToCart(PRODUCTS.onesie);
      await menu.openCart();
      await cartPage.checkout();
      await checkoutPage.expectStep('information');

      await checkoutPage.submitInformation(missing.customer);

      await expect(checkoutPage.errorMessage).toBeVisible();
      await expect(checkoutPage.errorMessage).toHaveText(missing.error);
      await checkoutPage.expectStep('information');
    });
  }

  test('TC17 cancelling from the information step returns to the cart without placing an order', async ({
    loggedInProductsPage: productsPage,
    menu,
    cartPage,
    checkoutPage,
  }) => {
    const selected = await productsPage.addProductsToCart([PRODUCTS.fleeceJacket]);
    await menu.openCart();
    await cartPage.checkout();
    await checkoutPage.expectStep('information');

    await checkoutPage.cancelButton.click();

    await cartPage.expectLoaded();
    expectSameLineItems(await cartPage.getLineItems(), selected, 'cart is retained after cancel');
    await menu.expectCartCount(1);
  });

  test('TC17 cancelling from the overview step leaves the order unplaced and the cart intact', async ({
    page,
    loggedInProductsPage: productsPage,
    menu,
    cartPage,
    checkoutPage,
  }) => {
    const selected = await productsPage.addProductsToCart([PRODUCTS.backpack, PRODUCTS.onesie]);
    await menu.openCart();
    await cartPage.checkout();
    await checkoutPage.submitInformation(CUSTOMER);
    await checkoutPage.expectStep('overview');

    await checkoutPage.cancelButton.click();

    await expect(page).not.toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toBeHidden();
    await productsPage.expectLoaded();
    await menu.expectCartCount(2);
    await menu.openCart();
    expectSameLineItems(await cartPage.getLineItems(), selected, 'cart is retained after cancel');
  });
});
