import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../../core/base/BasePage';

/** The header shared by every signed-in page: burger menu plus cart link and badge. */
export class MenuComponent extends BasePage {
  readonly openMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.openMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async logout(): Promise<void> {
    await this.openMenuButton.click();
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
