import { chooseNext } from "./algorithm.js";
import { SKINS, getSkin } from "./skins.js";
import { AXES } from "./types.js";
export function allAxes() {
    return new Set(AXES);
}
export function createSelection(base) {
    return { base, enabled: allAxes(), frozen: {}, recent: [base] };
}
export function resolve(selection) {
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
function freezeAxis(axis, current) {
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
            const unreachable = axis;
            throw new Error(`Unhandled axis: ${unreachable}`);
        }
    }
}
export function toggleAxis(selection, axis) {
    const enabled = new Set(selection.enabled);
    const frozen = { ...selection.frozen };
    if (enabled.has(axis)) {
        const snapshot = freezeAxis(axis, resolve(selection));
        Object.assign(frozen, snapshot);
        enabled.delete(axis);
    }
    else {
        enabled.add(axis);
        delete frozen[axis];
    }
    return { ...selection, enabled, frozen };
}
export function advance(selection) {
    const base = chooseNext(selection.base, selection.enabled, selection.recent);
    return { ...selection, base, recent: [...selection.recent, base].slice(-5) };
}
export function jump(selection, base) {
    return { ...selection, base, recent: [...selection.recent, base].slice(-5) };
}
export function encodeSelection(selection) {
    const axes = AXES.filter((axis) => selection.enabled.has(axis)).join(".");
    return `${selection.base}/${axes}`;
}
export function decodeSelection(value) {
    const [baseToken = "", axesToken = ""] = value.split("/");
    const baseSkin = SKINS.find((skin) => skin.id === baseToken);
    if (baseSkin === undefined)
        return null;
    const enabled = new Set();
    if (axesToken !== "") {
        for (const token of axesToken.split(".")) {
            const axis = AXES.find((candidate) => candidate === token);
            if (axis === undefined)
                return null;
            enabled.add(axis);
        }
    }
    return { base: baseSkin.id, enabled, frozen: {}, recent: [baseSkin.id] };
}
