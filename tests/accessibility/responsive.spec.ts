import { test, expect } from '../../fixtures/test-fixtures';
import { PRODUCTS, VIEWPORTS } from '../../test-data/test-data';

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`Responsive layout - ${name} ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test(`TC21 key controls are usable without horizontal scrolling at ${name} width`, async ({
      page,
      loggedInProductsPage: productsPage,
      menu,
    }) => {
      const hasHorizontalOverflow = () =>
        page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );

      expect(await hasHorizontalOverflow(), 'Products page should not scroll horizontally').toBe(
        false,
      );
      await expect(menu.openMenuButton).toBeInViewport();
      await expect(menu.cartLink).toBeInViewport();
      await expect(productsPage.sortSelect).toBeInViewport();

      await productsPage.addToCartButton(PRODUCTS.backpack).scrollIntoViewIfNeeded();
      await productsPage.addToCart(PRODUCTS.backpack);
      await menu.expectCartCount(1);
      expect(await hasHorizontalOverflow(), 'no horizontal scroll after interaction').toBe(false);
    });
  });
}
