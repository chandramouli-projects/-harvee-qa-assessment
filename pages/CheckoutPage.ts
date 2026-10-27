import { expect, type Locator, type Page } from '@playwright/test';
import type { LineItem, OrderTotals } from '../utils/assertions';
import { parseMoneyToCents } from '../utils/money';
import type { Customer } from '../test-data/test-data';
import { readLineItems } from './CartPage';

export type CheckoutStep = 'information' | 'overview' | 'complete';

const STEPS: Record<CheckoutStep, { url: RegExp; title: string }> = {
  information: { url: /\/checkout-step-one\.html$/, title: 'Checkout: Your Information' },
  overview: { url: /\/checkout-step-two\.html$/, title: 'Checkout: Overview' },
  complete: { url: /\/checkout-complete\.html$/, title: 'Checkout: Complete!' },
};

/** Covers the three checkout steps: information form, overview and confirmation. */
export class CheckoutPage {
  readonly title: Locator;
  // Step one - information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  // Step two - overview
  readonly items: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  // Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.postalCodeInput = page.getByRole('textbox', { name: 'Zip/Postal Code' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.errorMessage = page.getByTestId('error');
    this.items = page.getByTestId('cart-list').getByTestId('inventory-item');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }

  async expectStep(step: CheckoutStep): Promise<void> {
    await expect(this.page).toHaveURL(STEPS[step].url);
    await expect(this.title).toHaveText(STEPS[step].title);
  }

  async fillInformation(customer: Customer): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
  }

  async submitInformation(customer: Customer): Promise<void> {
    await this.fillInformation(customer);
    await this.continueButton.click();
  }

  async getOverviewItems(): Promise<LineItem[]> {
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

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
