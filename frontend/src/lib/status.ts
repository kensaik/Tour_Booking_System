import { CheckCircle, Clock, XCircle } from 'lucide-react'

export const BOOKING_STATUS: Record<string, { label: string; colorClass: string; icon: typeof CheckCircle }> = {
  confirmed: { label: 'Đã xác nhận', colorClass: 'bg-primary/10 text-primary', icon: CheckCircle },
  pending: { label: 'Chờ xác nhận', colorClass: 'bg-secondary/10 text-secondary', icon: Clock },
  cancelled: { label: 'Đã hủy', colorClass: 'bg-error-container text-error', icon: XCircle },
  completed: { label: 'Hoàn thành', colorClass: 'bg-surface-container text-on-surface-variant', icon: CheckCircle },
}

export const PAYMENT_STATUS: Record<string, { label: string; colorClass: string }> = {
  paid: { label: 'Đã thanh toán', colorClass: 'bg-green-100 text-green-700' },
  fully_paid: { label: 'Đã thanh toán', colorClass: 'bg-green-100 text-green-700' },
  deposit_paid: { label: 'Đã đặt cọc', colorClass: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Chờ thanh toán', colorClass: 'bg-amber-100 text-amber-700' },
  unpaid: { label: 'Chưa thanh toán', colorClass: 'bg-amber-100 text-amber-700' },
  refunded: { label: 'Đã hoàn tiền', colorClass: 'bg-surface-container text-on-surface-variant' },
}

export const TOUR_STATUS: Record<string, { label: string; colorClass: string }> = {
  active: { label: 'Đang hoạt động', colorClass: 'bg-primary/10 text-primary' },
  approved: { label: 'Đang hoạt động', colorClass: 'bg-primary/10 text-primary' },
  draft: { label: 'Chờ duyệt', colorClass: 'bg-surface-container text-on-surface-variant' },
  inactive: { label: 'Không hoạt động', colorClass: 'bg-error-container text-error' },
}

export const COMPANY_STATUS: Record<string, { label: string; colorClass: string }> = {
  approved: { label: 'Đã duyệt', colorClass: 'bg-primary/10 text-primary' },
  pending: { label: 'Chờ duyệt', colorClass: 'bg-tertiary/10 text-tertiary' },
  rejected: { label: 'Đã từ chối', colorClass: 'bg-error-container text-error' },
}

export const DEPARTURE_STATUS: Record<string, { label: string; colorClass: string }> = {
  active: { label: 'Đang hoạt động', colorClass: 'bg-primary/10 text-primary' },
  full: { label: 'Đã đầy', colorClass: 'bg-error-container text-error' },
  draft: { label: 'Chờ duyệt', colorClass: 'bg-surface-container text-on-surface-variant' },
}
