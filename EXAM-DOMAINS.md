# CCA-F Exam Domains

Source: Claude Certified Architect – Foundations official exam page (anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification), cross-checked against the official Exam Guide (Version 1.0, effective July 2026, exam code **CCAR-F** — see `study-reference/ccaf_study_reference.md` for the full breakdown).

## Exam facts
- Role: Architect · Level: Foundations · Exam code: CCAR-F
- Length: 120 minutes (~135 min seat time) · 60 questions · English
- Format: Multiple choice and multiple response
- **Structure**: includes 4 scenario-based question sets drawn from a bank of 6 possible scenarios (so not every candidate sees the same 4) — see the Exam Scenario Bank below.
- Passing score: 720 (scaled 100–1,000)
- Price: $125 USD · Validity: 12 months
- Delivery: Online proctored or Pearson test center
- Exam guide and policies are linked from the official certification page — check there for the latest version before test day.

## Exam Scenario Bank (4 of 6 appear per exam)
1. **Customer Support Resolution Agent** — primary domains: Agentic Architecture, Tool Design & MCP, Context Management & Reliability
2. **Code Generation with Claude Code** — primary domains: Claude Code Configuration, Context Management & Reliability
3. **Multi-Agent Research System** — primary domains: Agentic Architecture, Tool Design & MCP, Context Management & Reliability
4. **Developer Productivity with Claude** — primary domains: Tool Design & MCP, Claude Code Configuration, Agentic Architecture
5. **Claude Code for Continuous Integration** — primary domains: Claude Code Configuration, Prompt Engineering & Structured Output
6. **Structured Data Extraction** — primary domains: Prompt Engineering & Structured Output, Context Management & Reliability

Full practice versions of scenarios 1–6 (12 official-style questions total, with explanations) are in `study-reference/ccaf_study_reference.md` section 3.

## Domain weights

| Domain | Weight | Primary folder(s) |
|---|---|---|
| Agentic Architecture & Orchestration | 27% | **08-claude-agent-sdk** (subagents, AgentDefinition, orchestration patterns, hooks as enforcement), 03-building-with-the-claude-api (agentic orchestration, managed agents, agent loop) |
| Claude Code Configuration & Workflows | 20% | 07-claude-code-in-action |
| Prompt Engineering & Structured Output | 20% | 01-ai-fluency-framework-foundations, 02-claude-101, 03-building-with-the-claude-api (prompt engineering + evaluation) |
| Tool Design & MCP Integration | 18% | 03-building-with-the-claude-api (tool design), 06-introduction-to-mcp, 08-claude-agent-sdk (in-process MCP servers, tool descriptions, structured errors) |
| Context Management & Reliability | 15% | 03-building-with-the-claude-api (context management), 07-claude-code-in-action (Claude Code context/reliability), 08-claude-agent-sdk (sessions, forking, compaction, evaluation) |

Domains cut across folders rather than mapping 1:1 — a single course often teaches material for two or three domains at once (e.g., Building with the Claude API touches Agentic Architecture, Prompt Engineering, and Tool Design & MCP Integration all at once). Use this table to weight your review time, not to assume one folder = one domain.

## The Agent SDK gap (why folder 08 exists)

The seven official prep courses do not cover the Claude Agent SDK, but the exam guide names it in the first line of its scope statement, and **Domain 1 — the heaviest domain at 27% — is almost entirely Agent SDK material**: multi-agent orchestration, subagent definitions, hooks for tool-call interception and data normalization, and programmatic prerequisite gates versus prompt-based instruction. Course 03 teaches the *hand-rolled* agentic loop (`stop_reason`, manual `tool_result` dispatch), which is assumed knowledge but is not what Domain 1's task statements describe.

Rough exposure: all of Domain 1, the in-SDK half of Domain 2 (in-process MCP servers, tool description design, structured error payloads), and the session and context half of Domain 5 (`fork_session`, compaction, evaluation) — call it 35–40% of the exam with no course behind it. That is what `08-claude-agent-sdk/` covers, sourced from the official Agent SDK references rather than a course transcript.

**One known divergence to hold.** The exam guide (v1.0, effective July 2026) names the **Task** tool as what a coordinator's `allowedTools` must include to spawn subagents. Claude Code v2.1.63 renamed that tool to **Agent**, and current SDK releases emit `"Agent"` in `tool_use` blocks while still reporting `"Task"` in the `system:init` tools list and in `result.permission_denials[].tool_name`. **Answer "Task" on the exam; write "Agent" in real code.** Folder 08 flags this inline wherever it comes up.

## How the two "deployment option" courses (Bedrock, Google Cloud) fit
Neither Bedrock nor Vertex/Google Cloud maps to a distinct exam domain by name — they're on the prep list because an Architect needs to know **how deployment choice changes the access/auth layer** (a recurring "selecting the right model and deployment option" theme in the certification's own description) without changing the underlying architecture principles (prompting, tool design, context management, agent orchestration) taught in Building with the Claude API. Expect scenario questions that test whether you know *which* Bedrock/Vertex-specific detail (auth mechanism, model ID format, regional availability) applies, layered on top of domain-general architecture questions.

## Study priority (by weight, high to low)
1. Agentic Architecture & Orchestration (27%) — **08-claude-agent-sdk first** (subagents, context isolation, hub-and-spoke, decomposition strategies, hooks as enforcement), then 03-building-with-the-claude-api: agent loop, managed agents, workflows vs. agents, all four workflow patterns.
2. Claude Code Configuration & Workflows (20%) — 07-claude-code-in-action: permission modes, hooks, CLAUDE.md, plugins, automation spectrum.
3. Prompt Engineering & Structured Output (20%) — 01, 02, and the prompt-engineering/evaluation sections of 03.
4. Tool Design & MCP Integration (18%) — tool schema design in 03, plus the full 06-introduction-to-mcp.
5. Context Management & Reliability (15%) — context-management sections of 03 and 07.
Then layer in 04 and 05 (Bedrock/Google Cloud) as a final pass — lower absolute weight, but scenario questions can reference them directly.

## Reference materials
`speedrun/index.html` is the weighted first pass over this table: 60 graded cards allocated across the five domains in proportion to the weights above (16/12/12/11/9), each linking back to the lesson and section quiz that covers it. Its "Where I stand" tab is the only view in this repo that scores progress by **domain** rather than by course — it reads the section-quiz and glossary results already in your browser and ranks domains by weighted gap. Start there, then use the priority list above to decide what to study in depth.

`glossary/` and `study-reference/` are cross-cutting — they aren't tied to one course folder and don't need their own row in `PROGRESS.md`'s course tracker. Use them as a final-pass companion once you've worked through the domain-weighted course folders above: `study-reference/ccaf_study_reference.md` in particular is sourced from the real Exam Guide and includes exam-realistic terminology (e.g. `fork_session`, `isRetryable`, `AgentDefinition`, `.claude/rules/`) and full scenario walkthroughs that go noticeably deeper than the course-derived notes in folders 01–07 — treat it as the closest thing to real practice questions in this study system.
