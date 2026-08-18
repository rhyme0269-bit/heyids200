/**
 * Runtime-customisable brand palette.
 *
 * Tailwind 4 compiles colour utilities to `var(--color-stone-800)` rather than a
 * literal, and the variables live in `:root`. Overriding those variables at
 * runtime therefore re-skins the whole site without touching a single class name.
 *
 * The client edits five anchors; the remaining scale steps are interpolated from
 * them so a changed anchor always produces a coherent ramp. Both families are
 * warm and close in hue, so plain sRGB interpolation is smooth enough here and
 * avoids pulling in a colour-space dependency.
 *
 * The static defaults in globals.css mirror the output of this function for the
 * default anchors, and act as the fallback before this style is applied.
 */

export interface BrandColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  subText: string;
}

export const defaultBrandColors: BrandColors = {
  primary: "#4a3428",
  secondary: "#b08d57",
  background: "#f5f1eb",
  text: "#2d2a26",
  subText: "#7a6a5a",
};

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

type RGB = [number, number, number];

const HEX_RE = /^#[0-9a-f]{6}$/i;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

function parse(hex: string): RGB {
  const h = hex.trim().replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex([r, g, b]: RGB): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return "#" + [r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("");
}

/**
 * t = 0 returns `from`, t = 1 returns `to`.
 *
 * Blends in gamma-encoded sRGB. Linear-light blending was tried and is worse for
 * this scale: it desaturates the tints (amber-50 came out near-neutral instead of
 * cream) and barely darkens the shades. The known cost is that a blend between
 * two hue-distant anchors passes through a muddy midpoint, which here can only
 * affect amber-600/700 if the office picks a primary and secondary far apart on
 * the wheel. Those two steps are decorative (a card accent gradient and a few
 * hover states, ~23 usages) and never carry text, so readability is unaffected.
 */
function mix(from: RGB, to: RGB, t: number): RGB {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

/**
 * Where each scale step sits relative to the anchors. stone ramps
 * background → sub text → text and then darkens; amber lightens from the
 * secondary gold, ramps into the primary brown, and then darkens.
 */
export function buildScales(colors: BrandColors) {
  const bg = parse(colors.background);
  const sub = parse(colors.subText);
  const text = parse(colors.text);
  const secondary = parse(colors.secondary);
  const primary = parse(colors.primary);

  return {
    stone: {
      50: toHex(bg),
      100: toHex(mix(bg, sub, 0.1)),
      200: toHex(mix(bg, sub, 0.22)),
      300: toHex(mix(bg, sub, 0.42)),
      400: toHex(mix(bg, sub, 0.66)),
      500: toHex(mix(bg, sub, 0.86)),
      600: toHex(sub),
      700: toHex(mix(sub, text, 0.55)),
      800: toHex(text),
      900: toHex(mix(text, BLACK, 0.18)),
      950: toHex(mix(text, BLACK, 0.35)),
    },
    amber: {
      50: toHex(mix(secondary, WHITE, 0.9)),
      100: toHex(mix(secondary, WHITE, 0.78)),
      200: toHex(mix(secondary, WHITE, 0.58)),
      300: toHex(mix(secondary, WHITE, 0.38)),
      400: toHex(mix(secondary, WHITE, 0.19)),
      500: toHex(secondary),
      600: toHex(mix(secondary, primary, 0.3)),
      700: toHex(mix(secondary, primary, 0.65)),
      800: toHex(primary),
      900: toHex(mix(primary, BLACK, 0.28)),
    },
  };
}

/** The subset of site settings this module needs. SiteSettings satisfies it. */
export interface BrandColorSettings {
  colorPrimary?: string;
  colorSecondary?: string;
  colorBackground?: string;
  colorText?: string;
  colorSubText?: string;
}

/**
 * Reads the brand anchors off site settings, falling back per-field so a missing
 * or malformed value can never blank out the site.
 */
export function brandColorsFromSettings(settings: BrandColorSettings): BrandColors {
  const pick = (key: keyof BrandColors, value: string | undefined) =>
    value && isValidHex(value) ? value.trim().toLowerCase() : defaultBrandColors[key];

  return {
    primary: pick("primary", settings.colorPrimary),
    secondary: pick("secondary", settings.colorSecondary),
    background: pick("background", settings.colorBackground),
    text: pick("text", settings.colorText),
    subText: pick("subText", settings.colorSubText),
  };
}

/**
 * Emitted as an inline <style>. Selector is doubled so it outranks the `:root`
 * block Tailwind emits, whatever order the two end up in.
 */
export function buildThemeCss(colors: BrandColors): string {
  const { stone, amber } = buildScales(colors);
  const decls = [
    `--background:${colors.background}`,
    `--foreground:${colors.text}`,
    `--color-gold:${colors.secondary}`,
    ...Object.entries(stone).map(([step, hex]) => `--color-stone-${step}:${hex}`),
    ...Object.entries(amber).map(([step, hex]) => `--color-amber-${step}:${hex}`),
  ];
  return `:root:root{${decls.join(";")}}`;
}
