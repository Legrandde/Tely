import { Monitor, Moon, Sun, Check } from "lucide-react";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  { value: "light", label: "Clair", icon: <Sun className="size-4" /> },
  { value: "dark", label: "Sombre", icon: <Moon className="size-4" /> },
  { value: "system", label: "Système", icon: <Monitor className="size-4" /> },
];

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn("text-muted-foreground hover:text-foreground", className)}
          aria-label="Changer le thème (clair / sombre)"
          title="Changer le thème"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="size-4" aria-hidden="true" />
          ) : (
            <Sun className="size-4" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() => setTheme(opt.value)}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {opt.icon}
              {opt.label}
            </span>
            {theme === opt.value && <Check className="size-3.5 text-amber-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
