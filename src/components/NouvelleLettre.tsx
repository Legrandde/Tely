import { useId, useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import api from "../api/axio";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputId = useId();
  const messageId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setErrorMsg("Veuillez saisir une adresse e-mail valide.");
      setSuccessMsg(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data } = await api.post("/api/newsletter", { email: trimmed });
      setSuccessMsg(
        data?.message ??
          "Merci ! Votre inscription est confirmée. Un e-mail de bienvenue vient de vous être envoyé."
      );
      setEmail("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="newsletter" aria-labelledby="newsletter-titre" className="w-full scroll-mt-20 px-4 py-16 sm:py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-3xl border border-amber-100 bg-white px-6 py-10 text-center shadow-xl shadow-amber-900/5 sm:px-12">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Mail size={22} aria-hidden="true" />
        </span>
        <h2 id="newsletter-titre" className="tely-title text-2xl sm:text-3xl">
          Recevez les nouveaux exercices chaque semaine
        </h2>
        <p className="mx-auto max-w-md text-base text-gray-600">
          Nouveaux exercices corrigés, sujets d'examen et conseils de révision, directement dans votre boîte mail.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <label htmlFor={inputId} className="sr-only">
            Adresse e-mail
          </label>
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            disabled={loading}
            aria-invalid={!!errorMsg}
            aria-describedby={messageId}
            className="tely-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-amber-500 px-6 py-3.5 text-sm font-semibold text-gray-900 transition-colors duration-200 hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Envoi…
              </>
            ) : (
              <>
                S'abonner <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div id={messageId} aria-live="polite" className="min-h-5">
          {successMsg && (
            <p className="flex max-w-md items-center gap-2 text-left text-xs font-medium text-emerald-700">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" aria-hidden="true" />
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="flex max-w-md items-center gap-2 text-left text-xs font-medium text-red-600">
              <AlertCircle size={15} className="shrink-0 text-red-600" aria-hidden="true" />
              {errorMsg}
            </p>
          )}
          {!successMsg && !errorMsg && (
            <p className="text-xs text-gray-400">Pas de spam. Désinscription en un clic.</p>
          )}
        </div>
      </div>
    </section>
  );
}
