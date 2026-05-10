import { Link } from 'react-router-dom'

interface EmptyStateProps {
  message: string
  actionText?: string
  actionLink?: string
}

export default function EmptyState({ message, actionText, actionLink }: EmptyStateProps) {
  return (
    <div className="bg-surface-container-low rounded-xl p-8 text-center">
      <p className="text-on-surface-variant mb-4">{message}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-block bg-primary hover:bg-primary-container text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  )
}
