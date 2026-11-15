/**
 * Mini-markdown sûr : produit uniquement des éléments React (aucun HTML injecté).
 * Pris en charge : paragraphes (ligne vide), sauts de ligne, listes « - » / « 1. »,
 * **gras**, *italique*, [lien](url) — url filtrée (http(s), /…, #…, mailto:, tel:).
 */
import type { ReactNode } from "react";
import { SmartLink } from "./shared";
import { lienSur } from "../utils/liens";

const MOTIF_INLINE = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|\[[^\]\n]+\]\([^)\s]+\))/g;

function rendreInline(texte: string, cleBase: string, lienClasse: string): ReactNode[] {
  const morceaux = texte.split(MOTIF_INLINE);
  return morceaux.map((m, i) => {
    const cle = `${cleBase}-${i}`;
    if (!m) return null;
    if (m.startsWith("**") && m.endsWith("**") && m.length > 4) {
      return (
        <strong key={cle} className="font-semibold">
          {m.slice(2, -2)}
        </strong>
      );
    }
    if (m.startsWith("*") && m.endsWith("*") && m.length > 2) {
      return <em key={cle}>{m.slice(1, -1)}</em>;
    }
    const lien = m.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (lien) {
      const [, libelle, url] = lien;
      if (!lienSur(url)) return <span key={cle}>{libelle}</span>;
      return (
        <SmartLink key={cle} href={url} className={lienClasse}>
          {libelle}
        </SmartLink>
      );
    }
    return <span key={cle}>{m}</span>;
  });
}

export default function Markdown({
  texte,
  className = "",
  clair = false,
}: {
  texte: string;
  className?: string;
  clair?: boolean;
}) {
  if (!texte.trim()) return null;
  const lienClasse = clair
    ? "font-semibold text-amber-300 underline underline-offset-4 hover:text-amber-200"
    : "font-semibold text-gray-900 underline decoration-amber-500 decoration-2 underline-offset-4 hover:text-amber-600";

  const blocs = texte.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/);

  return (
    <div className={`space-y-4 ${className}`}>
      {blocs.map((bloc, bi) => {
        const lignes = bloc.split("\n");
        const puces = lignes.every((l) => /^\s*[-*•]\s+/.test(l));
        const numeros = lignes.every((l) => /^\s*\d+[.)]\s+/.test(l));
        if (puces || numeros) {
          const Liste = numeros ? "ol" : "ul";
          return (
            <Liste key={bi} className={`space-y-2 pl-5 ${numeros ? "list-decimal" : "list-disc"} marker:text-amber-500`}>
              {lignes.map((l, li) => (
                <li key={li} className="pl-1">
                  {rendreInline(l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, ""), `${bi}-${li}`, lienClasse)}
                </li>
              ))}
            </Liste>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-line">
            {rendreInline(bloc, String(bi), lienClasse)}
          </p>
        );
      })}
    </div>
  );
}
