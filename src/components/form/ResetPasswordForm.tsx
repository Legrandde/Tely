import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppInput } from "../shared/ui/AppInput";
import { AppButton } from "../shared/ui/AppButton";
import { IconEye } from "../shared/ui/IconEye";
import { resetPassword } from "../../services/authService";

export function ResetPasswordForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; global?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (password.length < 6) e.password = "6 caractères minimum";
    if (confirmPassword !== password) e.confirmPassword = "Les mots de passe ne correspondent pas";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !email) {
      setErrors({ global: "Lien invalide ou expiré, redemande un nouveau lien." });
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      navigate("/auth/login?reset=success");
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Token invalide ou expiré";
      setErrors({ global: errorMsg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
        Nouveau mot de passe
      </h1>
      <p className="text-sm text-gray-400 mb-7">Choisis un nouveau mot de passe</p>

      {errors.global && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3.5">
          {errors.global}
        </div>
      )}

      <div className="flex flex-col gap-3.5 mb-5">
        <AppInput
          label="Nouveau mot de passe"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.password}
          iconRight={<IconEye open={showPassword} />}
          onIconRightClick={() => setShowPassword((v) => !v)}
        />
        <AppInput
          label="Confirmer le mot de passe"
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.confirmPassword}
          iconRight={<IconEye open={showConfirm} />}
          onIconRightClick={() => setShowConfirm((v) => !v)}
        />
      </div>

      <AppButton variant="primary" type="submit" loading={loading} fullWidth>
        Réinitialiser
      </AppButton>

      <p className="text-center text-xs text-gray-400 mt-5">
        <Link to="/auth/login" className="text-gray-900 font-semibold cursor-pointer hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}