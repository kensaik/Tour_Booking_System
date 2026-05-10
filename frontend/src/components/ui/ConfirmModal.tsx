import Modal from "./Modal";
import { AlertCircle, CheckCircle, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "confirm" | "danger" | "success";
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "confirm",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  isLoading = false,
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 className="w-12 h-12 text-error" />;
      case "success":
        return <CheckCircle className="w-12 h-12 text-primary" />;
      default:
        return <AlertCircle className="w-12 h-12 text-primary" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-error hover:bg-error/90 text-white shadow-error/20";
      case "success":
        return "bg-primary hover:bg-primary-container text-white shadow-primary/20";
      default:
        return "bg-primary hover:bg-primary-container text-white shadow-primary/20";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-full bg-surface-container mb-2">{getIcon()}</div>
        <p className="text-on-surface-variant leading-relaxed">{message}</p>

        <div className="flex gap-3 w-full mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl font-bold bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 ${getButtonClass()}`}
          >
            {isLoading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
