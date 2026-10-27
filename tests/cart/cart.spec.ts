import { test, expect } from '../../fixtures/test-fixtures';
import { expectSameLineItems } from '../../utils/assertions';
import { PRODUCTS } from '../../test-data/test-data';

test.describe('Cart', () => {
  test('TC09 badge tracks adding two products and removing one from the Products page', async ({
    loggedInProductsPage: productsPage,
    menu,
    cartPage,
  }) => {
    const [removed, kept] = await productsPage.addProductsToCart([
      PRODUCTS.backpack,
      PRODUCTS.bikeLight,
    ]);
    await menu.expectCartCount(2);

    await productsPage.removeFromCart(PRODUCTS.backpack);
    await menu.expectCartCount(1);

    await menu.openCart();
    await cartPage.expectLoaded();
    expectSameLineItems(
      await cartPage.getLineItems(),
      [kept!],
      `cart should contain only ${kept!.name}, not ${removed!.name}`,
    );
  });

  test('TC10 removing products on the Cart page updates contents and badge', async ({
    loggedInProductsPage: productsPage,
    menu,
    cartPage,
  }) => {
    const [first, second] = await productsPage.addProductsToCart([
      PRODUCTS.boltTShirt,
      PRODUCTS.onesie,
    ]);
    await menu.openCart();
    await cartPage.expectLoaded();
    expectSameLineItems(await cartPage.getLineItems(), [first!, second!], 'cart before removal');

    await cartPage.removeItem(first!.name);
    await menu.expectCartCount(1);
    expectSameLineItems(await cartPage.getLineItems(), [second!], 'cart after first removal');

    await cartPage.removeItem(second!.name);
    await menu.expectCartCount(0);
    await expect(cartPage.items).toHaveCount(0);
  });

  test('TC11 a new session starts with an empty cart and Continue Shopping returns to Products', async ({
    loggedInProductsPage: productsPage,
    menu,
    cartPage,
  }) => {
    await menu.expectCartCount(0);
    await expect(productsPage.items.getByRole('button', { name: 'Remove' })).toHaveCount(0);

    await menu.openCart();
    await cartPage.expectLoaded();
    await expect(cartPage.items).toHaveCount(0);

    await cartPage.continueShoppingButton.click();
    await productsPage.expectLoaded();
    await menu.expectCartCount(0);
  });
});
