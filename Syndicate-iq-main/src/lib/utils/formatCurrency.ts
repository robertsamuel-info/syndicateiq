export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}
