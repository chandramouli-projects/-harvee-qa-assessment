import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { MenuComponent } from '../pages/MenuComponent';
import { env } from '../utils/environment';

interface Fixtures {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  menu: MenuComponent;
  /** Signed in as standard_user in a fresh browser context, on the Products page with an empty cart. */
  loggedInProductsPage: ProductsPage;
}

// Each test gets its own browser context, so cookies and the localStorage cart never leak between tests.
export const test = base.extend<Fixtures>({
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
  loggedInProductsPage: async ({ loginPage, productsPage, menu }, use) => {
    await loginPage.goto();
    await loginPage.login(env.users.standard, env.password);
    await productsPage.expectLoaded();
    await menu.expectCartCount(0);
    await use(productsPage);
  },
});

export { expect };
