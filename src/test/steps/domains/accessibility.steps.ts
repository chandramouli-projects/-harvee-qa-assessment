import AxeBuilder from '@axe-core/playwright';
import type { Locator } from '@playwright/test';
import { Given, When, Then, expect, logger } from '../../../core/support/base-step';
import { testConfig } from '../../../../config/testConfig';
import { usernameFor } from '../../support/users';

/**
 * Steps for Accessibility.feature. Automated checks cover only part of WCAG; screen-reader
 * usability, reading order and real devices still need manual testing.
 */

const AXE_BLOCKING = 'axeBlockingViolations';

// ══════════════════════════════════════════════════════════════════════════════
// KEYBOARD (TC19)
// ══════════════════════════════════════════════════════════════════════════════

When(
  'I log in as the {string} user using only the keyboard',
  async ({ loginPage }, role: string) => {
    logger.info(`>> [STEP] Keyboard-only login as the "${role}" user`);
    await loginPage.loginWithKeyboard(usernameFor(role), testConfig.password);
  },
);

When(
  'I add {string} to the cart using only the keyboard',
  async ({ productsPage }, name: string) => {
    logger.info(`>> [STEP] Keyboard-only add to cart: ${name}`);
    await productsPage.addToCartWithKeyboard(name);
  },
);

/**
 * Compares pixels around each control before and after keyboard focus. The capture is padded
 * because focus outlines are drawn outside the element's box. Screenshots are attached as evidence.
 */
Then(
  'every login control should show a visible focus indicator when reached with Tab',
  async ({ page, loginPage, $testInfo }) => {
    const controls: [string, Locator][] = [
      ['Username input', loginPage.usernameInput],
      ['Password input', loginPage.passwordInput],
      ['Login button', loginPage.loginButton],
    ];
    const withoutVisibleFocus: string[] = [];

    for (const [label, control] of controls) {
      const box = await control.boundingBox();
      if (!box) throw new Error(`${label} should be rendered`);
      const padding = 8;
      const clip = {
        x: Math.max(0, box.x - padding),
        y: Math.max(0, box.y - padding),
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      };
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      await expect(control).not.toBeFocused();
      const unfocused = await page.screenshot({ clip });
      // Real Tab presses, so :focus-visible styling applies in every browser.
      await loginPage.tabTo(control);
      const focused = await page.screenshot({ clip });
      await $testInfo.attach(`${label} - focused`, { body: focused, contentType: 'image/png' });
      if (unfocused.equals(focused)) withoutVisibleFocus.push(label);
    }

    expect(withoutVisibleFocus, 'controls whose appearance does not change on focus').toEqual([]);
  },
);

// ══════════════════════════════════════════════════════════════════════════════
// ACCESSIBLE NAMES (TC20) — locating by role + name proves the accessible name exists
// ══════════════════════════════════════════════════════════════════════════════

Then('the login form controls should be found by their accessible names', async ({ loginPage }) => {
  await loginPage.expectControlsAccessible();
});

Then(
  'the sort control and menu button should be found by their accessible names',
  async ({ productsPage, menu }) => {
    await expect(productsPage.sortSelect).toBeVisible();
    await expect(menu.openMenuButton).toBeVisible();
  },
);

Then('every product should have an {string} button', async ({ productsPage }, label: string) => {
  if (label !== 'Add to cart') throw new Error(`Only "Add to cart" is supported, got "${label}".`);
  const productCount = await productsPage.items.count();
  expect(productCount, 'the catalogue should list products').toBeGreaterThan(0);
  await expect(productsPage.addToCartButtons).toHaveCount(productCount);
});

Then(
  'the checkout form controls should be found by their accessible names',
  async ({ checkoutPage }) => {
    await checkoutPage.expectControlsAccessible();
  },
);

// ══════════════════════════════════════════════════════════════════════════════
// AXE SCAN (TC20)
// ══════════════════════════════════════════════════════════════════════════════

When(
  'I scan the {string} page with axe for WCAG 2 A and AA rules',
  async ({ page, testContext, $testInfo }, pageName: string) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    await $testInfo.attach(`axe results - ${pageName}`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
    for (const violation of results.violations) {
      $testInfo.annotations.push({
        type: `axe ${violation.impact ?? 'unknown'}`,
        description: `${pageName}: ${violation.id} (${violation.nodes.length} node(s))`,
      });
    }
    const blocking = results.violations
      .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
      .map((violation) => `${pageName} - ${violation.id}: ${violation.help}`);
    logger.info(
      `>> [STEP] axe "${pageName}": ${results.violations.length} violation(s), ${blocking.length} blocking`,
    );
    testContext.setValue(AXE_BLOCKING, [
      ...testContext.getValueOr<string[]>(AXE_BLOCKING, []),
      ...blocking,
    ]);
  },
);

Then('no critical or serious accessibility violations should be found', ({ testContext }) => {
  expect(
    testContext.getValue<string[]>(AXE_BLOCKING),
    'critical/serious axe violations (see attachments)',
  ).toEqual([]);
});

// ══════════════════════════════════════════════════════════════════════════════
// RESPONSIVE (TC21)
// ══════════════════════════════════════════════════════════════════════════════

Given(
  'the browser viewport is {int} x {int} pixels',
  async ({ productsPage }, width: number, height: number) => {
    logger.info(`>> [STEP] Viewport ${width}x${height}`);
    await productsPage.setViewportSize(width, height);
  },
);

Then('the page should not scroll horizontally', async ({ productsPage }) => {
  expect(await productsPage.hasHorizontalOverflow(), 'page should not scroll horizontally').toBe(
    false,
  );
});

Then(
  'the menu button, cart link and sort control should be within the viewport',
  async ({ productsPage, menu }) => {
    await expect(menu.openMenuButton).toBeInViewport();
    await expect(menu.cartLink).toBeInViewport();
    await expect(productsPage.sortSelect).toBeInViewport();
  },
);
