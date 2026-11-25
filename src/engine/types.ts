export const AXES = [
  "color",
  "type",
  "space",
  "radius",
  "motion",
  "shadow",
  "decor",
  "cursor",
] as const;

export type Axis = (typeof AXES)[number];
export type SliceKey = Axis;

export const AXIS_LABEL: Readonly<Record<Axis, string>> = {
  color: "Color",
  type: "Type",
  space: "Space",
  radius: "Radius",
  motion: "Motion",
  shadow: "Shadow",
  decor: "Structure",
  cursor: "Cursor",
};

export const AXIS_WEIGHT: Readonly<Record<Axis, number>> = {
  color: 1.4,
  type: 1.3,
  space: 0.8,
  radius: 0.9,
  motion: 0.5,
  shadow: 0.6,
  decor: 1.5,
  cursor: 0.4,
};

export type SkinId =
  | "notion"
  | "geocities"
  | "win95"
  | "web2k"
  | "aero"
  | "skeuo"
  | "flat"
  | "material"
  | "brutalist"
  | "glass"
  | "neumorph"
  | "vaporwave"
  | "pixel"
  | "terminal"
  | "amber"
  | "swiss"
  | "editorial"
  | "memphis"
  | "cyberpunk"
  | "bento";

export type FontKey =
  | "sans"
  | "serif"
  | "mono"
  | "comic"
  | "display"
  | "rounded"
  | "condensed";

export type Tile = "none" | "dots" | "scanlines" | "grid";
export type Frame = "none" | "hairline" | "ridge" | "outset" | "heavy";
export type Layout = "full" | "boxed" | "card" | "log" | "center" | "bento";
export type HeroStyle =
  | "plain"
  | "underline"
  | "gradient"
  | "glow"
  | "shadow"
  | "outline";
export type ButtonStyle =
  | "solid"
  | "bevel"
  | "gloss"
  | "flat"
  | "ghost"
  | "pixel";
export type CursorShape =
  | "arrow"
  | "hand"
  | "cross"
  | "beam"
  | "spinner"
  | "pixel"
  | "target"
  | "spiral";

export interface ColorTokens {
  bg: string;
  rail: string;
  panel: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;
  soft: string;
}

export interface TypeTokens {
  font: FontKey;
  size: number;
  lineHeight: number;
  heroSize: number;
  heroWeight: number;
  heroTrack: number;
  heroCase: "none" | "upper" | "lower";
  heroUnderline: boolean;
}

export interface SpaceTokens {
  pad: number;
  gap: number;
}

export interface DecorTokens {
  tile: Tile;
  frame: Frame;
  layout: Layout;
  heroStyle: HeroStyle;
  buttonStyle: ButtonStyle;
  prefix: string;
}

export interface CursorTokens {
  shape: CursorShape;
  glyph: string;
}

export interface Skin {
  id: SkinId;
  name: string;
  era: string;
  note: string;
  color: ColorTokens;
  type: TypeTokens;
  space: SpaceTokens;
  radius: number;
  motion: number;
  shadow: number;
  decor: DecorTokens;
  cursor: CursorTokens;
}

export type Frozen = Partial<Pick<Skin, SliceKey>>;

export interface Selection {
  base: SkinId;
  enabled: ReadonlySet<Axis>;
  frozen: Frozen;
  recent: ReadonlyArray<SkinId>;
}

export interface Ranked {
  id: SkinId;
  score: number;
  reasons: ReadonlyArray<{ axis: Axis; contribution: number }>;
}
