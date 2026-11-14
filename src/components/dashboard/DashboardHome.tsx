import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Briques de l'accueil « orienté actions » des tableaux de bord
   ───────────────────────────────────────────────────────────── */

function salutation(): string {
  const h = new Date().getHours();
  return h < 18 ? "Bonjour" : "Bonsoir";
}

/** En-tête compact : salutation, date du jour et action principale */
export function DashboardHeader({
  prenom,
  sousTitre,
  action,
}: {
  prenom?: string | null;
  sousTitre: string;
  action?: ReactNode;
}) {
  const date = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 tely-animate">
      <div>
        <p className="tely-overline first-letter:uppercase">{date}</p>
        <h1 className="tely-h1 mt-1">
          {salutation()}
          {prenom ? `, ${prenom}` : ""} !
        </h1>
        <p className="tely-subtitle mt-1">{sousTitre}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export interface TacheItem {
  /** Nombre d'éléments concernés ; la tâche est masquée à 0 */
  count: number;
  label: string;
  description: string;
  to: string;
  /** "urgent" : met la tâche en avant (ex. candidatures qui attendent une réponse) */
  priorite?: "urgent" | "normal";
  icon: ReactNode;
}

/** Bloc « À traiter » : uniquement ce qui demande une action */
export function ATraiter({ taches, loading }: { taches: TacheItem[]; loading?: boolean }) {
  const navigate = useNavigate();
  const visibles = taches
    .filter((t) => t.count > 0)
    .sort((a, b) => (a.priorite === "urgent" ? -1 : 0) - (b.priorite === "urgent" ? -1 : 0));

  return (
    <section className="tely-card p-5 sm:p-6 flex flex-col min-w-0 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="tely-title text-xl">À traiter</h2>
          <p className="tely-subtitle">Ce qui attend une action de votre part</p>
        </div>
        {!loading && visibles.length > 0 && (
          <span className="tely-chip">
            {visibles.length} point{visibles.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-[10px] bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[10px] bg-gray-50 px-4 py-5">
          <CheckCircle2 size={22} className="text-gray-900 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Tout est à jour</p>
            <p className="text-xs text-gray-400">Aucune action en attente pour le moment.</p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visibles.map((t) => (
            <li key={t.label}>
              <button
                type="button"
                onClick={() => navigate(t.to)}
                className="group w-full flex items-center gap-4 rounded-[10px] border border-gray-200 bg-white px-4 py-3.5 text-left transition-all duration-200 hover:border-gray-900 hover:shadow-[0_0_0_3px_rgba(17,17,17,0.06)] cursor-pointer"
              >
                <span
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
                    t.priorite === "urgent" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
                  }`}
                >
                  {t.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="tely-title text-xl leading-none">{t.count}</span>
                    <span className="text-sm font-semibold text-gray-900 truncate">{t.label}</span>
                    {t.priorite === "urgent" && (
                      <span className="tely-chip text-red-500">Prioritaire</span>
                    )}
                  </span>
                  <span className="block text-xs text-gray-400 mt-1 truncate">{t.description}</span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-gray-900 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export interface ActionRapide {
  label: string;
  to: string;
  icon: ReactNode;
}

/** Raccourcis vers les actions les plus fréquentes */
export function ActionsRapides({ actions }: { actions: ActionRapide[] }) {
  const navigate = useNavigate();
  return (
    <section className="tely-card p-5 sm:p-6 flex flex-col min-w-0">
      <h2 className="tely-title text-xl">Actions rapides</h2>
      <p className="tely-subtitle mb-4">Vos raccourcis du quotidien</p>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => navigate(a.to)}
            className="flex flex-col items-start gap-3 rounded-[10px] border border-gray-200 bg-white p-3.5 text-left text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-50 hover:border-gray-900 cursor-pointer"
          >
            <span className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center text-gray-900">
              {a.icon}
            </span>
            {a.label}
          </button>
        ))}
      </div>
    </section>
  );
}
