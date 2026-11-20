import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        {title ? (
          <DialogTitle>{title}</DialogTitle>
        ) : (
          <DialogTitle className="sr-only">Fenêtre modale</DialogTitle>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
