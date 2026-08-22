# 05 · Claude on Google Cloud — Quiz

This quiz covers only what's actually unique to accessing Claude through Google Cloud's Vertex AI. Prompt engineering, tool design, RAG, evals, and orchestration are identical to the direct API and are quizzed in 03's quiz — see there instead of re-testing them here. Vertex turns out to have far fewer platform-specific quirks than Bedrock does, since its call shape mirrors the direct API closely — that asymmetry is itself worth knowing for the exam.

### Q1. What are the four setup steps for Vertex AI access before making your first request?
---
**A:** (1) Enable the Anthropic model in Vertex AI's Model Garden. (2) Install the gcloud CLI. (3) `gcloud init` / `gcloud auth login`. (4) `gcloud config set project YOUR_PROJECT_ID` and `gcloud auth application-default login`.
*Memory hook:* Open the model shop, get the gcloud toolkit, sign in, then point the compass at your project and mint the app credential.

### Q2. How does the Anthropic SDK pick up your Vertex credentials — do you manually pass an API key?
---
**A:** No — the SDK automatically uses the `gcloud auth application-default login` credentials tied to your GCP project; no manual API key wiring needed, unlike the direct API's `ANTHROPIC_API_KEY` or Bedrock's boto3/IAM setup.
*Memory hook:* Once you stamp the Google Cloud passport, the SDK finds it in your pocket instead of asking you to tape a key onto every request.

### Q3. What client class do you use to call Claude via Vertex, and what two parameters does it require?
---
**A:** `AnthropicVertex(region=..., project_id=...)`.
*Memory hook:* The Vertex client needs two coordinates on its map: **which region** and **which project**.

### Q4. How does Vertex's model naming convention differ from the direct Anthropic API's and Bedrock's?
---
**A:** Vertex model names include an `@` version suffix, e.g. `claude-sonnet-4@20250514` — vs. a plain model-name string on the direct API, and `anthropic.model-name` (or an inference-profile ID) on Bedrock.
*Memory hook:* Vertex gives the model a dated passport stamp after the `@`; the direct API travels with just the model name; Bedrock prefixes it with `anthropic.`.

### Q5. How does the `AnthropicVertex` client's call shape (`.messages.create(model, max_tokens, messages)`) compare to Bedrock's `.converse()` call?
---
**A:** Vertex's call shape closely mirrors the direct Anthropic API (`messages.create`), while Bedrock uses a differently-structured `converse(modelId=..., messages=[...])` call — Vertex is the more API-similar of the two cloud deployment options.
*Memory hook:* Vertex speaks the familiar `messages.create` dialect; Bedrock arrives wearing the different `converse` uniform.

### Q6. Across Vertex, Bedrock, and the direct Anthropic API, what actually changes and what stays constant?
---
**A:** What changes: authentication method, client class, exact call shape, and model-ID format. What stays constant: prompt engineering technique, tool schema design, RAG strategy, evaluation methodology, and agentic orchestration patterns — the "thinking layer" is identical everywhere.
*Memory hook:* Change the airport, passport, and boarding gate — but the pilot's checklist and navigation principles stay the same.

### Q7. How does consuming a streaming response on Vertex compare to Bedrock's approach?
---
**A:** Because Vertex uses the Anthropic Python SDK directly, it gets the SDK's higher-level streaming helpers: `client.messages.stream()` as a context manager exposing `stream.text_stream` for clean text-chunk access, plus `get_final_message()` to collect all chunks into one complete message object. Bedrock's boto3-based `converse_stream` instead hands you a raw `'stream'` key of event dictionaries that you iterate and parse yourself, with no equivalent convenience wrapper.
*Memory hook:* Vertex hands you a filtered tap plus a bucket (`get_final_message`); Bedrock hands you the raw firehose and lets you sort the drops yourself.

### Q8. Since Anthropic doesn't provide embeddings, what specific embedding model is available on Vertex AI, and how does that compare to Bedrock's option?
---
**A:** Google's **text-embedding-005**, accessed via the Google GenAI SDK — the Vertex-native alternative to the direct API's VoyageAI recommendation and Bedrock's Amazon Titan Embed Text V2.
*Memory hook:* Three clouds, three house-brand embeddings: VoyageAI on the direct API, Titan on Bedrock, text-embedding-005 on Vertex.
