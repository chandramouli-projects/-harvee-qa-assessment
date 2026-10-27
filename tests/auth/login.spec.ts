import { test, expect } from '../../fixtures/test-fixtures';
import { env } from '../../utils/environment';
import { INVALID_PASSWORD, MESSAGES, UNKNOWN_USERNAME } from '../../test-data/test-data';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('TC01 standard user logs in and reaches the Products page', async ({
    loginPage,
    productsPage,
    menu,
  }) => {
    await loginPage.login(env.users.standard, env.password);

    await productsPage.expectLoaded();
    await expect(productsPage.items, 'the catalogue should list products').not.toHaveCount(0);
    await expect(menu.openMenuButton).toBeVisible();
    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('TC02 locked-out user sees the lock-out error and cannot log in', async ({
    page,
    loginPage,
    productsPage,
  }) => {
    await loginPage.login(env.users.lockedOut, env.password);

    await expect(loginPage.errorMessage).toHaveText(MESSAGES.lockedOut);
    await loginPage.expectDisplayed();
    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(productsPage.title).toBeHidden();
  });

  const invalidCredentials = [
    { case: 'wrong password', username: env.users.standard, password: INVALID_PASSWORD },
    { case: 'unknown username', username: UNKNOWN_USERNAME, password: env.password },
  ];
  for (const credentials of invalidCredentials) {
    test(`TC03 login is rejected for ${credentials.case}`, async ({ page, loginPage }) => {
      await loginPage.login(credentials.username, credentials.password);

      await expect(loginPage.errorMessage).toHaveText(MESSAGES.invalidCredentials);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  const emptyFields = [
    { case: 'both fields empty', username: '', password: '', error: MESSAGES.usernameRequired },
    { case: 'username empty', username: '', password: 'any', error: MESSAGES.usernameRequired },
    { case: 'password empty', username: 'any', password: '', error: MESSAGES.passwordRequired },
  ];
  for (const fields of emptyFields) {
    test(`TC04 required-field validation when ${fields.case}`, async ({ page, loginPage }) => {
      await loginPage.login(fields.username, fields.password);

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toHaveText(fields.error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  test('TC25 performance_glitch_user can log in and reach the Products page', async ({
    loginPage,
    productsPage,
  }) => {
    // Functional tolerance check only - this is not a performance measurement.
    await loginPage.login(env.users.performanceGlitch, env.password);

    await productsPage.expectLoaded();
    await expect(productsPage.items).not.toHaveCount(0);
  });
});
