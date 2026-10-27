import { expect, type Locator, type Page } from '@playwright/test';
import type { LineItem } from '../utils/assertions';
import { parseMoneyToCents } from '../utils/money';
import { SORT_LABELS, type SortOption } from '../test-data/test-data';

export class ProductsPage {
  readonly title: Locator;
  readonly sortSelect: Locator;
  readonly activeSortOption: Locator;
  readonly items: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.sortSelect = page.getByRole('combobox', { name: 'Sort products' });
    this.activeSortOption = page.getByTestId('active-option');
    this.items = page.getByTestId('inventory-item');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
    await expect(this.title).toHaveText('Products');
    await expect(this.items.first()).toBeVisible();
  }

  /** Product card matched by its exact name, so "Bolt T-Shirt" can never match "(Red) T-Shirt". */
  item(name: string): Locator {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  addToCartButton(name: string): Locator {
    return this.item(name).getByRole('button', { name: 'Add to cart' });
  }

  removeButton(name: string): Locator {
    return this.item(name).getByRole('button', { name: 'Remove' });
  }

  async addToCart(name: string): Promise<void> {
    await this.addToCartButton(name).click();
    await expect(this.removeButton(name)).toBeVisible();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.removeButton(name).click();
    await expect(this.addToCartButton(name)).toBeVisible();
  }

  /** Adds each product and returns the name/price shown on the Products page at selection time. */
  async addProductsToCart(names: readonly string[]): Promise<LineItem[]> {
    const selected: LineItem[] = [];
    for (const name of names) {
      selected.push({ name, priceCents: await this.getPriceOf(name) });
      await this.addToCart(name);
    }
    return selected;
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
    await expect(this.sortSelect).toHaveValue(option);
    // The label re-renders together with the list, so this waits for the re-sorted list.
    await expect(this.activeSortOption).toHaveText(SORT_LABELS[option]);
  }

  async getPriceOf(name: string): Promise<number> {
    return parseMoneyToCents(await this.item(name).getByTestId('inventory-item-price').innerText());
  }

  /** Every displayed product in display order. */
  async getProducts(): Promise<LineItem[]> {
    await expect(this.items.first()).toBeVisible();
    const names = await this.items.getByTestId('inventory-item-name').allInnerTexts();
    const prices = await this.items.getByTestId('inventory-item-price').allInnerTexts();
    expect(prices.length, 'every product should show exactly one price').toBe(names.length);
    return names.map((name, index) => ({
      name: name.trim(),
      priceCents: parseMoneyToCents(prices[index] ?? ''),
    }));
  }
}
