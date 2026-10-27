import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage';
import type { LineItem } from '../support/assertions';
import { parseMoneyToCents } from '../support/money';
import { SORT_LABELS, type SortOption } from '../data/test-data';

export class ProductsPage extends BasePage {
  readonly title: Locator;
  readonly sortSelect: Locator;
  readonly activeSortOption: Locator;
  readonly items: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.sortSelect = page.getByRole('combobox', { name: 'Sort products' });
    this.activeSortOption = page.getByTestId('active-option');
    this.items = page.getByTestId('inventory-item');
  }

  async expectLoaded(): Promise<void> {
    await this.expectUrl(/\/inventory\.html$/);
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

  /** Every "Remove" button on the page; there is one per product currently in the cart. */
  get removeButtons(): Locator {
    return this.items.getByRole('button', { name: 'Remove' });
  }

  get addToCartButtons(): Locator {
    return this.items.getByRole('button', { name: 'Add to cart' });
  }

  async addToCart(name: string): Promise<void> {
    await this.addToCartButton(name).click();
    await expect(this.removeButton(name)).toBeVisible();
  }

  /** Focus the product's button and press Enter, as a keyboard-only user would. */
  async addToCartWithKeyboard(name: string): Promise<void> {
    await this.addToCartButton(name).focus();
    await this.pressKey('Enter');
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

  /** Sorts and waits until the re-rendered list shows the chosen option. */
  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
    await expect(this.sortSelect).toHaveValue(option);
    // The label re-renders together with the list, so this waits for the re-sorted list.
    await expect(this.activeSortOption).toHaveText(SORT_LABELS[option]);
  }

  /**
   * Only selects the option, without waiting for the page to confirm it. Used where the page is
   * known to misbehave (problem_user), so the evidence is the product order, not a stuck dropdown.
   */
  async chooseSortOption(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
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
