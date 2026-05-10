interface ErrorStateProps {
  message?: string
}

export default function ErrorState({ message = 'Đã xảy ra lỗi khi tải dữ liệu.' }: ErrorStateProps) {
  return <div className="text-center py-20 text-error">{message}</div>
}
