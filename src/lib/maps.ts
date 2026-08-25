/**
 * 地圖嵌入網址（#38）。
 *
 * 地圖一律由「地址」推導，改地址地圖就跟著動，不需要另外維護一組座標。
 * 只有在真的貼了自訂嵌入網址時才改用那組網址。
 */

/**
 * A hardcoded embed URL shipped as the default for `googleMapEmbed`, with the
 * office's coordinates baked into it. Because it was non-empty it always won
 * over the address, so changing the address in the admin moved nothing (#38) —
 * and the setting was never exposed in the admin, so it could not be cleared
 * by hand either. Treated as absent wherever an embed URL is read, which fixes
 * stored copies (site settings and the seeded contact block) without having to
 * rewrite block JSON.
 */
const RETIRED_EMBED_FRAGMENTS = ["!2d121.473!3d25.085"];

export function isRetiredEmbed(url: string | undefined | null): boolean {
  if (!url) return false;
  return RETIRED_EMBED_FRAGMENTS.some((f) => url.includes(f));
}

/**
 * 回傳可放進 iframe 的地圖網址；地址與自訂網址都沒有時回傳 null（呼叫端不要畫地圖）。
 */
export function mapEmbedSrc(address?: string, embedUrl?: string): string | null {
  const override = isRetiredEmbed(embedUrl) ? "" : embedUrl?.trim();
  if (override) return override;

  const query = address?.trim();
  if (!query) return null;

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=zh-TW`;
}
