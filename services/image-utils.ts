const PLACEHOLDER_PATTERNS = /placeholder|\.svg\?|data:image\/|pixel\.gif|1x1\.(gif|png)|spacer\.(gif|png)|blank\.(gif|png)/i;

export const MAX_IMAGES_IMAGE = 10;

/** Resolve image URLs to absolute http/https URIs; Replicate only accepts URI format. Skips placeholders to avoid 404s. */
export function toAbsoluteImageUris(
  imageUrls: string[],
  baseUrl: string | null,
  max: number,
): string[] {
  const base = baseUrl?.startsWith('http') ? baseUrl : null;
  const out: string[] = [];
  for (const raw of imageUrls.slice(0, max)) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    let href: string;
    try {
      href = base ? new URL(trimmed, base).href : trimmed;
    } catch {
      continue;
    }
    if (!href.startsWith('http://') && !href.startsWith('https://')) continue;
    if (PLACEHOLDER_PATTERNS.test(href)) continue;
    out.push(href);
  }
  return out;
}
