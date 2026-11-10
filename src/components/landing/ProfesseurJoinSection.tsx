import { useState, useRef } from "react";
import { GoArrowRight } from "react-icons/go";
import { X, CheckCircle2, Loader2, Upload } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { submitCandidature } from "../../services/candidatureService";

const DISCIPLINES = [
  "Mathématiques",
  "Sciences Physiques & Chimie",
  "Sciences de la Vie et de la Terre (SVT)",
  "Français & Littérature",
  "Histoire & Géographie",
  "Anglais",
  "Philosophie",
  "Économie & Gestion",
  "Autre discipline",
];

export default function ProfesseurJoinSection() {
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successSent, setSuccessSent] = useState(false);

  // Form state
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [specialite, setSpecialite] = useState(DISCIPLINES[0]);
  const [etablissement, setEtablissement] = useState("");
  const [diplome, setDiplome] = useState("");
  const [experience, setExperience] = useState<number | string>(3);
  const [message, setMessage] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setNom("");
    setPrenom("");
    setEmail("");
    setTelephone("");
    setSpecialite(DISCIPLINES[0]);
    setEtablissement("");
    setDiplome("");
    setExperience(3);
    setMessage("");
    setCvFile(null);
    setSuccessSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      addToast("warning", "Veuillez renseigner votre nom, prénom et email.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("prenom", prenom);
      formData.append("email", email);
      if (telephone) formData.append("telephone", telephone);
      formData.append("specialite", specialite);
      if (etablissement) formData.append("etablissement", etablissement);
      if (diplome) formData.append("diplome", diplome);
      if (experience) formData.append("experience_annees", String(experience));
      if (message) formData.append("message", message);
      if (cvFile) formData.append("cv", cvFile);

      await submitCandidature(formData);
      setSuccessSent(true);
      addToast("success", "Candidature soumise avec succès !");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Erreur lors de la soumission. Veuillez réessayer.";
      addToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-amber-50 px-4 py-8">
      {/* ── Bloc épuré aux règles existantes de l'application ── */}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-lg border bg-white px-6 py-10 text-center shadow-lg">
        <h2 className="text-2xl font-bold text-black sm:text-3xl">
          Vous êtes enseignant ? Rejoignez Tely
        </h2>
        <p className="mx-auto max-w-xl text-base text-black/70 leading-relaxed">
          Participez à l'aventure pédagogique. Publiez vos exercices, anciens sujets et corrigés détaillés pour accompagner des milliers d'élèves. Votre compte sera activé après validation de votre candidature.
        </p>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="mt-2 flex items-center justify-center gap-3 rounded-lg bg-black hover:bg-neutral-800 px-6 py-3 font-semibold text-white shadow-md transition-colors cursor-pointer"
        >
          Postuler comme enseignant <GoArrowRight />
        </button>
      </div>

      {/* ── Modal simple & épurée ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative text-black border border-gray-200">
            {/* Bouton fermer */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            {successSent ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Candidature transmise !</h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Votre demande a bien été reçue. Notre équipe va examiner votre profil et vous transmettra vos accès par email dès son approbation.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-xl font-bold text-black">Candidature Enseignant</h3>
                  <p className="text-xs text-black/60 mt-0.5">
                    Remplissez vos informations pour rejoindre l'équipe pédagogique.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      placeholder="Votre prénom"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-amber-50/50 border-gray-200 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Votre nom"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-amber-50/50 border-gray-200 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="professeur@exemple.com"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-amber-50/50 border-gray-200 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+221 ..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-amber-50/50 border-gray-200 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Discipline enseignée <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={specialite}
                      onChange={(e) => setSpecialite(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-amber-50/50 border-gray-200 outline-none focus:border-amber-500"
                    >
                      {DISCIPLINES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Années d'expérience
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-amber-50/50 border-gray-200 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Établissement
                    </label>
                    <input
                      type="text"
                      value={etablissement}
                      onChange={(e) => setEtablissement(e.target.value)}
                      placeholder="Lycée, Collège, École..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-amber-50/50 border-gray-200 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Dernier diplôme
                    </label>
                    <input
                      type="text"
                      value={diplome}
                      onChange={(e) => setDiplome(e.target.value)}
                      placeholder="Master, CAPES, Licence..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-amber-50/50 border-gray-200 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Motivation / Message
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Votre parcours ou les niveaux que vous souhaitez aborder..."
                    className="w-full text-xs px-3.5 py-2 rounded-lg border bg-amber-50/50 border-gray-200 outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* CV File */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    CV (optionnel, PDF ou Word)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-gray-300 hover:border-amber-500 rounded-lg p-2.5 text-center cursor-pointer bg-amber-50/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-600 truncate">
                      {cvFile ? cvFile.name : "Cliquez pour joindre votre CV"}
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 font-semibold text-black text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Envoi...
                      </>
                    ) : (
                      "Soumettre ma candidature"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
