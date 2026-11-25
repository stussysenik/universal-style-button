import { chooseNext } from "./algorithm.ts";
import { SKINS, getSkin } from "./skins.ts";
import { AXES, type Axis, type Frozen, type Selection, type Skin, type SkinId } from "./types.ts";

export function allAxes(): ReadonlySet<Axis> {
  return new Set<Axis>(AXES);
}

export function createSelection(base: SkinId): Selection {
  return { base, enabled: allAxes(), frozen: {} };
}

export function resolve(selection: Selection): Skin {
  const base = getSkin(selection.base);
  return {
    ...base,
    color: selection.enabled.has("color") ? base.color : selection.frozen.color ?? base.color,
    type: selection.enabled.has("type") ? base.type : selection.frozen.type ?? base.type,
    space: selection.enabled.has("space") ? base.space : selection.frozen.space ?? base.space,
    radius: selection.enabled.has("radius") ? base.radius : selection.frozen.radius ?? base.radius,
    motion: selection.enabled.has("motion") ? base.motion : selection.frozen.motion ?? base.motion,
    shadow: selection.enabled.has("shadow") ? base.shadow : selection.frozen.shadow ?? base.shadow,
    decor: selection.enabled.has("decor") ? base.decor : selection.frozen.decor ?? base.decor,
    cursor: selection.enabled.has("cursor") ? base.cursor : selection.frozen.cursor ?? base.cursor,
  };
}

function freezeAxis(axis: Axis, current: Skin): Frozen {
  switch (axis) {
    case "color": return { color: current.color };
    case "type": return { type: current.type };
    case "space": return { space: current.space };
    case "radius": return { radius: current.radius };
    case "motion": return { motion: current.motion };
    case "shadow": return { shadow: current.shadow };
    case "decor": return { decor: current.decor };
    case "cursor": return { cursor: current.cursor };
    default: {
      const unreachable: never = axis;
      throw new Error(`Unhandled axis: ${unreachable}`);
    }
  }
}

export function toggleAxis(selection: Selection, axis: Axis): Selection {
  const enabled = new Set<Axis>(selection.enabled);
  const frozen: Frozen = { ...selection.frozen };
  if (enabled.has(axis)) {
    const snapshot = freezeAxis(axis, resolve(selection));
    Object.assign(frozen, snapshot);
    enabled.delete(axis);
  } else {
    enabled.add(axis);
    delete frozen[axis];
  }
  return { ...selection, enabled, frozen };
}

export function advance(selection: Selection): Selection {
  return { ...selection, base: chooseNext(selection.base, selection.enabled) };
}

export function jump(selection: Selection, base: SkinId): Selection {
  return { ...selection, base };
}

export function encodeSelection(selection: Selection): string {
  const axes = AXES.filter((axis) => selection.enabled.has(axis)).join(".");
  return `${selection.base}/${axes}`;
}

export function decodeSelection(value: string): Selection | null {
  const [baseToken = "", axesToken = ""] = value.split("/");
  const baseSkin = SKINS.find((skin) => skin.id === baseToken);
  if (baseSkin === undefined) return null;

  const enabled = new Set<Axis>();
  if (axesToken !== "") {
    for (const token of axesToken.split(".")) {
      const axis = AXES.find((candidate) => candidate === token);
      if (axis === undefined) return null;
      enabled.add(axis);
    }
  }
  return { base: baseSkin.id, enabled, frozen: {} };
}
