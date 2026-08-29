# Source note: the community CCA-F study guide

`learning-graph/section-guide/` and `quizzes/10-guide-practice-test/` are built from
[`paullarionov/claude-certified-architect`](https://github.com/paullarionov/claude-certified-architect)'s
`guide_en.md` — a community-written CCA-F study guide, independent of the official Anthropic
Academy courses the rest of this repo's material is built from.

The guide has three parts:

1. **Part I — Theory Foundations**, 13 chapters (`guide_en.md` lines 116–1530): Claude API
   fundamentals, `tool_use`, the Agent SDK, MCP, Claude Code configuration, advanced prompt
   engineering, the Batches API, task decomposition, escalation/human-in-the-loop, multi-agent
   error handling, production context management, provenance, and built-in tool selection. This
   is what `learning-graph/section-guide/` teaches — one topic per subsection (merged where two
   adjacent subsections form a single teachable idea), 51 topics across 13 clusters.
2. **Part II — Exam Domain Notes**, the same material re-indexed under the 5 official CCA-F
   domains as key-knowledge/key-skills bullets. No new content — used here only to cross-check
   each topic's domain tag. Note: the guide's own Domain 3 ("Claude Code Configuration and
   Workflows") and Domain 4 ("Prompt Engineering and Structured Output") are swapped relative to
   the official CCA-F Exam Guide v1.0 numbering this repo's other `curriculum-standards.json`
   files use — topics in this graph are tagged by content against the official numbering, not the
   guide's own.
3. **A 76-question Practice Test** (5 scenarios), which `quizzes/10-guide-practice-test/` imports
   verbatim. The guide's own shipped `practical_test_en.html` only carries 60 of the 76 — it's
   missing the newer "Conversational AI Architecture Patterns" scenario (16 questions) that the
   markdown has — so the quiz page was built from the markdown, not the HTML.

Chapters 1–5 overlap in subject with `03-building-with-the-claude-api`, `06-introduction-to-mcp`,
`07-claude-code-in-action`, and `08-claude-agent-sdk`, but teach the exam-condensed version of
each idea rather than duplicating those courses' lessons. Chapters 6–13 are the more novel
material — few-shot patterns, prompt chaining vs. dynamic decomposition, the Batches API,
escalation triggers, structured handoff, the multi-agent error taxonomy, production
context-management patterns, and provenance/attribution — closest to exam Domains 4 and 5, which
don't have a dedicated numbered course section elsewhere in this repo.
