import { Given, When, Then, expect, logger } from '../../../core/support/base-step';
import { testConfig } from '../../../../config/testConfig';
import { CUSTOMER } from '../../data/test-data';
import type {
  CartPage,
  CheckoutPage,
  LoginPage,
  MenuComponent,
  ProductDetailPage,
  ProductsPage,
} from '../../pages';
import {
  focusChangesAppearance,
  runStrictScan,
  type StrictScanResult,
} from '../../support/accessibility';
import { splitList, usernameFor } from '../../support/users';

/**
 * Steps for features/Accessibility/Accessibility.feature (strict WCAG 2.2 A/AA).
 * Automated checks cover only part of WCAG; the manual checks are listed in the feature banner.
 */

const SCAN_RESULT = 'axeStrictScan';
const PAGE_TITLES = 'notedPageTitles';
const PRODUCT = 'Sauce Labs Backpack';

interface Pages {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  menu: MenuComponent;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREENS — each page/state the strict checks run on, reached the way a user would
// ══════════════════════════════════════════════════════════════════════════════

const SCREENS = [
  'Login',
  'Login with error',
  'Products',
  'Products with menu open',
  'Product detail',
  'Cart with item',
  'Empty cart',
  'Checkout information',
  'Checkout information with error',
  'Checkout overview',
  'Checkout complete',
] as const;
type Screen = (typeof SCREENS)[number];

function toScreen(name: string): Screen {
  if (!(SCREENS as readonly string[]).includes(name)) {
    throw new Error(`Unknown screen "${name}". Use one of: ${SCREENS.join(', ')}.`);
  }
  return name as Screen;
}

async function logIn({ loginPage, productsPage }: Pages): Promise<void> {
  await loginPage.goto();
  await loginPage.login(usernameFor('standard'), testConfig.password);
  await productsPage.expectLoaded();
}

/** The cart survives a new login in the same browser, so only add the product when it is not there. */
async function ensureProductInCart({ productsPage }: Pages): Promise<void> {
  if (await productsPage.addToCartButton(PRODUCT).isVisible()) {
    await productsPage.addToCart(PRODUCT);
  }
  await expect(productsPage.removeButton(PRODUCT)).toBeVisible();
}

async function openCheckoutInformation(pages: Pages): Promise<void> {
  await logIn(pages);
  await ensureProductInCart(pages);
  await pages.menu.openCart();
  await pages.cartPage.expectLoaded();
  await pages.cartPage.checkout();
  await pages.checkoutPage.expectStep('information');
}

async function openScreen(pages: Pages, screen: Screen): Promise<void> {
  const { loginPage, productsPage, productDetailPage, cartPage, checkoutPage, menu } = pages;
  switch (screen) {
    case 'Login':
      await loginPage.goto();
      return;
    case 'Login with error':
      await loginPage.goto();
      await loginPage.login('', '');
      await expect(loginPage.errorMessage).toBeVisible();
      return;
    case 'Products':
      await logIn(pages);
      return;
    case 'Products with menu open':
      await logIn(pages);
      await menu.openMenu();
      return;
    case 'Product detail':
      await logIn(pages);
      await productsPage.openProductByName(PRODUCT);
      await productDetailPage.expectLoaded();
      return;
    case 'Cart with item':
      await logIn(pages);
      await ensureProductInCart(pages);
      await menu.openCart();
      await cartPage.expectLoaded();
      return;
    case 'Empty cart':
      await logIn(pages);
      await menu.openCart();
      await cartPage.expectLoaded();
      return;
    case 'Checkout information':
      await openCheckoutInformation(pages);
      return;
    case 'Checkout information with error':
      await openCheckoutInformation(pages);
      await checkoutPage.continueButton.click();
      await expect(checkoutPage.errorMessage).toBeVisible();
      return;
    case 'Checkout overview':
      await openCheckoutInformation(pages);
      await checkoutPage.submitInformation(CUSTOMER);
      await checkoutPage.expectStep('overview');
      return;
    case 'Checkout complete':
      await openCheckoutInformation(pages);
      await checkoutPage.submitInformation(CUSTOMER);
      await checkoutPage.finish();
      await checkoutPage.expectStep('complete');
      return;
  }
}

// playwright-bdd reads fixture names from the destructuring pattern, so list each page explicitly.
Given(
  'the {string} screen is open',
  async (
    { loginPage, productsPage, productDetailPage, cartPage, checkoutPage, menu },
    name: string,
  ) => {
    logger.info(`>> [STEP] Open screen: ${name}`);
    const pages = { loginPage, productsPage, productDetailPage, cartPage, checkoutPage, menu };
    await openScreen(pages, toScreen(name));
  },
);

// ══════════════════════════════════════════════════════════════════════════════
// AXE SCAN (AC01, AC02)
// ══════════════════════════════════════════════════════════════════════════════

When(
  'I scan the page with axe for WCAG 2.0, 2.1 and 2.2 A and AA rules',
  async ({ page, testContext, $testInfo }) => {
    const result = await runStrictScan(page, $testInfo, new URL(page.url()).pathname);
    logger.info(
      `>> [STEP] axe strict: ${result.violations.length} violation(s), ` +
        `${result.incomplete.length} for manual review, ${result.bestPractice.length} best-practice`,
    );
    testContext.setValue(SCAN_RESULT, result);
  },
);

Then('the scan should find no WCAG violations', ({ testContext }) => {
  expect(
    testContext.getValue<StrictScanResult>(SCAN_RESULT).violations,
    'WCAG 2.2 A/AA violations of any impact (full JSON attached to the report)',
  ).toEqual([]);
});

/** Positive control: content that must break two well-known rules. */
When('I add a button with no name and an image with no alt text to the page', async ({ page }) => {
  await page.evaluate(() => {
    const button = document.createElement('button');
    button.id = 'positive-control-button';
    document.body.appendChild(button);
    const image = document.createElement('img');
    image.id = 'positive-control-image';
    image.src = 'positive-control.png';
    document.body.appendChild(image);
  });
});

Then('the scan should report the rules {string}', ({ testContext }, rules: string) => {
  const reported = testContext.getValue<StrictScanResult>(SCAN_RESULT).violationRuleIds;
  for (const rule of splitList(rules)) {
    expect(reported, `the scan should report "${rule}" for the injected content`).toContain(rule);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// KEYBOARD (AC03 - AC06)
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

When('I start checkout using only the keyboard', async ({ cartPage }) => {
  await cartPage.tabTo(cartPage.checkoutButton, 20);
  await cartPage.pressKey('Enter');
});

When(
  'I enter valid checkout information and continue using only the keyboard',
  async ({ checkoutPage }) => {
    logger.info('>> [STEP] Keyboard-only checkout information');
    await checkoutPage.tabTo(checkoutPage.firstNameInput, 20);
    await checkoutPage.typeText(CUSTOMER.firstName);
    await checkoutPage.pressKey('Tab');
    await expect(checkoutPage.lastNameInput).toBeFocused();
    await checkoutPage.typeText(CUSTOMER.lastName);
    await checkoutPage.pressKey('Tab');
    await expect(checkoutPage.postalCodeInput).toBeFocused();
    await checkoutPage.typeText(CUSTOMER.postalCode);
    await expect(checkoutPage.firstNameInput).toHaveValue(CUSTOMER.firstName);
    await checkoutPage.tabTo(checkoutPage.continueButton, 5);
    await checkoutPage.pressKey('Enter');
  },
);

When('I finish the order using only the keyboard', async ({ checkoutPage }) => {
  await checkoutPage.tabTo(checkoutPage.finishButton, 20);
  await checkoutPage.pressKey('Enter');
});

/** WebKit, like Safari's default setting, skips links when Tab is pressed. */
Given('keyboard focus can move to links in this browser', ({ $test, browserName }) => {
  $test.skip(
    browserName === 'webkit',
    'WebKit (like Safari by default) does not move Tab focus to links; covered in Chromium and Firefox',
  );
});

When('I open the menu using only the keyboard', async ({ menu }) => {
  await menu.tabTo(menu.openMenuButton, 20);
  await menu.pressKey('Enter');
  await expect(menu.logoutLink, 'the menu should open with Enter').toBeVisible();
});

When('I choose {string} from the menu using only the keyboard', async ({ menu }, item: string) => {
  logger.info(`>> [STEP] Keyboard-only menu choice: ${item}`);
  await menu.tabTo(menu.menuItem(item), 10);
  await menu.pressKey('Enter');
});

/**
 * An element that cannot even take focus from script can never be reached with Tab. (The
 * `tabIndex` property is not used: it reports 0 for every <a>, even one without href.)
 */
Then('the cart link should be able to receive keyboard focus', async ({ menu }) => {
  const link = await menu.cartLink.evaluate((element) => {
    (element as HTMLElement).focus();
    return { focused: document.activeElement === element, html: element.outerHTML.slice(0, 120) };
  });
  expect(link.focused, `cart link should be focusable; it is ${link.html}`).toBe(true);
});

// ══════════════════════════════════════════════════════════════════════════════
// VISIBLE FOCUS (AC07)
// ══════════════════════════════════════════════════════════════════════════════

Then(
  'the controls {string} should show a visible focus indicator when reached with Tab',
  async (
    { page, loginPage, productsPage, cartPage, checkoutPage, $testInfo },
    controlNames: string,
  ) => {
    const controls = {
      'Username field': loginPage.usernameInput,
      'Password field': loginPage.passwordInput,
      'Login button': loginPage.loginButton,
      'Sort control': productsPage.sortSelect,
      'Add to cart button': productsPage.addToCartButton(PRODUCT),
      'Continue Shopping button': cartPage.continueShoppingButton,
      'Checkout button': cartPage.checkoutButton,
      'First Name field': checkoutPage.firstNameInput,
      'Continue button': checkoutPage.continueButton,
    };
    const withoutVisibleFocus: string[] = [];
    for (const name of splitList(controlNames)) {
      if (!(name in controls)) {
        throw new Error(
          `Unknown control "${name}". Use one of: ${Object.keys(controls).join(', ')}.`,
        );
      }
      const control = controls[name as keyof typeof controls];
      if (!(await focusChangesAppearance(page, loginPage, control, name, $testInfo))) {
        withoutVisibleFocus.push(name);
      }
    }
    expect(withoutVisibleFocus, 'controls whose appearance does not change on focus').toEqual([]);
  },
);

// ══════════════════════════════════════════════════════════════════════════════
// ACCESSIBLE NAMES (AC08, AC09) — locating by role + name proves the accessible name exists
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
// ANNOUNCEMENTS, INPUT PURPOSE, ALT TEXT (AC10 - AC12)
// ══════════════════════════════════════════════════════════════════════════════

/** role="alert" is announced by screen readers as soon as its text appears (WCAG 4.1.3). */
Then('the error {string} should be in an alert region', async ({ page }, message: string) => {
  await expect(page.getByRole('alert'), 'the error should be inside role="alert"').toHaveText(
    message,
  );
});

Then(
  'the checkout fields should declare the autocomplete purposes {string}, {string} and {string}',
  async ({ checkoutPage }, firstName: string, lastName: string, postalCode: string) => {
    const expected: [string, string][] = [
      ['First Name', firstName],
      ['Last Name', lastName],
      ['Zip/Postal Code', postalCode],
    ];
    const fields = [
      checkoutPage.firstNameInput,
      checkoutPage.lastNameInput,
      checkoutPage.postalCodeInput,
    ];
    const actual = await Promise.all(fields.map((field) => field.getAttribute('autocomplete')));
    const wrong = expected
      .map(([field, purpose], index) => ({ field, purpose, got: actual[index] ?? null }))
      .filter(({ purpose, got }) => got !== purpose)
      .map(({ field, purpose, got }) => `${field}: expected "${purpose}", got ${String(got)}`);
    expect(wrong, 'checkout fields without the right autocomplete purpose').toEqual([]);
  },
);

Then(
  'every product image should have the product name as its alt text',
  async ({ productsPage }) => {
    const products = await productsPage.getProducts();
    const mismatches: string[] = [];
    for (const { name } of products) {
      const alt = await productsPage.itemImage(name).getAttribute('alt');
      if (alt !== name) mismatches.push(`${name}: alt is ${alt === null ? 'missing' : `"${alt}"`}`);
    }
    expect(mismatches, 'product images whose alt text does not name the product').toEqual([]);
  },
);

Then(
  'the product page image should have the alt text {string}',
  async ({ page, productDetailPage }, alt: string) => {
    await productDetailPage.expectLoaded();
    await expect(page.getByRole('img', { name: alt, exact: true })).toBeVisible();
  },
);

// ══════════════════════════════════════════════════════════════════════════════
// PAGE TITLES (AC13)
// ══════════════════════════════════════════════════════════════════════════════

When(
  'I note the page title of the {string} screen',
  async (
    { page, testContext, loginPage, productsPage, productDetailPage, cartPage, checkoutPage, menu },
    name: string,
  ) => {
    const pages = { loginPage, productsPage, productDetailPage, cartPage, checkoutPage, menu };
    await openScreen(pages, toScreen(name));
    const title = await page.title();
    testContext.setValue(PAGE_TITLES, [
      ...testContext.getValueOr<string[]>(PAGE_TITLES, []),
      `${name}: "${title}"`,
    ]);
  },
);

Then('every noted page title should be different', ({ testContext }) => {
  const noted = testContext.getValue<string[]>(PAGE_TITLES);
  const titles = noted.map((entry) => entry.slice(entry.indexOf(': ') + 2));
  expect(
    new Set(titles).size,
    `each page needs its own title so users know where they are. Titles: ${noted.join('; ')}`,
  ).toBe(titles.length);
});

// ══════════════════════════════════════════════════════════════════════════════
// RESPONSIVE AND REFLOW (AC14, AC15)
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
