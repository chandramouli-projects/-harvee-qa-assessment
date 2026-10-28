import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage';
import type { LineItem, OrderTotals } from '../support/assertions';
import { parseMoneyToCents } from '../support/money';
import type { Customer } from '../data/test-data';
import { readLineItems } from './CartPage';

export type CheckoutStep = 'information' | 'overview' | 'complete';

const STEPS: Record<CheckoutStep, { url: RegExp; title: string }> = {
  information: { url: /\/checkout-step-one\.html$/, title: 'Checkout: Your Information' },
  overview: { url: /\/checkout-step-two\.html$/, title: 'Checkout: Overview' },
  complete: { url: /\/checkout-complete\.html$/, title: 'Checkout: Complete!' },
};

export const CHECKOUT_STEPS = Object.keys(STEPS) as CheckoutStep[];

/** Covers the three checkout steps: information form, overview and confirmation. */
export class CheckoutPage extends BasePage {
  readonly title: Locator;
  // Step one - information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;
  // Step two - overview
  readonly items: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  // Complete
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly ponyImage: Locator;
  readonly backHomeButton: Locator;
  readonly generatePdfButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.postalCodeInput = page.getByRole('textbox', { name: 'Zip/Postal Code' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.errorMessage = page.getByTestId('error');
    this.errorCloseButton = page.getByTestId('error-button');
    this.items = page.getByTestId('cart-list').getByTestId('inventory-item');
    this.paymentInfo = page.getByTestId('payment-info-value');
    this.shippingInfo = page.getByTestId('shipping-info-value');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.ponyImage = page.getByRole('img', { name: 'Pony Express' });
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
    this.generatePdfButton = page.getByRole('button', { name: 'Generate PDF order' });
  }

  async closeError(): Promise<void> {
    await this.errorCloseButton.click();
    await expect(this.errorMessage).toBeHidden();
  }

  async doubleClickFinish(): Promise<void> {
    await this.finishButton.dblclick();
  }

  async expectStep(step: CheckoutStep): Promise<void> {
    await this.expectUrl(STEPS[step].url);
    await expect(this.title).toHaveText(STEPS[step].title);
  }

  /**
   * Waits for the information step, types each value (typing again if WebKit dropped it while the
   * form was still mounting — see docs/known-limitations.md), then asserts that every value stuck.
   * A field that keeps losing its value (e.g. the problem_user bug) still fails with a clear message.
   */
  async fillInformation(customer: Customer): Promise<void> {
    await this.expectStep('information');
    const fields: [string, Locator, string][] = [
      ['first name', this.firstNameInput, customer.firstName],
      ['last name', this.lastNameInput, customer.lastName],
      ['postal code', this.postalCodeInput, customer.postalCode],
    ];
    for (const [label, input, value] of fields) {
      await expect(async () => {
        if ((await input.inputValue()) !== value) await input.fill(value);
        await expect(input).toHaveValue(value, { timeout: 1_000 });
      }, `${label} should keep the typed value`).toPass({ timeout: 5_000 });
    }
    await expect(this.firstNameInput, 'first name should keep the typed value').toHaveValue(
      customer.firstName,
    );
    await expect(this.lastNameInput, 'last name should keep the typed value').toHaveValue(
      customer.lastName,
    );
    await expect(this.postalCodeInput, 'postal code should keep the typed value').toHaveValue(
      customer.postalCode,
    );
  }

  async submitInformation(customer: Customer): Promise<void> {
    await this.fillInformation(customer);
    await this.continueButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }

  /** Finding each control by role + accessible name proves the name exists; then check its state. */
  async expectControlsAccessible(): Promise<void> {
    await expect(this.firstNameInput).toBeEditable();
    await expect(this.lastNameInput).toBeEditable();
    await expect(this.postalCodeInput).toBeEditable();
    await expect(this.continueButton).toBeEnabled();
  }

  async getOverviewItems(): Promise<LineItem[]> {
    await this.expectStep('overview');
    return readLineItems(this.items);
  }

  async getTotals(): Promise<OrderTotals> {
    await expect(this.totalLabel).toBeVisible();
    return {
      subtotalCents: parseMoneyToCents(await this.subtotalLabel.innerText()),
      taxCents: parseMoneyToCents(await this.taxLabel.innerText()),
      totalCents: parseMoneyToCents(await this.totalLabel.innerText()),
    };
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectConfirmation(message: string): Promise<void> {
    await expect(this.completeHeader).toHaveText(message);
  }

  async expectNoConfirmation(): Promise<void> {
    await this.expectUrlNot(STEPS.complete.url);
    await expect(this.completeHeader).toBeHidden();
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
