# 02 · Claude 101

Source: Claude 101 (Anthropic Academy) — official CCA-F prep course #2.

## What Claude is
- Trained on **Constitutional AI**: guided to be helpful, harmless, and honest — avoiding toxic/discriminatory output and illegal/unethical assistance, aligned with human values, operating transparently.
- More than a chatbot: summarization, search, creative/collaborative writing, Q&A, coding, and acting as a thinking partner for complex, multi-step problems.
- Steerable — takes direction on tone/personality/behavior.
- Access points: Claude.ai (web/desktop/mobile), Claude Code (agentic coding), @Claude in Slack, Claude Design (UI prototyping), Claude for Microsoft 365 (Word/Excel/PowerPoint/Outlook sidebar).
- Context window: 200K+ tokens standard (~500 pages), up to 1M tokens on Pro/Max/Team/Enterprise with supported models.
- **Thinking**: Claude can reason step-by-step before answering on complex problems (near-instant vs. extended reasoning).
- **Learning mode**: guides reasoning rather than giving answers directly.

## The Claude desktop app: three shapes of work
1. **Chat** — turn-by-turn conversation. Use when the next question depends on the last answer, or the task is quick.
2. **Cowork** — hand off multi-step work ending in a deliverable, spanning tools, or running on a schedule. Gives: local folder access (saves back to folder, not just downloads), scheduled tasks, subagents (parallel background workers), projects, browser use (Claude in Chrome), computer use (research preview), plugins.
3. **Code tab (Claude Code)** — full dev environment; local or cloud (GitHub-connected) sessions; permission settings: Manually approve / Accept edits / Plan.

## Projects
- Self-contained workspaces: own memory, chat history, knowledge base, custom instructions.
- Use for ongoing work with repeated reference material or consistent response requirements.
- **RAG (Retrieval Augmented Generation)**: when project knowledge approaches the context limit, Claude switches from loading everything to searching and retrieving only relevant parts — expands capacity up to **10x**.
- Sharing permission levels (Team/Enterprise): Can view, Can edit, Owner.

## Artifacts
- Standalone, interactive outputs Claude creates in a dedicated window. Auto-created when content is significant/self-contained (typically >15 lines), reusable, or complex enough to stand alone.
- Types: documents (md/text), code snippets, HTML pages, SVG images, Mermaid diagrams, React components.
- Word/Excel/PowerPoint/PDF are NOT artifacts — created via a separate file-creation capability (Skills) and returned as downloadable files.
- Publishing: only the selected version goes public; chat stays private; others can "remix" a published artifact.

## Skills (in Claude.ai)
- Folders of instructions/scripts/resources Claude loads dynamically for specialized/repeatable tasks.
- **Anthropic Skills**: built-in, power Excel/Word/PowerPoint/PDF creation, auto-invoked.
- **Custom Skills**: user/org-created for specific workflows; created via conversation with Claude (Claude interviews you, generates the skill file).
- Requires code execution and file creation enabled (sandboxed environment).
- **Skills vs. Projects**: Projects store knowledge (the *what*); Skills define process (the *how*). A skill can reference knowledge stored in a project.

## Connectors (MCP-powered)
- Give Claude access to external tools/data/actions. **MCP (Model Context Protocol)** powers connectors — described as "USB-C for AI," a universal standard so any developer can build a connector that works with Claude.
- Two types: **web connectors** (cloud services: Google Drive, Notion, Slack, Asana — via claude.ai/directory) and **desktop extensions** (local tools/files via Claude Desktop app).
- Security: scoped access (toggle individual permissions), Claude only sees what you have access to, revocable anytime.

## Enterprise Search (Team/Enterprise plans)
- Adds "Ask {Org Name}" to sidebar — a pre-built project spanning your org's connected knowledge (SharePoint, Slack, Gmail, Drive, etc.) with custom instructions from Anthropic.
- Two-step setup: admin configures org-wide connectors (Documents + Chat connector required, Email optional) → individual users authenticate personally.
- Only shows what the user already has permission to access in the source tool.

## Research
- Agentic, multi-step process: **plans** (uses Thinking) → conducts **multiple searches that build on each other** → **synthesizes** findings → **cites sources**.
- Takes minutes, not seconds — runs many searches, sometimes across hundreds of sources.
- Use Research for: comprehensive multi-source reports, comparative analysis, verified citations. NOT for quick facts (use web search) or pure reasoning tasks (use Thinking) or org-internal knowledge (use Enterprise Search).
- Web search must be enabled for Research to function.

## Writing effective prompts — 3 elements
1. **Setting the stage** — your role, objectives, relevant context.
2. **Defining the task** — the specific action Claude should take.
3. **Specifying rules** — style/tone/format, examples to follow.
Best approach: talk to Claude like a capable coworker — naturally, concisely, conversationally.
(See topic 01 for the underlying 4D Fluency Framework this technique draws on.)

## Common failure modes & fixes
| Problem | Cause | Fix |
|---|---|---|
| Response too generic | Not enough context about your situation | Add audience, role, constraints |
| Response too long/short | Claude guessing at length | State it explicitly ("two paragraphs", "under 100 words") |
| Wrong format | Told *what* not *how* to present it | Show an example or describe structure explicitly |
| Confidently wrong facts | Hallucination on niche/specific facts | Verify independently; ask for sources/confidence; enable web search |
| Wrong tone | Default is helpful/professional | Describe desired tone in plain language, give an example |

## Iteration mindset
- Treat the first prompt as the start of a conversation, not a one-shot request.
- Give specific feedback ("cut the first two paragraphs and make the conclusion more action-oriented") rather than vague feedback ("make it shorter").
- Know when to restart in a new chat vs. redirect within the same one.
- You can click the pencil icon on a message to edit and resubmit rather than adding a new message.

## Personalization features
- **Memory**: automatically saves context (role, preferences, past decisions, working style) across conversations; reviewable/editable in Settings; syncs across devices.
- **Styles**: presets (concise, formal, explanatory) or custom-described communication style, applied across all conversations.

## Evals — the lightweight version
"Evals" (evaluations) build intuition for how well Claude performs on tasks that matter to you.
1. Gather 5–10 examples of a task you do regularly.
2. Write test prompts with the context you'd naturally have.
3. Compare Claude's outputs to your originals — does it capture key info, right tone, what's missing?
4. Refine your prompt/add examples based on what you learn.
This is the *lightweight* eval approach from Claude 101; a more rigorous pipeline approach is in 03-building-with-the-claude-api (Prompt Evaluation).

## Choosing the right Claude surface

The course frames Claude as a coworker whose working surface should match the shape of the job:

- **Chat** is best for interactive, turn-by-turn work where the next question depends on the previous answer: brainstorming, explaining, drafting, reviewing, and quick iteration.
- **Cowork** is best for a delegated, multi-step deliverable that may span local files, connectors, browser/computer actions, subagents, or scheduled work. Give it a clear goal, permissions, constraints, and a way to verify the finished artifact.
- **Code** is best when the work is a software codebase: inspect the repository, plan changes, edit files, run commands and tests, and review the diff. Local and cloud sessions have different filesystem and GitHub access, so confirm the active environment before acting.

Choosing a more agentic surface does not remove human responsibility. The larger the permissions and the longer the task, the more important the plan, checkpoints, and verification become.

## Projects, Skills, and knowledge

These features solve different problems:

- **Projects** provide persistent context for ongoing work: chat history, a project knowledge base, project instructions, and a repeatable workspace. Use them for a domain, client, course, or recurring workflow rather than a one-off question.
- **Skills** package reusable process knowledge, scripts, and resources. They are loaded dynamically when relevant and are best for "how to do this" procedures such as creating a spreadsheet, preparing a document, or running a specialized workflow.
- Project knowledge answers "what should Claude know?" Project instructions answer "how should Claude work here?" A Skill answers "what reusable procedure should Claude invoke?"

Project knowledge may be retrieved rather than placed in every prompt, allowing larger knowledge bases, but relevant source material still needs to be organized and reviewed. The project description is metadata for people; it is not the same as instructions Claude receives. Review externally sourced Skills before enabling them because a Skill may contain executable code or file-changing steps.

## Connectors and enterprise search

Connectors use MCP-style integrations to let Claude work with external services or local desktop resources. A web connector accesses a cloud service; a desktop extension can reach local files, applications, or browser state. Access is scoped to what the user can see, can be revoked, and may require confirmation for sensitive actions.

Enterprise Search is a managed internal-search experience. It searches connected organizational sources using the user's existing permissions and returns citations. Admin configuration determines which sources are available. Treat its results as permission-scoped evidence: Claude can find and cite what the user is authorized to access, but it should not be assumed to have access to the entire organization or to know undocumented material.

## Research, web search, Thinking, and Enterprise Search

Route the request by the kind of evidence it needs:

- Use **Research** for a comprehensive, multi-step report that benefits from current sources, comparison, synthesis, and citations. It may take minutes and perform many searches.
- Use **web search** for a quick current fact or a small number of sources.
- Use **Thinking** for difficult reasoning, mathematics, coding, or analysis when external information is not the main requirement.
- Use **Enterprise Search** for internal organizational knowledge and connected work systems.

Research plans searches that build on one another before synthesizing; it is not merely a longer single search. Check that web search is enabled when the task depends on current external information, and inspect citations before relying on a consequential claim.

## Artifacts and sharing

An Artifact is appropriate when the output is substantial, reusable, or independently inspectable: a document, code file, HTML page, SVG, Mermaid diagram, or React component. Short prose answers do not need to become Artifacts. Use the preview, source/code, copy, download, and version controls to inspect incremental changes.

Internal sharing and public publishing are different risk levels. A public Artifact link can be viewed without an account and may be remixed, so remove confidential information and publish only the intended version. Word, Excel, PowerPoint, and PDF file creation is a separate file-producing workflow even when the content is first drafted in an Artifact.

## Prompting and evaluation in the app

A strong Claude prompt establishes the role or objective and relevant context, states the task, and specifies rules such as format, tone, examples, and constraints. For recurring work, preserve good prompts as Project instructions or a Skill instead of relying on memory.

For a lightweight eval, collect 5–10 representative examples, run the candidate prompt on each, compare against the desired result, and revise based on consistent misses. Evaluate both the product and the collaboration: factual completeness, tone, format, assumptions, and whether Claude followed the requested process. This is the app-level version of the more formal dataset, grader, and regression approach covered in the API course.
