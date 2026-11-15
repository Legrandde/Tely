/**
 * Convertit une URL YouTube ou Vimeo en URL d'embed respectueuse de la vie privée.
 * Toute autre URL renvoie `null` (rien n'est affiché).
 */
export function urlEmbedVideo(url: string | undefined | null): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  const hote = u.hostname.replace(/^www\.|^m\./, "");
  const idYoutube = /^[A-Za-z0-9_-]{11}$/;

  if (hote === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return idYoutube.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (hote === "youtube.com" || hote === "youtube-nocookie.com" || hote === "music.youtube.com") {
    let id: string | null = null;
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      if (m) id = m[1];
    }
    return id && idYoutube.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (hote === "vimeo.com" || hote === "player.vimeo.com") {
    const m = u.pathname.match(/(?:^|\/)(\d{5,12})(?:\/|$)/);
    return m ? `https://player.vimeo.com/video/${m[1]}?dnt=1` : null;
  }

  return null;
}
