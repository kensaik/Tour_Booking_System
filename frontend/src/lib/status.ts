import { CheckCircle, Clock, XCircle } from 'lucide-react'

export const BOOKING_STATUS: Record<string, { label: string; colorClass: string; icon: typeof CheckCircle }> = {
  confirmed: { label: 'Đã xác nhận', colorClass: 'bg-primary/10 text-primary', icon: CheckCircle },
  pending: { label: 'Chờ xác nhận', colorClass: 'bg-secondary/10 text-secondary', icon: Clock },
  cancelled: { label: 'Đã hủy', colorClass: 'bg-error-container text-error', icon: XCircle },
  completed: { label: 'Hoàn thành', colorClass: 'bg-surface-container text-on-surface-variant', icon: CheckCircle },
}

export const PAYMENT_STATUS: Record<string, { label: string; colorClass: string }> = {
  paid: { label: 'Đã thanh toán', colorClass: 'bg-secondary/10 text-secondary' },
  pending: { label: 'Chưa thanh toán', colorClass: 'bg-tertiary/10 text-tertiary' },
  refunded: { label: 'Đã hoàn tiền', colorClass: 'bg-surface-container text-on-surface-variant' },
}

export const TOUR_STATUS: Record<string, { label: string; colorClass: string }> = {
  active: { label: 'Đang hoạt động', colorClass: 'bg-primary/10 text-primary' },
  approved: { label: 'Đang hoạt động', colorClass: 'bg-primary/10 text-primary' },
  draft: { label: 'Nháp', colorClass: 'bg-surface-container text-on-surface-variant' },
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
  draft: { label: 'Nháp', colorClass: 'bg-surface-container text-on-surface-variant' },
}
