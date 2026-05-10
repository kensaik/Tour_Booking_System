import type { ComponentType } from "react";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  TOUR_STATUS,
  COMPANY_STATUS,
  DEPARTURE_STATUS,
} from "@/lib/status";

type StatusType = "booking" | "payment" | "tour" | "company" | "departure";

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  showIcon?: boolean;
}

const STATUS_MAP: Record<
  StatusType,
  Record<string, { label: string; colorClass: string; icon?: ComponentType<{ className?: string }> }>
> = {
  booking: BOOKING_STATUS,
  payment: PAYMENT_STATUS,
  tour: TOUR_STATUS,
  company: COMPANY_STATUS,
  departure: DEPARTURE_STATUS,
};

export default function StatusBadge({ status, type, showIcon = true }: StatusBadgeProps) {
  const map = STATUS_MAP[type];
  const normalizedStatus = status?.toLowerCase();
  const config = map[normalizedStatus] || {
    label: status,
    colorClass: "bg-surface-container text-on-surface-variant",
  };
  const Icon = "icon" in config ? config.icon : null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.colorClass}`}
    >
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
}
