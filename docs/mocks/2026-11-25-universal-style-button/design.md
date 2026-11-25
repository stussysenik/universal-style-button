# Universal style button — mock design answer

2026-11-25

## Answer

One document, one button, four eras. The button changes a single `data-skin` value
on `<html>`. Every visible surface reads CSS custom properties, so the whole system
moves at once — including the button that caused it.

The change itself is the spectacle. One click runs three beats named after the
slogan: REMIX, RE-THINK, RE:IMAGINE. The surface breaks apart with a clip wipe and
blur, the token readout scrambles, the new skin lands, and the next era is already
built in a different structure rather than a different palette.

## Tokens

- Color: `--bg`, `--rail`, `--panel`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-ink`, `--soft`
- Type: `--font`, `--body-size`, `--lh`, `--hero-font`, `--hero-size`, `--hero-weight`, `--hero-track`
- Space: `--pad`, `--gap`
- Shape: `--radius`, `--shadow`
- Motion: `--ease`, `swapOut` 170ms, `swapIn` 250ms, `beat` 190ms staggered 0 / 150 / 300ms

## Eras

- `notion` — neutral paper, system sans, 3px radius, 16px pad, full-width document
- `geocities` — tiled blue dots on yellow, Comic Sans hero, ridge borders, centered boxed page
- `web2k` — glossy blue gradient card, Verdana, 12px radius, 14px pad, gradient hero
- `terminal` — black phosphor, scanlines, prompt prefixes, 6px pad, glowing green hero

## Rejected

- Color-only dark-mode toggle — too small a change to demonstrate the thesis
- One markup copy per skin — duplicated content drifts, one document is the point
- A plain crossfade — expected, reads as recolour rather than rebuild
- All three phase words on screen at once — overlapped and illegible, so each beat now exits before the next

## Resolved decision — preset plus gated axes

The grill asked whether the switcher changes an atomic preset or independent style
axes. Pick: preset plus gated axes.

`Selection = { base: SkinId; enabled: ReadonlySet<Axis> }`

One click advances `base`, which guarantees an authored contrast between any two
neighbours. Settings gate which axes follow the base: color, type, space, radius,
motion, shadow, decoration, cursor. Turning an axis off freezes it at the base's
current value, so "change only what I picked" is representable and every selection
is a legal state. Pure axes were rejected: maximum remix freedom, but no authored
contrast and no guaranteed spectacle.

Cursor is a web-only axis. Native has no cursor, so the setting is omitted there
rather than faked; the native surface shows a cursor glyph as a swatch.

## Visual algorithm

Order is not a fixed cycle. Each click picks the candidate with the largest weighted
distance across the enabled axes, minus a recency penalty over the last five skins.
Without that penalty the path collapsed into a two-skin oscillation (pixel ↔ memphis)
because maximal contrast is mutual; simulator testing found it and a test now pins a
twelve-step walk through at least six eras. Weights are data, not code; changing a
weight changes the path through the catalogue.

## Gate

Owner review against `shot.png`, `shot-geocities.png`, `shot-web2k.png`,
`shot-terminal.png`, `shot-transition.png` before any production code is written
