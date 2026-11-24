import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string;
}

export default function Modal({ open, onClose, children, title, maxWidth }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className={cn("sm:max-w-lg", maxWidth)}>
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
