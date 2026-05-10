import { Link } from 'react-router-dom'

interface EmptyStateProps {
  title?: string
  message?: string
  description?: string
  actionLabel?: string
  actionText?: string
  actionLink?: string
  onAction?: () => void | Promise<void>
}

export default function EmptyState({
  title,
  message,
  description,
  actionLabel,
  actionText,
  actionLink,
  onAction,
}: EmptyStateProps) {
  const body = description ?? message
  const cta = actionLabel ?? actionText

  return (
    <div className="bg-surface-container-low rounded-xl p-8 text-center">
      {title && (
        <h3 className="text-on-surface text-lg font-semibold mb-2">{title}</h3>
      )}
      {body && <p className="text-on-surface-variant mb-4">{body}</p>}
      {cta && onAction && (
        <button
          type="button"
          onClick={() => {
            void onAction()
          }}
          className="inline-block bg-primary hover:bg-primary-container text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          {cta}
        </button>
      )}
      {cta && !onAction && actionLink && (
        <Link
          to={actionLink}
          className="inline-block bg-primary hover:bg-primary-container text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          {cta}
        </Link>
      )}
    </div>
  )
}
