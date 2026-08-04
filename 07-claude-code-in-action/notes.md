# 07 · Claude Code in Action

Source: Claude Code in Action (Anthropic Academy) — official CCA-F prep course #7.
Bonus foundational background folded in from Claude Code 101 (not on the official list, but directly overlapping), marked **[Bonus]** below.

## [Bonus] What Claude Code is
- Direct access to your files, terminal, and entire codebase, acting as an AI agent — edits and executes directly, rather than requiring copy-paste between chat and editor.
- **AI Agent** (definition): software that interacts with its environment and performs actions to complete a defined goal — an LLM operating in a real-time loop, potentially with access to tools, external services, or other agents.
- **The agentic loop**: prompt in → Claude gathers context and gets text or a tool call from the model → takes action (edit file / run command) → verifies the result against the original intent → if achieved, stops and waits for the next prompt; if not, loops back and retries.
- Three core concepts: the **context window** (finite working memory — why it's "agentic," strategically finding info rather than loading everything), **permissions** (asks before edits/commands by default), and the fact it **can make mistakes** (stay in the loop to catch them early).

### [Bonus] Basic permission modes (Claude Code 101's 3-mode model — see the fuller 6-mode model below)
Cycled with Shift+Tab: **Approval mode** (asks every time), **Auto-accept** (file edits auto-approved, commands still need approval), **Plan mode** (read-only — no edits, just research and a plan).

### [Bonus] Explore → Plan → Code → Commit
The core recommended workflow:
- **Explore** — let Claude investigate the codebase before acting.
- **Plan** — the best place to course-correct, because it happens *before* any code is written; reviewing/revising a plan is far cheaper than reviewing and undoing code already written.
- **Code** — tips: define explicit success criteria upfront; add tools that help Claude verify its own work (e.g., Claude in Chrome for UI testing); provide a reliable test suite to validate against continuously.
- **Commit** — run a **subagent code review before committing** (fresh, unbiased context — no same-session bias from having just written the code); `/commit-push-pr` skill handles commit+push+PR in one step (can auto-post the PR link to Slack if an MCP server is configured in CLAUDE.md); `claude --from-pr <PR_NUMBER>` resumes a session linked to a specific PR, picking back up with full context.

## [Bonus] CLAUDE.md — the basic model
- Solves: without it, Claude Code re-explores your codebase from scratch every session and makes assumptions.
- Automatically read every session; contents are appended to your prompt. Commit it to version control so the team benefits.
- Basic hierarchy (Claude Code 101): **Project-level** (root dir, shared with team) and **User-level** (your config folder, personal, all projects). See the fuller 4-location model below.
- Tips: save corrections to memory when you repeatedly correct the same thing; reference other docs with `@README.md` syntax; **start without one** so you see where you actually need to course-correct, keeping it compact; `/init` generates one for you.

## [Bonus] Subagents (Claude Code 101 introduction)
- A delegated task runs in its own **isolated context window in parallel** with the main agent, returning only a **summary** — keeps the main context clean of the exploration trail.
- Create via `/agents` → "Create new agent"; Claude auto-generates name/description/prompt (the description also determines when Claude invokes it for future prompts).
- Preloading a skill into a subagent via the `skill` key loads the **entire** skill content immediately — unlike the main conversation, where skills load progressively (name+description first).

## [Bonus] MCP and Hooks — the basic model
- Add an MCP server: `claude mcp add`. Two transport types: **HTTP** (remote/hosted) and **Stdio** (local process). Manage in-session with `/mcp`.
- **Scoping**: Local (just you, this project) / User (all your projects) / Project (`.mcp.json` committed to repo — whole team gets identical servers automatically).
- **Context cost**: server tool definitions load into context even when unused — disable what's unused; prefer a CLI equivalent (`gh`, `aws`) if one exists; a Skill may be lighter-weight. **Auto-switches to "tool search mode" if MCP tools exceed 10% of context window** (discovers on demand, less reliably).
- **Hooks — key distinction**: hooks **always run** (deterministic code), unlike CLAUDE.md instructions, which are guidance Claude "usually" follows. Basic five events: `PreToolUse` (before a call — can block it), `PostToolUse` (after — e.g., auto-format), `UserPromptSubmit` (on submission), `Stop` (when Claude finishes), `Notification`. Basic exit codes: `0` = proceed, `2` = block + feed stderr back to Claude as feedback, any other code = non-blocking error shown to you. Project-level hooks live in `.claude/settings.json`, checked into the repo; use `$CLAUDE_PROJECT_DIR` for portable script paths.
- Rule of thumb: **if it must happen every time without fail, it belongs in a hook, not a prompt.**

## Steering long sessions
Two habits: **scope the work before Claude starts**, **steer it while it runs**.
- **Compact with direction**: `/compact <instructions>` — text after the command shapes what the summary keeps (e.g., `/compact Focus on the --version flag implementation`). Risk without steering: important details can get dropped.
- **`/clear`** wipes everything, starts fresh (no memory of prior session) — use when starting a new feature to avoid old-conversation bias bleeding in; use `/compact` mid-feature when you need to keep going. `/context` shows a breakdown of what's consuming your context window.
- **Rewind menu**: double-tap Escape on an empty prompt. Every user prompt creates a checkpoint. Options: Restore code and conversation / Restore conversation only / Restore code only / Summarize from here / Summarize up to here (compress before, keep recent implementation intact).
- **`/goal`**: sets a completion condition; Claude works across turns until a fast evaluator confirms it's met. **Constraint: the evaluator only reads the transcript** — your condition must be checkable from Claude's own output (like test results), not external state. `/goal clear` cancels it.
- **`/loop`**: runs a prompt on an interval between turns — good for polling external state (CI run, deploy) and acting on change. Stop with Escape.
- **Worktrees**: give each parallel agent session its own independent file tree so simultaneous sessions on the same repo don't clobber each other's changes. Auto-removed on session exit. `.worktreeinclude` lists git-ignored files (env vars, local config) to copy into every new worktree.
- **Being specific in prompts saves context** — a vague prompt forces more exploration/reasoning, which costs *more* context than a detailed prompt would have.
- **Subagents** run in a separate context window and return only a summary — ideal for "where is X" questions where you only need the answer.

## A CLAUDE.md that Claude actually follows (fuller model)
- **CLAUDE.md is guidance, not enforced configuration** — every line competes with every other line for attention; longer files mean lower per-rule compliance. Keep it lean.
- **Hard rules (must never be crossed) belong in hooks, not CLAUDE.md** — a hook can actually block an action; CLAUDE.md can only ask nicely.
- **Four locations, all loaded together at launch, stacking**:
  1. **Managed policy** — org-level, controlled by platform team, cannot be excluded (always in play).
  2. **User** — personal preferences, follows you across all projects.
  3. **Project** — shared with the team, checked into the repo.
  4. **Local** — git-ignored, personal notes for this one repo only (e.g., in-progress architectural decisions on your branch).
- **Imports** (`@.claude/conventions/code-style.md`) organize a big file into pieces — but Claude Code **expands them inline at launch**, so imports help organization, NOT context size.
- **Phrasing that sticks**: be specific and checkable; name the replacement, don't just ban ("Use named exports" vs. "Don't use default exports"); **emphasis is a budget** — overusing "IMPORTANT"/"YOU MUST" makes all of it meaningless, spend it on 2-3 rules that really matter; treat the file as living code — a wrong Claude action is a bug report against CLAUDE.md, fix the file.

## Verification skills
- Build a **verification skill first** — the highest-leverage skill to automate, because manual checking depends on you remembering to ask for it every time.
- Shape: triggered automatically (description matches the situation) → runs the test suite → reads the diff → **checks tests weren't weakened just to pass** → reports pass/fail with evidence.
- "Done" = gates run and observed with results stated explicitly, not "the code looks right" from a diff read alone.
- Skill folders can hold more than `skill.md`: a `reference.md` for detailed material (only read when needed) and **executable scripts** (Claude runs them rather than loading their contents into context).
- **Which surface owns which rule**: always-true conventions → CLAUDE.md. Task-specific procedures → a skill. Rules that must never be skippable → a hook.

## Permission modes — the full six
Cycle the everyday ones with Shift+Tab: Manual, Accept edits, Plan, Auto.
1. **Manual** — reads only without prompting; everything else asks first.
2. **Accept edits** — reads, file edits, and common filesystem bash commands run without asking; good for iterating on code you review after the fact.
3. **Plan** — read-only; researches and proposes without editing.
4. **Auto** — accepts everything, but a **separate classifier model reviews each action before it runs**, checking *intent* (blocks production deploys, force-pushes, piping downloaded code into a shell, sending sensitive data externally, destroying session files) — it does **not** check correctness, so broken-but-safe code sails through. Pair with a Stop hook running tests for correctness.
5. **Don't ask** — only pre-approved tools run; everything else auto-denied, no prompt. For unattended pipelines (CI, scheduled jobs).
6. **Bypass permissions** — skips all checks (`--dangerously-skip-permissions`). **Only run inside an isolated container/VM.**

## Hooks — the deeper model
- ~30 hook events fire across a session; most-used: `PreToolUse` (enforcement primitive — can block a call before it runs), `PostToolUse` (after success — formatting/linting), `Stop` (Claude wants to end its turn — can refuse; paired `SubagentStop`), `PreCompact`/`PostCompact` (around compaction), `InstructionsLoaded` (audit what actually loaded from CLAUDE.md/rules), `SessionStart` (primes environment; use the `compact` matcher to re-inject context right after compaction — **not** `PostCompact`, which doesn't feed output back into the conversation).
- **PreToolUse JSON response** — key field `permissionDecision`: `allow` / `deny` / `ask` (a 4th value, `defer`, only applies to non-interactive `-p` runs). Can also return **`updatedInput`** to *rewrite* the call instead of blocking it (e.g., redact a secret out of a bash command and still let it run) — **`updatedInput` replaces the whole input object**, so echo back unchanged fields or lose them.
- **Exit codes**: `0` = success. `2` = blocking error, stderr fed back to Claude as context (works almost everywhere, including blocking Stop). **Any other code (including 1) = non-blocking** — exit 1 does NOT block, a common mistake. `PostToolUse` fires after the tool already ran, so it's too late to block that call. `Notification` and `SessionStart` ignore blocking entirely.
- **Redact-instead-of-block pattern**: a PreToolUse Bash guardrail can detect a live secret pattern (e.g., `sk_live_`) and swap it for a placeholder via `updatedInput` — the command still runs, but the secret never makes it through.

## MCP inside Claude Code — deeper context-cost detail
- Every configured MCP server's tool definitions load into context regardless of use. If MCP tools exceed **10% of the context window**, Claude Code auto-switches to "tool search mode" (discovers tools on demand — less reliably).
- Mitigations: disable unused servers via `/mcp`; prefer a CLI equivalent if one exists (no persistent tool defs); a Skill can be a lighter-weight alternative (only name+description load until needed).
- **Tool design principle**: give Claude abstract, combinable tools — Claude Code's own toolset (`bash`, `read`, `write`, `edit`, `glob`, `grep`) is generic, not hyper-specialized, letting it combine primitives creatively.

## Automating repeat work: Routines vs. Headless vs. Agent SDK (a spectrum)
- **Routines** — a saved prompt + repo + connectors, run on **Anthropic's managed cloud infrastructure**; no server of yours, no workflow file to maintain. Triggers: cron schedule, HTTP POST to its endpoint, or a GitHub event. Create via claude.ai/code/routines or `/schedule <description>`. Constraints: **research preview**; recurring schedule runs **at most hourly**; each run starts from a **fresh clone of the default branch** and can only push to `claude/`-prefixed branches by default.
- **Headless mode (`-p` / `--print`)** — one-shot, no interactive UI, pipeable. **Skips auto-discovery of hooks, skills, plugins, MCP servers, and CLAUDE.md** — only explicitly allowed tools available (faster startup as a trade-off).
  - Structured output: `--output-format json` + `--json-schema '<schema>'` → result in `.structured_output`, pipe through `jq`.
  - Multi-step: capture `session_id`, resume with `claude --resume "$(jq -r .session_id ...)"`.
  - **`--bare`** = deterministic mode for CI — repeatable output run to run.
- **Agent SDK** — a library (TypeScript/Python) embedding Claude Code inside your own app; exposes a `query` function + same primitives as the CLI.
- **Decision guide**: routines = default for repeat work. Headless `-p` = when the job needs your own pipeline/scripting. `--bare` = when CI needs identical results every run. Agent SDK = when the work belongs inside your own product.

## GitHub Actions and Code Review
- **Code Review (managed)** — Anthropic-hosted via the Claude GitHub app; posts inline PR comments tagged by severity + a summary table, analyzed against the **full codebase**. Triggers: on PR open / on every push / only on `@claude review` comment. **Never approves or blocks a PR** — judgment stays human. **No managed autofix** — findings only; apply locally via `/code-review --fix`.
- **GitHub Action (`anthropics/claude-code-action@v1`)** — do-it-yourself, for anything beyond review. Setup: `/install-github-app` (needs repo admin). Key inputs: `trigger_phrase` (default `@claude`), `prompt`, `claude_args` (raw CLI args passed through — e.g., `--max-turns 5`).
- **Decision rule**: managed Code Review for PR review; the GitHub Action once the job needs to *do* something in CI, not just comment.

## Trust it: verifying unsupervised runs
- **Verify in proportion to how little you watched.** A quick glance suffices for a session you watched scroll by; an unattended/CI run needs a real, reconstructed check.
- Keep unattended runs in **auto mode**, not bypass-permissions — the classifier is still a safety net (though it only checks intent, not correctness).
- **Start with the diff, not the summary** — `/code-review` to flag issues, then your own eyes on `git diff`; a clean summary can hide an unexpectedly touched file.
- **Turn tests into a gate via a hook**, not a promise: a Stop hook that runs tests and refuses to end the turn on failure. Exit code 2 feeds failures straight back to Claude to self-fix.
- **Get a cold second opinion**: a fresh subagent/session with no memory of how the code was built, reviewing it — catches what the original session rationalized past.

## Plugins
- A **plugin** = one installable unit bundling skills, subagents, hooks, and MCP server configs — solves the "copy .claude files between machines" problem.
- Install: `/plugin install org-name@plugin-name` then `/reload-plugins`. Teams: `/plugin marketplace add your-org/claude-plugins` centralizes discovery/versioning/updates.
- **Security**: a plugin runs code on your machine with your privileges — its hooks fire on every matching tool call whether or not you read them. **"Reviewed" (automated community review) is not the same as "trusted"** — only install from sources you truly trust.
- **Components run alongside yours, not replacing them**: hooks *stack*. Skills/agents/commands are namespaced under the plugin name. A plugin's settings.json only honors two keys: the **agent** key (can promote a subagent to the main thread) and the subagent status line key.
- **Packaging your own**: same `.claude` directory shape (one folder per skill; one markdown file per subagent; `hooks/hooks.json`; `.mcp.json` at plugin root). Optional manifest `.claude-plugin/plugin.json` — `name` is the only required field (namespaces skills as `company-name:skill-name`).

## Course-derived operating checklist

### Match the control surface to the risk

- Start in **Plan mode** for unfamiliar or consequential work: inspect, ask questions, identify files and tests, and produce a plan before edits.
- Use an interactive implementation session when you need to steer frequently; use a routine or headless run only after the prompt, repository, connectors, permissions, and verification are explicit.
- Keep long sessions legible with /compact plus a direction, /context to inspect budget pressure, /clear when the task has changed, and rewind when an exploratory edit should be discarded.
- Use worktrees for parallel changes so each task has isolated files, branches, tests, and reviewable diffs.

### Put each rule in the right mechanism

- **CLAUDE.md** is for durable project conventions and always-on context: commands, architecture, naming, and definition-of-done rules. Keep wording specific and checkable; move mandatory enforcement into hooks.
- **Skills** are reusable procedures that load when relevant. A Skill folder can include instructions, references, and scripts. Build a verification Skill early when a project repeatedly needs the same build/test/diff/report loop.
- **Hooks** are deterministic enforcement points around tool calls and sessions. Use a hook for a rule that must not be skipped, not merely for advice that Claude may interpret.
- A CLAUDE.md file is not a substitute for tests, a hook, or a permission boundary. Instructions steer behavior; verification establishes evidence; permissions constrain capability.

### Permission and hook safety

The permission modes form a risk spectrum: Manual, Accept edits, Plan, Auto, Don't ask, and Bypass. Auto can classify whether an action matches the user's intent, but it does not prove the action is correct; pair unattended operation with a Stop hook, tests, and a reviewable diff. Don't ask and Bypass are for deliberately isolated contexts, not a default for sensitive repositories.

Hooks receive JSON event data and can allow, deny, ask, or defer a tool call. Exit 0 succeeds, exit 2 blocks and sends stderr back to Claude, and other nonzero exits are generally nonblocking. PreToolUse can replace the entire tool input through updatedInput, so a hook that redacts or rewrites input must preserve every field it still needs. PostToolUse is too late to prevent the action. SessionStart, including the compact matcher, is useful for reinjecting concise context.

### Automation and headless use

A routine is a prompt plus a repository and optional connectors, triggered by a schedule, HTTP request, or GitHub event. Preview it first; scheduled execution has a rate limit, and a fresh clone with a dedicated claude branch is a safer default than an unbounded long-lived workspace.

In headless mode, -p skips interactive discovery, so the prompt must provide the task and constraints. Use structured JSON output or a JSON schema when another system consumes the result, resume a session only when its context is still trustworthy, and use --bare when explicitly avoiding hooks, skills, MCP, and other project discovery. The Agent SDK query interface is the programmatic equivalent when an application needs to own the loop.

### Verification and trust

A reliable Claude Code workflow leaves evidence:

1. State the goal and success criteria.
2. Inspect the relevant code and plan the smallest change.
3. Make the change with the least privilege needed.
4. Run the relevant build, tests, lint, or type checks.
5. Review the diff and confirm tests were not weakened or deleted.
6. Report what was verified and what remains uncertain.
7. Ask a cold second opinion when the change is risky or the first session has accumulated too much context.

Managed GitHub Code Review can surface findings, but a human still decides whether to apply them. Plugins bundle skills, subagents, hooks, and MCP configuration; reviewed does not mean trusted, executable hooks stack with local hooks, and plugin components are namespaced rather than silently replacing project components.
