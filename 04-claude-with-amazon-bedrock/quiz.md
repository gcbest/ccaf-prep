# 04 · Claude with Amazon Bedrock — Quiz

This quiz covers only what's actually unique to accessing Claude through AWS Bedrock. Prompt engineering, tool design, RAG, evals, and orchestration are identical to the direct API and are quizzed in 03's quiz — see there instead of re-testing them here.

### Q1. What Python library and client do you use to connect to Bedrock, and how does auth differ from the direct Anthropic API?
---
**A:** `boto3.client("bedrock-runtime", region_name=...)`. Auth is via AWS IAM credentials, not an Anthropic API key.
*Memory hook:* Bedrock checks your **AWS employee badge**, not an Anthropic concert ticket.

### Q2. Why might a plain Bedrock model ID fail even when the model is available somewhere in AWS, and what solves the problem?
---
**A:** A plain model ID is region-locked — not every model is hosted in every AWS region, and requesting the wrong region produces a cryptic "model doesn't exist" error. A **cross-region inference profile** solves this by automatically routing the request to a region where the model actually exists. Find inference profile IDs in the AWS console under **"Cross-region inference"** — not the main model catalog page.
*Memory hook:* The model ID is a hotel room in one city; the inference profile is a concierge who finds the same room in a neighboring city.

### Q3. What are the three essential components of a Bedrock request via the `converse` API?
---
**A:** A Bedrock Runtime Client (the connection), a Model ID (which model to run), and a User Message (the input text/content).
*Memory hook:* Pack three things for the trip: **vehicle**, **destination model**, and **passenger message**.

### Q4. How do you extract the generated text from a `client.converse()` response?
---
**A:** `response["output"]["message"]["content"][0]["text"]`.
*Memory hook:* Follow the nesting dolls — **response → output → message → content → first block → text**.

### Q5. What does this course teach that ISN'T Bedrock-specific — i.e., what carries over unchanged from Building with the Claude API?
---
**A:** Prompt engineering technique, tool schema design, RAG chunking/retrieval strategy, evaluation methodology, and agentic orchestration patterns (workflows vs. agents) — Bedrock only changes the auth/client/call layer, not how you design prompts, tools, or systems.
*Memory hook:* Bedrock changes the **plumbing under the house**, not the recipe for cooking a reliable AI system.

### Q6. How do you force Claude to return structured data through Bedrock's Converse API, and what's the field called (vs. the direct API's `tool_choice`)?
---
**A:** Provide a dedicated tool schema and select it with `toolChoice` (camelCase, vs. the direct API's `tool_choice`) set to that specific tool; the application should still parse and validate the returned data.
*Memory hook:* Same idea as the direct API's tool_choice, just wearing Bedrock's camelCase name tag.

### Q7. What must a Bedrock application preserve when continuing a tool-use conversation, and what are Converse's tool-block field names called?
---
**A:** Preserve the complete assistant content blocks, including each `toolUse` block (vs. the direct API's `tool_use`), send matching `toolResult` blocks (vs. `tool_result`) with the correct IDs, and keep the original tool definitions available on the follow-up request.
*Memory hook:* Same receipt-and-tracking-number system as the direct API — just relabeled toolUse/toolResult instead of tool_use/tool_result.

### Q8. How is a system prompt actually passed to Bedrock's `converse()` call, and what's the one hard requirement on its content?
---
**A:** Passed via the `system` keyword parameter as a *list* containing a dictionary with a `text` field (e.g. `system=[{"text": "..."}]`) — not as a bare string like the direct API often uses. It must contain at least one character — an empty string throws an error — so well-designed chat functions make the parameter optional and default it to `None` rather than `""`.
*Memory hook:* The system prompt has to ride in its own little box (`[{"text": ...}]`), and the box can't be empty — hand Bedrock an empty box and it hands the error right back.

### Q9. Where do you set the `temperature` parameter in a Bedrock `converse()` call?
---
**A:** Inside `inference_config`, passed to `converse()` — e.g. `inferenceConfig={"temperature": 0.2}` — rather than as a top-level parameter.
*Memory hook:* Temperature doesn't ride loose in the request — it has to check into the `inferenceConfig` room first.

### Q10. When you call `converse_stream` instead of `converse`, which response key holds the events, and which event type carries the actual generated text?
---
**A:** As taught in this course, the response has a `'stream'` key holding an iterable/generator of events. Of the named event types (message start, content block delta, content block stop, message stop, metadata), only `content_block_delta` events carry text — found at `event['content_block_delta']['delta']['text']`. The other events are structural bookkeeping with no text payload.
*Memory hook:* The stream is a parade of events, but only the "content block delta" float is throwing out candy — grab the text from `delta.text` and ignore the rest of the procession.

### Q11. When wiring up Claude's built-in text editor tool through Bedrock, what exact tool-name string must you use for Claude 3.7 vs. Claude 3.5?
---
**A:** Claude 3-7 requires the tool name `"str_replace_editor"`; Claude 3-5 requires `"str_replace_based_edit_tool"` — the strings must match exactly or Bedrock won't recognize the tool. (Claude supplies the JSON schema automatically; the developer still implements the five command handlers behind it.)
*Memory hook:* Same tool, two secret passwords depending on which Claude answers the door — get the password wrong and the built-in editor never lets you in.

### Q12. Since Anthropic doesn't provide embeddings, what's the natural in-platform embedding option on Bedrock, and what does a typical vector look like?
---
**A:** Amazon Titan Embed Text V2 — the Bedrock-native alternative to the direct API's VoyageAI recommendation. It returns a list of roughly 1024 floating-point numbers, each typically between -1 and +1; individual dimensions don't map to any known, human-readable feature.
*Memory hook:* On the direct API you reach for VoyageAI; on Bedrock, Titan is already sitting in the same building.

### Q13. How do you configure Extended Thinking through Bedrock's `converse()` call, and what's the minimum thinking budget allowed?
---
**A:** Pass a boolean `thinking` parameter plus a `thinking_budget` — the max number of tokens Claude may spend reasoning before answering — with a hard minimum of 1024 tokens. This is a token-budget model, distinct from the adaptive/`effort`-based thinking configuration described for the direct API in 03.
*Memory hook:* Extended thinking on Bedrock runs on a token allowance, not a dial — and the smallest allowance the bank will issue is 1024 tokens.
