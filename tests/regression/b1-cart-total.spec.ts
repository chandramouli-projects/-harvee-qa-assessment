import { test, expect } from '../../fixtures/test-fixtures';
import { expectSameLineItems, expectTotalsConsistent } from '../../utils/assertions';
import { CUSTOMER, MESSAGES, PRODUCTS } from '../../test-data/test-data';

// Section B1: the reviewed AI-generated cart-total test, rewritten on this framework and
// parameterised over several baskets so the subtotal + tax = total rule is not checked on one case.
const BASKETS = [
  { case: 'one product', products: [PRODUCTS.onesie] },
  { case: 'two products', products: [PRODUCTS.backpack, PRODUCTS.bikeLight] },
  { case: 'all six products', products: Object.values(PRODUCTS) },
];

test.describe('Cart total regression (B1 rewrite)', () => {
  for (const basket of BASKETS) {
    test(`TC16 order total equals item total plus tax for ${basket.case}`, async ({
      loggedInProductsPage: productsPage,
      menu,
      cartPage,
      checkoutPage,
    }) => {
      const selected = await productsPage.addProductsToCart(basket.products);
      await menu.expectCartCount(selected.length);

      await menu.openCart();
      await cartPage.expectLoaded();
      expectSameLineItems(await cartPage.getLineItems(), selected, 'cart items and prices');
      await cartPage.checkout();
      await checkoutPage.submitInformation(CUSTOMER);
      await checkoutPage.expectStep('overview');

      expectSameLineItems(await checkoutPage.getOverviewItems(), selected, 'overview items');
      expectTotalsConsistent(selected, await checkoutPage.getTotals());

      await checkoutPage.finish();
      await expect(checkoutPage.completeHeader).toHaveText(MESSAGES.orderComplete);
      await checkoutPage.backHome();
      await productsPage.expectLoaded();
      await menu.expectCartCount(0);
    });
  }
});
