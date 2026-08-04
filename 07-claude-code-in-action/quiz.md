# 07 · Claude Code in Action — Quiz

## Fundamentals [Bonus: Claude Code 101]

### Q1. What fundamentally separates Claude Code from Claude.ai chat?
---
**A:** Claude Code has direct access to your files, terminal, and entire codebase and acts as an AI agent — it edits and executes directly, rather than requiring you to copy-paste code back and forth.
*Memory hook:* Claude.ai is the consultant across the table; Claude Code is the engineer inside the workshop holding the keys to the files and terminal.

### Q2. Define an "AI Agent" per Claude Code 101.
---
**A:** Software that interacts with its environment and performs actions to complete a defined goal — an LLM operating in a real-time loop, potentially with access to tools, external services, or other agents.
*Memory hook:* An agent is an apprentice with a destination, eyes, hands, and a toolbox—not just a voice describing what someone else should do.

### Q3. Walk through Claude Code's agentic loop in your own words.
---
**A:** Prompt in → Claude gathers context and gets text or a tool call from the model → takes action (edit file / run command) → verifies the result against the original intent → if achieved, stops and waits for the next prompt; if not, loops back and retries.
*Memory hook:* It is a mechanic's loop: **hear the repair request → inspect → turn the wrench → test-drive → repeat until the rattle is gone**.

### Q4. Name the four steps of the "if you take one thing away from this course" workflow.
---
**A:** Explore, Plan, Code, Commit.
*Memory hook:* **Map the trail, draw the blueprint, build the bridge, stamp the finished permit.**

### Q5. Why is Plan Mode described as "the best place to course-correct"?
---
**A:** Because it happens before any code is written — reviewing and revising a plan is far cheaper than reviewing and undoing code that's already been written.
*Memory hook:* Erasing a pencil line on a blueprint is cheap; demolishing the brick wall built from the wrong blueprint is not.

### Q6. Why should you run a subagent code review before committing, rather than relying on the main session's own review?
---
**A:** A subagent runs with a fresh, unbiased context — it doesn't carry the same-session bias the main agent has from having just written the code itself.
*Memory hook:* Let a reviewer inspect the cake without knowing they baked it—the missing frosting is much easier to notice.

### Q7. What does `claude --from-pr <PR_NUMBER>` do?
---
**A:** Resumes a Claude Code session that was linked to a specific PR, picking back up with full context — useful for addressing review comments or fixing a failing build later.
*Memory hook:* It is a bookmark in the PR novel: reopen the page later and the plot, characters, and reviewer notes are still there.

### Q8. Why is it recommended to start a project WITHOUT a CLAUDE.md file initially?
---
**A:** So you can observe where you actually have to keep course-correcting Claude — this keeps the eventual file compact and focused only on what's genuinely necessary.
*Memory hook:* Start with a blank notebook, watch which potholes Claude hits, then add signs only at those potholes instead of covering the whole road in warnings.

### Q9. What is a subagent, and what's the key context-management benefit of using one?
---
**A:** A delegated task that runs in its own isolated context window in parallel with the main agent; it returns only a summary to the main agent, so the exploration trail doesn't clutter the main context.
*Memory hook:* A subagent is a sidecar scout who explores a maze in a separate notebook and returns with one clean map, not every footprint.

### Q10. When preloading a skill into a subagent via the `skill` key, does the full skill content load into context immediately, or progressively?
---
**A:** Immediately/fully — unlike skills in the main conversation, which load progressively (name+description first).
*Memory hook:* Preloading is dumping the entire toolbox onto the table now; progressive loading is reading the label first and opening drawers only when needed.

## Steering long sessions & context management

### Q11. How do you steer what `/compact` keeps, and what's the risk if you don't?
---
**A:** Add instructions right after the command (e.g., `/compact Focus on the --version flag implementation`). Risk: without steering, something important might get dropped.
*Memory hook:* Tell the editor which chapters must survive the fire; otherwise the summary may save the picnic menu and lose the plot twist.

### Q12. What's the difference between `/compact` and `/clear`, and when should you use each?
---
**A:** `/compact` summarizes the conversation so far, freeing context while retaining a memory of it — use mid-feature to keep working. `/clear` wipes everything — use when starting a new feature, to avoid old-conversation bias bleeding in.
*Memory hook:* **Compact** is vacuum-sealing the suitcase; **clear** is tossing the suitcase into a bonfire before a new trip.

### Q13. What does the rewind menu let you do, and how do you open it?
---
**A:** Double-tap Escape on an empty prompt. Options: restore code+conversation, restore conversation only, restore code only, summarize from a checkpoint forward, or summarize up to a checkpoint.
*Memory hook:* The rewind menu is a time machine with separate buttons for restoring the **world**, the **story**, the **code**, or a **summary**.

### Q14. What is `/goal`, and what's its key constraint?
---
**A:** Sets a completion condition; Claude keeps working across turns until a fast evaluator confirms it's met. Constraint: the evaluator only reads the transcript, so your condition must be checkable from Claude's own output, not external state.
*Memory hook:* `/goal` is a scoreboard whose referee can see only the play-by-play transcript—not a hidden scoreboard in another stadium.

### Q15. Why use worktrees when running multiple parallel Claude Code sessions on the same repo?
---
**A:** Each session gets its own independent file tree, so parallel agents can't clobber each other's changes.
*Memory hook:* Worktrees give each carpenter a separate workshop, so two people never saw the same board at the same time.

### Q16. Why does a vague prompt actually cost MORE context than a specific one, counterintuitively?
---
**A:** A vague prompt forces Claude to explore the codebase more and do more of its own reasoning to fill in gaps, which consumes far more context than a detailed, specific prompt would have.
*Memory hook:* “Fix the house” sends Claude on a citywide scavenger hunt; “replace the kitchen faucet” gives it a GPS pin.

### Q55. What happens to a worktree automatically when its session ends, and under what condition?
---
**A:** Clean worktrees (no uncommitted changes) are automatically removed when the session exits.
*Memory hook:* A clean hotel room checks itself out and vanishes from the register the moment the guest leaves; a messy one gets held for housekeeping.

## CLAUDE.md

### Q17. Is CLAUDE.md enforced configuration? What's the practical consequence for file length?
---
**A:** No — it's guidance, and every line competes with every other line for Claude's attention. Longer files mean lower reliability per rule, so the goal is to keep it lean, not exhaustive.
*Memory hook:* CLAUDE.md is a stack of sticky notes, not a steel jail door; if every note is a novel, none gets read carefully.

### Q18. Where should a genuinely hard rule (e.g., "never push to main") live instead of CLAUDE.md, and why?
---
**A:** In a PreToolUse hook — because a hook is code that can actually block the action, whereas CLAUDE.md is just a request Claude usually (not always) follows.
*Memory hook:* CLAUDE.md is a polite “please”; a PreToolUse hook is the guard dog that physically stops the gate.

### Q19. Name the four CLAUDE.md locations (fuller model) and one thing distinguishing each.
---
**A:** Managed policy (org-level, can't be excluded), User (personal, all projects), Project (team-shared, committed to repo), Local (git-ignored, personal notes for this one repo only).
*Memory hook:* Four layers of instruction: **company billboard**, **your backpack**, **team handbook**, and **secret sticky note on this laptop**.

### Q20. Do CLAUDE.md imports (`@path/to/file.md`) reduce the context Claude loads?
---
**A:** No — imports are expanded inline at launch, so everything still loads; imports only help with organizing a large file.
*Memory hook:* Imports put books into labeled folders, but the moving truck still carries every page.

### Q21. What does "emphasis is a budget" mean for writing CLAUDE.md rules?
---
**A:** Words like "IMPORTANT" or "YOU MUST" only stand out relative to quieter surrounding text — if every rule shouts, none of them do.
*Memory hook:* If every speaker at the parade yells “emergency,” the real emergency has no louder signal.

### Q56. Name the two phrasing rules (besides the emphasis budget) that make a CLAUDE.md rule more likely to be followed.
---
**A:** Be specific and checkable (e.g., "put new API routes in src/api/handlers, one per file" instead of "follow best practices"), and name the replacement (e.g., "use named exports, not default exports" instead of "don't use default exports").
*Memory hook:* A vague coach yells "play better"; a good coach says "cover the left flank" and "pass instead of dribble."

### Q57. What's the recommended workflow for keeping CLAUDE.md accurate over time, and what standard should each line meet?
---
**A:** Treat a wrong Claude action as a bug report against the file — tell Claude "add that to CLAUDE.md" and it writes the rule. Treat the file like production code: if you can't justify a line, delete it.
*Memory hook:* CLAUDE.md gets the same code review as your app — every unjustified line is dead code waiting to be pruned.

## Skills

### Q22. What's the recommended first skill to build, and why?
---
**A:** A verification skill — because manual checking depends on remembering to ask for it every time, and skipping that check even once can let bad code through.
*Memory hook:* Build the smoke alarm first; it keeps checking even when the homeowner forgets to walk around with a flashlight.

### Q23. What must a verification skill check beyond "tests pass," to avoid a false positive?
---
**A:** That no test was quietly weakened just to make it pass — it should read the diff and confirm the tests themselves weren't loosened.
*Memory hook:* A student who passes by erasing the exam question did not pass; the verification skill checks that the ruler was not bent.

### Q24. Which instruction surface owns: (a) an always-true convention, (b) a task-specific procedure, (c) a rule that must never be skippable?
---
**A:** (a) CLAUDE.md. (b) A skill. (c) A hook.
*Memory hook:* **House rules**, **recipe card**, **deadbolt**—convention, procedure, unskippable enforcement.

### Q58. Inside a skill folder, what's the division of labor between skill.md, reference.md, and any scripts — and why does that division matter for context?
---
**A:** skill.md stays lean as the entry point; reference.md holds detailed material and is only read when depth is needed; scripts are executed rather than loaded into context, so a skill can carry its own tooling without bloating the conversation. Check skills into `.claude/skills` so the whole team inherits them.
*Memory hook:* skill.md is the menu, reference.md is the recipe book in the back kept closed until asked for, and the scripts are the kitchen equipment — used, never read aloud.

## Permission modes

### Q25. List all six permission modes and one key fact about each.
---
**A:** Manual (reads only, asks for everything else). Accept edits (reads/edits/common bash run freely, still asks for other commands). Plan (read-only, proposes without editing). Auto (accepts everything but a classifier reviews each action for danger/intent — not correctness). Don't ask (only pre-approved tools run, everything else silently denied — for unattended CI). Bypass permissions (skips all checks — only inside an isolated container/VM).
*Memory hook:* Six doors: **careful guest**, **editor with a pass**, **architect**, **auto security lane**, **silent robot**, and **sealed lab with no guards**.

### Q26. What does Auto mode's classifier check, and what does it explicitly NOT catch?
---
**A:** It checks intent — blocking production deploys, force pushes, piping downloaded code into a shell, exfiltrating sensitive data. It does NOT check correctness, so broken-but-safe code passes through unflagged.
*Memory hook:* Airport security asks “Is this package dangerous?” not “Is the book inside spelled correctly?”

### Q27. What should you pair with Auto mode to catch correctness issues the classifier misses?
---
**A:** A Stop hook that runs your tests.
*Memory hook:* Put a referee at the finish line who blows the whistle when the test suite still says “foul.”

### Q59. How do you switch between permission modes during a session, and how do you tell which mode is active?
---
**A:** Shift-tab cycles through the everyday modes; the status bar shows the current mode.
*Memory hook:* Shift-tab is the gear shifter, and the status bar is the dashboard gauge telling you which gear you're in.

## Hooks — deeper model

### Q28. What are the three values `permissionDecision` can take in a PreToolUse hook's JSON response (plus the rare fourth)?
---
**A:** allow, deny, ask (plus defer, which only applies to non-interactive -p runs).
*Memory hook:* The hook's traffic lights are **green**, **red**, and **yellow**—with **defer** as the mailbox for a non-interactive runner.

### Q29. What does the `updatedInput` field in a PreToolUse hook response let you do, and what's the catch?
---
**A:** Rewrite a tool call instead of blocking it (e.g., redact a secret and still let the command run). Catch: it replaces the WHOLE input object, so you must echo back unchanged fields or lose them.
*Memory hook:* `updatedInput` edits the entire shipping label, not one word—rewrite the secret, but copy every address line back onto the new label.

### Q30. What do exit codes 0, 2, and "any other code" (including 1) mean for a hook, and what's the common mistake?
---
**A:** 0 = success. 2 = blocking error, stderr fed back as context. Any other code, including 1, is NON-blocking — the common mistake is assuming exit 1 blocks when it doesn't.
*Memory hook:* **0 opens the gate, 2 slams it shut, and 1 merely grumbles from the sidewalk.**

### Q31. To re-inject context right after a compaction event, which hook/matcher should you use — and which should you NOT use?
---
**A:** Use SessionStart with the "compact" matcher. Do NOT use PostCompact — its output doesn't get fed back into the conversation.
*Memory hook:* SessionStart is the coach who re-enters the huddle after halftime; PostCompact writes a note that never reaches the players.

### Q60. Roughly how many hook events does Claude Code fire, and what does the InstructionsLoaded event let you do?
---
**A:** Around 30 hook events fire across the loop. InstructionsLoaded fires whenever a CLAUDE.md or rule file loads, letting you audit exactly what made it into context.
*Memory hook:* Thirty tripwires ring the property, and InstructionsLoaded is the one at the library door that logs every book that entered the room.

### Q61. For a SessionStart hook, what check ensures it only runs on brand-new sessions rather than every resume or compaction?
---
**A:** Check that `source=startup` — this scopes the hook to fresh starts only.
*Memory hook:* `source=startup` is the "opening day" sign that keeps the welcome banner from firing every time a regular customer walks back in.

### Q62. Which hook events ignore the normal blocking rules, and what happens on a non-zero exit for them?
---
**A:** Notification, SessionStart, and FileChange ignore blocking — a non-zero exit just shows stderr while execution carries on regardless.
*Memory hook:* Three events are the security cameras that record and complain but never lock the door.

## MCP inside Claude Code

### Q32. In Claude Code, what are the two MCP server transport types, and what's each for?
---
**A:** HTTP (remote services hosted by the provider) and Stdio (local processes running on your machine).
*Memory hook:* HTTP is a phone line to a remote office; Stdio is a walkie-talkie between two programs in the same room.

### Q33. How do you make sure your whole team automatically gets the same MCP servers in a Claude Code project?
---
**A:** Use Project-scoped servers via a `.mcp.json` file checked into version control.
*Memory hook:* Commit the team's shared toolkit in `.mcp.json`, like putting identical tools into every carpenter's workshop.

### Q34. What happens to Claude Code's context budget when many MCP servers are configured, even if unused? What's the automatic mitigation, and at what threshold does it kick in?
---
**A:** Every configured server's tool definitions load into context regardless of use. If MCP tools exceed 10% of the context window, Claude Code automatically switches to "tool search mode" (discovering tools on demand), though this may be less reliable.
*Memory hook:* Too many MCP menus fill the waiter’s clipboard; after 10%, Claude stops carrying them all and searches the restaurant's catalog on demand.

### Q35. Besides disabling unused servers, name two other ways to reduce MCP's context cost in Claude Code.
---
**A:** Prefer a CLI tool if one exists (e.g., `gh`, `aws` — no persistent tool definitions), or use a Skill instead (only name+description load until needed).
*Memory hook:* Use a power tool with no permanent catalog, or keep only a Skill's small label on the shelf until the full recipe is needed.

## Automating repeat work

### Q36. What is a "Routine," and what are its three trigger types?
---
**A:** A saved bundle of prompt + repo + connectors that runs on Anthropic's managed cloud infrastructure. Triggers: cron schedule, HTTP POST to its API endpoint, or a GitHub event.
*Memory hook:* A Routine is a packed lunch with three alarm clocks: **calendar**, **webhook**, or **GitHub activity**.

### Q37. Name two constraints on Routines as of this course.
---
**A:** They're a research preview; a recurring schedule runs at most hourly; each run starts from a fresh clone of the default branch and can only push to `claude/`-prefixed branches by default.
*Memory hook:* The Routine has a **research-preview** sign, an **hourly kitchen timer**, and a rule that every cook starts from a fresh pantry and labels output `claude/`.

### Q38. What does headless mode's `-p` flag skip auto-discovering, and what's the trade-off?
---
**A:** Skips auto-discovery of hooks, skills, plugins, MCP servers, and CLAUDE.md — you get Claude plus only explicitly allowed tools. Trade-off: much faster startup.
*Memory hook:* Headless `-p` is the express lane: no browsing every shelf before departure, so it leaves faster with only the luggage you named.

### Q39. How do you get structured, schema-constrained output from a headless Claude Code run?
---
**A:** Pair `--output-format json` with `--json-schema '<your schema>'`; the matching object lands in `structured_output`, extractable with `jq`.
*Memory hook:* Give Claude a mold and a label—JSON format plus schema—and `jq` lifts the finished object cleanly from the box.

### Q40. What does `--bare` mode provide, and when would you use it?
---
**A:** Deterministic mode — repeatable, predictable output run to run. Use it in CI pipelines that need identical results every time.
*Memory hook:* `--bare` is a metronome: the same beat every run, ideal when CI needs no improvisational jazz.

### Q41. What is the Agent SDK, and when should you reach for it over routines or headless mode?
---
**A:** A library (TypeScript/Python) that embeds Claude Code inside your own application. Reach for it when the automated work needs to live inside your own product, not run as an external job.
*Memory hook:* Routines are an outside courier; the Agent SDK puts the engine inside your own car.

### Q63. Where can you create a Routine?
---
**A:** From the web at claude.ai/code/routines, or inside Claude Code itself (e.g., `/schedule daily dependency audit at 9am`).
*Memory hook:* Book the recurring appointment from the front-desk website or by asking the concierge in the lobby — same calendar either way.

### Q64. How do you turn a single headless run into a multi-step automation?
---
**A:** Capture the session ID from the JSON output of a headless run, then resume that session later with full context.
*Memory hook:* The session ID is a claim ticket — hand it back later and headless Claude picks up exactly where it left the coat check.

### Q65. What does the Agent SDK's `query` function expose, and how do you consume its output?
---
**A:** The same primitives as the CLI — prompt plus options (allowed tools, system prompt, permission mode) — and you iterate the streamed messages it returns.
*Memory hook:* `query` is the CLI's steering wheel bolted into your own dashboard — same controls, but you watch the road stream by message by message.

## GitHub integration

### Q42. What does the managed "Code Review" service do, and what does it explicitly NOT do?
---
**A:** Posts inline PR comments (tagged by severity, with a summary table) analyzed against the full codebase. It never approves or blocks a PR, and there's no managed autofix — findings only.
*Memory hook:* Managed Code Review is the inspector with a clipboard, not the judge with a gavel or the mechanic with a wrench.

### Q43. When should you reach for the DIY GitHub Action instead of the managed Code Review service?
---
**A:** When the job is more than review — implementing changes from a comment, running scheduled reports, or any custom CI task where Claude needs to actually take action.
*Memory hook:* Hire the DIY Action when the reviewer must leave the clipboard, pick up the wrench, and repair the machine.

### Q66. Who enables managed Code Review, and what's a limit on its availability?
---
**A:** An org admin enables it from Claude Code admin settings, installs the GitHub app, and picks repos plus when it runs (PR open, every push, or "@claude review" comments). It's a research preview currently available on Team and Enterprise plans only.
*Memory hook:* Only the building manager can install the elevator inspector, and right now it's only offered in the Team and Enterprise wings of the building.

### Q67. What command walks you through installing the Claude Code GitHub Action, and what's the action's identifier in a workflow file?
---
**A:** `/install-github-app` (requires repo admin) sets it up, including the API key secret. The action itself is `anthropics/claude-code-action@v1`.
*Memory hook:* `/install-github-app` is the installer wizard; `anthropics/claude-code-action@v1` is the part number you'd quote to reorder it.

### Q68. Besides trigger_phrase, prompt, and claude_args, what other inputs does the Claude Code GitHub Action take for authentication and hosting provider?
---
**A:** `anthropic_api_key`, `github_token` (defaults to `secrets.GITHUB_TOKEN`), and provider switches for routing through Bedrock or Vertex instead of the direct API.
*Memory hook:* Behind the doorbell phrase sits a keycard (api key), a badge that defaults to the building's own (github_token), and a choice of back-door delivery route (Bedrock/Vertex).

### Q69. Besides an @claude mention in a PR/issue comment, what other ways can trigger the Claude Code GitHub Action?
---
**A:** A cron schedule (e.g., firing at 9am UTC for a rollup report) and `workflow_dispatch`, which allows manual runs triggered from the Actions tab.
*Memory hook:* The action answers three doorbells: someone says the trigger phrase, the kitchen timer goes off, or someone just walks up and presses the manual button.

## Verifying unsupervised runs

### Q44. What does "verify in proportion to how little you watched" mean in practice?
---
**A:** The less supervision a run had, the more rigorous your post-hoc verification needs to be — a quick glance for a watched session, a full reconstructed check for an unattended/CI run.
*Memory hook:* A casserole watched in the oven needs a glance; a casserole cooked overnight by a robot needs a thermometer, recipe check, and taste test.

### Q45. Why should you read `git diff` yourself instead of trusting Claude's summary of an unsupervised run?
---
**A:** A tidy, well-written summary can still omit or gloss over an unexpectedly touched file — reading the actual diff is the only way to catch that.
*Memory hook:* The manager's summary says “renovated the kitchen”; the receipts and floor plan reveal the robot also knocked a hole in the garage.

### Q70. What permission mode should unattended/CI runs stay in, and why not bypass mode?
---
**A:** Auto mode — the classifier still reviews each action for danger even though nobody's watching. Bypass mode skips all checks, so it should only run inside an isolated container/VM, not as your default unattended setting.
*Memory hook:* Even an empty house keeps the smoke detector armed; you don't rip the batteries out just because no one's home.

### Q71. When making tests "the real gate" on an unsupervised run, what's the actual question you need answered — not just "did tests pass"?
---
**A:** Whether tests passed AND whether Claude actually ran them or only claimed to — don't leave that to trust. Wire it as a hook (a Stop hook running tests, or a PostToolUse hook linting/type-checking) so it fires on every run whether or not you remember to ask.
*Memory hook:* Don't just ask the student "did you take the test" — check the proctor's sign-in sheet, because "yes" and "I said yes" are not the same sentence.

### Q72. As part of verifying an unsupervised run, what is a "cold second opinion," and why is it valuable alongside reading the diff and running tests?
---
**A:** Opening a fresh session or subagent, with no memory of how the change was built, to review the changed code. It has no stake in the original approach and catches what the original run talked itself past.
*Memory hook:* Bring in a doctor who never met the first doctor's diagnosis — a fresh set of eyes doesn't inherit the first one's blind spot.

### Q73. How do you verify a headless run specifically?
---
**A:** By its JSON result and exit code.
*Memory hook:* A headless run leaves no one to interview — you check the flight recorder's black box, not a pilot's story.

## Plugins

### Q46. What is a "plugin" in Claude Code, and what problem does it solve?
---
**A:** One installable unit bundling skills, subagents, hooks, and MCP server configs. It solves the problem of manually copying a working `.claude` setup between machines/teammates.
*Memory hook:* A plugin is a suitcase with the whole travel kit—skills, helpers, guards, and connectors—instead of loose socks copied one at a time.

### Q47. Why is "the plugin passed automated community review" not the same as "safe to install"?
---
**A:** Automated review catches some issues but not everything; a plugin still runs code on your machine with your privileges, and its hooks fire on every matching tool call whether or not you've read them.
*Memory hook:* A safety inspector glanced at the suitcase; that does not mean the stranger carrying it should get your house keys.

### Q48. When you install a plugin, do its hooks replace yours or run alongside them?
---
**A:** Alongside — hooks stack.
*Memory hook:* Installing a plugin adds another security guard to the line; it does not fire the guards you already hired.

### Q49. What's the only required field in a plugin manifest (`.claude-plugin/plugin.json`), and what does it do?
---
**A:** `name` — it namespaces the plugin's skills as `company-name:skill-name`, preventing collisions with other plugins/skills.
*Memory hook:* The manifest name is the apartment number that keeps two “verification” signs from hanging on the same door.

### Q50. What does `/loop` do, and how do you stop it?
---
**A:** It runs a prompt at an interval between turns, which is useful for polling external state; press Escape to stop the loop.
*Memory hook:* `/loop` is an alarm clock that asks the same lookout to check the horizon every few minutes; Escape turns off the alarm.

### Q51. What does `.worktreeinclude` control?
---
**A:** It lists git-ignored files, such as local environment or configuration files, that should be copied into each new worktree.
*Memory hook:* `.worktreeinclude` is the spare-key list that lets every new workshop receive the local tools kept out of the public blueprint.

### Q52. Why should project-level hook scripts use `$CLAUDE_PROJECT_DIR` in their paths?
---
**A:** It makes the paths portable across clones and worktrees, while project-level hooks in `.claude/settings.json` can be shared with the team through version control.
*Memory hook:* `$CLAUDE_PROJECT_DIR` is a GPS coordinate that recalculates at each clone instead of hard-coding one person's street address.

### Q53. What is the enforcement difference between `PreToolUse` and `PostToolUse` hooks?
---
**A:** `PreToolUse` runs before a tool call and can block it; `PostToolUse` runs after the tool has already run, so it is too late to prevent that call.
*Memory hook:* `PreToolUse` is the bouncer at the door; `PostToolUse` is the cleanup crew after the party has already happened.

### Q54. What do the main custom GitHub Action inputs `trigger_phrase`, `prompt`, and `claude_args` control?
---
**A:** `trigger_phrase` defines the phrase that starts the action, `prompt` supplies the task for Claude, and `claude_args` passes raw CLI arguments such as a turn limit.
*Memory hook:* The Action needs a **doorbell phrase**, a **task card**, and a **tool belt of CLI settings**.

### Q74. What are the commands to install a single plugin versus rolling out a shared marketplace for a whole team?
---
**A:** `/plugin install org-name@plugin-name` (then `/reload-plugins`) installs one plugin directly. `/plugin marketplace add your-org/claude-plugins` registers a private marketplace once, after which every install resolves through it for centralized discovery, version tracking, and updates.
*Memory hook:* One command grabs a single tool off the shelf; the other bolts a whole company hardware store onto everyone's wall.

### Q75. Which keys in a plugin's own settings.json actually get honored, and what does the `agent` key let a plugin do?
---
**A:** Only the `agent` and subagent status line keys are honored. The `agent` key promotes one of the plugin's subagents to the main thread — its system prompt, tool restrictions, and model — meaning simply enabling the plugin can change Claude Code's default behavior.
*Memory hook:* A plugin can't rewrite your whole rulebook, but it does get one master key: the power to swap in its own agent as the one driving the car.

### Q76. How does Claude Code discover a plugin's components on disk, and where do a plugin's hooks and MCP servers live?
---
**A:** By directory convention using the same `.claude` shape as a normal project — one folder per skill, one markdown file per subagent under `agents/`, and `hooks/hooks.json` plus `.mcp.json` at the plugin root.
*Memory hook:* A plugin is your own `.claude` folder, just shrink-wrapped and shipped — same rooms, same floor plan, someone else built it first.
