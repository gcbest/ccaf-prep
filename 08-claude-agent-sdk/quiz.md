# 08 · The Claude Agent SDK — Quiz

Questions first, answers below each `---` divider. Covers Domain 1 (Agentic Architecture & Orchestration, 27%), the in-SDK half of Domain 2 (Tool Design & MCP Integration, 18%), and the session/context half of Domain 5 (Context Management & Reliability, 15%).

---

### Q1. What does the Agent SDK take over that you wrote by hand in the Claude API course?
---
**A:** The agentic loop itself — checking `stop_reason`, dispatching tool calls, appending `tool_result` blocks, and re-calling until `end_turn`. You stop owning the mechanism and start owning policy: which tools exist, who may call them, when to stop, and what runs around each call.
*Memory hook:* You stop being the engine and start being the traffic law.

### Q2. What is the single mental model that explains why the SDK has permission modes, hooks, settings files, and CLAUDE.md loading?
---
**A:** The SDK spawns the Claude Code CLI as a subprocess and talks to it over a control protocol. Everything listed is a Claude Code feature exposed programmatically.
*Memory hook:* The SDK is a steering wheel bolted onto a car that already exists.

### Q3. Name the package for each language.
---
**A:** TypeScript: `@anthropic-ai/claude-agent-sdk`. Python: `claude-agent-sdk`.
*Memory hook:* Same engine, two ignition keys.

### Q4. What is the options type called in each SDK?
---
**A:** TypeScript: `Options`. Python: `ClaudeAgentOptions`.

### Q5. In Python, when should you use `ClaudeSDKClient` instead of `query()`?
---
**A:** When you need multiple exchanges in the same session context, or interrupts — that is, interactive applications like chat interfaces, or any case where the next action depends on Claude's response. `query()` creates a new session per call and does not support interrupts.
*Memory hook:* `query()` mails a letter; `ClaudeSDKClient` holds the phone line open.

### Q6. Which of `query()` and `ClaudeSDKClient` supports interrupts?
---
**A:** Only `ClaudeSDKClient`. Both support streaming input, hooks, and custom tools.

### Q7. What does `startup()` do in the TypeScript SDK, and why?
---
**A:** It pre-spawns the CLI subprocess and completes the initialize handshake before a prompt exists, returning a `WarmQuery`. This moves subprocess spawn and initialization cost off the critical path so the first real query resolves immediately. Default initialize timeout is 60,000 ms.
*Memory hook:* Preheat the oven while you're still shopping for ingredients.

### Q8. By default, does `query()` use Claude Code's system prompt?
---
**A:** No. Omitting `systemPrompt` gives you a **minimal** prompt. To get Claude Code's, pass `{ type: 'preset', preset: 'claude_code' }`, optionally with `append` to extend it.
*Memory hook:* The SDK hands you an empty stage, not Claude Code's whole set.

### Q9. What are the three `SettingSource` values and their locations?
---
**A:** `user` → `~/.claude/settings.json`; `project` → `.claude/settings.json` (version controlled); `local` → `.claude/settings.local.json` (gitignored).

### Q10. An SDK app is ignoring the project's CLAUDE.md. What's the most likely cause?
---
**A:** `settingSources` was set to `[]` or to a list that omits `"project"`. Project CLAUDE.md loads only when `"project"` is among the setting sources.
*Memory hook:* You unplugged the filing cabinet, then wondered where the files went.

### Q11. What is the Python-only `setting_sources` version gotcha?
---
**A:** In Python SDK **0.1.59 and earlier**, `setting_sources=[]` was treated the same as omitting the option, so it did **not** disable filesystem settings. The TypeScript SDK is unaffected.

### Q12. Why would a deployed product pass `settingSources: []`?
---
**A:** For reproducibility — so the agent's behavior can't shift because a developer edited their personal or local settings. Endpoint-managed policy still loads regardless.

### Q13. Name three ways to cap what a run costs you.
---
**A:** `maxTurns` (agentic round trips), `maxBudgetUsd` (stop at a client-side cost estimate), and `taskBudget: { total }` (alpha; an API-side token budget the model is told about so it can pace itself).

### Q14. What are the three ways to define a subagent, and which wins on a name collision?
---
**A:** Programmatically via the `agents` option; as markdown files in `.claude/agents/`; or the built-in `general-purpose` agent with no definition at all. **Programmatic definitions take precedence** over filesystem agents with the same name.

### Q15. Which two `AgentDefinition` fields are required?
---
**A:** `description` (natural-language *when to use this agent*) and `prompt` (its system prompt).
*Memory hook:* Who to call, and what to tell them.

### Q16. What does the `description` field actually control?
---
**A:** Automatic invocation. Claude matches the task against each subagent's description to decide which to spawn, so vague descriptions mean the subagent never gets used. Naming the agent explicitly in your prompt bypasses the matching.

### Q17. What happens if you omit `tools` from an `AgentDefinition`?
---
**A:** The subagent inherits **every** tool available to subagents. Listing tools restricts it to that subset.
*Memory hook:* Silence means "give them the whole keyring."

### Q18. If a tool is left out of a subagent's `tools` list, what does the subagent experience?
---
**A:** The tool isn't in its session at all — no permission prompt, no error. Claude simply works without it.

### Q19. What is the Python camelCase trap in `AgentDefinition`?
---
**A:** `AgentDefinition` keeps **camelCase** field names even in Python (`disallowedTools`, `permissionMode`, `maxTurns`, `mcpServers`, `initialPrompt`) because they map to the wire format shared with the TypeScript SDK. `ClaudeAgentOptions`, by contrast, uses snake_case. Passing a snake_case keyword to the `AgentDefinition` dataclass raises `TypeError` at construction.
*Memory hook:* One house, two dialects — the subagent speaks TypeScript's accent.

### Q20. What must a coordinator's `allowedTools` include to spawn subagents — on the exam, and in current code?
---
**A:** **On the exam: `"Task"`.** In current code: `"Agent"` — the tool was renamed in Claude Code v2.1.63. Current releases still report `"Task"` in the `system:init` tools list and in `result.permission_denials[].tool_name`, so detection code should match both names.
*Memory hook:* The exam guide was printed before the nameplate changed.

### Q21. Claude keeps doing the work itself instead of delegating to your subagent. Name three causes.
---
**A:** (1) The Agent tool isn't auto-approved — it isn't in `allowedTools`, so invocations fall through to `canUseTool` or get denied in `dontAsk` mode. (2) The prompt doesn't name the subagent explicitly. (3) The `description` is too vague for Claude to match the task against.

### Q22. What is the *only* content that crosses from parent to subagent?
---
**A:** The Agent tool's prompt string. The subagent gets its own system prompt and tool definitions, but none of the parent's conversation history, tool results, or system prompt.
*Memory hook:* You can't hand them your memory — only a note.

### Q23. How does a subagent receive findings from earlier research the coordinator did?
---
**A:** They must be explicitly written into its prompt. Subagents do not inherit the coordinator's history, don't share memory between invocations, and can't read the coordinator's memory files.

### Q24. What comes back from a subagent to its parent?
---
**A:** Only its **final message**, delivered as the Agent tool result. Intermediate tool calls and results stay inside the subagent — that's the context-isolation benefit. The parent may summarize that message unless instructed to preserve it verbatim.
*Memory hook:* You get the report, not the researcher's desk.

### Q25. Give the four benefits of subagents.
---
**A:** Context isolation (verbose work stays out of the main window), parallelization (independent subtasks finish in the time of the slowest, not the sum), specialized instructions (expertise that would be noise in the main prompt), and tool restrictions (a reviewer that can read but never write).

### Q26. Which subagent type does the exam name for preventing context exhaustion during a verbose multi-phase discovery?
---
**A:** The **Explore** subagent. It does the reading; only its summary lands in the main context.

### Q27. What changed about subagent execution in Claude Code v2.1.198?
---
**A:** Subagents run in the **background by default** — an Agent tool call omitting `run_in_background` launches a background subagent, and Claude sets `run_in_background: false` when it needs the result before continuing. Setting `background: true` on the definition forces background execution regardless. Subagents also began inheriting the main session's extended thinking configuration.

### Q28. How deep can subagents nest, and how do you change it?
---
**A:** Three layers below the main conversation by default. Set `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` to change it, or to `1` to turn nesting off.

### Q29. How do you detect that a subagent was actually invoked?
---
**A:** Look for `tool_use` blocks whose name is `"Agent"` (or `"Task"` on older versions). Messages originating inside a subagent carry a `parent_tool_use_id`. In Python you read blocks from `message.content`; in TypeScript from `message.message.content`, since the SDK message wraps the API message.

### Q30. In hub-and-spoke multi-agent orchestration, who owns inter-subagent communication and error handling?
---
**A:** The coordinator agent. Subagents don't talk to each other or poll a shared queue.
*Memory hook:* Spokes never touch — everything goes through the hub.

### Q31. Distinguish prompt chaining from dynamic decomposition, with an example of each.
---
**A:** **Prompt chaining** is a fixed sequential decomposition known up front — e.g. analyzing each file individually, then a separate cross-file integration pass. **Dynamic (adaptive) decomposition** generates subtasks from what each step discovers — suited to open-ended work like adding comprehensive tests to a legacy codebase, where dependencies surface as you go.
*Memory hook:* A recipe versus an investigation.

### Q32. Three subagents each complete successfully, but the final research report covers only one of three sub-topics. What's the root cause?
---
**A:** The **coordinator's task decomposition was too narrow** — it assigned three subtasks that all pointed at the same sub-topic. The subagents executed correctly within their (badly scoped) assignments. When every worker succeeds and the aggregate is wrong, look up the chain, not down.

### Q33. A web-search subagent times out. What should it return so the coordinator can recover intelligently?
---
**A:** A structured error naming what failed and how far it got. Not an empty result marked successful (which hides the failure), and not a generic "search unavailable" after silently exhausting retries (which discards the information the coordinator needs to decide).

### Q34. Why prefer a programmatic prerequisite gate over a prompt instruction for "verify identity before issuing a refund"?
---
**A:** It guarantees deterministic compliance. Prompt instructions are probabilistic and carry a non-zero failure rate; a hook is code that runs every time.
*Memory hook:* A locked door beats a polite sign.

### Q35. Production data shows the agent skips `get_customer` in 12% of cases and calls `process_refund` anyway. What's the fix?
---
**A:** A programmatic prerequisite that blocks `lookup_order` and `process_refund` until identity verification has run. Few-shot examples showing correct ordering only reduce the failure rate; they don't eliminate it.

### Q36. List the Python `HookEvent` values.
---
**A:** `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact`, `Notification`, `SubagentStart`, `PermissionRequest`. The TypeScript SDK supports additional events beyond these.

### Q37. What are the three parts of a Python `HookMatcher`, and what are the default timeouts?
---
**A:** `matcher` (a tool name or pattern like `"Bash"` or `"Write|Edit"`; omit to match everything), `hooks` (the list of callbacks), and `timeout` in seconds. Defaults: **600 seconds** for most events, **30 seconds** for `UserPromptSubmit`.

### Q38. Which fields does a `PreToolUse` hook use to make a decision, and what values can it return?
---
**A:** `hookSpecificOutput.permissionDecision` — one of **allow / deny / ask / defer** — plus `permissionDecisionReason`.

### Q39. Which hook event blocks via a top-level `decision` field instead of `hookSpecificOutput`?
---
**A:** `PostToolUse`, `PostToolUseFailure`, `UserPromptSubmit`, `Stop`, `SubagentStop`, and `PreCompact` all use top-level `decision: "block"` with a `reason`.

### Q40. Several MCP tools return timestamps in different formats — Unix epoch, ISO 8601, `MM/DD/YYYY`. Which hook normalizes them, and why that one?
---
**A:** A **`PostToolUse`** hook. It intercepts tool *results* and transforms them before the model processes them. `PreToolUse` fires too early — the data doesn't exist yet.
*Memory hook:* Pre guards the exit; Post cleans the entrance.

### Q41. What hook pattern blocks a `process_refund` call over $500 and redirects to human escalation?
---
**A:** A tool call interception hook — `PreToolUse`, returning `permissionDecision: "deny"` with a reason (or rewriting the call via `updatedInput`). It fires before the call executes, which is the only place a block is still possible.

### Q42. How does a hook rewrite a tool's arguments before it runs, versus inject information for Claude to read?
---
**A:** `PreToolUse` returns `updatedInput` directly under `hookSpecificOutput` to replace the tool's arguments. `PostToolUse` returns `additionalContext` to push a string into Claude's context, wrapped in a system reminder and placed next to the tool result. `additionalContext` is capped at 10,000 characters; longer output is written to a file and replaced with a preview and path.

### Q43. When is `canUseTool` actually invoked — and what should you use instead to gate *every* call?
---
**A:** Only when the permission flow resolves to a **prompt**. Calls auto-approved by `allowedTools`, a settings allow rule, or a permissive `permissionMode` like `acceptEdits` or `bypassPermissions` never reach it. To gate every tool call unconditionally, use a **`PreToolUse` hook**.
*Memory hook:* `canUseTool` is the doorbell; the hook is the doorframe.

### Q44. Which calls reach `canUseTool` even when an allow rule matches?
---
**A:** `AskUserQuestion`, MCP tools marked `requiresUserInteraction`, and connector tools an organization set to `ask`. In `dontAsk` mode those are denied outright instead of prompting.

### Q45. What are the two shapes of a `PermissionResult`?
---
**A:** `{ behavior: "allow", updatedInput?, updatedPermissions? }` and `{ behavior: "deny", message, interrupt? }`.

### Q46. Name the six permission modes.
---
**A:** `default`, `acceptEdits`, `plan`, `dontAsk`, `bypassPermissions`, `auto`.

### Q47. Distinguish `dontAsk` from `bypassPermissions`.
---
**A:** `dontAsk` never prompts and **denies** anything not pre-approved — safe for unattended pipelines where a prompt would hang. `bypassPermissions` **skips** checks entirely (though explicit ask rules still prompt) and requires `allowDangerouslySkipPermissions: true`.
*Memory hook:* One locks the door and answers "no"; the other removes the door.

### Q48. Does `allowedTools` restrict Claude to only those tools?
---
**A:** No — this is the common misreading. `allowedTools` **auto-approves** the listed tools; unlisted tools fall through to `permissionMode` and `canUseTool` rather than being blocked. Use `disallowedTools` to actually block.

### Q49. What's the difference between `disallowedTools: ["Bash"]` and `disallowedTools: ["Bash(rm *)"]`?
---
**A:** The bare name removes the tool from Claude's context entirely. The scoped rule leaves `Bash` available and denies matching calls **in every permission mode, including `bypassPermissions`.**

### Q50. What does `createSdkMcpServer()` give you that the MCP course's stdio servers don't?
---
**A:** An MCP server running **in the same process as your application** — no subprocess, no stdio transport, no separate deployment or lifecycle to manage.
*Memory hook:* The tool shop moves inside the house.

### Q51. How does `tool()` differ between the TypeScript and Python SDKs?
---
**A:** TypeScript's is a **function**: `tool(name, description, inputSchema, handler, extras?)`, with a Zod schema and the handler as the fourth argument. Python's is a **decorator**: `@tool(name, description, input_schema, annotations?)`, where the decorated `async def f(args)` is the handler and the schema is a simple type map like `{"a": float}` or full JSON Schema. The `extras` bag — `searchHint` and `alwaysLoad` — is TypeScript-only; Python passes `annotations` as its fourth positional argument.
*Memory hook:* Same tool, worn as a jacket in TypeScript and as a hat in Python.

### Q52. Name the four `ToolAnnotations` hints and their defaults — and the caveat.
---
**A:** `readOnlyHint` (false), `destructiveHint` (**true**), `idempotentHint` (false), `openWorldHint` (**true**), plus `title`. The caveat: they are behavioral **hints** only, and clients should not rely on them for security decisions.

### Q53. What does `strictMcpConfig: true` do?
---
**A:** Uses only the servers passed in `mcpServers`, ignoring project `.mcp.json`, user settings, plugin-provided servers, and claude.ai connectors — so the tool surface is reproducible in production.

### Q54. What does `toolAliases` do?
---
**A:** Maps a built-in tool name to an MCP tool so Claude calls your implementation instead, e.g. `{ Bash: 'mcp__workspace__bash' }`.

### Q55. An agent keeps confusing two similarly-named tools. What's the most effective first fix?
---
**A:** Expand each tool's **description** with input formats, example queries, edge cases, and boundary explanations. The description is the primary mechanism the model uses to select a tool. Few-shot examples treat the symptom; merging the tools discards a real distinction.
*Memory hook:* Fix the label before you rearrange the shelf.

### Q56. Of `isError`, `errorCategory`, and `isRetryable` — which is a real protocol field?
---
**A:** Only **`isError`**, the MCP flag that signals a tool call failed. `errorCategory` and `isRetryable` are **design conventions** you put in your own error payload — the exam names them as vocabulary, but you won't find them in the SDK types.
*Memory hook:* One is standard issue; two are things you bring yourself.

### Q57. Why return an `errorCategory` instead of a generic "Operation failed"?
---
**A:** So the agent can choose the right recovery action — transient, validation, business, and permission failures each call for a different next move — instead of guessing from prose.

### Q58. What does `isRetryable: false` on a business error tell the agent?
---
**A:** Don't retry. Explain the business-rule violation instead. Retrying a rule violation just burns turns to reach the same refusal.

### Q59. What does `forkSession` do, and what must accompany it?
---
**A:** Used **with `resume`**, it branches to a new session ID instead of continuing the original. On its own it means nothing — there's no session to fork from.

### Q60. You want to compare two implementation strategies against the same expensive codebase analysis. What do you use?
---
**A:** `fork_session` / `forkSession`. Both branches inherit the shared analysis baseline and then diverge independently, with neither contaminating the other. `--resume` alone would append both explorations to one timeline.
*Memory hook:* One trunk, two branches — not one increasingly confused trunk.

### Q61. What does `--resume <session-name>` do?
---
**A:** Continues a specific named prior conversation. It doesn't fork, compact, or start fresh.

### Q62. What does `persistSession: false` cost you?
---
**A:** The session isn't written to disk, so it can't be resumed later.

### Q63. Name the SDK's context-management levers.
---
**A:** Automatic compaction (with a `PreCompact` hook and a compact-boundary message in the stream), delegation to subagents so verbose work never enters the main window, `enableFileCheckpointing` for rewinding file changes, and context-usage reporting of `totalTokens` against `maxTokens`.

### Q64. An agent achieves 55% first-contact resolution against an 80% target, escalating cases it could have handled and pushing on cases it should have escalated. What's the fix?
---
**A:** Add explicit escalation criteria to the system prompt **with few-shot examples demonstrating them.** The failure is judgment about when to hand off, not tool wiring or model capacity.

### Q65. Your agent reports 97% overall accuracy but a specific document type fails constantly. What's the lesson?
---
**A:** Aggregate metrics mask per-category failure. Evaluate by category, not just in total.
*Memory hook:* An average temperature of comfortable can still mean one room is on fire.

### Q66. How do you make "the tests must have run" a condition rather than a request?
---
**A:** A `Stop` hook that runs the suite and returns `decision: "block"` with a reason on failure — Claude cannot end its turn until it's satisfied. Asking the model whether it ran the tests is not evidence.

### Q67. For a command hook (a shell script from a settings file), what does exit code 2 do — and what happens to stderr on exit 0?
---
**A:** Exit 2 blocks the action and feeds stderr back to Claude, which can read it and react. Stderr from a hook that exits 0 goes only to the debug log; Claude never sees it.

### Q68. When do you reach past subagents for the `Workflow` tool?
---
**A:** When a run coordinates dozens to hundreds of agents. `Workflow` moves orchestration into a script the runtime executes outside the conversation context, instead of turn-by-turn delegation. TypeScript SDK v0.3.149+.
