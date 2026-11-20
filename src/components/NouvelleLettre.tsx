import { useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import api from "@/api/axio";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <section id="newsletter" className="w-full px-4 py-14 sm:px-6 lg:px-8">
      <Card className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-10 sm:py-12 text-center shadow-sm">
        <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
          <Mail className="size-5 text-amber-500" />
        </span>
        <h2 className="tely-title text-2xl sm:text-3xl">
          Restons en contact
        </h2>
        <p className="mx-auto max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
          Abonnez-vous pour recevoir nos nouveaux exercices corrigés, nos sujets d'examen et nos conseils de révision directement par e-mail.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-2 flex w-full max-w-md flex-col gap-2.5 sm:flex-row"
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre adresse e-mail…"
            disabled={loading}
            className="h-11 flex-1"
          />
          <Button
            type="submit"
            variant="brand"
            size="lg"
            disabled={loading}
            className="h-11 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                S'abonner <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        {successMsg && (
          <div className="mt-1 flex max-w-md items-center gap-2 text-left text-xs font-medium text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-1 flex max-w-md items-center gap-2 text-left text-xs font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0 text-destructive" />
            <span>{errorMsg}</span>
          </div>
        )}
      </Card>
    </section>
  );
}
