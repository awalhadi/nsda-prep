# Worked example: Sutro, a Bangla-first exam-prep app

The method applied end to end. Sutro serves job seekers in Bangladesh preparing for public-service
exams (such as BCS), studying 3–5 hours a day, often late at night, on low-end Android phones.
Goal: a "zero cognitive load, high trust" experience.

## Discovery in one paragraph

A 2 GB Android phone, a cracked screen, one hand on a bus, patchy and metered data, a dark mess
room at 1 a.m. Users fear wasting their last months and distrust apps that promise guaranteed
success. Failure costs an exam result or money. Bangla first; Bengali numerals; "আপনি" address.

## Critique table (from the real design review)

| Proposal | Problem | Change |
|---|---|---|
| Amber, mint, coral and emerald for signals and text | Text in these colours fails AA on light backgrounds: amber 2.15:1, mint 2.54:1, coral and emerald about 3.8:1. Indigo text fails on dark: 2.82–3.05:1 | Vivid colours only for dots, fills and large graphics. Text uses tested tokens, all at 4.8:1 or more |
| `#F8FAFC` called "warm paper" | It is cool blue-grey | Warm paper `#F7F6F2`, white cards |
| Dark mode on after 8 p.m. | Overrides the system setting; eye-strain benefit is not proven | Follow the system; optional "রাতের পড়া" schedule; no eye-health claims |
| Emerald as brand colour | Clashes with green = "mastered" | Royal Indigo brand; green only means success |
| Three Bangla fonts | Size and visual noise; a rounded display face is poor for reading | Noto Sans Bengali only; a heading face only if size and testing support it |
| `tabular-nums` for timers | Bengali digits may lack tabular figures | Fixed-width digit boxes, tested |
| "Safe Zone: ৭০%" on readiness | No validated model or sourced cut-off; implies a pass chance | Readiness index labelled "আনুমানিক"; target only if sourced or user-set |
| "৯২% কমন সম্ভাবনা" badges | Not allowed until back-testing passes | Factual signals: "গত ১২টির ৯টিতে এসেছে" |
| "৪,৮৯২ জন পরীক্ষা দিচ্ছেন" | Must be real | Live count, hidden below 50 |
| Swipe between questions | Accidental swipes, back-gesture conflict | Swipe in practice only; buttons in live exams |
| Double-tap to lock answers | More errors and stress | Change answers until submission unless the exam locks them |
| Calculator in exams | Real exams forbid it | Rough pad; calculator only where that exam allows |
| Space = next question (web) | Conflicts with scrolling and screen readers | `1`–`4`, `←` `→`, `F` flag, `C` confused |
| "Verified by Cadre Panel" on every explanation | Untrue for AI-assisted, sampled explanations | Badge shows the real review state |
| Haptics "release dopamine", double buzz on wrong | Unsupported claim; punishing feedback raises anxiety | Light tap / soft tick, practice only, follows system |
| "Offline protected… auto-submits" | Only true if the paper was downloaded | Shield shows the true state with correct copy |
| Brag card with name and rank | Privacy | Alias by default, no phone number, server data only |

## Tokens (excerpt)

| Token | Light | Dark | Contrast |
|---|---|---|---|
| `bg` | `#F7F6F2` | `#0B0F19` | n/a |
| `surface` | `#FFFFFF` | `#111827` | n/a |
| `text` | `#0F172A` | `#E5E7EB` | 16.5 / 15.5 on bg |
| `text-muted` | `#475569` | `#9CA3AF` | 7.0 / 7.5 |
| `primary` | `#4F46E5` | `#A5B4FC` | 5.8 / 9.6 |
| `danger` / `warning` / `success` | `#B91C1C` / `#92400E` / `#047857` | `#F87171` / `#FBBF24` / `#34D399` | all ≥ 5.1 |
| `timer-low` | `#B45309` | `#FBBF24` | 4.6 / 11.5 |
| `omr-fill` | `#1E1B4B` | `#C7D2FE` | 14.8 / 12.8 |
| `signal-hot/rising/safe` | `#EF4444` / `#F59E0B` / `#10B981` | same | fill only |

Type: Noto Sans Bengali + Inter; question 19/20 px at line height 1.7, options 18 px, body 16/17.
Touch: 48 dp. Motion: 120/200 ms ease-out, fades only under reduced motion.

## Screen spec: home command center (excerpt)

1. Header: target switcher `[[target icon] ৪৭তম বিসিএস প্রিলি ▾]`, [flame icon] streak, [bolt icon] Pro badge, avatar.
2. Zone 1: readiness gauge ("প্রস্তুতি সূচক (আনুমানিক)"), shown only after 200 answers covering
   30% of the syllabus weight, plus one computed insight ("…আরও ৪ নম্বর বাড়ানো সম্ভব").
3. Zone 2: "আজকের টার্গেট: মাত্র ২৫ মিনিট", 3 tasks with time and payoff; the first unfinished
   task holds the screen's only primary button.
4. Zone 3: live-exam banner (real count, hidden under 50), Mistake Vault and heatmap bento, Quests.

- **AC:** First-click test, at least 8 users: at least 80% tap the intended primary action within 3 seconds.
- **AC:** Given no tasks left today, the primary action becomes the best next activity, never an upsell.
- **AC:** Given the target switched, every zone updates within 1 second from cache.

## Offline shield states

| State | Text |
|---|---|
| Online, saved | [shield icon] সেভ হচ্ছে |
| Offline, paper downloaded | [shield icon] নেট নেই, উত্তর ফোনে নিরাপদে সেভ হচ্ছে। নেট ফিরলে জমা হবে। |
| Offline, prize exam | Same, plus "পুরস্কারের জন্য সময়মতো অনলাইনে জমা দিতে হবে।" |
| Offline, paper not downloaded | [warning icon] নেট নেই, পরের প্রশ্ন লোড করা যাচ্ছে না। আপনার উত্তর সেভ আছে। |

## What made it work

- The critique table killed attractive but harmful ideas before any code existed.
- Contrast is computed in the token build, so a bad colour cannot ship.
- Every persuasive number is bound to data, and a banned-phrase list is linted in CI.
- The review checklist is required in every PR that adds a screen.
