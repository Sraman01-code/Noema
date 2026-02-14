// lib/money.ts

export type Currency = "USD" | "INR";

const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
};

/**
 * Formats a number as currency.
 * Defaults to USD to avoid accidental locale coupling.
 */
export function formatMoney(
  amount: number,
  currency: Currency = "USD"
): string {
  return `${CURRENCY_SYMBOL[currency]}${amount.toFixed(2)}`;
}

/**
 * Helper for deposits / balances (no decimals if whole number)
 */
export function formatBalance(
  amount: number,
  currency: Currency = "USD"
): string {
  return Number.isInteger(amount)
    ? `${CURRENCY_SYMBOL[currency]}${amount}`
    : formatMoney(amount, currency);
}
