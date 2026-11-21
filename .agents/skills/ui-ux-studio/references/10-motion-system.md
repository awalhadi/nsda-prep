# 10. Motion system

Motion explains change: where something came from, what was confirmed, what needs attention, how
two places relate. When it explains nothing it is decoration, and decoration is the first thing to
drop on a slow device. Good motion is felt more than noticed. Users rarely say "nice animation";
they say the product feels fast, solid and calm.

Code for every pattern here, on every stack, is in `11-motion-recipes.md`. Tokens are declared in
`04-tokens.md` and `assets/tokens.template.json`.

## 1. Every animation has one of five jobs

| Job | Examples | If it has no job |
|---|---|---|
| **Feedback**: "I heard you" | press, hover, toggle, drag tracking the finger | Drop it |
| **Orientation**: "this came from there" | sheet from its trigger, shared element, route direction | Use a crossfade |
| **State change**: "this is now different" | expand, select, error shown, item added or removed | Swap instantly with a fade |
| **Attention**: "look here, once" | a new message, a live dot, the one hero moment | Drop it |
| **Continuity**: "still working" | skeleton, progress, optimistic update | Show the final state |

Write the job in the motion spec. Motion that answers a person's action is welcome. Motion nobody
triggered is rare and deliberate: **one orchestrated moment per view** (a short page-load sequence,
or one reveal) lands better than scattered effects. Animate one or two key elements per view, not
everything.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `duration.press` | 100 ms | Pressed or hover feedback must start within this |
| `duration.fast` | 120 ms | Small changes: toggles, fades, tooltips, chips, colour shifts |
| `duration.base` | 200 ms | Menus, dropdowns, popovers, sheets, dialogs |
| `duration.slow` | 300 ms | Route and page transitions, shared elements, large surfaces |
| `duration.emphasis` | 400–600 ms | The one orchestrated moment; count-ups (max 600 ms) |
| exit | about 65% of the enter | 80 / 130 / 200 ms; leaving should feel quicker than arriving |
| `ease.out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entering and responding to input (the default) |
| `ease.in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Leaving the screen |
| `ease.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moving between two on-screen positions |
| linear | `linear` | Only progress bars, spinners and scroll-linked motion |
| `spring.ui` | critically damped, no overshoot (duration 0.35 s, bounce 0) | Layout changes, drag release, toggles |
| `spring.gentle` | duration 0.45 s, bounce about 0.15 | Sheets and cards settling after a throw |
| `spring.playful` | duration 0.5 s, bounce about 0.3 | Only when the brand register is playful; never in forms, money or exams |
| stagger | 30–50 ms per item | At most about 6 items staggered, the rest arrive together; total ≤ 600 ms |
| distance | 4–8 px nudge, 12–16 px reveal | Never more than 24 px for an entrance |
| press scale | 0.97 (range 0.95–1.05) | Restored on release |

Rules for the tokens:
- **Size scales with distance and surface.** A tooltip moves 4 px in 120 ms; a full-screen route
  moves in 300 ms. One duration everywhere feels mechanical; random durations feel broken.
- **Springs for things the user moves**, curves for things the system moves. A spring keeps the
  finger's velocity on release, so a thrown sheet feels physical.
- **Overshoot is a brand decision**, not a default. Most products want none.
- Keep durations in tokens, never in components, so the whole product shares one rhythm and a
  "slower, calmer" request is a one-line change.

## 3. The motion signature

A direction (14) includes a motion signature, so motion carries the identity like type and colour
do. Write it in two or three lines:

```
Character: e.g. "precise and quiet" / "soft and buoyant" / "snappy and mechanical"
Curves: which easing or spring family, and whether anything overshoots
The one moment: what moves on first load, or which interaction is the signature
```

Derive it from the subject. A banking app is precise: short, no overshoot, nothing moves on its
own. A children's reading app can be buoyant: gentle springs, a small bounce on rewards. A
developer tool is mechanical: near-instant, linear progress, no decoration. Two products should not
share a signature by accident.

## 4. Choreography

- **Enter from the source.** A menu grows from its button; a sheet rises from the bottom edge; a
  detail view expands from the card that was tapped. Set `transform-origin` to the trigger.
- **Direction means hierarchy.** Going deeper enters from the right (or from below); going back
  exits the other way. Mirror it in RTL layouts. Keep it consistent everywhere.
- **Parent before children.** A container arrives, then its content follows with a short stagger.
  On exit, everything leaves together and faster.
- **Crossfade content that replaces content** in the same container; do not slide it.
- **Shared elements** (the same object on two screens) morph between positions rather than
  disappearing and reappearing: View Transitions on the web, Hero in Flutter,
  `matchedGeometryEffect` in SwiftUI, shared element transitions in Compose.
- **Stagger only short lists.** A 40-item list appears at once; a staggered long list makes people
  wait for content they could already read.
- **Nothing lingers half-faded.** An element is visible, or it fades fully; never stop under
  opacity 0.2.

## 5. Interaction rules

| Interaction | Rule |
|---|---|
| Press | Visible change within 100 ms: scale 0.97 or a shade; never only a hue change |
| Hover (web, pointer: fine) | A change in shade, underline or elevation; never the only way to discover something |
| Interruption | A new action cancels or reverses the running animation from its current value; nothing blocks input |
| Rapid toggles | Each change sets the final state explicitly; correctness never waits on an animation-end event |
| Gestures | The element tracks the finger 1:1; on release it continues with the finger's velocity into a spring |
| Drag thresholds | Movement of a few pixels before a drag starts, so taps stay taps |
| Gesture alternatives | Every swipe, drag or pinch action also has a visible button and a keyboard path |
| Loading | Skeletons that match the final layout; spinners only inside buttons for under 1 s; for waits over 3 s, say what is happening |
| Optimistic UI | Show the result at once, then sync; on failure roll back with a calm message and keep the user's input |
| Number changes | Count-up under 600 ms with tabular figures; none under reduced motion; screen readers get the final value only |
| Errors | Inline and calm; a small shake is optional and off under reduced motion |
| Celebrations | Small and under 1 s, for real milestones only (first payment, a streak, mastery); never on every action |
| Attention | A gentle pulse for something live, off under reduced motion; never flashing (no more than 3 flashes a second, ever) |
| Autoplay | Anything that moves for more than 5 s next to other content has pause, stop or hide controls |
| Haptics | Light tap for success, soft single tick for an error; none in high-stakes flows; follow the system setting and offer an app toggle |

Design for clarity, not compulsion. Avoid claims like "haptics release dopamine".

## 6. Scroll and page-level motion

- **Scroll reveal on every section is a generic tell** (15). Reveal at most the one or two things
  that benefit from arriving (a product demo, a chart that draws its line). Content needed for
  reading or SEO is never invisible by default without a no-JS fallback.
- **Scroll-linked motion** (progress bars, a header that condenses, a sticky story section) uses
  linear timing tied to scroll position, CSS `animation-timeline` where supported, with a static
  fallback.
- **Parallax** is subtle (a few percent of scroll), never on text, and off under reduced motion.
- **Page transitions** last `duration.slow` at most and never delay content that is ready.

## 7. Reduced motion

When the system asks for reduced motion (`prefers-reduced-motion`, iOS Reduce Motion, Android
"Remove animations", Windows "Show animations" off):

- Replace movement with a fade of `duration.fast`, or no animation.
- Stop parallax, auto-advancing carousels, shimmer, pulsing, confetti, background video and loops.
- Keep feedback that carries meaning (a focus ring, a state change), shown instantly.
- Test it. It is the most common gap, and screenshots taken with it on also catch content that
  scroll reveal leaves at opacity 0.

## 8. Performance

- Animate `transform` and `opacity` only. Never `width`, `height`, `top`, `left` or `margin`; for
  expand and collapse use the patterns in 11.
- Never `transition: all`; list the properties.
- `will-change` only while an animation runs, on a few elements.
- 60 fps on the lowest target device. Drop blur, large shadows and particles before frames.
- Pause animations that are off screen; clean up timelines, listeners and controllers.
- Use built-in tools first (CSS, View Transitions, Flutter implicit animations, SwiftUI and Compose
  animation APIs). A motion library is a budget decision. Lottie or Rive files under about 60 KB
  each, lazy-loaded, with a still frame under reduced motion.

## 9. Where motion must stop

- **High-stakes flows** (payment, exam, destructive confirm): nothing moves except what the user
  needs, such as a timer or a progress indicator (07).
- **Dense tools** (consoles, editors, trading): motion dial 1–2; state changes only.
- **Repeated actions** a user does hundreds of times a day: feedback within 100 ms, no ceremony.

## 10. Motion review

Before shipping, play each animation at normal speed and at 5–10x slow motion
(browser animation inspector, Flutter `timeDilation`, Android animator duration scale, the iOS
simulator's slow animations), then answer:

1. What is its job (section 1)? If none, cut it.
2. Does it start within 100 ms of the action, and can it be interrupted?
3. Does it come from its source and go back the way it came?
4. Does it use the tokens, and do exits run faster than enters?
5. Does it hold 60 fps on the low-end device?
6. What happens under reduced motion?
7. Is this view spending its one orchestrated moment here, or is something else also competing?
