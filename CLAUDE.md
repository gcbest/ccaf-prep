# CCA-F prep repo

## Theming: highlighted/pill/badge text must set both color and background

This repo uses CSS custom properties for a light/dark theme (`--ink`, `--muted`, `--paper`, `--paper-deep`, `--rust*`, `--line`, `--white`, redefined under `:root[data-theme="dark"]`). Any rule that gives an element its own **background** — `code`, pills, badges, buttons, callout boxes — must also set its own explicit **color** on the same rule. Don't let it inherit color from a parent.

**Why:** the `code { background: var(--paper-deep); }` rule across the site didn't set `color`, so it silently inherited whatever the surrounding element's text color was. That's invisible almost everywhere, because most containers use `--ink`, which reads fine against `--paper-deep`. It broke inside `.hub` cards on the homepage, whose `.blurb` sets a light cream color (`#f0d9cd`) for contrast against the card's dark rust background — so a `<code>` tag nested inside inherited that light color, then sat on `code`'s own light `--paper-deep` background in light mode. Light text on a light chip, unreadable. Fixed by adding `color: var(--ink)` directly to every `code { ... }` rule (see `index.html`, `learning-graph/index.html`, and all files under `lessons/`, `quizzes/`, `speedrun/`).

**How to apply:** when adding any new highlighted/inline-code/badge/pill/callout style, always pair `background` with an explicit `color` in the same rule — never rely on inheriting a parent's text color. If the element can appear inside both a plain (`--paper`/`--ink`) context and a colored one (like `.hub`, rust-background cards, etc.), test it in both light and dark mode in both contexts before considering it done.

## Quiz questions: the correct answer must not be guessable from its shape

Every multiple-choice question in the learning graphs (`learning-graph/data/knowledge-points/*.json` and `learning-graph/section-03/data/knowledge-points/*.json`) has an `options` array and a `correct` index. Two properties of those arrays leak the answer without the reader knowing anything about the subject:

1. **Length.** Write the right answer first and it comes out fully qualified and precise, while the distractors stay short throw-away phrases. The longest option then *is* the answer.
2. **Position.** Writing a plausible-sounding wrong answer, then the real one, then two more fillers puts `correct` at index 1 nearly every time.

**Why:** both were true across the whole bank at once. The correct option was the uniquely longest one in 68% of Section 8 questions and 67% of Section 3 (chance is 25%), and `correct` was `1` in 144/164 and 223/254 respectively — so a reader could score ~88% by always picking the second option, without reading the question. That makes the quiz measure nothing. Fixed by rewriting every option in both sections: distractors expanded to the same specificity and roughly the same length as the answer, answers trimmed where they were doing the distractors' explaining for them, and `correct` spread evenly over all four indices.

**How to apply:** when adding or editing a question, keep all four options within about ±20% of each other in length, and vary `correct` — never let a file drift toward one index. A distractor should read like something a knowledgeable person might plausibly believe, stated at the same level of detail as the answer; if it reads as obvious filler, it isn't doing any work. Where the answer is a literal identifier (`pathToClaudeCodeExecutable`, `PostToolUseFailure`), pick equally long real-sounding identifiers for the distractors rather than short unrelated ones. `node learning-graph/scripts/validate.mjs all` warns when either tell reappears across a section — treat those warnings as failures. Never write an explanation that refers to an option by position ("the last option is wrong"); name its content instead, so the options can be reordered later.
