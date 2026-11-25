# Universal Style Button

One document. One switch. Twenty eras of interface style, from Swiss Grid (1957) to Bento (2024), driven by one shared engine on web and native.

The switch never swaps markup. It changes one `Selection`, and every surface reads from it — including the button that did it.

## Run

| Command | Surface |
|---|---|
| `npm run dev:web` | Web showcase at `http://localhost:4173` |
| `npm run dev:ios` | Expo Go on iOS |
| `npm run dev:android` | Expo Go on Android |
| `npm run check` | Strict typecheck, engine tests, web token emit |
| `npm test` | Engine invariants |
| `npm run gen:web` | Re-emit `web/engine/` from `src/engine/` |

Public web build: `https://stussysenik.github.io/universal-style-button/`

## How it works

`src/engine/` is platform-agnostic TypeScript:

- `skins.ts` — 20 authored eras, each a complete token set
- `algorithm.ts` — weighted contrast distance between eras; the next skin is the highest-ranked candidate, not a fixed cycle
- `selection.ts` — `{ base, enabled, frozen }`; switching off an axis freezes that slice at its current value
- `types.ts` — eight axes: color, type, space, radius, motion, shadow, structure, cursor

Web consumes `web/engine/`, emitted from the same source by `npm run gen:web`. Native imports `src/engine/` directly through Metro. No duplicated token tables.

Settings gate which axes follow the switch. The ranked algorithm panel shows the score and the axis that led the choice, so the path is visible rather than a black box.

## Platform notes

- Cursors are a web-only axis. Native has no cursor, so the setting is omitted and the resolved glyph is shown as a swatch.
- Native maps semantic font keys to platform families in `src/native/fonts.ts`; web maps the same keys to CSS stacks.
- Native texture is a glyph strip rather than a fake CSS background.
- Reduced motion is respected on web.

## Record

Decisions, rejected paths and verification live in `JOURNAL.md`. Mock screenshots and the design answer live in `docs/mocks/2026-11-25-universal-style-button/`.
