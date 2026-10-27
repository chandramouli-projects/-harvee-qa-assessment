import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/');
    await this.expectDisplayed();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Logs in with Tab / typing / Enter only, asserting focus lands on each field in order. */
  async loginWithKeyboard(username: string, password: string): Promise<void> {
    await this.pressKey('Tab');
    await expect(this.usernameInput).toBeFocused();
    await this.typeText(username);
    await this.pressKey('Tab');
    await expect(this.passwordInput).toBeFocused();
    await this.typeText(password);
    await this.pressKey('Enter');
  }

  /** The login form is shown (Sauce Demo may keep a protected URL in the address bar while doing so). */
  async expectDisplayed(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }

  /** Finding each control by role + accessible name proves the name exists; then check its state. */
  async expectControlsAccessible(): Promise<void> {
    await expect(this.usernameInput).toBeEditable();
    await expect(this.passwordInput).toBeEditable();
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
    await expect(this.loginButton).toBeEnabled();
  }
}
