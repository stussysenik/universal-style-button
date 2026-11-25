import { SKINS, getSkin } from "./skins.js";
import { AXES, AXIS_WEIGHT, } from "./types.js";
const FONT_ORDER = {
    sans: 0,
    serif: 1,
    mono: 2,
    comic: 3,
    display: 4,
    rounded: 5,
    condensed: 6,
};
const TILE_ORDER = {
    none: 0,
    dots: 1,
    scanlines: 2,
    grid: 3,
};
const FRAME_ORDER = {
    none: 0,
    hairline: 1,
    ridge: 2,
    outset: 3,
    heavy: 4,
};
const LAYOUT_ORDER = {
    full: 0,
    boxed: 1,
    card: 2,
    log: 3,
    center: 4,
    bento: 5,
};
const HERO_ORDER = {
    plain: 0,
    underline: 1,
    gradient: 2,
    glow: 3,
    shadow: 4,
    outline: 5,
};
const BUTTON_ORDER = {
    solid: 0,
    bevel: 1,
    gloss: 2,
    flat: 3,
    ghost: 4,
    pixel: 5,
};
const CURSOR_ORDER = {
    arrow: 0,
    hand: 1,
    cross: 2,
    beam: 3,
    spinner: 4,
    pixel: 5,
    target: 6,
    spiral: 7,
};
function clamp(n) {
    return Math.max(0, Math.min(1, n));
}
function diff(a, b) {
    return Math.abs(a - b);
}
function channels(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) {
        throw new Error(`Expected a six-digit hex colour, got ${hex}`);
    }
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}
function luminance(hex) {
    const [r, g, b] = channels(hex);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
function hue(hex) {
    const [r, g, b] = channels(hex);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min)
        return 0;
    const span = max - min;
    let h;
    if (max === r)
        h = ((g - b) / span) % 6;
    else if (max === g)
        h = (b - r) / span + 2;
    else
        h = (r - g) / span + 4;
    return ((h + 6) % 6) / 6;
}
export function axisDistance(a, b, axis) {
    switch (axis) {
        case "color":
            return clamp((diff(luminance(a.color.bg), luminance(b.color.bg)) * 1.2 +
                diff(hue(a.color.accent), hue(b.color.accent)) * 0.8) /
                2);
        case "type":
            return clamp(diff(FONT_ORDER[a.type.font], FONT_ORDER[b.type.font]) / 6 * 0.6 +
                diff(a.type.heroSize, b.type.heroSize) / 24 * 0.4);
        case "space":
            return clamp(diff(a.space.pad, b.space.pad) / 24);
        case "radius":
            return clamp(diff(a.radius, b.radius) / 28);
        case "motion":
            return clamp(diff(a.motion, b.motion) / 300);
        case "shadow":
            return clamp(diff(a.shadow, b.shadow) / 3);
        case "decor":
            return clamp((diff(LAYOUT_ORDER[a.decor.layout], LAYOUT_ORDER[b.decor.layout]) / 5 +
                diff(FRAME_ORDER[a.decor.frame], FRAME_ORDER[b.decor.frame]) / 4 +
                diff(HERO_ORDER[a.decor.heroStyle], HERO_ORDER[b.decor.heroStyle]) / 5 +
                diff(TILE_ORDER[a.decor.tile], TILE_ORDER[b.decor.tile]) / 3 +
                diff(BUTTON_ORDER[a.decor.buttonStyle], BUTTON_ORDER[b.decor.buttonStyle]) / 5) /
                5);
        case "cursor":
            return clamp(diff(CURSOR_ORDER[a.cursor.shape], CURSOR_ORDER[b.cursor.shape]) /
                (CURSOR_ORDER.spiral - CURSOR_ORDER.arrow));
        default: {
            const unreachable = axis;
            throw new Error(`Unhandled axis: ${unreachable}`);
        }
    }
}
export function contrast(a, b, enabled) {
    let total = 0;
    let weight = 0;
    const reasons = [];
    for (const axis of AXES) {
        if (!enabled.has(axis))
            continue;
        const w = AXIS_WEIGHT[axis];
        const contribution = axisDistance(a, b, axis) * w;
        reasons.push({ axis, contribution });
        total += contribution;
        weight += w;
    }
    reasons.sort((x, y) => y.contribution - x.contribution);
    return { score: weight === 0 ? 0 : total / weight, reasons };
}
export function rankCandidates(current, enabled) {
    const from = getSkin(current);
    return SKINS.filter((skin) => skin.id !== current)
        .map((skin) => {
        const { score, reasons } = contrast(from, skin, enabled);
        return { id: skin.id, score, reasons, order: SKINS.indexOf(skin) };
    })
        .sort((a, b) => b.score - a.score || a.order - b.order)
        .map(({ id, score, reasons }) => ({ id, score, reasons }));
}
export function chooseNext(current, enabled) {
    const ranked = rankCandidates(current, enabled);
    const first = ranked[0];
    if (first === undefined)
        return current;
    return first.id;
}
