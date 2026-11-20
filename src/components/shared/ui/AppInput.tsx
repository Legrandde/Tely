import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AppInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  iconRight?: React.ReactNode;
  onIconRightClick?: () => void;
  error?: string;
  hint?: string;
  onHintClick?: () => void;
}

export function AppInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  iconRight,
  onIconRightClick,
  error,
  hint,
  onHintClick,
}: AppInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center">
        <Label className={cn(error ? "text-destructive" : "text-foreground")}>
          {label}
        </Label>
        {hint && (
          <button
            type="button"
            onClick={onHintClick}
            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            {hint}
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={cn(iconRight && "pr-10")}
        />
        {iconRight && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onIconRightClick}
            className="absolute right-3 text-muted-foreground flex items-center cursor-pointer hover:text-foreground transition-colors"
          >
            {iconRight}
          </button>
        )}
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
