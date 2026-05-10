import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300) // Match animation duration
  }

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-secondary" />
      case 'error': return <XCircle className="w-5 h-5 text-error" />
      default: return <Info className="w-5 h-5 text-primary" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'border-secondary/20 bg-surface-container-highest shadow-secondary/5'
      case 'error': return 'border-error/20 bg-surface-container-highest shadow-error/5'
      default: return 'border-primary/20 bg-surface-container-highest shadow-primary/5'
    }
  }

  return (
    <div className={`
      fixed top-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl transition-all duration-300
      ${getBgColor()}
      ${isExiting ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0 animate-in slide-in-from-right'}
    `}>
      <div className="shrink-0">{getIcon()}</div>
      <p className="text-sm font-medium text-on-surface leading-tight pr-2">{message}</p>
      <button 
        onClick={handleClose}
        className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
