import api from "../api/axio";
import type { Media, Pagination } from "../features/pagebuilder/types";

export const TYPES_MEDIA_ACCEPTES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const TAILLE_MEDIA_MAX = 5 * 1024 * 1024;

export async function listMedias(page = 1): Promise<Pagination<Media>> {
  const { data } = await api.get<{ medias: Pagination<Media> }>("/api/admin/medias", { params: { page } });
  return data.medias;
}

export async function uploadMedia(
  fichier: File,
  alt?: string,
  onProgress?: (pourcentage: number) => void
): Promise<Media> {
  const form = new FormData();
  form.append("fichier", fichier);
  if (alt?.trim()) form.append("alt", alt.trim());
  const { data } = await api.post<{ message: string; media: Media }>("/api/admin/medias", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data.media;
}

export async function deleteMedia(id: number): Promise<void> {
  await api.delete(`/api/admin/medias/${id}`);
}

/** Vérifie un fichier avant envoi ; retourne un message d'erreur ou null. */
export function verifierFichierMedia(fichier: File): string | null {
  if (!TYPES_MEDIA_ACCEPTES.includes(fichier.type)) {
    return `« ${fichier.name} » : format non pris en charge (JPG, PNG, WebP ou GIF).`;
  }
  if (fichier.size > TAILLE_MEDIA_MAX) {
    return `« ${fichier.name} » dépasse 5 Mo.`;
  }
  return null;
}

export function formaterTaille(octets: number): string {
  if (!Number.isFinite(octets) || octets <= 0) return "—";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
