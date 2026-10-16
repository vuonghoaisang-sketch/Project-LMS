export function formatPrice(value: number | string): string {
  const n = Number(value) || 0;
  return n === 0 ? 'Free' : `$${n.toFixed(2)}`;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('vi-VN');
}
