import type { Locator } from '@playwright/test';
import { test, expect } from '../../fixtures/test-fixtures';
import { env } from '../../utils/environment';
import { PRODUCTS } from '../../test-data/test-data';

test.describe('Keyboard accessibility', () => {
  test('TC19 a user can log in and add a product using only the keyboard', async ({
    page,
    loginPage,
    productsPage,
    menu,
  }) => {
    await loginPage.goto();

    await page.keyboard.press('Tab');
    await expect(loginPage.usernameInput).toBeFocused();
    await page.keyboard.type(env.users.standard);
    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();
    await page.keyboard.type(env.password);
    await page.keyboard.press('Enter');

    await productsPage.expectLoaded();
    await productsPage.addToCartButton(PRODUCTS.backpack).focus();
    await page.keyboard.press('Enter');
    await menu.expectCartCount(1);
    await expect(productsPage.removeButton(PRODUCTS.backpack)).toBeVisible();
  });

  test('TC19 focused login controls show a visible focus indicator', async ({
    page,
    loginPage,
  }, testInfo) => {
    // Known defect DEF-02 (WCAG 2.4.7): verified with a positive control - an injected outline is
    // detected by this comparison, the site's own focus styling is not. Remove once fixed.
    testInfo.annotations.push({
      type: 'known defect',
      description: 'DEF-02: login inputs and button have no visible focus indicator',
    });
    test.fail(true, 'DEF-02: login inputs and button have no visible focus indicator');

    await loginPage.goto();
    const controls: [string, Locator][] = [
      ['Username input', loginPage.usernameInput],
      ['Password input', loginPage.passwordInput],
      ['Login button', loginPage.loginButton],
    ];
    const withoutVisibleFocus: string[] = [];

    // Compare pixels around each control before and after keyboard focus. The capture is padded
    // because focus outlines are drawn outside the element's box; the text caret is hidden.
    for (const [label, control] of controls) {
      const box = await control.boundingBox();
      expect(box, `${label} should be rendered`).not.toBeNull();
      const padding = 8;
      const clip = {
        x: Math.max(0, box!.x - padding),
        y: Math.max(0, box!.y - padding),
        width: box!.width + padding * 2,
        height: box!.height + padding * 2,
      };
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      await expect(control).not.toBeFocused();
      const unfocused = await page.screenshot({ clip });
      // Reach the control with real Tab presses so :focus-visible styling applies in every browser.
      let tabPresses = 0;
      while (!(await control.evaluate((el) => el === document.activeElement)) && tabPresses < 10) {
        await page.keyboard.press('Tab');
        tabPresses++;
      }
      await expect(control, `${label} should be reachable with Tab`).toBeFocused({
        timeout: 1_000,
      });
      const focused = await page.screenshot({ clip });
      await testInfo.attach(`${label} - focused`, { body: focused, contentType: 'image/png' });
      if (unfocused.equals(focused)) withoutVisibleFocus.push(label);
    }

    expect(withoutVisibleFocus, 'controls whose appearance does not change on focus').toEqual([]);
  });
});
