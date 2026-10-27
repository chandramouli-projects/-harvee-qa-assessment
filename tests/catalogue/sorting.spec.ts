import { test, expect } from '../../fixtures/test-fixtures';
import {
  compareNames,
  compareNumbers,
  expectSameLineItems,
  expectSorted,
  type SortDirection,
} from '../../utils/assertions';
import { SORT_LABELS, type SortOption } from '../../test-data/test-data';

interface SortCase {
  id: string;
  option: SortOption;
  /** Applied first so the target sort must actively re-order the list (A-Z is the default). */
  startFrom: SortOption;
  key: 'name' | 'price';
  direction: SortDirection;
}

const SORT_CASES: SortCase[] = [
  { id: 'TC05', option: 'az', startFrom: 'za', key: 'name', direction: 'ascending' },
  { id: 'TC06', option: 'lohi', startFrom: 'hilo', key: 'price', direction: 'ascending' },
  { id: 'TC07', option: 'hilo', startFrom: 'lohi', key: 'price', direction: 'descending' },
  { id: 'TC08', option: 'za', startFrom: 'az', key: 'name', direction: 'descending' },
];

test.describe('Catalogue sorting', () => {
  for (const sortCase of SORT_CASES) {
    test(`${sortCase.id} "${SORT_LABELS[sortCase.option]}" orders the entire product list`, async ({
      loggedInProductsPage: productsPage,
    }) => {
      const catalogue = await productsPage.getProducts();
      await productsPage.sortBy(sortCase.startFrom);

      await productsPage.sortBy(sortCase.option);
      const sorted = await productsPage.getProducts();

      expectSameLineItems(sorted, catalogue, 'sorting must not add, drop or re-price products');
      if (sortCase.key === 'price') {
        expectSorted(
          sorted.map((product) => product.priceCents / 100),
          compareNumbers,
          sortCase.direction,
          'Product prices',
        );
      } else {
        expectSorted(
          sorted.map((product) => product.name),
          compareNames,
          sortCase.direction,
          'Product names',
        );
      }
      await expect(productsPage.sortSelect).toHaveValue(sortCase.option);
    });
  }
});
