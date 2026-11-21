# 20. Rule quick-reference, in priority order

Short rule IDs for audits, critique rows and pre-delivery checks. Use the ID in a finding
("fails `focus-not-obscured`"). The detail lives in the reference named in brackets. Categories
follow the priority order in SKILL.md: fix from the top down. Web-code specifics are in 18.

## 1. Accessibility [08, 04, 18]
- `contrast-text` text ≥ 4.5:1 (large ≥ 3:1), both themes, measured.
- `contrast-ui` icons that carry meaning, input borders, focus rings ≥ 3:1.
- `focus-visible` focus ring always shown, 2–4 px, offset; `focus-not-obscured` not hidden by sticky
  bars, banners or overlays (WCAG 2.2).
- `not-colour-alone` colour + icon or shape + word.
- `text-scale-200` no clipping or overlap at 200%; native text styles (Dynamic Type, Material type
  roles) so system scaling works.
- `alt-meaningful` / `decorative-hidden` meaningful images and icons labelled; decorative ones
  hidden from assistive tech, including icons next to visible text.
- `icon-control-name` icon-only controls have an accessible name and expose pressed, selected or
  expanded state.
- `keyboard-complete` the full task works by keyboard; tab order follows reading order; skip link.
- `heading-order` headings h1 → h6 without skipped levels.
- `dialog-focus` focus moves into a dialog, stays inside, Escape closes, focus returns to the opener.
- `focus-on-route-change` after navigation, focus moves to the main content for screen readers.
- `live-announce` status changes ("Saved", a changed count) announced politely as a full phrase,
  without moving focus.
- `dragging-alternative` every drag has a single-pointer and keyboard path.
- `accessible-auth` password managers and paste work; no puzzle or memory test to sign in.
- `reduced-motion` the reduced-motion version exists and was tested.
- `no-flash` nothing flashes more than 3 times a second.
- `auto-rotation-controls` carousels and moving content pause, stop on focus and reduced motion.
- `lang-set` page or widget language set.

## 2. Touch and interaction [05, 10, 17]
- `touch-target` 48 dp / 44 pt / 44 px (WCAG 2.2 floor 24 px); hit area may exceed the visual.
- `touch-spacing` at least 8 px / 8 dp between targets.
- `tap-feedback-100ms` visible press or hover response within 100 ms.
- `press-not-colour-only` pressed state adds shade or scale (0.95–1.05), not only a hue change.
- `press-no-layout-shift` pressed and hover states never move surrounding content.
- `loading-button` the button shows progress and blocks double submit while the request runs.
- `cursor-pointer` clickable elements on the web show a pointer.
- `no-hover-only` nothing important lives only on hover.
- `gesture-safe` no swipe in high-stakes flows; no clash with the system back gesture or predictive back.
- `gesture-alternative` every swipe, drag or pinch action also has a visible control.
- `drag-threshold` a small movement threshold before a drag starts.
- `haptics-follow-system` light and optional, never in exams or payments.
- `native-controls` platform controls with proper roles before custom containers.

## 3. Truthfulness [02, 12, 13]
- `data-bound-numbers` every count, price, timer and percentage comes from data.
- `threshold-hidden` social proof hidden below its threshold.
- `honest-state` saved, offline and verified marks appear only when true.
- `no-invented-urgency` deadlines and scarcity are real.
- `no-invented-specifics` copy adds no facts, numbers or claims the data does not support.

## 4. Performance [10, 17, 18]
- `image-dimensions` width and height set (or aspect-ratio) to avoid layout shift.
- `image-formats` WebP or AVIF, responsive `srcset`, lazy below the fold, priority for the hero.
- `font-loading` only the weights used, subset, `font-display: swap`, preload only the critical face.
- `reserve-space` async content has space reserved (CLS < 0.1).
- `lazy-below-fold` images, heavy parts and animation libraries below the fold load late.
- `virtualize-50` lists over about 50 rows are virtualised or paged.
- `frame-budget-16ms` no long main-thread work during interaction; input latency under 100 ms.
- `debounce-throttle` scroll, resize and input handlers are debounced or throttled.
- `skeleton-over-1s` content that takes over 1 s shows a skeleton of the final layout.
- `page-budget` first-load JS within the project's budget.
- `degrade-on-slow` slow networks and low-end devices get fewer effects, not a broken page.

## 5. Fit to subject [14, 15, 13]
- `direction-written` a direction plan exists and passed the genericity test.
- `one-bold-move` one named memorable element; the rest is quiet.
- `no-unjustified-tell` no tell from 15 without a one-line reason from the brief.
- `human-touch` real content, optical alignment, one vernacular detail, an accessory removed.
- `no-emoji-icons` one consistent SVG icon set, one stroke width, one fill style per level.
- `one-primary-action` a single primary CTA per screen.
- `structure-is-information` numbering only for sequences; every border and label encodes something.
- `platform-adaptive` iOS, Android, web and desktop idioms respected (17).
- `elevation-consistent` one shadow and elevation scale; blur only to show something sits behind.

## 6. Layout and responsive [16, 06]
- `breakpoints-checked` 375 / 768 / 1024 / 1440 and phone landscape.
- `no-horizontal-scroll` at any width.
- `never-disable-zoom` no `maximum-scale=1` or `user-scalable=no`.
- `readable-body-16` body text ≥ 16 px on mobile.
- `measure-under-80` body lines 45–75 characters (35–60 on phones).
- `reflow-labels` text, chips and badges wrap before shrinking; `+n` overflow is an operable control.
- `long-token-wrap` URLs and IDs wrap with `overflow-wrap: anywhere`; flex children get `min-w-0`.
- `safe-area` content and controls clear notches, home indicators and system bars.
- `fixed-element-offset` fixed bars reserve space so content is not hidden behind them.
- `dvh-not-vh` `min-height: 100dvh` rather than `100vh` on mobile.
- `z-index-scale` a defined layer scale, no arbitrary 9999.
- `container-width` one consistent max content width on desktop.

## 7. Typography and colour [16, 04]
- `scale-ratio` sizes come from one ratio; 6–8 roles.
- `weights-2-3` two or three weights, each with one job.
- `line-height` body 1.5–1.7; complex scripts 1.6–1.7; display 1.05–1.3.
- `tabular-numbers` tables, timers and prices use fixed-width digits.
- `heading-balance` short headings use balanced wrapping; no forced non-breaking spaces in prose.
- `one-meaning-per-colour` brand and status colours never share a hue.
- `dark-mode-tonal` dark mode uses tuned, lighter or desaturated tones, not inverted colours;
  contrast measured on its own.
- `tokens-only` no raw colours, sizes, font values or durations.

## 8. Motion [10, 11]
- `motion-has-job` every animation is feedback, orientation, state change, attention or continuity.
- `one-orchestrated-moment` one page-load or reveal sequence per view, not effects on every section.
- `motion-tokens` durations 100 / 120 / 200 / 300 ms, emphasis 400–600 ms, from tokens only.
- `exit-faster-than-enter` exits at about 65% of the enter time.
- `easing-by-direction` ease-out to enter, ease-in to leave, linear only for progress.
- `spring-for-gestures` user-moved elements release into a spring with the finger's velocity.
- `from-the-source` overlays and details grow from their trigger; navigation direction is consistent.
- `stagger-30-50ms` per item, for about 6 items at most.
- `transform-opacity-only` animate transform and opacity, not layout properties; no `transition: all`.
- `interruptible` a new user action cancels or reverses the running animation; input never blocked.
- `final-state-explicit` rapid changes set the final state; nothing depends on animation-end events.
- `no-lingering-fade` nothing rests below opacity 0.2.
- `reduced-motion-fades` fades only under reduced motion; loops and parallax stop.
- `autoplay-controls` motion over 5 s next to content has pause, stop or hide.

## 9. Forms and feedback [06, 12]
- `visible-label` labels are not placeholders; helper text persists for complex inputs.
- `input-types` correct `type`, `inputmode` and `autocomplete` so the right keyboard and autofill appear.
- `no-premature-validation` validate when the field is left, not on each keystroke; re-check live
  after an error is shown, and clear it the moment the value is valid.
- `error-inline` the cause and the fix next to the field, linked with `aria-describedby`; input is kept.
- `error-summary-focus` after a failed submit with several errors, focus moves to a summary that
  links to each field.
- `submit-not-pre-disabled` submit stays enabled and explains what to fix; disabled only in flight.
- `forgiving-formats` spaces, hyphens and brackets accepted in numbers and codes.
- `allow-paste` paste never blocked, including passwords and one-time codes.
- `toast-3-5s` toasts stay 3–5 s, pause on hover or focus, never steal focus, and are never the only
  place for an error.
- `confirm-destructive` destructive actions state the consequence; undo where possible.
- `unsaved-changes-guard` ask before leaving with unsaved edits, and only then.
- `multi-step-progress` multi-step flows show progress and allow going back; long forms autosave.

## 10. Navigation [06, 17]
- `bottom-nav-max-5` at most 5 bottom tabs on mobile, each with icon and label.
- `sidebar-at-1024` a sidebar from about 1024 px; a bottom bar or menu below.
- `no-mixed-nav` one navigation pattern per level.
- `back-predictable` back returns to the previous place with its scroll, filters and input.
- `deep-link` every key screen and stateful view (tabs, filters, pages) is reachable by URL or deep link.
- `current-location` the current page is marked by more than colour.
- `modal-not-navigation` modals are for decisions, not primary navigation.
- `destructive-separated` delete account and sign out sit apart from normal items.

## 11. Charts and data [dataviz skill, 08]
- `chart-type` trend → line, comparison → bar, part of a whole (≤ 5 parts) → bar or donut;
  `no-pie-over-5`.
- `normalised-maps` choropleths show rates, not raw counts.
- `table-alternative` every chart has a table view with the same data.
- `chart-not-colour-alone` series also differ by label, marker or pattern; no red/green-only pairs.
- `direct-labels` small datasets are labelled on the chart; legends sit next to it.
- `tooltip-keyboard` exact values on hover, tap and keyboard focus.
- `chart-states` skeleton while loading; a meaningful empty state instead of an empty axis frame.
- `locale-numbers` axis and label numbers formatted by locale.
- `chart-motion-optional` data readable immediately; entrance animation off under reduced motion.
