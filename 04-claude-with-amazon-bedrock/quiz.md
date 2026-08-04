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
