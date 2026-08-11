# 08 · The Claude Agent SDK

Source: the official Claude Agent SDK reference (`docs.claude.com/en/api/agent-sdk/` — TypeScript and Python references, plus the Subagents, Hooks, and Permissions guides), cross-checked against the CCA-F Exam Guide (v1.0, exam code CCAR-F).

**Why this folder exists.** Anthropic ships no prep course for the Agent SDK, but the exam guide names it in the first line of its scope statement and Domain 1 — *Agentic Architecture & Orchestration*, 27%, the heaviest domain on the exam — is almost entirely Agent SDK material. Folders 01–07 cover the seven official courses; this folder covers the gap between those courses and the exam blueprint. Terminology the exam uses that the courses never say out loud (`AgentDefinition`, `fork_session`, `isRetryable`, the Task tool) lives here.

**Where this sits relative to folder 03.** *Building with the Claude API* teaches the hand-rolled agentic loop: you call `messages.create`, inspect `stop_reason`, execute the tool yourself, append the result, and loop. That knowledge is still tested and still assumed. This folder is the delta: what the SDK owns once you stop writing that loop by hand.

---

## Part 1 — The SDK versus the hand-rolled loop

### What you stop writing
In folder 03 the loop is yours: check `stop_reason == "tool_use"`, dispatch the tool, append a `tool_result` block, call again, stop on `end_turn`. The Agent SDK runs that loop for you and hands you a stream of messages instead. What you own shifts from *mechanism* to *policy* — which tools exist, who may call them, when to stop, what happens around each call.

The mental model that explains most of the API: **the SDK spawns the Claude Code CLI as a subprocess and talks to it over a control protocol.** That single fact explains why the SDK has permission modes, hooks, settings files, CLAUDE.md loading, and subagents — they are Claude Code's features, exposed programmatically. It also explains `settingSources`, `pathToClaudeCodeExecutable`, and `spawnClaudeCodeProcess`.

### Installation and entry points

| | TypeScript | Python |
|---|---|---|
| Package | `@anthropic-ai/claude-agent-sdk` | `claude-agent-sdk` |
| One-off call | `query({ prompt, options })` | `query(prompt=..., options=...)` |
| Options type | `Options` | `ClaudeAgentOptions` |
| Returns | `Query` (an `AsyncGenerator<SDKMessage>` with extra methods) | `AsyncIterator[Message]` |
| Multi-turn client | *(use `query` with `resume`)* | `ClaudeSDKClient` |
| Pre-warm | `startup()` → `WarmQuery` | — |

**`query()` versus `ClaudeSDKClient` (Python).** The reference gives a comparison table worth memorizing:

| Feature | `query()` | `ClaudeSDKClient` |
|---|---|---|
| Session | New session by default | Reuses the same session |
| Conversation | Single exchange | Multiple exchanges in one context |
| Connection | Managed automatically | Manual control |
| Interrupts | ❌ Not supported | ✅ Supported |
| Streaming input, hooks, custom tools | ✅ | ✅ |
| Continue chat | Manual via `continue_conversation` or `resume` | Automatic |
| Use case | One-off tasks | Continuous conversations |

Rule of thumb: **if the next action depends on Claude's response, or you need to interrupt, use `ClaudeSDKClient`.** Otherwise `query()`.

`startup()` (TypeScript) pre-spawns the subprocess and completes the initialize handshake before a prompt exists, so the first real `query()` doesn't pay spawn cost inline. Default initialize timeout 60,000 ms.

### The system prompt is minimal by default
This trips people up. `query()` does **not** give you Claude Code's system prompt unless you ask for it:

- Omit `systemPrompt` → a minimal prompt.
- `systemPrompt: "..."` → your custom prompt.
- `systemPrompt: { type: 'preset', preset: 'claude_code' }` → Claude Code's full prompt.
  - `append: "..."` extends the preset.
  - `excludeDynamicSections: true` moves per-session context into the first user message for better prompt-cache reuse across machines.

### `settingSources` — what the SDK reads off disk
`SettingSource = "user" | "project" | "local"`:

| Value | Location |
|---|---|
| `user` | `~/.claude/settings.json` |
| `project` | `.claude/settings.json` (version controlled) |
| `local` | `.claude/settings.local.json` (gitignored) |

- **Omitted/`undefined`** → loads all three, same as the Claude Code CLI.
- **`[]`** → disables user, project, and local settings. Endpoint-managed policy still loads regardless.
- **To load project CLAUDE.md, `"project"` must be in `settingSources`.** This is the common bug: an SDK app that ignores CLAUDE.md usually passed `settingSources: []` or a list without `"project"`.
- ⚠️ Python-only gotcha: in SDK **0.1.59 and earlier**, `setting_sources=[]` was treated the same as omitting it, so it did *not* disable filesystem settings. TypeScript is unaffected.

For a deployed product you usually want `settingSources: []` — reproducible behavior that doesn't change because a developer edited their personal settings.

### Budgets and stopping
- `maxTurns` — maximum agentic turns (tool-use round trips).
- `maxBudgetUsd` — stop when the client-side cost estimate hits this USD figure.
- `taskBudget: { total }` *(alpha)* — API-side token budget; the model is told its remaining budget so it can pace itself and wrap up.
- `abortController` (TS) — cancellation.
- `outputFormat: { type: 'json_schema', schema }` — structured agent results.

---

## Part 2 — Subagents and multi-agent orchestration

### Three ways to define a subagent
1. **Programmatically** — the `agents` option on `query()`. Recommended for SDK apps.
2. **Filesystem** — markdown files in `.claude/agents/`. Programmatic definitions **take precedence** over filesystem agents with the same name.
3. **Built-in `general-purpose`** — Claude can spawn it with no definition at all.

### `AgentDefinition`

| Field | Required | Notes |
|---|---|---|
| `description` | **Yes** | Natural-language *when to use this agent*. This is what Claude matches against — write it specifically. |
| `prompt` | **Yes** | The subagent's system prompt. |
| `tools` | No | Allowed tool names. **Omit → inherits every tool available to subagents.** |
| `disallowedTools` | No | Removes tools. Accepts MCP patterns: `mcp__server`, `mcp__server__*`, `mcp__*`. |
| `model` | No | `'opus'`, `'sonnet'`, `'haiku'`, `'inherit'`, or a full ID. Omitted → main model. |
| `skills` | No | Skill names preloaded into the agent's context. |
| `memory` | No | `'user'` / `'project'` / `'local'`. |
| `mcpServers` | No | Server name or inline config. |
| `initialPrompt` | No | Auto-submitted first user turn **when the agent runs as the main thread agent**; ignored when invoked as a subagent. |
| `maxTurns` | No | Turn cap for this agent. |
| `background` | No | Force non-blocking background execution. |
| `effort` | No | `low` / `medium` / `high` / `xhigh` / `max` or an integer. |
| `permissionMode` | No | Per-agent permission mode. |

⚠️ **The Python camelCase trap.** `AgentDefinition` is a dataclass whose field names stay **camelCase** even in Python — `disallowedTools`, `permissionMode`, `maxTurns`, `mcpServers`, `initialPrompt` — because they map directly to the wire format shared with the TypeScript SDK. Passing `max_turns=` raises `TypeError` at construction. Meanwhile `ClaudeAgentOptions` *does* use snake_case (`disallowed_tools`, `permission_mode`, `max_turns`). Two objects, two conventions, one file.

### The tool that spawns subagents
Claude invokes subagents through a tool, and **that tool's name must be auto-approved or the delegation silently fails** — it falls through to `canUseTool`, or is denied outright in `dontAsk` mode.

- **Current SDK: the tool is `Agent`.** Put `"Agent"` in `allowedTools`.
- **It was renamed from `Task` in Claude Code v2.1.63.** Current releases still emit `"Task"` in the `system:init` tools list and in `result.permission_denials[].tool_name`, so detection code should match both.
- ⚠️ **The CCA-F Exam Guide (v1.0, July 2026) predates the rename and names the Task tool.** Glossary term t4 in `study-reference/` asks what a coordinator's `allowedTools` must include and keys the answer to `"Task"`. **On the exam, answer "Task."** In real code, write `"Agent"` and match both when parsing. This is the single largest course-versus-exam divergence in this folder.

### Context isolation — the most-tested subagent fact
A subagent's context window **starts fresh**. It does not inherit the parent's conversation history.

| The subagent receives | The subagent does **not** receive |
|---|---|
| Its own `AgentDefinition.prompt` | The parent's conversation history or tool results |
| The Agent tool's prompt string | The parent's system prompt |
| Project CLAUDE.md (only if loaded via `settingSources`) | Preloaded skill content, unless listed in `skills` |
| Tool definitions (inherited, or the `tools` subset) | |

**The only content that crosses from parent to subagent is the Agent tool's prompt string.** So any file path, error message, prior finding, or decision the subagent needs must be written into that prompt explicitly. Exam glossary t6 tests exactly this: *"How does a subagent receive context from prior research findings?"* → **findings must be explicitly included in its prompt.**

Coming back the other way: the parent receives the subagent's **final message** as the Agent tool result — intermediate tool calls and results stay inside the subagent. That is the whole point (a `research-assistant` can read fifty files without fifty files landing in the main context). The parent may summarize that final message in its own response; to preserve it verbatim, instruct the main query to do so.

### Why you'd reach for one
- **Context isolation** — verbose exploration stays out of the main window.
- **Parallelization** — independent subtasks finish in the time of the slowest, not the sum.
- **Specialized instructions** — expertise that would be noise in the main prompt.
- **Tool restrictions** — a doc reviewer with only `Read` and `Grep` cannot modify anything. A tool left out of `tools` isn't in the subagent's session at all: no permission prompt, no error, Claude just works without it.

Common combinations: read-only analysis `Read, Grep, Glob`; test execution `Bash, Read, Grep`; code modification `Read, Edit, Write, Grep, Glob`; full access → omit `tools`.

### Behaviors that changed in v2.1.198
- **Subagents run in the background by default.** An Agent tool call that omits `run_in_background` launches a background subagent; Claude sets `run_in_background: false` when it needs the result before continuing. Setting `background: true` on the definition forces background execution regardless.
- A subagent inherits the main session's extended thinking configuration.

Nesting: subagents can spawn subagents **three layers deep by default**; `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` changes it (`1` turns nesting off).

### Detecting and resuming
- Detect delegation: look for `tool_use` blocks named `"Agent"` (or `"Task"`). Messages from inside a subagent carry `parent_tool_use_id`.
- Python reads blocks via `message.content`; TypeScript via `message.message.content` (the SDK message wraps the API message).
- Resume: the Agent tool result contains a text block with `agentId: <id>`. Capture `session_id` and that `agentId`, then re-query with `resume: sessionId` and name the agent in the prompt. Built-in `Explore` and `Plan` agents are one-shot and return no `agentId`.
- Beyond a few agents per turn, the `Workflow` tool moves orchestration into a script run outside the conversation context (TS SDK v0.3.149+).

### Orchestration patterns the exam names
- **Hub-and-spoke** — a coordinator owns all inter-subagent communication, error handling, and routing. Subagents don't talk to each other. (Glossary t3.)
- **Prompt chaining** — fixed sequential decomposition, e.g. per-file analysis then a separate cross-file integration pass. Use when the steps are known up front. (t12.)
- **Dynamic / adaptive decomposition** — subtasks generated from what each step discovers. Use for open-ended investigation, e.g. "add tests to a legacy codebase." (t13.)

**The coordinator is usually the defect.** In the exam's multi-agent research scenario, three subagents each succeed but the report covers only one sub-topic — the root cause is the *coordinator's task decomposition being too narrow*, not subagent failure. When every worker succeeds and the aggregate is wrong, look up, not down.

---

## Part 3 — Hooks: programmatic control of the loop

### The principle the exam keeps testing
**Programmatic enforcement guarantees deterministic compliance; prompt instructions are probabilistic and have a non-zero failure rate.** (Glossary t9.) A hook is code that runs; a prompt is a request. If a rule must hold on every run including the ones nobody watches, it belongs in a hook.

This is the answer to the exam's most-quoted sample question: an agent skips `get_customer` in 12% of cases, and the fix is **a programmatic prerequisite that blocks `lookup_order` and `process_refund` until identity is verified** — not more few-shot examples.

### Hook events (Python `HookEvent`)
`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact`, `Notification`, `SubagentStart`, `PermissionRequest`. The TypeScript SDK supports additional events beyond these.

### Registering a hook
Hooks go in the `hooks` option, keyed by event, as a list of matchers. Python uses `HookMatcher`:

```python
HookMatcher(
    matcher="Bash",        # tool name or pattern, e.g. "Write|Edit"; omit to match all
    hooks=[my_callback],
    timeout=None,          # seconds; default 600, except UserPromptSubmit at 30
)
```

The callback signature is `(input, tool_use_id, context) -> HookJSONOutput`. Input is a discriminated union on `hook_event_name`. All hook inputs share `session_id`, `transcript_path`, `cwd`, and optional `permission_mode`; `PreToolUseHookInput` adds `tool_name`, `tool_input`, `tool_use_id`, and — when firing inside a subagent — `agent_id` and `agent_type`.

### Decision control, by event

| Events | Pattern | Key fields |
|---|---|---|
| `PreToolUse` | `hookSpecificOutput` | `permissionDecision`: **allow / deny / ask / defer**, plus `permissionDecisionReason` |
| `PostToolUse`, `PostToolUseFailure`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact` | top-level `decision` | `decision: "block"`, `reason` |
| `PermissionRequest` | `hookSpecificOutput` | `decision.behavior`: allow / deny |
| `SessionStart`, `SubagentStart` | context only | `additionalContext`; no blocking |
| `Notification`, `SessionEnd`, `PostCompact`, `InstructionsLoaded` | none | side effects only — logging, cleanup |

Rewriting rather than gating:
- **`PreToolUse` → `updatedInput`** (directly under `hookSpecificOutput`) replaces the tool's arguments before it runs.
- **`PostToolUse` → `additionalContext`** injects a string into Claude's context, wrapped in a system reminder, placed next to the tool result. Capped at 10,000 characters; longer output is written to a file and replaced with a preview and path.

A `PreToolUse` hook returning `permissionDecision: "defer"` produces `stop_reason: "tool_deferred"`, with the pending call in `deferred_tool_use` — that's how you surface an approval request in your own UI and resume later with the same `session_id`.

For **command** hooks (shell scripts from settings files), exit code 2 blocks the action and feeds stderr back to Claude. Stderr from a hook that exits 0 goes only to the debug log — Claude never sees it.

### The two exam-named hook patterns
- **Tool call interception hook** (glossary t11) — intercepts an *outgoing* call to enforce a business rule: block `process_refund` over $500 and redirect to human escalation. That's `PreToolUse` with `permissionDecision: "deny"` and a reason, or `updatedInput` to rewrite it.
- **`PostToolUse` normalization** (glossary t10) — intercepts *results* to transform them before the model reads them. The canonical case: several MCP tools return timestamps in different formats (Unix epoch, ISO 8601, `MM/DD/YYYY`); a `PostToolUse` hook normalizes them so the model never has to reconcile the mismatch. If a question says "different tools return inconsistent formats," the answer is `PostToolUse`, not better prompting.

Direction is the whole distinction: **`PreToolUse` guards what goes out, `PostToolUse` cleans what comes back.**

### Hooks versus `canUseTool` — a real distinction
`canUseTool` is the SDK replacement for the *interactive permission prompt*. It is invoked **only when the permission flow resolves to a prompt.** Calls already approved by `allowedTools`, a settings allow rule, or a permissive `permissionMode` (`acceptEdits`, `bypassPermissions`) never reach it.

> **To gate every tool call unconditionally, use a `PreToolUse` hook, not `canUseTool`.**

Exceptions that reach `canUseTool` even when allowed: `AskUserQuestion`, MCP tools marked `requiresUserInteraction`, and connector tools an org set to `ask`. In `dontAsk` mode those are denied instead of prompting.

`canUseTool` returns a `PermissionResult`:
```ts
{ behavior: "allow", updatedInput?, updatedPermissions? }
{ behavior: "deny",  message, interrupt? }
```

### Permission modes

| Mode | Behavior |
|---|---|
| `default` | Standard prompting behavior |
| `acceptEdits` | Auto-accept file edits |
| `plan` | Read-only; explore and propose without editing |
| `dontAsk` | Never prompt — deny anything not pre-approved |
| `bypassPermissions` | Skip checks (explicit ask rules still prompt); requires `allowDangerouslySkipPermissions: true` |
| `auto` | A model classifier approves or denies what would have been prompts |

**`allowedTools` does not restrict.** It auto-approves the listed tools; unlisted tools fall through to `permissionMode` and `canUseTool` rather than being blocked. To actually block, use `disallowedTools` — where a bare `"Bash"` removes the tool from Claude's context entirely, while a scoped rule like `"Bash(rm *)"` leaves the tool available and denies matching calls **in every mode, including `bypassPermissions`.**

---

## Part 4 — Tools and MCP inside the SDK

### In-process MCP servers
`createSdkMcpServer()` / `create_sdk_mcp_server()` builds an MCP server that runs **in the same process as your application** — no subprocess, no stdio transport, no separate deployment. This is the SDK's answer to "I need custom tools" and the main thing folder 06 doesn't cover, since that course builds external servers over stdio.

```ts
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const lookupOrder = tool(
  "lookup_order",
  "Look up an order by ID. Accepts a 12-character alphanumeric order ID (e.g. NS4417XQ2210). Returns status, line items, and refund eligibility. Use get_customer first if you only have an email address.",
  { orderId: z.string() },
  async ({ orderId }) => ({ content: [{ type: "text", text: await fetchOrder(orderId) }] }),
  { annotations: { readOnlyHint: true } }
);

const support = createSdkMcpServer({ name: "support", tools: [lookupOrder] });
```

⚠️ **`tool()` has a different shape in each language**, which the docs are easy to skim past:

| | TypeScript | Python |
|---|---|---|
| Form | A function returning a definition | A **decorator** on an async function |
| Signature | `tool(name, description, inputSchema, handler, extras?)` | `@tool(name, description, input_schema, annotations?)` |
| Schema | Zod (Zod 3 or 4) | Simple type map `{"a": float}` or full JSON Schema |
| Handler | Passed as the 4th argument | The decorated function itself, `async def f(args)` |
| Annotations | Inside `extras.annotations` | The 4th positional argument |

The TypeScript-only `extras` also carries `searchHint` (a one-line capability phrase shown in the deferred-tool list when tool search is active) and `alwaysLoad: true` (keep this tool's full schema in the initial prompt instead of deferring it). Both languages return `{"content": [{"type": "text", "text": ...}]}` from the handler, and both register servers the same way — `create_sdk_mcp_server(name=..., tools=[...])` / `createSdkMcpServer({ name, tools })` — then reference tools as `mcp__<server>__<tool>` in `allowedTools`.

`ToolAnnotations` are behavioral **hints**, not security controls — clients should not rely on them for security decisions: `title`, `readOnlyHint` (default false), `destructiveHint` (default **true**), `idempotentHint` (default false), `openWorldHint` (default **true**).

### Wiring servers in
- `mcpServers` — a record of configs. Four shapes: stdio, SSE, HTTP, and the in-process SDK server.
- `strictMcpConfig: true` — use only the servers passed in `mcpServers`, ignoring project `.mcp.json`, user settings, plugin servers, and claude.ai connectors. Reach for this when you need reproducible tool surfaces in production.
- `toolAliases` — map a built-in tool name to an MCP tool so Claude calls yours instead, e.g. `{ Bash: 'mcp__workspace__bash' }`.
- Per-subagent servers via `AgentDefinition.mcpServers`.

### Tool description design (Domain 2's core skill)
The tool **description is the primary mechanism the model uses to select a tool.** When an agent confuses two similar tools, the highest-leverage fix is expanding each description with input formats, example queries, edge cases, and boundary explanations — *not* adding few-shot examples, and not merging the tools. (Glossary t14; this is also exam sample question 2.)

The same principle appears in folder 06 from the other direction: enhance MCP tool descriptions so the agent stops preferring a built-in like `Grep` over your more capable MCP tool.

### Structured errors — exam terminology, author-defined fields
⚠️ Read this carefully, because the exam names three things and only one is an actual protocol field:

- **`isError`** — a real MCP field. It's how a tool result signals failure back to the calling agent. (Glossary t15.)
- **`errorCategory`** — **not** an SDK or MCP field. It's a *design convention*: you classify failures in your own error payload (transient / validation / business / permission) so the agent can pick the right recovery instead of guessing from prose. (t16.)
- **`isRetryable`** — likewise **your own field**, a boolean saying whether the operation can safely be retried. `isRetryable: false` on a business error means *don't retry — explain the business-rule violation instead.* (t17.)

The exam treats `errorCategory` and `isRetryable` as named concepts, so learn them as vocabulary; just don't go looking for them in the SDK types.

Related, from the subagent error-propagation scenario: when a subagent times out, the best result for coordinator recovery is a **structured error that names what failed and how far it got** — not an empty result marked successful, and not a generic "unavailable" string after silent retries. The coordinator can only make an intelligent recovery decision from information it actually receives.

---

## Part 5 — Sessions, context, and reliability

### Session control

| Option | Effect |
|---|---|
| `resume: "<id>"` | Resume a specific session by ID |
| `continue` / `continue_conversation` | Continue the most recent conversation |
| `forkSession` / `fork_session` | **Used with `resume`:** branch to a *new* session ID instead of continuing the original |
| `resumeSessionAt` | Resume at a specific message UUID |
| `sessionId` | Use a specific UUID instead of auto-generating |
| `persistSession: false` | Don't write to disk; session can't be resumed later |

**`forkSession` only means something alongside `resume`.** Without it, resuming appends to the original session; with it, you get an independent branch from the same baseline. That is exactly the exam's framing (glossary t7): *comparing two implementation strategies from the same codebase analysis* → **fork the session**, so both branches share the expensive analysis and diverge afterward without contaminating each other. Contrast t8: `--resume <session-name>` simply continues a specific named prior conversation.

Session utilities: `listSessions()`, `getSessionMessages()`, `getSessionInfo()`, `renameSession()`, `tagSession()`. `sessionStore` mirrors transcripts to an external backend so any host can resume them.

### Context management
- **Compaction** — the SDK compacts automatically; `PreCompact` fires before it and a compact-boundary message appears in the stream. `/compact` is the manual Claude Code equivalent (glossary t60).
- **Delegation is the primary context lever.** The Explore subagent exists to keep a verbose multi-phase discovery from exhausting the main window (t40) — the findings come back as a summary, the fifty files don't.
- `enableFileCheckpointing` enables rewinding file changes.
- The `SDKControlGetContextUsageResponse` reports `totalTokens` against `maxTokens`, where the window is the model's context window or the lower auto-compaction window when one applies.

### Reliability posture
- Cap the loop: `maxTurns`, `maxBudgetUsd`, `taskBudget`.
- `fallbackModel` for primary-model failure.
- Gate the outcome, don't ask for it: a `Stop` hook that runs the test suite and returns `decision: "block"` with a reason turns "did you run the tests?" into a condition Claude cannot end its turn without satisfying.
- Escalation criteria belong in the system prompt **with few-shot examples demonstrating them** — the exam's low-first-contact-resolution scenario resolves to exactly that, because the failure is judgment about when to hand off, not tool wiring.
- Beware aggregate metrics: 97% overall accuracy can mask a category that fails most of the time. Evaluate per-category.

---

## Confusable pairs (drill these)

| | |
|---|---|
| `Task` vs `Agent` | Exam says `Task`; SDK renamed it to `Agent` in v2.1.63 and still reports `Task` in `system:init` and `permission_denials` |
| `PreToolUse` vs `PostToolUse` | Guards what goes **out** vs normalizes what comes **back** |
| `canUseTool` vs `PreToolUse` hook | Only fires on a prompt vs fires on **every** call |
| `allowedTools` vs `disallowedTools` | Auto-approves (doesn't restrict) vs actually blocks |
| `resume` vs `forkSession` | Continue the same session vs branch a new one from the same baseline |
| `AgentDefinition` vs `ClaudeAgentOptions` (Python) | camelCase vs snake_case — mixing them raises `TypeError` |
| `isError` vs `isRetryable` | Real MCP field vs your own convention in the error payload |
| `bypassPermissions` vs `dontAsk` | Skip checks vs never prompt and deny anything unapproved |
| Prompt chaining vs dynamic decomposition | Fixed sequence known up front vs subtasks discovered per step |
| `tools` omitted vs `tools: []` | Inherits every available tool vs has none |

---

## Source and currency

Built from the official Agent SDK TypeScript and Python references and the Subagents, Hooks, and Permissions guides on `docs.claude.com`, read in August 2026. Exam-guide terminology is drawn from `study-reference/ccaf_study_reference.md` (Exam Guide v1.0, effective July 2026).

Where the shipping SDK and the exam guide disagree — most importantly the Task/Agent tool rename — this folder states both and marks which answer belongs on the exam. Version-gated behaviors are labeled with the Claude Code version that introduced them, since the SDK moves faster than the exam blueprint.
