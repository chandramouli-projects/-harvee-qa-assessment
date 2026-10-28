import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../../core/base/BasePage';

/** The header shared by every signed-in page: burger menu plus cart link and badge. */
export class MenuComponent extends BasePage {
  readonly openMenuButton: Locator;
  readonly closeMenuButton: Locator;
  /** The menu panel. Role queries skip aria-hidden elements, so this only matches when the menu is open. */
  readonly menuPanel: Locator;
  readonly menuItems: Locator;
  readonly logoutLink: Locator;
  readonly aboutLink: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.openMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeMenuButton = page.getByRole('button', { name: 'Close Menu' });
    this.menuPanel = page.getByRole('navigation');
    this.menuItems = this.menuPanel.locator('a');
    this.logoutLink = this.menuPanel.getByRole('button', { name: 'Logout' });
    this.aboutLink = page.getByTestId('about-sidebar-link');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  /** A menu entry by its visible text, e.g. "All Items" or "Reset App State". */
  menuItem(text: string): Locator {
    return this.menuPanel.getByText(text, { exact: true });
  }

  /**
   * Opens the menu. Under parallel load Firefox and WebKit sometimes ignore the first click
   * (see docs/known-limitations.md); like a user, click again only while the menu is still closed.
   */
  async openMenu(): Promise<void> {
    await expect(async () => {
      if ((await this.menuPanel.count()) === 0) await this.openMenuButton.click();
      await expect(this.menuPanel).toBeVisible({ timeout: 2_000 });
    }, 'the menu should open').toPass({ timeout: 10_000 });
  }

  async closeMenu(): Promise<void> {
    await this.closeMenuButton.click();
    await expect(this.menuPanel).toBeHidden();
  }

  async chooseFromMenu(text: string): Promise<void> {
    await this.openMenu();
    await this.menuItem(text).click();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  /** An empty cart shows no badge at all; otherwise the badge shows the item count. */
  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(
        this.cartBadge,
        'cart badge should be hidden when the cart is empty',
      ).toBeHidden();
    } else {
      await expect(this.cartBadge, `cart badge should show ${count}`).toHaveText(String(count));
    }
  }
}
