import { When, Then, expect, logger } from '../../../core/support/base-step';
import { testConfig } from '../../../../config/testConfig';
import { resolvePlaceholders, splitList, usernameFor } from '../../support/users';

/** Steps unique to Authentication.feature. Login itself is in shared/common.steps.ts. */

Then('the product list should not be empty', async ({ productsPage }) => {
  await expect(productsPage.items, 'the catalogue should list products').not.toHaveCount(0);
});

Then('the menu button should be visible', async ({ menu }) => {
  await expect(menu.openMenuButton).toBeVisible();
});

Then('no login error should be displayed', async ({ loginPage }) => {
  await expect(loginPage.errorMessage).toBeHidden();
});

When('I log in as the {string} user by pressing Enter', async ({ loginPage }, role: string) => {
  logger.info(`>> [STEP] Log in as the "${role}" user with the Enter key`);
  await loginPage.loginWithEnter(usernameFor(role), testConfig.password);
});

When('I close the login error', async ({ loginPage }) => {
  logger.info('>> [STEP] Close the login error');
  await loginPage.closeError();
});

When(
  'I log in with a {int}-character username and password',
  async ({ loginPage }, length: number) => {
    logger.info(`>> [STEP] Log in with ${length}-character values`);
    const text = 'a'.repeat(length);
    await loginPage.login(text, text);
  },
);

Then(
  'the login fields should show the placeholders {string} and {string}',
  async ({ loginPage }, username: string, password: string) => {
    await expect(loginPage.usernameInput).toHaveAttribute('placeholder', username);
    await expect(loginPage.passwordInput).toHaveAttribute('placeholder', password);
  },
);

Then(
  'the login page should list the accepted usernames {string}',
  async ({ loginPage }, names: string) => {
    for (const name of splitList(resolvePlaceholders(names))) {
      await expect(
        loginPage.acceptedUsernames,
        `accepted usernames should include ${name}`,
      ).toContainText(name);
    }
  },
);

/** The hint is a heading plus a line of text, so line breaks are compared as single spaces. */
Then(
  'the login page should show the password hint {string}',
  async ({ loginPage }, hint: string) => {
    await expect(loginPage.passwordHint).toBeVisible();
    const shown = (await loginPage.passwordHint.innerText()).replace(/\s+/g, ' ').trim();
    expect(shown, 'password hint text').toBe(resolvePlaceholders(hint));
  },
);
