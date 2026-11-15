import { useState } from "react";
import { flushSync } from "react-dom";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Info, ShieldAlert } from "lucide-react";
import { AppInput } from "../shared/ui/AppInput";
import { AppButton } from "../shared/ui/AppButton";
import { IconEye } from "../shared/ui/IconEye";
import { IconGoogle } from "../shared/ui/IconGoogle";
import {
  login,
  loginWithGoogle,
  cheminApresConnexion,
  codeErreurApi,
  extraireCheminFrom,
} from "../../services/authService";
import { useAuth } from "../../context/authContext";
import GoogleOneTap from "../auth/GoogleOneTap";
import { trackEvent } from "../../services/analyticsTracker";

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  const raison = (location.state as { raison?: unknown } | null)?.raison;
  const erreurUrl = searchParams.get("erreur") ?? searchParams.get("error");
  const messageErreurUrl =
    erreurUrl === "compte_suspendu"
      ? "Votre compte a été suspendu. Contactez l'équipe Tely si vous pensez qu'il s'agit d'une erreur."
      : erreurUrl === "google_auth_failed"
      ? "La connexion avec Google a échoué. Réessayez ou utilisez votre email."
      : erreurUrl === "inscriptions_fermees"
      ? "Les inscriptions sont momentanément fermées : aucun compte n'est associé à cette adresse Google."
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({});
  const [suspendu, setSuspendu] = useState(false);

  function getTargetRedirectPath(): string | null {
    return extraireCheminFrom(location.state);
  }

  function handleGoogleLogin() {
    const targetPath = getTargetRedirectPath();
    if (targetPath) {
      sessionStorage.setItem("auth_redirect", targetPath);
    }
    loginWithGoogle();
  }

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
      void trackEvent("login");
      // Contexte mis à jour immédiatement pour que les routes protégées voient l'utilisateur
      flushSync(() => setUser(user));
      navigate(cheminApresConnexion(user, getTargetRedirectPath()), { replace: true });
    } catch (err: unknown) {
      if (codeErreurApi(err) === "compte_suspendu") {
        setSuspendu(true);
        setErrors({});
        return;
      }
      setSuspendu(false);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Email ou mot de passe incorrect";
      setErrors({ global: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <GoogleOneTap />
      <form onSubmit={handleSubmit} className="flex flex-col">
        <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-1">
          Bienvenue !
        </h1>
        <p className="text-sm text-gray-400 mb-7">Entrer vos informations</p>

        {typeof raison === "string" && raison && !suspendu && !messageErreurUrl && (
          <p className="flex items-start gap-2 text-xs text-gray-700 bg-amber-50 border border-amber-100 rounded-[10px] px-3 py-2.5 mb-3.5">
            <Info size={14} className="text-amber-500 shrink-0 mt-px" aria-hidden="true" />
            {raison}
          </p>
        )}

        {(suspendu || messageErreurUrl) && (
          <div role="alert" className="flex items-start gap-2.5 text-xs text-red-700 bg-red-50 border border-red-100 rounded-[10px] px-3 py-2.5 mb-3.5">
            <ShieldAlert size={16} className="shrink-0 mt-px" aria-hidden="true" />
            <div>
              {suspendu || erreurUrl === "compte_suspendu" ? (
                <>
                  <p className="font-semibold">Compte suspendu</p>
                  <p className="mt-0.5">
                    L'accès à votre compte a été suspendu par l'équipe Tely. Si vous pensez qu'il s'agit d'une erreur,{" "}
                    <Link to="/p/contact" className="underline font-semibold">contactez-nous</Link>.
                  </p>
                </>
              ) : (
                <p>{messageErreurUrl}</p>
              )}
            </div>
          </div>
        )}

        {errors.global && (
          <p className="text-xs text-red-500 mb-3.5" role="alert">
            {errors.global}
          </p>
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
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            hint="Mot de passe oublié ?"
            onHintClick={() => navigate("/auth/forgot-password")}
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
            onClick={handleGoogleLogin}
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
          Vous n'avez pas de compte ?
          <Link
            to="/auth/signup"
            state={location.state}
            className="text-gray-900 font-semibold cursor-pointer ml-1 hover:underline"
          >
            Inscription
          </Link>
        </p>
      </form>
    </>
  );
}
