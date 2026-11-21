# 12. UX writing

Words are interface. Most "confusing UI" is confusing copy.

## Rules

- **Plain words, short sentences.** Write for a tired person on a small screen.
- **Buttons say what happens:** "Start revision", "Pay ৳299", "Delete 3 papers". Never "OK",
  "Submit" alone, or "Click here".
- **Verb plus payoff** for the primary action: "Review 16 mistakes (10 min)".
- **Encouragement, not fear:** "You can gain 4 more marks here" rather than "You are failing".
- **Errors** state the cause, what is safe, and what to do: "Could not connect. Your answers are
  saved. Try again."
- **Empty states** explain why it is empty and offer one action. When empty is good, say so
  honestly: "Nothing to review today".
- **Respectful address** suited to the audience and language.
- **Consistent terms:** pick one word for each concept and keep it. An action keeps one name
  through the whole flow: the "Publish" button leads to a "Published" toast, not "Saved live".
- **Name things by what users understand,** not by how the system is built: "notifications", not
  "webhook config". Describe what something is or does; do not sell it.
- **Specific beats clever.** A headline that a new user can read and act on wins over a pun.
- **Errors do not apologise and are never vague.** They are written in the interface's voice, not
  a person's: what happened, what is safe, how to fix it.
- **An empty screen is an invitation to act,** not a mood.
- **Sentence case**, plain verbs, no filler. Each piece of text does exactly one job.
- **No decorative punctuation in controls:** no `→` appended to buttons or links, no ALL-CAPS
  labels, no labels that only repeat the heading.
- **Use the brief's real content.** When copy is missing, write plausible copy for this subject,
  never lorem ipsum or generic product filler; placeholder copy makes a design look templated.

## Truthful persuasion

- Keep a **banned-claims list** and lint copy catalogs and templates against it. Typical entries:
  "100% guaranteed", "guaranteed pass", "100% common", "unlimited AI" (when there are limits),
  "lottery", "lucky draw", "the first in the country" (until verified), "cheating impossible".
- **Numbers in persuasive copy bind to data placeholders.** A literal "92%" in a marketing string
  should fail CI unless it is on an allow-list with a source.
- Labels for estimates say so: "Readiness (estimated)".
- Before predictions are validated, use factual signals: "Appeared in 9 of the last 12 papers".

## Microcopy patterns

| Situation | Pattern |
|---|---|
| Confirmation | "[Action] [object]? [Consequence]." + outcome buttons |
| Success toast | "[Object] [past verb]." + Undo |
| Limit reached | What the limit is, when it resets, the free way forward, then the paid way |
| Permission request | What the user gets first, then the request |
| Offline | What works, what is safe, what waits |
| Loading over 3 s | What is happening ("Checking your answers…") |
