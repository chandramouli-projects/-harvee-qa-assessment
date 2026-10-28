import { Given, When, Then, expect, logger } from '../../../core/support/base-step';
import { testConfig } from '../../../../config/testConfig';
import { resolvePlaceholders, splitList, usernameFor } from '../../support/users';
import { addSelectedItems } from '../../support/selection';

/**
 * Shared vocabulary used by more than one feature: login, page checks, cart badge and adding
 * products. Area-specific steps live in steps/domains/. Before adding a step, search here first.
 */

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════

Given('I am on the login page', async ({ loginPage }) => {
  logger.info('>> [STEP] Open the login page');
  await loginPage.goto();
});

/** Precondition used by most features: signed in, on Products, with an empty cart. */
Given(
  'I am logged in as the {string} user',
  async ({ loginPage, productsPage, menu }, role: string) => {
    logger.info(`>> [STEP] Log in as the "${role}" user`);
    await loginPage.goto();
    await loginPage.login(usernameFor(role), testConfig.password);
    await productsPage.expectLoaded();
    await menu.expectCartCount(0);
  },
);

When('I log in as the {string} user', async ({ loginPage }, role: string) => {
  logger.info(`>> [STEP] Submit login as the "${role}" user`);
  await loginPage.login(usernameFor(role), testConfig.password);
});

When(
  'I log in with username {string} and password {string}',
  async ({ loginPage }, username: string, password: string) => {
    logger.info('>> [STEP] Submit login with feature-supplied credentials');
    await loginPage.login(resolvePlaceholders(username), resolvePlaceholders(password));
  },
);

Then('I should see the login error {string}', async ({ loginPage }, message: string) => {
  logger.info(`>> [STEP] Expect login error: ${message}`);
  await loginPage.expectError(message);
});

Then('the login page should be displayed', async ({ loginPage }) => {
  await loginPage.expectDisplayed();
});

/** Stronger than "displayed": also proves the user did not get through to the Products page. */
Then('I should remain on the login page', async ({ loginPage, productsPage }) => {
  await loginPage.expectDisplayed();
  await loginPage.expectUrlNot(/inventory\.html/);
  await expect(productsPage.title).toBeHidden();
});

// ══════════════════════════════════════════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════════════════════════════════════════

Then('the Products page should be displayed', async ({ productsPage }) => {
  await productsPage.expectLoaded();
});

Then('the Cart page should be displayed', async ({ cartPage }) => {
  await cartPage.expectLoaded();
});

// ══════════════════════════════════════════════════════════════════════════════
// CART BADGE AND ADDING PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

Then('the cart badge should show {int}', async ({ menu }, count: number) => {
  logger.info(`>> [STEP] Expect cart badge: ${count}`);
  await menu.expectCartCount(count);
});

Then('the cart badge should be hidden', async ({ menu }) => {
  await menu.expectCartCount(0);
});

When('I open the cart', async ({ menu }) => {
  logger.info('>> [STEP] Open the cart');
  await menu.openCart();
});

When(
  'I add the product {string} to the cart',
  async ({ productsPage, testContext }, name: string) => {
    logger.info(`>> [STEP] Add to cart: ${name}`);
    addSelectedItems(testContext, await productsPage.addProductsToCart([name]));
  },
);

When(
  'I add the products {string} to the cart',
  async ({ productsPage, testContext }, names: string) => {
    const products = splitList(names);
    logger.info(`>> [STEP] Add ${products.length} products to cart: ${products.join(' | ')}`);
    addSelectedItems(testContext, await productsPage.addProductsToCart(products));
  },
);

// ══════════════════════════════════════════════════════════════════════════════
// BROWSER ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

When('I refresh the page', async ({ loginPage }) => {
  logger.info('>> [STEP] Refresh the page');
  await loginPage.reload();
});

When('I go back in the browser', async ({ loginPage }) => {
  logger.info('>> [STEP] Browser Back');
  await loginPage.goBack();
});

Then('the page URL should contain {string}', async ({ page }, text: string) => {
  await expect(page, `URL should contain "${text}"`).toHaveURL(
    new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
});

const DIALOGS = 'browserDialogs';

/** Records any alert/confirm/prompt the page opens, so a later step can prove none appeared. */
Given('I watch for browser pop-up dialogs', ({ page, testContext }) => {
  testContext.setValue<string[]>(DIALOGS, []);
  page.on('dialog', (dialog) => {
    testContext.getValue<string[]>(DIALOGS).push(dialog.message());
    void dialog.dismiss();
  });
});

Then('no browser pop-up dialog should have appeared', ({ testContext }) => {
  expect(
    testContext.getValue<string[]>(DIALOGS),
    'no pop-up should open (input must be plain text)',
  ).toEqual([]);
});
