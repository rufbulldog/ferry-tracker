import type { Theme } from './themes';

/**
 * Tab-bar tint colors derived from a theme, with a contrast guarantee.
 *
 * Using `primary` / `textMuted` directly failed on several themes:
 *  • dark-primary themes (Kraken Navy, Mariners Navy, Storm Green) put a navy or
 *    forest-green active icon on a near-identical dark bar — invisible;
 *  • light-neutral primaries (Seahawks Wild Grey / Rivalries, Kraken) were
 *    nearly the same shade as `textMuted`, so selecting a tab changed nothing.
 *
 * Active: the first of primary → pillText that is a real color (not grey) and
 * reads against the bar, else the theme's text color (near-white on dark bars).
 * Inactive: `textMuted` blended toward the bar so it sits clearly behind active.
 */

// Minimum WCAG contrast for the active icon against the tab bar (UI graphics).
const MIN_ACTIVE_CONTRAST = 3;
// Below this chroma (max−min channel, 0–1) a color reads as grey: too close to
// the grey inactive icons to signal selection, so it isn't used as the active tint.
const MIN_ACTIVE_CHROMA = 0.15;
// How far textMuted is pulled toward the bar background for inactive tabs.
const INACTIVE_MIX = 0.45;

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function chroma(hex: string): number {
  const c = parseHex(hex);
  if (!c) return 0;
  return (Math.max(...c) - Math.min(...c)) / 255;
}

export function contrastRatio(a: string, b: string): number {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return 1;
  const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return a;
  return toHex([0, 1, 2].map(i => ca[i] + (cb[i] - ca[i]) * t) as Rgb);
}

export function tabBarColors(theme: Theme): { active: string; inactive: string } {
  const { primary, pillText, text, textMuted, cardBg } = theme.colors;
  const active =
    [primary, pillText].find(
      c => chroma(c) >= MIN_ACTIVE_CHROMA && contrastRatio(c, cardBg) >= MIN_ACTIVE_CONTRAST,
    ) ?? text;
  const inactive = mix(textMuted, cardBg, INACTIVE_MIX);
  return { active, inactive };
}
