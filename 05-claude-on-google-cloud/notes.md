# 05 · Claude on Google Cloud

Source: Claude on Google Cloud (Anthropic Academy) — official CCA-F prep course #5.

Like the Bedrock course, this largely re-teaches the same conceptual ground as Building with the Claude API (prompting, tool use, RAG, MCP, evals, agents/workflows, Claude Code, computer use) but delivered through Google Cloud's Vertex AI. See 03-building-with-the-claude-api for the shared conceptual material. These notes focus on what's **Vertex-specific**.

## The complete request lifecycle (Vertex framing)
Five steps: **Request to Server → Request to Vertex → Model Processing → Response to Server → Response to Client.**
- **Never call Vertex directly from client-side code** — API credentials must stay server-side and secret; exposing them in client code makes them visible to anyone. Always route through your own server.
- Your server talks to Vertex using either **Anthropic's SDKs** (Python, TypeScript, Go, Ruby) or **Google's official Vertex SDKs**.
- Every request needs: an identifying credential, the **model** name, **messages** (the user input), and **max_tokens**.

### Inside Claude: how text generation actually works (as taught here)
Four stages once a request reaches the model: **Tokenization** (break input into tokens) → **Embedding** (each token becomes a numeric vector) → **Contextualization** (embeddings get adjusted based on neighboring tokens to resolve meaning, e.g. disambiguating "quantum") → **Generation** (contextualized embeddings produce next-token probabilities; Claude mixes probability with randomness rather than always picking the top token, then repeats).
Generation stops on: **max tokens reached**, a **natural end-of-sequence token**, or a **predefined stop sequence**.
The response includes: the generated **message**, **usage** (input/output token counts), and **stop reason**.

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
- **Model naming on Vertex uses an `@` version suffix** (e.g., `claude-sonnet-4@20250514`), unlike the direct Anthropic API's plain model name.
- The `create()` call shape (`model`, `max_tokens`, `messages`) mirrors the direct Anthropic API almost exactly — this is the key contrast with Bedrock, whose `converse()` call has a different shape entirely.
- `max_tokens` is a **budget, not a target** — Claude stops early if it finishes before hitting the limit; it never exceeds it.
- Two message roles, same pattern as everywhere else: **user** (human-authored) and **assistant** (Claude-authored).

## Exam takeaways: Vertex vs. direct Anthropic API vs. Bedrock
- Auth: `gcloud` application-default credentials tied to a GCP project, picked up automatically by `AnthropicVertex` — vs. Bedrock's boto3/IAM credentials, vs. the direct API's `ANTHROPIC_API_KEY`.
- Client: `AnthropicVertex(region=..., project_id=...)` — closest in call shape to the direct API's `Anthropic()` client (both use `.messages.create()`), whereas Bedrock uses the differently-shaped `.converse()`.
- Model IDs: Vertex uses `model-name@version-date` syntax; Bedrock uses `anthropic.model-name` or an inference-profile ID; the direct API uses a plain model name string.
- Everything above the client/auth/call layer (prompt engineering, tool design, RAG, evals, orchestration patterns) is identical across all three surfaces — this is the recurring exam theme across the three deployment-option courses.

## Course sections beyond the first request

### Vertex AI setup and request shape

Vertex is a server-side deployment surface. Do not put Google credentials in browser code. Set up the Google Cloud project, enable the required Vertex/Model Garden access, initialize gcloud, select the project, and create application-default credentials for the server environment. The Anthropic Vertex client picks up those credentials.

The course example uses an AnthropicVertex client with a project ID and region, often the global region, then calls messages.create with a Vertex model identifier such as claude-sonnet-4@20250514. The message shape remains the familiar user/assistant list, and max_tokens remains a ceiling rather than a target. Vertex model IDs use a model-name@version-date form; do not substitute a Bedrock model ID or a direct-API model string.

The lifecycle is: application server authenticates to Google Cloud, sends the request to Vertex, Vertex routes it to the selected Claude model, and the server returns the result to the client. The response includes generated content, usage, and a stop reason. A natural stop, max-token stop, or configured stop sequence should be handled differently in logging and retry logic.

### Controlling and validating output

The direct Messages API patterns carry over to Vertex:

- Use an assistant prefill plus a stop sequence for small, delimited outputs such as JSON or CSV.
- Prefer a dedicated tool schema when a production workflow needs reliable structured data.
- Choose automatic tool selection when Claude may answer normally, any when one of the available tools must be used, or a specific tool when a particular schema is mandatory.
- Parse and validate the output in application code. Valid JSON can still contain invalid dates, unauthorized identifiers, or values that violate domain rules.

Keep system instructions separate from user data and place stable instructions before volatile context. When a prompt is reused across calls, consider caching or reusing the stable prefix, but measure token savings and invalidation behavior.

## Tool use, batching, and agent architecture

A Vertex tool loop still requires the application to preserve the complete assistant content, execute each tool, send matching tool results with their IDs, and retain the original tool definitions on the follow-up call. Validate tool inputs, enforce permissions, and make side effects idempotent where possible.

The batch-tool pattern groups independent sub-invocations so the application can run them in parallel. It is appropriate for independent lookups or transformations, not for a sequence where the second call depends on the first or where concurrent execution could duplicate an unsafe action.

Use a known workflow for fixed steps such as chaining, routing, parallelization, or evaluator–optimizer review. Use an agent only when Claude needs to choose an unknown sequence of tools. In both cases define budgets, timeouts, stop conditions, retries, state, observability, and a human approval path for actions that change external systems.

## RAG on Vertex

A production retrieval path can combine multiple indexes:

1. Chunk documents while retaining source and chunk metadata.
2. Generate semantic embeddings and search a vector index.
3. Search a lexical index such as BM25 for exact terms, identifiers, and names.
4. Fuse the ranked results with reciprocal rank fusion.
5. Rerank the short list against the query when better relevance is worth the added latency.
6. Give Claude only the best labeled chunks and require source-aware answers.

Reranking should return document or chunk IDs so the application can fetch the original text instead of paying to repeat full chunks in the reranker response. Contextual retrieval enriches a chunk with enough document-level context to stand on its own before it is embedded and indexed. Test retrieval separately from generation: an answer can be wrong because the needed chunk was never retrieved, because the context was misread, or because the model synthesized it incorrectly.

## Shared capabilities and safety

Tools, web search, computer-use-style features, MCP integrations, prompt caching, and file or image inputs are architectural capabilities—not replacements for application controls. Keep credentials and privileged actions on the server, allowlist tools and destinations, validate files and arguments, limit time and tokens, log decisions and failures, and require human review for consequential side effects.

The same 4D responsibilities apply in Vertex deployments. Problem Awareness defines what the system is meant to accomplish, Platform Awareness includes Vertex project/region/model and permission limits, Task Delegation assigns work between people and Claude, and Diligence covers data handling, disclosure, verification, and accountability.

## Vertex exam checklist

When translating a direct Anthropic API example to Vertex:

- Replace API-key authentication with Google Cloud application-default credentials and a project.
- Use AnthropicVertex with the correct region and project ID.
- Use the Vertex model-name@version-date identifier.
- Keep the Messages API call and message roles, while checking Vertex-specific support and limits.
- Inspect content, usage, and stop reason in the response.
- Preserve the same prompt, tool, RAG, eval, and orchestration design principles used on the direct API and Bedrock.

The main exam distinction is deployment plumbing: Vertex changes authentication, project/region configuration, and model-ID syntax. It does not create a separate prompting or agent theory.
