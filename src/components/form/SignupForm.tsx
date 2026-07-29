import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppInput } from "../shared/ui/AppInput";
import { AppButton } from "../shared/ui/AppButton";
import { IconEye } from "../shared/ui/IconEye";
import { IconGoogle } from "../shared/ui/IconGoogle";
import { register, loginWithGoogle } from "../../services/authService";

export function SignupForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepteConditions, setAccepteConditions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nom?: string;
    prenom?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    global?: string;
  }>({});

  function validate() {
    const e: typeof errors = {};
    if (values.nom.trim().length < 2) e.nom = "Nom trop court";
    if (values.prenom.trim().length < 2) e.prenom = "Prénom trop court";
    if (!values.email.includes("@")) e.email = "Email invalide";
    if (values.password.length < 6) e.password = "6 caractères minimum";
    if (values.confirmPassword !== values.password)
      e.confirmPassword = "Les mots de passe ne correspondent pas";
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
      const user = await register({
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
        password: values.password,
        password_confirmation: values.confirmPassword,
        role: "eleve",
      });
      if (user.role === "professeur") navigate("/professeur/dashboard");
      else if (user.role === "administrateur") navigate("/dashbord-admin");
      else navigate("/exercices");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Une erreur est survenue, réessaie";
      setErrors({ global: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
        Créer un compte
      </h1>
      <p className="text-sm text-gray-400 mb-7">Rejoins Tely et commence à t'exercer</p>

      {errors.global && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3.5">
          {errors.global}
        </div>
      )}

      <div className="flex flex-col gap-3.5 mb-3.5">
        <div className="flex gap-3">
          <div className="flex-1">
            <AppInput
              label="Prénom"
              value={values.prenom}
              onChange={(e) => setValues((v) => ({ ...v, prenom: e.target.value }))}
              placeholder="Alex"
              error={errors.prenom}
            />
          </div>
          <div className="flex-1">
            <AppInput
              label="Nom"
              value={values.nom}
              onChange={(e) => setValues((v) => ({ ...v, nom: e.target.value }))}
              placeholder="Diop"
              error={errors.nom}
            />
          </div>
        </div>
        <AppInput
          label="Email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          placeholder="hello.alex@gmail.com"
          error={errors.email}
        />
        <AppInput
          label="Password"
          type={showPassword ? "text" : "password"}
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          placeholder="••••••••"
          error={errors.password}
          iconRight={<IconEye open={showPassword} />}
          onIconRightClick={() => setShowPassword((v) => !v)}
        />
        <AppInput
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          value={values.confirmPassword}
          onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
          placeholder="••••••••"
          error={errors.confirmPassword}
          iconRight={<IconEye open={showConfirm} />}
          onIconRightClick={() => setShowConfirm((v) => !v)}
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none mb-0">
        <input
          type="checkbox"
          checked={accepteConditions}
          onChange={(e) => setAccepteConditions(e.target.checked)}
          className="accent-gray-900 w-3.5 h-3.5"
        />
        J'accepte les conditions d'utilisation
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
          Inscription avec Google
        </AppButton>
      </div>

      <AppButton
        variant="primary"
        type="submit"
        loading={loading}
        fullWidth
        disabled={!accepteConditions}
      >
        Créer mon compte
      </AppButton>

      <p className="text-center text-xs text-gray-400 mt-5">
        Déjà un compte ?
        <Link to="/auth/login" className="text-gray-900 font-semibold cursor-pointer ml-1 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}