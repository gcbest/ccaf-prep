# 05 · Claude on Google Cloud — Quiz

### Q1. Why should you never call Vertex AI directly from client-side code?
---
**A:** API credentials must stay secret; exposing them in client-side code makes them visible to anyone. Always route requests through your own server, which acts as a secure intermediary.

### Q2. Walk through the four internal stages Claude uses to generate text, as taught in this course.
---
**A:** Tokenization (break input into tokens) → Embedding (each token becomes a numeric vector) → Contextualization (embeddings adjusted based on neighboring context to resolve meaning) → Generation (produces next-token probabilities, mixes probability with randomness, repeats).

### Q3. Name the three conditions that stop Claude's text generation.
---
**A:** Max tokens reached, a natural end-of-sequence token, or a predefined stop sequence.

### Q4. What are the four setup steps for Vertex AI access before making your first request?
---
**A:** (1) Enable the Anthropic model in Vertex AI's Model Garden. (2) Install the gcloud CLI. (3) `gcloud init` / `gcloud auth login`. (4) `gcloud config set project YOUR_PROJECT_ID` and `gcloud auth application-default login`.

### Q5. How does the Anthropic SDK pick up your Vertex credentials — do you manually pass an API key?
---
**A:** No — the SDK automatically uses the `gcloud auth application-default login` credentials tied to your GCP project; no manual API key wiring needed.

### Q6. What client class do you use to call Claude via Vertex, and what two parameters does it require?
---
**A:** `AnthropicVertex(region=..., project_id=...)`.

### Q7. How does Vertex's model naming convention differ from the direct Anthropic API's?
---
**A:** Vertex model names include an `@` version suffix, e.g. `claude-sonnet-4@20250514`, vs. a plain model name string on the direct API.

### Q8. Is `max_tokens` a target Claude tries to hit, or a ceiling?
---
**A:** A ceiling/budget — Claude stops whenever it judges the response complete, but will never exceed the max_tokens limit.

### Q9. How does the `AnthropicVertex` client's call shape (`.messages.create(model, max_tokens, messages)`) compare to Bedrock's `.converse()` call?
---
**A:** Vertex's call shape closely mirrors the direct Anthropic API (`messages.create`), while Bedrock uses a differently-structured `converse(modelId=..., messages=[...])` call — Vertex is the more API-similar of the two cloud deployment options.

### Q10. Across Vertex, Bedrock, and the direct Anthropic API, what stays constant and what changes?
---
**A:** What changes: authentication method, client class, exact call shape, and model-ID format. What stays constant: prompt engineering technique, tool schema design, RAG strategy, evaluation methodology, and agentic orchestration patterns — the "thinking layer" is identical everywhere.
