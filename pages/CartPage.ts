import { expect, type Locator, type Page } from '@playwright/test';
import type { LineItem } from '../utils/assertions';
import { parseMoneyToCents } from '../utils/money';

export class CartPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('cart-list').getByTestId('inventory-item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/cart\.html$/);
    await expect(this.title).toHaveText('Your Cart');
  }

  item(name: string): Locator {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async removeItem(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
    await expect(this.item(name)).toHaveCount(0);
  }

  async getLineItems(): Promise<LineItem[]> {
    return readLineItems(this.items);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
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
