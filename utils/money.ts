// Money is handled as integer cents so that comparisons are exact and free of floating-point error.

const MONEY_PATTERN = /\$\s?(\d{1,3}(?:,\d{3})+|\d+)\.(\d{2})(?!\d)/;

/** Extracts the first "$1,234.56"-style amount from a label such as "Tax: $3.20" and returns cents. */
export function parseMoneyToCents(text: string): number {
  const match = MONEY_PATTERN.exec(text);
  const [, dollars, cents] = match ?? [];
  if (dollars === undefined || cents === undefined) {
    throw new Error(`Expected a dollar amount with two decimal places in "${text}".`);
  }
  return Number(dollars.replaceAll(',', '')) * 100 + Number(cents);
}

export function formatCents(cents: number): string {
  if (!Number.isInteger(cents)) throw new Error(`Cents must be an integer, received ${cents}.`);
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  return `${sign}$${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`;
}

export function sumCents(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0);
}
