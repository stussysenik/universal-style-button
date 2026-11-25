import { SKINS } from "./engine/skins.js";
import { rankCandidates } from "./engine/algorithm.js";
import {
  advance,
  allAxes,
  createSelection,
  decodeSelection,
  encodeSelection,
  jump,
  resolve,
  toggleAxis,
} from "./engine/selection.js";
import { AXES, AXIS_LABEL, AXIS_WEIGHT } from "./engine/types.js";

const root = document.documentElement;
const app = document.getElementById("app");
const phase = document.getElementById("phase");
const beats = [
  document.getElementById("beat-1"),
  document.getElementById("beat-2"),
  document.getElementById("beat-3"),
];

const FRAMES = {
  none: ["0px", "solid", "transparent"],
  hairline: ["1px", "solid", "var(--line)"],
  ridge: ["3px", "ridge", "rgba(255,255,255,.9)"],
  outset: ["3px", "outset", "rgba(255,255,255,.85)"],
  heavy: ["3px", "solid", "var(--ink)"],
};

const SHADOWS = [
  "none",
  "0 1px 2px color-mix(in srgb, var(--ink) 12%, transparent)",
  "0 4px 14px color-mix(in srgb, var(--ink) 18%, transparent)",
  "0 10px 28px color-mix(in srgb, var(--ink) 28%, transparent)",
];

const CURSORS = {
  arrow: { hot: "3 2", svg: '<path d="M3 2 L3 19 L7.5 15 L10.5 21 L13.5 19.5 L10.5 13.5 L17 13 Z" fill="#000" stroke="#fff" stroke-width="1.2"/>' },
  hand: { hot: "9 4", svg: '<path d="M8 12V5a2 2 0 0 1 4 0v6V4a2 2 0 0 1 4 0v7V7a2 2 0 0 1 4 0v9c0 4-3 6-7 6h-2c-3 0-5-2-6-5L3 14a2 2 0 0 1 3-2l2 3z" fill="#000" stroke="#fff" stroke-width="1"/>' },
  cross: { hot: "12 12", svg: '<path d="M11 2h2v7h7v2h-7v7h-2v-7H4V9h7z" fill="#000" stroke="#fff" stroke-width=".8"/>' },
  beam: { hot: "12 12", svg: '<path d="M11 2h2v20h-2z" fill="#000" stroke="#fff" stroke-width=".8"/>' },
  spinner: { hot: "12 12", svg: '<circle cx="12" cy="12" r="8" fill="none" stroke="#000" stroke-width="3"/><path d="M12 4a8 8 0 0 1 8 8" fill="none" stroke="#fff" stroke-width="2"/>' },
  pixel: { hot: "3 3", svg: '<path d="M3 3h18v18H3z" fill="#000" stroke="#fff" stroke-width="1"/>' },
  target: { hot: "12 12", svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="#000" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#000"/>' },
  spiral: { hot: "12 12", svg: '<circle cx="12" cy="12" r="9" fill="#000"/><circle cx="12" cy="12" r="5" fill="#fff"/><circle cx="12" cy="12" r="2" fill="#000"/>' },
};

function cursorValue(shape) {
  const spec = CURSORS[shape];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${spec.svg}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${spec.hot}, pointer`;
}

let selection = decodeSelection(window.location.hash.slice(1)) ?? createSelection("notion");
let busy = false;

function setVar(name, value) {
  root.style.setProperty(name, String(value));
}

function apply(skin) {
  const c = skin.color;
  const t = skin.type;
  setVar("--bg", c.bg);
  setVar("--rail", c.rail);
  setVar("--panel", c.panel);
  setVar("--ink", c.ink);
  setVar("--muted", c.muted);
  setVar("--line", c.line);
  setVar("--accent", c.accent);
  setVar("--accent-ink", c.accentInk);
  setVar("--soft", c.soft);
  setVar("--beat-color", c.accent);
  setVar("--body-size", `${t.size}px`);
  setVar("--lh", t.lineHeight);
  setVar("--hero-size", `${t.heroSize}px`);
  setVar("--hero-weight", t.heroWeight);
  setVar("--hero-track", `${t.heroTrack}em`);
  setVar("--pad", `${skin.space.pad}px`);
  setVar("--gap", `${skin.space.gap}px`);
  setVar("--radius", `${skin.radius}px`);
  setVar("--motion", `${skin.motion}ms`);
  setVar("--shadow-css", SHADOWS[skin.shadow] ?? SHADOWS[0]);
  const frame = FRAMES[skin.decor.frame];
  setVar("--edge", frame[0]);
  setVar("--edge-style", frame[1]);
  setVar("--edge-color", frame[2]);
  setVar("--cursor", cursorValue(skin.cursor.shape));

  root.dataset.font = t.font;
  root.dataset.tile = skin.decor.tile;
  root.dataset.layout = skin.decor.layout;
  root.dataset.hero = skin.decor.heroStyle;
  root.dataset.button = skin.decor.buttonStyle;
  root.dataset.heroCase = t.heroCase;
  root.dataset.heroUnderline = String(t.heroUnderline);

  document.getElementById("decor-prefix").textContent =
    skin.decor.prefix === "" ? "" : `${skin.decor.prefix} `;
}

function renderCatalogue() {
  const host = document.getElementById("catalogue");
  host.replaceChildren();
  for (const skin of SKINS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "era" + (skin.id === selection.base ? " active" : "");
    button.setAttribute("aria-current", skin.id === selection.base ? "true" : "false");
    const year = document.createElement("span");
    year.className = "year";
    year.textContent = skin.era;
    const name = document.createElement("span");
    name.textContent = skin.name;
    button.append(year, name);
    button.addEventListener("click", () => {
      if (busy) return;
      selection = jump(selection, skin.id);
      apply(resolve(selection));
      renderAll();
    });
    host.append(button);
  }
}

function renderAxes() {
  const host = document.getElementById("axes");
  host.replaceChildren();
  for (const axis of AXES) {
    const label = document.createElement("label");
    label.className = "axis";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = selection.enabled.has(axis);
    input.addEventListener("change", () => {
      selection = toggleAxis(selection, axis);
      apply(resolve(selection));
      renderAll();
    });
    const glyph = document.createElement("span");
    glyph.className = "glyph";
    glyph.textContent = input.checked ? "●" : "○";
    const text = document.createElement("span");
    text.textContent = AXIS_LABEL[axis];
    label.append(input, glyph, text);
    if (axis === "cursor") {
      const note = document.createElement("span");
      note.className = "native-note";
      note.textContent = "web";
      label.append(note);
    }
    host.append(label);
  }
}

function renderRank() {
  const host = document.getElementById("rank-list");
  host.replaceChildren();
  const ranked = rankCandidates(selection.base, selection.enabled).slice(0, 5);
  ranked.forEach((entry, index) => {
    const skin = SKINS.find((candidate) => candidate.id === entry.id);
    if (skin === undefined) return;
    const row = document.createElement("div");
    row.className = "rank" + (index === 0 ? " top" : "");
    const idx = document.createElement("span");
    idx.className = "idx";
    idx.textContent = String(index + 1);
    const bar = document.createElement("span");
    bar.className = "bar";
    const fill = document.createElement("i");
    fill.style.width = `${Math.round(entry.score * 100)}%`;
    bar.append(fill);
    const val = document.createElement("span");
    val.className = "val";
    val.textContent = `${Math.round(entry.score * 100)}%`;
    row.append(idx, bar, val);
    row.title = `${skin.name} · ${entry.reasons.slice(0, 2).map((r) => AXIS_LABEL[r.axis]).join(" + ")}`;
    host.append(row);
  });

  const top = ranked[0];
  const formula = document.getElementById("formula");
  if (top === undefined) {
    formula.textContent = "No candidates";
    return;
  }
  const driver = top.reasons[0];
  const driverText =
    driver === undefined
      ? "no axes enabled"
      : `${AXIS_LABEL[driver.axis]} (w=${AXIS_WEIGHT[driver.axis]})`;
  formula.textContent = `Next: ${top.id} — led by ${driverText}. max Σ w × distance`;
}

function renderState() {
  const skin = resolve(selection);
  document.getElementById("skin-name").textContent = skin.id;
  document.getElementById("skin-era").textContent = skin.era;
  document.getElementById("note").textContent = skin.note;
  document.getElementById("tok-skin").textContent = skin.id;
  document.getElementById("tok-font").textContent = skin.type.font;
  document.getElementById("tok-pad").textContent = `${skin.space.pad}px`;
  document.getElementById("tok-radius").textContent = `${skin.radius}px`;
  document.getElementById("tok-motion").textContent = `${skin.motion}ms`;
  document.getElementById("selection-code").textContent = encodeSelection(selection);
  document.getElementById("style-button").setAttribute(
    "aria-label",
    `Switch style, current ${skin.name}`,
  );
  const hash = encodeSelection(selection);
  if (window.location.hash.slice(1) !== hash) {
    window.history.replaceState(null, "", `#${hash}`);
  }
}

function renderAll() {
  renderCatalogue();
  renderAxes();
  renderRank();
  renderState();
}

function resetBeats() {
  for (const beat of beats) beat.classList.remove("beat");
  void phase.offsetWidth;
}

function scrambleReadout() {
  const fonts = ["sans", "serif", "mono", "comic", "display", "rounded", "condensed"];
  const pads = ["4px", "7px", "10px", "14px", "16px", "22px"];
  const radii = ["0px", "2px", "3px", "12px", "18px", "28px"];
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  document.getElementById("tok-font").textContent = pick(fonts);
  document.getElementById("tok-pad").textContent = pick(pads);
  document.getElementById("tok-radius").textContent = pick(radii);
}

function switchStyle() {
  if (busy) return;
  busy = true;
  const scramble = window.setInterval(scrambleReadout, 45);
  resetBeats();
  phase.classList.add("on");
  app.classList.add("swap-out");
  beats[0]?.classList.add("beat");
  window.setTimeout(() => beats[1]?.classList.add("beat"), 150);
  window.setTimeout(() => {
    selection = advance(selection);
    window.clearInterval(scramble);
    apply(resolve(selection));
    renderAll();
    app.classList.remove("swap-out");
    app.classList.add("swap-in");
    beats[2]?.classList.add("beat");
  }, 300);
  window.setTimeout(() => {
    app.classList.remove("swap-in");
    phase.classList.remove("on");
    busy = false;
  }, 560);
}

document.getElementById("style-button").addEventListener("click", switchStyle);

document.getElementById("settings-toggle").addEventListener("click", (event) => {
  const panel = document.getElementById("panel");
  const open = panel.hasAttribute("hidden");
  if (open) panel.removeAttribute("hidden");
  else panel.setAttribute("hidden", "");
  event.currentTarget.setAttribute("aria-expanded", String(open));
});

document.getElementById("all-on").addEventListener("click", () => {
  selection = { ...selection, enabled: allAxes(), frozen: {} };
  apply(resolve(selection));
  renderAll();
});

document.getElementById("all-off").addEventListener("click", () => {
  const frozen = { ...selection, enabled: new Set(), frozen: {} };
  const current = resolve(selection);
  selection = {
    ...frozen,
    frozen: {
      color: current.color,
      type: current.type,
      space: current.space,
      radius: current.radius,
      motion: current.motion,
      shadow: current.shadow,
      decor: current.decor,
      cursor: current.cursor,
    },
  };
  renderAll();
});

document.getElementById("copy-link").addEventListener("click", async (event) => {
  const link = `${window.location.origin}${window.location.pathname}#${encodeSelection(selection)}`;
  try {
    await navigator.clipboard.writeText(link);
    event.currentTarget.textContent = "Copied";
  } catch {
    event.currentTarget.textContent = link;
  }
  window.setTimeout(() => {
    event.currentTarget.textContent = "Copy share link";
  }, 1600);
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement) return;
  if (event.key.toLowerCase() === "s" && !event.metaKey && !event.ctrlKey) {
    switchStyle();
  }
});

apply(resolve(selection));
renderAll();
