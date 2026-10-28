import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import type { BasePage } from '../../core/base/BasePage';

/** WCAG 2.0, 2.1 and 2.2 at levels A and AA — the strict standard used by Accessibility.feature. */
export const STRICT_WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export interface StrictScanResult {
  /** "rule-id [impact] xN: help" for every WCAG violation, whatever its impact. */
  violations: string[];
  violationRuleIds: string[];
  /** Results axe could not decide; they need a human check, so they are reported, not failed. */
  incomplete: string[];
  /** Best-practice findings are not WCAG failures; reported for information only. */
  bestPractice: string[];
}

/**
 * Runs the strict WCAG scan and a separate best-practice scan, attaches the full JSON of both to
 * the report, and adds an annotation for every item a human must review.
 */
export async function runStrictScan(
  page: Page,
  testInfo: TestInfo,
  label: string,
): Promise<StrictScanResult> {
  const wcag = await new AxeBuilder({ page }).withTags(STRICT_WCAG_TAGS).analyze();
  const practice = await new AxeBuilder({ page }).withTags(['best-practice']).analyze();

  await testInfo.attach(`axe WCAG 2.2 A/AA - ${label}`, {
    body: JSON.stringify(
      { violations: wcag.violations, incomplete: wcag.incomplete, testEngine: wcag.testEngine },
      null,
      2,
    ),
    contentType: 'application/json',
  });
  await testInfo.attach(`axe best-practice - ${label}`, {
    body: JSON.stringify(practice.violations, null, 2),
    contentType: 'application/json',
  });

  const result: StrictScanResult = {
    violations: wcag.violations.map(
      (rule) => `${rule.id} [${rule.impact ?? 'unknown'}] x${rule.nodes.length}: ${rule.help}`,
    ),
    violationRuleIds: wcag.violations.map((rule) => rule.id),
    incomplete: wcag.incomplete.map((rule) => `${rule.id} x${rule.nodes.length}`),
    bestPractice: practice.violations.map((rule) => `${rule.id} [${rule.impact ?? 'unknown'}]`),
  };
  for (const item of result.incomplete) {
    testInfo.annotations.push({
      type: 'axe needs manual review',
      description: `${label}: ${item}`,
    });
  }
  for (const item of result.bestPractice) {
    testInfo.annotations.push({ type: 'axe best-practice', description: `${label}: ${item}` });
  }
  return result;
}

/**
 * Compares the pixels around a control before and after it receives focus from real Tab presses
 * (so :focus-visible styling applies). The capture is padded because focus outlines are drawn
 * outside the element's box. Returns true when the control looks different when focused.
 */
export async function focusChangesAppearance(
  page: Page,
  keyboard: BasePage,
  control: Locator,
  label: string,
  testInfo: TestInfo,
): Promise<boolean> {
  const box = await control.boundingBox();
  if (!box) throw new Error(`${label} should be rendered`);
  const padding = 8;
  const clip = {
    x: Math.max(0, box.x - padding),
    y: Math.max(0, box.y - padding),
    width: box.width + padding * 2,
    height: box.height + padding * 2,
  };
  // Click an empty corner so nothing is focused and Tab starts from the top of the page.
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await expect(control, `${label} should not be focused before Tab`).not.toBeFocused();
  const unfocused = await page.screenshot({ clip });
  await keyboard.tabTo(control, 20);
  const focused = await page.screenshot({ clip });
  await testInfo.attach(`${label} - focused`, { body: focused, contentType: 'image/png' });
  return !unfocused.equals(focused);
}
