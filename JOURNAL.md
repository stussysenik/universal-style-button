# Journal

## 2026-11-25 — universal-style-button, first mock

Created `docs/mocks/2026-11-25-universal-style-button/` with `mock.html`, `design.md`
and four viewport captures from the real page. Design answer: one document, one
`data-skin` state value, four CSS-custom-property token sets; the button restyles
itself with the surface it changes.

Verified in Chrome at 1440x900: notion `rgb(255,255,255)` / 16px / 3px,
linear `rgb(15,16,20)` / 10px / 6px, writer `rgb(253,252,248)` / 22px / serif,
terminal `rgb(10,15,12)` / 8px / monospace. No console errors.

Next gate: owner review of the screenshots before production code.

## 2026-11-25 — universal-style-button, transition rework

Supersedes the plain crossfade in the entry above. The click now runs three beats —
REMIX, RE-THINK, RE:IMAGINE — over 560ms, with a clip/blur surface wipe, a scrambling
token readout, and a different document structure per era (full-width, boxed 1996
page, glossy card, phosphor log). Owner feedback: the first transition was too
expected and every embellishment was predictable.

Verified in Chrome at 1440x900 by clicking through all four states: notion
`rgb(255,255,255)` / 16px, geocities `rgb(255,255,204)` / 7px, web2k
`rgb(238,243,249)` / 14px, terminal `rgb(0,0,0)` / 6px. Phase overlay captured in
`shot-transition.png`. One bug found and fixed in the same change: the click handler
used `skins.indexOf(next)` on an index number, so every click resolved to skin 0;
now `index = next`. 0 console errors.

Next gate unchanged: owner review before production code.

## 2026-11-25 — universal-style-button, grill decision resolved

Agent decision under the owner's build directive (§12 decision model): preset plus
gated axes. `Selection = { base: SkinId; enabled: ReadonlySet<Axis> }`. One click
advances the base to guarantee authored contrast; settings decide which axes follow.
Pure axes were rejected because they cannot guarantee a spectacle. The path through
the catalogue is computed by max weighted distance across enabled axes, not a fixed
cycle, so the "visual algorithm" is data-driven. Cursor is web-only; native shows a
glyph swatch instead of pretending a cursor exists. Recorded in `design.md`.

Next gate: owner review of the mock before production code is written.

## 2026-11-25 — universal-style-button, shared engine

Built the platform-agnostic engine in `src/engine/`: 20 era skins from Swiss Grid
(1957) to Bento (2024), eight gated axes, a contrast-distance algorithm that ranks
every candidate by weighted distance across enabled axes, and a selection state that
freezes disabled slices. No `any`, no `as`, no non-exhaustive switches. Web consumes
TypeScript-emitted ES modules in `web/engine/`; native imports the same source.

`npm run check` green: strict `tsc --noEmit`, 14/14 `node:test` tests, emit clean.
Invariants pinned by tests: unique ids and valid hex tokens, distance bounded and
symmetric, next skin never repeats current, chosen candidate is the top-ranked one,
disabled slices survive advances, encode/decode round trip.

First commit `c047201` pushed and read back with `git ls-remote`.

## 2026-11-25 — universal-style-button, web surface

Built `web/` as the public showcase: one document, 20 selectable eras, a three-beat
REMIX / RE-THINK / RE:IMAGINE rebuild, eight gated axes with frozen slices, a visible
ranked algorithm panel with weights, custom SVG cursors per era, and shareable
`#skin/axes` URLs. Styles are driven by CSS custom properties and data attributes
set from the resolved skin — no per-skin markup or per-skin stylesheet.

Verified in Chrome on the real served page at 1440x900: notion white/sans/full,
geocities `rgb(255,255,204)`/comic/boxed, web2k `rgb(238,243,249)`/card, terminal
`rgb(0,0,0)`/mono/log, vaporwave `rgb(18,4,58)`/display/center, bento
`rgb(244,244,245)`/bento grid. Turning Color off froze white across a jump to
terminal while type still changed; re-enabling and clicking advanced to memphis.
0 console errors. Shots: `shot-web-notion.png`, `shot-web-geocities.png`,
`shot-web-web2k.png`, `shot-web-terminal.png`, `shot-web-vaporwave.png`,
`shot-web-bento.png`, `shot-web-transition.png`.
