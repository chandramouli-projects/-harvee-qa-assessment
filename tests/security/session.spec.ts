import { test, expect } from '../../fixtures/test-fixtures';
import { MESSAGES } from '../../test-data/test-data';

// These are UI-level session checks only. They do not prove server-side authorisation rules.
test.describe('Session handling', () => {
  test('TC22 after logout, direct navigation to /inventory.html does not show the Products page', async ({
    page,
    loggedInProductsPage: productsPage,
    loginPage,
    menu,
  }) => {
    await menu.logout();
    await loginPage.expectDisplayed();

    await page.goto('/inventory.html');

    await expect(loginPage.errorMessage).toHaveText(MESSAGES.protectedPage('/inventory.html'));
    await loginPage.expectDisplayed();
    await expect(productsPage.title).toBeHidden();
    await expect(productsPage.items).toHaveCount(0);
  });

  const protectedPaths = [
    '/cart.html',
    '/checkout-step-one.html',
    '/checkout-step-two.html',
    '/checkout-complete.html',
    '/inventory-item.html',
  ];
  for (const protectedPath of protectedPaths) {
    test(`TC24 unauthenticated deep link to ${protectedPath} shows the login page`, async ({
      page,
      loginPage,
      menu,
    }) => {
      await page.goto(
        protectedPath === '/inventory-item.html' ? `${protectedPath}?id=4` : protectedPath,
      );

      await expect(loginPage.errorMessage).toHaveText(MESSAGES.protectedPage(protectedPath));
      await loginPage.expectDisplayed();
      await expect(menu.cartLink).toBeHidden();
    });
  }
});
