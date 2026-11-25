import assert from "node:assert/strict";
import test from "node:test";

import { axisDistance, chooseNext, contrast, rankCandidates } from "./algorithm.ts";
import { SKINS, getSkin } from "./skins.ts";
import {
  advance,
  allAxes,
  createSelection,
  decodeSelection,
  encodeSelection,
  jump,
  resolve,
  toggleAxis,
} from "./selection.ts";
import { AXES, type Axis } from "./types.ts";

const HEX = /^#[0-9a-f]{6}$/i;

test("catalogue has unique ids and valid colour tokens", () => {
  assert.equal(SKINS.length, 20);
  assert.equal(new Set(SKINS.map((s) => s.id)).size, SKINS.length);
  assert.equal(new Set(SKINS.map((s) => s.name)).size, SKINS.length);
  for (const skin of SKINS) {
    for (const [key, value] of Object.entries(skin.color)) {
      assert.match(value, HEX, `${skin.id}.${key}`);
    }
    assert.ok(skin.era.length > 0);
    assert.ok(skin.note.length > 0);
  }
});

test("getSkin rejects an unknown id", () => {
  assert.throws(() => getSkin("missing"), /Unknown skin/);
});

test("every axis distance is bounded and symmetric", () => {
  for (const a of SKINS) {
    for (const b of SKINS) {
      for (const axis of AXES) {
        const d = axisDistance(a, b, axis);
        assert.ok(d >= 0 && d <= 1, `${a.id}/${b.id}/${axis} = ${d}`);
        assert.equal(d, axisDistance(b, a, axis));
      }
    }
  }
});

test("a skin has zero distance to itself", () => {
  for (const skin of SKINS) {
    for (const axis of AXES) {
      assert.equal(axisDistance(skin, skin, axis), 0);
    }
  }
});

test("next skin is never the current skin", () => {
  for (const skin of SKINS) {
    const next = chooseNext(skin.id, allAxes());
    assert.notEqual(next, skin.id);
    assert.ok(SKINS.some((candidate) => candidate.id === next));
  }
});

test("algorithm picks the highest-ranked candidate", () => {
  const enabled = allAxes();
  for (const skin of SKINS) {
    const ranked = rankCandidates(skin.id, enabled);
    const first = ranked[0];
    assert.ok(first !== undefined);
    assert.equal(chooseNext(skin.id, enabled), first.id);
    for (const entry of ranked) {
      assert.ok(entry.score <= first.score + Number.EPSILON);
    }
  }
});

test("ranking is deterministic and excludes the current skin", () => {
  const ranked = rankCandidates("notion", allAxes());
  assert.equal(new Set(ranked.map((r) => r.id)).size, ranked.length);
  assert.ok(!ranked.some((r) => r.id === "notion"));
  assert.deepEqual(
    ranked.map((r) => r.id),
    rankCandidates("notion", allAxes()).map((r) => r.id),
  );
});

test("an enabled axis contributes to score, a disabled one does not", () => {
  const a = getSkin("notion");
  const b = getSkin("terminal");
  const full = contrast(a, b, allAxes());
  const colorOnly = contrast(a, b, new Set<Axis>(["color"]));
  assert.equal(colorOnly.reasons.length, 1);
  assert.equal(colorOnly.reasons[0]?.axis, "color");
  assert.ok(full.score > 0);
  assert.ok(colorOnly.score > 0);
});

test("all axes enabled resolves to the exact base skin", () => {
  for (const skin of SKINS) {
    assert.deepEqual(resolve(createSelection(skin.id)), skin);
  }
});

test("disabling an axis freezes that slice across advances", () => {
  const start = createSelection("notion");
  const before = resolve(start);
  const frozen = toggleAxis(start, "color");
  assert.equal(frozen.enabled.has("color"), false);
  assert.deepEqual(resolve(frozen).color, before.color);
  const moved = advance(frozen);
  assert.notEqual(moved.base, frozen.base);
  assert.deepEqual(resolve(moved).color, before.color);
  assert.notDeepEqual(resolve(moved).type, before.type);
});

test("re-enabling an axis drops its frozen slice", () => {
  const off = toggleAxis(createSelection("notion"), "radius");
  assert.ok(off.frozen.radius !== undefined);
  const on = toggleAxis(off, "radius");
  assert.equal(on.enabled.has("radius"), true);
  assert.equal(on.frozen.radius, undefined);
  assert.deepEqual(resolve(on).radius, getSkin("notion").radius);
});

test("jump changes the base without touching frozen slices", () => {
  const off = toggleAxis(createSelection("notion"), "space");
  const before = resolve(off).space;
  const moved = jump(off, "pixel");
  assert.equal(moved.base, "pixel");
  assert.deepEqual(moved.frozen, off.frozen);
  assert.deepEqual(resolve(moved).space, before);
});

test("selection survives an encode decode round trip", () => {
  const selection = toggleAxis(createSelection("vaporwave"), "cursor");
  const decoded = decodeSelection(encodeSelection(selection));
  assert.ok(decoded !== null);
  assert.equal(decoded.base, selection.base);
  assert.deepEqual([...decoded.enabled].sort(), [...selection.enabled].sort());
});

test("malformed selection strings are rejected", () => {
  assert.equal(decodeSelection("unknown/color"), null);
  assert.equal(decodeSelection("notion/unknown"), null);
  assert.equal(decodeSelection(""), null);
});
