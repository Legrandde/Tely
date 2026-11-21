import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { AppInput } from "../shared/ui/AppInput";
import { AppButton } from "../shared/ui/AppButton";
import { IconEye } from "../shared/ui/IconEye";
import { IconGoogle } from "../shared/ui/IconGoogle";
import {
  register,
  loginWithGoogle,
  cheminApresConnexion,
  codeErreurApi,
  extraireCheminFrom,
} from "../../services/authService";
import { useAuth } from "../../context/authContext";
import api from "../../api/axio";

/** Score 1–4 et libellé de la robustesse d'un mot de passe. */
function forceMotDePasse(mdp: string): { score: number; label: string; couleur: string } {
  if (!mdp) return { score: 0, label: "", couleur: "bg-gray-200" };
  let score = 0;
  if (mdp.length >= 8) score++;
  if (mdp.length >= 12) score++;
  if (/[a-z]/.test(mdp) && /[A-Z]/.test(mdp)) score++;
  if (/\d/.test(mdp)) score++;
  if (/[^A-Za-z0-9]/.test(mdp)) score++;
  if (mdp.length < 8) score = Math.min(score, 1);
  const niveau = Math.min(4, Math.max(1, score));
  const table = [
    { label: "Trop faible", couleur: "bg-red-500" },
    { label: "Moyen", couleur: "bg-amber-400" },
    { label: "Bon", couleur: "bg-amber-500" },
    { label: "Excellent", couleur: "bg-emerald-500" },
  ];
  return { score: niveau, ...table[niveau - 1] };
}
import { trackEvent } from "../../services/analyticsTracker";

export function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [inscriptionsFermees, setInscriptionsFermees] = useState<string | null>(null);

  // Les inscriptions peuvent être fermées par l'administrateur
  useEffect(() => {
    let annule = false;
    api
      .get<{ parametres?: { inscriptions_ouvertes?: string } }>("/api/site/parametres")
      .then(({ data }) => {
        if (!annule && data?.parametres?.inscriptions_ouvertes === "0") {
          setInscriptionsFermees("Les inscriptions sont momentanément fermées. Revenez bientôt !");
        }
      })
      .catch(() => {
        // En cas d'échec, le serveur reste l'arbitre (403 inscriptions_fermees)
      });
    return () => {
      annule = true;
    };
  }, []);

  const [values, setValues] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepteConditions, setAccepteConditions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nom?: string;
    prenom?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    conditions?: string;
    global?: string;
  }>({});

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

  const force = forceMotDePasse(values.password);

  function validate() {
    const e: typeof errors = {};
    if (values.nom.trim().length < 2) e.nom = "Nom trop court";
    if (values.prenom.trim().length < 2) e.prenom = "Prénom trop court";
    if (!values.email.includes("@")) e.email = "Email invalide";
    if (values.password.length < 8) e.password = "8 caractères minimum";
    if (values.confirmPassword !== values.password)
      e.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!accepteConditions)
      e.conditions = "Veuillez accepter les conditions d'utilisation et la politique de confidentialité";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inscriptionsFermees) return;
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
      void trackEvent("register");
      flushSync(() => setUser(user));
      navigate(cheminApresConnexion(user, getTargetRedirectPath()), { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Une erreur est survenue, réessaie";
      if (codeErreurApi(err) === "inscriptions_fermees") {
        setInscriptionsFermees(message || "Les inscriptions sont momentanément fermées.");
        setErrors({});
        return;
      }
      setErrors({ global: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
      <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-1">
        Créer un compte
      </h1>
      <p className="text-sm text-gray-400 mb-6">Rejoins Tely et commence à t'exercer</p>

      {inscriptionsFermees && (
        <div role="alert" className="flex items-start gap-2.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-[10px] px-3 py-2.5 mb-4">
          <Lock size={15} className="shrink-0 mt-px" aria-hidden="true" />
          <div>
            <p className="font-semibold">Inscriptions fermées</p>
            <p className="mt-0.5">{inscriptionsFermees}</p>
          </div>
        </div>
      )}

      {errors.global && (
        <p className="text-xs text-red-500 mb-3.5" role="alert">
          {errors.global}
        </p>
      )}

      <fieldset disabled={!!inscriptionsFermees} className={`contents ${inscriptionsFermees ? "[&>*]:opacity-50" : ""}`}>
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
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          placeholder="••••••••"
          error={errors.password}
          iconRight={<IconEye open={showPassword} />}
          onIconRightClick={() => setShowPassword((v) => !v)}
        />
        {values.password && (
          <div className="-mt-1.5" aria-live="polite">
            <div className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= force.score ? force.couleur : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Robustesse : <span className="font-semibold text-gray-700">{force.label}</span>
              {force.score < 3 && " · ajoutez majuscules, chiffres ou symboles"}
            </p>
          </div>
        )}
        <AppInput
          label="Confirmer le mot de passe"
          type={showConfirm ? "text" : "password"}
          value={values.confirmPassword}
          onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
          placeholder="••••••••"
          error={errors.confirmPassword}
          iconRight={<IconEye open={showConfirm} />}
          onIconRightClick={() => setShowConfirm((v) => !v)}
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer select-none mb-0 leading-relaxed">
        <input
          type="checkbox"
          checked={accepteConditions}
          onChange={(e) => {
            setAccepteConditions(e.target.checked);
            if (e.target.checked) setErrors((er) => ({ ...er, conditions: undefined }));
          }}
          aria-invalid={!!errors.conditions}
          className="accent-gray-900 w-3.5 h-3.5 mt-0.5 shrink-0"
        />
        <span>
          J'accepte les{" "}
          <Link to="/p/cgu" target="_blank" rel="noopener" className="tely-link">
            conditions d'utilisation
          </Link>{" "}
          et la{" "}
          <Link to="/p/confidentialite" target="_blank" rel="noopener" className="tely-link">
            politique de confidentialité
          </Link>
        </span>
      </label>
      {errors.conditions && <p className="tely-error mt-1.5">{errors.conditions}</p>}
      </fieldset>

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
          disabled={!!inscriptionsFermees}
          iconLeft={<IconGoogle />}
          fullWidth
        >
          Inscription avec Google
        </AppButton>
        <p className="text-[11px] text-gray-400 mt-1.5 text-center">
          En continuant avec Google, vous acceptez nos{" "}
          <Link to="/p/cgu" target="_blank" rel="noopener" className="underline hover:text-gray-700">CGU</Link> et notre{" "}
          <Link to="/p/confidentialite" target="_blank" rel="noopener" className="underline hover:text-gray-700">politique de confidentialité</Link>.
        </p>
      </div>

      <AppButton
        variant="primary"
        type="submit"
        loading={loading}
        fullWidth
        disabled={!!inscriptionsFermees}
      >
        Créer mon compte
      </AppButton>

      <p className="text-center text-xs text-gray-400 mt-5">
        Déjà un compte ?
        <Link
          to="/auth/login"
          state={location.state}
          className="text-gray-900 font-semibold cursor-pointer ml-1 hover:underline"
        >
          Connexion
        </Link>
      </p>
    </form>
  );
}
