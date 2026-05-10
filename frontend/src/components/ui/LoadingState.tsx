interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message = 'Đang tải dữ liệu...' }: LoadingStateProps) {
  return <div className="text-center py-20 text-on-surface-variant">{message}</div>
}
