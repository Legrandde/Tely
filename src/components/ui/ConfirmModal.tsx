import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  loading?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  loading,
  confirmLabel = "Confirmer",
  loadingLabel = "Traitement...",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="tely-card tely-animate w-full max-w-sm p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="tely-title text-xl">{title}</h3>
            {description && (
              <p className="tely-subtitle mt-1.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="tely-icon-btn shrink-0"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="tely-btn-outline flex-1"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="tely-btn flex-1"
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
