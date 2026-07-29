import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, FileCheck2, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8 border-t border-slate-800 relative overflow-hidden">
      {/* Element de décoration en fond */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                T
              </div>
              <span>Tely<span className="text-amber-400">.</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              La plateforme éducative de référence pour réviser, s'entraîner aux exercices et réussir vos examens en toute sérénité.
            </p>
          </div>

          {/* Navigation Rapide */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/exercices" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <BookOpen size={14} className="text-amber-500" /> Exercices
                </Link>
              </li>
              <li>
                <Link to="/exercices?type=sujet_examen" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <FileCheck2 size={14} className="text-amber-500" /> Sujets d'Examen
                </Link>
              </li>
              <li>
                <Link to="/exercices?avec_correction=true" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-amber-500" /> Corrigés Détaillés
                </Link>
              </li>
            </ul>
          </div>

          {/* Niveaux d'études */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Niveaux d'études</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">Collège (6ème - 3ème)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Lycée (Seconde - Terminale)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Préparation Baccalauréat</li>
              <li className="hover:text-white transition-colors cursor-pointer">Sujets du Brevet</li>
            </ul>
          </div>

          {/* Newsletter / Appel à l'action */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Prêt à progresser ?</h3>
            <p className="text-xs text-slate-400">
              Rejoignez des milliers d'élèves et de professeurs dès aujourd'hui.
            </p>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20"
            >
              Créer un compte gratuit <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Droits & Mentions */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tely. Tous droits réservés.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Mentions légales</span>
            <span className="hover:text-slate-400 cursor-pointer">Politique de confidentialité</span>
            <span className="hover:text-slate-400 cursor-pointer">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
