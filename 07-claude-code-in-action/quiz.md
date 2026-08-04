# 07 · Claude Code in Action — Quiz

## Fundamentals [Bonus: Claude Code 101]

### Q1. What fundamentally separates Claude Code from Claude.ai chat?
---
**A:** Claude Code has direct access to your files, terminal, and entire codebase and acts as an AI agent — it edits and executes directly, rather than requiring you to copy-paste code back and forth.

### Q2. Define an "AI Agent" per Claude Code 101.
---
**A:** Software that interacts with its environment and performs actions to complete a defined goal — an LLM operating in a real-time loop, potentially with access to tools, external services, or other agents.

### Q3. Walk through Claude Code's agentic loop in your own words.
---
**A:** Prompt in → Claude gathers context and gets text or a tool call from the model → takes action (edit file / run command) → verifies the result against the original intent → if achieved, stops and waits for the next prompt; if not, loops back and retries.

### Q4. Name the four steps of the "if you take one thing away from this course" workflow.
---
**A:** Explore, Plan, Code, Commit.

### Q5. Why is Plan Mode described as "the best place to course-correct"?
---
**A:** Because it happens before any code is written — reviewing and revising a plan is far cheaper than reviewing and undoing code that's already been written.

### Q6. Why should you run a subagent code review before committing, rather than relying on the main session's own review?
---
**A:** A subagent runs with a fresh, unbiased context — it doesn't carry the same-session bias the main agent has from having just written the code itself.

### Q7. What does `claude --from-pr <PR_NUMBER>` do?
---
**A:** Resumes a Claude Code session that was linked to a specific PR, picking back up with full context — useful for addressing review comments or fixing a failing build later.

### Q8. Why is it recommended to start a project WITHOUT a CLAUDE.md file initially?
---
**A:** So you can observe where you actually have to keep course-correcting Claude — this keeps the eventual file compact and focused only on what's genuinely necessary.

### Q9. What is a subagent, and what's the key context-management benefit of using one?
---
**A:** A delegated task that runs in its own isolated context window in parallel with the main agent; it returns only a summary to the main agent, so the exploration trail doesn't clutter the main context.

### Q10. When preloading a skill into a subagent via the `skill` key, does the full skill content load into context immediately, or progressively?
---
**A:** Immediately/fully — unlike skills in the main conversation, which load progressively (name+description first).

## Steering long sessions & context management

### Q11. How do you steer what `/compact` keeps, and what's the risk if you don't?
---
**A:** Add instructions right after the command (e.g., `/compact Focus on the --version flag implementation`). Risk: without steering, something important might get dropped.

### Q12. What's the difference between `/compact` and `/clear`, and when should you use each?
---
**A:** `/compact` summarizes the conversation so far, freeing context while retaining a memory of it — use mid-feature to keep working. `/clear` wipes everything — use when starting a new feature, to avoid old-conversation bias bleeding in.

### Q13. What does the rewind menu let you do, and how do you open it?
---
**A:** Double-tap Escape on an empty prompt. Options: restore code+conversation, restore conversation only, restore code only, summarize from a checkpoint forward, or summarize up to a checkpoint.

### Q14. What is `/goal`, and what's its key constraint?
---
**A:** Sets a completion condition; Claude keeps working across turns until a fast evaluator confirms it's met. Constraint: the evaluator only reads the transcript, so your condition must be checkable from Claude's own output, not external state.

### Q15. Why use worktrees when running multiple parallel Claude Code sessions on the same repo?
---
**A:** Each session gets its own independent file tree, so parallel agents can't clobber each other's changes.

### Q16. Why does a vague prompt actually cost MORE context than a specific one, counterintuitively?
---
**A:** A vague prompt forces Claude to explore the codebase more and do more of its own reasoning to fill in gaps, which consumes far more context than a detailed, specific prompt would have.

## CLAUDE.md

### Q17. Is CLAUDE.md enforced configuration? What's the practical consequence for file length?
---
**A:** No — it's guidance, and every line competes with every other line for Claude's attention. Longer files mean lower reliability per rule, so the goal is to keep it lean, not exhaustive.

### Q18. Where should a genuinely hard rule (e.g., "never push to main") live instead of CLAUDE.md, and why?
---
**A:** In a PreToolUse hook — because a hook is code that can actually block the action, whereas CLAUDE.md is just a request Claude usually (not always) follows.

### Q19. Name the four CLAUDE.md locations (fuller model) and one thing distinguishing each.
---
**A:** Managed policy (org-level, can't be excluded), User (personal, all projects), Project (team-shared, committed to repo), Local (git-ignored, personal notes for this one repo only).

### Q20. Do CLAUDE.md imports (`@path/to/file.md`) reduce the context Claude loads?
---
**A:** No — imports are expanded inline at launch, so everything still loads; imports only help with organizing a large file.

### Q21. What does "emphasis is a budget" mean for writing CLAUDE.md rules?
---
**A:** Words like "IMPORTANT" or "YOU MUST" only stand out relative to quieter surrounding text — if every rule shouts, none of them do.

## Skills

### Q22. What's the recommended first skill to build, and why?
---
**A:** A verification skill — because manual checking depends on remembering to ask for it every time, and skipping that check even once can let bad code through.

### Q23. What must a verification skill check beyond "tests pass," to avoid a false positive?
---
**A:** That no test was quietly weakened just to make it pass — it should read the diff and confirm the tests themselves weren't loosened.

### Q24. Which instruction surface owns: (a) an always-true convention, (b) a task-specific procedure, (c) a rule that must never be skippable?
---
**A:** (a) CLAUDE.md. (b) A skill. (c) A hook.

## Permission modes

### Q25. List all six permission modes and one key fact about each.
---
**A:** Manual (reads only, asks for everything else). Accept edits (reads/edits/common bash run freely, still asks for other commands). Plan (read-only, proposes without editing). Auto (accepts everything but a classifier reviews each action for danger/intent — not correctness). Don't ask (only pre-approved tools run, everything else silently denied — for unattended CI). Bypass permissions (skips all checks — only inside an isolated container/VM).

### Q26. What does Auto mode's classifier check, and what does it explicitly NOT catch?
---
**A:** It checks intent — blocking production deploys, force pushes, piping downloaded code into a shell, exfiltrating sensitive data. It does NOT check correctness, so broken-but-safe code passes through unflagged.

### Q27. What should you pair with Auto mode to catch correctness issues the classifier misses?
---
**A:** A Stop hook that runs your tests.

## Hooks — deeper model

### Q28. What are the three values `permissionDecision` can take in a PreToolUse hook's JSON response (plus the rare fourth)?
---
**A:** allow, deny, ask (plus defer, which only applies to non-interactive -p runs).

### Q29. What does the `updatedInput` field in a PreToolUse hook response let you do, and what's the catch?
---
**A:** Rewrite a tool call instead of blocking it (e.g., redact a secret and still let the command run). Catch: it replaces the WHOLE input object, so you must echo back unchanged fields or lose them.

### Q30. What do exit codes 0, 2, and "any other code" (including 1) mean for a hook, and what's the common mistake?
---
**A:** 0 = success. 2 = blocking error, stderr fed back as context. Any other code, including 1, is NON-blocking — the common mistake is assuming exit 1 blocks when it doesn't.

### Q31. To re-inject context right after a compaction event, which hook/matcher should you use — and which should you NOT use?
---
**A:** Use SessionStart with the "compact" matcher. Do NOT use PostCompact — its output doesn't get fed back into the conversation.

## MCP inside Claude Code

### Q32. In Claude Code, what are the two MCP server transport types, and what's each for?
---
**A:** HTTP (remote services hosted by the provider) and Stdio (local processes running on your machine).

### Q33. How do you make sure your whole team automatically gets the same MCP servers in a Claude Code project?
---
**A:** Use Project-scoped servers via a `.mcp.json` file checked into version control.

### Q34. What happens to Claude Code's context budget when many MCP servers are configured, even if unused? What's the automatic mitigation, and at what threshold does it kick in?
---
**A:** Every configured server's tool definitions load into context regardless of use. If MCP tools exceed 10% of the context window, Claude Code automatically switches to "tool search mode" (discovering tools on demand), though this may be less reliable.

### Q35. Besides disabling unused servers, name two other ways to reduce MCP's context cost in Claude Code.
---
**A:** Prefer a CLI tool if one exists (e.g., `gh`, `aws` — no persistent tool definitions), or use a Skill instead (only name+description load until needed).

## Automating repeat work

### Q36. What is a "Routine," and what are its three trigger types?
---
**A:** A saved bundle of prompt + repo + connectors that runs on Anthropic's managed cloud infrastructure. Triggers: cron schedule, HTTP POST to its API endpoint, or a GitHub event.

### Q37. Name two constraints on Routines as of this course.
---
**A:** They're a research preview; a recurring schedule runs at most hourly; each run starts from a fresh clone of the default branch and can only push to `claude/`-prefixed branches by default.

### Q38. What does headless mode's `-p` flag skip auto-discovering, and what's the trade-off?
---
**A:** Skips auto-discovery of hooks, skills, plugins, MCP servers, and CLAUDE.md — you get Claude plus only explicitly allowed tools. Trade-off: much faster startup.

### Q39. How do you get structured, schema-constrained output from a headless Claude Code run?
---
**A:** Pair `--output-format json` with `--json-schema '<your schema>'`; the matching object lands in `structured_output`, extractable with `jq`.

### Q40. What does `--bare` mode provide, and when would you use it?
---
**A:** Deterministic mode — repeatable, predictable output run to run. Use it in CI pipelines that need identical results every time.

### Q41. What is the Agent SDK, and when should you reach for it over routines or headless mode?
---
**A:** A library (TypeScript/Python) that embeds Claude Code inside your own application. Reach for it when the automated work needs to live inside your own product, not run as an external job.

## GitHub integration

### Q42. What does the managed "Code Review" service do, and what does it explicitly NOT do?
---
**A:** Posts inline PR comments (tagged by severity, with a summary table) analyzed against the full codebase. It never approves or blocks a PR, and there's no managed autofix — findings only.

### Q43. When should you reach for the DIY GitHub Action instead of the managed Code Review service?
---
**A:** When the job is more than review — implementing changes from a comment, running scheduled reports, or any custom CI task where Claude needs to actually take action.

## Verifying unsupervised runs

### Q44. What does "verify in proportion to how little you watched" mean in practice?
---
**A:** The less supervision a run had, the more rigorous your post-hoc verification needs to be — a quick glance for a watched session, a full reconstructed check for an unattended/CI run.

### Q45. Why should you read `git diff` yourself instead of trusting Claude's summary of an unsupervised run?
---
**A:** A tidy, well-written summary can still omit or gloss over an unexpectedly touched file — reading the actual diff is the only way to catch that.

## Plugins

### Q46. What is a "plugin" in Claude Code, and what problem does it solve?
---
**A:** One installable unit bundling skills, subagents, hooks, and MCP server configs. It solves the problem of manually copying a working `.claude` setup between machines/teammates.

### Q47. Why is "the plugin passed automated community review" not the same as "safe to install"?
---
**A:** Automated review catches some issues but not everything; a plugin still runs code on your machine with your privileges, and its hooks fire on every matching tool call whether or not you've read them.

### Q48. When you install a plugin, do its hooks replace yours or run alongside them?
---
**A:** Alongside — hooks stack.

### Q49. What's the only required field in a plugin manifest (`.claude-plugin/plugin.json`), and what does it do?
---
**A:** `name` — it namespaces the plugin's skills as `company-name:skill-name`, preventing collisions with other plugins/skills.

### Q50. What does `/loop` do, and how do you stop it?
---
**A:** It runs a prompt at an interval between turns, which is useful for polling external state; press Escape to stop the loop.

### Q51. What does `.worktreeinclude` control?
---
**A:** It lists git-ignored files, such as local environment or configuration files, that should be copied into each new worktree.

### Q52. Why should project-level hook scripts use `$CLAUDE_PROJECT_DIR` in their paths?
---
**A:** It makes the paths portable across clones and worktrees, while project-level hooks in `.claude/settings.json` can be shared with the team through version control.

### Q53. What is the enforcement difference between `PreToolUse` and `PostToolUse` hooks?
---
**A:** `PreToolUse` runs before a tool call and can block it; `PostToolUse` runs after the tool has already run, so it is too late to prevent that call.

### Q54. What do the main custom GitHub Action inputs `trigger_phrase`, `prompt`, and `claude_args` control?
---
**A:** `trigger_phrase` defines the phrase that starts the action, `prompt` supplies the task for Claude, and `claude_args` passes raw CLI arguments such as a turn limit.
