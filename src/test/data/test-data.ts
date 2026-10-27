// Static test data used by step definitions.
// Product names, expected messages and invalid inputs are written in the feature files, so a
// reviewer reads them next to the scenario. Credentials and the base URL come from config/.

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Used by "I submit valid checkout information". */
export const CUSTOMER: Customer = {
  firstName: 'Test',
  lastName: 'Customer',
  postalCode: '12345',
};

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

/** Option value → label shown in the sort dropdown. */
export const SORT_LABELS: Record<SortOption, string> = {
  az: 'Name (A to Z)',
  za: 'Name (Z to A)',
  lohi: 'Price (low to high)',
  hilo: 'Price (high to low)',
};

/** Maps a label written in a feature file (e.g. "Price (low to high)") to its option value. */
export function sortOptionFor(label: string): SortOption {
  const entry = Object.entries(SORT_LABELS).find(([, text]) => text === label);
  if (!entry) {
    throw new Error(
      `Unknown sort option "${label}". Use one of: ${Object.values(SORT_LABELS).join(', ')}.`,
    );
  }
  return entry[0] as SortOption;
}
