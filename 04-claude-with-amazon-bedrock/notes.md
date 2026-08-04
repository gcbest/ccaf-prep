# 04 · Claude with Amazon Bedrock

Source: Claude with Amazon Bedrock (Anthropic Academy) — official CCA-F prep course #4.

This course largely re-teaches the same ground as Building with the Claude API (prompting, tool use, RAG, MCP, Claude Code, computer use) but delivered through AWS Bedrock. For the exam, the differentiator is **how Bedrock access differs from the direct Anthropic API** — that's the focus of these notes. See 03-building-with-the-claude-api for the shared conceptual material (prompt engineering, evals, tool design, RAG, orchestration patterns all apply identically on Bedrock).

## Model overview (as taught in this course)
Claude offers three core model families — **Opus, Sonnet, Haiku** — plus **Claude Fable 5**, a new tier that sits above Opus (launched June 2026) for the toughest challenges, at a higher cost than Opus.
- **Opus** — most capable of the three core families; sophisticated reasoning/planning, works independently on complex multi-step projects; supports adaptive reasoning; moderate latency and higher cost.
- **Sonnet** — the sweet spot: balanced intelligence/speed/cost; strong coding ability, precise edits to complex codebases without breaking things; most production apps land here.
- **Haiku** — fastest, cheapest; optimized for speed over intelligence; does **not** support reasoning/extended-thinking capabilities; best for real-time, user-facing interactions.
- **Fable 5** — reserved for tasks that push past what Opus can handle and where the outcome justifies the cost. On Bedrock, model ID `anthropic.claude-fable-5`.
- Common pattern: mix models within one app — Haiku for user-facing speed, Sonnet for main business logic, Opus for deep reasoning, Fable 5 selectively for the hardest problems.

## Accessing Claude via Bedrock — the request flow
1. User submits a message through your app's interface.
2. Your server receives the request.
3. Your server uses a **Bedrock client** to call AWS Bedrock, passing the user message + a **model ID**.
4. The chosen model processes the request and generates text.
5. Bedrock returns an assistant message with the generated response.
6. Your server forwards the response back to the user.
Same shape as a direct Anthropic API call — the difference is entirely in the client setup and model identification, below.

## Setting up the Bedrock client (boto3)
```python
import boto3
client = boto3.client("bedrock-runtime", region_name="us-west-2")
```
- Auth is via standard AWS credentials (IAM), not an Anthropic API key.
- **Not every model is available in every AWS region.** Requesting a model that doesn't exist in your chosen region fails with a cryptic "model doesn't exist" error.

## Cross-region inference profiles
- **Inference profiles** solve the regional-availability problem: instead of tracking exactly which region hosts which model, an inference profile automatically routes your request to a region where the model is actually available (e.g., routes across us-west-2 and us-east-2 transparently).
- Find inference profile IDs in the **AWS Bedrock console → "Cross-region inference"** section — not the model ID from the main model catalog page.
- **Exam-relevant distinction**: a plain model ID is region-locked; an inference profile ID is not.

## Making a request — the `converse` API
```python
user_message = {
  "role": "user",
  "content": [{"text": "What's 1+1?"}]
}
response = client.converse(modelId=model_id, messages=[user_message])
response["output"]["message"]["content"][0]["text"]
```
- `content` is a **list** (not a bare string) because a single message can mix content types (text, images, other media) — this enables multimodal requests.
- Two message roles, same structure: **user** (`role: "user"`) and **assistant** (`role: "assistant"`) — this symmetry makes it easy to chain multi-turn conversations by alternating roles.
- Bedrock's unified `converse` method is the standard entry point across Bedrock-hosted model providers (not Anthropic-specific like `messages.create`).

## Exam takeaways: Bedrock vs. direct Anthropic API
- Auth: AWS IAM/boto3 credentials, not an `ANTHROPIC_API_KEY`.
- Client: `boto3.client("bedrock-runtime", region_name=...)` instead of `anthropic.Anthropic()`.
- Call shape: `client.converse(modelId=..., messages=[...])` instead of `client.messages.create(model=..., max_tokens=..., messages=[...])`.
- Regional model availability is a real constraint on Bedrock — use inference profiles to avoid hard-coding a region-locked model ID.
- Everything above the client/auth/call layer (prompting technique, tool schemas, RAG design, evals, orchestration patterns) is identical to the direct API — Bedrock is a deployment/access-layer choice, not a different way of "thinking" about Claude.

## Course sections beyond the first request

### Controlling output

Bedrock supports the same output-control ideas as the direct API, expressed through Converse fields. A prefilled assistant message can steer Claude to continue in a required format. stopSequences belong in inferenceConfig; the stop marker is not included in the returned text. This is useful for delimited JSON, code, or other machine-readable output, but the application should still parse and validate the result.

For reliable structured extraction, prefer a dedicated tool schema when the output contract matters. A flexible to_json-style tool is useful for fast prototypes and simple or changing requirements, while a dedicated schema is better for complex fields, high accuracy, and production validation. toolChoice can be auto, any, or a specific tool; force the specific tool when Claude must return structured data and no natural-language answer is needed.

### Tool use through Converse

A Bedrock tool specification contains a name, description, and inputSchema. The sequence remains the same:

1. Send the user message and tool specifications.
2. Inspect the assistant content for toolUse blocks.
3. Execute and validate each requested tool in the application.
4. Send the complete assistant message plus matching toolResult content.
5. Request the final response with the original tool definitions still available.

Do not send only the visible text from the first response. Preserve the content blocks and match every result to its tool-use ID. For independent calls, the batch tool can represent several sub-invocations in one request. A batch wrapper can invoke those subcalls concurrently, reducing latency when Claude has selected multiple independent operations; it should not be used when calls have dependencies or unsafe side effects.

### Multimodal and prompt-cache considerations

Converse message content is a list of typed blocks rather than a single text field, which allows text and image/document content to travel through the same message shape. Treat files and images as untrusted inputs: check size, type, sensitive data, and the downstream action before passing them to tools.

Prompt caching is most valuable for stable, large prefixes such as system instructions, tool schemas, or reference material reused across calls. Keep volatile user data after the cached prefix, and measure whether the repeated-token savings justify cache boundaries and invalidation complexity.

## Retrieval patterns on Bedrock

A useful retrieval pipeline is:

1. Split source documents into retrievable chunks and preserve document/chunk IDs.
2. Create semantic embeddings and index them.
3. Add lexical retrieval such as BM25 for exact names, codes, and rare terms.
4. Fuse the ranked lists with reciprocal rank fusion (RRF).
5. Optionally rerank the top candidates with Claude using the query and candidate IDs.
6. Pass only the strongest, labeled context to the generation call and cite the source IDs.

RRF rewards documents that appear near the top across methods. A typical form is RRF score(d) = sum of 1/(k + rank_i(d)) across ranked lists. Reranking can improve relevance after hybrid retrieval, but it adds latency and token cost; ask the reranker to return IDs rather than repeating full chunks. Contextual retrieval can add document-level context to each chunk before embedding, improving retrieval when a chunk is ambiguous outside its original document.

The same retriever interface can hide whether the underlying index is semantic, lexical, or hybrid. Evaluate recall and answer quality on representative queries rather than assuming the largest number of retrieved chunks is best.

## Agentic capabilities and responsibility

Tools, web search, computer-use-style interactions, and MCP integrations extend what Claude can do, but Bedrock does not make side effects safe by itself. Keep the application responsible for authentication, authorization, path and argument validation, rate limits, retries, timeouts, audit logging, and human approval for consequential actions.

Prefer a deterministic workflow when the steps are known. Use an agent when Claude genuinely needs to choose the next tool or route through an unknown path. For either, set a bounded context, stop condition, budget, and recovery strategy. A successful tool call is not proof that the desired business outcome occurred; verify the resulting state.

## Bedrock exam checklist

When translating a direct-API example to Bedrock, change the access layer and preserve the reasoning:

- Credentials come from AWS IAM/boto3 configuration, not an Anthropic API key.
- Create a bedrock-runtime client in a region where the model is available.
- Use Converse with modelId, messages, inferenceConfig, and toolConfig as appropriate.
- Use an inference profile when the model is routed across supported regions; find profile IDs in the Bedrock console's cross-region inference area rather than guessing from the main model catalog.
- Read the returned output message and content blocks, then handle stop reasons and usage.
- Keep prompts, schemas, RAG, evals, orchestration, and verification conceptually identical to the direct API.

The deployment choice changes credentials, client shape, model identifier, regional availability, and some parameter names. It does not change the 4D human–AI responsibilities or the architecture of a reliable tool loop.
