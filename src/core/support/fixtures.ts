import { test as base } from 'playwright-bdd';
import { TestContext } from './test-context';
import { LoginPage, ProductsPage, CartPage, CheckoutPage, MenuComponent } from '../../test/pages';

interface Fixtures {
  testContext: TestContext;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  menu: MenuComponent;
}

/**
 * Scenario-scoped fixtures. Every scenario gets its own browser context and page (Playwright
 * default), so cookies and the localStorage cart never leak between scenarios. Steps receive
 * these by name: `When('...', async ({ productsPage, testContext }) => { ... })`.
 */
export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern -- Playwright requires an object pattern here.
  testContext: async ({}, use) => {
    await use(new TestContext());
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  menu: async ({ page }, use) => {
    await use(new MenuComponent(page));
  },
});
