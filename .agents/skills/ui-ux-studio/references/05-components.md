# 05. Components

Components are built once, with every state, then shown in a gallery in light and dark mode.
Screens compose them and do not restyle them.

## The states matrix

Every interactive component designs each state that applies:

| State | What to design |
|---|---|
| Default | Resting look |
| Hover (web) / Pressed | Visible change in under 100 ms; pressed is never colour alone (add scale or shade) |
| Focused | A 2 px focus ring at 3:1, offset from the edge; never removed |
| Selected / On | Distinct by shape or icon as well as colour |
| Disabled | Reduced emphasis, still readable; explain why nearby when it is not obvious |
| Loading | Skeleton for content; inline spinner only inside a button, under about 1 s |
| Error | Inline, calm, plain cause plus how to fix; never a blocking modal for a recoverable error |
| Empty | Illustration or icon, one line of reason, one action |
| Offline | What still works, what is safe, what waits |

A component is not done until its gallery page shows every applicable state in both themes.

## Core library (works for most products)

| Component | Rules |
|---|---|
| `PrimaryButton` | One per screen; full width on mobile; min height 52 dp; verb plus payoff label |
| `SecondaryButton`, `GhostButton` | For other actions; never visually compete with the primary |
| `ChoiceCard` (option) | Full-width touch card, min 56 dp, a fixed letter or radio marker. Feedback states (correct with a check icon, wrong with a cross icon) only where instant feedback fits; neutral or filled only in tests |
| `Toggle` | Clear on and off states with a label that says what it does |
| `TextField` | Visible label (not only a placeholder), helper text, error text below, 3:1 border |
| `Chip` / `Badge` | Icon plus word, tinted background, tested text colour |
| `StatTile` | One number, one line of meaning, a tap target to the detail |
| `ProgressRing` / `Gauge` | Value, label, and a note such as "estimated" when it is an estimate; basis shown on tap |
| `TimerPill` | Fixed-width digits; colour change near the end, no flashing; screen-reader milestones |
| `Palette` / `Grid` status | Answered, unanswered, flagged: each with a shape as well as colour |
| `BottomSheet` | Drag handle, close button, back gesture closes it, max 90% height |
| `Dialog` | Only for decisions that block; title states the decision, buttons state the outcomes |
| `Skeleton` | Matches the final layout; shimmer stops under reduced motion |
| `EmptyState` | Reason plus one action; celebrate honestly when empty is good ("Nothing due today") |
| `ErrorState` | Plain cause, **what is safe** ("Your answers are saved"), a retry button |
| `Toast` / `Snackbar` | Short confirmations with an undo where possible; never the only place for an error |
| `TrustBadge` | States the actual review or verification status, nothing more |
| `OfflineIndicator` | True state only (see `07-high-stakes-flows.md`) |
| `Paywall` | What the user gets, the real price, a visible close at touch size, no pre-ticked extras |
| `ShareCard` | Real data from the server, alias by default, no phone number or photo by default |

## Component spec

Use `assets/component-spec.template.md`. The essentials: purpose, anatomy, variants, states,
sizes and tokens, content rules, accessibility (role, label, announcements, keyboard), motion,
and "do not" examples.

## Icons and visual elements

- **One icon set** (for example Lucide, Phosphor, Material Symbols, SF Symbols) with one stroke width
  per level and one style per level: do not mix filled and outline icons at the same level.
- **Icon sizes are tokens** (for example 16, 20, 24) and align to the text's optical centre.
- **Meaning decides semantics, not the glyph:** a decorative icon next to visible text is hidden from
  assistive tech; a meaningful standalone icon has a text alternative; an icon control has an
  accessible name and exposes pressed, selected or expanded state.
- Meaningful icons and control edges reach 3:1 against what they sit on.
- **Brand logos are official assets** at their own proportions and clear space; never redrawn or
  recoloured outside their guidelines.
- **Vector only.** SVG or platform vector icons; no raster icons, no emoji as icons.

## Motion in components

Each component spec names its motion with tokens: press feedback (`duration.press`, scale 0.97),
how it enters and leaves (from its trigger, exit faster), and what it does under reduced motion.
States change without moving surrounding layout. Patterns and code: `10-motion-system.md`,
`11-motion-recipes.md`.

## Feedback without colour

Every status uses three channels: colour, an icon or shape, and a word. For example
a check icon and "Correct" (green), a cross icon and "Wrong" (red), a question icon and "Unsure" (amber). Screen readers announce the word.
