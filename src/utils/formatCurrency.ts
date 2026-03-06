export function formatINR(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return '🔴 N/A';
  if (amount >= 10000000) return `₹\${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹\${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹\${amount.toLocaleString('en-IN')}`;
  return `₹\${amount}`;
}

export function formatNumber(n: number | null | undefined) {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString('en-IN');
}

export function formatPercent(rate: number | null | undefined) {
  if (rate === null || rate === undefined) return '-';
  return `\${(rate * 100).toFixed(1)}%`;
}
