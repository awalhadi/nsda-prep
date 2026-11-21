# 02. Principles

Five principles. When a design decision is unclear, one of these usually settles it.

## 1. The 3-Second Rule

Within about 3 seconds on any main screen, a user can answer, without thinking:

1. **Where do I stand?** Status, progress or readiness.
2. **What should I do now?** One primary action.
3. **What do I get?** The payoff of that action.

Consequences:
- Exactly **one primary button** per screen. Everything else is secondary, tertiary or a link.
- The primary label is a verb plus the payoff: "Start revision (25 min)", not "OK" or "Continue".
- When the main task is done, the primary action moves to the best next useful thing, **never to
  an upsell**. Selling at the moment of success feels like a trap.
- Test it: a first-click test with at least 8 target users, where at least 80% tap the intended
  action within 3 seconds.

## 2. Trust over hype

Persuasion must be true.
- Urgency comes from real deadlines, never invented countdowns.
- Social proof comes from real counts, hidden below a threshold (for example under 50) so small
  numbers do not look sad or fake.
- Predictions and percentages show only after they are validated. Before that, show factual
  signals: "appeared in 9 of the last 12 papers", not "92% likely".
- Badges say exactly what is true: "Answer verified by an expert, explanation AI-assisted" is
  better than a vague "Verified".
- Encouragement replaces fear: "You can gain 4 more marks here" rather than "You will fail".
- Paywalls show what the user gets, the real price, and a close control visible without scrolling.

Why: trust builds slowly and breaks at once. One discovered fake number poisons every true one.

## 3. Calm focus

In high-stakes moments (an exam, a payment, a destructive confirmation), **nothing moves except
what the user needs**, such as the timer. No promotions, badges, confetti or notifications.
Remove navigation chrome. Make every control explicit and every consequence stated.
See `07-high-stakes-flows.md`.

## 4. Built for real conditions

Assume the hardest realistic case from discovery: a 2 GB phone, a cracked screen, one hand on a
bus, patchy data, a dark room at 1 a.m., sunlight on the beach, a screen reader, 200% font size.
- Drop decoration before you drop frames.
- Show cached data first, then refresh.
- Never lose user input on a network failure, and tell the user what is safe ("Your answers are saved").
- Keep the main actions inside thumb reach on mobile (bottom half, bottom navigation).

## 5. Honest system, honest states

The UI never claims what the system cannot do. An "offline protected" shield appears only if the
content really is stored on the device. A "saved" tick appears only after the save. An error
message says the plain cause, what is safe, and how to retry.

## Supporting heuristics

- **Respect the platform.** Use the system theme by default, offer a schedule as an option, and
  make no health claims ("dark mode reduces eye strain" is not proven).
- **Progressive disclosure.** The always-visible part answers the main question. Detail lives
  behind clear pills or sheets ("Why are the other 3 options wrong?").
- **One meaning per colour.** If green means "correct" or "mastered", the brand colour must not be
  green. Brand and status colours must never compete.
- **Consistency beats cleverness.** The same thing looks and behaves the same everywhere.
- **Fewer fonts.** Each font family costs download size and visual noise. One well-chosen family
  per script is usually enough.
