# 03 · Building with the Claude API — Quiz

## Platform basics [Bonus: Claude Platform 101]

### Q1. What are the three "layers" of the Claude Platform, and what's the shorthand for how they relate?
---
**A:** Primitives (Messages API, tool use, files, web search, code execution, MCP, skills), Infrastructure (managed agents, retries, queues, observability), Controls (dashboards, evals). Shorthand: build with primitives, scale on infrastructure, run with control.

### Q2. What three things must you specify in a basic `messages.create` call?
---
**A:** A model, a max_tokens limit, and a messages array (role + content).

### Q3. Why should you always loop over `response.content` and check block types, rather than treating it as a plain string?
---
**A:** Because `response.content` is an array of blocks — Claude can return multiple block types (text, tool_use, thinking, etc.) in a single response, not just plain text.

### Q4. Where should you store your Anthropic API key, and why?
---
**A:** In a `.env.local` file, kept out of version control — hardcoding keys in source files is a common way they leak on GitHub.

### Q5. Rank the four model tiers from fastest/cheapest to most capable/expensive, and give the one-line use case for each.
---
**A:** Haiku (fastest/cheapest — high-volume, low-complexity: classification, extraction, routing) → Sonnet (balanced — most production work) → Opus (deep reasoning, complex analysis, multi-step coding) → Fable (most capable, reserved for the toughest problems, highest cost).

### Q6. What's the recommended model-selection workflow before writing production code?
---
**A:** Set up a simple eval (20–30 representative examples), run them through Haiku first — if quality holds, stop there; otherwise step up to Sonnet; only reach for Opus when the task genuinely needs it. Pick the cheapest model whose output you'd actually ship.

### Q7. What does `response.usage` report, and why does it matter?
---
**A:** Input and output token counts for the request — this is what your API bill is calculated on.

### Q8. What does `stop_reason: "tool_use"` signal in a Messages API response?
---
**A:** That Claude wants to call a tool rather than finish its turn — your code should execute the requested tool and feed the result back (vs. `end_turn`, which means Claude is done).

## Agent loop & tool use

### Q9. List the five steps of the basic agent loop.
---
**A:** 1) Send a message with tools available. 2) Claude responds with a final answer or a tool-use request. 3) Your code executes the tool. 4) You send the result back as a tool_result. 5) Repeat until stop_reason is end_turn.

### Q10. What are the three parts of a tool definition?
---
**A:** name, description, input_schema.

### Q11. What is the #1 cause of an agent misfiring or failing to use an available tool?
---
**A:** A vague tool description — Claude reads the description to decide whether/when to call the tool, so it must be specific.

### Q12. What does the SDK's "tool runner" do for you?
---
**A:** Builds the JSON schema from your actual function's types/docs and runs the entire tool-use/tool-result loop internally — you just call `toolRunner(...)` and `.untilDone()` instead of hand-writing a while loop and stop-reason switch.

### Q13. Where does the `effort` parameter for extended thinking go, and what are its five levels?
---
**A:** Inside `output_config` (not next to the thinking block). Levels: low, medium, high (default), xhigh, max.

### Q14. When should you skip extended thinking?
---
**A:** For simple classification, extraction, or boilerplate tasks — thinking just adds latency and cost there without improving results.

### Q15. What's the key difference between a "server tool" and a "client tool"?
---
**A:** Server tools (web search, code execution, web fetch) are declared by you but run by Anthropic server-side — no agent loop needed, result comes back in the same response. Client tools (memory, bash) run where your own code runs.

### Q16. For the built-in text editor tool, what does Anthropic provide vs. what must you build?
---
**A:** Anthropic provides the tool schema (Claude knows how to ask for file operations). You must write the actual implementation that performs the file reads/writes/edits Claude requests.

### Q17. What does enabling `fine_grained=True` for tool streaming change, and what's the trade-off?
---
**A:** It disables the API's server-side JSON validation so chunks stream immediately as Claude generates them — but your code must now handle potentially invalid/malformed JSON, since the API isn't catching it for you.

### Q18. What response block type indicates Claude called a server-side tool like web search or code execution?
---
**A:** A `server_tool_use` block (paired with a corresponding tool-result block, e.g. `bash_code_execution_tool_result`).

## Tool design & MCP integration (API side)

### Q19. Give the one-line distinction between Tools, Skills, and MCP.
---
**A:** Tools = your systems (you own the code). Skills = your processes/procedures (instructions, not integrations). MCP = third-party services (the provider owns the integration).

### Q20. What two things does a Claude API request need to connect to and use an MCP server?
---
**A:** An `mcp_servers` entry declaring the connection (type, URL, name, optional auth token) and a `tools` entry of type `mcp_toolset` naming the server, which grants access to its tools (default: all of them).

### Q21. When calling an MCP server from the Claude API, do you need to write JSON schemas for its tools yourself?
---
**A:** No — Claude introspects the MCP server and discovers its tools/schemas automatically.

### Q22. How do you restrict an MCP toolset to read-only access (e.g., allow search but block posting)?
---
**A:** Set `"default_config": {"enabled": False}` to disable everything by default, then explicitly enable only the specific read tools you want in `"configs"`.

### Q23. What tool-design principle does Claude Code's own toolset (bash, read, write, edit, glob, grep) illustrate?
---
**A:** Give agents abstract, combinable tools rather than hyper-specialized ones — this lets Claude creatively combine primitives to handle situations the developer never explicitly anticipated, instead of being limited to a fixed menu of specific actions.

## Context management & reliability (API layer)

### Q24. Name Anthropic's four context-management patterns.
---
**A:** Just-in-time context, server-side compaction, prompt caching, the memory tool.

### Q25. Which of the four context-management patterns is a design pattern rather than an API feature?
---
**A:** Just-in-time context.

### Q26. How do you enable server-side compaction in an API request, and what does it do?
---
**A:** Add `context_management: {"edits": [{"type": "compact"}]}` — the API automatically summarizes old turns into a single block once input crosses a trigger threshold; you don't have to track conversation length yourself.

### Q27. For the memory tool, who implements the storage backend — Anthropic or you?
---
**A:** You — Claude reads/writes to a memory directory via tool calls, but you own the actual storage (file system, database, etc.). Anthropic auto-injects a system instruction telling Claude to check memory before starting.

### Q28. How long does the prompt cache live, and what invalidates it?
---
**A:** One hour. It's invalidated by any change to the content up to and including the cache breakpoint — even adding one word like "please".

### Q29. What's the minimum content size (in tokens) for something to be cacheable, and is it enabled automatically?
---
**A:** 1024 tokens (summed across everything up to the breakpoint). No — caching is never automatic; you must manually add a cache breakpoint with `cache_control: {"type": "ephemeral"}` using the longhand block format.

### Q30. What two parts of a typical request are the best candidates for prompt caching, and why?
---
**A:** System prompts and tool definitions — they rarely change between requests, making them ideal for reuse.

### Q31. What processing order does Claude use for a request (relevant to placing cache breakpoints), and how many breakpoints can you set?
---
**A:** Tools, then system prompt, then messages. Up to 4 cache breakpoints total.

### Q32. Why is the Files API paired with code execution, given the code execution sandbox has no network access?
---
**A:** Since the Docker sandbox can't make external calls, the Files API is the only way to get data in (upload once, reference by file ID via a container_upload block) and get generated outputs back out.

## Prompt engineering techniques

### Q33. What are the five steps of the prompt-engineering iteration cycle?
---
**A:** Set a goal → write an initial prompt → evaluate it → apply a technique → re-evaluate (repeat the last two).

### Q34. What's the difference between being "clear" and being "direct" in a prompt's opening line?
---
**A:** Clear = simple, unambiguous language stating exactly what you want. Direct = phrasing it as an instruction (not a question), starting with an action verb like "Write" or "Generate."

### Q35. What are the two types of "specificity" you can add to a prompt, and when should each be used?
---
**A:** Output quality guidelines (list of qualities the output should have — length, structure, tone) — use in almost every prompt. Process steps (explicit steps to follow) — use for complex/critical-thinking tasks, not simple requests.

### Q36. When are XML tags most valuable in a prompt?
---
**A:** When including large amounts of context/data, mixing different content types (e.g., code and documentation), or interpolating multiple variables — they create clear boundaries so Claude doesn't confuse instructions with data.

### Q37. What's the difference between one-shot and multi-shot prompting?
---
**A:** One-shot provides a single example to establish a pattern; multi-shot provides multiple examples, typically to cover different scenarios or edge cases.

### Q38. Where should you source your best few-shot examples from?
---
**A:** Your highest-scoring outputs from a prompt evaluation run — use those real input/output pairs as examples, plus context on WHY they're good.

### Q39. A meal-plan-generation prompt scored 2.32 as a naive request. Which single technique bumped it to 3.92, and which technique bumped it further to 7.86?
---
**A:** Being clear and direct got it to 3.92. Adding specific output guidelines (calorie totals, macros, meal timing, portion sizes, etc.) got it to 7.86.

## Prompt evaluation

### Q40. What's the difference between prompt engineering and prompt evaluation?
---
**A:** Prompt engineering is the toolkit of techniques for writing better prompts. Prompt evaluation is measuring how well a prompt actually performs through automated/objective testing.

### Q41. List the five steps of a typical eval workflow.
---
**A:** Draft a prompt → create an eval dataset → feed inputs through Claude → feed outputs through a grader → change the prompt and repeat.

### Q42. Why use Haiku (rather than the model you're actually testing) to generate your eval dataset?
---
**A:** Dataset generation isn't the task being evaluated — a faster, cheaper model is appropriate and saves cost/time.

### Q43. What API technique ensures clean JSON parsing when generating a dataset from Claude?
---
**A:** Prefill the assistant's response with an opening like ` ```json ` and set a stop sequence of `["```"]`, then `json.loads()` the returned text.

### Q44. Name the three types of graders and one good use case for each.
---
**A:** Code grader (syntax validation, length checks, keyword presence). Model grader (response quality, instruction-following, safety). Human grader (comprehensiveness, depth, nuanced relevance).

### Q45. What critical piece of information should you ask a model grader for beyond just a numeric score, and why?
---
**A:** Strengths, weaknesses, and reasoning alongside the score — without that context, model graders tend to default to middling scores (around 6) regardless of actual output quality.

### Q46. Roughly how many test cases should you use during active prompt-development iteration vs. final validation?
---
**A:** Small (2–3 cases) during active development for fast iteration; scale up to tens/hundreds for final validation.

## RAG & agentic search

### Q47. What problem does RAG solve, and how, at a high level?
---
**A:** Documents too large to fit in a single prompt. RAG preprocesses documents into chunks, then at query time retrieves only the chunks most relevant to the user's question instead of including the whole document.

### Q48. Name the four text-chunking strategies and one trade-off for each.
---
**A:** Size-based (simple/reliable, but can cut mid-sentence — mitigated with overlap). Structure-based (cleanest chunks, but needs guaranteed document structure). Sentence-based (practical middle ground). Semantic-based (most relevant, but computationally expensive).

### Q49. Which chunking strategy is the common production default, and why?
---
**A:** Size-based chunking with overlap — it's simple, reliable, and works with any content type including code.

### Q50. What is a text embedding?
---
**A:** A numerical vector representation of a text's meaning, where each dimension is a value between -1 and +1; individual dimensions aren't directly human-interpretable.

### Q51. Does Anthropic provide an embeddings API? What's the recommended alternative?
---
**A:** No — the recommended provider is VoyageAI (separate account, `VOYAGE_API_KEY`).

### Q52. Why does semantic search alone sometimes fail for queries like a specific incident ID (e.g., "INC-2023-Q4-011")?
---
**A:** Semantic search optimizes for conceptual/meaning similarity, not exact term matching, so it can miss the chunk that literally contains the specific ID.

### Q53. What are the four steps of the BM25 algorithm?
---
**A:** Tokenize the query → count term frequency across documents → weight rarer terms more heavily than common ones → return documents containing the most instances of the highest-weighted terms.

### Q54. What is "hybrid search" in a RAG pipeline, and why use it?
---
**A:** Running semantic search and BM25 (lexical) search in parallel and merging results — combines conceptual understanding with precision on exact terms/IDs.

## Agentic orchestration patterns

### Q55. What's the fundamental difference between a "workflow" and an "agent"?
---
**A:** A workflow is a predefined series of Claude calls for a known problem where you can picture the exact steps ahead of time. An agent is given a goal and a set of tools and figures out its own steps.

### Q56. What's the general recommendation for choosing between workflows and agents, and why?
---
**A:** Prefer workflows wherever possible; only use agents when truly required — workflows give higher reliability and predictability, and users care about consistent results, not architectural sophistication.

### Q57. Describe the "parallelization" workflow pattern and one concrete benefit.
---
**A:** Split one complex decision into multiple independent sub-tasks, run them simultaneously, then aggregate results into a final decision. Benefit: focused attention per sub-task means more thorough/accurate analysis than one call juggling everything.

### Q58. What problem does "chaining" solve, and what's the two-step fix for a prompt with many constraints Claude keeps partially ignoring?
---
**A:** It solves the "long prompt problem" where a single prompt with many rules gets partially violated. Fix: step 1 generates a first draft, step 2 is a focused revision request addressing only the violated constraints.

### Q59. Describe the "routing" workflow pattern in two steps.
---
**A:** Step 1: a Claude call categorizes the input into one of your predefined categories. Step 2: forward the input to the one specialized pipeline built for that category.

### Q60. What is the "Evaluator-Optimizer" pattern?
---
**A:** A producer creates output, a grader evaluates it against criteria, and if it doesn't pass, feedback loops back to the producer for revision — repeating until the grader accepts the output.

### Q61. In the datetime-tools example, how does Claude handle a request like "When does my 90-day warranty expire?" when it doesn't yet have enough information?
---
**A:** It recognizes it's missing required information and asks the user when the item was purchased before it can calculate the expiration — an agent capability a rigid workflow would struggle to replicate without an explicit branch.

### Q62. Given a scenario where you know a user will only ever submit an image and need a STEP file back through fixed steps (describe → model → render → grade → fix), which pattern is this, specifically?
---
**A:** Evaluator-Optimizer, implemented as a workflow (the steps are fully known in advance, and it includes a producer→grader→feedback loop).

## Managed agents [Bonus: Claude Platform 101]

### Q63. What are the four primitives of managed agents, in order?
---
**A:** Agent (persona: model/system prompt/tools, reusable) → Environment (where it runs) → Session (a single run — the unit of work) → Events (the messages flowing in/out).

### Q64. Is managed agents a special-access feature you need to request?
---
**A:** No — it's enabled by default for every API account.

### Q65. What's the correct order of operations: open the event stream, or send the kickoff message, first? Why?
---
**A:** Open the event stream first, then send the kickoff message — the stream only delivers events that occur after it opens.

### Q66. Name the three key event types to watch for when consuming a managed-agent session stream.
---
**A:** `agent.message` (Claude's text), `agent.tool_use` (which tool was picked), `session.status_idle` (the agent is done).

### Q67. In a managed-agent workflow with rubrics, what does the "grader" do?
---
**A:** A separate component, running in its own context window, evaluates the agent's output against defined success criteria (a rubric) and gives feedback; the agent iterates and resubmits until it passes.

### Q68. When should you reach for managed agents instead of writing your own agent loop?
---
**A:** When the loop would run too long (minutes to hours), touch too many tools/files, or needs to survive interruptions (resumability).
