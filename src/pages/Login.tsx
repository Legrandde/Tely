import { useState } from "react";

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconEye = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const IconGoogle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ─── AppInput ────────────────────────────────────────────────────────────────

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

function AppInput({
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
      {/* Label row */}
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

      {/* Input row */}
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

// ─── AppButton ───────────────────────────────────────────────────────────────

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

function AppButton({
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

// ─── Main LoginForm ───────────────────────────────────────────────────────────

export default function LoginForm() {
  const [email, setEmail] = useState("hello.alex@gmail.com");
  const [password, setPassword] = useState("411");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email.includes("@")) e.email = "Email invalide";
    if (password.length < 3) e.password = "Mot de passe trop court";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-[860px] animate-[fadeSlideIn_.5s_ease_both]">

        {/* URL pill */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-500 w-fit mx-auto mb-7 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-blue-500" />
          <span>tely.sn</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col md:flex-row w-full overflow-hidden min-h-[520px]">

          {/* ── LEFT: image panel ─────────────────────────────── */}
          <div className="hidden md:block md:w-[42%] shrink-0 relative overflow-hidden">
            <img
              src="https://i.pinimg.com/736x/ae/c5/7c/aec57c021d6ffac7e28208c9599b61af.jpg"
              alt="Tely E-learning visual"
              className="w-full h-full object-cover"
            />
            {/* subtle dark gradient overlay at bottom for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* ── RIGHT: form ───────────────────────────────────── */}
          <div className="flex-1 px-8 py-12 md:px-11 flex flex-col justify-center">

            {/* Logo */}
            <div className="flex items-center gap-2 mb-7">
              <div className="w-7 h-7 rounded-[8px] bg-gray-900 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
                  <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity=".6" />
                  <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".6" />
                  <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".3" />
                </svg>
              </div>
              <span className="text-[15px] font-semibold text-gray-900 tracking-[-0.01em]">
                Tely Elearning
              </span>
            </div>

            <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome Back!
            </h1>
            <p className="text-sm text-gray-400 mb-7">Enter Your Details Below</p>

            {/* Inputs */}
            <div className="flex flex-col gap-3.5 mb-3.5">
              <AppInput
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hello.alex@gmail.com"
                error={errors.email}
              />
              <AppInput
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                hint="Forgot password?"
                onHintClick={() => {}}
                error={errors.password}
                iconRight={<IconEye open={showPassword} />}
                onIconRightClick={() => setShowPassword(v => !v)}
              />
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none mb-0">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="accent-gray-900 w-3.5 h-3.5"
              />
              Remember me
            </label>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-medium tracking-[0.05em] whitespace-nowrap">
                OR CONTINUE WITH
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <div className="mb-3.5">
              <AppButton variant="outline" onClick={() => {}} iconLeft={<IconGoogle />} fullWidth>
                Log in with Google
              </AppButton>
            </div>

            {/* Submit */}
            <AppButton variant="primary" onClick={handleSubmit} loading={loading} type="submit" fullWidth>
              Log in
            </AppButton>

            {/* Sign up */}
            <p className="text-center text-xs text-gray-400 mt-5">
              Don't have an account?
              <span className="text-gray-900 font-semibold cursor-pointer ml-1 hover:underline">
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Keyframe for card entrance */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}