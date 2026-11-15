/** Types MIME personnalisés du glisser-déposer natif HTML5. */
export const MIME_NOUVEAU = "application/x-tely-bloc-type";
export const MIME_DEPLACER = "application/x-tely-bloc-id";

export function contientDonneesBloc(dt: DataTransfer | null): boolean {
  if (!dt) return false;
  const types = Array.from(dt.types);
  return types.includes(MIME_NOUVEAU) || types.includes(MIME_DEPLACER);
}
