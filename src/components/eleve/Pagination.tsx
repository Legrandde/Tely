import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  derniere: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, derniere, onChange }: PaginationProps) {
  if (derniere <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3 pt-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="tely-btn-outline px-3 py-2.5"
        aria-label="Page précédente"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-600" aria-live="polite">
        Page <strong className="text-gray-900">{page}</strong> sur {derniere}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= derniere}
        className="tely-btn-outline px-3 py-2.5"
        aria-label="Page suivante"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
