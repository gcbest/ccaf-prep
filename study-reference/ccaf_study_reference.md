# CCA-F (Claude Certified Architect – Foundations) Study Reference

Source: Claude Certified Architect – Foundations Exam Guide, Version 1.0, effective July 2026, exam code CCAR-F.
This file is a machine-readable companion to the interactive quiz artifact. It contains the full glossary, quiz bank, scenario practice questions, and a progress-tracking template, all in a consistent format intended to be parsed and updated by agents (as well as read by humans).

Format conventions for parsers:
- Each glossary/quiz entry starts with a heading `### [id] Term Name` where `id` is a stable identifier (`t1`–`t64`).
- Each entry has fixed labeled fields: `Domain`, `Definition`, `Question`, lettered `Options`, and `Correct` (a single letter).
- Each scenario question starts with `### [id] Scenario Name` (`s1`–`s12`) and additionally has an `Explanation` field.
- The Progress Tracking Log section contains one markdown table per tracked item type. Agents updating progress should append/update rows there rather than altering the glossary/quiz content above.

---

## 1. Exam Overview

| Field | Value |
|---|---|
| Credential | Claude Certified Architect – Foundations |
| Exam code | CCAR-F |
| Items | 60 (multiple-choice / multiple-response) |
| Structure | 4 scenarios drawn from a bank of 6 |
| Time limit | 120 minutes |
| Passing score | 720 on a 100–1,000 scale |
| Validity | 12 months |

### Domain Weights

| # | Domain | Weight |
|---|---|---|
| 1 | Agentic Architecture & Orchestration | 27% |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

### Exam Scenario Bank (4 of 6 appear per exam)

1. Customer Support Resolution Agent — primary domains: 1, 2, 5
2. Code Generation with Claude Code — primary domains: 3, 5
3. Multi-Agent Research System — primary domains: 1, 2, 5
4. Developer Productivity with Claude — primary domains: 2, 3, 1
5. Claude Code for Continuous Integration — primary domains: 3, 4
6. Structured Data Extraction — primary domains: 4, 5

---

## 2. Glossary & Term Quiz Bank (64 terms)

### Domain 1: Agentic Architecture & Orchestration

### [t1] Agentic loop
- Domain: Agentic Architecture & Orchestration
- Definition: The cycle of sending a request to Claude, checking stop_reason, executing any requested tools, and returning results for the next iteration until the model ends its turn.
- Question: What defines the core control flow of an agentic loop?
  - A. Checking stop_reason and looping while it's "tool_use", stopping at "end_turn"
  - B. Parsing the assistant's text for phrases like "I'm done"
  - C. Running a fixed number of iterations regardless of model output
  - D. Stopping as soon as any tool call fails
- Correct: A

### [t2] stop_reason
- Domain: Agentic Architecture & Orchestration
- Definition: A response field indicating why generation stopped; "tool_use" means continue the loop, "end_turn" means the model is finished.
- Question: Which stop_reason value should trigger an agentic loop to terminate?
  - A. "tool_use"
  - B. "end_turn"
  - C. "max_tokens"
  - D. "stop_sequence"
- Correct: B

### [t3] Hub-and-spoke architecture
- Domain: Agentic Architecture & Orchestration
- Definition: A multi-agent pattern where a coordinator manages all inter-subagent communication, error handling, and information routing.
- Question: In hub-and-spoke multi-agent orchestration, who manages inter-subagent communication and error handling?
  - A. Each subagent independently
  - B. The coordinator agent
  - C. A shared queue subagents poll directly
  - D. The end user
- Correct: B

### [t4] Task tool
- Domain: Agentic Architecture & Orchestration
- Definition: The Agent SDK mechanism for spawning subagents; a coordinator's allowedTools must include "Task" to invoke them.
- Question: What must a coordinator's allowedTools include to spawn subagents?
  - A. "Spawn"
  - B. "Delegate"
  - C. "Task"
  - D. "Fork"
- Correct: C

### [t5] AgentDefinition
- Domain: Agentic Architecture & Orchestration
- Definition: Configuration for a subagent type, including its description, system prompt, and tool restrictions.
- Question: What does an AgentDefinition specify for a subagent?
  - A. Only its name
  - B. Description, system prompt, and tool restrictions
  - C. The coordinator's memory files
  - D. The user's billing tier
- Correct: B

### [t6] Subagent context isolation
- Domain: Agentic Architecture & Orchestration
- Definition: Subagents do not automatically inherit the coordinator's conversation history or share memory between invocations; context must be explicitly passed.
- Question: How does a subagent receive context from prior research findings?
  - A. It automatically inherits the coordinator's full history
  - B. Findings must be explicitly included in its prompt
  - C. It reads the coordinator's memory files directly
  - D. It shares a global memory object with other subagents
- Correct: B

### [t7] fork_session
- Domain: Agentic Architecture & Orchestration
- Definition: Creates an independent branch from a shared analysis baseline, for exploring divergent approaches from the same starting context.
- Question: When comparing two implementation strategies from the same codebase analysis, what should you use?
  - A. --resume
  - B. fork_session
  - C. /compact
  - D. A new CLAUDE.md file
- Correct: B

### [t8] --resume <session-name>
- Domain: Agentic Architecture & Orchestration
- Definition: CLI mechanism for continuing a specific named prior conversation/session.
- Question: What does --resume <session-name> do?
  - A. Starts a brand-new session with no history
  - B. Continues a specific named prior conversation
  - C. Forks a session into two branches
  - D. Compacts the current session's context
- Correct: B

### [t9] Programmatic enforcement vs. prompt guidance
- Domain: Agentic Architecture & Orchestration
- Definition: Programmatic enforcement (hooks, gates) guarantees compliance deterministically; prompt instructions alone are only probabilistic and have a non-zero failure rate.
- Question: Why prefer a programmatic prerequisite gate over a prompt instruction for "verify identity before refund"?
  - A. It's easier to write
  - B. It guarantees deterministic compliance instead of relying on probabilistic prompt-following
  - C. It requires no testing
  - D. It removes the need for tool descriptions
- Correct: B

### [t10] PostToolUse hook
- Domain: Agentic Architecture & Orchestration
- Definition: An Agent SDK hook that intercepts tool results to transform/normalize them (e.g., mixed date formats) before the model processes them.
- Question: Which hook pattern normalizes inconsistent timestamp formats returned by different MCP tools?
  - A. PreToolUse
  - B. PostToolUse
  - C. tool_choice
  - D. argument-hint
- Correct: B

### [t11] Tool call interception hook
- Domain: Agentic Architecture & Orchestration
- Definition: A hook that intercepts outgoing tool calls to enforce business rules, e.g. blocking refunds above a threshold and redirecting to escalation.
- Question: What hook pattern blocks a process_refund call exceeding $500 and redirects to human escalation?
  - A. A tool call interception hook
  - B. A PostToolUse hook
  - C. A few-shot example
  - D. A CLAUDE.md instruction
- Correct: A

### [t12] Prompt chaining
- Domain: Agentic Architecture & Orchestration
- Definition: A fixed, sequential task decomposition pattern — e.g., analyzing each file individually, then a separate cross-file integration pass.
- Question: Splitting a code review into "per-file analysis" then "cross-file integration" is an example of:
  - A. Dynamic adaptive decomposition
  - B. Prompt chaining
  - C. Hub-and-spoke orchestration
  - D. Fork-based session management
- Correct: B

### [t13] Dynamic / adaptive decomposition
- Domain: Agentic Architecture & Orchestration
- Definition: Task decomposition where subtasks are generated based on what's discovered at each step, suited to open-ended investigation.
- Question: Which decomposition strategy suits "add comprehensive tests to a legacy codebase"?
  - A. Fixed sequential prompt chaining
  - B. Dynamic decomposition that adapts as dependencies are discovered
  - C. A single monolithic prompt
  - D. Batch processing
- Correct: B

### Domain 2: Tool Design & MCP Integration

### [t14] Tool description
- Domain: Tool Design & MCP Integration
- Definition: The primary mechanism an LLM uses to select the right tool; minimal descriptions cause unreliable selection among similar tools.
- Question: What's the most effective first fix when an agent confuses two similarly-named tools?
  - A. Add a routing classifier
  - B. Expand each tool's description with input formats, examples, and boundaries
  - C. Merge them into one tool immediately
  - D. Add few-shot examples without touching descriptions
- Correct: B

### [t15] isError flag
- Domain: Tool Design & MCP Integration
- Definition: The MCP pattern for communicating tool call failure back to the calling agent.
- Question: How does an MCP tool signal that a call failed?
  - A. Returning an empty string
  - B. The isError flag
  - C. Throwing an uncaught exception only
  - D. Setting stop_reason to "tool_use"
- Correct: B

### [t16] errorCategory
- Domain: Tool Design & MCP Integration
- Definition: Structured classification of tool errors (transient, validation, business, permission) enabling the agent to choose the right recovery action.
- Question: Why return an errorCategory field instead of a generic "Operation failed" message?
  - A. It looks more professional
  - B. It lets the agent choose the right recovery action instead of guessing
  - C. It reduces token usage
  - D. It's required by JSON syntax
- Correct: B

### [t17] isRetryable
- Domain: Tool Design & MCP Integration
- Definition: Boolean flag indicating whether a failed operation can be safely retried, preventing wasted retry attempts.
- Question: What does isRetryable: false on a business error tell the agent?
  - A. Retry immediately with backoff
  - B. Don't retry — explain the business rule violation instead
  - C. Escalate regardless of context
  - D. The tool is permanently broken
- Correct: B

### [t18] tool_choice: "auto"
- Domain: Tool Design & MCP Integration
- Definition: tool_choice setting where the model may return text instead of calling a tool.
- Question: Which tool_choice setting allows Claude to respond with plain text instead of calling a tool?
  - A. "auto"
  - B. "any"
  - C. forced selection
  - D. None of these
- Correct: A

### [t19] tool_choice: "any"
- Domain: Tool Design & MCP Integration
- Definition: tool_choice setting that guarantees the model calls some tool, but lets it choose which one.
- Question: You want a tool guaranteed to be called, but the model can pick among several extraction schemas. Which tool_choice?
  - A. "auto"
  - B. "any"
  - C. {"type":"tool","name":"..."}
  - D. isError
- Correct: B

### [t20] Forced tool selection
- Domain: Tool Design & MCP Integration
- Definition: tool_choice: {"type": "tool", "name": "..."} forces the model to call one specific named tool.
- Question: How do you force Claude to call extract_metadata before any enrichment tools run?
  - A. tool_choice: "auto"
  - B. tool_choice: "any"
  - C. tool_choice: {"type":"tool","name":"extract_metadata"}
  - D. Add it as the first line in CLAUDE.md
- Correct: C

### [t21] .mcp.json
- Domain: Tool Design & MCP Integration
- Definition: Project-level MCP server configuration, shared with the team via version control.
- Question: Where do you configure an MCP server so the whole team shares it via version control?
  - A. ~/.claude.json
  - B. .mcp.json
  - C. CLAUDE.md
  - D. .claude/rules/
- Correct: B

### [t22] ~/.claude.json
- Domain: Tool Design & MCP Integration
- Definition: User-level MCP server configuration for personal or experimental servers, not shared with teammates.
- Question: Where should a personal, experimental MCP server live so it doesn't affect teammates?
  - A. .mcp.json
  - B. ~/.claude.json
  - C. .claude/commands/
  - D. argument-hint frontmatter
- Correct: B

### [t23] Environment variable expansion
- Domain: Tool Design & MCP Integration
- Definition: Syntax like ${GITHUB_TOKEN} in .mcp.json letting credentials be referenced without committing secrets.
- Question: How do you reference a credential in .mcp.json without committing the secret itself?
  - A. Hardcode it and .gitignore the file
  - B. Use environment variable expansion, e.g. ${GITHUB_TOKEN}
  - C. Store it in CLAUDE.md
  - D. Base64-encode it inline
- Correct: B

### [t24] MCP resources
- Domain: Tool Design & MCP Integration
- Definition: A mechanism for exposing content catalogs (issue summaries, doc hierarchies, schemas) to agents, reducing exploratory tool calls.
- Question: What MCP feature exposes a catalog of available content without needing exploratory tool calls?
  - A. MCP tools
  - B. MCP resources
  - C. isError flag
  - D. tool_choice
- Correct: B

### [t25] Grep (built-in tool)
- Domain: Tool Design & MCP Integration
- Definition: Built-in tool for searching file contents for patterns like function names, error messages, or imports.
- Question: Which built-in tool searches file contents for a specific function name across a codebase?
  - A. Glob
  - B. Grep
  - C. Read
  - D. Edit
- Correct: B

### [t26] Glob (built-in tool)
- Domain: Tool Design & MCP Integration
- Definition: Built-in tool for matching file paths by name/extension pattern (e.g. **/*.test.tsx).
- Question: Which tool finds all files matching **/*.test.tsx regardless of directory?
  - A. Grep
  - B. Glob
  - C. Bash
  - D. Write
- Correct: B

### [t27] Edit-fails fallback
- Domain: Tool Design & MCP Integration
- Definition: When Edit can't find a unique text anchor, Read the full file then Write the modified version instead.
- Question: Edit fails because the anchor text isn't unique in the file. What's the reliable fallback?
  - A. Give up and ask the user
  - B. Read the full file, then Write the modified version
  - C. Use Glob to find another file
  - D. Use Bash sed blindly
- Correct: B

### Domain 3: Claude Code Configuration & Workflows

### [t28] CLAUDE.md hierarchy
- Domain: Claude Code Configuration & Workflows
- Definition: Configuration loads from user-level (~/.claude/CLAUDE.md), project-level, and directory-level files.
- Question: A new teammate isn't receiving instructions everyone else has. Likely cause?
  - A. The instructions are in project-level CLAUDE.md
  - B. They're only in another dev's user-level ~/.claude/CLAUDE.md, which isn't shared
  - C. CLAUDE.md doesn't support hierarchies
  - D. The teammate needs a different model
- Correct: B

### [t29] @import syntax
- Domain: Claude Code Configuration & Workflows
- Definition: Syntax for referencing external files from CLAUDE.md to keep it modular (e.g., package-specific standards).
- Question: How do you keep CLAUDE.md modular by referencing external standards files per package?
  - A. Copy-paste each file's content in
  - B. Use @import syntax
  - C. Use .claude/commands/
  - D. Use tool_choice
- Correct: B

### [t30] .claude/rules/
- Domain: Claude Code Configuration & Workflows
- Definition: Directory of topic-specific rule files with YAML frontmatter path fields (glob patterns) for conditional, path-scoped loading.
- Question: Test files are scattered across many directories, but conventions should apply consistently regardless of location. Best approach?
  - A. A CLAUDE.md file in each directory
  - B. A .claude/rules/ file with paths: ["**/*.test.tsx"]
  - C. A single monolithic root CLAUDE.md
  - D. A custom slash command
- Correct: B

### [t31] /memory command
- Domain: Claude Code Configuration & Workflows
- Definition: Verifies which memory files are currently loaded, useful for diagnosing inconsistent behavior across sessions.
- Question: How do you check which CLAUDE.md / memory files are actually loaded in the current session?
  - A. /compact
  - B. /memory
  - C. --resume
  - D. argument-hint
- Correct: B

### [t32] .claude/commands/
- Domain: Claude Code Configuration & Workflows
- Definition: Project-scoped custom slash commands, shared via version control with the whole team.
- Question: Where should a /review slash command live so every developer gets it automatically on clone/pull?
  - A. ~/.claude/commands/
  - B. .claude/commands/
  - C. CLAUDE.md
  - D. .claude/config.json
- Correct: B

### [t33] ~/.claude/commands/
- Domain: Claude Code Configuration & Workflows
- Definition: User-scoped personal slash commands, not shared with teammates.
- Question: Where do personal, non-shared slash commands belong?
  - A. .claude/commands/
  - B. ~/.claude/commands/
  - C. .claude/rules/
  - D. .mcp.json
- Correct: B

### [t34] SKILL.md frontmatter
- Domain: Claude Code Configuration & Workflows
- Definition: Configuration for skills in .claude/skills/, supporting options like context: fork, allowed-tools, and argument-hint.
- Question: Which file defines a custom skill's behavior and frontmatter options?
  - A. CLAUDE.md
  - B. SKILL.md
  - C. .mcp.json
  - D. settings.json
- Correct: B

### [t35] context: fork
- Domain: Claude Code Configuration & Workflows
- Definition: Frontmatter option that runs a skill in an isolated sub-agent context so its verbose output doesn't pollute the main conversation.
- Question: A skill produces verbose analysis output you don't want cluttering the main conversation. What option isolates it?
  - A. allowed-tools
  - B. context: fork
  - C. argument-hint
  - D. --resume
- Correct: B

### [t36] allowed-tools (skill frontmatter)
- Domain: Claude Code Configuration & Workflows
- Definition: Restricts which tools a skill can use during execution, e.g. limiting to file-write operations only.
- Question: How do you prevent a skill from making destructive Bash calls while still letting it write files?
  - A. context: fork
  - B. allowed-tools restricted to file write operations
  - C. argument-hint
  - D. .claude/rules/
- Correct: B

### [t37] argument-hint
- Domain: Claude Code Configuration & Workflows
- Definition: Frontmatter that prompts developers for required parameters when a skill is invoked without arguments.
- Question: What frontmatter option prompts a user for missing required parameters when invoking a skill?
  - A. context: fork
  - B. argument-hint
  - C. allowed-tools
  - D. @import
- Correct: B

### [t38] Plan mode
- Domain: Claude Code Configuration & Workflows
- Definition: Mode for exploring a codebase and designing an approach before making changes; suited to complex, architectural, multi-file tasks.
- Question: You're restructuring a monolith into microservices across dozens of files. What should you use first?
  - A. Direct execution with detailed upfront instructions
  - B. Plan mode, to explore and design before committing
  - C. Skip exploration and iterate live
  - D. The Message Batches API
- Correct: B

### [t39] Direct execution
- Domain: Claude Code Configuration & Workflows
- Definition: Appropriate for simple, well-scoped changes like adding a single validation check to one function.
- Question: A single-file bug fix with a clear stack trace calls for:
  - A. Plan mode
  - B. Direct execution
  - C. fork_session
  - D. Message Batches API
- Correct: B

### [t40] Explore subagent
- Domain: Claude Code Configuration & Workflows
- Definition: Isolates verbose discovery/search output and returns a summary, preserving the main conversation's context budget.
- Question: Which subagent type prevents context exhaustion during a verbose multi-phase discovery process?
  - A. The Explore subagent
  - B. The coordinator agent
  - C. The synthesis agent
  - D. The escalation agent
- Correct: A

### [t41] Interview pattern
- Domain: Claude Code Configuration & Workflows
- Definition: Having Claude ask clarifying questions to surface considerations (e.g., cache invalidation strategy) before implementing, in unfamiliar domains.
- Question: Before implementing a caching layer in an unfamiliar domain, what pattern surfaces design considerations first?
  - A. The interview pattern — Claude asks questions first
  - B. Direct execution
  - C. Batch processing
  - D. tool_choice: "any"
- Correct: A

### [t42] -p / --print flag
- Domain: Claude Code Configuration & Workflows
- Definition: Runs Claude Code in non-interactive mode so it doesn't wait for user input — required for CI/CD pipelines.
- Question: A CI pipeline running `claude "review this PR"` hangs waiting for input. What flag fixes it?
  - A. --batch
  - B. -p / --print
  - C. --json-schema
  - D. --resume
- Correct: B

### [t43] --output-format json / --json-schema
- Domain: Claude Code Configuration & Workflows
- Definition: CLI flags that enforce machine-parseable structured output for CI-invoked Claude Code.
- Question: How do you get machine-parseable findings from Claude Code to post as inline PR comments?
  - A. --output-format json with --json-schema
  - B. -p alone
  - C. /compact
  - D. CLAUDE.md alone
- Correct: A

### Domain 4: Prompt Engineering & Structured Output

### [t44] Few-shot prompting
- Domain: Prompt Engineering & Structured Output
- Definition: Providing targeted examples (2-4) to demonstrate correct handling of ambiguous cases, improving consistency and reducing hallucination.
- Question: Prose instructions alone produce inconsistent output for an ambiguous classification task. Most effective fix?
  - A. Add few-shot examples showing correct judgment on ambiguous cases
  - B. Lengthen the prose instructions further
  - C. Lower max_tokens
  - D. Switch to tool_choice: "auto"
- Correct: A

### [t45] tool_use with JSON schema
- Domain: Prompt Engineering & Structured Output
- Definition: The most reliable way to get guaranteed schema-compliant structured output, eliminating JSON syntax errors (not semantic errors).
- Question: What technique guarantees schema-compliant output and eliminates JSON syntax errors?
  - A. Asking nicely in the prompt
  - B. tool_use with a JSON schema
  - C. Regex post-processing
  - D. Batch processing
- Correct: B

### [t46] Nullable / optional fields
- Domain: Prompt Engineering & Structured Output
- Definition: Schema fields marked optional so the model returns null instead of fabricating values when info is absent from the source.
- Question: A required schema field is sometimes missing from source documents, and the model invents values. What's the fix?
  - A. Make the field required with a default
  - B. Make the field nullable/optional
  - C. Remove tool_use entirely
  - D. Add examples of fabricated data
- Correct: B

### [t47] enum + "other" + detail pattern
- Domain: Prompt Engineering & Structured Output
- Definition: Schema design using an enum with an "other" option plus a free-text detail field for extensible categorization.
- Question: How do you handle categories that don't fit a fixed enum without breaking the schema?
  - A. Add every possible value to the enum
  - B. Use "other" + a detail string field alongside the enum
  - C. Make the field a raw string with no enum
  - D. Reject the document
- Correct: B

### [t48] Retry-with-error-feedback
- Domain: Prompt Engineering & Structured Output
- Definition: On validation failure, the follow-up request includes the original document, the failed extraction, and specific validation errors.
- Question: An extraction fails schema validation. What should the retry prompt include?
  - A. Just "try again"
  - B. The document, the failed extraction, and the specific validation errors
  - C. A completely new document
  - D. Nothing — switch models
- Correct: B

### [t49] detected_pattern field
- Domain: Prompt Engineering & Structured Output
- Definition: A structured field tracking which code construct triggered a finding, enabling analysis of false-positive dismissal patterns.
- Question: How can you systematically analyze which patterns cause developers to dismiss findings as false positives?
  - A. Manually re-read every review
  - B. Add a detected_pattern field to structured findings
  - C. Disable the review entirely
  - D. Increase max_tokens
- Correct: B

### [t50] Message Batches API
- Domain: Prompt Engineering & Structured Output
- Definition: Offers 50% cost savings with up to a 24-hour processing window but no guaranteed latency SLA; unsuitable for blocking workflows.
- Question: Which workflow is appropriate for the Message Batches API?
  - A. A blocking pre-merge check
  - B. An overnight technical debt report
  - C. Real-time customer chat
  - D. A synchronous tool-calling loop
- Correct: B

### [t51] custom_id
- Domain: Prompt Engineering & Structured Output
- Definition: Field used to correlate batch request/response pairs, enabling targeted resubmission of only failed items.
- Question: After a batch job partially fails, how do you resubmit only the failed documents?
  - A. Resubmit the entire batch
  - B. Identify failures by custom_id and resubmit only those
  - C. There's no way to correlate results
  - D. Switch to synchronous API for everything
- Correct: B

### [t52] Multi-pass review
- Domain: Prompt Engineering & Structured Output
- Definition: Splitting a large review into per-file local-analysis passes plus a separate cross-file integration pass to avoid attention dilution.
- Question: A single-pass review of a 14-file PR gives inconsistent, contradictory feedback. What's the fix?
  - A. Use a bigger context window in one pass
  - B. Split into per-file passes plus a separate cross-file integration pass
  - C. Require smaller PRs from developers
  - D. Run 3 passes and require majority vote
- Correct: B

### [t53] Independent review instance
- Domain: Prompt Engineering & Structured Output
- Definition: A separate Claude instance without the generator's reasoning context, more effective at catching issues than self-review.
- Question: Why is a second, independent Claude instance better at catching bugs than self-review?
  - A. It's cheaper
  - B. The generator retains its own reasoning and is less likely to question its decisions
  - C. Self-review is technically impossible
  - D. Independent instances have larger context windows
- Correct: B

### Domain 5: Context Management & Reliability

### [t54] Lost in the middle effect
- Domain: Context Management & Reliability
- Definition: Models reliably process information at the beginning and end of long inputs but may omit findings buried in the middle.
- Question: Why might a synthesis agent miss a key finding buried in the middle of a long aggregated input?
  - A. The finding was formatted incorrectly
  - B. The "lost in the middle" effect — models attend less to middle content
  - C. The finding used the wrong JSON schema
  - D. Batch processing dropped it
- Correct: B

### [t55] Case facts block
- Domain: Context Management & Reliability
- Definition: A persistent block of extracted transactional facts (amounts, dates, order numbers) included in every prompt, kept outside summarized history.
- Question: How do you prevent numeric details from being lost during progressive summarization?
  - A. Summarize more aggressively
  - B. Extract them into a persistent "case facts" block included in every prompt
  - C. Remove them from context entirely
  - D. Store them only in the final message
- Correct: B

### [t56] Escalation triggers
- Domain: Context Management & Reliability
- Definition: Valid triggers include explicit customer requests for a human, policy gaps/exceptions, and inability to make progress — not sentiment or self-confidence.
- Question: Which is a valid, reliable trigger for escalating to a human agent?
  - A. The customer sounds frustrated (sentiment)
  - B. The agent's self-reported confidence dropped
  - C. The request falls into a policy gap the rules don't address
  - D. The case took longer than 2 minutes
- Correct: C

### [t57] Structured error context
- Domain: Context Management & Reliability
- Definition: Includes failure type, what was attempted, partial results, and alternative approaches, enabling intelligent coordinator recovery.
- Question: A subagent times out. What should it return to enable a good coordinator recovery decision?
  - A. A generic "search unavailable" status
  - B. Structured context: failure type, attempted query, partial results, alternatives
  - C. An empty result marked as success
  - D. Nothing — let the exception propagate
- Correct: B

### [t58] Scratchpad files
- Domain: Context Management & Reliability
- Definition: Files where an agent records key findings during long exploration sessions, referenced later to counteract context degradation.
- Question: During a long exploration, the agent gives inconsistent answers about classes found earlier. What helps?
  - A. Restarting from scratch every time
  - B. Maintaining scratchpad files recording key findings to reference later
  - C. Increasing max_tokens indefinitely
  - D. Switching to batch processing
- Correct: B

### [t59] Manifest (crash recovery)
- Domain: Context Management & Reliability
- Definition: Structured state export from each agent to a known location; the coordinator loads this manifest on resume to recover from a crash.
- Question: How do you design a multi-agent system to recover cleanly after a mid-workflow crash?
  - A. Restart the entire pipeline from the beginning
  - B. Each agent exports state to a known location; coordinator loads a manifest on resume
  - C. Ignore the crash and continue
  - D. Use fork_session exclusively
- Correct: B

### [t60] /compact
- Domain: Context Management & Reliability
- Definition: Reduces context usage during extended sessions when context fills with verbose discovery output.
- Question: Context is filling up with verbose exploration output mid-session. What reduces usage without starting over?
  - A. /compact
  - B. /memory
  - C. --resume
  - D. fork_session
- Correct: A

### [t61] Stratified random sampling
- Domain: Context Management & Reliability
- Definition: Sampling across document types/segments to measure error rates in high-confidence extractions, since aggregate accuracy can mask poor segment performance.
- Question: Overall accuracy is 97%, but you suspect it masks poor performance on one document type. What technique reveals this?
  - A. Trust the aggregate number
  - B. Stratified random sampling across document types/fields
  - C. Increase the confidence threshold
  - D. Switch to the Batches API
- Correct: B

### [t62] Field-level confidence scores
- Domain: Context Management & Reliability
- Definition: Model-output confidence per field, calibrated against labeled validation sets, used to route low-confidence extractions to human review.
- Question: How do you decide which individual extracted fields need human review?
  - A. Route the whole document based on one overall score
  - B. Use field-level confidence scores calibrated with labeled validation data
  - C. Always require 100% human review
  - D. Never review anything above 90% aggregate accuracy
- Correct: B

### [t63] Claim-source mapping
- Domain: Context Management & Reliability
- Definition: Structured attribution linking each claim to its source (URL, document, excerpt) that must be preserved through synthesis.
- Question: How do you preserve source attribution when synthesis combines findings from multiple subagents?
  - A. Summarize freely and drop source metadata
  - B. Require structured claim-source mappings preserved through synthesis
  - C. Cite only the first source found
  - D. Merge all sources into one generic citation
- Correct: B

### [t64] Conflict annotation
- Domain: Context Management & Reliability
- Definition: When sources disagree on a statistic, annotate the conflict with source attribution rather than arbitrarily picking one value.
- Question: Two credible sources report different statistics for the same metric. What should synthesis do?
  - A. Pick whichever value sounds more authoritative
  - B. Annotate both values with source attribution rather than choosing one
  - C. Average the two values
  - D. Omit the statistic entirely
- Correct: B

---

## 3. Scenario Practice Questions (official sample questions, 12 total)

### [s1] Customer Support Resolution Agent
- Question: Production data shows that in 12% of cases, your agent skips get_customer entirely and calls lookup_order using only the customer's stated name, occasionally leading to misidentified accounts and incorrect refunds. What change would most effectively address this reliability issue?
  - A. Add a programmatic prerequisite that blocks lookup_order and process_refund calls until get_customer has returned a verified customer ID.
  - B. Enhance the system prompt to state that customer verification via get_customer is mandatory before any order operations.
  - C. Add few-shot examples showing the agent always calling get_customer first, even when customers volunteer order details.
  - D. Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type.
- Correct: A
- Explanation: Programmatic enforcement provides deterministic guarantees that prompt-based approaches (B, C) cannot, which matters when errors have financial consequences. D addresses tool availability, not tool ordering, which isn't the real problem.

### [s2] Customer Support Resolution Agent
- Question: Production logs show the agent frequently calls get_customer when users ask about orders (e.g., "check my order #12345"), instead of calling lookup_order. Both tools have minimal descriptions and accept similar identifier formats. What's the most effective first step?
  - A. Add few-shot examples to the system prompt demonstrating correct tool selection patterns.
  - B. Expand each tool's description to include input formats, example queries, edge cases, and boundaries versus similar tools.
  - C. Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool.
  - D. Consolidate both tools into a single lookup_entity tool that internally determines which backend to query.
- Correct: B
- Explanation: Tool descriptions are the primary mechanism LLMs use for tool selection. Minimal descriptions leave models without the context to differentiate similar tools — this is the low-effort, high-leverage first fix. A adds token overhead without fixing the root cause; C is over-engineered; D is valid but requires more effort than a first step warrants.

### [s3] Customer Support Resolution Agent
- Question: Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show it escalates straightforward cases while attempting to autonomously handle complex situations requiring policy exceptions. What's the most effective way to improve escalation calibration?
  - A. Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously.
  - B. Have the agent self-report a confidence score (1-10) and automatically route to humans below a threshold.
  - C. Deploy a separate classifier model trained on historical tickets to predict which requests need escalation.
  - D. Implement sentiment analysis to detect customer frustration and escalate when negative sentiment exceeds a threshold.
- Correct: A
- Explanation: Explicit criteria with few-shot examples directly address unclear decision boundaries — the root cause. Self-reported confidence (B) is poorly calibrated on hard cases; a separate classifier (C) is over-engineered before simpler fixes are tried; sentiment (D) doesn't correlate with case complexity.

### [s4] Code Generation with Claude Code
- Question: You want to create a custom /review slash command available to every developer when they clone or pull the repository. Where should you create this command file?
  - A. In the .claude/commands/ directory in the project repository
  - B. In ~/.claude/commands/ in each developer's home directory
  - C. In the CLAUDE.md file at the project root
  - D. In a .claude/config.json file with a commands array
- Correct: A
- Explanation: Project-scoped commands in .claude/commands/ are version-controlled and automatically available to everyone who clones/pulls. ~/.claude/commands/ is personal and not shared; CLAUDE.md is for context/instructions, not command definitions; option D references a mechanism that doesn't exist.

### [s5] Code Generation with Claude Code
- Question: You've been assigned to restructure the team's monolithic application into microservices, involving changes across dozens of files and decisions about service boundaries. Which approach should you take?
  - A. Enter plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes.
  - B. Start with direct execution and make changes incrementally, letting the implementation reveal service boundaries.
  - C. Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured.
  - D. Begin in direct execution mode and only switch to plan mode if you encounter unexpected complexity.
- Correct: A
- Explanation: Plan mode is designed for exactly this: large-scale changes, multiple valid approaches, architectural decisions. It enables safe exploration before committing. B risks costly rework; C assumes you already know the right structure; D ignores that complexity is already known upfront.

### [s6] Code Generation with Claude Code
- Question: Your codebase has distinct conventions per area (React components, API handlers, database models), and test files are spread throughout the codebase alongside the code they test. You want all tests to follow the same conventions regardless of location. What's the most maintainable approach?
  - A. Create rule files in .claude/rules/ with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths.
  - B. Consolidate all conventions in the root CLAUDE.md under headers for each area, relying on Claude to infer which section applies.
  - C. Create skills in .claude/skills/ for each code type that include the relevant conventions in their SKILL.md files.
  - D. Place a separate CLAUDE.md file in each subdirectory containing that area's specific conventions.
- Correct: A
- Explanation: .claude/rules/ with glob patterns (e.g. **/*.test.tsx) applies conventions based on file path regardless of directory location — essential for scattered test files. B relies on unreliable inference; C requires manual/conditional invocation; D can't handle files spread across many directories.

### [s7] Multi-Agent Research System
- Question: Each subagent completes successfully, but the final report covers only visual arts, completely missing music, writing, and film. The coordinator's logs show it decomposed "impact of AI on creative industries" into three subtasks all about visual arts. What is the most likely root cause?
  - A. The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives.
  - B. The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains.
  - C. The web search agent's queries are not comprehensive enough and need to be expanded.
  - D. The document analysis agent is filtering out sources related to non-visual creative industries.
- Correct: B
- Explanation: The coordinator's logs show the root cause directly — it only assigned visual-arts subtasks. The subagents executed correctly within their (too-narrow) assigned scope; A, C, and D incorrectly blame downstream agents working correctly.

### [s8] Multi-Agent Research System
- Question: The web search subagent times out while researching a complex topic. Which error propagation approach best enables intelligent recovery by the coordinator?
  - A. Return structured error context including the failure type, the attempted query, any partial results, and potential alternative approaches.
  - B. Implement automatic retry with exponential backoff within the subagent, returning a generic "search unavailable" status only after retries are exhausted.
  - C. Catch the timeout within the subagent and return an empty result set marked as successful.
  - D. Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow.
- Correct: A
- Explanation: Structured error context gives the coordinator what it needs for intelligent recovery. B's generic status still hides valuable context; C suppresses the error as false success; D terminates the whole workflow unnecessarily.

### [s9] Multi-Agent Research System
- Question: The synthesis agent frequently needs to verify simple facts (85% of cases) and occasionally needs deeper investigation (15%), currently round-tripping through the coordinator each time, adding 40% latency. What's the most effective approach?
  - A. Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator.
  - B. Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass.
  - C. Give the synthesis agent access to all web search tools so it can handle any verification need directly.
  - D. Have the web search agent proactively cache extra context around each source, anticipating what synthesis might need to verify.
- Correct: A
- Explanation: This applies least-privilege: a scoped tool for the common case (85%), preserving coordinator delegation for complex cases. B creates blocking dependencies; C over-provisions the agent; D relies on unreliable speculative caching.

### [s10] Claude Code for Continuous Integration
- Question: Your pipeline script runs `claude "Analyze this pull request for security issues"` but the job hangs indefinitely, waiting for interactive input. What's the correct approach?
  - A. Add the -p flag: claude -p "Analyze this pull request for security issues"
  - B. Set the environment variable CLAUDE_HEADLESS=true before running the command.
  - C. Redirect stdin from /dev/null: claude "..." < /dev/null
  - D. Add the --batch flag: claude --batch "..."
- Correct: A
- Explanation: The -p (--print) flag is the documented way to run Claude Code non-interactively — it processes the prompt, prints to stdout, and exits. The other options reference non-existent features or Unix workarounds that don't address Claude Code's actual syntax.

### [s11] Claude Code for Continuous Integration
- Question: Your manager proposes switching both a blocking pre-merge check and an overnight technical debt report to the Message Batches API for its 50% cost savings. How should you evaluate this proposal?
  - A. Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks.
  - B. Switch both workflows to batch processing with status polling to check for completion.
  - C. Keep real-time calls for both workflows to avoid batch result ordering issues.
  - D. Switch both to batch processing with a timeout fallback to real-time if batches take too long.
- Correct: A
- Explanation: Batches offer savings but up to 24-hour processing with no latency SLA — unsuitable for blocking pre-merge checks, ideal for overnight reports. B relies on unacceptable "often faster" hope for a blocking workflow; C is a misconception (custom_id correlates results); D adds unneeded complexity.

### [s12] Claude Code for Continuous Integration
- Question: A pull request modifies 14 files. A single-pass review produces inconsistent results — detailed feedback for some files, superficial for others, and contradictory feedback on identical patterns. How should you restructure the review?
  - A. Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow.
  - B. Require developers to split large PRs into smaller submissions of 3-4 files before review.
  - C. Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass.
  - D. Run three independent review passes on the full PR and only flag issues appearing in at least two of three runs.
- Correct: A
- Explanation: Splitting into focused passes addresses the root cause — attention dilution across many files at once. B shifts burden to developers; C misunderstands that larger context windows don't fix attention quality; D would suppress real bugs by requiring consensus.

---

## 4. Progress Tracking Log

Mastery scoring convention (for any agent updating this log): each term/scenario starts at mastery `0`. On a correct answer, increment mastery by 1 (cap at `3`). On a wrong answer, decrement mastery by 1 (floor at `0`). `Attempts` and `Correct` are cumulative counters. `Last Result` is `correct` or `wrong`. `Last Updated` is an ISO date. Mastery `3` = "mastered", `0` = "not yet attempted or currently weak."

An agent maintaining this file for a user should, after each quiz session: update the row(s) for every term/scenario answered, recompute the domain summary table, and append a session entry to the Session History table. Do not overwrite prior session history rows — only append.

### 4.1 Term Mastery Table

| ID | Term | Domain | Attempts | Correct | Mastery (0-3) | Last Result | Last Updated |
|---|---|---|---|---|---|---|---|
| t1 | Agentic loop | Domain 1 | 0 | 0 | 0 | - | - |
| t2 | stop_reason | Domain 1 | 0 | 0 | 0 | - | - |
| t3 | Hub-and-spoke architecture | Domain 1 | 0 | 0 | 0 | - | - |
| t4 | Task tool | Domain 1 | 0 | 0 | 0 | - | - |
| t5 | AgentDefinition | Domain 1 | 0 | 0 | 0 | - | - |
| t6 | Subagent context isolation | Domain 1 | 0 | 0 | 0 | - | - |
| t7 | fork_session | Domain 1 | 0 | 0 | 0 | - | - |
| t8 | --resume <session-name> | Domain 1 | 0 | 0 | 0 | - | - |
| t9 | Programmatic enforcement vs. prompt guidance | Domain 1 | 0 | 0 | 0 | - | - |
| t10 | PostToolUse hook | Domain 1 | 0 | 0 | 0 | - | - |
| t11 | Tool call interception hook | Domain 1 | 0 | 0 | 0 | - | - |
| t12 | Prompt chaining | Domain 1 | 0 | 0 | 0 | - | - |
| t13 | Dynamic / adaptive decomposition | Domain 1 | 0 | 0 | 0 | - | - |
| t14 | Tool description | Domain 2 | 0 | 0 | 0 | - | - |
| t15 | isError flag | Domain 2 | 0 | 0 | 0 | - | - |
| t16 | errorCategory | Domain 2 | 0 | 0 | 0 | - | - |
| t17 | isRetryable | Domain 2 | 0 | 0 | 0 | - | - |
| t18 | tool_choice: "auto" | Domain 2 | 0 | 0 | 0 | - | - |
| t19 | tool_choice: "any" | Domain 2 | 0 | 0 | 0 | - | - |
| t20 | Forced tool selection | Domain 2 | 0 | 0 | 0 | - | - |
| t21 | .mcp.json | Domain 2 | 0 | 0 | 0 | - | - |
| t22 | ~/.claude.json | Domain 2 | 0 | 0 | 0 | - | - |
| t23 | Environment variable expansion | Domain 2 | 0 | 0 | 0 | - | - |
| t24 | MCP resources | Domain 2 | 0 | 0 | 0 | - | - |
| t25 | Grep (built-in tool) | Domain 2 | 0 | 0 | 0 | - | - |
| t26 | Glob (built-in tool) | Domain 2 | 0 | 0 | 0 | - | - |
| t27 | Edit-fails fallback | Domain 2 | 0 | 0 | 0 | - | - |
| t28 | CLAUDE.md hierarchy | Domain 3 | 0 | 0 | 0 | - | - |
| t29 | @import syntax | Domain 3 | 0 | 0 | 0 | - | - |
| t30 | .claude/rules/ | Domain 3 | 0 | 0 | 0 | - | - |
| t31 | /memory command | Domain 3 | 0 | 0 | 0 | - | - |
| t32 | .claude/commands/ | Domain 3 | 0 | 0 | 0 | - | - |
| t33 | ~/.claude/commands/ | Domain 3 | 0 | 0 | 0 | - | - |
| t34 | SKILL.md frontmatter | Domain 3 | 0 | 0 | 0 | - | - |
| t35 | context: fork | Domain 3 | 0 | 0 | 0 | - | - |
| t36 | allowed-tools (skill frontmatter) | Domain 3 | 0 | 0 | 0 | - | - |
| t37 | argument-hint | Domain 3 | 0 | 0 | 0 | - | - |
| t38 | Plan mode | Domain 3 | 0 | 0 | 0 | - | - |
| t39 | Direct execution | Domain 3 | 0 | 0 | 0 | - | - |
| t40 | Explore subagent | Domain 3 | 0 | 0 | 0 | - | - |
| t41 | Interview pattern | Domain 3 | 0 | 0 | 0 | - | - |
| t42 | -p / --print flag | Domain 3 | 0 | 0 | 0 | - | - |
| t43 | --output-format json / --json-schema | Domain 3 | 0 | 0 | 0 | - | - |
| t44 | Few-shot prompting | Domain 4 | 0 | 0 | 0 | - | - |
| t45 | tool_use with JSON schema | Domain 4 | 0 | 0 | 0 | - | - |
| t46 | Nullable / optional fields | Domain 4 | 0 | 0 | 0 | - | - |
| t47 | enum + "other" + detail pattern | Domain 4 | 0 | 0 | 0 | - | - |
| t48 | Retry-with-error-feedback | Domain 4 | 0 | 0 | 0 | - | - |
| t49 | detected_pattern field | Domain 4 | 0 | 0 | 0 | - | - |
| t50 | Message Batches API | Domain 4 | 0 | 0 | 0 | - | - |
| t51 | custom_id | Domain 4 | 0 | 0 | 0 | - | - |
| t52 | Multi-pass review | Domain 4 | 0 | 0 | 0 | - | - |
| t53 | Independent review instance | Domain 4 | 0 | 0 | 0 | - | - |
| t54 | Lost in the middle effect | Domain 5 | 0 | 0 | 0 | - | - |
| t55 | Case facts block | Domain 5 | 0 | 0 | 0 | - | - |
| t56 | Escalation triggers | Domain 5 | 0 | 0 | 0 | - | - |
| t57 | Structured error context | Domain 5 | 0 | 0 | 0 | - | - |
| t58 | Scratchpad files | Domain 5 | 0 | 0 | 0 | - | - |
| t59 | Manifest (crash recovery) | Domain 5 | 0 | 0 | 0 | - | - |
| t60 | /compact | Domain 5 | 0 | 0 | 0 | - | - |
| t61 | Stratified random sampling | Domain 5 | 0 | 0 | 0 | - | - |
| t62 | Field-level confidence scores | Domain 5 | 0 | 0 | 0 | - | - |
| t63 | Claim-source mapping | Domain 5 | 0 | 0 | 0 | - | - |
| t64 | Conflict annotation | Domain 5 | 0 | 0 | 0 | - | - |

### 4.2 Scenario Question Tracking Table

| ID | Scenario | Attempts | Correct | Last Result | Last Updated |
|---|---|---|---|---|---|
| s1 | Customer Support Resolution Agent | 0 | 0 | - | - |
| s2 | Customer Support Resolution Agent | 0 | 0 | - | - |
| s3 | Customer Support Resolution Agent | 0 | 0 | - | - |
| s4 | Code Generation with Claude Code | 0 | 0 | - | - |
| s5 | Code Generation with Claude Code | 0 | 0 | - | - |
| s6 | Code Generation with Claude Code | 0 | 0 | - | - |
| s7 | Multi-Agent Research System | 0 | 0 | - | - |
| s8 | Multi-Agent Research System | 0 | 0 | - | - |
| s9 | Multi-Agent Research System | 0 | 0 | - | - |
| s10 | Claude Code for Continuous Integration | 0 | 0 | - | - |
| s11 | Claude Code for Continuous Integration | 0 | 0 | - | - |
| s12 | Claude Code for Continuous Integration | 0 | 0 | - | - |

### 4.3 Domain Summary (recompute after each session)

| Domain | Terms Mastered (mastery=3) | Total Terms | Mastery % |
|---|---|---|---|
| 1. Agentic Architecture & Orchestration | 0 | 13 | 0% |
| 2. Tool Design & MCP Integration | 0 | 14 | 0% |
| 3. Claude Code Configuration & Workflows | 0 | 16 | 0% |
| 4. Prompt Engineering & Structured Output | 0 | 10 | 0% |
| 5. Context Management & Reliability | 0 | 11 | 0% |
| **Overall** | **0** | **64** | **0%** |

### 4.4 Session History

Append one row per quiz/study session. Do not delete or reorder existing rows.

| Date | Mode | Items Attempted | Correct | Accuracy | Notes |
|---|---|---|---|---|---|
| - | - | - | - | - | (no sessions logged yet) |

---

## 5. In-Scope / Out-of-Scope Reference

In-scope topic families (see glossary above for term-level detail): agentic loop implementation, multi-agent orchestration, subagent context management, tool interface design, MCP tool/resource design and server configuration, error handling and propagation, escalation decision-making, CLAUDE.md configuration, custom commands and skills, plan mode vs. direct execution, iterative refinement, structured output via tool_use, few-shot prompting, batch processing, context window optimization, human review workflows, information provenance.

Explicitly out of scope: fine-tuning/training custom models, API authentication/billing, language/framework implementation details, MCP server hosting/infrastructure, Claude's internal architecture/training, embedding models/vector databases, computer use, vision/image analysis, streaming API/SSE, rate limiting/pricing, OAuth/API key rotation, cloud provider specifics, benchmarking, prompt caching internals, tokenization details.
