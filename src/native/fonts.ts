import type { FontKey } from "../engine/types.ts";

const FAMILIES: Readonly<Record<FontKey, Readonly<{ ios: string; android: string }>>> = {
  sans: { ios: "System", android: "sans-serif" },
  serif: { ios: "Georgia", android: "serif" },
  mono: { ios: "Menlo", android: "monospace" },
  comic: { ios: "ChalkboardSE-Regular", android: "sans-serif" },
  display: { ios: "HelveticaNeue-Bold", android: "sans-serif" },
  rounded: { ios: "AvenirNext-Regular", android: "sans-serif" },
  condensed: { ios: "HelveticaNeue", android: "sans-serif-condensed" },
};

export function nativeFont(key: FontKey): string {
  const family = FAMILIES[key];
  return process.env.EXPO_OS === "ios" ? family.ios : family.android;
}

export function withAlpha(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function isDark(hex: string): boolean {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45;
}

export const TILE_GLYPH: Readonly<Record<string, string>> = {
  none: "",
  dots: "· · · · · · · · · · · · · · · · · · · ·",
  grid: "┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼",
  scanlines: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
};
