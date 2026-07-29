import { Link } from "react-router-dom";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";
import Header from "../components/ui/Header";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center text-center">
        {/* Illustration / Icône */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-orange-100 rounded-full blur-2xl opacity-60" />
          </div>
          <FileQuestion
            size={120}
            className="relative text-orange-500 drop-shadow-lg"
            strokeWidth={1.5}
          />
        </div>

        {/* Titre et message */}
        <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 tracking-tight">
          404
        </h1>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-700">
          Page non trouvée
        </h2>
        <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-md">
          Oups ! La page que vous cherchez semble avoir disparu dans la
          dimension des exercices oubliés.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <Home size={18} />
            Retour à l'accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Page précédente
          </button>
        </div>

        {/* Suggestions / Liens utiles */}
        <div className="mt-12 pt-8 border-t border-gray-200 w-full max-w-md">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Vous cherchez peut-être ?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/exercices"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Tous les exercices
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/cours"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Cours
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/contact"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>

        {/* Petit easter egg / décoration */}
        <div className="mt-12 text-xs text-gray-400">
          <span className="inline-block animate-bounce-slow">⬇</span>{" "}
          Perdu ? Pas de panique, on est là !{" "}
          <span className="inline-block animate-bounce-slow">⬇</span>
        </div>
      </div>
    </div>
  );
}