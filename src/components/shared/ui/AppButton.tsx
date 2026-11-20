import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  fullWidth?: boolean;
  type?: "button" | "submit";
}

export function AppButton({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  loading = false,
  iconLeft,
  fullWidth = true,
  type = "button",
}: AppButtonProps) {
  return (
    <Button
      type={type}
      variant={variant === "primary" ? "default" : "outline"}
      size="lg"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(fullWidth ? "w-full" : "w-auto")}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {iconLeft && <span className="flex items-center">{iconLeft}</span>}
          {children}
        </>
      )}
    </Button>
  );
}
