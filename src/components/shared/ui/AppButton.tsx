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
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2 rounded-[10px] px-5 py-3.5
        text-sm font-semibold tracking-[0.01em] transition-all duration-200
        ${fullWidth ? "w-full" : "w-auto"}
        ${disabled || loading ? "cursor-not-allowed" : "cursor-pointer"}
        ${
          variant === "primary"
            ? "bg-gray-900 text-white border border-transparent hover:bg-gray-700 hover:shadow-lg hover:-translate-y-px disabled:bg-gray-300"
            : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:shadow-sm"
        }
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {iconLeft && <span className="flex items-center">{iconLeft}</span>}
          {children}
        </>
      )}
    </button>
  );
}