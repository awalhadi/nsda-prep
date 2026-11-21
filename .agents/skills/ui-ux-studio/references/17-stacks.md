# 17. Stacks: applying the system on each platform

Detect the stack before you write a line of UI code. Never assume it from the request. Look at `package.json` dependencies, `next.config.*`, a `tailwind.config.*` file or an `@theme` block in CSS, `nuxt.config.*`, `svelte.config.*`, `astro.config.*`, `angular.json`, `composer.json`, `pubspec.yaml`, `*.xcodeproj` or `Package.swift`, `build.gradle(.kts)` with Compose enabled, `app.json` plus `react-native` in dependencies, `*.csproj` referencing WinUI, WPF, Avalonia, Uno or MAUI, and `pom.xml` / `build.gradle` with JavaFX.
If the project already has a design system, theme, or component library, it wins over anything in this file. Extend it, map these concepts onto it, and only introduce new structure where something is missing.
Motion code lives in `11-motion-recipes.md`. This file only names the motion APIs per stack.

---

## Universal translation table

| Concept | Web CSS / Tailwind | React | Flutter | SwiftUI | Compose | React Native | XAML desktop |
|---|---|---|---|---|---|---|---|
| Tokens source | CSS custom properties, Tailwind v4 `@theme` | same CSS vars, or a TS const for JS use | `ThemeData` + `ThemeExtension` | Asset catalog colours + `Color`/`Font` extensions | `MaterialTheme` + `CompositionLocal` | TS theme object, `StyleSheet`, or NativeWind | `ResourceDictionary` |
| Semantic colour | `var(--color-text)`, `text-fg` | `className="text-fg"` | `Theme.of(context).colorScheme.onSurface` | `Color(.textPrimary)` | `MaterialTheme.colorScheme.onSurface` | `theme.colors.text` | `{ThemeResource TextFillColorPrimaryBrush}` |
| Dark mode | `prefers-color-scheme`, `.dark` class, `color-scheme`, `light-dark()` | `next-themes` or class on `<html>` | `darkTheme:` + `themeMode:` | asset "Any/Dark" appearances, `\.colorScheme` | `isSystemInDarkTheme()`, `darkColorScheme()` | `useColorScheme()` | `ThemeDictionaries` (Light/Dark/HighContrast), `RequestedTheme` |
| Type scale | `--text-*` in `@theme`, `rem` units | Tailwind `text-*` | `TextTheme` | `.font(.body)`, `Font.custom(_:size:relativeTo:)` | `Typography`, `MaterialTheme.typography` | `Text` style tokens | `TextBlock` styles (`BodyTextBlockStyle`) |
| Spacing | `--spacing` (v4 base unit), `gap-*` | Tailwind spacing | `SizedBox`, `EdgeInsetsDirectional`, `Gap` constants | `.padding()`, `spacing:` on stacks | `Arrangement.spacedBy`, `Dp` constants | `gap`, `padding` from tokens | `Thickness` resources, `Spacing` |
| Radius | `--radius-*` | `rounded-*` | `ShapeBorder` in component themes | `RoundedRectangle(cornerRadius:)`, `.clipShape` | `Shapes`, `MaterialTheme.shapes` | `borderRadius` token | `CornerRadius` resources (`ControlCornerRadius`) |
| Focus ring | `:focus-visible` + `outline` | same, never `outline: none` alone | `FocusNode`, `focusColor`, `Focus` | `@FocusState`, `.focused()`, system ring | `Modifier.focusable()`, `Indication` | platform default, `onFocus` on TV/web | `UseSystemFocusVisuals`, `FocusVisualStyle` (WPF) |
| Touch target | `min-block-size: 44px` / `size-11` | same | `materialTapTargetSize`, `kMinInteractiveDimension` (48) | `.frame(minWidth: 44, minHeight: 44)` + `.contentShape` | `Modifier.minimumInteractiveComponentSize()` | `hitSlop`, `minHeight: 44` | `MinHeight`, `MinWidth` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)`, `motion-safe:` | `matchMedia`, Motion `useReducedMotion` | `MediaQuery.disableAnimationsOf(context)` | `@Environment(\.accessibilityReduceMotion)` | system animator scale (honoured by Compose) | `AccessibilityInfo.isReduceMotionEnabled()`, Reanimated `useReducedMotion` | `UISettings.AnimationsEnabled` (WinUI), `SystemParameters.ClientAreaAnimation` (WPF) |
| Text scaling | `rem`/`em`, never fixed `px` heights on text containers | same | `MediaQuery.textScalerOf(context)` | Dynamic Type, `@ScaledMetric`, `\.dynamicTypeSize` | `sp` units, `LocalDensity.fontScale` | `allowFontScaling`, `maxFontSizeMultiplier` | `UISettings.TextScaleFactor`, `IsTextScaleFactorEnabled` |
| Safe area | `env(safe-area-inset-*)` + `viewport-fit=cover` | same | `SafeArea`, `MediaQuery.paddingOf` | `.safeAreaInset`, `.ignoresSafeArea` (backgrounds only) | `WindowInsets.safeDrawing`, `enableEdgeToEdge()` | `react-native-safe-area-context` | title bar / `ExtendsContentIntoTitleBar` |
| Screen reader label | `aria-label`, `<label for>`, `.sr-only` | same, `useId()` for ids | `Semantics(label:)`, `tooltip:` | `.accessibilityLabel()` | `Modifier.semantics { contentDescription = … }` | `accessibilityLabel` | `AutomationProperties.Name` |
| Live announcement | `aria-live="polite"`, `role="status"` | same, region mounted before content changes | `SemanticsService.announce` | `AccessibilityNotification.Announcement(…).post()` | `semantics { liveRegion = LiveRegionMode.Polite }` | `AccessibilityInfo.announceForAccessibility` | `AutomationProperties.LiveSetting`, `RaiseNotificationEvent` |

---

## Token pipeline

One source, many outputs. Keep `tokens.json` (shape in `assets/tokens.template.json`) as the single source of truth: semantic names only, a `light` and `dark` value per colour, and a `pairs` list naming every foreground/background combination so contrast can be checked in CI.

```
tokens.json  ──►  generator  ──►  per-stack outputs (committed, never hand-edited)
```

| Stack | Generated output |
|---|---|
| Web | `tokens.css`: `:root { --color-bg: … }` and `.dark { … }`, plus a Tailwind v4 `@theme inline` block that maps utilities to those vars |
| JS needing values (charts, canvas, RN) | `tokens.ts`: `export const tokens = { … } as const` |
| Flutter | `app_tokens.dart`: a `ThemeExtension<AppColors>` with `light` and `dark` instances, plus `ColorScheme` builders |
| SwiftUI | Asset catalog colour sets (Any + Dark appearance) and a `Color`/`ShapeStyle` extension or generated asset symbols |
| Compose | `Color.kt` + `Theme.kt`: `lightColorScheme(…)`, `darkColorScheme(…)`, plus a custom `@Immutable` token class for non-Material roles |
| XAML | `Tokens.xaml`: `ResourceDictionary.ThemeDictionaries` with Light, Dark and HighContrast keys |
| JavaFX | `tokens.css`: looked-up colours on `.root` |

- Generators: Style Dictionary (supports custom formats for Dart, Swift, Kotlin, XAML) or a small project script. Either is fine. The script must run in CI and fail on drift (regenerate, then `git diff --exit-code`).
- Run the contrast check over `pairs` after every token change (`scripts/contrast.mjs`).
- Lint against raw values inside components:
  - CSS: stylelint `color-no-hex` and `declaration-property-unit-disallowed-list` scoped to component files, with the token files excluded.
  - JS/TS: ESLint `no-restricted-syntax` on string literals matching `/#[0-9a-f]{3,8}\b/i` inside `style` or `className`, or Tailwind arbitrary values like `bg-[#…]`.
  - Flutter: a `custom_lint` rule (or a CI grep) flagging `Color(0x…)` and `TextStyle(fontSize:` outside `lib/theme/`.
  - Native: a CI grep for `Color(red:` / `UIColor(red:` / `Color(0xFF` outside the theme module.
- Spacing and radius follow the same path. A token that exists in one output but not another is a bug.

---

## Plain HTML + CSS / Tailwind

**Tokens and theming**
- Tailwind v4 is CSS-first. Tokens live in CSS, not in `tailwind.config.js`. Use `@theme` for raw tokens and `@theme inline` when a utility should point at a runtime variable that changes with theme.
- Class-based dark mode in v4 needs a custom variant.
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
:root { --bg: #F7F6F2; --fg: #0F172A; }
.dark { --bg: #0B0F19; --fg: #E5E7EB; }
@theme inline { --color-bg: var(--bg); --color-fg: var(--fg); }
```
- Set `color-scheme: light dark` on `:root` (or per theme) so form controls and scrollbars match.
- Set the theme class in a blocking inline script in `<head>` before first paint to avoid a flash.
- Plain CSS without Tailwind: same custom properties, `light-dark()` is fine for simple pairs.

**Components**
- Use native elements first: `<button>`, `<a href>`, `<dialog>`, `<details>`, `<select>`, `popover` attribute. They bring keyboard and screen reader support for free.
- Write complete class names. Tailwind cannot see `bg-${color}-500`. Map variants to full strings.
- Keep `@apply` for small, repeated primitives. Prefer components in your templating layer over CSS abstractions.
- v4 renames to know: `bg-linear-to-r` (was `bg-gradient-to-r`), `shrink-0`, `size-*` for square boxes, `outline-hidden` (was `outline-none`).

**Accessibility**
- Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-focus-ring]`. Never remove the outline without a replacement.
- `sr-only` for visually hidden labels on icon buttons; `aria-hidden="true"` on the icon itself.
- Wrap motion in `motion-safe:` or reset it under `motion-reduce:`.
- One `<h1>`, ordered headings, `<main>`, `<nav aria-label>`, skip link as the first focusable element.

**Layout and responsive**
- Mobile-first: base classes for small screens, `md:` and up for larger.
- Use container queries (`@container`, `@md:`) for components that live in variable-width slots.
- Use logical properties (`ms-*`, `me-*`, `ps-*`, `start-*`) so RTL works by flipping `dir`.
- Use `min-h-dvh` rather than `h-screen` on mobile to avoid the browser-bar jump.
- Respect safe areas on fixed bars: `pb-[env(safe-area-inset-bottom)]` with `viewport-fit=cover` in the viewport meta.

**Performance**
- Give every `<img>` `width`/`height` or an `aspect-*` class; `loading="lazy"` below the fold, `fetchpriority="high"` on the LCP image.
- Self-host fonts, `font-display: swap`, preload only the one or two weights used above the fold, subset where possible.
- Animate only `transform` and `opacity`.

**Pitfalls**
- Sources outside the scanned tree (packages, CMS strings) need `@source "…"` or their classes vanish in production.
- Arbitrary values (`p-[13px]`) are a sign of a missing token.
- Z-index chaos: define a small named scale as tokens and use only that.
- `text-balance` on headings and `text-pretty` on paragraphs prevent awkward wraps; `min-w-0` + `truncate` or `break-words` stops long tokens from overflowing flex children.

---

## React and Next.js (incl. shadcn/ui)

**Tokens and theming**
- Styling tokens stay in CSS variables. Only import the TS const where JS genuinely needs a value (charts, canvas).
- shadcn/ui uses semantic pairs: `--background`/`--foreground`, `--primary`/`--primary-foreground`, `--muted`/`--muted-foreground`, `--border`, `--ring`, `--radius`, defined in `:root` and `.dark` and mapped through `@theme inline`. Map your `tokens.json` onto these names rather than inventing parallel ones.
- Dark mode with `next-themes`: `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`, and add `suppressHydrationWarning` to `<html>` because the class is set before React hydrates.
- Read the resolved theme only after mount. Rendering theme-dependent markup on the server causes hydration mismatches.

**Components**
- shadcn/ui components are copied source. Edit them in `components/ui` to match the system; do not wrap them in yet another layer.
- Check `components.json` for the base library (Radix or Base UI). Composition differs: Radix uses `asChild`, Base UI uses a `render` prop. Follow whichever the project uses.
- Variants via `cva` + `cn()`. Keep size and intent variants consistent across components.
- Use the primitive meant for the job: `Dialog` for modal content, `AlertDialog` for destructive confirms, `Sheet` for side panels, `Popover` for non-modal floating content, `DropdownMenu` for action lists, `Command` for search palettes, `Sonner` for toasts (mount `<Toaster />` once in the root layout).
- React 19: `ref` is a regular prop; avoid `forwardRef` in new code. Use `useId()` for label/description ids.
- If the React Compiler is enabled, do not add manual `useMemo`/`useCallback` for render cost.

**Accessibility**
- Keep Radix/Base UI focus management intact: focus moves into dialogs, is trapped, and returns to the trigger. Do not stop propagation on their key handlers.
- Every `DialogContent` needs a `DialogTitle` (hide it visually with `sr-only` if needed) and a description or `aria-describedby={undefined}`.
- Announce async results through an always-mounted `role="status"` region; a region inserted together with its text is often not read.
- After client-side navigation, move focus to the new page heading or rely on the router's announcer (Next.js has one built in).
- Use `eslint-plugin-jsx-a11y`.

**Layout and responsive**
- Server Components by default. Push `"use client"` down to the smallest interactive leaf so layout and content render without JS.
- Stream slow regions with `<Suspense fallback={<Skeleton …/>}>` and `loading.tsx`. Skeletons must match final dimensions.
- Avoid `window` checks during render to pick layouts. Use CSS breakpoints or container queries so server and client markup match.

**Performance**
- `next/font`: load in the root layout, expose as a CSS variable, map it in `@theme`.
```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
export default function RootLayout({ children }) {
  return <html lang="en" className={inter.variable} suppressHydrationWarning><body>{children}</body></html>;
}
```
- `next/image`: always `width`/`height`, or `fill` with a sized parent and a `sizes` attribute. Mark the LCP image as high priority (`priority`, renamed `preload` in recent versions). Configure `images.remotePatterns` for remote hosts.
- Lazy-load heavy client widgets (`next/dynamic`, `React.lazy`), for example editors, charts, dialogs with large content.
- Virtualise long lists (TanStack Virtual). Keep stable `key`s.
- `useTransition` / Actions keep inputs responsive during updates; `useOptimistic` for instant feedback on mutations.

**Pitfalls**
- `Date.now()`, `Math.random()`, locale formatting or `localStorage` in render cause hydration mismatches. Format on the server with an explicit locale and timezone, or render after mount.
- Putting a Context provider at the root turns the whole tree client-side. Put providers in a small client component that wraps `children`.
- Tooltips as the only label for icon buttons. Tooltips need `aria-label` on the button too, and they do not exist on touch.
- `onClick` on a `<div>`. Use `<button>`.

---

## Vue and Nuxt (incl. Nuxt UI)

**Tokens and theming**
- CSS variables plus Tailwind v4 `@theme`, as for plain web.
- Nuxt: `@nuxtjs/color-mode` (bundled with Nuxt UI) adds the class and avoids the flash. Read it with `useColorMode()`; render toggles inside `<ClientOnly>` because the preference is unknown on the server.
- Nuxt UI: semantic colours are configured in `app.config.ts`, not hard-coded per component.
```ts
export default defineAppConfig({
  ui: { colors: { primary: "indigo", neutral: "slate" } }
});
```
- For a fully custom palette, define every shade in `@theme static` and register the colour name in `nuxt.config.ts` (`ui.theme.colors`). Override per component with `class` (root) and `ui` (named slots), and global defaults under `app.config.ts` `ui.<component>`.

**Components**
- Vue 3.5: `<script setup>`, `defineProps`, `defineModel` for `v-model`, `useId()` for SSR-safe ids, `useTemplateRef`.
- Nuxt UI: wrap the app in `<UApp>` (it provides toasts, tooltips, overlays and `locale`). Use `color`, `variant`, `size` props instead of utility overrides. Icons as `i-{collection}-{name}`, collections installed locally.
- Overlays: `v-model:open`, or `useOverlay()` and await the result for confirm dialogs. Give every `UModal`/`USlideover` a `title` and `description`.
- Use `UForm` + `UFormField` so labels, help and errors are wired; `loading-auto` on submit buttons.

**Accessibility**
- Nuxt UI is built on Reka UI, which handles focus trap and keyboard. Keep its structure.
- `<NuxtRouteAnnouncer />` in `app.vue` announces page changes.
- `defineShortcuts` for keyboard shortcuts; show them in menus or the command palette.

**Layout and responsive**
- Nuxt 4 puts app code under `app/`. Layouts in `app/layouts`, set per page with `definePageMeta({ layout })`.
- Use `.client.vue` only for components that truly need the browser; wrap them in `<ClientOnly>` with a sized fallback.
- `UDashboardGroup` / `UDashboardSidebar` / `UDashboardPanel` for app shells; give `USplitter`-style layouts a server-stable default size.

**Performance**
- `@nuxt/image` (`<NuxtImg>`, `<NuxtPicture>`) with `width`, `height`, `sizes`; `preload` the LCP image.
- `@nuxt/fonts` to self-host and add fallback metrics.
- `Lazy` prefix (`<LazyHeavyChart />`) and lazy hydration (`hydrate-on-visible`) for below-the-fold interactivity. `UTable` `virtualize` for large data.

**Pitfalls**
- Using `useFetch` results without `pending`/`error` states leaves blank screens.
- Reading `window` or `document` in `<script setup>` root breaks SSR; use `onMounted`.
- Mixing raw Tailwind colour classes (`bg-indigo-500`) with Nuxt UI semantic colours splits the theme.

---

## Svelte and SvelteKit

**Tokens and theming**
- CSS variables on `:root` and `.dark` (or `[data-theme]`), Tailwind v4 `@theme` if Tailwind is used.
- Set the theme attribute in `src/app.html` with an inline script, or in `hooks.server.ts` via `transformPageChunk` from a cookie, to avoid a flash.
- Pass per-component overrides as CSS custom properties: `<Button --button-bg="var(--color-danger)" />`.

**Components**
- Svelte 5 runes: `$state`, `$derived`, `$effect` (rarely), `$props()` with defaults and rest props. Events are attributes (`onclick={…}`), and callback props replace `createEventDispatcher`.
- Snippets (`{#snippet}` / `{@render}`) replace slots in new code.
- Always key `{#each items as item (item.id)}`.
- Headless libraries: Bits UI (shadcn-svelte builds on it) or Melt UI. Keep their focus and ARIA wiring.

**Accessibility**
- Treat compiler `a11y_*` warnings as errors in CI. They catch missing labels, click handlers on non-interactive elements, and missing `alt`.
- `prefersReducedMotion` from `svelte/motion` gives a reactive flag; built-in transitions should get `duration: 0` when it is true.
- Transitions are local by default in Svelte 5; add `|global` only when an element should also animate when a parent block appears or disappears.

**Layout and responsive**
- `+layout.svelte` for shells. Use `$app/state` (`page`) for the current route and highlight nav from it.
- Form actions with `use:enhance` work without JS; show a pending state from the submitting flag.

**Performance**
- `@sveltejs/enhanced-img` (`<enhanced:img>`) generates sizes and formats at build time.
- Prerender static routes; stream slow data by returning promises from `load` and rendering with `{#await}`.

**Pitfalls**
- Mixing legacy `$:` and `export let` with runes in one component.
- `$effect` used to derive state. Use `$derived`.
- Scoped styles cannot reach child components; use CSS variables, not `:global()` sprawl.

---

## Astro

**Tokens and theming**
- Global `tokens.css` imported in the base layout. Tailwind v4 via the Vite plugin (`@tailwindcss/vite`).
- Inline the theme script with `<script is:inline>` in `<head>` so it runs before paint.
- Component styles are scoped by default; use `is:global` only for resets and tokens.

**Components**
- `.astro` components for static UI. Framework components (React, Vue, Svelte) only for interactive islands.
- Choose the hydration directive deliberately: `client:visible` or `client:idle` for most islands, `client:load` only for above-the-fold interactivity, `client:media` for viewport-specific widgets.
- Keep design tokens and primitives shared across frameworks by styling through CSS variables, not framework-specific theme providers.

**Accessibility**
- Islands must render meaningful server HTML before hydration. A button that does nothing until JS arrives is a broken button; use a link or form fallback.
- With view transitions, check that focus lands on the new page and the title updates.

**Layout and responsive**
- Base layout with a shared `<head>` component (title, meta, canonical, theme script).
- View transitions via `<ClientRouter />` from `astro:transitions`; `transition:name` to pair elements, `transition:persist` for players or islands that must survive navigation. Motion details in `11-motion-recipes.md`.

**Performance**
- `<Image>` and `<Picture>` from `astro:assets` for sizing, formats and lazy loading. Local images get dimensions automatically.
- Zero JS by default. Every `client:*` directive is a cost; review them in code review.

**Pitfalls**
- Using `client:only` without a sized placeholder causes layout shift.
- Theme scripts bundled (not `is:inline`) run too late and flash.

---

## Angular

**Tokens and theming**
- Angular Material 3: one `mat.theme(…)` call in the global stylesheet emits `--mat-sys-*` system variables. Read those in your own components instead of hex values.
```scss
@use "@angular/material" as mat;
html {
  color-scheme: light dark;
  @include mat.theme((color: mat.$violet-palette, typography: Inter, density: 0));
}
```
- `color-scheme: light dark` lets Material follow the OS; set `color-scheme: dark` on a class for a manual toggle. Use `mat.theme-overrides(…)` or component `*-overrides` mixins for brand tweaks.
- Without Material: CSS variables on `:root`/`.dark`, consumed in `:host` styles; Tailwind v4 works through PostCSS.

**Components**
- Standalone components, `input()` / `output()` / `model()`, signals and `computed()` for state, `@if` / `@for (…; track item.id)` / `@switch` control flow.
- `ChangeDetectionStrategy.OnPush` and zoneless readiness: update state through signals so the view refreshes.
- Use `:host` for the component's own box; keep `ViewEncapsulation.Emulated`.

**Accessibility**
- CDK a11y: `cdkTrapFocus`, `FocusMonitor` (keyboard vs mouse focus origin), `LiveAnnouncer.announce()`, `cdkAriaLive`. Angular Material components already use them.
- Router: after navigation, move focus to the main heading (listen to `NavigationEnd`) because Angular does not announce route changes by itself.
- Run the template a11y rules from `@angular-eslint` (`template/accessibility` config).

**Layout and responsive**
- CDK `BreakpointObserver` for behaviour changes; CSS for visual changes.
- `@defer (on viewport) { … } @placeholder { … }` for below-the-fold blocks, with a sized placeholder.

**Performance**
- `NgOptimizedImage` (`ngSrc`, `width`, `height`, `priority` on the LCP image, `fill` for responsive containers).
- Lazy-load routes with `loadComponent`. Prefer `toSignal()` or the `async` pipe over manual subscriptions.

**Pitfalls**
- Overriding Material internals with `::ng-deep` and deep selectors. Use the override mixins or system tokens.
- `@for` without a meaningful `track` re-renders lists and loses focus.

---

## Laravel (Blade, Livewire, Inertia)

**Tokens and theming**
- Tailwind v4 via `@tailwindcss/vite`, loaded with `@vite(['resources/css/app.css', 'resources/js/app.js'])`. Tokens in `app.css` under `@theme`.
- Dark mode: class strategy with `@custom-variant dark`, theme script inline in the layout `<head>`.
- Flux (official Livewire UI kit) and the starter kits use CSS variables for accent colours; map tokens onto them.

**Components**
- Anonymous Blade components (`resources/views/components/button.blade.php`) for primitives. `@props([…])` for typed defaults, `$attributes->merge(['class' => …])` so callers can extend, `@class([…])` for conditional classes.
- Named slots for card headers and footers; default slot content where reasonable.
- Inertia: page components in `resources/js/Pages`, persistent layouts to keep shell state, `<Link>` for navigation, `useForm` for errors and `processing` state. Then follow the React or Vue section.

**Accessibility**
- Livewire re-renders morph the DOM. Add `wire:key` on list items and dynamic fields so focus and input state survive.
- Pair every async action with `wire:loading` feedback (disable the button, show a spinner with `aria-busy`), and announce results in a `role="status"` region.
- `wire:navigate` swaps pages without a reload; move focus to the main heading afterwards.

**Layout and responsive**
- One layout component (`<x-layouts.app>`) that owns the shell, nav, and theme script.
- Alpine.js for local UI state (menus, tabs); keep server state in Livewire.

**Performance**
- `wire:model.live.debounce.300ms` for search; plain `wire:model` (deferred) for normal forms.
- Lazy Livewire components (`lazy` attribute) with a placeholder of the right size. Paginate large tables.

**Pitfalls**
- `{!! !!}` on user content. Always `{{ }}`.
- Building class names by string concatenation in Blade; Tailwind cannot detect them.

---

## Three.js / WebGL UI

**Tokens and theming**
- Read colours from CSS variables at init and on theme change (`getComputedStyle(document.documentElement).getPropertyValue('--color-primary')`) so the scene matches the page.
- Use a transparent canvas (`alpha: true`) and let the page background come from CSS.
- Set `renderer.outputColorSpace = THREE.SRGBColorSpace` and mark colour textures as sRGB, or token colours render washed out.

**Components**
- Keep UI controls (buttons, labels, sliders) in HTML over or beside the canvas, not drawn in WebGL. They stay accessible and crisp.
- In React Three Fiber, `@react-three/drei` `<Html>` positions DOM labels in 3D space.

**Accessibility**
- The canvas is invisible to screen readers. Give it `role="img"` and an `aria-label` describing what it shows, and provide the same information as HTML (a list, table or text) when it carries meaning.
- Reduced motion: check `matchMedia('(prefers-reduced-motion: reduce)')`; render a static frame or stop auto-rotation and camera fly-throughs. Never make interaction depend on motion.
- Keyboard: anything you can do with the pointer (rotate, select) needs an HTML control equivalent.

**Layout and responsive**
- Size the renderer to its container, not the window. Use `ResizeObserver`, update `camera.aspect` and call `camera.updateProjectionMatrix()`.
- Touch: set `touch-action` on the canvas so page scroll still works outside the interactive area.

**Performance**
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`.
- `renderer.setAnimationLoop(…)` and pause on `visibilitychange` or when the canvas leaves the viewport (`IntersectionObserver`). R3F: `frameloop="demand"` for mostly static scenes.
- Reuse geometries and materials, use `InstancedMesh` for repeats, `dispose()` geometries, materials and textures on removal.
- Lazy-load the 3D bundle after the main content; show a static poster image first.

**Pitfalls**
- No fallback when WebGL is unavailable or the context is lost (`webglcontextlost`). Always render the poster and the HTML content.
- Full-viewport hero scenes that drain battery on mobile. Cap particle counts and frame work.

---

## Flutter

**Tokens and theming**
- Material 3 is the default. Build both schemes from tokens (or `ColorScheme.fromSeed` and then override roles) and pass `theme`, `darkTheme`, `themeMode` to `MaterialApp`.
- Roles that Material does not have (chip backgrounds, signal colours) go in a `ThemeExtension`.
```dart
@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({required this.chipSuccessBg});
  final Color chipSuccessBg;
  @override AppColors copyWith({Color? chipSuccessBg}) => AppColors(chipSuccessBg: chipSuccessBg ?? this.chipSuccessBg);
  @override AppColors lerp(AppColors? o, double t) => AppColors(chipSuccessBg: Color.lerp(chipSuccessBg, o?.chipSuccessBg, t)!);
}
// ThemeData(extensions: [AppColors.light]); read: Theme.of(context).extension<AppColors>()!
```
- Style components through component themes in `ThemeData` (`filledButtonTheme`, `inputDecorationTheme`, `cardTheme`) rather than per-widget styles.
- Text styles from `Theme.of(context).textTheme`; set `fontFamily` once in `ThemeData`. Bundle fonts as assets (or `google_fonts` with runtime fetching disabled for release).

**Components**
- Small widgets, `const` constructors, composition over inheritance.
- Use adaptive constructors where they exist (`Switch.adaptive`, `CircularProgressIndicator.adaptive`) when the app should feel native on iOS.
- Back handling: `PopScope` (not the removed `WillPopScope`).

**Accessibility**
- Material widgets carry semantics. Custom tappable widgets need `Semantics(button: true, label: …)` or should be built on `InkWell`/buttons.
- `MergeSemantics` for list rows that should read as one item; `ExcludeSemantics` for decoration. Icon buttons need `tooltip:` (it doubles as the label).
- Text scaling: read `MediaQuery.textScalerOf(context)`; never clamp it globally to 1.0. Test at 200 %. `textScaleFactor` is deprecated.
- Reduced motion: `MediaQuery.disableAnimationsOf(context)`. Announcements: `SemanticsService.announce(message, textDirection)`.
- Keyboard and desktop: `FocusTraversalGroup`, `Shortcuts` + `Actions`, visible `focusColor`.

**Layout and responsive**
- `LayoutBuilder` or `MediaQuery.sizeOf(context)` with breakpoints from tokens (600 / 1024). Use `NavigationBar` on compact, `NavigationRail` on medium, a drawer or rail on expanded.
- `SafeArea` around content; let backgrounds extend under system bars.
- RTL: `EdgeInsetsDirectional`, `AlignmentDirectional`, `PositionedDirectional`. Localise with `flutter_localizations` + `gen-l10n` (ARB files).

**Performance**
- `ListView.builder` / slivers for long lists, `itemExtent` when fixed.
- `cacheWidth`/`cacheHeight` on large images; `cached_network_image` for network images with placeholders.
- `RepaintBoundary` around frequently repainting regions; profile with DevTools in profile mode.
- Motion APIs: implicit `Animated*` widgets, `AnimationController`, `Hero` (see `11-motion-recipes.md`).

**Pitfalls**
- `Color(0xFF…)` and `TextStyle(fontSize: …)` scattered in widgets.
- Fixed-height containers around text that clip at large text sizes.
- `GestureDetector` on small icons with no padding; tap area must reach 48 x 48.

---

## SwiftUI (iOS / macOS)

**Tokens and theming**
- Colours as asset catalog colour sets with Any and Dark appearances (and High Contrast variants). Xcode generates symbols, so use `Color(.brandPrimary)` or `.foregroundStyle(.brandPrimary)` instead of string names.
- Prefer system semantic colours and materials (`.primary`, `.secondary`, `Color(.systemBackground)`, `.regularMaterial`) where the system already has the role.
- Custom tokens that are not colours: an `EnvironmentValues` entry (`@Entry var spacing = Spacing.default`) or a static namespace.
- Read appearance with `@Environment(\.colorScheme)` only when a colour asset cannot express the change.

**Components**
- Reusable styling as `ButtonStyle`, `LabelStyle`, `ViewModifier` and `ToggleStyle`, applied once near the root where possible.
- `@Observable` models (iOS 17+), `@Bindable` for bindings into them.
- On iOS 26 / macOS 26, standard bars and controls adopt the system glass look automatically; reserve `.glassEffect()` for custom floating controls and do not stack it on content.

**Accessibility**
- Dynamic Type: use text styles (`.font(.body)`). Custom fonts must scale relative to a style. Scale non-text sizes with `@ScaledMetric`.
```swift
Text("Balance").font(.custom("Inter", size: 17, relativeTo: .body))
@ScaledMetric(relativeTo: .body) private var iconSize: CGFloat = 20
```
- At accessibility sizes, switch `HStack` to `VStack` (`@Environment(\.dynamicTypeSize)`, `.isAccessibilitySize`, or `ViewThatFits`).
- Labels and traits: `.accessibilityLabel`, `.accessibilityHint`, `.accessibilityAddTraits(.isHeader)`, `.accessibilityElement(children: .combine)` for rows. Images: `Image(decorative:)` or a label.
- Reduced motion: `@Environment(\.accessibilityReduceMotion)`; replace movement with fades. Announcements: `AccessibilityNotification.Announcement("Saved").post()`.
- Touch target: `.frame(minWidth: 44, minHeight: 44)` plus `.contentShape(Rectangle())` so the whole frame is tappable.
- Keyboard (iPad, macOS): `.keyboardShortcut`, `@FocusState`, `.focusable()`.

**Layout and responsive**
- `NavigationStack` for push flows, `NavigationSplitView` for iPad/macOS sidebars, `TabView` for top-level sections. Sheets with `.presentationDetents`.
- Respect the safe area. Apply `.ignoresSafeArea()` to backgrounds only; pin bottom bars with `.safeAreaInset(edge: .bottom)`.
- Use `.leading`/`.trailing`, never left/right, so RTL works automatically. Preview with `.environment(\.layoutDirection, .rightToLeft)` and large Dynamic Type.
- Haptics: `.sensoryFeedback(.success, trigger: value)` (iOS 17+). Motion APIs: `withAnimation`, `.animation(_:value:)`, `matchedGeometryEffect`, `PhaseAnimator`.

**Performance**
- `LazyVStack` / `List` for long content with stable `id`s. Keep `body` cheap; move work into `.task`.
- `AsyncImage` has no cache; use a caching loader for feeds.

**Pitfalls**
- `.font(.system(size: 17))` everywhere: fixed size, ignores Dynamic Type.
- `.onTapGesture` on views that should be `Button`s loses traits and keyboard support.
- Hard-coded `.frame(height:)` on text containers.

---

## Jetpack Compose (Android)

**Tokens and theming**
- One `AppTheme` composable wrapping `MaterialTheme(colorScheme, typography, shapes)`. Generate `lightColorScheme(…)` and `darkColorScheme(…)` from tokens.
- Dynamic colour (Android 12+): `dynamicLightColorScheme(context)` / `dynamicDarkColorScheme(context)`. Decide with the brand whether to use it; if yes, keep brand-critical roles (danger, success) in custom tokens so they do not shift.
- Non-Material roles: an `@Immutable` data class provided through `staticCompositionLocalOf` and exposed as `AppTheme.colors`.
```kotlin
val LocalAppColors = staticCompositionLocalOf { lightAppColors }
@Composable fun AppTheme(dark: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
  CompositionLocalProvider(LocalAppColors provides if (dark) darkAppColors else lightAppColors) {
    MaterialTheme(colorScheme = if (dark) DarkScheme else LightScheme, typography = AppTypography, content = content)
  }
}
```

**Components**
- Stateless composables with state hoisted; pass `Modifier` as the first optional parameter.
- Text styles from `MaterialTheme.typography`, never inline `fontSize`. Text sizes in `sp`, everything else in `dp`.
- Previews: light, dark, font scale 2, and RTL (`@PreviewLightDark`, `@PreviewFontScale`, `locale = "ar"`).

**Accessibility**
- `contentDescription` on meaningful icons and images, `null` on decorative ones.
- `Modifier.semantics(mergeDescendants = true) {}` for rows, `heading()` on section titles, `role = Role.Button` on custom clickables, `stateDescription` for toggles. `Modifier.clickable(onClickLabel = …)` for clear actions.
- Live updates: `semantics { liveRegion = LiveRegionMode.Polite }`.
- Touch targets: Material components enforce 48 dp; custom ones use `Modifier.minimumInteractiveComponentSize()`.
- Reduced motion: Compose animations follow the system animator duration scale; for custom logic read `Settings.Global.ANIMATOR_DURATION_SCALE`.

**Layout and responsive**
- Edge-to-edge is enforced on Android 15+. Call `enableEdgeToEdge()` and pad content with `WindowInsets.safeDrawing` (or `Scaffold`'s inner padding).
- Window size classes via `currentWindowAdaptiveInfo()`; `NavigationSuiteScaffold` switches bar, rail and drawer automatically; list-detail with the adaptive scaffolds.
- `LazyColumn` with `key =` for lists; avoid nested scrolling containers in the same direction.
- `start`/`end` padding flips with `LocalLayoutDirection`; strings via `stringResource`.

**Performance**
- Coil `AsyncImage` with explicit size and placeholder. Stable, immutable parameters to skip recomposition; check with Layout Inspector recomposition counts.
- Motion APIs: `animate*AsState`, `AnimatedVisibility`, `AnimatedContent`, shared element transitions (see `11-motion-recipes.md`).

**Pitfalls**
- Hard-coded `Color(0xFF…)` in screens, or reading `isSystemInDarkTheme()` in leaf components instead of the theme.
- `Modifier.clickable` on a small `Icon` without padding to 48 dp.
- Content hidden behind the navigation bar after edge-to-edge.

---

## React Native / Expo

**Tokens and theming**
- Tokens as a TS const (generated), consumed through a theme provider, Unistyles, Tamagui, or NativeWind (Tailwind classes with CSS variables). Pick the one the project already uses.
- `useColorScheme()` for system appearance; set `userInterfaceStyle: "automatic"` in `app.json` so it is not locked to light.
- React Navigation needs its own theme object; derive it from the same tokens so headers and tab bars match.

**Components**
- `Pressable` for all touchables, with pressed feedback (`style={({ pressed }) => …}` or `android_ripple`).
- New architecture is the default; check that UI libraries support it before adding them.
- Use platform-appropriate pieces where users expect them: native date pickers, action sheets on iOS, bottom sheets via a maintained library.

**Accessibility**
- `accessibilityLabel`, `accessibilityRole` (or `role`), `accessibilityState={{ disabled, selected, checked }}`, `accessibilityHint` for non-obvious results.
- Group composite rows with `accessible` on the container.
- Announce with `AccessibilityInfo.announceForAccessibility`; on Android, `accessibilityLiveRegion="polite"` for changing text.
- Reduced motion: `AccessibilityInfo.isReduceMotionEnabled()` or Reanimated `useReducedMotion()`.
- Font scaling is on by default. Do not set `allowFontScaling={false}` on body text; use `maxFontSizeMultiplier` only on tight UI like tab labels.
- Small icons: `hitSlop` to reach 44 x 44 pt / 48 x 48 dp.

**Layout and responsive**
- `react-native-safe-area-context` (`SafeAreaProvider`, `useSafeAreaInsets`), not the deprecated core `SafeAreaView`. Android edge-to-edge is the default in current Expo.
- `useWindowDimensions()` for breakpoints; it updates on rotation and foldables.
- RTL: `I18nManager.isRTL`, use `start`/`end` style props (`marginStart`, `paddingEnd`).
- Haptics: `expo-haptics`. Motion APIs: Reanimated, `react-native-gesture-handler` (see `11-motion-recipes.md`).

**Performance**
- `FlatList` with `keyExtractor` and `getItemLayout` when heights are fixed, or FlashList for large feeds.
- `expo-image` with explicit dimensions, `contentFit`, and a placeholder.
- Load fonts with `expo-font` and keep the splash screen until they are ready to avoid a font swap flash.

**Pitfalls**
- Inline style objects and anonymous `renderItem` functions in large lists.
- Web-only assumptions: hover states as the only affordance, tiny 24 px icons with no `hitSlop`.

---

## Desktop: WinUI 3, WPF, UWP, Uno, Avalonia (and MAUI)

**Tokens and theming**
- Tokens in a `ResourceDictionary` merged in `App.xaml`, with `ThemeDictionaries` keyed `Light`, `Dark` and `HighContrast`. Reference them with `{ThemeResource …}` (WinUI, UWP, Uno) or `{DynamicResource …}` (WPF, Avalonia) so they update on theme change.
```xml
<ResourceDictionary.ThemeDictionaries>
  <ResourceDictionary x:Key="Light"><SolidColorBrush x:Key="AppSurfaceBrush" Color="#FFFFFF"/></ResourceDictionary>
  <ResourceDictionary x:Key="Dark"><SolidColorBrush x:Key="AppSurfaceBrush" Color="#111827"/></ResourceDictionary>
  <ResourceDictionary x:Key="HighContrast"><SolidColorBrush x:Key="AppSurfaceBrush" Color="{ThemeResource SystemColorWindowColor}"/></ResourceDictionary>
</ResourceDictionary.ThemeDictionaries>
```
- Start from the platform's Fluent resources (`XamlControlsResources` in WinUI/Uno, `FluentTheme` in Avalonia) and override through lightweight styling (redefine keys like `ButtonBackground`) rather than retemplating controls.
- Differences:
  - WinUI 3 / UWP / Uno: `RequestedTheme`, system backdrops (`MicaBackdrop`, `DesktopAcrylicBackdrop`) on the window.
  - WPF: no built-in theme switching in classic WPF; swap merged dictionaries and use `DynamicResource`. Newer .NET versions add a Fluent theme (`ThemeMode`), still marked experimental, so check the project's target first.
  - Avalonia: `RequestedThemeVariant`, `ThemeVariantScope` for local overrides, CSS-like style selectors (`Button.primary:pointerover`).
  - MAUI: `AppThemeBinding` in XAML or `Application.Current.RequestedTheme`.

**Components**
- Use the shell controls: `NavigationView` (WinUI/UWP/Uno), `SplitView` (Avalonia), `CommandBar` for actions, `ContentDialog` for modals, `InfoBar` for inline status, `TeachingTip` for one-off guidance.
- WinUI 3: `ContentDialog` needs `XamlRoot = this.Content.XamlRoot` or it throws.
- Visual states through `VisualStateManager` (WinUI/WPF/UWP) or pseudo-classes (Avalonia). Do not toggle colours in code-behind.
- Compiled bindings: `x:Bind` (WinUI/UWP/Uno), `x:DataType` with compiled bindings (Avalonia).

**Accessibility**
- `AutomationProperties.Name` on icon-only buttons and unlabeled inputs; `AutomationProperties.LabeledBy` to tie labels to fields; `AutomationProperties.HeadingLevel` on section titles (WinUI/UWP).
- Live updates: `AutomationProperties.LiveSetting="Polite"` plus raising the change, or `AutomationPeer.RaiseNotificationEvent` (WinUI). MAUI: `SemanticProperties.Description`, `SemanticScreenReader.Announce`.
- Keyboard first: logical tab order (`TabIndex` only when needed), `KeyboardAccelerator` (WinUI/UWP) / `KeyBinding` (WPF, Avalonia `HotKey`), `AccessKey` for Alt shortcuts.
- Focus visuals: keep `UseSystemFocusVisuals="True"` (WinUI); in WPF, give custom templates a visible `FocusVisualStyle`.
- High contrast: every custom brush needs a `HighContrast` entry using system colours (`SystemColorWindowTextColor` and friends).
- Text scaling: WinUI/UWP controls honour `UISettings.TextScaleFactor`; test at 200 % and avoid fixed heights. Classic WPF does not follow the Windows text size setting, so offer an in-app scale if users need it.
- Reduced motion: `UISettings.AnimationsEnabled` (WinUI/UWP), `SystemParameters.ClientAreaAnimation` (WPF).

**Layout and responsive**
- `Grid` with star sizing, `AdaptiveTrigger` visual states (WinUI/UWP/Uno), `OnFormFactor`/`OnPlatform` markup (Avalonia, Uno). Windows resize freely; design compact, medium and wide layouts.
- Desktop pointer targets around 32 px with 8 px spacing are acceptable; touch-capable Windows devices still need 40 to 44 px.
- `FlowDirection="RightToLeft"` on the root flips layout; use it for Arabic and Hebrew.
- Persist window size and position between sessions.

**Performance**
- Virtualise lists (`ItemsRepeater`, `ListView`, `VirtualizingStackPanel`); `x:Load` / `x:Phase` (WinUI/UWP) to defer offscreen UI.
- Never block the UI thread; marshal updates via `DispatcherQueue` (WinUI/Uno), `Dispatcher` (WPF), `Dispatcher.UIThread` (Avalonia).
- Uno WebAssembly: show an extended splash and keep the bundle small.

**Pitfalls**
- `StaticResource` for theme-dependent brushes: they freeze at load time and break dark mode.
- Retemplating a control to change one colour.
- Forgetting the HighContrast dictionary; custom colours become unreadable.

---

## JavaFX

**Tokens and theming**
- Tokens as looked-up colours on `.root` in a stylesheet; components reference them, never literals.
```css
.root { -color-bg: #F7F6F2; -color-fg: #0F172A; -color-accent: #4F46E5; -fx-font-size: 14px; }
.root.dark { -color-bg: #0B0F19; -color-fg: #E5E7EB; -color-accent: #A5B4FC; }
.button.primary { -fx-background-color: -color-accent; -fx-text-fill: -color-bg; }
```
- AtlantaFX gives a modern baseline (`Application.setUserAgentStylesheet(new PrimerLight().getUserAgentStylesheet())`); layer brand CSS after it and reuse its style classes before writing new CSS.
- Switch themes in one place (swap the user-agent stylesheet or a root class). Follow the OS with `Platform.getPreferences().getColorScheme()` (JavaFX 22+).
- Size everything in `em` relative to the root font size so one change scales the whole UI.

**Components**
- FXML for stable layouts, controllers limited to view behaviour, style classes instead of inline `-fx-` styles.
- `DialogPane`-based dialogs with an owner window (`initOwner`) so they are modal to the right stage.
- Icons from one set (Ikonli) at consistent sizes.

**Accessibility**
- `Label.setLabelFor(field)` for form labels; `setAccessibleText` on icon-only buttons; `setAccessibleRole` on custom controls.
- Mnemonics (`_Save` with `setMnemonicParsing(true)`) for menus and forms; accelerators for global shortcuts.
- Keep a visible focus style; JavaFX's default is faint on some themes, so strengthen `:focused` in CSS.
- Keep animations short and optional; offer an in-app setting to turn them off when the platform preference is unavailable.

**Layout and responsive**
- Choose panes by role (`BorderPane` shell, `GridPane` forms, `VBox`/`HBox` stacks) and use constraints, not absolute coordinates. Set min/pref/max sizes so windows resize cleanly.
- `setNodeOrientation(NodeOrientation.RIGHT_TO_LEFT)` on the scene root for RTL.

**Performance**
- Long work in a `Task` off the FX thread; update UI with `Platform.runLater` or bound properties.
- `ListView`/`TableView` are virtualised; render rows with cell factories, batch list changes, and load large images in the background.

**Pitfalls**
- Inline `setStyle(…)` with hex values in Java code.
- Recreating whole scenes for small state changes, which loses focus and scroll.

---

## Platform conventions that change the design

| Topic | iOS | Android | Web | Desktop (Windows / macOS / Linux) |
|---|---|---|---|---|
| Back navigation | Back button top-left plus edge swipe; no system back key | System back gesture/button; predictive back preview | Browser back must work: every view state worth returning to gets a URL | Back button in title bar or nav pane where used; Alt+Left / Cmd+[ |
| Primary nav | Tab bar (bottom), up to 5 items | Navigation bar (bottom) on compact, rail on medium, drawer on expanded | Top nav or sidebar; bottom bar only on mobile web apps | Sidebar / `NavigationView`, menu bar on macOS |
| Minimum target | 44 x 44 pt | 48 x 48 dp | 44 x 44 px design rule; WCAG 2.2 floor 24 x 24 CSS px | About 32 px pointer targets; 40 to 44 px if touch-capable |
| System font | SF Pro (`.body` etc., Dynamic Type) | Roboto / Google Sans per device, scaled by `sp` | `system-ui` stack or a self-hosted brand font | Segoe UI Variable (Windows), SF Pro (macOS), Cantarell / Ubuntu / Noto (Linux) |
| Haptics | Expected on confirmations, toggles, errors (`sensoryFeedback`) | Light use (`HapticFeedback`); respect system setting | Avoid; `navigator.vibrate` is unreliable | None |
| Modality | Sheets (with detents) for tasks; alerts for confirms | Bottom sheets and full-screen dialogs; dialogs for confirms | Dialog (`<dialog>`) or side sheet; never block with full-page overlays for small tasks | Modal dialogs and flyouts; non-modal panes preferred |
| Destructive actions | Red role in action sheet/alert, separate from cancel; swipe-to-delete with confirm or undo | Text button in dialog, error colour; prefer undo snackbar | Danger button, confirm for irreversible, undo for reversible | Danger button not set as default; Enter must not trigger delete |
| Keyboard shortcuts | iPad hardware keyboard: `keyboardShortcut`, discoverable via the Cmd hold menu | Hardware keyboards and Chromebooks: support Tab, Enter, Esc | Esc closes overlays, `/` or Cmd/Ctrl+K for search, never override browser shortcuts | Full keyboard operation expected; show accelerators in menus and tooltips |

---

## Pre-merge commands per stack

Run these before calling UI work done. Add them to CI where the project allows.

| Stack | Commands and checks |
|---|---|
| All | Token generator + `git diff --exit-code`; contrast check over `pairs` (`node scripts/contrast.mjs`) |
| Plain web / Tailwind | `stylelint` (token rules), `html-validate` or a validator, Lighthouse (accessibility, performance, CLS), axe in a browser run |
| React / Next.js | `eslint` with `eslint-plugin-jsx-a11y` and `react-hooks`; `tsc --noEmit`; Playwright with `@axe-core/playwright` on key pages in light and dark; `next build` (hydration and image warnings); Lighthouse CI |
| Vue / Nuxt | `eslint` with `eslint-plugin-vuejs-accessibility`; `nuxi typecheck`; Playwright + axe; `nuxi build` |
| Svelte / SvelteKit | `svelte-check` (fails on a11y warnings when configured); Playwright + axe |
| Astro | `astro check`; `astro build`; Playwright + axe on built pages; Lighthouse |
| Angular | `ng lint` with `@angular-eslint` template accessibility rules; `ng test`; Playwright or Cypress with axe |
| Laravel | Blade/Livewire pages through Playwright (or Dusk) + axe; Pest/PHPUnit feature tests for rendered states; front-end lint for Inertia apps |
| Three.js | Lighthouse performance on a mid-range mobile profile; manual check with reduced motion on and WebGL disabled (fallback renders) |
| Flutter | `flutter analyze`; `flutter test` including guideline tests: `expect(tester, meetsGuideline(androidTapTargetGuideline))`, `iOSTapTargetGuideline`, `labeledTapTargetGuideline`, `textContrastGuideline`; golden tests at text scale 1.0 and 2.0, light and dark, LTR and RTL |
| SwiftUI | Xcode Accessibility Inspector audit; XCUITest `try app.performAccessibilityAudit()` (iOS 17+); previews at accessibility Dynamic Type sizes and RTL; SwiftLint |
| Compose | `./gradlew lint`; Compose `ui-test` with `enableAccessibilityChecks()`; screenshot tests (Roborazzi or Paparazzi) at font scale 2 and dark; Accessibility Scanner on device |
| React Native / Expo | `eslint` with `eslint-plugin-react-native-a11y`; `@testing-library/react-native` using role queries (`screen.getByRole('button', { name: 'Save' })`); manual VoiceOver and TalkBack pass; `npx expo-doctor` |
| WinUI / UWP / Uno | Accessibility Insights for Windows (FastPass); test in a High Contrast theme and at 200 % text scale; Narrator pass on key flows |
| WPF / Avalonia | Accessibility Insights for Windows (WPF); Avalonia DevTools for layout and styles; keyboard-only run through every dialog |
| JavaFX | Keyboard-only run; screen reader pass (Narrator / VoiceOver); TestFX UI tests for key flows |

Automated checks catch a minority of accessibility problems. Every merge that changes a flow also needs one keyboard-only pass and one screen reader pass on the changed screens.
