# 03 · Building with the Claude API — Quiz

## Platform basics [Bonus: Claude Platform 101]

### Q1. What are the three "layers" of the Claude Platform, and what's the shorthand for how they relate?
---
**A:** Primitives (Messages API, tool use, files, web search, code execution, MCP, skills), Infrastructure (managed agents, retries, queues, observability), Controls (dashboards, evals). Shorthand: build with primitives, scale on infrastructure, run with control.
*Memory hook:* Think **LEGO bricks → factory machinery → cockpit dashboard**: build, scale, then steer.

### Q2. What three things must you specify in a basic `messages.create` call?
---
**A:** A model, a max_tokens limit, and a messages array (role + content).
*Memory hook:* Every request needs a **brain**, a **ceiling**, and a **conversation envelope**.

### Q3. Why should you always loop over `response.content` and check block types, rather than treating it as a plain string?
---
**A:** Because `response.content` is an array of blocks — Claude can return multiple block types (text, tool_use, thinking, etc.) in a single response, not just plain text.
*Memory hook:* Treat the response like an airport baggage carousel: one turn can unload text, a tool request, and thinking in separate bags.

### Q4. Where should you store your Anthropic API key, and why?
---
**A:** In a `.env.local` file, kept out of version control — hardcoding keys in source files is a common way they leak on GitHub.
*Memory hook:* Put the API key in a locked drawer, never on the billboard outside your GitHub house.

### Q5. Rank the four model tiers from fastest/cheapest to most capable/expensive, and give the one-line use case for each.
---
**A:** Haiku (fastest/cheapest — high-volume, low-complexity: classification, extraction, routing) → Sonnet (balanced — most production work) → Opus (deep reasoning, complex analysis, multi-step coding) → Fable (most capable, reserved for the toughest problems, highest cost).
*Memory hook:* Picture a lineup: **hummingbird Haiku**, **workhorse Sonnet**, **professor Opus**, and **rocket-powered Fable**.

### Q6. What's the recommended model-selection workflow before writing production code?
---
**A:** Set up a simple eval (20–30 representative examples), run them through Haiku first — if quality holds, stop there; otherwise step up to Sonnet; only reach for Opus when the task genuinely needs it. Pick the cheapest model whose output you'd actually ship.
*Memory hook:* Audition the cheapest actor first; only pay for the superstar when the understudy cannot deliver the scene.

### Q7. What does `response.usage` report, and why does it matter?
---
**A:** Input and output token counts for the request — this is what your API bill is calculated on.
*Memory hook:* `response.usage` is the taxi meter: it tells you how much conversation went in and how much came back out.

### Q8. What does `stop_reason: "tool_use"` signal in a Messages API response?
---
**A:** That Claude wants to call a tool rather than finish its turn — your code should execute the requested tool and feed the result back (vs. `end_turn`, which means Claude is done).
*Memory hook:* `tool_use` is the receptionist handing you a work order; `end_turn` is the “office closed” sign.

## Agent loop & tool use

### Q9. List the five steps of the basic agent loop.
---
**A:** 1) Send a message with tools available. 2) Claude responds with a final answer or a tool-use request. 3) Your code executes the tool. 4) You send the result back as a tool_result. 5) Repeat until stop_reason is end_turn.
*Memory hook:* It is a five-person relay: **ask → choose → run → report → repeat** until the baton reaches the finish line.

### Q10. What are the three parts of a tool definition?
---
**A:** name, description, input_schema.
*Memory hook:* A tool needs a **name tag**, a **sign explaining when to use it**, and an **intake form**.

### Q11. What is the #1 cause of an agent misfiring or failing to use an available tool?
---
**A:** A vague tool description — Claude reads the description to decide whether/when to call the tool, so it must be specific.
*Memory hook:* A taxi driver cannot help if the sign says only “go somewhere”; give the tool an address and a reason to stop there.

### Q12. What does the SDK's "tool runner" do for you?
---
**A:** Builds the JSON schema from your actual function's types/docs and runs the entire tool-use/tool-result loop internally — you just call `toolRunner(...)` and `.untilDone()` instead of hand-writing a while loop and stop-reason switch.
*Memory hook:* The tool runner is a stage manager who handles the cue sheet, props, and repeated entrances while you wait for the final curtain.

### Q13. Where does the `effort` parameter for extended thinking go, and what are its five levels?
---
**A:** Inside `output_config` (not next to the thinking block). Levels: low, medium, high (default), xhigh, max.
*Memory hook:* Put the reasoning-depth knob **inside the control panel**, with five settings from whisper to rocket launch.

### Q14. When should you skip extended thinking?
---
**A:** For simple classification, extraction, or boilerplate tasks — thinking just adds latency and cost there without improving results.
*Memory hook:* Do not summon Einstein to alphabetize a grocery list; save the deep thinking for the hard puzzle.

### Q15. What's the key difference between a "server tool" and a "client tool"?
---
**A:** Server tools (web search, code execution, web fetch) are declared by you but run by Anthropic server-side — no agent loop needed, result comes back in the same response. Client tools (memory, bash) run where your own code runs.
*Memory hook:* Server tools are the restaurant kitchen cooking behind the wall; client tools are the ingredients and stove in your own kitchen.

### Q16. For the built-in text editor tool, what does Anthropic provide vs. what must you build?
---
**A:** Anthropic provides the tool schema (Claude knows how to ask for file operations). You must write the actual implementation that performs the file reads/writes/edits Claude requests.
*Memory hook:* Anthropic gives you the **menu**, but your application must hire the mechanic who actually turns the wrench.

### Q17. What does enabling `fine_grained=True` for tool streaming change, and what's the trade-off?
---
**A:** It disables the API's server-side JSON validation so chunks stream immediately as Claude generates them — but your code must now handle potentially invalid/malformed JSON, since the API isn't catching it for you.
*Memory hook:* Fine-grained streaming swaps bottled water for a firehose: faster flow, but you need your own filter and bucket.

### Q18. What response block type indicates Claude called a server-side tool like web search or code execution?
---
**A:** A `server_tool_use` block (paired with a corresponding tool-result block, e.g. `bash_code_execution_tool_result`).
*Memory hook:* `server_tool_use` is the airport stamp showing that the request flew to Anthropic's runway, not your local terminal.

## Tool design & MCP integration (API side)

### Q19. Give the one-line distinction between Tools, Skills, and MCP.
---
**A:** Tools = your systems (you own the code). Skills = your processes/procedures (instructions, not integrations). MCP = third-party services (the provider owns the integration).
*Memory hook:* **Tools are your garage, Skills are your recipe book, MCP is the courier to someone else's store.**

### Q20. What two things does a Claude API request need to connect to and use an MCP server?
---
**A:** An `mcp_servers` entry declaring the connection (type, URL, name, optional auth token) and a `tools` entry of type `mcp_toolset` naming the server, which grants access to its tools (default: all of them).
*Memory hook:* MCP needs both the **address in your contacts** and the **permission pass at the door**.

### Q21. When calling an MCP server from the Claude API, do you need to write JSON schemas for its tools yourself?
---
**A:** No — Claude introspects the MCP server and discovers its tools/schemas automatically.
*Memory hook:* You do not redraw a restaurant's menu by hand; Claude walks in, reads the posted menu, and learns the available dishes.

### Q22. How do you restrict an MCP toolset to read-only access (e.g., allow search but block posting)?
---
**A:** Set `"default_config": {"enabled": False}` to disable everything by default, then explicitly enable only the specific read tools you want in `"configs"`.
*Memory hook:* Turn the museum's doors off by default, then unlock only the **read-only exhibit rooms**—never the posting or deletion vault.

### Q23. What tool-design principle does Claude Code's own toolset (bash, read, write, edit, glob, grep) illustrate?
---
**A:** Give agents abstract, combinable tools rather than hyper-specialized ones — this lets Claude creatively combine primitives to handle situations the developer never explicitly anticipated, instead of being limited to a fixed menu of specific actions.
*Memory hook:* A Swiss Army knife beats a drawer full of one-use gadgets when the problem surprises you.

## Context management & reliability (API layer)

### Q24. Name Anthropic's four context-management patterns.
---
**A:** Just-in-time context, server-side compaction, prompt caching, the memory tool.
*Memory hook:* Remember the **pull-out drawer**, **vacuum-sealed suitcase**, **reusable sticky note**, and **long-term backpack**.

### Q25. Which of the four context-management patterns is a design pattern rather than an API feature?
---
**A:** Just-in-time context.
*Memory hook:* It is a driving strategy—“look up the next street when needed”—not a button you install in the car.

### Q26. How do you enable server-side compaction in an API request, and what does it do?
---
**A:** Add `context_management: {"edits": [{"type": "compact"}]}` — the API automatically summarizes old turns into a single block once input crosses a trigger threshold; you don't have to track conversation length yourself.
*Memory hook:* When the suitcase hits its weight limit, a packing service compresses yesterday's clothes into one neat travel cube.

### Q27. For the memory tool, who implements the storage backend — Anthropic or you?
---
**A:** You — Claude reads/writes to a memory directory via tool calls, but you own the actual storage (file system, database, etc.). Anthropic auto-injects a system instruction telling Claude to check memory before starting.
*Memory hook:* Claude is the librarian who asks for the file; you own the filing cabinet, locks, and backup copies.

### Q28. How long does the prompt cache live, and what invalidates it?
---
**A:** One hour. It's invalidated by any change to the content up to and including the cache breakpoint — even adding one word like "please".
*Memory hook:* The cache is a photocopied guest list valid for one hour; change one comma and the bouncer demands a new list.

### Q29. What's the minimum content size (in tokens) for something to be cacheable, and is it enabled automatically?
---
**A:** 1024 tokens (summed across everything up to the breakpoint). No — caching is never automatic; you must manually add a cache breakpoint with `cache_control: {"type": "ephemeral"}` using the longhand block format.
*Memory hook:* The cache toll booth opens only for a **1,024-token caravan**, and you must put up the “reuse this” sign yourself.

### Q30. What two parts of a typical request are the best candidates for prompt caching, and why?
---
**A:** System prompts and tool definitions — they rarely change between requests, making them ideal for reuse.
*Memory hook:* Cache the room's wallpaper and the toolbox on the wall; swap only the visitor's changing request.

### Q31. What processing order does Claude use for a request (relevant to placing cache breakpoints), and how many breakpoints can you set?
---
**A:** Tools, then system prompt, then messages. Up to 4 cache breakpoints total.
*Memory hook:* Claude stacks the **toolbox**, then the **director's script**, then the **actor's lines**—with four bookmarks allowed.

### Q32. Why is the Files API paired with code execution, given the code execution sandbox has no network access?
---
**A:** Since the Docker sandbox can't make external calls, the Files API is the only way to get data in (upload once, reference by file ID via a container_upload block) and get generated outputs back out.
*Memory hook:* The sandbox is an airlocked lab: the Files API is the loading hatch for samples and finished specimens.

## Prompt engineering techniques

### Q33. What are the five steps of the prompt-engineering iteration cycle?
---
**A:** Set a goal → write an initial prompt → evaluate it → apply a technique → re-evaluate (repeat the last two).
*Memory hook:* Run a scientist's loop: **hypothesis → experiment → score → adjust → repeat**.

### Q34. What's the difference between being "clear" and being "direct" in a prompt's opening line?
---
**A:** Clear = simple, unambiguous language stating exactly what you want. Direct = phrasing it as an instruction (not a question), starting with an action verb like "Write" or "Generate."
*Memory hook:* A clear sign says “the red door”; a direct sign says “**Open** the red door”—no riddle, no shrug.

### Q35. What are the two types of "specificity" you can add to a prompt, and when should each be used?
---
**A:** Output quality guidelines (list of qualities the output should have — length, structure, tone) — use in almost every prompt. Process steps (explicit steps to follow) — use for complex/critical-thinking tasks, not simple requests.
*Memory hook:* **Guidelines label the finished cake** (“small, neat, chocolate”); **process steps teach the recipe** when the bake is complicated.

### Q36. When are XML tags most valuable in a prompt?
---
**A:** When including large amounts of context/data, mixing different content types (e.g., code and documentation), or interpolating multiple variables — they create clear boundaries so Claude doesn't confuse instructions with data.
*Memory hook:* XML tags are bright labeled bins: **instructions here**, **code there**, **customer data over there**.

### Q37. What's the difference between one-shot and multi-shot prompting?
---
**A:** One-shot provides a single example to establish a pattern; multi-shot provides multiple examples, typically to cover different scenarios or edge cases.
*Memory hook:* One-shot is one Polaroid; multi-shot is a flipbook showing the pattern through every awkward edge case.

### Q38. Where should you source your best few-shot examples from?
---
**A:** Your highest-scoring outputs from a prompt evaluation run — use those real input/output pairs as examples, plus context on WHY they're good.
*Memory hook:* Do not train with bloopers; give Claude the gold-medal footage and explain what made each performance win.

### Q39. A meal-plan-generation prompt scored 2.32 as a naive request. Which single technique bumped it to 3.92, and which technique bumped it further to 7.86?
---
**A:** Being clear and direct got it to 3.92. Adding specific output guidelines (calorie totals, macros, meal timing, portion sizes, etc.) got it to 7.86.
*Memory hook:* The meal plan evolved from “feed me” to “write the order” to a nutritionist's blueprint with calories, macros, timing, and portions.

## Prompt evaluation

### Q40. What's the difference between prompt engineering and prompt evaluation?
---
**A:** Prompt engineering is the toolkit of techniques for writing better prompts. Prompt evaluation is measuring how well a prompt actually performs through automated/objective testing.
*Memory hook:* Engineering designs the bridge; evaluation drives test trucks over it to see whether it holds.

### Q41. List the five steps of a typical eval workflow.
---
**A:** Draft a prompt → create an eval dataset → feed inputs through Claude → feed outputs through a grader → change the prompt and repeat.
*Memory hook:* Think of an assembly line: **blueprint → test pieces → production run → inspector → redesign**.

### Q42. Why use Haiku (rather than the model you're actually testing) to generate your eval dataset?
---
**A:** Dataset generation isn't the task being evaluated — a faster, cheaper model is appropriate and saves cost/time.
*Memory hook:* Hire the speedy intern to create the audition cards; save the expensive star for the performance you are actually judging.

### Q43. What API technique ensures clean JSON parsing when generating a dataset from Claude?
---
**A:** Prefill the assistant's response with an opening like ` ```json ` and set a stop sequence of `["```"]`, then `json.loads()` the returned text.
*Memory hook:* Start the JSON train inside its fenced tunnel, then stop it at the closing gate before parsing the cargo.

### Q44. Name the three types of graders and one good use case for each.
---
**A:** Code grader (syntax validation, length checks, keyword presence). Model grader (response quality, instruction-following, safety). Human grader (comprehensiveness, depth, nuanced relevance).
*Memory hook:* Use a **compiler**, a **coach**, and a **panel of judges**—each catches a different kind of failure.

### Q45. What critical piece of information should you ask a model grader for beyond just a numeric score, and why?
---
**A:** Strengths, weaknesses, and reasoning alongside the score — without that context, model graders tend to default to middling scores (around 6) regardless of actual output quality.
*Memory hook:* A teacher's “6/10” is far more useful when the margin says exactly which bridge collapsed and how to rebuild it.

### Q46. Roughly how many test cases should you use during active prompt-development iteration vs. final validation?
---
**A:** Small (2–3 cases) during active development for fast iteration; scale up to tens/hundreds for final validation.
*Memory hook:* Tune a guitar with a few test notes, then play the full concert before declaring the instrument ready.

## RAG & agentic search

### Q47. What problem does RAG solve, and how, at a high level?
---
**A:** Documents too large to fit in a single prompt. RAG preprocesses documents into chunks, then at query time retrieves only the chunks most relevant to the user's question instead of including the whole document.
*Memory hook:* RAG is a librarian who brings the three relevant pages instead of dropping the entire 800-page encyclopedia on your desk.

### Q48. Name the four text-chunking strategies and one trade-off for each.
---
**A:** Size-based (simple/reliable, but can cut mid-sentence — mitigated with overlap). Structure-based (cleanest chunks, but needs guaranteed document structure). Sentence-based (practical middle ground). Semantic-based (most relevant, but computationally expensive).
*Memory hook:* Four scissors: a **ruler**, a **heading cutter**, a **sentence trimmer**, and a **meaning detective**—the smarter the cut, the more work it costs.

### Q49. Which chunking strategy is the common production default, and why?
---
**A:** Size-based chunking with overlap — it's simple, reliable, and works with any content type including code.
*Memory hook:* Use a paper shredder that leaves a little overlap between strips so no sentence falls into the crack.

### Q50. What is a text embedding?
---
**A:** A numerical vector representation of a text's meaning, where each dimension is a value between -1 and +1; individual dimensions aren't directly human-interpretable.
*Memory hook:* An embedding is a GPS coordinate for meaning: humans cannot read each coordinate, but nearby ideas land near one another on the map.

### Q51. Does Anthropic provide an embeddings API? What's the recommended alternative?
---
**A:** No — the recommended provider is VoyageAI (separate account, `VOYAGE_API_KEY`).
*Memory hook:* Claude supplies the tour guide, but VoyageAI supplies the map-making service—and you need that service's own pass.

### Q52. Why does semantic search alone sometimes fail for queries like a specific incident ID (e.g., "INC-2023-Q4-011")?
---
**A:** Semantic search optimizes for conceptual/meaning similarity, not exact term matching, so it can miss the chunk that literally contains the specific ID.
*Memory hook:* Ask for a serial number and a “similar-looking product” is useless; semantic search understands the idea but may miss the exact stamped code.

### Q53. What are the four steps of the BM25 algorithm?
---
**A:** Tokenize the query → count term frequency across documents → weight rarer terms more heavily than common ones → return documents containing the most instances of the highest-weighted terms.
*Memory hook:* BM25 is a word detective: split the clues, count footprints, spotlight rare footprints, and rank the rooms with the most evidence.

### Q54. What is "hybrid search" in a RAG pipeline, and why use it?
---
**A:** Running semantic search and BM25 (lexical) search in parallel and merging results — combines conceptual understanding with precision on exact terms/IDs.
*Memory hook:* Hybrid search uses both a **face-recognition expert** and a **fingerprint expert**, then compares their suspect lists.

## Agentic orchestration patterns

### Q55. What's the fundamental difference between a "workflow" and an "agent"?
---
**A:** A workflow is a predefined series of Claude calls for a known problem where you can picture the exact steps ahead of time. An agent is given a goal and a set of tools and figures out its own steps.
*Memory hook:* A workflow rides a train track; an agent is a ranger handed a destination and a backpack who chooses the trail.

### Q56. What's the general recommendation for choosing between workflows and agents, and why?
---
**A:** Prefer workflows wherever possible; only use agents when truly required — workflows give higher reliability and predictability, and users care about consistent results, not architectural sophistication.
*Memory hook:* If the bakery recipe is known, use the conveyor belt; bring in an improvising chef only when the next ingredient is genuinely unknown.

### Q57. Describe the "parallelization" workflow pattern and one concrete benefit.
---
**A:** Split one complex decision into multiple independent sub-tasks, run them simultaneously, then aggregate results into a final decision. Benefit: focused attention per sub-task means more thorough/accurate analysis than one call juggling everything.
*Memory hook:* Send five detectives down five hallways at once, then bring their clue boards together in the briefing room.

### Q58. What problem does "chaining" solve, and what's the two-step fix for a prompt with many constraints Claude keeps partially ignoring?
---
**A:** It solves the "long prompt problem" where a single prompt with many rules gets partially violated. Fix: step 1 generates a first draft, step 2 is a focused revision request addressing only the violated constraints.
*Memory hook:* Do not make one chef juggle twelve timers; let the first pass cook, then give the second pass one focused correction card.

### Q59. Describe the "routing" workflow pattern in two steps.
---
**A:** Step 1: a Claude call categorizes the input into one of your predefined categories. Step 2: forward the input to the one specialized pipeline built for that category.
*Memory hook:* A triage nurse puts each patient into the right colored lane, then sends them to the matching specialist.

### Q60. What is the "Evaluator-Optimizer" pattern?
---
**A:** A producer creates output, a grader evaluates it against criteria, and if it doesn't pass, feedback loops back to the producer for revision — repeating until the grader accepts the output.
*Memory hook:* An art teacher circles the weak parts of a painting, the artist revises, and the canvas returns until it earns the gold star.

### Q61. In the datetime-tools example, how does Claude handle a request like "When does my 90-day warranty expire?" when it doesn't yet have enough information?
---
**A:** It recognizes it's missing required information and asks the user when the item was purchased before it can calculate the expiration — an agent capability a rigid workflow would struggle to replicate without an explicit branch.
*Memory hook:* The warranty clerk does not guess; it holds up a red question card: “What was the purchase date?”

### Q62. Given a scenario where you know a user will only ever submit an image and need a STEP file back through fixed steps (describe → model → render → grade → fix), which pattern is this, specifically?
---
**A:** Evaluator-Optimizer, implemented as a workflow (the steps are fully known in advance, and it includes a producer→grader→feedback loop).
*Memory hook:* It is an assembly line with a quality inspector who sends a crooked STEP model back for another pass.

## Managed agents [Bonus: Claude Platform 101]

### Q63. What are the four primitives of managed agents, in order?
---
**A:** Agent (persona: model/system prompt/tools, reusable) → Environment (where it runs) → Session (a single run — the unit of work) → Events (the messages flowing in/out).
*Memory hook:* Stage a play: hire the **actor**, build the **set**, open a **performance**, then watch the **cue stream**.

### Q64. Is managed agents a special-access feature you need to request?
---
**A:** No — it's enabled by default for every API account.
*Memory hook:* The managed-agent theater has an “open to all API accounts” sign—no velvet-rope invitation required.

### Q65. What's the correct order of operations: open the event stream, or send the kickoff message, first? Why?
---
**A:** Open the event stream first, then send the kickoff message — the stream only delivers events that occur after it opens.
*Memory hook:* Turn on the security camera before the race starts; otherwise the first runner disappears before you can watch.

### Q66. Name the three key event types to watch for when consuming a managed-agent session stream.
---
**A:** `agent.message` (Claude's text), `agent.tool_use` (which tool was picked), `session.status_idle` (the agent is done).
*Memory hook:* Watch for the **speech bubble**, the **wrench**, and finally the **sleeping cat** that says the session is idle.

### Q67. In a managed-agent workflow with rubrics, what does the "grader" do?
---
**A:** A separate component, running in its own context window, evaluates the agent's output against defined success criteria (a rubric) and gives feedback; the agent iterates and resubmits until it passes.
*Memory hook:* A cold judge receives the performance, fills out a scorecard, and sends the performer back to rehearsal.

### Q68. When should you reach for managed agents instead of writing your own agent loop?
---
**A:** When the loop would run too long (minutes to hours), touch too many tools/files, or needs to survive interruptions (resumability).
*Memory hook:* Use managed agents for a long expedition where the guide may be interrupted, not for a quick walk around the block.

### Q69. What does the `system` parameter control in a Messages API request?
---
**A:** It sets Claude's persona and behavior, such as instructing it to act as a terse senior code reviewer.
*Memory hook:* The `system` prompt is the director's script pinned backstage: “You are the terse senior reviewer.”

### Q70. Why might a production application route different task types to different Claude models?
---
**A:** Routing lets the application match each task to the cheapest model that meets its quality needs—for example, Haiku for classification, Sonnet for drafting, and Opus for complex reasoning—balancing quality, latency, and cost.
*Memory hook:* An airport sends bicycles to the local shuttle, business travelers to the express lane, and emergencies to the helicopter.

### Q71. What changes are needed when adding another client-side tool to a hand-written agent loop?
---
**A:** Add the tool definition to the `tools` array and add a corresponding dispatch case in the tool-execution function; the rest of the loop can remain the same.
*Memory hook:* Add a new restaurant dish to the menu and give the kitchen one station that knows how to cook it; the dining room stays unchanged.

### Q72. Why combine code graders with model graders in a prompt evaluation pipeline?
---
**A:** Code graders provide objective checks such as syntax or keyword validation, while model graders assess qualities such as completeness and instruction-following; combining them covers both format correctness and response quality.
*Memory hook:* Pair a **metal detector** for hard defects with a **taste tester** for quality—the suitcase must be safe and delicious.

### Q73. How does reciprocal rank fusion help a hybrid search system?
---
**A:** It combines the rank positions from different retrieval methods, such as semantic search and BM25, rewarding results that appear near the top across multiple ranked lists.
*Memory hook:* RRF is the committee secretary who merges several judges' scoreboards and favors the candidate who keeps appearing near the top.
