export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN");
}

export function formatDateTime(dateString: string | Date): string {
  return new Date(dateString).toLocaleString("vi-VN");
}
