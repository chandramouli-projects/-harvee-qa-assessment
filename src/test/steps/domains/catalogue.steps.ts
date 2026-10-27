import { Given, When, Then, expect, logger } from '../../../core/support/base-step';
import { sortOptionFor } from '../../data/test-data';
import {
  compareNames,
  compareNumbers,
  expectSameLineItems,
  expectSorted,
  type LineItem,
  type SortDirection,
} from '../../support/assertions';

/** Steps for ProductSorting.feature. */

const CATALOGUE = 'catalogueBeforeSorting';

Given('I note the full product catalogue', async ({ productsPage, testContext }) => {
  const catalogue = await productsPage.getProducts();
  logger.info(`>> [STEP] Catalogue noted: ${catalogue.length} products`);
  testContext.setValue(CATALOGUE, catalogue);
});

Given('the products are sorted by {string}', async ({ productsPage }, label: string) => {
  await productsPage.sortBy(sortOptionFor(label));
});

When('I sort the products by {string}', async ({ productsPage }, label: string) => {
  logger.info(`>> [STEP] Sort by: ${label}`);
  await productsPage.sortBy(sortOptionFor(label));
});

/** Selects the option without waiting for the page to confirm it (see ProductsPage.chooseSortOption). */
When('I choose the sort option {string}', async ({ productsPage }, label: string) => {
  logger.info(`>> [STEP] Choose sort option: ${label}`);
  await productsPage.chooseSortOption(sortOptionFor(label));
});

Then(
  'the product {word} should be in {word} order',
  async ({ productsPage }, key: string, direction: string) => {
    if (direction !== 'ascending' && direction !== 'descending') {
      throw new Error(`Sort direction must be "ascending" or "descending", got "${direction}".`);
    }
    const sortDirection: SortDirection = direction;
    const products = await productsPage.getProducts();
    if (key === 'prices') {
      expectSorted(
        products.map((product) => product.priceCents / 100),
        compareNumbers,
        sortDirection,
        'Product prices',
      );
    } else if (key === 'names') {
      expectSorted(
        products.map((product) => product.name),
        compareNames,
        sortDirection,
        'Product names',
      );
    } else {
      throw new Error(`Sort key must be "names" or "prices", got "${key}".`);
    }
  },
);

Then(
  'the catalogue should contain the same products and prices as before sorting',
  async ({ productsPage, testContext }) => {
    expectSameLineItems(
      await productsPage.getProducts(),
      testContext.getValue<LineItem[]>(CATALOGUE),
      'sorting must not add, drop or re-price products',
    );
  },
);

Then('the sort dropdown should show {string}', async ({ productsPage }, label: string) => {
  await expect(productsPage.sortSelect).toHaveValue(sortOptionFor(label));
  await expect(productsPage.activeSortOption).toHaveText(label);
});
