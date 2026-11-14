import { createPortal } from "react-dom";

interface PrintableDocumentProps {
  titre: string;
  /** Ligne d'identification : matière, niveau, éventuellement année / session */
  meta: (string | null | undefined)[];
  enonce: string;
}

/**
 * Document dédié à l'impression / « Enregistrer en PDF ».
 * Invisible à l'écran ; à l'impression, seul ce bloc est rendu
 * (voir la règle @media print dans index.css) : titre, niveau, énoncé.
 */
export function PrintableDocument({ titre, meta, enonce }: PrintableDocumentProps) {
  const ligneMeta = meta.filter(Boolean).join(" · ");

  return createPortal(
    <article id="tely-print-root" aria-hidden="true">
      {ligneMeta && <p className="tely-print-meta">{ligneMeta}</p>}
      <h1 className="tely-print-title">{titre}</h1>
      <div className="tely-print-body">{enonce}</div>
    </article>,
    document.body
  );
}

/**
 * Lance l'impression en donnant au fichier PDF le titre du document
 * (le navigateur utilise document.title comme nom de fichier par défaut).
 */
export function imprimerDocument(titre: string) {
  const titreInitial = document.title;
  document.title = titre;
  const restaurer = () => {
    document.title = titreInitial;
    window.removeEventListener("afterprint", restaurer);
  };
  window.addEventListener("afterprint", restaurer);
  window.print();
}
