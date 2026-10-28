import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage';

/** A single product page (/inventory-item.html?id=N), including its "ITEM NOT FOUND" state. */
export class ProductDetailPage extends BasePage {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.removeButton = page.getByRole('button', { name: 'Remove' });
    this.backButton = page.getByRole('button', { name: 'Back to products' });
  }

  async expectLoaded(): Promise<void> {
    await this.expectUrl(/\/inventory-item\.html/);
    await expect(this.backButton).toBeVisible();
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await expect(this.removeButton).toBeVisible();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
    await expect(this.addToCartButton).toBeVisible();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
