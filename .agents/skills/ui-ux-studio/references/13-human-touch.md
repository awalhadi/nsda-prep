# 13. Human touch: work that reads as made by a person

People notice generated design the way they notice a form letter. Nobody points at one detail;
the whole thing feels assembled rather than considered. This file covers both halves: the visual
craft that makes a screen feel hand-made, and the editing pass that makes copy sound like a person
who knows the product. Generic visual looks are catalogued in `15-generic-tells.md`; this file is
what to do instead.

## Part A. Visual craft

A human designer leaves evidence of decisions. Put that evidence in.

**Content first, real content always.**
- Design with the product's real nouns, real lengths and real mess: a 34-character name, a price
  with a currency, an empty account, an error from a real API. Lorem ipsum and "Feature one" hide
  every layout problem and look templated.
- If the brief has no content, write plausible draft copy for this subject and mark it as a draft.
  Draft copy may name things the product obviously has; it never invents features, numbers,
  customers or claims. Mark anything you are unsure of `[confirm]`.

**Optical, not only mathematical.**
- Align by eye where geometry lies: icons next to text sit on the text's optical centre, play
  triangles shift right, round shapes overshoot the baseline slightly, punctuation hangs outside the
  text edge in large headlines.
- Nested radius is outer radius minus padding; mismatched radii read as careless.
- Spacing follows the scale, but related items sit visibly closer than unrelated ones (proximity is
  hierarchy).

**Deliberate asymmetry, with a reason.**
- A perfectly symmetric grid of identical cards is the default. Break the grid once, for the one
  bold move: an oversized number that is the story, a cropped product image, a pulled quote in the
  margin. Say why in the plan.
- Vary rhythm between sections by their content, not by a template (a dense table, then a single
  sentence with room around it).

**Material from the subject's world.**
- Borrow one detail from the vernacular (01, 14): the perforated edge of a ticket, the ruling of an
  exam sheet, the stamp on a parcel, the grain of a seed packet. One detail, drawn well, carries more
  identity than a gradient.
- Illustrations and photos are specific to the product or absent. Stock people smiling at laptops
  are worse than none.

**Details that show care.**
- Typographic care: real quotes (“ ”), real ellipses (…), non-breaking spaces between a number and
  its unit (10&nbsp;MB), tabular figures in tables, balanced headline wrapping, no orphaned word on
  the last line of a short heading.
- States that were thought about: an empty state that says what to do, an error that says what is
  safe, a loading state that matches the layout, a long name that wraps instead of breaking the row.
- Motion with a signature (10): one family of curves, one character, used consistently.
- Focus rings that were designed, not left at the browser default or removed.

**Restraint.**
- Remove one accessory before shipping: a second accent, a badge nobody needs, a divider that
  separates nothing, a gradient, a label repeating its heading.
- If an element would appear on any product in the category, ask what it does here.

## Part B. Copy: edit it until it sounds like a person

Generated copy fails in recognisable ways. The fix is editing, not decorating. These rules apply in
every language; the patterns list gives clues to look for, not words to ban.

### Editing constraints (in priority order)

1. **Keep the facts and the certainty.** Never add facts, numbers, names, dates, quotes, sources,
   features or results that the brief or the data does not provide. Keep negations, comparisons,
   scope, conditions, timing, completion state and attribution exactly. Do not turn "may" into
   "will", a plan into a fact, or a correlation into a cause.
2. **Respect the scope and register.** Polishing copy is not rewriting the offer. Legal, medical,
   financial and technical text keeps its precision and formality; marketing can be warmer; errors
   are plain.
3. **Match the product's voice.** If the project has a voice guide or existing copy, copy its
   sentence length, vocabulary and form of address. Do not import a persona.
4. **Fix only real problems.** A line that is clear, specific and correct stays as it is. Do not
   rewrite for the sake of change.

When copy is vague because the facts are missing, do not invent specifics to make it sound concrete.
Keep it general, or ask for the real number, or bind it to a data placeholder.

### Patterns that make copy sound generated

Each is a clue. Check it in context: is it empty, repetitive, inflated or unclear here?

**Setup instead of saying it**
- "It's not just X, it's Y." / "More than a tool, a partner." Say what it is.
- Opening wind-ups: "In today's fast-paced world…", "Imagine a world where…", "Ever wondered…?"
- Arguing with an imaginary sceptic: "You might think… but actually…"
- One-word dramatic fragments as sentences. "Simple. Powerful. Yours."

**Formula rhythm**
- Forced triads: three adjectives or three parallel clauses when there are really one or two ideas.
- Every sentence starting the same way; every card title the same shape.
- Em dashes as a universal connector, several per paragraph.
- Stacked hedges: "may potentially help to somewhat improve".
- Passive voice that hides who acts: "Your data is processed" (by whom?).

**Inflation and borrowed authority**
- Hype verbs on plain features: supercharge, unlock, elevate, empower, revolutionise, seamless,
  effortless, cutting-edge, next-level, game-changing, robust, leverage, delve.
- Significance padding: "plays a crucial role in", "a testament to", "at the heart of".
- Vague endorsements: "trusted by thousands", "loved by teams everywhere" with no data.
- Fake precision: "save 37% of your time" with no source. A number without a source is a claim.

**Template formatting**
- Bold scattered through sentences for emphasis that the sentence does not need.
- Headings that label instead of tell ("Overview", "Features", "Why us").
- Title Case Everywhere when the product uses sentence case; ALL-CAPS eyebrows.
- An arrow or emoji appended to every link and button.

**Chat residue**
- Service voice: "Great question!", "We're so excited to…", "Oops! Something went wrong."
- Apologising errors: "Sorry, we couldn't…" Errors state what happened, what is safe and what to do.
- First sentences that repeat the heading.
- Closing summaries nobody needs: "In short, X helps you do Y."

### How to rewrite

| Before | After | What changed |
|---|---|---|
| Unlock seamless collaboration with your team | Edit the same file with your team at the same time | Hype verb out; the actual feature named |
| Oops! Something went wrong. Please try again later. | Could not save. Your changes are kept on this device. Try again. | What failed, what is safe, what to do |
| Get started | Create your first invoice | The action named |
| Trusted by thousands of businesses worldwide | Used by 2,400 shops in Kenya *(only if the number is real and current)*, or remove it | No unsourced claim |
| It's not just a calendar, it's your personal time assistant. | Plan your week and see free slots across your calendars. | Setup removed; what it does |
| Lightning-fast, secure, and reliable. | Pages load in under a second on 3G. *(if measured)* | One true, specific claim instead of three adjectives |

### Working method

1. Read the whole flow first. List the facts, numbers, conditions and the one name for each action.
2. Edit only real problems. Keep the action's name through the flow: "Publish" button, "Published"
   toast, "Unpublish" in the menu.
3. Compare against the original: nothing added, nothing lost, no claim strengthened, every
   condition and negation intact.
4. Read it aloud as the user, tired, on a phone. Cut anything they would skip.

### Other languages

The same constraints apply. Each language has its own generated-text habits: in Chinese, stacked
的, "进行 + verb", four-character-idiom parallelism, "随着……的发展" openings; in Spanish and
Portuguese, gerund chains and inflated "potenciar"; in Bangla, over-formal Sanskritised vocabulary
where everyday words exist. Write in the local language first (09), use the form of address the
audience expects, and have a native speaker review the high-traffic strings.

## Part C. The human-touch check (add to the critique)

- [ ] Real content, real lengths, real edge cases are in the design.
- [ ] One detail from the subject's world is drawn well; nothing is decoration for its own sake.
- [ ] Optical alignment checked on icons, play buttons, large headlines and round shapes.
- [ ] The grid breaks once, on purpose, for the bold move; the rest is calm.
- [ ] Motion has one signature and a job for every animation.
- [ ] Copy passes Part B: no hype verbs, no invented specifics, actions keep one name, errors are
      plain.
- [ ] One accessory removed.
