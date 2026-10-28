// B1 rewrite as a plain Playwright test, without the Gherkin layer. Same page objects and checks as
// src/test/features/UI/OrderTotals.feature. Run: npm run test:b1-plain
import { test, expect } from '@playwright/test';
import { testConfig } from '../../config/testConfig';
import {
  LoginPage,
  ProductsPage,
  CartPage,
  CheckoutPage,
  MenuComponent,
} from '../../src/test/pages';
import { CUSTOMER } from '../../src/test/data/test-data';
import { expectSameLineItems, expectTotalsConsistent } from '../../src/test/support/assertions';

const BASKETS = [
  { id: 'TC75', basket: 'one product', products: ['Sauce Labs Onesie'] },
  {
    id: 'TC76',
    basket: 'two products',
    products: ['Sauce Labs Backpack', 'Sauce Labs Bike Light'],
  },
];

for (const { id, basket, products } of BASKETS) {
  test(`${id} order total equals item total plus tax for ${basket}`, async ({ page }) => {
    const login = new LoginPage(page);
    const shop = new ProductsPage(page);
    const header = new MenuComponent(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await login.goto();
    await login.login(testConfig.users.standard, testConfig.password);
    await shop.expectLoaded();

    const selected = await shop.addProductsToCart(products); // name + price at the moment of adding
    await header.expectCartCount(products.length);

    await header.openCart();
    expectSameLineItems(await cart.getLineItems(), selected, 'cart contents');
    await cart.checkout();
    await checkout.submitInformation(CUSTOMER);

    expectSameLineItems(await checkout.getOverviewItems(), selected, 'overview items');
    expectTotalsConsistent(selected, await checkout.getTotals()); // item total = sum; total = item total + tax

    await checkout.finish();
    await checkout.expectConfirmation('Thank you for your order!');
    await checkout.backHome();
    await header.expectCartCount(0);
    expect(page.url()).toContain('/inventory.html');
  });
}
