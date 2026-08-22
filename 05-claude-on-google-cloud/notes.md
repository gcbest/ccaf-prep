# 05 · Claude on Google Cloud

Source: Claude on Google Cloud (Anthropic Academy) — official CCA-F prep course #5.

Like the Bedrock course, this largely re-teaches the same conceptual ground as Building with the Claude API (prompting, tool use, RAG, MCP, evals, agents/workflows, Claude Code, computer use) but delivered through Google Cloud's Vertex AI. See 03-building-with-the-claude-api for that shared conceptual material — it applies identically on Vertex. **These notes contain only what's actually unique to Vertex** — auth, client setup, call shape, and model IDs.

## Vertex AI setup (auth — the Vertex-specific part)
1. **Enable the model in Vertex**: Google Cloud Console → Vertex AI → Model Garden → search "Anthropic" → select the model → click **Enable** (if not already enabled).
2. **Install the gcloud CLI** (if not already installed).
3. **Authenticate**:
```
gcloud init
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth application-default login
```
- The Anthropic SDK automatically picks up these **application-default credentials** — no manual API key wiring needed once `gcloud auth application-default login` has run.
- **Never call Vertex directly from client-side code** — API credentials must stay server-side and secret; exposing them in client code makes them visible to anyone. Always route through your own server.

## Making a request — the `AnthropicVertex` client
```python
%pip install "anthropic[vertex]"

from anthropic import AnthropicVertex
client = AnthropicVertex(region="global", project_id="your-project-id")
model = "claude-sonnet-4@20250514"

message = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=[{"role": "user", "content": "What is quantum computing? Answer in one sentence"}]
)
message.content[0].text
```
- **Model naming on Vertex uses an `@` version suffix** (e.g., `claude-sonnet-4@20250514`), unlike the direct Anthropic API's plain model name or Bedrock's `anthropic.model-name`/inference-profile ID.
- The `create()` call shape (`model`, `max_tokens`, `messages`) mirrors the direct Anthropic API almost exactly — this is the key contrast with Bedrock, whose `converse()` call has a different shape entirely.
- `max_tokens` is a **budget, not a target** — Claude stops early if it finishes before hitting the limit; it never exceeds it (same as the direct API — no Vertex-specific behavior here, just worth restating since it's easy to assume otherwise).

## Embeddings on Vertex
Anthropic doesn't provide embeddings on any platform. On Vertex, the natural in-platform option demoed in this course is Google's **text-embedding-005** model (via the Google GenAI SDK) rather than the VoyageAI models used with the direct API in 03, or Amazon Titan Embed Text V2 on Bedrock.

## Exam takeaways: Vertex vs. direct Anthropic API vs. Bedrock
- Auth: `gcloud` application-default credentials tied to a GCP project, picked up automatically by `AnthropicVertex` — vs. Bedrock's boto3/IAM credentials, vs. the direct API's `ANTHROPIC_API_KEY`.
- Client: `AnthropicVertex(region=..., project_id=...)` — closest in call shape to the direct API's `Anthropic()` client (both use `.messages.create()`), whereas Bedrock uses the differently-shaped `.converse()`.
- Model IDs: Vertex uses `model-name@version-date` syntax; Bedrock uses `anthropic.model-name` or an inference-profile ID; the direct API uses a plain model name string.
- Everything above the client/auth/call layer (prompt engineering, tool design, RAG, evals, orchestration patterns) is identical across all three surfaces — this is the recurring exam theme across the three deployment-option courses.

## Vertex exam checklist

When translating a direct Anthropic API example to Vertex:

- Replace API-key authentication with Google Cloud application-default credentials and a project.
- Use AnthropicVertex with the correct region and project ID.
- Use the Vertex model-name@version-date identifier.
- Keep the Messages API call and message roles, while checking Vertex-specific support and limits.
- Inspect content, usage, and stop reason in the response.
- Preserve the same prompt, tool, RAG, eval, and orchestration design principles used on the direct API and Bedrock.

The main exam distinction is deployment plumbing: Vertex changes authentication, project/region configuration, and model-ID syntax. It does not create a separate prompting or agent theory.
