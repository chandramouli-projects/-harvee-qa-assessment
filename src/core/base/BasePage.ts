import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Base class for every Page Object and component.
 *
 * Holds the scenario's Playwright `page` (injected by the fixtures in fixtures.ts) and the small
 * set of page-level helpers shared across pages. Element-level work stays in the page objects,
 * using role / label / `data-test` locators and web-first assertions.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  // ================== Navigation ==================

  /** Navigate to a path relative to BASE_URL (e.g. "/inventory.html"). */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async expectUrl(pattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async expectUrlNot(pattern: RegExp): Promise<void> {
    await expect(this.page).not.toHaveURL(pattern);
  }

  /** Browser refresh (F5). */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /** Browser Back button. */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  // ================== Layout ==================

  async setViewportSize(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  /** True when the document is wider than the viewport, i.e. the user must scroll sideways. */
  async hasHorizontalOverflow(): Promise<boolean> {
    return this.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
  }

  // ================== Keyboard ==================

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async typeText(text: string): Promise<void> {
    await this.page.keyboard.type(text);
  }

  /** Presses Tab until the locator has focus (max `maxPresses`), so :focus-visible styling applies. */
  async tabTo(locator: Locator, maxPresses = 10): Promise<void> {
    for (let presses = 0; presses < maxPresses; presses++) {
      if (await locator.evaluate((element) => element === document.activeElement)) return;
      await this.pressKey('Tab');
    }
    await expect(locator, 'element should be reachable with Tab').toBeFocused({ timeout: 1_000 });
  }
}
