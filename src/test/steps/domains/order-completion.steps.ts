import type { Download, Page } from '@playwright/test';
import { When, Then, expect, logger } from '../../../core/support/base-step';
import { CheckoutPage } from '../../pages';

/** Steps for OrderCompletion.feature: confirmation page, PDF and duplicate-order checks. */

const PDF_DOWNLOAD = 'pdfDownload';
const SECOND_TAB = 'secondTab';

Then(
  'the confirmation page should show {string} and {string}',
  async ({ checkoutPage }, heading: string, message: string) => {
    await checkoutPage.expectStep('complete');
    await expect(checkoutPage.completeHeader).toHaveText(heading);
    await expect(checkoutPage.completeText).toHaveText(message);
  },
);

Then(
  'the confirmation page should show the "Pony Express" image and a "Back Home" button',
  async ({ checkoutPage }) => {
    await expect(checkoutPage.ponyImage).toBeVisible();
    await expect(checkoutPage.backHomeButton).toBeVisible();
  },
);

When('I generate the PDF order', async ({ page, checkoutPage, testContext }) => {
  logger.info('>> [STEP] Generate PDF order');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    checkoutPage.generatePdfButton.click(),
  ]);
  testContext.setValue<Download>(PDF_DOWNLOAD, download);
});

/** The file name and a non-empty PDF are checked; reading the PDF text needs a manual look. */
Then(
  'a PDF file named like {string} should be downloaded',
  async ({ testContext }, prefix: string) => {
    const download = testContext.getValue<Download>(PDF_DOWNLOAD);
    expect(download.suggestedFilename(), 'PDF file name').toMatch(
      new RegExp(`^${prefix}.*\\.pdf$`),
    );
    const path = await download.path();
    const { statSync } = await import('node:fs');
    expect(statSync(path).size, 'PDF should not be empty').toBeGreaterThan(0);
  },
);

When('I double-click Finish', async ({ checkoutPage }) => {
  logger.info('>> [STEP] Double-click Finish');
  await checkoutPage.doubleClickFinish();
});

Then('exactly one order confirmation should be displayed', async ({ checkoutPage }) => {
  await checkoutPage.expectStep('complete');
  await expect(checkoutPage.completeHeader).toHaveCount(1);
});

// ── Two tabs ─────────────────────────────────────────────────────────────────

When(
  'I open the same checkout overview in a second tab',
  async ({ page, context, testContext }) => {
    logger.info('>> [STEP] Open the Overview in a second tab');
    const tab = await context.newPage();
    await tab.goto(page.url());
    await new CheckoutPage(tab).expectStep('overview');
    testContext.setValue<Page>(SECOND_TAB, tab);
  },
);

When('I finish the order in the second tab', async ({ testContext }) => {
  logger.info('>> [STEP] Finish in the second tab');
  await new CheckoutPage(testContext.getValue<Page>(SECOND_TAB)).finish();
});

Then('the second tab should not show another order confirmation', async ({ testContext }) => {
  const second = new CheckoutPage(testContext.getValue<Page>(SECOND_TAB));
  await expect(
    second.completeHeader,
    'the cart was already ordered in the first tab, so a second "Thank you" means a duplicate order',
  ).toBeHidden();
});
