import { Then, expect } from '../../../core/support/base-step';

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
