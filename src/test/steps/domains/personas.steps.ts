import { Given, Then, expect, logger } from '../../../core/support/base-step';

/** Steps for Personas.feature: compare a demo persona with what standard_user sees. */

const BASELINE = 'standardUserBaseline';

/**
 * Name and price exactly as displayed. Compared as text, not cents, because a faulty persona can
 * show prices such as "$24.2" that are not valid money amounts — that is part of the bug evidence.
 */
interface DisplayedProduct {
  name: string;
  price: string;
}

interface Baseline {
  products: DisplayedProduct[];
  images: string[];
  positions: Record<string, { x: number; y: number }>;
}

const HEADER_CONTROLS = ['cart link', 'sort control'] as const;

Given(
  'I note the products, images and header layout',
  async ({ productsPage, menu, testContext }) => {
    const positions: Baseline['positions'] = {};
    for (const [label, locator] of [
      ['cart link', menu.cartLink],
      ['sort control', productsPage.sortSelect],
    ] as const) {
      const box = await locator.boundingBox();
      if (!box) throw new Error(`${label} should be visible`);
      positions[label] = { x: Math.round(box.x), y: Math.round(box.y) };
    }
    testContext.setValue<Baseline>(BASELINE, {
      products: await productsPage.getDisplayedProducts(),
      images: await productsPage.getImageSources(),
      positions,
    });
    logger.info('>> [STEP] Noted products, images and header layout');
  },
);

Then('every product should show the same image as noted', async ({ productsPage, testContext }) => {
  expect(await productsPage.getImageSources(), 'each product should keep its own image').toEqual(
    testContext.getValue<Baseline>(BASELINE).images,
  );
});

Then(
  'the product names and prices should be the same as noted',
  async ({ productsPage, testContext }) => {
    expect(await productsPage.getDisplayedProducts(), 'names and prices').toEqual(
      testContext.getValue<Baseline>(BASELINE).products,
    );
  },
);

Then(
  'the header controls should be in the same place as noted',
  async ({ productsPage, menu, testContext }) => {
    const noted = testContext.getValue<Baseline>(BASELINE).positions;
    for (const label of HEADER_CONTROLS) {
      const locator = label === 'cart link' ? menu.cartLink : productsPage.sortSelect;
      const box = await locator.boundingBox();
      if (!box) throw new Error(`${label} should be visible`);
      const was = noted[label];
      if (!was) throw new Error(`No noted position for ${label}`);
      const moved = Math.max(
        Math.abs(Math.round(box.x) - was.x),
        Math.abs(Math.round(box.y) - was.y),
      );
      expect(
        moved,
        `${label} moved from (${was.x}, ${was.y}) to (${Math.round(box.x)}, ${Math.round(box.y)})`,
      ).toBeLessThanOrEqual(2);
    }
  },
);
