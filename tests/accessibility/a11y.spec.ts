import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { test, expect } from '../../fixtures/test-fixtures';
import { env } from '../../utils/environment';
import { MESSAGES, PRODUCTS } from '../../test-data/test-data';

// Automated scans catch only part of WCAG; screen-reader usability still needs a manual check.
async function scanForBlockingViolations(page: Page, testInfo: TestInfo, pageName: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  await testInfo.attach(`axe results - ${pageName}`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });
  for (const violation of results.violations) {
    testInfo.annotations.push({
      type: `axe ${violation.impact ?? 'unknown'}`,
      description: `${pageName}: ${violation.id} (${violation.nodes.length} node(s))`,
    });
  }
  return results.violations
    .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
    .map((violation) => `${violation.id}: ${violation.help}`);
}

test.describe('Accessibility', () => {
  test('TC20 login form controls have accessible names and errors are visible', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await expect(loginPage.usernameInput).toBeEditable();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await expect(loginPage.loginButton).toBeEnabled();

    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(MESSAGES.usernameRequired);
  });

  test('TC20 products and checkout controls have accessible names', async ({
    loggedInProductsPage: productsPage,
    menu,
    cartPage,
    checkoutPage,
  }) => {
    await expect(productsPage.sortSelect).toBeVisible();
    await expect(menu.openMenuButton).toBeVisible();
    const productCount = await productsPage.items.count();
    await expect(productsPage.items.getByRole('button', { name: 'Add to cart' })).toHaveCount(
      productCount,
    );

    await productsPage.addToCart(PRODUCTS.onesie);
    await menu.openCart();
    await cartPage.checkout();
    await expect(checkoutPage.firstNameInput).toBeEditable();
    await expect(checkoutPage.lastNameInput).toBeEditable();
    await expect(checkoutPage.postalCodeInput).toBeEditable();
    await expect(checkoutPage.continueButton).toBeEnabled();
  });

  test('TC20 axe scan finds no critical or serious WCAG A/AA violations on key pages', async ({
    page,
    loginPage,
    productsPage,
    menu,
    cartPage,
  }, testInfo) => {
    await loginPage.goto();
    const blocking = await scanForBlockingViolations(page, testInfo, 'Login');

    await loginPage.login(env.users.standard, env.password);
    await productsPage.expectLoaded();
    blocking.push(...(await scanForBlockingViolations(page, testInfo, 'Products')));

    await productsPage.addToCart(PRODUCTS.onesie);
    await menu.openCart();
    await cartPage.expectLoaded();
    blocking.push(...(await scanForBlockingViolations(page, testInfo, 'Cart')));

    expect(blocking, 'critical/serious axe violations (see attachments)').toEqual([]);
  });
});
