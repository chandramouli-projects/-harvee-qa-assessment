import { When, Then, expect, logger } from '../../../core/support/base-step';
import { splitList } from '../../support/users';

/** Steps for Navigation.feature: the burger menu. */

When('I open the menu', async ({ menu }) => {
  logger.info('>> [STEP] Open the menu');
  await menu.openMenu();
});

When('I close the menu', async ({ menu }) => {
  logger.info('>> [STEP] Close the menu');
  await menu.closeMenu();
});

Then('the menu should show {string}', async ({ menu }, items: string) => {
  await expect(menu.menuItems).toHaveText(splitList(items));
});

Then('the menu should be closed', async ({ menu }) => {
  await expect(menu.menuPanel).toBeHidden();
});

When('I choose {string} from the menu', async ({ menu }, item: string) => {
  logger.info(`>> [STEP] Menu > ${item}`);
  await menu.chooseFromMenu(item);
});

Then('the "About" menu link should open {string}', async ({ menu }, url: string) => {
  // The external site itself is out of scope: check where the link goes, not the third-party page.
  await expect(menu.aboutLink).toHaveAttribute('href', url);
});
