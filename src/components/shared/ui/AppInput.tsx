import { useState } from "react";

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
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center">
        <label className={`text-xs font-medium tracking-wide ${error ? "text-red-500" : "text-gray-400"}`}>
          {label}
        </label>
        {hint && (
          <span
            onClick={onHintClick}
            className="text-[11px] text-gray-400 cursor-pointer hover:text-gray-700 transition-colors"
          >
            {hint}
          </span>
        )}
      </div>

      <div
        className={`flex items-center bg-gray-50 border rounded-[10px] px-3 gap-2 transition-all duration-200
          ${error ? "border-red-500" : focused ? "border-gray-900 shadow-[0_0_0_3px_rgba(17,17,17,0.06)]" : "border-gray-200"}`}
      >
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 py-3.5 font-normal placeholder:text-gray-400"
        />
        {iconRight && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onIconRightClick}
            className="text-gray-400 flex items-center cursor-pointer hover:text-gray-600 transition-colors"
          >
            {iconRight}
          </button>
        )}
      </div>

      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  );
}