import { AlertTriangle } from "lucide-react";

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
  confirmLabel = "Supprimer",
  loadingLabel = "Suppression...",
  cancelLabel = "Annuler",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const isWarning = variant === "warning";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              isWarning ? "bg-amber-50" : "bg-red-50"
            }`}
          >
            <AlertTriangle
              size={18}
              className={isWarning ? "text-amber-500" : "text-red-500"}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 text-sm font-medium border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-60 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 text-sm font-medium text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-60 cursor-pointer ${
              isWarning
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
