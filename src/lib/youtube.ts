const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

function isValidVideoId(id: string | null): id is string {
  return !!id && VIDEO_ID_PATTERN.test(id);
}

// Admins can paste watch, short (youtu.be), embed, shorts or nocookie URLs —
// the DB only validates "is a URL", so this has to tolerate all of them.
export function getYoutubeVideoId(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return isValidVideoId(id) ? id : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return isValidVideoId(id) ? id : null;
    }
    const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/);
    return match && isValidVideoId(match[1]) ? match[1] : null;
  }

  return null;
}

export function getYoutubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYoutubeEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}
