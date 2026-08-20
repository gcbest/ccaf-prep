# Claude Certified Architect – Foundations (CCA-F) Study System

This folder is a spaced-repetition study system built from the official **"Prepare for this exam"** course list on the Claude Certified Architect – Foundations certification page (anthropic-partners.skilljar.com), organized to prepare for the exam.

## How this is organized

**One folder per official prep course** — the same 7 courses Anthropic lists under "Prepare for this exam" — plus `08-claude-agent-sdk/`, which has no official course behind it (see below). Each folder contains two files:

- `notes.md` — condensed source material: definitions, key facts, code patterns, recap points pulled directly from the course lessons.
- `quiz.md` — question bank for that course. Questions first, answers below a `---` divider so you can self-test before peeking, or so Claude can quiz you conversationally without spoiling the answer.

**One narrative lesson per course** — `lessons/` holds a self-contained interactive HTML lesson for each course (sections 03 and 08 are each split into parts, since they carry the exam's heaviest domain). Each lesson teaches the course material as a story set at a fictional company, Northstar, with timestamped scenes and interactive decision points where every wrong option is explained rather than just marked wrong. Open `lessons/index.html` in a browser to start. Use these to *learn* the material; use `quiz.md` to test whether it stuck.

**Start with the speed run.** `speedrun/index.html` is the entry point to everything else: 60 graded multiple-choice cards covering all five scored exam domains, weighted to match the real exam (16/12/12/11/9 across a 27/20/20/18/15% split). It takes about 45 minutes and is built from `all-sections/quiz.md` plus the exam-guide-derived `study-reference/`. Alongside the sprint it carries a printable cheat sheet of all 60 compressed answers, a confusable-pairs "traps" drill, an exam-day facts card, and a **"Where I stand" dashboard** — the only place in this repo that maps progress onto the five *domains* rather than the seven *courses*, reading your existing section-quiz and glossary scores automatically. Use it first to find your weak domains, then open the lessons below only where you need them.

Five additional reference folders sit alongside the 7 course folders:
- `speedrun/index.html` — the weighted 60-card first pass and readiness dashboard described above. Progress is stored under `ccaf_speedrun_v1`.
- `glossary/ccaf_glossary_quiz_tracker.html` — an interactive, self-contained quiz/tracker artifact covering 64 exam-specific terms across all 5 domains, built directly from the official CCA-F Exam Guide (not just course content). Open it in a browser and click through — it tracks your mastery locally.
- `study-reference/ccaf_study_reference.md` — a machine-readable companion covering the same 64-term glossary plus 12 official-style scenario practice questions (drawn from the exam's actual scenario bank), with a built-in progress-tracking log. This is the single most authoritative file in this folder for exam-realistic prep, since it's sourced from the Exam Guide itself rather than course transcripts.
- `quizzes/` — a self-contained, no-Claude-needed HTML quiz for each of the 8 course folders (408 four-option multiple-choice questions total), converted from each course's `quiz.md`. Each quiz tracks right/wrong answers per question in the browser's `localStorage` and offers a "missed & new first" mode plus a "review only missed" mode so wrong answers resurface more often. Open `quizzes/index.html` to start, or jump in from `index.html` / `lessons/index.html` / any individual lesson page.
  - `quizzes/09-mock-exams/` — six full-length, timed 60-question practice exams (360 questions total), imported from [pvs156/anthropic_ccaf_mocks](https://github.com/pvs156/anthropic_ccaf_mocks) and wired into this repo's navigation and gist sync. Unlike the topic quizzes above, these simulate exam day: a pausable 2-hour clock, no feedback until submission, a question palette, flag-for-review, and a per-domain score breakdown at the end. Open `quizzes/09-mock-exams/index.html` to see attempts and best score per batch.

- `learning-graph/` — two sections rebuilt as knowledge graphs, sharing one browser app that schedules what you should do next. It implements the mechanics from *The Math Academy Way* — knowledge frontier, scaffolded mastery learning, targeted remediation, fractional implicit repetition, review compression, spaced repetition, and an adaptive placement diagnostic — over data formatted after `withmarbleapp/os-taxonomy`.
  - **Section 8** (the Claude Agent SDK): 44 micro-topics, 64 prerequisite edges, 48 encompassings, 60 knowledge points, 164 questions. `learning-graph/index.html`, progress under `ccaf_learning_graph_v1`. It is the heaviest domain on the exam and the one with no official course.
  - **Section 3** (Building with the Claude API): 68 micro-topics, 99 prerequisite edges, 77 encompassings, 83 knowledge points, 254 questions, nine layers deep from a single entry point. `learning-graph/section-03/index.html`, progress under `ccaf_learning_graph_03_v1`. It is the widest section, feeding four of the five exam domains.

  These two get the treatment because they carry the most weight. Progress is tracked separately per section. Source data is in each section's `data/*.json`, validated with `node learning-graph/scripts/validate.mjs all`.

See `EXAM-DOMAINS.md` for how these courses map to the five scored exam domains, and `PROGRESS.md` for a running log of what's been reviewed and how well you know it.

### Working through a lesson

Every section either puts a decision in front of you or ends in a "Check yourself" question, and your first answer to each is recorded — that's what drives the progress bar, the `✓ n/m` counter in the header, and the resume link on the index pages. A **Next →** button appears once a section is answered. On a keyboard, `j`/`k` move between sections, `1`–`6` answer the current one, `Enter` advances, `/` searches the lesson, and `?` lists the shortcuts.

The header button cycling **Read → Review → Missed** is for the second pass. *Review* drops the narrative and keeps the takeaways, tables, notes, code and every question — and re-locks questions you have already answered so you can re-test yourself, without overwriting your original score. *Missed* goes further and hides the sections you got right first time, which usually collapses a lesson to a handful of scenes.

### Keeping your progress

Progress lives in the browser's `localStorage`, which is **not durable on mobile Safari** — iOS clears it after roughly a week without a visit, and Private Browsing refuses to write it at all. Connect gist sync from any quiz page to carry progress across devices and survive that eviction. Adding the site to the iOS Home Screen also gives it noticeably more durable storage than a plain Safari tab.

## Courses (in the official exam-page order)

| # | Folder | Course | Level |
|---|--------|--------|-------|
| 01 | `01-ai-fluency-framework-foundations` | AI Fluency: Framework & Foundations | 100 |
| 02 | `02-claude-101` | Claude 101 | 100 |
| 03 | `03-building-with-the-claude-api` | Building with the Claude API | 100–200 |
| 04 | `04-claude-with-amazon-bedrock` | Claude with Amazon Bedrock | 100–200 |
| 05 | `05-claude-on-google-cloud` | Claude on Google Cloud | 100–200 |
| 06 | `06-introduction-to-mcp` | Introduction to Model Context Protocol | 200 |
| 07 | `07-claude-code-in-action` | Claude Code in Action | 200 |

**Folder 08 is not drawn from a course, because there isn't one.** Anthropic publishes no Agent SDK course, but the exam guide names the Agent SDK in the first line of its scope statement, and Domain 1 — Agentic Architecture & Orchestration, 27%, the heaviest domain — is almost entirely Agent SDK material. Folder 08 is built directly from the official Agent SDK TypeScript and Python references and the Subagents, Hooks, and Permissions guides on `docs.claude.com`, and it is where exam terminology the courses never say out loud lives: `AgentDefinition`, `fork_session`, `isRetryable`, the Task tool. Where the shipping SDK and the exam guide disagree — most importantly the Task/Agent tool rename in Claude Code v2.1.63 — the notes state both and mark which answer belongs on the exam.

Folders 03 and 07 also carry a small amount of **[Bonus]**-labeled background from Claude Platform 101 and Claude Code 101 — those two courses aren't on the official prep list, but their content directly overlaps with courses 03 and 07 and rounds out the picture. Everything else is drawn strictly from the 7 official courses.

## How to use this for long-term retention

**First pass (no Claude needed):** Open `speedrun/index.html` and work the 60 cards. Check the "Where I stand" tab — it ranks the five exam domains by *weighted gap*, so the top row is whichever domain will move your score most. Study that first.

**On demand (chat-based):** Ask Claude things like:
- "Quiz me on 06 (Introduction to MCP)"
- "Quiz me on 10 random questions across all courses"
- "Quiz me only on topics I've marked weak in PROGRESS.md"

Claude will read the relevant `quiz.md` file(s), follow the session rules below, and update `PROGRESS.md` with how you did.

### Quiz-session instructions

Use these rules for both on-demand and scheduled sessions:

1. **Set a small scope.** Use the learner's requested course, topic, or question count. If none is given, start with a short five-question mixed session and state that scope once.
2. **Ask exactly one question at a time.** Give the learner one prompt with one learning objective, then wait for the response. Split compound or multi-part questions into separate turns. Do not include the next question, answer, or explanation before the learner attempts the current question.
3. **Protect retrieval practice.** Do not reveal the answer key or notes before an attempt unless the learner asks for them. Prefer free-response questions; use multiple choice only when it is useful for the source material or the learner requests it.
4. **Teach after each attempt.** Mark the response as `Correct`, `Partially correct`, or `Needs review`. Briefly identify what was right or missing, give the accurate answer and a concise explanation, and end with one memorable takeaway.
5. **Use mistakes productively.** For a partially correct or incorrect response, give one focused hint and allow one retry before revealing the full answer. If the learner wants to move on, reveal the answer immediately and continue.
6. **Adapt the session.** Revisit missed concepts later using different wording, vary difficulty and course topics, and avoid repeating questions the learner has already mastered. Spend more time on weak areas without turning the session into a lecture.
7. **Keep the pace conversational.** After feedback, ask only the next single question and stop so the learner can answer. Do not batch questions or add extra “ready?”/reflection questions alongside the quiz question.
8. **Close with a useful recap.** Report the score, strengths, concepts to revisit, and a concrete next study suggestion. Update `PROGRESS.md` once per session, and append the session to its log when appropriate.

**Scheduled (spaced repetition):** A recurring task quizzes you automatically each morning — see the `ccaf-daily-quiz` scheduled task. It rotates through courses, favoring ones marked weak or not-reviewed-recently in `PROGRESS.md`.

**Exam-realistic practice:** Once you've covered the 7 courses, switch to `study-reference/ccaf_study_reference.md` — ask Claude to quiz you on its 64 terms or its 12 scenario questions specifically, since those come straight from the exam guide's own scenario bank. Its section 4 progress log tracks per-term mastery (0–3) independently of `PROGRESS.md`. Or open `glossary/ccaf_glossary_quiz_tracker.html` directly in a browser for a self-contained, no-Claude-needed quiz session.

## Source

Course folders (01–07) are drawn from the Anthropic Academy (anthropic.skilljar.com) courses listed under "Prepare for this exam" on the official CCA-F certification page (anthropic-partners.skilljar.com), plus limited bonus background from Claude Platform 101 and Claude Code 101. Course text is condensed/paraphrased into notes and quiz questions, not reproduced verbatim.

The `glossary/` and `study-reference/` materials are instead sourced from the official Claude Certified Architect – Foundations Exam Guide (Version 1.0, exam code CCAR-F) — a different, more exam-specific source than the course transcripts, which is why some terminology there (e.g. `fork_session`, `isRetryable`, `AgentDefinition`) won't appear verbatim in the course folders.
