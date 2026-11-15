import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { lienSur as estLienSur } from "../../utils/liens";

/** Liens acceptés : http(s), relatifs `/…`, ancres `#…`, `mailto:` et `tel:`. */
// eslint-disable-next-line react-refresh/only-export-components
export function lienSur(url: string | null | undefined): string | null {
  const u = (url ?? "").trim();
  return estLienSur(u) ? u : null;
}

interface SmartLinkProps {
  href: string | null | undefined;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}

/** Lien interne (react-router) ou externe sécurisé selon l'URL ; rien si l'URL est refusée. */
export default function SmartLink({ href, className, children, onClick, ...rest }: SmartLinkProps) {
  const url = lienSur(href);
  if (!url) return null;
  if (url.startsWith("/")) {
    return (
      <Link to={url} className={className} onClick={onClick} aria-label={rest["aria-label"]}>
        {children}
      </Link>
    );
  }
  const externe = /^https?:\/\//i.test(url);
  return (
    <a
      href={url}
      className={className}
      onClick={onClick}
      aria-label={rest["aria-label"]}
      {...(externe ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
