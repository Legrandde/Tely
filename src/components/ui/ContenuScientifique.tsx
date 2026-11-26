import { Fragment, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface ContenuScientifiqueProps {
  texte: string;
  className?: string;
}

type Segment =
  | { type: "texte"; valeur: string }
  | { type: "math-bloc"; valeur: string }
  | { type: "math-inline"; valeur: string };

/**
 * Découpe un texte en segments (texte brut, formules blocs $$...$$ / \[...\],
 * et formules inline $...$ / \(...\)) sans jamais planter sur des $ isolés.
 */
function decouperSegments(entree: string): Segment[] {
  const regex =
    /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\((.+?)\\\)|(?<!\\)\$([^$\n]+?)(?<!\\)\$/g;

  const resultats: Segment[] = [];
  let dernierIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(entree)) !== null) {
    if (match.index > dernierIndex) {
      resultats.push({ type: "texte", valeur: entree.slice(dernierIndex, match.index) });
    }

    const bloc = match[1] ?? match[2];
    const inline = match[3] ?? match[4];

    if (bloc !== undefined) {
      resultats.push({ type: "math-bloc", valeur: bloc.trim() });
    } else if (inline !== undefined) {
      resultats.push({ type: "math-inline", valeur: inline.trim() });
    }

    dernierIndex = regex.lastIndex;
  }

  if (dernierIndex < entree.length) {
    resultats.push({ type: "texte", valeur: entree.slice(dernierIndex) });
  }

  return resultats;
}

function rendreLatex(expr: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expr, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    return expr;
  }
}

/** Rendu léger du gras **...** dans un fragment de texte brut (100 % sûr, sans innerHTML). */
function rendreTexteEnrichi(texte: string, cleBase: string) {
  const morceaux = texte.split(/(\*\*[^*\n]+\*\*)/g);
  return morceaux.map((m, i) => {
    if (m.startsWith("**") && m.endsWith("**") && m.length > 4) {
      return (
        <strong key={`${cleBase}-b-${i}`} className="font-semibold text-foreground">
          {m.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`${cleBase}-t-${i}`}>{m}</Fragment>;
  });
}

function rendreLigne(ligne: string, cle: string) {
  const segments = decouperSegments(ligne);
  return segments.map((seg, i) => {
    if (seg.type === "math-bloc") {
      return (
        <div
          key={`${cle}-mb-${i}`}
          className="my-3 overflow-x-auto py-1 text-center"
          dangerouslySetInnerHTML={{ __html: rendreLatex(seg.valeur, true) }}
        />
      );
    }
    if (seg.type === "math-inline") {
      return (
        <span
          key={`${cle}-mi-${i}`}
          className="inline-block align-baseline"
          dangerouslySetInnerHTML={{ __html: rendreLatex(seg.valeur, false) }}
        />
      );
    }
    return <Fragment key={`${cle}-tx-${i}`}>{rendreTexteEnrichi(seg.valeur, `${cle}-${i}`)}</Fragment>;
  });
}

/**
 * Affiche un énoncé ou un corrigé pédagogique avec rendu natif des formules
 * mathématiques, physiques et chimiques (KaTeX) et mise en forme propre.
 */
export default function ContenuScientifique({ texte, className }: ContenuScientifiqueProps) {
  const blocs = useMemo(() => {
    const normalise = texte.replace(/\r\n|\r/g, "\n");
    // Préserve les blocs $$...$$ multi-lignes avant de découper par paragraphe
    const parties: Array<{ kind: "math-bloc" | "quote" | "paragraphe"; contenu: string }> = [];
    const regexBloc = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])/g;
    const morceaux = normalise.split(regexBloc);

    for (const m of morceaux) {
      if (!m) continue;
      if ((m.startsWith("$$") && m.endsWith("$$")) || (m.startsWith("\\[") && m.endsWith("\\]"))) {
        parties.push({ kind: "math-bloc", contenu: m.slice(2, -2).trim() });
        continue;
      }

      const lignes = m.split("\n");
      let tampon: string[] = [];

      const viderTampon = () => {
        const joint = tampon.join("\n").trim();
        if (joint) parties.push({ kind: "paragraphe", contenu: joint });
        tampon = [];
      };

      for (const l of lignes) {
        const trim = l.trim();
        if (trim.startsWith(">")) {
          viderTampon();
          parties.push({ kind: "quote", contenu: trim.replace(/^>\s?/, "") });
        } else if (trim === "") {
          viderTampon();
        } else {
          tampon.push(l);
        }
      }
      viderTampon();
    }

    return parties;
  }, [texte]);

  return (
    <div className={cn("space-y-3 leading-relaxed text-foreground/90", className)}>
      {blocs.map((b, idx) => {
        if (b.kind === "math-bloc") {
          return (
            <div
              key={`blk-${idx}`}
              className="my-3 overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: rendreLatex(b.contenu, true) }}
            />
          );
        }
        if (b.kind === "quote") {
          return (
            <blockquote
              key={`blk-${idx}`}
              className="rounded-r-lg border-l-2 border-amber-500 bg-amber-500/10 px-3.5 py-2 text-sm text-muted-foreground"
            >
              {rendreLigne(b.contenu, `q-${idx}`)}
            </blockquote>
          );
        }
        const lignes = b.contenu.split("\n");
        return (
          <p key={`blk-${idx}`} className="whitespace-pre-line">
            {lignes.map((l, li) => (
              <Fragment key={`p-${idx}-${li}`}>
                {li > 0 && <br />}
                {rendreLigne(l, `p-${idx}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
