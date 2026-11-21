# Screen: <name>

**Job (one sentence):**
**Users and context:** <persona, device, moment>
**Entry points:** <where users arrive from>   **Exits:** <where they go next>

## 3-Second Rule
| Question | Answer on this screen | Element |
|---|---|---|
| Where do I stand? | | |
| What should I do now? | | the primary button: "<verb + payoff>" |
| What do I get? | | |

## Layout (top to bottom)
```
┌──────────────────────────────┐
│ header                        │
├──────────────────────────────┤
│ zone 1                        │
├──────────────────────────────┤
│ zone 2   [ Primary action ] │
├──────────────────────────────┤
│ zone 3                        │
└──────────────────────────────┘
```
Web / tablet differences:

## Components used
<list from the component library; any new one needs a design-system change first>

## Data bindings
| Number or claim shown | Source | Hidden when |
|---|---|---|
| | | |

## States
| State | What the user sees | Primary action |
|---|---|---|
| First use (no data) | | |
| Loading | skeleton matching layout | |
| Normal | | |
| Empty | | |
| Error | cause + what is safe + retry | |
| Offline | | |
| Limit reached | | never only an upsell |
| Done for today | | best next activity |

## Accessibility
Screen-reader order and announcements:
Keyboard (web):
Font scale 200% behaviour:

## Copy
<all strings, local language first; check against the banned-claims list>

## Acceptance criteria
- **AC:** Given <state>, then <observable result>.
- **AC:** Given <edge case>, then <result>.

## Review gate
<paste the checklist from references/19-review-gate.md>
