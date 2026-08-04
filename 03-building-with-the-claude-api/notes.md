# 03 · Building with the Claude API

Source: Building with the Claude API (Anthropic Academy) — official CCA-F prep course #3.
Bonus background folded in from Claude Platform 101 (not on the official list, but directly overlapping content), marked **[Bonus]** below.

## [Bonus] What the Claude Platform is
Anthropic's infrastructure for building with Claude **programmatically**: a REST API, SDKs (multiple languages), CLIs, and a Console (API keys, usage, managed agents, prompt testing).

### Three layers (shorthand: build with primitives, scale on infrastructure, run with control)
1. **Primitives** — API building blocks: Messages API, tool use, files, web search, code execution, MCP servers, skills.
2. **Infrastructure** — what's needed to scale agentic systems past a prototype: managed agents, retries, queues, observability.
3. **Controls** — running production systems: dashboards, evals.

## Your first API call
- Core function: `client.messages.create()` — requires **model**, **max_tokens**, **messages** (array of `{role, content}` objects).
- Store API keys in `.env.local`, never hardcode (leak risk on GitHub).
- `system` parameter sets persona/behavior (e.g., "terse senior code reviewer").
- **`response.content` is an array of blocks**, not a plain string — always loop and check `block.type` (text, tool_use, thinking, etc.), since Claude can return multiple block types in one response.
- A request's **stop_reason** tells you what happened: `end_turn` (done) vs `tool_use` (Claude wants to call a tool).

## Choosing the right model
- Four tiers: **Fable** (most capable, above Opus, highest cost — reserve for work where the extra capability is worth paying for), **Opus** (deep reasoning, complex analysis, multi-step coding — slowest/highest cost of the core three), **Sonnet** (balanced — sweet spot for most production work), **Haiku** (fastest/cheapest — high-volume, low-complexity: classification, extraction, routing).
- Set up a simple eval first: 20–30 representative examples, score each model against them.
- **Workflow:** run examples through Haiku first → if quality holds, done → else step up to Sonnet → only reach for Opus when the task truly needs it. The right model is the *cheapest one whose output you'd actually ship*.
- `response.usage` reports input/output token counts — what your bill is based on.
- In production: route different task types to different models within the same endpoint/pipeline (e.g., classify with Haiku, draft with Sonnet, only escalate RFP-style responses to Opus).

## Agent loop & tool use

### What an agent is
An agent = an autonomous version of Claude running both sides of the messaging loop without a human in the middle: receives a task, picks a tool, executes code in a loop until Claude decides the task is done.

### The agent loop (5 steps)
1. Send a message to Claude with `tools` available.
2. Claude responds with either a final answer or a tool-use request.
3. Your code executes that tool.
4. You send the result back to Claude (as a `tool_result` block).
5. Repeat until `stop_reason` is `end_turn`.
You own the loop and the tools; Claude owns the reasoning. (Managed agents, below, host this loop for you.)

### Tool definitions — anatomy
A tool is a JSON schema with three parts:
- `name`
- `description` — **this is what Claude reads to decide whether/when to call the tool.** Vague descriptions are the #1 cause of agents misfiring or not using available tools. Aim for 3–4 sentences: what it does, when to use it, what it returns.
- `input_schema` — standard JSON Schema (not AI-specific; a general data-validation spec).
Best practice: name schemas `function_name_schema` to pair with their function. You can ask Claude itself to generate a schema from your function code.

### Multiple tools
Claude reads all provided tool descriptions and picks the right one(s) per turn — sometimes calling several tools in the same turn, sometimes sequentially. Adding a new tool = add to the `tools` array + add a dispatch case in your tool-execution function. No other code changes needed.

### The SDK tool runner
Ships in TypeScript/Python/Ruby SDKs. Takes your actual functions, auto-generates the JSON schema from types/docs, and runs the full tool-use/tool-result loop internally.
- `client.beta.messages.toolRunner({ model, messages, tools: [fn1, fn2] })`
- `runner.untilDone()` returns the final assistant message after all tool exchanges settle.
- Eliminates: the while loop, the stop-reason switch, manual schema-writing, manual message-array pushing.

### Extended thinking
- Lets Claude reason step-by-step before responding; generates visible reasoning tokens (chain of thought) alongside the final answer.
- With **Opus 4.7, thinking is adaptive** — no token budget to set; enable with `thinking: {"type": "adaptive"}`.
- Depth controlled by **`effort`** parameter, which goes **inside `output_config`** (not next to the thinking block): `low | medium | high (default) | xhigh | max`.
- Use for: math/multi-step logic, code debugging, regulatory/trade-off analysis. Skip for simple classification/extraction/boilerplate — just adds latency/cost there.

### Built-in (server) tools vs. client tools
- **Server tools**: declared by you, *run by Anthropic* server-side. No agent loop needed — result comes back in the same response. Examples: `web_search`, `code_execution` (Python sandbox), `web_fetch`. Look for `server_tool_use` blocks and tool-result blocks (e.g., `bash_code_execution_tool_result`) alongside text blocks.
- **Client tools**: run where your code runs, but the SDK ships the schema + a runner for you. Examples: memory (Claude reads/writes memory across sessions), bash (persistent shell).

### The text editor tool (built-in but you implement it)
- Gives Claude file/directory manipulation: view file/directory, view line ranges, replace text, create files, insert at a line, undo edits.
- **The schema is built into Claude, but you must write the implementation** — Claude knows how to *ask* for file ops; your code must actually perform them.
- Schema stub varies by model (e.g., `text_editor_20250124` for Claude 3.7 Sonnet).

### Environment inspection
- A named agent-design concept: **before acting, look; after acting, look again.** Claude can only perceive its environment through tool results, so the loop must explicitly feed it fresh state rather than assuming an action landed as expected.
- Concrete forms: reading a file before editing it (so the edit targets current content, not a stale assumption), listing a directory before deciding whether to create a file, taking a screenshot after a Computer Use action to confirm the click/type actually worked.
- Skipping this step is a common source of agent failures — the agent "flies blind," repeating or compounding an action that silently failed or had an unexpected effect.

### Fine-grained tool calling (streaming detail)
- Default streaming behavior: the API **buffers and validates** JSON, only sending complete top-level key-value pairs at a time — causes delay-then-burst streaming.
- `fine_grained=True` disables server-side JSON validation → chunks stream immediately as generated, no buffering delay — but **your code must handle invalid/partial JSON** (Claude might emit malformed values like `undefined`).
- Trade-off: faster/more granular UX vs. losing the API's validation safety net.

### The batch tool (trick to get parallel tool calls in one turn)
- By default, Claude *can* call multiple tools in a single turn, but often plays it safe and calls them one at a time across several turns — costing extra round trips when the calls are actually independent.
- **The trick**: give Claude a single `batch_tool` whose input schema accepts an **array of sub-tool invocations** (each with its own name + input). Claude packs several independent calls into one `batch_tool` request instead of issuing them serially.
- Your code unpacks the array, executes each sub-call (optionally in parallel), and returns all results together as one `tool_result`.
- Use when several tool calls are known to be independent (e.g., "look up the weather in 5 different cities") — collapses N round trips into 1, cutting latency significantly.

## Multimodal input: images, PDFs, and citations

### Image support (vision)
- Claude accepts image content blocks alongside text in the `messages` array — as base64-encoded data or a URL. A single message can include multiple images.
- Supported formats: JPEG, PNG, GIF, WebP. Larger/higher-resolution images cost more input tokens; downscale when full resolution isn't needed for the task.
- Best practices: when an image and text appear in the same message, **put the image block before the text** describing it. Give multiple images clear labels/captions so Claude can refer to "the second image" unambiguously. Works across multi-turn conversations (Claude can reference images from earlier turns still in context).

### PDF support
- Claude can process a PDF directly as a `document` content block (base64 or URL) — it reads **both the extracted text and the visual layout** (tables, charts, embedded images), not just OCR'd text.
- Subject to page-count and file-size limits; each page is billed roughly like an image (visual tokens) plus its extracted text tokens.
- Preferable to pre-extracting text yourself when the PDF's visual structure (tables, figures) carries meaning a plain-text dump would lose.

### Citations
- Opt in per document block with `"citations": {"enabled": true}`. Claude's response then includes citation blocks that point back to the exact source location backing each claim.
- Two location types depending on source format: **`citation_page_location`** (PDFs — page start/end) and **`citation_char_location`** (plain text — character start/end index).
- Use to ground generated claims in verifiable source spans and let a UI let users click through from an answer straight to the supporting passage.

## Computer Use

### What it is
- A server-side agentic capability that lets Claude operate a computer like a human would: view the screen, move the mouse, click, type, scroll, and run shell commands — instead of calling purpose-built APIs.
- Useful for driving software that has no API (legacy apps, most consumer GUIs) or for automating UI-level testing/flows.
- Because Claude can take arbitrary UI actions, it must run against a **sandboxed environment** (a VM or container), never a production desktop.

### How Computer Use works (the loop)
1. Your code sends Claude a screenshot of the current screen state (plus the task).
2. Claude responds with a tool-use request for a computer action (e.g., `screenshot`, `left_click`, `type`, `key`).
3. Your code executes that action against the sandboxed environment.
4. Your code takes a **new screenshot** and sends it back as the tool result — Claude has no other way to perceive whether the action worked.
5. Repeat until Claude decides the task is complete.
This is the general agent loop specialized to a visual environment: instead of a JSON tool result, the "result" Claude reads is a fresh image of what changed on screen.

## Tool design & MCP integration (from the API side)

### Tools vs. Skills vs. MCP — pick the right one
- **Tools** — connect Claude to *your* systems (your DB, your APIs). You own the code and the maintenance.
- **Skills** — teach Claude a *procedure* (your report template, checklist). Instructions, not necessarily integrations.
- **MCP** — connects Claude to *third-party* services; the provider maintains the integration.
Shorthand: tools are for your stuff, skills are for your processes, MCP is for everyone else's stuff. (Full MCP server-building content lives in 06-introduction-to-mcp.)

### Connecting to an MCP server from the Claude API
Two pieces in the request:
- `mcp_servers` — declares the connection: type, URL, name, optional `authorization_token`.
- A tool entry with `"type": "mcp_toolset", "mcp_server_name": "..."` — grants access; default is all tools on that server.
Claude introspects the server itself and discovers available tools/schemas — **you never write a tool schema by hand** for an MCP-provided tool. (As of the course, the MCP connector required a beta header.)

### Scoping down MCP tool access
Disable everything by default, then enable only specific tools:
```
"default_config": {"enabled": False},
"configs": {"search_messages": {"enabled": True}, "list_channels": {"enabled": True}}
```
Useful for keeping a server read-only (e.g., Slack: allow search/list, block post/delete).

### Tool design principle: keep tools abstract
Give Claude **abstract, combinable** tools rather than hyper-specialized ones. Claude Code's own toolset is generic — `bash`, `read`, `write`, `edit`, `glob`, `grep` — not "refactor_code" or "install_dependencies." This lets Claude combine primitives creatively to handle scenarios developers never explicitly planned for. (Echoed again below in Agentic Orchestration.)

## Context management & reliability (API/platform layer)

### What counts as context
Everything Claude sees on a turn: system prompt, message history, tool definitions and results, attached files/skills, thinking blocks. You pay for it in and out; once the window is full, the request fails. **Goal: fit the right things in, not everything.**

### Anthropic's four context-management patterns
1. **Just-in-time context** (design pattern, not an API feature) — don't preload everything; load what's needed now, let the agent pull more via tools when it asks (e.g., a `lookup_building_code` tool instead of the whole code book in the system prompt).
2. **Server-side compaction** — opt in via `context_management: {"edits": [{"type": "compact"}]}` in the request. The API auto-summarizes old turns once input crosses a trigger threshold; you don't track length yourself.
3. **Prompt caching** — mark stable parts of a request (system prompt, tool defs, long docs) for reuse across calls at a fraction of the cost.
4. **The memory tool** — for context that must survive across sessions (preferences, running notes). Claude reads/writes a memory directory via tool calls; **you implement the storage backend** (file system, DB, etc.); Anthropic auto-injects an instruction telling Claude to check memory before starting work.
In production you typically layer all four (e.g., cache system prompt + tools, pull data just-in-time via tools). Managed agents ship with caching and compaction on by default.

### Prompt caching — the rules
- Cache lives for **one hour**; only useful if you resend the same content within that window.
- **Not automatic** — you must manually add a **cache breakpoint** to a block using the longhand block form with `cache_control: {"type": "ephemeral"}`.
- Everything *before and including* the breakpoint gets cached; content after is processed normally.
- Follow-up requests only hit the cache if content up to the breakpoint is **identical** — even adding "please" invalidates it.
- Breakpoints can span multiple messages/types: text blocks, system prompts, tool definitions, image blocks, tool use/result blocks.
- **System prompts and tool definitions are the best caching candidates** (they rarely change).
- Processing order: **tools → system prompt → messages**. You can place **up to 4 cache breakpoints** total.
- **Minimum cacheable size: 1024 tokens** (summed across everything up to the breakpoint) — a short "Hi there!" won't qualify.

### Code execution + Files API (context-adjacent reliability tool)
- **Files API**: upload files once, get a file ID, reference the ID in future messages instead of re-encoding base64 data every time.
- **Code execution**: server tool, runs Python in an isolated Docker sandbox with **no network access**; Claude can execute code multiple times per conversation.
- Combined: since the sandbox has no network, the Files API is the way to get data in (upload CSV → `container_upload` block referencing the file ID) and out (download generated files via file IDs in `code_execution_output` blocks).
(Claude Code's own context-management commands — `/compact`, `/clear`, `/context` — and unsupervised-run verification patterns live in 07-claude-code-in-action.)

## Prompt engineering techniques

### The iterative improvement cycle
1. Set a goal → 2. Write an initial prompt → 3. Evaluate it → 4. Apply a technique → 5. Re-evaluate. Repeat steps 4–5. Each technique should be measurable — track score before/after.
Example scores through iteration (meal-plan prompt): baseline 2.32 → clear & direct 3.92 → + specific guidelines 7.86.

### Technique 1: Being clear and direct
- The **first line is the most important part of the prompt**.
- **Clear**: simple language, state exactly what you want, no ambiguity.
- **Direct**: use instructions, not questions; start with an action verb ("Write," "Create," "Generate," "Identify").
- Bad: "I was reading about renewable energy... what countries use it?" → Good: "Identify three countries that use geothermal energy. Include generation stats for each."

### Technique 2: Being specific
Two types of specificity, often combined:
- **Output quality guidelines** — list qualities the output should have (length, structure, tone, elements to include). Use these in almost every prompt — they're your safety net.
- **Process steps** — explicit steps for Claude to follow. Use for complex/critical-thinking tasks (troubleshooting, decision-making, multi-angle analysis) — NOT needed for simple requests.

### Technique 3: Structure with XML tags
- Use custom, descriptive tag names (`<sales_records>`, `<athlete_information>`, `<my_code>`/`<docs>`) to delimit different content types/sections in a prompt.
- Most valuable when: including large amounts of context/data, mixing content types (code + docs), or interpolating multiple variables.
- Prevents Claude from confusing your instructions with the data, or confusing different data sources with each other.

### Technique 4: Providing examples (one-shot / multi-shot prompting)
- Give Claude sample input/output pairs, wrapped in XML tags like `<sample_input>` / `<ideal_output>`.
- Best for: corner cases (e.g., sarcasm in sentiment analysis), complex output formats (specific JSON structure), exact style/tone, ambiguous-input handling.
- **One-shot** = single example to establish a pattern. **Multi-shot** = multiple examples to cover different scenarios/edge cases.
- Mine your **highest-scoring eval outputs** as examples — use real 10/10 input/output pairs.
- Add **context explaining why** an example output is good, not just the pair itself — this helps Claude generalize the reasoning, not just the format.
- Professional prompts typically combine several techniques: clear/direct opening + specific guidelines/steps + XML-tagged structure + one or more high-quality examples.

## Prompt evaluation

### Prompt engineering vs. prompt evaluation
- **Prompt engineering** = techniques for writing better prompts (above).
- **Prompt evaluation** = measuring how well a prompt actually performs, via automated testing (test against expected answers, compare versions, review for errors).

### Why evals matter: the three paths after writing a prompt
1. Test once, ship it — high risk of breaking on unexpected real-world input.
2. Test a few times, patch a corner case or two — better, but users will still surprise you.
3. **Run it through an evaluation pipeline, score it, iterate on objective metrics** — more upfront work/cost, much higher confidence.
Most engineers default to paths 1–2 and underestimate real-world edge cases.

### The 5-step typical eval workflow
1. **Draft a prompt** (baseline).
2. **Create an eval dataset** — sample inputs representative of production traffic (can be hand-written or Claude-generated; real datasets may have hundreds/thousands of records).
3. **Feed through Claude** — merge each dataset input into the prompt template, send to Claude, collect outputs.
4. **Feed through a grader** — score each output, typically 1–10.
5. **Change prompt and repeat** — modify, re-run, compare average scores.

### Generating test datasets
- Use a **faster/cheaper model (Haiku)** for dataset generation — it's not the task being tested.
- Generate via **prefilling + stop sequences** for clean JSON parsing: prefill the assistant turn with ` ```json ` and set `stop_sequences=["```"]`, then `json.loads()` the result.
- Keep dataset small (2–3 cases) during active development to iterate fast; scale up (tens/hundreds) for final validation.
- Include a `format` field per test case (e.g., `"python"`, `"json"`, `"regex"`) so a code grader knows which validator to apply.

### Grading approaches
| Type | How it works | Good for |
|---|---|---|
| **Code grader** | Programmatic checks | Length, keyword presence/absence, syntax validity (JSON/Python/Regex), readability scores |
| **Model grader** | Another Claude call evaluates the output | Response quality, instruction-following, completeness, helpfulness, safety |
| **Human grader** | Manual review | Nuanced quality, comprehensiveness, depth, relevance — most flexible but slow/tedious |

- Code-based: syntax validators (`json.loads`, `ast.parse`, `re.compile`) wrapped in try/except: success → score 10, failure → score 0. Improve format compliance by pre-filling the response with a code-block opener to force raw-code-only output. Combine code + model scores, e.g. `(model_score + syntax_score) / 2`.
- Model-based: prompt the grading model for **strengths, weaknesses, reasoning, AND a score** — not just a bare number. **Without that context, models default to middling scores (~6)** regardless of actual quality. Store `score` + `reasoning` per test case; average across the dataset.

### The `PromptEvaluator` pattern
- `max_concurrent_tasks` controls parallelism — start low (e.g., 3) to avoid rate limits.
- `generate_dataset(task_description, prompt_inputs_spec, output_file, num_cases)` auto-generates a small test set.
- `run_evaluation(run_prompt_function, dataset_file, extra_criteria)` lets you inject additional grading criteria.
- Output includes both a numeric score and a detailed HTML report — use the report to see exactly *where* and *why* a prompt is failing.
- Low first-attempt scores (e.g., 2.3/10) are normal and expected — the value is in the improvement trend, not the starting number.

## Retrieval Augmented Generation (RAG) & agentic search

### Why RAG
Handles documents too big to fit in a single prompt. Instead of stuffing everything in, break documents into chunks and include only the most relevant ones per question.
**Problems with "stuff everything into the prompt":** hard length limits, degraded effectiveness on very long prompts, higher cost, slower processing.
**RAG benefits:** focuses Claude on relevant content, scales to very large/multiple documents, cheaper & faster.
**RAG challenges:** requires a preprocessing (chunking) step, needs a search mechanism to find "relevant" chunks, included chunks might miss needed context, many chunking approaches to choose between.

### Text chunking strategies
| Strategy | How | Trade-off |
|---|---|---|
| **Size-based** | Fixed-length character/token chunks, with overlap to avoid cutting mid-sentence | Simplest, most reliable fallback, works with any content (incl. code); can still fragment meaning |
| **Structure-based** | Split on document structure (headers, e.g. `\n## `) | Cleanest chunks when document formatting is guaranteed; fails on unstructured text |
| **Sentence-based** | Split into sentences via regex, group N per chunk with overlap | Practical middle ground for general text documents |
| **Semantic-based** | NLP determines how related consecutive sentences are, groups by relatedness | Most relevant chunks, but computationally expensive and complex |
**Production default**: size-based chunking with overlap — simple, reliable, works with any document type.

### Text embeddings & semantic search
- A **text embedding** = a numerical vector representation of a text's meaning (each dimension ranges -1 to +1); individual dimensions aren't human-interpretable.
- **Semantic search** uses embeddings to find chunks related in *meaning*, not just exact words.
- **Anthropic does not provide embeddings** — the recommended provider is **VoyageAI** (separate account/API key, `VOYAGE_API_KEY` env var). Model example: `voyage-3-large`.

### BM25 — lexical (keyword) search
Semantic search alone can miss **exact term matches** (e.g., a specific incident ID like "INC-2023-Q4-011") because it optimizes for conceptual similarity, not literal string matches.
**BM25 (Best Match 25)** algorithm steps:
1. Tokenize the query.
2. Count term frequency across documents.
3. Weight rarer terms higher (common words like "a" get low weight; specific/rare terms get high weight).
4. Return documents with the most instances of the highest-weighted terms.
**Hybrid search** = run semantic search + BM25 in parallel, merge results — gets both conceptual relevance AND exact-term precision. This is the standard production pattern for robust RAG retrieval.

### Reranking results
- A second, more expensive refinement pass run **after** initial retrieval: pull a wider candidate set (e.g., top 20–50 via embeddings/BM25) optimized for *recall*, then rerank those candidates for *precision* using a more discriminating method — often an LLM call (or dedicated reranking model) that scores each candidate's actual relevance to the query.
- Only the reordered top-K after reranking gets sent to Claude as context — catches cases where a fast first-pass retriever ranks a mediocre chunk above a truly relevant one.
- Trade-off: extra latency/cost per query, so it's typically applied only to the shortlist, not the whole corpus.

### Contextual retrieval
- Problem: an isolated chunk often loses the surrounding context that makes it findable or interpretable — e.g., a chunk that just says "revenue grew 3%" without saying which company or quarter it's from.
- Fix: **before embedding/indexing**, run each chunk through an LLM along with the full document (or a summary of it) and have the model generate a short "situating" sentence — e.g., "This chunk is from Acme Corp's Q4 2023 earnings report, discussing automotive-division revenue." Prepend that generated context to the chunk.
- Improves both semantic search (richer embedding) and BM25 (adds indexable keywords the original chunk lacked) — a preprocessing-time fix rather than a query-time one like reranking.

## Agentic orchestration patterns

### Core distinction: Workflows vs. Agents
- **Workflow** — a predefined series of Claude calls solving a *known* problem; you can picture the exact steps ahead of time.
- **Agent** — Claude gets a goal + a set of tools and figures out its own path; used when you *don't* know exactly what task/parameters will come in.

| | Benefits | Downsides |
|---|---|---|
| **Workflows** | Higher accuracy (focus per subtask), easier to test/evaluate (steps are known), more predictable, better for well-defined problems | Less flexible, more constrained UX, more upfront design work |
| **Agents** | Flexible UX, can combine tools in unexpected ways, handles novel situations, can ask for more input | Lower success rate, harder to test/instrument (steps unknown ahead), less predictable |
**General recommendation: prefer workflows where possible; only reach for agents when truly required.** Users want reliability, not "a fancy agent."

### Four workflow patterns
1. **Parallelization** — split one complex task into multiple independent sub-tasks, run them **simultaneously**, then **aggregate** the results into a final decision. Sub-tasks don't need to be identical. Use when a decision can be broken into meaningfully independent evaluations.
2. **Chaining** — break a large task into smaller **sequential** subtasks that build on each other. Solves the "long prompt problem": a single prompt with many constraints often gets partially ignored. Two-step fix: step 1 generates content (imperfectly), step 2 is a focused revision pass targeting specific fixes only.
3. **Routing** — **categorize** the input first (via a Claude call), then **forward it to one specialized pipeline** built for that category. Input goes to only ONE pipeline, letting each be deeply optimized for its case.
4. **Evaluator-Optimizer** — producer creates output → grader evaluates it against criteria → if rejected, feedback loops back to producer for revision → repeat until accepted. Example: image→CAD workflow (describe object → model it → render → grade rendering against original image → fix issues → repeat).

### Agents and tools
Agent = goal + tool set; Claude figures out the combination of tool calls itself, including recognizing when it needs more info from the user (e.g., asking for a purchase date before calculating a warranty expiration). Design tools to be abstract/combinable, not hyper-specialized — echoes the tool-design principle above.

### Decision rule for the exam
Given a scenario: if the steps are knowable in advance → design a workflow (and pick parallelization/chaining/routing/evaluator-optimizer based on shape). If the steps are NOT knowable in advance and the model needs to improvise across a flexible toolset → design an agent.

## [Bonus] Managed agents
A suite of APIs for building/deploying agents **at scale, hosted on Anthropic's infrastructure** instead of your own server. You define an agent (tools, persona, capabilities), configure a sandbox environment, and fire off sessions from your app — Claude runs the agent loop inside an isolated container (file system access, bash execution, web search) and you just stream events back out. **Enabled by default for every API account.**

### The four primitives (in order)
1. **Agent** — persona: model, system prompt, toolset. Reusable across many runs.
2. **Environment** — where the agent runs: cloud or local, networking config.
3. **Session** — a single run of an agent inside an environment. The unit of work.
4. **Events** — messages flowing in/out: actions, tool calls, results, replies.
Your app talks to a session → the session drives work inside the environment → everything flows back out through the event stream. You send events in and read events out — **not** a manual while loop.

### Building the smallest managed agent (5 steps)
1. **Create the agent**: `client.beta.agents.create(name, model, system, tools=[{"type": "agent_toolset_...", ...}])` — the bundled "agent toolset" gives file/bash/web tools without writing your own.
2. **Create the environment**: `client.beta.environments.create(name, config={"type": "cloud", "networking": {"type": "unrestricted"}})`.
3. **Create the session**: `client.beta.sessions.create(agent=agent.id, environment_id=environment.id, title=...)`.
4. **Open the event stream FIRST, then send the kickoff message** — the stream only delivers events that occur *after* it opens, so opening order matters.
5. **Consume the stream**, watching for: `agent.message` (Claude's text), `agent.tool_use` (which tool it picked), `session.status_idle` (agent is done).

### Key building blocks
- **Rubrics & graders**: define success criteria; a separate grader (its own context window) evaluates output against the rubric; Claude iterates until it passes.
- **Memory**: agent reads a memory store before starting, writes to it when done — enables cross-session continuity (e.g., "prices are 15% lower since last week" instead of static repeats).
- **Multi-agent coordination**: a coordinator agent delegates to specialist agents, each running in its own context window on a shared file system; coordinator synthesizes their findings.
- **Permissions policies**: sensitive actions (e.g., posting to Slack) pause for human approval before executing.
- Sessions can run in **parallel** (multiple tickets/tasks at once, each its own container).

### When to use managed agents vs. a manual loop
Reach for managed agents when the loop would run too long (minutes/hours), touch too many files/tools, or need to survive a network hiccup (resumability). Reach for a manual loop when you want full control.

## Course-detail implementation patterns

### Request and response mechanics

A direct API request uses an Anthropic client, a model name, a max token budget, and a list of user/assistant messages. Keep the API key in an environment file that is excluded from version control. The max_tokens value is a safety ceiling, not a promise that Claude will fill the budget.

For a multi-turn conversation, append both sides of every turn yourself: the user message sent to Claude and the complete assistant response returned by Claude. A system prompt is a separate parameter used for stable role, domain, and behavior instructions; omit it when no system instruction is needed.

Temperature changes sampling randomness on a 0–1 scale. Lower values are generally better for factual extraction, coding, and deterministic transformations; medium values suit explanation and constrained creativity; higher values suit brainstorming and creative variation. Temperature does not guarantee a different answer or correctness.

### Streaming

For long responses, use streaming so the application can render progress instead of waiting for the final message. The event sequence includes message start, content-block start, content-block delta, content-block stop, message delta, and message stop. The Python helpers client.messages.stream, stream.text_stream, and get_final_message provide progressively simpler ways to consume the same lifecycle. Streaming improves time-to-first-token and user experience; it does not change the underlying quality or remove the need to handle errors and incomplete output.

### Structured output choices

A small, controlled extraction can use assistant prefill: begin the assistant turn with an opening JSON marker, ask for JSON only, and use a stop sequence after the closing marker. Strip the returned text and parse it with a JSON parser. The same technique can constrain code, lists, or CSV when the delimiter is unambiguous.

For production extraction, a tool schema is usually more reliable than hoping a free-form response is valid JSON:

- Define a dedicated tool whose input schema is the exact output contract.
- Set tool choice to force that tool when extraction is mandatory; use auto when Claude may decide whether structured output is needed.
- Use a generic to_json-style tool for rapid prototypes or changing requirements, but prefer a dedicated schema for complex, high-accuracy production work.
- Validate the returned values in application code; a schema validates shape, not business truth.

### Tool-loop invariants

The reliable tool-use sequence is: send the user's request and tool definitions; receive an assistant response containing text and/or tool_use blocks; execute each requested tool on the server; send the complete assistant content back; send a user message containing matching tool_result blocks; then request the final answer.

Preserve the complete assistant content array, not only the visible text. Each tool result must reference the matching tool-use ID, and the original tool schemas should remain available on the follow-up request. For multiple tools, dispatch by tool name and decide whether independent calls can run in parallel. Treat tool inputs as untrusted data and validate authorization, arguments, timeouts, and side effects before execution.

Fine-grained tool streaming exposes partial JSON input events. It can reduce latency for large inputs, but disabling top-level validation means the application may observe incomplete or invalid JSON and must buffer, validate, and recover deliberately. The built-in text editor pattern supplies a schema and expected operations; the application still implements the actual file executor and should constrain paths and operations.

### Web search

The built-in web search tool is a server-side tool with a name, type, and max-uses limit; allowed domains can narrow the search. The response may contain server tool-use/result blocks, text, and citation blocks. Use it for current facts, source discovery, and fact checking when the organization has enabled the capability, then inspect citations and distinguish sourced claims from Claude's synthesis.

## Prompt engineering and evaluation

The course's improvement loop is: define the goal, draft a prompt, evaluate representative outputs, choose a technique, and evaluate again. Put the most important instruction early, use direct action verbs, and always state output-quality criteria. Add explicit process steps for troubleshooting, decisions, or critical-thinking tasks where the route matters as much as the answer.

XML-style tags are useful when separating instructions, context, examples, and source material. One-shot and multi-shot examples should show the desired format and edge cases; explain why an example is good when the distinction is subtle. High-scoring evaluation examples can be mined into future prompt examples.

A formal prompt evaluation pipeline has five parts:

1. Draft the prompt and define the rubric.
2. Build a representative dataset, starting with only a few examples during development.
3. Run Claude on each example.
4. Have a code, model, or human grader assign a score and explain weaknesses.
5. Change the prompt and repeat, retaining the dataset as a regression suite.

Use a cheaper model such as Haiku for dataset generation when appropriate, but ensure the final evaluation reflects production conditions. Code graders can validate JSON, parse Python syntax, or check regular expressions; model graders should request strengths, weaknesses, reasoning, and a score rather than a bare number. A low first score is useful evidence, not a failure of the evaluation setup.

## Retrieval and agent design reminders

RAG should retrieve only the context needed for the current question. Chunk documents by size, structure, sentence boundaries, or semantic shifts, with size-and-overlap as a practical baseline. Embeddings capture semantic similarity; BM25 catches exact identifiers and rare terms. A hybrid retriever is often stronger than either alone, and retrieved chunks still need source labels and an answer policy.

Use a workflow when the steps and control flow are known: chaining, routing, parallelization, or evaluator–optimizer loops. Use an agent when the path is genuinely unknown and the model needs to choose tools or next steps dynamically. For either design, define stop conditions, timeouts, permissions, observability, and a human approval path for consequential side effects. Managed agents are most useful when a manual loop would run for a long time, touch many tools or files, or need resumability.
