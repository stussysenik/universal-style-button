import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { rankCandidates } from "../engine/algorithm.ts";
import { advance, createSelection, jump, resolve, toggleAxis } from "../engine/selection.ts";
import { SKINS } from "../engine/skins.ts";
import { AXES, AXIS_LABEL, type Axis, type Selection } from "../engine/types.ts";
import { TILE_GLYPH, isDark, nativeFont, withAlpha } from "./fonts.ts";

const BEATS = ["REMIX", "RE-THINK", "RE:IMAGINE"];
const NATIVE_AXES: ReadonlyArray<Axis> = AXES.filter((axis) => axis !== "cursor");

export default function StyleApp() {
  const [selection, setSelection] = useState<Selection>(() => createSelection("notion"));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const skin = useMemo(() => resolve(selection), [selection]);
  const ranked = useMemo(
    () => rankCandidates(selection.base, selection.enabled, selection.recent).slice(0, 5),
    [selection],
  );

  const overlay = useRef(new Animated.Value(0)).current;
  const beats = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const busy = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function switchStyle() {
    if (busy.current) return;
    busy.current = true;
    overlay.setValue(1);
    beats.forEach((value) => value.setValue(0));

    const runBeat = (index: number, delayMs: number) => {
      const value = beats[index];
      if (value === undefined) return;
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(value, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.delay(120),
        Animated.timing(value, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    };
    runBeat(0, 0);
    runBeat(1, 150);
    runBeat(2, 300);

    timers.current.push(setTimeout(() => setSelection((prev) => advance(prev)), 300));
    timers.current.push(
      setTimeout(() => {
        Animated.timing(overlay, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          busy.current = false;
        });
      }, 560),
    );
  }

  const c = skin.color;
  const t = skin.type;
  const font = nativeFont(t.font);
  const frameWidth = skin.decor.frame === "none" ? 0 : skin.decor.frame === "heavy" ? 3 : 1;
  const frameColor = skin.decor.frame === "heavy" ? c.ink : c.line;
  const boxed =
    skin.decor.layout === "boxed" ||
    skin.decor.layout === "card" ||
    skin.decor.layout === "center";
  const isLog = skin.decor.layout === "log";
  const isBento = skin.decor.layout === "bento";
  const glyph = TILE_GLYPH[skin.decor.tile] ?? "";
  const heroWords = BEATS.map((word) =>
    t.heroCase === "upper"
      ? word.toUpperCase()
      : t.heroCase === "lower"
        ? word.toLowerCase()
        : word,
  );

  const card: object = {
    backgroundColor: c.panel,
    borderRadius: skin.radius,
    borderWidth: frameWidth,
    borderColor: frameColor,
    padding: skin.space.pad + 8,
    ...(skin.shadow > 0
      ? {
          boxShadow: `0 ${skin.shadow * 3}px ${skin.shadow * 8}px ${withAlpha(c.ink, 0.07 * skin.shadow)}`,
        }
      : {}),
  };

  const bodyText = (text: string) => ({
    color: c.ink,
    fontFamily: font,
    fontSize: t.size,
    lineHeight: Math.round(t.size * t.lineHeight),
  });

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle={isDark(c.bg) ? "light-content" : "dark-content"} />

      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <View style={{ padding: 16, gap: skin.space.gap + 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <View style={{ gap: 2 }}>
              <Text selectable style={{ color: c.ink, fontFamily: font, fontSize: 17, fontWeight: "700" }}>
                Style button
              </Text>
              <Text selectable style={{ color: c.muted, fontFamily: font, fontSize: 11 }}>
                20 eras · 1957—2024
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text selectable style={{ color: c.muted, fontFamily: font, fontSize: 11 }}>
                skin {skin.id} · {skin.era}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Switch style, current ${skin.name}`}
                onPress={switchStyle}
                style={{
                  backgroundColor: c.accent,
                  borderRadius: skin.radius,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  flexDirection: "row",
                  gap: 7,
                  alignItems: "center",
                  ...(skin.decor.buttonStyle === "ghost" ? { backgroundColor: "transparent", borderWidth: 1, borderColor: c.accent } : {}),
                }}
              >
                <Text style={{ color: c.accentInk, fontFamily: font, fontSize: 13, fontWeight: "700" }}>
                  ⇄ Switch style
                </Text>
              </Pressable>
            </View>
          </View>

          <FlatList
            horizontal
            data={SKINS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
            renderItem={({ item }) => {
              const active = item.id === selection.base;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, ${item.era}`}
                  onPress={() => setSelection((prev) => jump(prev, item.id))}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: skin.radius,
                    backgroundColor: active ? c.ink : c.panel,
                    borderWidth: frameWidth,
                    borderColor: frameColor,
                  }}
                >
                  <Text style={{ color: active ? c.bg : c.muted, fontFamily: font, fontSize: 11 }}>
                    {item.era} {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          <View style={[card, boxed ? { alignSelf: "center", maxWidth: 520, width: "100%" } : null]}>
            {glyph !== "" ? (
              <Text selectable style={{ color: c.muted, fontFamily: font, fontSize: 10, marginBottom: 10 }}>
                {glyph}
              </Text>
            ) : null}

            <Text selectable style={{ color: c.muted, fontFamily: font, fontSize: 10, letterSpacing: 1 }}>
              {skin.decor.prefix === "" ? "" : `${skin.decor.prefix} `}FIELDNOTES / EXPERIMENT 04
            </Text>

            {isBento ? (
              <Text
                selectable
                style={{
                  fontFamily: font,
                  fontSize: t.heroSize * 0.62,
                  fontWeight: "700",
                  color: c.ink,
                  marginTop: 12,
                  marginBottom: 10,
                }}
              >
                {heroWords.join(" ")}
              </Text>
            ) : (
              <View style={{ gap: 0, marginTop: 10, marginBottom: 14 }}>
                {heroWords.map((word, index) => (
                  <Text
                    key={word}
                    selectable
                    style={{
                      fontFamily: font,
                      fontSize: t.heroSize,
                      fontWeight: "700",
                      letterSpacing: t.heroTrack * t.heroSize,
                      color: skin.decor.heroStyle === "glow" ? c.accent : c.ink,
                      textDecorationLine:
                        t.heroUnderline || skin.decor.heroStyle === "underline" ? "underline" : "none",
                      textShadowColor: skin.decor.heroStyle === "glow" ? c.accent : undefined,
                      textShadowRadius: skin.decor.heroStyle === "glow" ? 18 : 0,
                      lineHeight: t.heroSize * 1.05,
                    }}
                  >
                    {word}
                  </Text>
                ))}
              </View>
            )}

            <Text selectable style={{ color: c.ink, fontFamily: font, fontSize: 20, fontWeight: "700" }}>
              {isLog ? "# " : ""}Design tokens, one state away
            </Text>
            <Text selectable style={{ ...bodyText("Updated today"), color: c.muted, marginTop: 4 }}>
              {skin.note}
            </Text>

            <View style={{ height: 1, backgroundColor: c.line, marginVertical: 16 }} />

            <Text selectable style={{ ...bodyText("Every surface below is drawn from one value. Change the value and the page changes with it."), marginBottom: 14 }}>
              {isLog ? "> " : ""}
              {`Everything on this page is drawn from one value. Change the value and the page changes with it — the sidebar, the type, the spacing, the corners, the button that did it.`}
            </Text>

            <View style={{ borderLeftWidth: 2, borderLeftColor: c.accent, backgroundColor: c.soft, padding: 12, borderRadius: skin.radius }}>
              <Text selectable style={bodyText("One state decides every surface. The content never moves. Only the system around it does.")}>
                One state decides every surface. The content never moves. Only the system around it does.
              </Text>
            </View>

            <Text selectable style={{ color: c.ink, fontFamily: font, fontSize: 15, fontWeight: "700", marginTop: 22, marginBottom: 8 }}>
              {isLog ? "// " : ""}What changes
            </Text>
            {isBento ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <View style={{ flex: 1, minWidth: 180, backgroundColor: c.soft, borderRadius: skin.radius, padding: 12 }}>
                  <Text selectable style={bodyText("Color, type, space, radius, motion, shadow, structure and cursor on web.")}>
                    Color and contrast · Type family · Spacing · Radius · Motion · Structure
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 180, backgroundColor: c.soft, borderRadius: skin.radius, padding: 12 }}>
                  <Text selectable style={{ ...bodyText("The interface is a pure function of one value."), fontStyle: "italic" }}>
                    The interface is a pure function of one value.
                  </Text>
                </View>
              </View>
            ) : (
              <>
                {["Color and contrast", "Type family and scale", "Spacing and density", "Radius and shadow", "Motion, structure, cursor"].map((item) => (
                  <View key={item} style={{ flexDirection: "row", gap: 9, alignItems: "center", paddingVertical: 3 }}>
                    <Text style={{ color: c.accentInk, backgroundColor: c.accent, borderRadius: 3, fontSize: 9, paddingHorizontal: 4, paddingVertical: 2 }}>
                      ✓
                    </Text>
                    <Text selectable style={bodyText(item)}>{item}</Text>
                  </View>
                ))}
                <Text selectable style={{ ...bodyText("The interface is a pure function of one value."), color: c.muted, marginTop: 20, fontStyle: "italic" }}>
                  The interface is a pure function of one value.
                </Text>
              </>
            )}

            <Text selectable style={{ color: c.muted, fontFamily: font, fontSize: 11, marginTop: 26, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.line }}>
              Twenty eras, one document, no duplicated markup
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle settings"
            onPress={() => setSettingsOpen((open) => !open)}
            style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}
          >
            <Text style={{ color: c.ink, fontFamily: font, fontSize: 12, fontWeight: "700" }}>
              Settings
            </Text>
            <Text style={{ color: c.muted, fontFamily: font, fontSize: 11 }}>
              {settingsOpen ? "Close" : "Open"}
            </Text>
          </Pressable>

          {settingsOpen ? (
            <View style={{ gap: 14 }}>
              <View style={{ gap: 4 }}>
                <Text style={{ color: c.ink, fontFamily: font, fontSize: 11, fontWeight: "700" }}>
                  CHANGE THESE ASPECTS
                </Text>
                <Text style={{ color: c.muted, fontFamily: font, fontSize: 10 }}>
                  Switched-off axes freeze at their current value. Cursor is web-only.
                </Text>
                {NATIVE_AXES.map((axis) => {
                  const on = selection.enabled.has(axis);
                  return (
                    <Pressable
                      key={axis}
                      accessibilityRole="checkbox"
                      accessibilityLabel={AXIS_LABEL[axis]}
                      accessibilityState={{ checked: on }}
                      onPress={() => setSelection((prev) => toggleAxis(prev, axis))}
                      style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 5 }}
                    >
                      <View style={{ width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: c.accent, backgroundColor: on ? c.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
                        {on ? <Text style={{ color: c.accentInk, fontSize: 10 }}>✓</Text> : null}
                      </View>
                      <Text style={{ color: c.ink, fontFamily: font, fontSize: 12 }}>{AXIS_LABEL[axis]}</Text>
                    </Pressable>
                  );
                })}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 5, opacity: 0.55 }}>
                  <Text style={{ color: c.muted, fontFamily: font, fontSize: 11 }}>{skin.cursor.glyph}</Text>
                  <Text style={{ color: c.muted, fontFamily: font, fontSize: 12 }}>Cursor</Text>
                  <Text style={{ color: c.muted, fontFamily: font, fontSize: 10 }}>web only</Text>
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ color: c.ink, fontFamily: font, fontSize: 11, fontWeight: "700" }}>
                  VISUAL ALGORITHM
                </Text>
                <Text style={{ color: c.muted, fontFamily: font, fontSize: 10 }}>
                  Next era = largest weighted distance across the axes left on.
                </Text>
                {ranked.map((entry, index) => (
                  <View key={entry.id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text selectable style={{ color: c.muted, fontFamily: font, fontSize: 10, width: 14 }}>
                      {index + 1}
                    </Text>
                    <View style={{ flex: 1, height: 4, backgroundColor: c.line, borderRadius: 2 }}>
                      <View style={{ width: `${Math.round(entry.score * 100)}%`, height: 4, backgroundColor: c.accent, borderRadius: 2 }} />
                    </View>
                    <Text selectable style={{ color: c.ink, fontFamily: font, fontSize: 10, width: 32, textAlign: "right" }}>
                      {Math.round(entry.score * 100)}%
                    </Text>
                  </View>
                ))}
                <Text selectable style={{ color: c.muted, fontFamily: font, fontSize: 10 }}>
                  Next: {ranked[0]?.id ?? "none"} — led by {AXIS_LABEL[ranked[0]?.reasons[0]?.axis ?? "color"]}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 0,
          opacity: overlay,
          backgroundColor: withAlpha(c.bg, 0.82),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: c.bg,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: skin.radius + 8,
            paddingHorizontal: 26,
            paddingVertical: 20,
          }}
        >
          {BEATS.map((word, index) => {
            const value = beats[index];
            if (value === undefined) return null;
            return (
              <Animated.Text
                key={word}
                style={{
                  position: "absolute",
                  fontFamily: font,
                  fontSize: 46,
                  fontWeight: "800",
                  color: c.accent,
                  opacity: value,
                  transform: [
                    {
                      translateY: value.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, -8],
                      }),
                    },
                  ],
                }}
              >
                {word}
              </Animated.Text>
            );
          })}
          <Text style={{ color: "transparent", fontFamily: font, fontSize: 46, fontWeight: "800" }}>
            RE:IMAGINE
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
