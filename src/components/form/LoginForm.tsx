import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppInput } from "../shared/ui/AppInput";
import { AppButton } from "../shared/ui/AppButton";
import { IconEye } from "../shared/ui/IconEye";
import { IconGoogle } from "../shared/ui/IconGoogle";
import { login, loginWithGoogle } from "../../services/authService";

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({});

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email.includes("@")) e.email = "Email invalide";
    if (password.length < 3) e.password = "Mot de passe trop court";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === "professeur") navigate("/professeur/dashboard");
      else if (user.role === "administrateur") navigate("/dashbord-admin");
      else navigate("/exercices");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Email ou mot de passe incorrect";
      setErrors({ global: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
        Bienvenue !
      </h1>
      <p className="text-sm text-gray-400 mb-7">Entrer vos informations</p>

      {errors.global && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3.5">
          {errors.global}
        </div>
      )}

      <div className="flex flex-col gap-3.5 mb-3.5">
        <AppInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello.alex@gmail.com"
          error={errors.email}
        />
        <AppInput
          label="Mot de pass"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          hint="Mots de passe oublié?"
          onHintClick={() => {}}
          error={errors.password}
          iconRight={<IconEye open={showPassword} />}
          onIconRightClick={() => setShowPassword((v) => !v)}
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none mb-0">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="accent-gray-900 w-3.5 h-3.5"
        />
        Se souvenir de moi
      </label>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] text-gray-400 font-medium tracking-[0.05em] whitespace-nowrap">
          OU CONTINUER AVEC
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="mb-3.5">
        <AppButton
          type="button"
          variant="outline"
          onClick={loginWithGoogle}
          iconLeft={<IconGoogle />}
          fullWidth
        >
          Connexion avec Google
        </AppButton>
      </div>

      <AppButton variant="primary" type="submit" loading={loading} fullWidth>
        Connexion
      </AppButton>

      <p className="text-center text-xs text-gray-400 mt-5">
        Vous n'avez pas de compte?
        <Link to="/auth/signup" className="text-gray-900 font-semibold cursor-pointer ml-1 hover:underline">
          Inscription
        </Link>
      </p>
    </form>
  );
}