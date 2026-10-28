import { When, Then, expect, logger } from '../../../core/support/base-step';
import { splitList } from '../../support/users';

/** Steps for Products.feature and ProductDetail.feature. */

const OPENED_PRODUCT = 'openedProduct';

interface OpenedProduct {
  name: string;
  description: string;
  price: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS PAGE
// ══════════════════════════════════════════════════════════════════════════════

Then(
  'the catalogue should show {int} products, each with an image, name, description, price and an "Add to cart" button',
  async ({ productsPage }, count: number) => {
    await expect(productsPage.items).toHaveCount(count);
    for (const card of await productsPage.items.all()) {
      await expect(card.getByRole('img'), 'product image').toBeVisible();
      await expect(card.getByTestId('inventory-item-name'), 'product name').not.toBeEmpty();
      await expect(card.getByTestId('inventory-item-desc'), 'product description').not.toBeEmpty();
      await expect(card.getByTestId('inventory-item-price'), 'product price').toBeVisible();
      await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    }
  },
);

Then(
  'the product prices should be {string} in display order',
  async ({ productsPage }, prices: string) => {
    await expect(productsPage.items.first()).toBeVisible();
    const shown = await productsPage.items.getByTestId('inventory-item-price').allInnerTexts();
    for (const price of shown) {
      expect(price, `price "${price}" should look like $12.34`).toMatch(/^\$\d+\.\d{2}$/);
    }
    expect(shown).toEqual(splitList(prices));
  },
);

/** Notes the listing's name, description and price, then clicks the product name or image. */
When(
  'I open the product {string} by its {word}',
  async ({ productsPage, productDetailPage, testContext }, name: string, via: string) => {
    logger.info(`>> [STEP] Open product "${name}" by its ${via}`);
    testContext.setValue<OpenedProduct>(OPENED_PRODUCT, {
      name,
      description: (await productsPage.itemDescription(name).innerText()).trim(),
      price: (await productsPage.item(name).getByTestId('inventory-item-price').innerText()).trim(),
    });
    if (via === 'name') await productsPage.openProductByName(name);
    else if (via === 'image') await productsPage.openProductByImage(name);
    else throw new Error(`Open a product by its "name" or "image", got "${via}".`);
    await productDetailPage.expectLoaded();
  },
);

Then(
  'the footer link {string} should open {string} in a new tab',
  async ({ productsPage }, name: string, url: string) => {
    // The external site itself is out of scope: check the link target, not the third-party page.
    await expect(productsPage.footerLink(name)).toHaveAttribute('href', url);
    await expect(productsPage.footerLink(name)).toHaveAttribute('target', '_blank');
  },
);

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL PAGE
// ══════════════════════════════════════════════════════════════════════════════

Then(
  'the product page should show {string} at {string}',
  async ({ productDetailPage }, name: string, price: string) => {
    await productDetailPage.expectLoaded();
    await expect(productDetailPage.name).toHaveText(name);
    await expect(productDetailPage.price).toHaveText(price);
  },
);

Then(
  'the product page should show the same description as the Products page',
  async ({ productDetailPage, testContext }) => {
    const opened = testContext.getValue<OpenedProduct>(OPENED_PRODUCT);
    await expect(productDetailPage.name).toHaveText(opened.name);
    await expect(productDetailPage.description).toHaveText(opened.description);
    await expect(productDetailPage.price).toHaveText(opened.price);
  },
);

When('I add the product to the cart from its page', async ({ productDetailPage }) => {
  logger.info('>> [STEP] Add to cart on the product page');
  await productDetailPage.addToCart();
});

When('I remove the product from its page', async ({ productDetailPage }) => {
  logger.info('>> [STEP] Remove on the product page');
  await productDetailPage.removeFromCart();
});

Then(
  'the product page should show a {string} button',
  async ({ productDetailPage }, label: string) => {
    if (label === 'Remove') await expect(productDetailPage.removeButton).toBeVisible();
    else if (label === 'Add to cart') await expect(productDetailPage.addToCartButton).toBeVisible();
    else if (label === 'Back to products') await expect(productDetailPage.backButton).toBeVisible();
    else throw new Error(`Unknown product page button "${label}".`);
  },
);

When('I go back to the products', async ({ productDetailPage }) => {
  logger.info('>> [STEP] Back to products');
  await productDetailPage.backToProducts();
});

Then('the product page should say {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: true })).toBeVisible();
});

Then(
  'the product {string} should show a {string} button on the Products page',
  async ({ productsPage }, name: string, label: string) => {
    if (label === 'Remove') await expect(productsPage.removeButton(name)).toBeVisible();
    else if (label === 'Add to cart')
      await expect(productsPage.addToCartButton(name)).toBeVisible();
    else throw new Error(`Unknown product button "${label}".`);
  },
);
