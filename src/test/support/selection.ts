import type { TestContext } from '../../core/support/test-context';
import type { LineItem } from './assertions';

// The products a scenario has put in the cart, with the price shown when each was added.
// Steps that add or remove products keep this list in step with the UI, so later steps can
// compare the cart, the checkout overview and the totals against what was actually selected.

const SELECTED_ITEMS = 'selectedItems';

export function getSelectedItems(testContext: TestContext): LineItem[] {
  return testContext.getValueOr<LineItem[]>(SELECTED_ITEMS, []);
}

export function addSelectedItems(testContext: TestContext, items: readonly LineItem[]): void {
  testContext.setValue(SELECTED_ITEMS, [...getSelectedItems(testContext), ...items]);
}

export function removeSelectedItem(testContext: TestContext, name: string): void {
  const remaining = getSelectedItems(testContext).filter((item) => item.name !== name);
  testContext.setValue(SELECTED_ITEMS, remaining);
}
