import { ArrowRight } from "lucide-react";

export default function NewsletterSection() {
  return (
    <section className="w-full bg-amber-50 px-4 py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-lg border bg-white px-6 py-10 text-center shadow-lg">
        <h2 className="text-2xl font-bold text-black sm:text-3xl">Restons en contact !</h2>
        <p className="mx-auto max-w-md text-base text-black/70">
          Abonnez-vous pour recevoir nos nouveautés, nos conseils de révision et bien plus encore.
        </p>

        {/* empile sur mobile, cote a cote a partir de sm */}
        <div className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Entrez votre adresse e-mail…"
            className="w-full rounded-lg border bg-amber-50 px-5 py-3 text-sm text-black outline-none focus:border-amber-500"
          />
          <button className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition-colors duration-200 hover:bg-amber-400 sm:w-auto">
            S'abonner <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
