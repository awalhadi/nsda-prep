# 11. Motion recipes

This file is code. The rules (when to animate, how much, what each duration means) live in `10-motion-system.md`; the token values come from `04-tokens.md`. Pick the recipe, pick your stack, keep the token names, and never ship a snippet without its reduced-motion branch.

**Contents.** Tokens in code · Reduced motion per stack · Recipes: 1 press and hover · 2 overlays (dialog, popover, menu, sheet) · 3 toast · 4 list insert, remove, reorder · 5 shared element and route transitions · 6 the one orchestrated page-load moment · 7 scroll-driven reveal and progress · 8 skeleton shimmer · 9 optimistic toggle · 10 number count-up · 11 expand and collapse · 12 drag-to-dismiss sheet · 13 form error feedback · 14 success and celebration · 15 magnetic cursor and tilt · 16 Lottie and Rive · Desktop XAML · Performance checklist · Anti-patterns. Read only the recipe you need.

---

## Motion tokens in code

Define the tokens once per codebase and reference them everywhere. Never type a raw duration or bezier into a component.

### CSS custom properties

```css
:root {
  --motion-duration-press: 100ms;
  --motion-duration-fast: 120ms;
  --motion-duration-base: 200ms;
  --motion-duration-slow: 300ms;
  --motion-duration-emphasis: 500ms;      /* 400-600ms, never above 600 */
  --motion-duration-fast-exit: 80ms;      /* ≈ 65% of enter */
  --motion-duration-base-exit: 130ms;
  --motion-duration-slow-exit: 200ms;

  --motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --motion-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --motion-ease-linear: linear;

  --motion-stagger: 40ms;                 /* 30-50ms */
  --motion-distance-nudge: 6px;           /* 4-8px */
  --motion-distance-reveal: 14px;         /* 12-16px, max 24px */
  --motion-press-scale: 0.97;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-distance-nudge: 0px;
    --motion-distance-reveal: 0px;
    --motion-press-scale: 1;
    --motion-stagger: 0ms;
  }
}
```

Zeroing distances and scale under reduced motion means every recipe that uses the variables degrades to a fade automatically. Loops (shimmer, spinners that are decorative, marquees) still need an explicit `animation: none`.

### TypeScript (web and React Native)

```ts
// motion-tokens.ts  (named `mt` so it never collides with Motion's `motion` component)
export const mt = {
  duration: { press: 100, fast: 120, base: 200, slow: 300, emphasis: 500 },
  exit: { fast: 80, base: 130, slow: 200 },
  ease: {
    out: [0.16, 1, 0.3, 1],
    in: [0.7, 0, 0.84, 0],
    inOut: [0.65, 0, 0.35, 1],
  },
  spring: {
    ui: { type: "spring", duration: 0.35, bounce: 0 },
    gentle: { type: "spring", duration: 0.45, bounce: 0.15 },
    playful: { type: "spring", duration: 0.5, bounce: 0.3 },
  },
  stagger: 40,
  maxStaggered: 6,
  distance: { nudge: 6, reveal: 14, max: 24 },
  pressScale: 0.97,
} as const;

export const css = {
  ease: (e: readonly number[]) => `cubic-bezier(${e.join(",")})`,
  s: (ms: number) => ms / 1000, // Motion and GSAP take seconds
};
```

Reanimated springs use physics parameters rather than duration/bounce:

```ts
// damping ratio = damping / (2 * sqrt(stiffness * mass)); 1 = no overshoot
export const rnSpring = {
  ui: { damping: 40, stiffness: 400, mass: 1 },      // ratio 1.0, critically damped
  gentle: { damping: 34, stiffness: 400, mass: 1 },  // ratio 0.85, about bounce 0.15
  playful: { damping: 28, stiffness: 400, mass: 1 }, // ratio 0.7, about bounce 0.3
} as const;
```

Reanimated takes easing as a function, so convert the bezier arrays once:

```ts
// rn-motion.ts (keep rnSpring above in this file too)
import { Easing } from "react-native-reanimated";
import { mt } from "./motion-tokens";

export const rnEase = {
  out: Easing.bezier(...mt.ease.out),
  in: Easing.bezier(...mt.ease.in),
  inOut: Easing.bezier(...mt.ease.inOut),
};
```

### Dart (Flutter)

```dart
import 'package:flutter/animation.dart';

abstract final class MotionTokens {
  static const press = Duration(milliseconds: 100);
  static const fast = Duration(milliseconds: 120);
  static const base = Duration(milliseconds: 200);
  static const slow = Duration(milliseconds: 300);
  static const emphasis = Duration(milliseconds: 500);
  static const fastExit = Duration(milliseconds: 80);
  static const baseExit = Duration(milliseconds: 130);
  static const slowExit = Duration(milliseconds: 200);

  static const easeOut = Cubic(0.16, 1, 0.3, 1);
  static const easeIn = Cubic(0.7, 0, 0.84, 0);
  static const easeInOut = Cubic(0.65, 0, 0.35, 1);

  static const stagger = Duration(milliseconds: 40);
  static const nudge = 6.0;
  static const reveal = 14.0;
  static const pressScale = 0.97;
}
```

### Swift (SwiftUI)

```swift
import SwiftUI

extension Animation {
    static let motionFast = Animation.timingCurve(0.16, 1, 0.3, 1, duration: 0.12)
    static let motionBase = Animation.timingCurve(0.16, 1, 0.3, 1, duration: 0.20)
    static let motionSlow = Animation.timingCurve(0.16, 1, 0.3, 1, duration: 0.30)
    static let motionExit = Animation.timingCurve(0.7, 0, 0.84, 0, duration: 0.13)
    static let motionMove = Animation.timingCurve(0.65, 0, 0.35, 1, duration: 0.20)
    static let springUI = Animation.spring(duration: 0.35, bounce: 0)
    static let springGentle = Animation.spring(duration: 0.45, bounce: 0.15)
    static let springPlayful = Animation.spring(duration: 0.5, bounce: 0.3)
}

enum MotionTokens {
    static let stagger = 0.04
    static let nudge: CGFloat = 6
    static let reveal: CGFloat = 14
    static let pressScale: CGFloat = 0.97
}
```

### Kotlin (Jetpack Compose)

```kotlin
object MotionTokens {
    const val Press = 100
    const val Fast = 120
    const val Base = 200
    const val Slow = 300
    const val Emphasis = 500
    const val FastExit = 80
    const val BaseExit = 130
    const val SlowExit = 200
    const val Stagger = 40

    val EaseOut = CubicBezierEasing(0.16f, 1f, 0.3f, 1f)
    val EaseIn = CubicBezierEasing(0.7f, 0f, 0.84f, 0f)
    val EaseInOut = CubicBezierEasing(0.65f, 0f, 0.35f, 1f)

    fun <T> springUI() = spring<T>(dampingRatio = 1f, stiffness = 400f)
    fun <T> springGentle() = spring<T>(dampingRatio = 0.85f, stiffness = 400f)
    fun <T> springPlayful() = spring<T>(dampingRatio = 0.7f, stiffness = 400f)

    val Nudge = 6.dp
    val Reveal = 14.dp
    const val PressScale = 0.97f
}
```

Compose expresses bounce as a damping ratio; 0.85 and 0.7 approximate bounce 0.15 and 0.3.

---

## Reduced motion, per stack

Detect it once, near the root, and pass it down. Every recipe below assumes this.

| Stack | Detection | Notes |
|---|---|---|
| CSS | `@media (prefers-reduced-motion: reduce)` | Default to motion inside `no-preference` for anything large |
| Tailwind | `motion-safe:` / `motion-reduce:` variants | Put movement classes behind `motion-safe:` |
| JS / WAAPI / GSAP | `matchMedia("(prefers-reduced-motion: reduce)")`, `gsap.matchMedia()` | Listen for `change`; users toggle it live |
| Motion (React) | `<MotionConfig reducedMotion="user">` at root, `useReducedMotion()` for custom logic | `"user"` drops transform and layout animation, keeps opacity |
| Vue / Nuxt | `useMediaQuery` (VueUse) or a composable around `matchMedia` | CSS classes of `<Transition>` follow the CSS media query |
| Svelte 5 | `import { prefersReducedMotion } from "svelte/motion"` → `.current` | Reactive, no listener needed |
| Angular | CSS media query in animation classes; inject a `matchMedia` signal for JS | Legacy `@angular/animations`: `[@.disabled]="reduced"` on host |
| React Native | Reanimated `useReducedMotion()`, `ReduceMotion.System` on each animation; `AccessibilityInfo.isReduceMotionEnabled()` | `ReduceMotion.System` makes the animation jump to its end value |
| Flutter | `MediaQuery.disableAnimationsOf(context)` | Covers iOS Reduce Motion and Android "remove animations" |
| SwiftUI | `@Environment(\.accessibilityReduceMotion)` | UIKit: `UIAccessibility.isReduceMotionEnabled` |
| Jetpack Compose | `Settings.Global.ANIMATOR_DURATION_SCALE == 0f` | Compose's own animations already honour the scale; check it for custom loops |
| WinUI / UWP / Uno | `new UISettings().AnimationsEnabled` | Listen to `AnimationsEnabledChanged` where available |
| WPF | `SystemParameters.ClientAreaAnimation` | Skip storyboards when false |
| Avalonia / JavaFX | No reliable system flag; read OS setting via platform interop or ship an in-app toggle | Always offer an in-app "reduce motion" switch on desktop |

```ts
// web: one live source of truth
export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
export const prefersReduced = () => reducedMotion.matches;
reducedMotion.addEventListener("change", () => document.documentElement
  .toggleAttribute("data-reduced-motion", reducedMotion.matches));
```

```tsx
// React + Motion: set once, every motion.* component inherits it
import { MotionConfig } from "motion/react";
export function App({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
```

```ts
// React Native (Reanimated 3)
import { useReducedMotion, ReduceMotion, withTiming } from "react-native-reanimated";
const reduced = useReducedMotion();
opacity.value = withTiming(1, { duration: mt.duration.fast, easing: rnEase.out, reduceMotion: ReduceMotion.System });
```

```dart
// Flutter
final reduced = MediaQuery.disableAnimationsOf(context);
final duration = reduced ? Duration.zero : MotionTokens.base;
```

```swift
// SwiftUI
@Environment(\.accessibilityReduceMotion) private var reduceMotion
var enter: Animation { reduceMotion ? .motionFast : .springUI }
```

```kotlin
// Compose
@Composable
fun rememberReducedMotion(): Boolean {
    val resolver = LocalContext.current.contentResolver
    return remember {
        Settings.Global.getFloat(resolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f
    }
}
```

```csharp
// WinUI / UWP
bool animate = new Windows.UI.ViewManagement.UISettings().AnimationsEnabled;
// WPF
bool animate = System.Windows.SystemParameters.ClientAreaAnimation;
```

---

## Recipes

### 1. Press and hover feedback

**When:** every tappable button, card, chip and row. **Rule:** feedback starts within `duration.press`, uses transform and colour only, never shifts layout.

```css
.btn {
  transition:
    transform var(--motion-duration-press) var(--motion-ease-out),
    background-color var(--motion-duration-fast) var(--motion-ease-out);
}
.btn:active { transform: scale(var(--motion-press-scale)); }

@media (hover: hover) and (pointer: fine) {
  .card {
    transition: transform var(--motion-duration-fast) var(--motion-ease-out),
                box-shadow var(--motion-duration-fast) var(--motion-ease-out);
  }
  .card:hover {
    transform: translateY(calc(var(--motion-distance-nudge) * -0.5));
    box-shadow: var(--shadow-raised);
  }
}
```

Hover lift is wrapped in `(hover: hover)` so touch devices do not get a stuck hover state. Under reduced motion the variables are zero and 1, so only colour and shadow change.

```html
<!-- Tailwind -->
<button class="transition-transform duration-100 ease-[cubic-bezier(0.16,1,0.3,1)]
               motion-safe:active:scale-[0.97]">Save</button>
```

```tsx
// Motion (reduced motion inherited from MotionConfig at root)
<motion.button whileTap={{ scale: mt.pressScale }}
  transition={{ duration: css.s(mt.duration.press), ease: mt.ease.out }}>
  Save
</motion.button>
```

```swift
struct PressableStyle: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed && !reduceMotion ? MotionTokens.pressScale : 1)
            .opacity(configuration.isPressed ? 0.9 : 1)
            .animation(.timingCurve(0.16, 1, 0.3, 1, duration: 0.1), value: configuration.isPressed)
    }
}
```

```kotlin
val interaction = remember { MutableInteractionSource() }
val pressed by interaction.collectIsPressedAsState()
val scale by animateFloatAsState(
    if (pressed && !rememberReducedMotion()) MotionTokens.PressScale else 1f,
    tween(MotionTokens.Press, easing = MotionTokens.EaseOut), label = "press")
Button(onClick = onSave, interactionSource = interaction,
       modifier = Modifier.graphicsLayer { scaleX = scale; scaleY = scale }) { Text("Save") }
```

---

#### React Native (Reanimated)

```tsx
import { Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, ReduceMotion } from "react-native-reanimated";
import { mt } from "./motion-tokens";
import { rnEase } from "./rn-motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableCard({ onPress, children, ...rest }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const to = (v: number) => withTiming(v, { duration: mt.duration.press, easing: rnEase.out, reduceMotion: ReduceMotion.System });
  return (
    <AnimatedPressable accessibilityRole="button" onPress={onPress}
      onPressIn={() => { scale.value = to(mt.pressScale); }}
      onPressOut={() => { scale.value = to(1); }}
      style={[style, { minHeight: 48 }]} {...rest}>
      {children}
    </AnimatedPressable>
  );
}
```

Under reduced motion `ReduceMotion.System` makes the change instant; the pressed state still shows.

### 2. Enter and exit of overlays (dialog, popover, menu, sheet)

**When:** anything that appears above content. **Rule:** enter with `duration.base` + `ease.out`, exit at ≈65% with `ease.in`; origin at the trigger for menus and popovers.

#### CSS, no JavaScript (`<dialog>` and `popover`)

```css
dialog, [popover] {
  opacity: 0;
  transform: translateY(var(--motion-distance-nudge)) scale(0.98);
  transition:
    opacity var(--motion-duration-base-exit) var(--motion-ease-in),
    transform var(--motion-duration-base-exit) var(--motion-ease-in),
    overlay var(--motion-duration-base-exit) allow-discrete,
    display var(--motion-duration-base-exit) allow-discrete;
}
dialog[open], [popover]:popover-open {
  opacity: 1;
  transform: none;
  transition-duration: var(--motion-duration-base);
  transition-timing-function: var(--motion-ease-out);
}
@starting-style {
  dialog[open], [popover]:popover-open {
    opacity: 0;
    transform: translateY(var(--motion-distance-nudge)) scale(0.98);
  }
}

dialog::backdrop {
  background: rgb(0 0 0 / 0);
  transition: background-color var(--motion-duration-base) var(--motion-ease-out),
              overlay var(--motion-duration-base) allow-discrete,
              display var(--motion-duration-base) allow-discrete;
}
dialog[open]::backdrop { background: rgb(0 0 0 / 0.4); }
@starting-style { dialog[open]::backdrop { background: rgb(0 0 0 / 0); } }

/* menus grow from the trigger */
[popover].menu { transform-origin: var(--menu-origin, top left); }

@media (prefers-reduced-motion: reduce) {
  dialog, [popover] { transform: none; }
  @starting-style { dialog[open], [popover]:popover-open { transform: none; } }
}
```

Use CSS anchor positioning or your popover library to set `--menu-origin` to the side facing the trigger. Browsers without `@starting-style` simply show the overlay without an enter transition, which is an acceptable fallback.

#### React + Motion

```tsx
import { AnimatePresence, motion } from "motion/react";

<AnimatePresence>
  {open && (
    <motion.div key="dialog" role="dialog" aria-modal="true"
      initial={{ opacity: 0, y: mt.distance.nudge, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1,
        transition: { duration: css.s(mt.duration.base), ease: mt.ease.out } }}
      exit={{ opacity: 0, y: mt.distance.nudge, scale: 0.98,
        transition: { duration: css.s(mt.exit.base), ease: mt.ease.in } }}>
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

`MotionConfig reducedMotion="user"` at the root strips `y` and `scale` and keeps the fade.

#### Flutter

```dart
showGeneralDialog(
  context: context,
  barrierDismissible: true,
  barrierLabel: 'Close',
  transitionDuration: MediaQuery.disableAnimationsOf(context) ? Duration.zero : MotionTokens.base,
  reverseTransitionDuration: MotionTokens.baseExit,
  pageBuilder: (_, __, ___) => const MyDialog(),
  transitionBuilder: (context, anim, _, child) {
    final reduced = MediaQuery.disableAnimationsOf(context);
    final curved = CurvedAnimation(parent: anim, curve: MotionTokens.easeOut, reverseCurve: MotionTokens.easeIn);
    final faded = FadeTransition(opacity: curved, child: child);
    if (reduced) return faded;
    return SlideTransition(
      position: Tween(begin: const Offset(0, 0.02), end: Offset.zero).animate(curved),
      child: ScaleTransition(scale: Tween(begin: 0.98, end: 1.0).animate(curved), child: faded),
    );
  },
);
```

#### SwiftUI

```swift
ZStack {
    if isOpen {
        PanelView()
            .transition(reduceMotion
                ? .opacity
                : .asymmetric(insertion: .opacity.combined(with: .scale(scale: 0.98)).combined(with: .offset(y: MotionTokens.nudge)),
                              removal: .opacity))
            .zIndex(1)
    }
}
.animation(isOpen ? .motionBase : .motionExit, value: isOpen)
```

System `.sheet` and `.popover` already animate correctly and honour Reduce Motion. Only build custom overlays when the system ones cannot do the job.

---

### 3. Toast and snackbar

**When:** non-blocking confirmation or recoverable error. **Rule:** enter `duration.base`, exit ≈130ms, timer pauses while hovered or focused, announced through a live region, never the only place an error appears.

```html
<div class="toast-region" role="status" aria-live="polite"></div>
```

```css
.toast {
  transition: opacity var(--motion-duration-base) var(--motion-ease-out),
              transform var(--motion-duration-base) var(--motion-ease-out);
}
@starting-style { .toast { opacity: 0; transform: translateY(var(--motion-distance-reveal)); } }
.toast[data-leaving] {
  opacity: 0;
  transform: translateY(var(--motion-distance-nudge));
  transition-duration: var(--motion-duration-base-exit);
  transition-timing-function: var(--motion-ease-in);
}
```

```ts
export function showToast(region: HTMLElement, text: string, ms = 5000) {
  const el = Object.assign(document.createElement("div"), { className: "toast", textContent: text });
  region.append(el);
  let remaining = ms, start = Date.now(), timer = setTimeout(dismiss, remaining);
  const pause = () => { clearTimeout(timer); remaining -= Date.now() - start; };
  const resume = () => { start = Date.now(); timer = setTimeout(dismiss, remaining); };
  el.addEventListener("pointerenter", pause);
  el.addEventListener("pointerleave", resume);
  el.addEventListener("focusin", pause);
  el.addEventListener("focusout", resume);
  function dismiss() {
    el.dataset.leaving = "";
    el.addEventListener("transitionend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 300); // fallback if no transition ran
  }
  return dismiss;
}
```

Toasts with an action ("Undo") need at least 5 s plus the pause behaviour, or stay until dismissed.

```dart
// Flutter: SnackBar already animates and respects disableAnimations
ScaffoldMessenger.of(context).showSnackBar(SnackBar(
  content: const Text('Saved'),
  action: SnackBarAction(label: 'Undo', onPressed: undo),
  duration: const Duration(seconds: 6),
));
```

On Compose, use `SnackbarHostState.showSnackbar(message, actionLabel = "Undo", duration = SnackbarDuration.Long)`; the host handles motion.

---

### 4. List insert, remove, reorder

**When:** items are added, deleted, filtered or sorted in place. **Rule:** new items fade and nudge in, removed items fade out and the rest slide into place with `ease.inOut`; no stagger on updates.

#### Web: FLIP with WAAPI

```ts
export function flip(container: HTMLElement, mutate: () => void) {
  const items = [...container.children] as HTMLElement[];
  const before = new Map(items.map(el => [el, el.getBoundingClientRect()]));
  mutate();
  if (prefersReduced()) return;
  for (const el of container.children as HTMLCollectionOf<HTMLElement>) {
    const first = before.get(el);
    if (!first) {
      el.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
        { duration: 200, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      continue;
    }
    const last = el.getBoundingClientRect();
    const dx = first.left - last.left, dy = first.top - last.top;
    if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
      { duration: 200, easing: "cubic-bezier(0.65, 0, 0.35, 1)" });
  }
}
```

All rects are read before the mutation and after it in one pass, so there is no read/write thrash. For simple cases `document.startViewTransition(mutate)` with a unique `view-transition-name` per item does the same with less code (see recipe 5).

#### React + Motion

```tsx
<ul>
  <AnimatePresence initial={false}>
    {items.map(item => (
      <motion.li key={item.id} layout
        initial={{ opacity: 0, y: mt.distance.nudge }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: css.s(mt.exit.base), ease: mt.ease.in } }}
        transition={{ duration: css.s(mt.duration.base), ease: mt.ease.out,
                      layout: { duration: css.s(mt.duration.base), ease: mt.ease.inOut } }}>
        {item.label}
      </motion.li>
    ))}
  </AnimatePresence>
</ul>
```

#### Vue `<TransitionGroup>`

```vue
<TransitionGroup tag="ul" name="list">
  <li v-for="item in items" :key="item.id">{{ item.label }}</li>
</TransitionGroup>

<style>
.list-enter-active { transition: opacity var(--motion-duration-base) var(--motion-ease-out),
                                 transform var(--motion-duration-base) var(--motion-ease-out); }
.list-leave-active { transition: opacity var(--motion-duration-base-exit) var(--motion-ease-in);
                     position: absolute; }
.list-move { transition: transform var(--motion-duration-base) var(--motion-ease-in-out); }
.list-enter-from { opacity: 0; transform: translateY(var(--motion-distance-nudge)); }
.list-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .list-move { transition: none; } }
</style>
```

Svelte equivalent: `animate:flip={{ duration: prefersReducedMotion.current ? 0 : 200 }}` plus `transition:fade` on each keyed `{#each}` item.

#### Compose `LazyColumn`

```kotlin
LazyColumn {
    items(items, key = { it.id }) { item ->
        Row(Modifier.animateItem(
            fadeInSpec = tween(MotionTokens.Base, easing = MotionTokens.EaseOut),
            placementSpec = tween(MotionTokens.Base, easing = MotionTokens.EaseInOut),
            fadeOutSpec = tween(MotionTokens.BaseExit, easing = MotionTokens.EaseIn),
        )) { Text(item.label) }
    }
}
```

Stable `key` is mandatory; without it nothing animates correctly. The animator duration scale disables these automatically.

#### Flutter `AnimatedList`

```dart
final _listKey = GlobalKey<AnimatedListState>();

void insert(int i, Item item) {
  items.insert(i, item);
  _listKey.currentState!.insertItem(i, duration: MotionTokens.base);
}

void remove(int i) {
  final removed = items.removeAt(i);
  _listKey.currentState!.removeItem(i,
    (context, anim) => FadeTransition(opacity: anim, child: SizeTransition(sizeFactor: anim, child: ItemTile(removed))),
    duration: MotionTokens.baseExit);
}
```

React Native: `<Animated.View entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)} exiting={FadeOut.duration(130)} layout={LinearTransition.duration(200)}>` on each row.

---

### 5. Shared element and route transitions

**When:** navigating from a thumbnail to its detail, or between sibling routes. **Rule:** `duration.slow`, `ease.inOut` for elements moving between two positions; one shared element per transition, not five.

#### Same-document View Transitions (SPA)

```ts
export function navigate(update: () => void | Promise<void>) {
  if (!document.startViewTransition || prefersReduced()) return void update();
  document.startViewTransition(update);
}
```

```css
.card-thumb { view-transition-name: var(--vt-name); }   /* unique per item, set inline */
.detail-hero { view-transition-name: hero; }

::view-transition-group(*) {
  animation-duration: var(--motion-duration-slow);
  animation-timing-function: var(--motion-ease-in-out);
}
::view-transition-old(root) { animation-duration: var(--motion-duration-slow-exit); }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation: none !important;
  }
}
```

Only the clicked card should carry the name that matches the destination (`hero`); set it just before calling `navigate`, then remove it. Two elements with the same name abort the transition.

#### Cross-document (MPA, Astro, server-rendered sites)

```css
@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }
}
```

Put it in the stylesheet of both pages; same-origin only. Name matching elements on both pages with the same `view-transition-name`. Astro's `<ClientRouter />` and Next.js / Nuxt view-transition integrations wrap the same API.

#### React + Motion `layoutId`

```tsx
// list
<motion.img layoutId={`photo-${id}`} src={src} />
// detail (rendered elsewhere in the tree, same layoutId)
<motion.img layoutId={`photo-${id}`} src={src}
  transition={{ duration: css.s(mt.duration.slow), ease: mt.ease.inOut }} />
```

Wrap both in a `LayoutGroup` if they live in separate subtrees. Reduced motion is inherited from `MotionConfig`.

#### Flutter `Hero`

```dart
// source and destination share the tag
Hero(tag: 'photo-$id', child: Image.network(url));

// route with token timing and a fade-only fallback
PageRouteBuilder(
  transitionDuration: MediaQuery.disableAnimationsOf(context) ? Duration.zero : MotionTokens.slow,
  reverseTransitionDuration: MotionTokens.slowExit,
  pageBuilder: (_, __, ___) => DetailPage(id: id),
  transitionsBuilder: (_, anim, __, child) =>
      FadeTransition(opacity: CurvedAnimation(parent: anim, curve: MotionTokens.easeInOut), child: child),
);
```

#### SwiftUI

```swift
@Namespace private var ns

// iOS 18+: system zoom transition, honours Reduce Motion
NavigationLink(value: item) {
    Thumb(item).matchedTransitionSource(id: item.id, in: ns)
}
.navigationDestination(for: Item.self) { item in
    DetailView(item).navigationTransition(.zoom(sourceID: item.id, in: ns))
}

// In-place swap within one view
if expanded {
    Hero(item).matchedGeometryEffect(id: item.id, in: ns)
} else {
    Thumb(item).matchedGeometryEffect(id: item.id, in: ns)
}
// toggle with: withAnimation(reduceMotion ? .motionFast : .springUI) { expanded.toggle() }
```

#### Compose `SharedTransitionLayout`

```kotlin
SharedTransitionLayout {
    AnimatedContent(targetState = selected, label = "detail",
        transitionSpec = { fadeIn(tween(MotionTokens.Slow)) togetherWith fadeOut(tween(MotionTokens.SlowExit)) }
    ) { target ->
        if (target == null) {
            Grid(onOpen = { selected = it }, sharedScope = this@SharedTransitionLayout, visibility = this)
        } else {
            Image(painter, null, Modifier.sharedElement(
                rememberSharedContentState(key = "photo-${target.id}"),
                animatedVisibilityScope = this,
                boundsTransform = { _, _ -> tween(MotionTokens.Slow, easing = MotionTokens.EaseInOut) }))
        }
    }
}
```

---

### 6. The one orchestrated page-load moment

**When:** first paint of a hero or landing view, once per view, never on every route change. **Rule:** `duration.emphasis` total budget ≤ 600ms, stagger 30-50ms across at most 6 elements, everything else appears together. Content must be readable at frame zero if JS fails.

#### CSS only

```css
@media (prefers-reduced-motion: no-preference) {
  .hero [data-enter] {
    animation: enter var(--motion-duration-base) var(--motion-ease-out) both;
    animation-delay: calc(var(--i, 0) * var(--motion-stagger));
  }
}
@keyframes enter {
  from { opacity: 0; transform: translateY(var(--motion-distance-reveal)); }
}
```

```html
<section class="hero">
  <p data-enter style="--i:0">Eyebrow</p>
  <h1 data-enter style="--i:1">Headline</h1>
  <p data-enter style="--i:2">Supporting line</p>
  <div data-enter style="--i:3">Primary and secondary actions</div>
  <figure data-enter style="--i:4">Product visual</figure>
</section>
```

Five items × 40ms + 200ms ≈ 360ms total. Under reduced motion nothing animates and nothing is hidden. Do not animate the LCP element's opacity from 0 if it is a large image; let it paint and animate a sibling instead.

#### GSAP timeline (React with `useGSAP`)

```tsx
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);

export function Hero() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "expo.out", duration: 0.2 } })
        .from("[data-enter]", { autoAlpha: 0, y: 14, stagger: 0.04 })
        .from("[data-accent]", { scaleX: 0, transformOrigin: "left center", duration: 0.3 }, "-=0.1");
    });
    return () => mm.revert();
  }, { scope: root });
  return <section ref={root} className="hero">{/* … */}</section>;
}
```

`expo.out` is GSAP's closest named ease to `ease.out`; for exact parity register `CustomEase.create("motionOut", "0.16,1,0.3,1")`. `useGSAP` reverts the context on unmount; `mm.revert()` also restores state when the user toggles reduced motion.

Serving static HTML first and running `.from()` after hydration causes a flash of visible content followed by a hide. Add `.hero [data-enter] { visibility: hidden }` only inside a `.js` class set in `<head>`, and use `autoAlpha` so GSAP restores visibility.

---

### 7. Scroll-driven reveal and progress

**When:** a reading progress bar, or one or two sections that carry a story. **Rule:** linear easing for scroll-linked progress; reveals are small (12-16px) and run once.

> Fading up every section as it enters the viewport is one of the most recognisable generic tells (see `15-generic-tells.md`). Reveal only where it explains sequence or draws the eye to one thing. Content must be visible without the animation.

#### CSS scroll-driven animations with fallback

```css
/* Reading progress */
.progress {
  position: fixed; inset: 0 0 auto 0; height: 3px;
  transform-origin: left center;
  transform: scaleX(0);
}
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .progress {
      animation: grow linear both;
      animation-timeline: scroll(root block);
    }
  }
}
@keyframes grow { to { transform: scaleX(1); } }

/* One-off reveal */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 60%;
    }
  }
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(var(--motion-distance-reveal)); }
}
```

Keep `animation-timeline` after the `animation` shorthand, because the shorthand resets it. Without support, `.reveal` is simply visible and the progress bar can be driven by a small `scroll` listener with `requestAnimationFrame`, or hidden. Under reduced motion the progress bar can still update by value with no transition; it is information, not decoration.

#### GSAP ScrollTrigger

```ts
gsap.registerPlugin(ScrollTrigger);
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.utils.toArray<HTMLElement>(".reveal").forEach(el => {
    gsap.from(el, {
      autoAlpha: 0, y: 14, duration: 0.3, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
});
// on teardown (route change, unmount): mm.revert();
```

Pinning and scrubbed storytelling sections are a deliberate design decision, not a default. If you pin, keep it to one section, test with keyboard scrolling, and provide a static layout under reduced motion.

---

### 8. Skeleton shimmer

**When:** loading content whose layout is known, expected wait 300ms-3s. **Rule:** shimmer is a loop, so it stops under reduced motion; the skeleton matches the final layout to avoid shift.

```css
.skeleton {
  background: var(--color-surface-muted);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}
@media (prefers-reduced-motion: no-preference) {
  .skeleton::after {
    content: "";
    position: absolute; inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, var(--color-surface-highlight), transparent);
    animation: shimmer 1.4s linear infinite;
  }
}
@keyframes shimmer { to { transform: translateX(100%); } }
```

```html
<div aria-busy="true" aria-live="polite">
  <span class="sr-only">Loading results</span>
  <div class="skeleton" style="block-size: 1rem; inline-size: 60%" aria-hidden="true"></div>
</div>
```

The loop period (1.4s) is a loading cadence, not a UI transition, so it sits outside the duration tokens. Animate `transform` on a pseudo-element, not `background-position`, so it stays on the compositor. Swap skeleton for content with a `duration.fast` fade, never a slide.

```dart
// Flutter: static placeholder when animations are disabled
final reduced = MediaQuery.disableAnimationsOf(context);
return reduced ? const SkeletonBox() : const ShimmerSkeletonBox();
```

```kotlin
// Compose
val reduced = rememberReducedMotion()
val alpha = if (reduced) 0.6f else rememberInfiniteTransition(label = "shimmer")
    .animateFloat(0.4f, 0.8f, infiniteRepeatable(tween(700, easing = LinearEasing), RepeatMode.Reverse), label = "a").value
Box(Modifier.graphicsLayer { this.alpha = alpha }.background(MaterialTheme.colorScheme.surfaceVariant))
```

---

### 9. Optimistic toggle or like with rollback

**When:** low-risk reversible actions (like, star, follow, toggle a setting). **Rule:** state flips within `duration.press`, the network catches up; on failure revert visibly and tell the user. Never optimistic for payments, submissions or deletes without undo.

```tsx
// React 19
import { useOptimistic, startTransition } from "react";

export function LikeButton({ liked, count, onToggle }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(
    { liked, count },
    (s, next: boolean) => ({ liked: next, count: s.count + (next ? 1 : -1) }));

  async function toggle() {
    startTransition(async () => {
      setOptimistic(!optimistic.liked);
      try { await onToggle(!optimistic.liked); }
      catch { toast("Could not save your like. Try again."); } // optimistic state reverts on its own
    });
  }

  return (
    <motion.button aria-pressed={optimistic.liked} onClick={toggle}
      whileTap={{ scale: mt.pressScale }}
      transition={{ duration: css.s(mt.duration.press), ease: mt.ease.out }}>
      <motion.span key={String(optimistic.liked)}
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={mt.spring.ui}>
        <HeartIcon filled={optimistic.liked} />
      </motion.span>
      <span className="tabular-nums">{optimistic.count}</span>
    </motion.button>
  );
}
```

```swift
struct LikeButton: View {
    @State private var liked = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let save: (Bool) async throws -> Void

    var body: some View {
        Button {
            let previous = liked
            withAnimation(reduceMotion ? nil : .springUI) { liked.toggle() }
            Task {
                do { try await save(liked) }
                catch { withAnimation(.motionFast) { liked = previous } /* and show an error */ }
            }
        } label: {
            Image(systemName: liked ? "heart.fill" : "heart")
                .contentTransition(.symbolEffect(.replace))
        }
        .sensoryFeedback(.selection, trigger: liked)
        .accessibilityValue(liked ? "Liked" : "Not liked")
    }
}
```

Guard against double taps: ignore new toggles while one is in flight, or send only the latest value.

---

### 10. Number count-up

**When:** a single headline metric that changed or first appears (dashboard KPI, result score). **Rule:** ≤ 600ms, `ease.out`, tabular figures, no count-up under reduced motion, assistive tech hears the final value once.

```html
<p class="kpi">
  <span class="kpi-value" aria-hidden="true">0</span>
  <span class="sr-only">12,480 active users</span>
</p>
```

```css
.kpi-value { font-variant-numeric: tabular-nums; }
```

```ts
export function countUp(el: HTMLElement, to: number, ms = 500, locale = navigator.language) {
  const fmt = new Intl.NumberFormat(locale);
  if (prefersReduced()) { el.textContent = fmt.format(to); return; }
  const from = Number(el.dataset.value ?? 0), start = performance.now();
  const ease = (t: number) => 1 - Math.pow(1 - t, 4); // close to ease.out
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / Math.min(ms, 600));
    el.textContent = fmt.format(Math.round(from + (to - from) * ease(t)));
    if (t < 1) requestAnimationFrame(tick); else el.dataset.value = String(to);
  };
  requestAnimationFrame(tick);
}
```

```swift
Text(value, format: .number)
    .monospacedDigit()
    .contentTransition(reduceMotion ? .identity : .numericText(value: Double(value)))
    .animation(reduceMotion ? nil : .timingCurve(0.16, 1, 0.3, 1, duration: 0.5), value: value)
```

```dart
TweenAnimationBuilder<double>(
  tween: Tween(end: value.toDouble()),
  duration: MediaQuery.disableAnimationsOf(context) ? Duration.zero : MotionTokens.emphasis,
  curve: MotionTokens.easeOut,
  builder: (_, v, __) => Text(NumberFormat.decimalPattern().format(v.round()),
      style: const TextStyle(fontFeatures: [FontFeature.tabularFigures()]),
      semanticsLabel: NumberFormat.decimalPattern().format(value)),
);
```

Never count up money in a transaction confirmation or a value the user typed; show it final.

---

### 11. Expand and collapse (accordion, disclosure)

**When:** FAQs, settings groups, "show more". **Rule:** `duration.base`, `ease.out` on open, `ease.in` on close; do not animate `height` with JavaScript measurements.

#### Native `<details>` with `interpolate-size`

```css
:root { interpolate-size: allow-keywords; }

details::details-content {
  block-size: 0;
  overflow: clip;
  transition: block-size var(--motion-duration-base-exit) var(--motion-ease-in),
              content-visibility var(--motion-duration-base-exit) allow-discrete;
}
details[open]::details-content {
  block-size: auto;
  transition-duration: var(--motion-duration-base);
  transition-timing-function: var(--motion-ease-out);
}
@media (prefers-reduced-motion: reduce) {
  details::details-content { transition: none; }
}
```

Unsupported browsers open and close instantly, which is fine.

#### Grid-rows trick (works everywhere, any element)

```css
.collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--motion-duration-base) var(--motion-ease-out);
}
.collapse[data-open="true"] { grid-template-rows: 1fr; }
.collapse > .inner { overflow: hidden; min-block-size: 0; }
.collapse[data-open="false"] > .inner { visibility: hidden; transition: visibility 0s var(--motion-duration-base); }
@media (prefers-reduced-motion: reduce) { .collapse { transition: none; } }
```

`visibility: hidden` after close keeps collapsed links out of the tab order. The trigger carries `aria-expanded` and `aria-controls`.

Both approaches animate layout, so they are fine for one panel at a time but not for dozens at once.

#### Flutter, SwiftUI, Compose

```dart
AnimatedSize(
  duration: MediaQuery.disableAnimationsOf(context) ? Duration.zero : MotionTokens.base,
  curve: MotionTokens.easeOut,
  alignment: Alignment.topCenter,
  child: open ? const Details() : const SizedBox.shrink(),
);
```

```swift
DisclosureGroup("Shipping", isExpanded: $open) { ShippingDetails() }
// custom: VStack { header; if open { body.transition(.opacity) } }
//         .animation(reduceMotion ? nil : .motionBase, value: open)
```

```kotlin
AnimatedVisibility(open,
    enter = expandVertically(tween(MotionTokens.Base, easing = MotionTokens.EaseOut)) + fadeIn(tween(MotionTokens.Fast)),
    exit = shrinkVertically(tween(MotionTokens.BaseExit, easing = MotionTokens.EaseIn)) + fadeOut(tween(MotionTokens.FastExit))
) { Details() }
```

---

### 12. Gesture: drag-to-dismiss sheet

**When:** bottom sheets and cards on touch devices. **Rule:** the sheet follows the finger 1:1, release decides by distance or velocity, settles with `spring.gentle`; a visible close button and Escape/back always do the same thing.

#### React Native (Reanimated 3 + Gesture Handler)

```tsx
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming,
  runOnJS, ReduceMotion } from "react-native-reanimated";
import { mt } from "./motion-tokens";
import { rnEase, rnSpring } from "./rn-motion";

const DISMISS_DISTANCE = 120, DISMISS_VELOCITY = 800;

export function Sheet({ height, onClose, children }) {
  const y = useSharedValue(0);

  const close = () => {
    y.value = withTiming(height, { duration: mt.exit.base, easing: rnEase.in,
      reduceMotion: ReduceMotion.System }, done => done && runOnJS(onClose)());
  };

  const pan = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate(e => { y.value = Math.max(0, e.translationY); })
    .onEnd(e => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        y.value = withTiming(height, { duration: mt.exit.base, easing: rnEase.in, reduceMotion: ReduceMotion.System },
          done => done && runOnJS(onClose)());
      } else {
        y.value = withSpring(0, { ...rnSpring.gentle,
          velocity: e.velocityY, reduceMotion: ReduceMotion.System });
      }
    });

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.sheet, style]} accessibilityViewIsModal>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close">…</Pressable>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
```

On Reanimated 4 replace `runOnJS(fn)()` with `scheduleOnRN(fn)` from `react-native-worklets`.

#### SwiftUI

```swift
struct DraggableSheet<Content: View>: View {
    @Binding var isPresented: Bool
    @State private var offset: CGFloat = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ViewBuilder var content: Content

    var body: some View {
        content
            .offset(y: offset)
            .gesture(DragGesture()
                .onChanged { offset = max(0, $0.translation.height) }
                .onEnded { value in
                    let shouldClose = value.translation.height > 120 || value.velocity.height > 800
                    withAnimation(reduceMotion ? .motionFast : .springGentle) {
                        if shouldClose { isPresented = false } else { offset = 0 }
                    }
                })
            .accessibilityAction(.escape) { isPresented = false }
    }
}
```

Prefer the system `.sheet` with `.presentationDetents([.medium, .large])` when you can; it already has correct drag physics.

#### Compose

```kotlin
val offset = remember { Animatable(0f) }
val scope = rememberCoroutineScope()
val reduced = rememberReducedMotion()

Box(Modifier
    .offset { IntOffset(0, offset.value.roundToInt()) }
    .draggable(
        orientation = Orientation.Vertical,
        state = rememberDraggableState { d -> scope.launch { offset.snapTo((offset.value + d).coerceAtLeast(0f)) } },
        onDragStopped = { velocity ->
            if (offset.value > dismissPx || velocity > 2400f) {
                offset.animateTo(sheetHeightPx, tween(MotionTokens.SlowExit, easing = MotionTokens.EaseIn))
                onDismiss()
            } else {
                offset.animateTo(0f, if (reduced) snap() else MotionTokens.springGentle(), initialVelocity = velocity)
            }
        })
) { SheetContent(onClose = onDismiss) }
```

Material 3 `ModalBottomSheet` covers this for most apps; build your own only for custom shapes or snap points.

---

### 13. Form error feedback

**When:** validation fails on blur or submit. **Rule:** the message appears inline with a `duration.fast` fade and is announced; an optional shake is short (≤ 300ms, ≤ 6px), runs once, and is off under reduced motion. Colour and text carry the meaning, never motion alone.

```html
<label for="email">Email</label>
<input id="email" aria-invalid="true" aria-describedby="email-err">
<p id="email-err" class="field-error" role="alert">Enter an email like name@example.com</p>
```

```css
.field-error {
  animation: fade-in var(--motion-duration-fast) var(--motion-ease-out);
}
@keyframes fade-in { from { opacity: 0; } }

@media (prefers-reduced-motion: no-preference) {
  .field[data-shake] input { animation: shake 280ms var(--motion-ease-in-out); }
}
@keyframes shake {
  20%, 60% { transform: translateX(calc(var(--motion-distance-nudge) * -1)); }
  40%, 80% { transform: translateX(var(--motion-distance-nudge)); }
}
```

```ts
function flagError(field: HTMLElement) {
  field.removeAttribute("data-shake");
  void field.offsetWidth;          // restart the animation
  field.setAttribute("data-shake", "");
  field.querySelector("input")?.focus();
}
```

Skip the shake in high-stakes or anxious contexts (exams, payments); a calm inline message is enough. On submit with several errors, move focus to an error summary instead of shaking every field.

```kotlin
// Compose: one-off shake, skipped under reduced motion
val shake = remember { Animatable(0f) }
LaunchedEffect(errorCount) {
    if (errorCount > 0 && !reduced) {
        shake.animateTo(0f, keyframes { durationMillis = 280
            -6f at 56; 6f at 112; -6f at 168; 6f at 224 })
    }
}
OutlinedTextField(value, onValueChange, isError = error != null,
    supportingText = { error?.let { Text(it) } },
    modifier = Modifier.offset { IntOffset(shake.value.dp.roundToPx(), 0) })
```

---

### 14. Success and celebration

**When:** a real milestone only (first project published, course completed, payment received), not every save. **Rule:** under 1 s, one moment, off under reduced motion; haptic feedback follows system settings.

#### Web

```ts
export function celebrate(target: HTMLElement) {
  target.classList.add("is-done");          // checkmark draw, works under reduced motion as a fade
  if (prefersReduced()) return;
  target.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.05)" }, { transform: "scale(1)" }],
    { duration: 400, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
}
```

```css
.check path {
  stroke-dasharray: 24; stroke-dashoffset: 24;
  transition: stroke-dashoffset var(--motion-duration-slow) var(--motion-ease-out);
}
.is-done .check path { stroke-dashoffset: 0; }
@media (prefers-reduced-motion: reduce) {
  .check path { stroke-dashoffset: 0; opacity: 0; transition: opacity var(--motion-duration-fast); }
  .is-done .check path { opacity: 1; }
}
```

If you use a confetti library, gate the call with `prefersReduced()`, cap particle count, and keep it under 1 s. Announce the success in text (`role="status"`).

#### Haptics per platform

```swift
// SwiftUI: system decides intensity and honours the user's haptics setting
Button("Publish") { publish() }
    .sensoryFeedback(.success, trigger: publishedCount)
```

```kotlin
// Android View / Compose: CONFIRM respects the system haptic setting (API 30+)
val view = LocalView.current
LaunchedEffect(done) {
    if (done) view.performHapticFeedback(
        if (Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.CONFIRM else HapticFeedbackConstants.CONTEXT_CLICK)
}
```

```ts
// Expo
import * as Haptics from "expo-haptics";
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

```dart
// Flutter
HapticFeedback.mediumImpact();
```

Use haptics for confirmation of a physical-feeling action (toggle, drop, success), never for every tap or scroll tick. Do not fire custom vibration patterns that bypass the system setting.

---

### 15. Magnetic cursor and 3D tilt

**When:** at most one or two focal elements per page (the primary CTA on a marketing hero, a product card in a showcase). **Rule:** `pointer: fine` only, small pull, resets on leave, off under reduced motion. Never on forms, navigation, dashboards or dense lists.

```ts
import gsap from "gsap";

export function magnetic(el: HTMLElement, strength = 0.25) {
  const ok = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!ok.matches) return () => {};
  const xTo = gsap.quickTo(el, "x", { duration: 0.3, ease: "expo.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.3, ease: "expo.out" });
  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - r.left - r.width / 2) * strength);
    yTo((e.clientY - r.top - r.height / 2) * strength);
  };
  const onLeave = () => { xTo(0); yTo(0); };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    gsap.set(el, { clearProps: "x,y" });
  };
}
```

```css
/* 3D tilt driven by two custom properties set from pointermove */
@media (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .tilt {
    transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
    transition: transform var(--motion-duration-fast) var(--motion-ease-out);
  }
}
```

Clamp tilt to about 6 degrees, update the custom properties inside `requestAnimationFrame`, and read `getBoundingClientRect()` once on `pointerenter` rather than on every move. The hit area must stay where the element visually is; a strength above 0.3 starts pulling the element away from the cursor.

---

### 16. Lottie and Rive

**When:** an illustrated empty state, onboarding step or brand moment that CSS cannot express. **Rule:** budget under ~60 KB per file, lazy-loaded, paused off-screen, a still frame under reduced motion, never the only carrier of information.

```ts
import type { AnimationItem } from "lottie-web";

export async function mountLottie(container: HTMLElement, path: string, loop = false) {
  const reduced = prefersReduced();
  const { default: lottie } = await import("lottie-web/build/player/lottie_light");
  const anim: AnimationItem = lottie.loadAnimation({
    container, path, renderer: "svg", loop: loop && !reduced, autoplay: false,
  });
  anim.addEventListener("DOMLoaded", () => {
    if (reduced) anim.goToAndStop(anim.totalFrames - 1, true); // meaningful final frame
  });
  const io = new IntersectionObserver(([e]) => {
    if (reduced) return;
    e.isIntersecting ? anim.play() : anim.pause();
  }, { threshold: 0.25 });
  io.observe(container);
  return () => { io.disconnect(); anim.destroy(); };
}
```

```ts
// Rive
import { Rive } from "@rive-app/canvas";
const r = new Rive({
  src: "/anim/onboarding.riv", canvas, stateMachines: "Main",
  autoplay: !prefersReduced(),
  onLoad: () => r.resizeDrawingSurfaceToCanvas(),
});
// pause with an IntersectionObserver as above: r.pause() / r.play(); cleanup: r.cleanup()
```

Notes:

- Prefer `.lottie` (dotLottie) or compressed JSON; strip unused assets and hidden layers before export.
- Load the player only when the container is near the viewport (dynamic import inside an `IntersectionObserver` with a `rootMargin`).
- Give the container explicit dimensions to avoid layout shift, plus `role="img"` and an `aria-label`, or `aria-hidden="true"` if decorative.
- Flutter `lottie` package: `Lottie.asset(path, animate: !MediaQuery.disableAnimationsOf(context))`. iOS `lottie-ios` and Android `lottie-compose`: check the platform reduced-motion flag and call `pause()` / set progress to the final frame.

---

### Desktop XAML (WinUI, WPF): storyboard pattern

The recipes above map to XAML storyboards. The pattern that respects the system setting:

```xml
<Storyboard x:Key="PanelEnter">
  <DoubleAnimation Storyboard.TargetProperty="Opacity" From="0" To="1" Duration="0:0:0.2">
    <DoubleAnimation.EasingFunction><ExponentialEase EasingMode="EaseOut" Exponent="6"/></DoubleAnimation.EasingFunction>
  </DoubleAnimation>
  <DoubleAnimation Storyboard.TargetProperty="(UIElement.RenderTransform).(TranslateTransform.Y)"
                   From="6" To="0" Duration="0:0:0.2">
    <DoubleAnimation.EasingFunction><ExponentialEase EasingMode="EaseOut" Exponent="6"/></DoubleAnimation.EasingFunction>
  </DoubleAnimation>
</Storyboard>
```

```csharp
void ShowPanel()
{
    Panel.Visibility = Visibility.Visible;
    bool animate = new UISettings().AnimationsEnabled;      // WPF: SystemParameters.ClientAreaAnimation
    if (animate) ((Storyboard)Resources["PanelEnter"]).Begin();
    else { Panel.Opacity = 1; }
}
```

In WinUI prefer built-in theme transitions (`EntranceThemeTransition`, `RepositionThemeTransition`, `ConnectedAnimationService` for shared elements); they follow the system setting for free. Animate `RenderTransform`, never `Width`/`Height`/`Margin`.

---

## Performance checklist

- [ ] Animate only `transform` and `opacity` (plus `filter` sparingly). Colour transitions are fine on small elements. Never `width`, `height`, `top`, `left`, `margin` for motion; use the FLIP, grid-rows or `interpolate-size` recipes when size must change.
- [ ] List transitioned properties explicitly. No `transition: all`; it animates things you did not intend and costs layout.
- [ ] `will-change: transform` only while an animation is running or imminent (set on `pointerenter`, remove on `transitionend`), not in global CSS.
- [ ] `transform-origin` matches the physical source: menus at the trigger edge, progress bars at the start edge (flip it in RTL), scale-in from the centre only for centred dialogs.
- [ ] SVG parts that rotate or scale use `transform-box: fill-box; transform-origin: center;`.
- [ ] No layout reads (`getBoundingClientRect`, `offsetHeight`) inside animation loops; read once, then write. Batch reads before writes.
- [ ] Hold 60 fps on a low-end Android phone with 4x CPU throttling in DevTools. If it drops, reduce the number of animated elements before tuning easing.
- [ ] Pause anything off-screen or in a background tab: `IntersectionObserver` for loops, Lottie, Rive, video; `document.visibilityState` for timers.
- [ ] Clean up on unmount: `useGSAP` / `gsap.context().revert()` / `mm.revert()`, `removeEventListener` with the same named handler, `io.disconnect()`, `cancelAnimationFrame`, Flutter `controller.dispose()`, Lottie `destroy()`, Rive `cleanup()`.
- [ ] Animations triggered by data (count-ups, list updates) are interruptible: a new value retargets from the current value instead of queuing.
- [ ] Large images and the LCP element are not hidden behind an entrance animation.
- [ ] Bundle weight: GSAP plugins and Lottie players are imported only on routes that use them.

---

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Every section fades up on scroll | Reveal one or two sections that need it; the rest are simply there |
| `transition: all 0.3s ease` | List properties and use tokens: `transform var(--motion-duration-fast) var(--motion-ease-out)` |
| Exit as long as enter, or longer | Exit at ≈65% of enter with `ease.in` |
| Bouncy springs on forms, finance or exam screens | `spring.ui` (no overshoot); `spring.playful` only for playful brands in playful places |
| Staggering 20 cards at 100ms each | 30-50ms across the first ~6, the rest appear with the last one; total ≤ 600ms |
| Reduced motion handled by `animation: none` on everything, leaving content hidden at frame 0 | Start from the visible state; replace movement with a `duration.fast` fade |
| Shimmer, marquee or parallax that keeps running under reduced motion | Wrap loops in `prefers-reduced-motion: no-preference`; static fallback |
| Hover effects that fire on touch and stick | Gate with `@media (hover: hover) and (pointer: fine)` |
| Animating `height` from measured pixels in JS | `interpolate-size`, the grid-rows trick, `AnimatedSize`, `AnimatedVisibility` |
| Page transitions on every link including in-page tabs | `duration.slow` route transitions only between real destinations; tabs crossfade at `duration.fast` |
| Count-up on prices, totals or user-entered values | Show the final value; count-ups only for headline metrics, ≤ 600ms |
| Drag-only dismissal | Always pair a gesture with a visible button and Escape/back |
| Magnetic buttons and tilt cards across a whole page | One or two focal elements, `pointer: fine` only |
| Lottie files of several hundred KB autoplaying in a loop | < ~60 KB, lazy-loaded, paused off-screen, still frame under reduced motion |
| Animation without cleanup in SPAs (ScrollTriggers pile up between routes) | `useGSAP`, `mm.revert()`, dispose controllers on unmount |
| Haptics on every tap | Haptics for confirmations and milestones, through the system APIs that respect user settings |
