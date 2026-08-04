# 04 · Claude with Amazon Bedrock — Quiz

### Q1. What are Claude's four model tiers as presented in this course, and where does Fable 5 sit relative to Opus?
---
**A:** Opus, Sonnet, Haiku, plus Fable 5 — a new tier that sits *above* Opus, at a significantly higher cost, reserved for the toughest challenges where the extra capability is worth paying for.

### Q2. Which model tier does NOT support reasoning/extended-thinking capabilities, and what's it optimized for instead?
---
**A:** Haiku — optimized for speed and cost efficiency; best for real-time, user-facing interactions rather than complex problem-solving.

### Q3. What Python library and client do you use to connect to Bedrock, and how does auth differ from the direct Anthropic API?
---
**A:** `boto3.client("bedrock-runtime", region_name=...)`. Auth is via AWS IAM credentials, not an Anthropic API key.

### Q4. What error do you get if you request a model that isn't available in your client's configured AWS region, and what solves this?
---
**A:** A cryptic "model doesn't exist" error. Cross-region inference profiles solve it by automatically routing the request to a region where the model is actually hosted.

### Q5. Where in the AWS Bedrock console do you find inference profile IDs, and how do they differ from a plain model ID?
---
**A:** Under "Cross-region inference" (not the main model catalog page). A plain model ID is locked to whatever region you specify; an inference profile ID is not — it can route across multiple regions transparently.

### Q6. What are the three essential components of a Bedrock request via the `converse` API?
---
**A:** A Bedrock Runtime Client (the connection), a Model ID (which model to run), and a User Message (the input text/content).

### Q7. Why is a Bedrock message's `content` field a list rather than a plain string?
---
**A:** Because a single message can contain multiple content types (text, images, other media) — the list structure supports multimodal requests.

### Q8. How do you extract the generated text from a `client.converse()` response?
---
**A:** `response["output"]["message"]["content"][0]["text"]`.

### Q9. What does this course teach that ISN'T Bedrock-specific — i.e., what carries over unchanged from Building with the Claude API?
---
**A:** Prompt engineering technique, tool schema design, RAG chunking/retrieval strategy, evaluation methodology, and agentic orchestration patterns (workflows vs. agents) — Bedrock only changes the auth/client/call layer, not how you design prompts, tools, or systems.

### Q10. Why might a plain Bedrock model ID fail even when the model is available somewhere in AWS, and what solves the problem?
---
**A:** A plain model ID is region-locked, so it can fail when the configured region does not host that model. A cross-region inference profile routes the request to a supported region automatically.

### Q11. How can you force Claude to return structured data through Bedrock's Converse API?
---
**A:** Provide a dedicated tool schema and select it with `toolChoice` set to that specific tool; the application should still parse and validate the returned data.

### Q12. What must a Bedrock application preserve when continuing a tool-use conversation?
---
**A:** Preserve the complete assistant content blocks, including each `toolUse`, send matching `toolResult` blocks with the correct IDs, and keep the original tool definitions available on the follow-up request.

### Q13. When is a batch-tool pattern appropriate, and when should it be avoided?
---
**A:** Use it for independent calls that can safely run concurrently to reduce latency. Avoid it when calls depend on one another or could duplicate unsafe side effects.

### Q14. What safety responsibilities remain with the application when Claude runs through Bedrock?
---
**A:** The application still owns authentication and authorization, input and path validation, rate limits, retries, timeouts, audit logging, and human approval for consequential actions; Bedrock does not make side effects safe by itself.
