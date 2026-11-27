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

## 2026-11-25 — universal-style-button, native surface and algorithm fix

Added the Expo surface: `App.tsx`, `index.ts`, `app.json`, `src/native/StyleApp.tsx`
and `src/native/fonts.ts`. It imports the same engine as web. Seven axes appear on
native; cursor is omitted and shown as a glyph swatch because a phone has no cursor.
Texture is a glyph strip, not a fake CSS background. `expo-dev-client` was installed
after a plain debug build reported "No script URL provided" in the simulator; the
dev-server URL is now entered through its launcher.

Verified on a booted iPhone 16 / iOS 18.6 simulator through FlowDeck: build
succeeded, app launched, all 20 era buttons and the document rendered. Ten taps of
the switch walked notion → pixel → memphis → amber → neumorph → brutalist → glass →
swiss → skeuo → pixel; opening Settings and switching Color off changed the next
candidate from swiss to pixel, so the setting drives the algorithm. Native shots:
`shot-native-notion.png`, `shot-native-amber.png`, `shot-native-glass.png`,
`shot-native-settings.png`. Metro bundles for both ios and android succeed.

Defect found in the simulator and fixed: pure max-distance ranking oscillates
between two mutually distant skins. `Selection` now carries `recent` (last five),
and `rankCandidates` subtracts a recency penalty. Two new tests pin traversal and
penalty; `npm run check` green at 16/16 tests and strict `tsc`.

## 2026-11-25 — universal-style-button, public launch

Added `README.md` with the run table and `.github/workflows/deploy-web.yml`. Created
the public GitHub repo with `gh repo create`, configured Pages with
`build_type=workflow`, and pushed four commits: `c047201`, `61a7db6`, `c7f39d4`,
`2466906`. Every push was read back with `git ls-remote origin refs/heads/main`.

Workflow run `45665414475` finished green: `npm ci`, `npm run check`, artifact upload
and Pages deploy all passed. Public smoke test:
`https://stussysenik.github.io/universal-style-button/` returns HTTP 200 with
`<title>Universal Style Button</title>`, and `/engine/skins.js` returns HTTP 200.
Node 20 runner deprecation annotations are upstream action notices, not failures.

## 2026-11-27 — portfolio README

- Rewrote `README.md` as a portfolio showcase; working run commands preserved from the prior file.
- Evidence: `docs/mocks/2026-11-25-universal-style-button/shot-web-bento.png` is a committed capture; commands read from `package.json` and the existing `JOURNAL.md`.
