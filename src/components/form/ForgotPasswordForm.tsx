import { useState } from "react";
import { Link } from "react-router-dom";
import { AppInput } from "../shared/ui/AppInput";
import { AppButton } from "../shared/ui/AppButton";
import { forgotPassword } from "../../services/authService";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Email invalide");
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Une erreur est survenue";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col">
        <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Vérifie ta boîte mail
        </h1>
        <p className="text-sm text-gray-400 mb-7">
          Si un compte existe avec l'adresse <span className="text-gray-700">{email}</span>, un lien de réinitialisation vient d'être envoyé.
        </p>
        <Link to="/auth/login" className="text-gray-900 font-semibold text-sm hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
        Mot de passe oublié
      </h1>
      <p className="text-sm text-gray-400 mb-7">
        Entre ton email, on t'envoie un lien pour le réinitialiser
      </p>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3.5">
          {error}
        </div>
      )}

      <div className="mb-5">
        <AppInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello.alex@gmail.com"
        />
      </div>

      <AppButton variant="primary" type="submit" loading={loading} fullWidth>
        Envoyer le lien
      </AppButton>

      <p className="text-center text-xs text-gray-400 mt-5">
        <Link to="/auth/login" className="text-gray-900 font-semibold cursor-pointer hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}