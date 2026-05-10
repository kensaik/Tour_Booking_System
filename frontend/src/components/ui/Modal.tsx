import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  disableBackdropClose?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  disableBackdropClose = false,
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {!disableBackdropClose && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      {disableBackdropClose && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />}

      <div
        className={`relative w-full ${maxWidth} min-w-[320px] mx-auto bg-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-outline-variant`}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="text-xl font-bold text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
