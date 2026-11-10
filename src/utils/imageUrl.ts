export function resolveImageUrl(urlOrPath?: string | null): string | null {
  if (!urlOrPath) return null;
  if (
    urlOrPath.startsWith("http://") ||
    urlOrPath.startsWith("https://") ||
    urlOrPath.startsWith("data:") ||
    urlOrPath.startsWith("blob:")
  ) {
    return urlOrPath;
  }

  // Si c'est un chemin public frontend relatif (ex: /banner.png)
  if (urlOrPath.startsWith("/") && !urlOrPath.startsWith("/storage")) {
    return urlOrPath;
  }

  const apiBase = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  const cleanPath = urlOrPath.startsWith("/") ? urlOrPath.slice(1) : urlOrPath;

  if (cleanPath.startsWith("storage/")) {
    return `${apiBase}/${cleanPath}`;
  }

  return `${apiBase}/storage/${cleanPath}`;
}
