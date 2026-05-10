/** Format số tiền sang dạng VNĐ: 3,500,000đ */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

/** Format ngày ISO sang dạng dd/MM/yyyy theo locale Việt Nam */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN");
}

/** Format ngày + giờ */
export function formatDateTime(dateString: string | Date): string {
  return new Date(dateString).toLocaleString("vi-VN");
}
