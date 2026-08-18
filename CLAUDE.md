# CCA-F prep repo

## Theming: highlighted/pill/badge text must set both color and background

This repo uses CSS custom properties for a light/dark theme (`--ink`, `--muted`, `--paper`, `--paper-deep`, `--rust*`, `--line`, `--white`, redefined under `:root[data-theme="dark"]`). Any rule that gives an element its own **background** — `code`, pills, badges, buttons, callout boxes — must also set its own explicit **color** on the same rule. Don't let it inherit color from a parent.

**Why:** the `code { background: var(--paper-deep); }` rule across the site didn't set `color`, so it silently inherited whatever the surrounding element's text color was. That's invisible almost everywhere, because most containers use `--ink`, which reads fine against `--paper-deep`. It broke inside `.hub` cards on the homepage, whose `.blurb` sets a light cream color (`#f0d9cd`) for contrast against the card's dark rust background — so a `<code>` tag nested inside inherited that light color, then sat on `code`'s own light `--paper-deep` background in light mode. Light text on a light chip, unreadable. Fixed by adding `color: var(--ink)` directly to every `code { ... }` rule (see `index.html`, `learning-graph/index.html`, and all files under `lessons/`, `quizzes/`, `speedrun/`).

**How to apply:** when adding any new highlighted/inline-code/badge/pill/callout style, always pair `background` with an explicit `color` in the same rule — never rely on inheriting a parent's text color. If the element can appear inside both a plain (`--paper`/`--ink`) context and a colored one (like `.hub`, rust-background cards, etc.), test it in both light and dark mode in both contexts before considering it done.
