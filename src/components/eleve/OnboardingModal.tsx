import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, GraduationCap, BookOpen, Target, X } from "lucide-react";
import { getMatieres, getNiveaux } from "../../services/exerciceService";
import { messageErreur, terminerOnboarding } from "../../services/eleveService";
import { useAuth } from "../../context/authContext";
import { useToast } from "../../context/ToastContext";
import type { Matiere, Niveau } from "../../types/exercice";
import type { ObjectifEleve, ProfilEleve } from "../../types/eleve";

interface OnboardingModalProps {
  open: boolean;
  eleve?: ProfilEleve | null;
  /** « Plus tard » : la modale réapparaîtra à la prochaine visite */
  onPlusTard: () => void;
  onTermine: () => void;
}

const OBJECTIFS: Array<{ valeur: ObjectifEleve; titre: string; texte: string; emoji: string }> = [
  { valeur: "examen", titre: "Préparer un examen", texte: "BFEM, BAC, compositions…", emoji: "🎯" },
  { valeur: "remise_a_niveau", titre: "Me remettre à niveau", texte: "Combler mes lacunes", emoji: "🧱" },
  { valeur: "approfondir", titre: "Approfondir", texte: "Aller plus loin que le cours", emoji: "🚀" },
  { valeur: "autre", titre: "Autre chose", texte: "Je découvre Tely", emoji: "✨" },
];

const ETAPES = [
  { titre: "Votre niveau", icone: GraduationCap },
  { titre: "Vos matières", icone: BookOpen },
  { titre: "Votre objectif", icone: Target },
];

export default function OnboardingModal({ open, eleve, onPlusTard, onTermine }: OnboardingModalProps) {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [etape, setEtape] = useState(0);
  const [niveaux, setNiveaux] = useState<Niveau[] | null>(null);
  const [matieres, setMatieres] = useState<Matiere[] | null>(null);
  const [erreurChargement, setErreurChargement] = useState(false);
  const [tentative, setTentative] = useState(0);

  const [niveauId, setNiveauId] = useState<number | null>(eleve?.niveau_id ?? null);
  const [classe, setClasse] = useState(eleve?.classe ?? "");
  const [choixMatieres, setChoixMatieres] = useState<number[]>(eleve?.matieres_preferees ?? []);
  const [objectif, setObjectif] = useState<ObjectifEleve | null>(eleve?.objectif ?? null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!open) return;
    let annule = false;
    Promise.all([getNiveaux(), getMatieres()])
      .then(([n, m]) => {
        if (annule) return;
        setNiveaux([...n].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0)));
        setMatieres(m);
        setErreurChargement(false);
      })
      .catch(() => {
        if (!annule) setErreurChargement(true);
      });
    return () => {
      annule = true;
    };
  }, [open, tentative]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !envoi) onPlusTard();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, envoi, onPlusTard]);

  const niveauxParCycle = useMemo(() => {
    const groupes = new Map<string, Niveau[]>();
    (niveaux ?? []).forEach((n) => {
      const cle = n.cycle || "Autres";
      groupes.set(cle, [...(groupes.get(cle) ?? []), n]);
    });
    return [...groupes.entries()];
  }, [niveaux]);

  if (!open) return null;

  const peutContinuer = etape !== 0 || niveauId !== null;

  function basculerMatiere(id: number) {
    setChoixMatieres((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function terminer() {
    if (niveauId === null) {
      setEtape(0);
      return;
    }
    setEnvoi(true);
    try {
      const res = await terminerOnboarding({
        niveau_id: niveauId,
        ...(classe.trim() ? { classe: classe.trim() } : {}),
        ...(choixMatieres.length ? { matieres: choixMatieres } : {}),
        ...(objectif ? { objectif } : {}),
      });
      setUser(res.user ?? user);
      addToast("success", res.message || "Votre espace est prêt !");
      onTermine();
    } catch (err) {
      addToast("error", messageErreur(err, "Impossible d'enregistrer vos préférences. Réessayez."));
    } finally {
      setEnvoi(false);
    }
  }

  const chargement = !erreurChargement && (niveaux === null || matieres === null);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-titre"
        className="tely-card tely-animate w-full sm:max-w-xl max-h-[92vh] flex flex-col rounded-b-none sm:rounded-lg"
      >
        {/* En-tête */}
        <div className="p-5 sm:p-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="tely-overline">Bienvenue{user?.prenom ? `, ${user.prenom}` : ""} 👋</p>
              <h2 id="onboarding-titre" className="tely-title text-xl sm:text-2xl mt-1">
                Personnalisons votre espace
              </h2>
              <p className="tely-subtitle mt-1">3 questions rapides pour vous recommander les bons exercices.</p>
            </div>
            <button
              type="button"
              onClick={onPlusTard}
              disabled={envoi}
              className="tely-icon-btn shrink-0"
              aria-label="Fermer et compléter plus tard"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progression */}
          <ol className="flex items-center gap-2 mt-5" aria-label="Progression">
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="flex-1" aria-current={i === etape ? "step" : undefined}>
                <div className={`h-1.5 rounded-full transition-colors ${i <= etape ? "bg-amber-500" : "bg-gray-100"}`} />
                <span className={`hidden sm:block text-[11px] mt-1.5 font-medium ${i === etape ? "text-gray-900" : "text-gray-400"}`}>
                  {i + 1}. {e.titre}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Corps */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {erreurChargement ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">Impossible de charger les niveaux et matières.</p>
              <button type="button" className="tely-btn-outline mt-4" onClick={() => setTentative((t) => t + 1)}>
                Réessayer
              </button>
            </div>
          ) : chargement ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 animate-pulse" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-11 rounded-[10px] bg-gray-100" />
              ))}
            </div>
          ) : etape === 0 ? (
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-3">
                En quelle classe êtes-vous ? <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-4">
                {niveauxParCycle.map(([cycle, liste]) => (
                  <div key={cycle}>
                    <p className="tely-label mb-2 capitalize">{cycle}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {liste.map((n) => {
                        const id = Number(n.id);
                        const choisi = niveauId === id;
                        return (
                          <button
                            key={n.id}
                            type="button"
                            role="radio"
                            aria-checked={choisi}
                            onClick={() => setNiveauId(id)}
                            className={`px-3 py-2.5 rounded-[10px] border text-sm font-medium text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-gray-900 ${
                              choisi
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            {n.libelle}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <label htmlFor="onboarding-classe" className="tely-label block mb-1.5">
                  Classe (facultatif)
                </label>
                <input
                  id="onboarding-classe"
                  type="text"
                  value={classe}
                  maxLength={50}
                  onChange={(e) => setClasse(e.target.value)}
                  placeholder="Ex : Tle S2, 3e B…"
                  className="tely-input"
                />
              </div>
            </fieldset>
          ) : etape === 1 ? (
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-1">Quelles matières voulez-vous travailler ?</legend>
              <p className="tely-subtitle mb-4">Choisissez-en autant que vous voulez (facultatif).</p>
              <div className="flex flex-wrap gap-2">
                {(matieres ?? []).map((m) => {
                  const id = Number(m.id);
                  const choisi = choixMatieres.includes(id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={choisi}
                      onClick={() => basculerMatiere(id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-gray-900 ${
                        choisi
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {choisi && <Check size={14} aria-hidden="true" />}
                      {m.nom}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-4">Quel est votre objectif principal ?</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {OBJECTIFS.map((o) => {
                  const choisi = objectif === o.valeur;
                  return (
                    <button
                      key={o.valeur}
                      type="button"
                      role="radio"
                      aria-checked={choisi}
                      onClick={() => setObjectif(o.valeur)}
                      className={`flex items-start gap-3 p-3.5 rounded-[10px] border text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-gray-900 ${
                        choisi ? "border-gray-900 bg-gray-50 shadow-sm" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <span className="text-xl leading-none" aria-hidden="true">
                        {o.emoji}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">{o.titre}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">{o.texte}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
        </div>

        {/* Pied */}
        <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-between gap-3">
          {etape === 0 ? (
            <button type="button" onClick={onPlusTard} disabled={envoi} className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer px-2 py-2">
              Plus tard
            </button>
          ) : (
            <button type="button" onClick={() => setEtape((e) => e - 1)} disabled={envoi} className="tely-btn-outline px-4">
              <ArrowLeft size={16} aria-hidden="true" /> Retour
            </button>
          )}

          {etape < ETAPES.length - 1 ? (
            <button
              type="button"
              onClick={() => setEtape((e) => e + 1)}
              disabled={!peutContinuer || chargement || erreurChargement}
              className="tely-btn"
            >
              Continuer <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" onClick={terminer} disabled={envoi || niveauId === null} className="tely-btn">
              {envoi ? "Enregistrement..." : "C'est parti !"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
