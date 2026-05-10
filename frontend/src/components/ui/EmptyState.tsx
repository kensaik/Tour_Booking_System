import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center shadow-sm">
      {Icon && (
        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl font-bold text-on-surface mb-2">{title}</h3>
      {description && (
        <p className="text-on-surface-variant mb-8 max-w-[480px] mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary hover:bg-primary-container text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
