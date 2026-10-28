import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage';
import type { LineItem } from '../support/assertions';
import { parseMoneyToCents } from '../support/money';

export class CartPage extends BasePage {
  readonly title: Locator;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('cart-list').getByTestId('inventory-item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async expectLoaded(): Promise<void> {
    await this.expectUrl(/\/cart\.html$/);
    await expect(this.title).toHaveText('Your Cart');
  }

  item(name: string): Locator {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  lineQuantity(name: string): Locator {
    return this.item(name).getByTestId('item-quantity');
  }

  lineDescription(name: string): Locator {
    return this.item(name).getByTestId('inventory-item-desc');
  }

  linePrice(name: string): Locator {
    return this.item(name).getByTestId('inventory-item-price');
  }

  lineRemoveButton(name: string): Locator {
    return this.item(name).getByRole('button', { name: 'Remove' });
  }

  async openItem(name: string): Promise<void> {
    await this.item(name).getByTestId('inventory-item-name').click();
  }

  async removeItem(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
    await expect(this.item(name)).toHaveCount(0);
  }

  /** Waits for the Cart page first, so the list is never read while the previous page is still shown. */
  async getLineItems(): Promise<LineItem[]> {
    await this.expectLoaded();
    return readLineItems(this.items);
  }

  async expectEmpty(): Promise<void> {
    await this.expectLoaded();
    await expect(this.items).toHaveCount(0);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}

/** Shared by the cart and checkout overview, which render line items with the same markup. */
export async function readLineItems(items: Locator): Promise<LineItem[]> {
  const names = await items.getByTestId('inventory-item-name').allInnerTexts();
  const prices = await items.getByTestId('inventory-item-price').allInnerTexts();
  expect(prices.length, 'every line item should show exactly one price').toBe(names.length);
  return names.map((name, index) => ({
    name: name.trim(),
    priceCents: parseMoneyToCents(prices[index] ?? ''),
  }));
}
