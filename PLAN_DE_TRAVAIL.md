# Plan de Travail — Projet Tely E-learning

> **Audit complet** du projet (**Frontend** `TelyFront` — React 19 / TypeScript / Vite 8 / Tailwind v4 / shadcn/ui & **Backend** `tely` — Laravel 12 / PHP 8.4 / FrankenPHP / Sanctum).  
> **Déploiement actuel** : Vercel (`https://tely-sandy.vercel.app`) + Render (`https://tely-twvr.onrender.com`).

---

## 1. Découpage en Modules Fonctionnels

| ID | Module | État | Périmètre & Fichiers clés | Manques / Améliorations identifiées |
| :--- | :--- | :---: | :--- | :--- |
| **MF-01** | **Vitrine & Conversion (Landing)** | ✅ Opérationnel | `Landing.tsx`, `HeroSection.tsx` (carrousel lycée/collège Guinée), `BenefitsSection.tsx` (parcours guidé 3 questions), `ExploreSection.tsx` (carrousel auto matières), `RecentExercises.tsx`, `ProfesseurJoinSection.tsx`, `FaqSection.tsx`, `FinalCta.tsx` | Connecter les réponses du parcours guidé (objectif, niveau, matière) aux query params de `/exercices` et `/sujets`. |
| **MF-02** | **Authentification & Comptes** | 🟡 À stabiliser | `Login.tsx`, `LoginForm.tsx`, `SignupForm.tsx`, `GoogleOneTap.tsx`, `GoogleCallback.tsx`, `AuthController.php`, `GoogleController.php`, `PasswordResetController.php`, `CompteController.php` (RGPD export/suppression) | Valider Google OAuth & One Tap en production (origines Google Cloud Console), unifier le dark mode sur `LoginForm` / `SignupForm`. |
| **MF-03** | **Catalogue Exercices & Corrigés** | ✅ Opérationnel | `Listeexercices.tsx`, `CourseDetailPage.tsx`, `ContenuScientifique.tsx` (KaTeX), `ExerciceController.php`, `CorrectionController.php`, `ModernFilterBar.tsx` | Rendu KaTeX/LaTeX intégré sur énoncés, corrigés & aperçus ; dark mode harmonisé. |
| **MF-04** | **Sujets d'Examen (BEPC / BAC) & OCR** | 🟡 À enrichir | `ListeSujets.tsx`, `SujetsDetailPage.tsx`, `FormSujetPage.tsx`, `GestionSujets.tsx`, `ImportSujetsModal.tsx`, `PdfPagesPreview.tsx`, `ContenuScientifique.tsx`, `pdfOcr.ts`, `sujetsImportExport.ts`, `PdfController.php`, `PdfVisionService.php`, `SujetExamenController.php` | Rendu KaTeX ajouté sur énoncés & aperçus ; reste à configurer `GEMINI_API_KEY` en prod pour les formules complexes et persister `fichier_pdf` sur stockage objet (R2/S3). |
| **MF-05** | **Espace Élève** | ✅ Opérationnel | `EleveDashboard.tsx`, `MesFavoris.tsx`, `MonHistorique.tsx`, `EspaceComptePage.tsx`, `EspaceEleveController.php`, `HistoriqueController.php` | Ajouter suivi de progression par matière / score de révision et favoris sur les sujets d'examen (actuellement centré sur les exercices). |
| **MF-06** | **Espace Professeur** | ✅ Opérationnel | `DashboardProfesseur.tsx`, `ProfesseurOverView.tsx`, `ProfesseurRessources.tsx`, `FormExercicePage.tsx`, `FormSujetPage.tsx`, `GestionCorrections.tsx`, `ProfesseurDashboardController.php`, `RessourceController.php` | Étendre le pipeline OCR + prévisualisation PDF (`pdfOcr.ts`) à `FormExercicePage.tsx` et `ResourceForm.tsx`. |
| **MF-07** | **Back-office Administrateur** | ✅ Opérationnel | `DashbordAdmin.tsx`, `OverView.tsx`, `AdminStatistiques.tsx`, `GestionUtilisateurs.tsx`, `GestionEleves.tsx`, `GestionProfesseurs.tsx`, `GestionCandidatures.tsx`, `GestionMatieres.tsx`, `GestionNiveaux.tsx`, `GestionCategories.tsx`, `JournalActivite.tsx`, `ParametresPage.tsx` | Exporter aussi les exercices/statistiques en CSV/Excel ; harmoniser la casse des routes (`/Dashbord-admin` → `/admin` avec redirection rétrocompatible). |
| **MF-08** | **CMS / Page Builder & Médiathèque** | ✅ Opérationnel | `PageBuilderPage.tsx`, `PageRenderer.tsx`, `GestionPages.tsx`, `MediathequePage.tsx`, `PublicPage.tsx`, `HeroBloc.tsx`, `PageController.php`, `MediaController.php` | Vérifier la compatibilité mode sombre de tous les blocs CMS (`TexteBloc`, `FaqBloc`, `TarifsBloc`, `TemoignagesBloc`). |
| **MF-09** | **Blog Éditorial & Newsletter** | ✅ Opérationnel | `BlogListe.tsx`, `BlogArticle.tsx`, `BlogEditorPage.tsx`, `GestionBlog.tsx`, `NouvelleLettre.tsx`, `BlogController.php`, `NewsletterController.php`, `NewsletterService.php` | Planifier un cron / worker pour `NewsletterService::diffuserNouveautes()` et connecter un fournisseur mail HTTP (Resend/Brevo). |
| **MF-10** | **Notifications & Analytics** | ✅ Opérationnel | `NotificationsPage.tsx`, `NotificationDropdown.tsx`, `analyticsTracker.ts`, `AppNotificationController.php`, `AnalyticsController.php`, `GeoIpService.php` | Ajouter des alertes temps réel ou polling léger sur les nouvelles candidatures/publications. |

---

## 2. Découpage en Modules Non-Fonctionnels

| ID | Axe Non-Fonctionnel | État | Constat actuel | Risque / Impact |
| :--- | :--- | :---: | :--- | :--- |
| **MNF-01** | **Persistance des données & Fichiers (Infra)** | 🔴 Critique | Render tourne avec **`DB_CONNECTION=sqlite`** et **`FILESYSTEM_DISK=local`**. Le disque Render gratuit est **éphémère**. | **Perte totale de la base de données et des PDF/médias uploadés** à chaque redéploiement ou redémarrage du conteneur. |
| **MNF-02** | **Délivrabilité des E-mails** | 🔴 Critique | `MAIL_MAILER=smtp` (Mailtrap/Gmail). Render gratuit **bloque les ports SMTP sortants (25/465/587)**. | Les e-mails de bienvenue, réinitialisation de mot de passe et candidatures professeurs ne partent pas en production. |
| **MNF-03** | **Rendu Mathématique & Scientifique (KaTeX)** | 🟢 Solide | `katex` installé + composant `ContenuScientifique.tsx` intégré sur `CourseDetailPage`, `SujetsDetailPage`, `FormExercicePage` et `FormSujetPage` (code-splitté hors bundle initial). | Équations `$...$` / `$$...$$` rendues proprement ; reste à activer `GEMINI_API_KEY` pour la transcription LaTeX automatique des scans complexes. |
| **MNF-04** | **Design System & Mode Sombre** | 🟢 Solide | Tokens sémantiques Tailwind/shadcn généralisés sur pages publiques, auth (`LoginForm`, `SignupForm`, `Forgot/Reset`), détails (`CourseDetailPage`, `SujetsDetailPage`), CMS (`shared.tsx`) et couche `.dark` complète dans `index.css` pour le back-office. | Mode clair & mode sombre cohérents sur l'ensemble des parcours. |
| **MNF-05** | **Sécurité & Conformité** | 🟢 Solide | Rate-limiting API, Sanctum, nonce anti-CSRF Google OAuth, CSP + HSTS + Permissions-Policy dans `vercel.json`, middleware `SecurityHeaders`, RGPD export/suppression. | Régénérer `GOOGLE_CLIENT_SECRET` si exposé ; s'assurer que `APP_DEBUG=false` et `APP_ENV=production` restent actifs sur Render. |
| **MNF-06** | **Performance, Bundle & PWA** | 🟢 Solide | PWA installable (`sw.js`, `site.webmanifest`, icônes PNG 192/512/maskable/iOS, `PwaInstallPrompt`), code-splitting dynamique (`pdfjs-dist`, `tesseract.js`, `xlsx`). | Chunk principal `index.js` à ~524 kB (léger découpage possible sur `framer-motion` / `recharts`). |
| **MNF-07** | **Tests Automatisés & CI/CD** | 🟠 Prioritaire | Backend : 5 tests Feature PHPUnit (`SecuriteAuditTest`, `PlateformeTest`, `BlogTest`, etc.). Frontend : **aucun test unitaire ni E2E** et pas de pipeline GitHub Actions sur `TelyFront`. | Risque de régression silencieux (ex. erreurs `tsc -b` découvertes seulement sur Vercel). |

---

## 3. Plan de Travail Morcelé (Feuille de Route)

### Phase 1 — Fiabilisation Production & Infrastructure *(P0 — Urgent)*
Objectif : **zéro perte de données, e-mails fonctionnels, authentification Google 100 % opérationnelle.**

- [ ] **1.1 Migrer la base de données vers PostgreSQL managé** (Neon / Supabase / Render Postgres)
  - Mettre à jour les variables `DB_CONNECTION=pgsql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` sur Render.
  - Exécuter les migrations + seeders de référence (matières, niveaux, catégories, admin).
- [ ] **1.2 Migrer le stockage fichiers vers un stockage objet persistant** (Cloudflare R2 ou AWS S3)
  - Configurer `FILESYSTEM_DISK=s3` + credentials R2/S3 pour conserver définitivement les PDF de sujets (`sujets-pdf/`), avatars, CV et médiathèque.
- [ ] **1.3 Activer un fournisseur d'e-mails HTTP compatible Render** (Resend ou Brevo)
  - Installer `resend/resend-php` (ou transport API Brevo), configurer `MAIL_MAILER=resend` + `RESEND_API_KEY`, tester mail de bienvenue + reset password en prod.
- [ ] **1.4 Finaliser la vérification Google OAuth & One Tap en production**
  - Vérifier dans Google Cloud Console : Origine JS `https://tely-sandy.vercel.app` + URI de redirection `https://tely-twvr.onrender.com/api/auth/google/callback`.
  - Régénérer `GOOGLE_CLIENT_SECRET` par précaution et mettre à jour Render.
- [ ] **1.5 Reconstruire & pousser l'image Docker backend** (si Render déploie depuis Docker Hub) incluant `PdfVisionService`, `fichier_pdf`, logs Google Auth et `storage:link`.

**Critère de validation Phase 1** : Redéploiement Render sans perte de données, inscription + mail de bienvenue reçus, connexion Google OAuth & One Tap validées sur `tely-sandy.vercel.app`.

---

### Phase 2 — Expérience Pédagogique & Contenus Scientifiques *(P1 — Haute valeur)*
Objectif : **rendre les sujets et exercices de Maths/Physique/Chimie/SVT irréprochables pour les lycéens et collégiens.**

- [x] **2.1 Intégrer le rendu KaTeX / LaTeX**
  - Installer `katex` (et un composant léger `<ContenuScientifique />` supportant `$...$` et `$$...$$` + formatage paragraphe).
  - L'appliquer sur `SujetsDetailPage.tsx`, `CourseDetailPage.tsx`, l'onglet **Aperçu** de `FormSujetPage.tsx` et `FormExercicePage.tsx`.
- [ ] **2.2 Activer `GEMINI_API_KEY` en production** (optionnel, quota gratuit)
  - Permettre la transcription automatique des formules LaTeX sur les PDF scannés de Maths / Physique-Chimie.
- [ ] **2.3 Étendre l'OCR PDF + Aperçu visuel aux Exercices**
  - Réutiliser `extraireTextePdf` et `PdfPagesPreview` dans `FormExercicePage.tsx` et `ResourceForm.tsx`.
- [ ] **2.4 Relier le parcours guidé de la Landing aux filtres réels**
  - Passer les choix de `BenefitsSection.tsx` (objectif, niveau, matière) en paramètres d'URL vers `/exercices?…` et `/sujets?…`.

**Critère de validation Phase 2** : Un sujet scanné de Maths BAC importé affiche ses formules rendues en KaTeX et ses figures géométriques via `PdfPagesPreview`, sur mobile comme sur desktop.

---

### Phase 3 — Finition UI/UX & Mode Sombre Intégral *(P2 — Qualité perçue)*
Objectif : **cohérence visuelle 100 % mode clair / mode sombre sur l'ensemble des pages.**

- [x] **3.1 Migrer les pages publiques restantes vers les tokens sémantiques Tailwind/shadcn**
  - `CourseDetailPage.tsx`, `Listeexercices.tsx`, `SujetsDetailPage.tsx`, `ListeSujets.tsx`, `LoginForm.tsx`, `SignupForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`.
- [x] **3.2 Migrer les tableaux back-office & modales vers le mode sombre**
  - Couche `.dark` complète dans `src/index.css` (hover, bordures, badges ambre/rouge/émeraude, textes) couvrant `Gestion*`, `FormSujetPage.tsx`, `FormExercicePage.tsx`.
- [x] **3.3 Harmoniser les blocs CMS du Page Builder en mode sombre**
  - Primitives `Section`, `EnteteSection` et `BoutonLien` migrées dans `src/features/pagebuilder/blocks/shared.tsx`.
- [ ] **3.4 Optimiser le découpage du bundle Vite**
  - Isoler `framer-motion` et les dépendances lourdes dans `manualChunks` (`vite.config.ts`) pour passer sous les 500 kB par chunk.

**Critère de validation Phase 3** : Zéro texte illisible ou carte blanche forcée en basculant en mode sombre sur tous les parcours (visiteur, élève, prof, admin).

---

### Phase 4 — Qualité, Tests Automatisés & CI/CD *(P2 / P3 — Pérennité)*
Objectif : **sécuriser chaque livraison et éliminer les régressions.**

- [ ] **4.1 Mettre en place une CI GitHub Actions sur `TelyFront`**
  - Exécuter automatiquement `npm ci`, `npm run lint` et `npm run build` (`tsc -b && vite build`) sur chaque push / PR.
- [ ] **4.2 Ajouter des tests unitaires frontend (Vitest)**
  - Couvrir `sujetsImportExport.ts` (parsing CSV/Excel/JSON), `authService.ts` (nonce Google, redirections par rôle), `pdfOcr.ts`.
- [ ] **4.3 Compléter les tests Feature backend (PHPUnit)**
  - Ajouter des tests pour `SujetExamenController` (upload `fichier_pdf`), `PdfController` (`force_vision` + fallback), et exécuter `php artisan test` en CI.
- [ ] **4.4 Enrichir l'espace élève (V2)**
  - Favoris sur les sujets d'examen (en plus des exercices), suivi de progression par matière et mode révision hors-ligne PWA des fiches consultées.

**Critère de validation Phase 4** : Pipeline CI vert sur les deux dépôts, couverture des parcours critiques (auth, sujets, OCR/import-export, sécurité).

---

## 4. Résumé des Priorités Immédiates

| Ordre | Action | Statut | Impact | Effort |
| :---: | :--- | :---: | :--- | :---: |
| **1** | PostgreSQL + Stockage objet (R2/S3) sur Render | ⏳ À faire | Évite toute perte de données/PDF | Moyen |
| **2** | E-mails via API HTTP (Resend ou Brevo) | ⏳ À faire | Débloque les e-mails sur Render gratuit | Faible |
| **3** | Intégration de KaTeX sur énoncés & aperçus | ✅ Fait | Rendu parfait des formules Maths/Physique | Faible |
| **4** | Dark mode complet sur pages détail & back-office | ✅ Fait | Cohérence visuelle sur toute l'app | Moyen |
| **5** | CI GitHub Actions (`tsc -b && vite build` + PHPUnit) | ⏳ À faire | Zéro build cassé sur Vercel / Render | Faible |
