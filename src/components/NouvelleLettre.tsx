import { useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import api from "../api/axio";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
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
          "Merci ! Votre inscription à la newsletter est confirmée. Un e-mail de bienvenue vient de vous être envoyé."
      );
      setEmail("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full bg-amber-50 px-4 py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-xl border border-amber-200/70 bg-white px-6 py-10 text-center shadow-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Mail size={22} />
        </div>
        <h2 className="text-2xl font-bold text-black sm:text-3xl">
          Restons en contact !
        </h2>
        <p className="mx-auto max-w-md text-base text-black/70">
          Abonnez-vous pour recevoir nos nouveaux exercices corrigés, nos sujets d'examen et nos conseils de révision directement par e-mail.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre adresse e-mail…"
            disabled={loading}
            className="w-full rounded-lg border border-gray-200 bg-amber-50/60 px-5 py-3 text-sm text-black outline-none transition-colors focus:border-amber-500 focus:bg-white disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition-colors duration-200 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                S'abonner <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {successMsg && (
          <div className="mt-2 flex max-w-md items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-left text-xs font-medium text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-2 flex max-w-md items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-left text-xs font-medium text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </section>
  );
}
