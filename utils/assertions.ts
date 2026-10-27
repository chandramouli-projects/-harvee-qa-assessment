import { expect } from '@playwright/test';
import { formatCents, sumCents } from './money';

export type SortDirection = 'ascending' | 'descending';

export interface LineItem {
  name: string;
  priceCents: number;
}

export interface OrderTotals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export const compareNames = (a: string, b: string): number => a.localeCompare(b, 'en');
export const compareNumbers = (a: number, b: number): number => a - b;

/**
 * Checks EVERY adjacent pair, not just the first item. Equal values (e.g. two $15.99 products)
 * satisfy both directions, so no tie order is assumed.
 */
export function expectSorted<T>(
  values: readonly T[],
  compare: (a: T, b: T) => number,
  direction: SortDirection,
  label: string,
): void {
  expect(values.length, `${label}: need at least two values to verify ordering`).toBeGreaterThan(1);
  const outOfOrder: string[] = [];
  for (let index = 1; index < values.length; index++) {
    const previous = values[index - 1] as T;
    const current = values[index] as T;
    const result = compare(previous, current);
    const inOrder = direction === 'ascending' ? result <= 0 : result >= 0;
    if (!inOrder) {
      outOfOrder.push(
        `position ${index} "${String(previous)}" before ${index + 1} "${String(current)}"`,
      );
    }
  }
  expect(
    outOfOrder,
    `${label} should be ${direction}. Full list: [${values.map(String).join(', ')}]`,
  ).toEqual([]);
}

const lineKey = (item: LineItem): string => `${item.name}|${item.priceCents}`;

/** Same products with the same prices, ignoring display order (an order rule is not specified). */
export function expectSameLineItems(
  actual: readonly LineItem[],
  expected: readonly LineItem[],
  label: string,
): void {
  expect(actual.map(lineKey).sort(), label).toEqual(expected.map(lineKey).sort());
}

/**
 * Business rule under test: item total = sum of selected item prices, and
 * total = item total + tax, to the cent. The tax rate is not specified, so it is read, not assumed.
 */
export function expectTotalsConsistent(items: readonly LineItem[], totals: OrderTotals): void {
  const expectedSubtotal = sumCents(items.map((item) => item.priceCents));
  expect(
    totals.subtotalCents,
    `Item total ${formatCents(totals.subtotalCents)} should equal the sum of item prices ${formatCents(expectedSubtotal)}`,
  ).toBe(expectedSubtotal);
  expect(totals.taxCents, 'Tax should not be negative').toBeGreaterThanOrEqual(0);
  expect(
    totals.totalCents,
    `Total ${formatCents(totals.totalCents)} should equal item total ${formatCents(totals.subtotalCents)} + tax ${formatCents(totals.taxCents)}`,
  ).toBe(totals.subtotalCents + totals.taxCents);
}
