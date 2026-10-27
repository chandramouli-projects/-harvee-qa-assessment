import { Given, When, Then, expect, logger } from '../../../core/support/base-step';

/** Steps for SessionSecurity.feature. UI-level checks only, not server-side authorisation. */

/** A fresh scenario has its own browser context; prove it carries no Sauce Demo session cookie. */
Given('I have not logged in', async ({ context }) => {
  const cookies = await context.cookies();
  expect(
    cookies.map((cookie) => cookie.name),
    'a fresh browser context should have no session cookie',
  ).not.toContain('session-username');
});

When('I log out', async ({ menu }) => {
  logger.info('>> [STEP] Log out from the menu');
  await menu.logout();
});

When('I navigate directly to {string}', async ({ loginPage }, path: string) => {
  logger.info(`>> [STEP] Navigate directly to ${path}`);
  await loginPage.navigateTo(path);
});

Then('no products should be displayed', async ({ productsPage }) => {
  await expect(productsPage.title).toBeHidden();
  await expect(productsPage.items).toHaveCount(0);
});

Then('the cart link should not be visible', async ({ menu }) => {
  await expect(menu.cartLink).toBeHidden();
});
