# 04 · Claude with Amazon Bedrock — Quiz

### Q1. What are Claude's four model tiers as presented in this course, and where does Fable 5 sit relative to Opus?
---
**A:** Opus, Sonnet, Haiku, plus Fable 5 — a new tier that sits *above* Opus, at a significantly higher cost, reserved for the toughest challenges where the extra capability is worth paying for.
*Memory hook:* Picture four runners: **Opus** climbs the mountain, **Sonnet** runs the course, **Haiku** rides a scooter, and **Fable** launches a rocket.

### Q2. Which model tier does NOT support reasoning/extended-thinking capabilities, and what's it optimized for instead?
---
**A:** Haiku — optimized for speed and cost efficiency; best for real-time, user-facing interactions rather than complex problem-solving.
*Memory hook:* Haiku is the espresso shot: fast, cheap, and perfect when the customer needs an answer before the elevator arrives.

### Q3. What Python library and client do you use to connect to Bedrock, and how does auth differ from the direct Anthropic API?
---
**A:** `boto3.client("bedrock-runtime", region_name=...)`. Auth is via AWS IAM credentials, not an Anthropic API key.
*Memory hook:* Bedrock checks your **AWS employee badge**, not an Anthropic concert ticket.

### Q4. What error do you get if you request a model that isn't available in your client's configured AWS region, and what solves this?
---
**A:** A cryptic "model doesn't exist" error. Cross-region inference profiles solve it by automatically routing the request to a region where the model is actually hosted.
*Memory hook:* You arrive at a hotel in the wrong city and the desk says “no such room”; the inference profile calls a shuttle to the city where the room exists.

### Q5. Where in the AWS Bedrock console do you find inference profile IDs, and how do they differ from a plain model ID?
---
**A:** Under "Cross-region inference" (not the main model catalog page). A plain model ID is locked to whatever region you specify; an inference profile ID is not — it can route across multiple regions transparently.
*Memory hook:* A plain model ID is a ticket for one station; an inference profile is a flexible rail pass across the whole network.

### Q6. What are the three essential components of a Bedrock request via the `converse` API?
---
**A:** A Bedrock Runtime Client (the connection), a Model ID (which model to run), and a User Message (the input text/content).
*Memory hook:* Pack three things for the trip: **vehicle**, **destination model**, and **passenger message**.

### Q7. Why is a Bedrock message's `content` field a list rather than a plain string?
---
**A:** Because a single message can contain multiple content types (text, images, other media) — the list structure supports multimodal requests.
*Memory hook:* `content` is a bento box, not a single sandwich: it can hold text, a photo, and other media side by side.

### Q8. How do you extract the generated text from a `client.converse()` response?
---
**A:** `response["output"]["message"]["content"][0]["text"]`.
*Memory hook:* Follow the nesting dolls—**response → output → message → content → first block → text**.

### Q9. What does this course teach that ISN'T Bedrock-specific — i.e., what carries over unchanged from Building with the Claude API?
---
**A:** Prompt engineering technique, tool schema design, RAG chunking/retrieval strategy, evaluation methodology, and agentic orchestration patterns (workflows vs. agents) — Bedrock only changes the auth/client/call layer, not how you design prompts, tools, or systems.
*Memory hook:* Bedrock changes the **plumbing under the house**, not the recipe for cooking a reliable AI system.

### Q10. Why might a plain Bedrock model ID fail even when the model is available somewhere in AWS, and what solves the problem?
---
**A:** A plain model ID is region-locked, so it can fail when the configured region does not host that model. A cross-region inference profile routes the request to a supported region automatically.
*Memory hook:* The model ID is a hotel room in one city; the profile is a concierge who finds the same room in a neighboring city.

### Q11. How can you force Claude to return structured data through Bedrock's Converse API?
---
**A:** Provide a dedicated tool schema and select it with `toolChoice` set to that specific tool; the application should still parse and validate the returned data.
*Memory hook:* If the restaurant must serve a fixed combo, point to that exact menu item—then inspect the tray before handing it to the customer.

### Q12. What must a Bedrock application preserve when continuing a tool-use conversation?
---
**A:** Preserve the complete assistant content blocks, including each `toolUse`, send matching `toolResult` blocks with the correct IDs, and keep the original tool definitions available on the follow-up request.
*Memory hook:* Keep every receipt and matching order number; sending only the visible sentence is like returning a package with no tracking label.

### Q13. When is a batch-tool pattern appropriate, and when should it be avoided?
---
**A:** Use it for independent calls that can safely run concurrently to reduce latency. Avoid it when calls depend on one another or could duplicate unsafe side effects.
*Memory hook:* Send three independent pizza orders to three ovens at once—but never bake the frosting before the cake exists.

### Q14. What safety responsibilities remain with the application when Claude runs through Bedrock?
---
**A:** The application still owns authentication and authorization, input and path validation, rate limits, retries, timeouts, audit logging, and human approval for consequential actions; Bedrock does not make side effects safe by itself.
*Memory hook:* Bedrock is an engine, not a force field: your application still needs brakes, locks, logs, and a human at the emergency stop.

### Q15. Bedrock's Converse API is stateless. What must your application manage manually, and what strict rule governs the order of roles in the message list?
---
**A:** The application must maintain the complete message history itself and resend it in full with every request — Bedrock stores nothing between calls. The message list must strictly alternate roles: user → assistant → user → assistant, and so on; you can never have two consecutive messages with the same role.
*Memory hook:* It's a conversation, not a monologue — you can't speak twice in a row without the other person getting a turn, and Bedrock forgets the whole chat the second it hangs up.

### Q16. How is a system prompt actually passed to Bedrock's `converse()` call, and what's the one hard requirement on its content?
---
**A:** Passed via the `system` keyword parameter as a *list* containing a dictionary with a `text` field (e.g. `system=[{"text": "..."}]`), not as a bare string. It must contain at least one character — an empty string throws an error — so well-designed chat functions make the parameter optional and default it to `None` rather than `""`.
*Memory hook:* The system prompt has to ride in its own little box (`[{"text": ...}]`), and the box can't be empty — hand Bedrock an empty box and it hands the error right back.

### Q17. What's the valid range and default value of Bedrock's `temperature` parameter, and where do you set it in a `converse()` call?
---
**A:** A decimal from 0 to 1; the default is 1.0 (maximum randomness/creativity). It's set inside `inference_config`, passed to `converse()` — e.g. `inferenceConfig={"temperature": 0.2}` for more deterministic, factual output.
*Memory hook:* Temperature is a creativity dial from ice-cold 0 to full-boil 1 — and Bedrock ships it turned all the way up by default.

### Q18. When you call `converse_stream` instead of `converse`, which response key holds the events, which event type carries the actual generated text, and where exactly does that text live inside the event?
---
**A:** The response has a `'stream'` key holding an iterable/generator of events. Of the five event types (message start, content block delta, content block stop, message stop, metadata), only `content_block_delta` events carry text chunks — found at `event['content_block_delta']['delta']['text']`. The other four are structural bookkeeping events with no text payload.
*Memory hook:* The stream is a parade of five float types, but only the "content block delta" float is throwing out candy — grab the text from `delta.text` and ignore the rest of the procession.

### Q19. Bedrock lets you steer generation two ways without touching the prompt text: pre-filling and stop sequences. How does each work, and what happens to the relevant text (the prefill vs. the matched stop string) in the final result?
---
**A:** Pre-filling = manually append a partial assistant-role message to the end of the message list; Claude treats it as already-authored and continues writing from that exact point, so your app must *concatenate the prefill text with Claude's returned text* to get the complete output. Stop sequences = one or more strings passed via `inference_config` that immediately halt generation the instant they're produced; unlike the prefill (which is genuinely part of the output), the matched stop sequence itself is *excluded* from the returned text.
*Memory hook:* Pre-filling hands Claude a sentence to finish (glue your half back on); a stop sequence is a tripwire that ends the sentence and then gets swept off the floor before you see the room.

### Q20. When wiring up Claude's built-in text editor tool through Bedrock, what exact tool-name string must you use for Claude 3.7 vs. Claude 3.5, and who is responsible for implementing the five command handlers behind it?
---
**A:** Claude 3-7 requires the tool name `"str_replace_editor"`; Claude 3-5 requires `"str_replace_based_edit_tool"` — the strings must match exactly or Bedrock won't recognize the tool. Claude supplies the JSON schema automatically, but the developer still must implement all five command handlers themselves: `view`, `str_replace`, `create`, `insert`, and `undo_edit`.
*Memory hook:* Same tool, two secret passwords depending on which Claude answers the door — get the password wrong and the built-in editor never lets you in.

### Q21. What are the three `tool_choice` settings you can pass to Claude, and what does each force Claude to do?
---
**A:** `"auto"` = Claude decides for itself whether to use a tool at all (the default). `"any"` = Claude must call *some* available tool, but picks which one. `{"tool": {"name": "..."}}` = forces Claude to call one specific named tool — useful for testing a single tool in isolation or for guaranteed structured-data extraction.
*Memory hook:* Auto is "use a tool if you feel like it," any is "you must grab *a* tool, your pick," and naming one is "put down everything else and use this hammer."

### Q22. What's the "flexible tool extraction" (`toJSON`) technique for getting structured data out of Claude, and what's its trade-off versus a dedicated, tightly-typed schema?
---
**A:** Define a single generic tool (e.g. named `toJSON`) whose input is an open-ended object that accepts any properties, then specify the exact desired fields/types in the *prompt text* rather than in the schema itself. This lets you change the output structure just by editing the prompt — no schema rewrites. Trade-off: slightly lower reliability/quality than a purpose-built schema, so it's best for general or rapidly-iterating extraction, while dedicated schemas remain the right call for critical, high-accuracy extraction tasks.
*Memory hook:* Instead of hand-carving a new mold for every shape, you hand Claude one flexible bucket labeled "toJSON" and just tell it in words what to pour in — fast to change, a bit less precise than a custom mold.

### Q23. Which embedding model does this course use for RAG on Bedrock, and what does a typical embedding vector actually look like (size and value range)?
---
**A:** Amazon Titan Embed Text V2. It returns a list of roughly 1024 floating-point numbers, each typically between -1 and +1; individual dimensions don't map to any known, human-readable feature — you can only treat the vector as a whole as a "fingerprint" of meaning.
*Memory hook:* Titan hands you a 1024-digit fingerprint of the text's meaning — no single digit means anything on its own, but the whole print is unique to that meaning.

### Q24. How do cosine similarity and cosine distance differ, and which direction (higher or lower) indicates "more similar" for each?
---
**A:** Cosine similarity = the cosine of the angle between two vectors, ranging from -1 to 1; values closer to **1** mean more similar. Cosine distance = 1 minus cosine similarity; values closer to **0** mean more similar. Vector databases typically report distance (not similarity) when ranking search results, so the *lowest*-distance chunks are the best matches.
*Memory hook:* Similarity is a friendliness score climbing toward 1; distance is the walk between them shrinking toward 0 — same relationship, opposite direction.

### Q25. What's the Reciprocal Rank Fusion (RRF) formula for combining rankers, and what score would a document ranked 1st by semantic search and 2nd by BM25 receive?
---
**A:** `score = Σ 1/(1+rank)` across every search method's ranking of that document. For a document ranked 1st in vector search and 2nd in BM25: `1/(1+1) + 1/(1+2) = 0.5 + 0.33 = 0.83`. Higher combined scores win; documents are re-sorted by this score after fusing the lists.
*Memory hook:* Every ranking method casts a vote worth `1/(1+rank)` — being near the top of *either* list earns real points, so a 1st-and-2nd finisher easily beats a 5th-and-5th.

### Q26. How do you configure Extended Thinking through Bedrock's `converse()` call, and what's the minimum thinking budget allowed?
---
**A:** Pass a boolean `thinking` parameter plus a `thinking_budget` — the max number of tokens Claude may spend reasoning before answering — with a hard minimum of 1024 tokens. There's no universal "right" budget; it should be tuned using prompt evals for your specific use case, not a rule of thumb.
*Memory hook:* Extended thinking on Bedrock runs on a token allowance, not a dial — and the smallest allowance the bank will issue is 1024 tokens.

### Q27. What is the cryptographic signature attached to Claude's extended-thinking output for, and what does "redacted" thinking content mean?
---
**A:** The signature proves the reasoning text hasn't been tampered with when your application passes it back to Claude on a later turn (a security/integrity check). "Redacted" content is thinking output that Anthropic's safety systems flagged and encrypted before returning it — you can't read it, but your app must still pass it back unmodified as part of conversation history. A special magic test string exists purely to force a redacted response so you can test your app's handling of that case.
*Memory hook:* The signature is a tamper-evident seal on Claude's scratch paper; "redacted" means the safety team blacked out a page — you still have to file it, you just can't read it.

### Q28. What's the maximum number of images allowed in a single Bedrock request, and how does an image's size affect the token cost of processing it?
---
**A:** A maximum of 20 images across all messages in one request. Token cost scales with the image's pixel dimensions (height × width) — larger images consume more tokens, the same way longer text consumes more tokens.
*Memory hook:* Claude will look at up to 20 photos in one sitting, but the bigger the print, the more it costs to study.
