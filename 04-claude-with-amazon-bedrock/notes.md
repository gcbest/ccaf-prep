# 04 · Claude with Amazon Bedrock

Source: Claude with Amazon Bedrock (Anthropic Academy) — official CCA-F prep course #4.

This course largely re-teaches the same ground as Building with the Claude API (prompting, tool use, RAG, MCP, Claude Code, computer use) but delivered through AWS Bedrock. See 03-building-with-the-claude-api for that shared conceptual material — it applies identically on Bedrock. **These notes contain only what's actually unique to accessing Claude through Bedrock** — auth, client setup, call shape, model IDs, and the handful of field-name/parameter differences that trip people up when translating a direct-API example.

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
- Two message roles, same structure: **user** and **assistant** — this symmetry makes it easy to chain multi-turn conversations by alternating roles.
- Bedrock's unified `converse` method is the standard entry point across Bedrock-hosted model providers (not Anthropic-specific like `messages.create`).
- Model ID format: `anthropic.model-name` (e.g. Fable 5's Bedrock model ID is `anthropic.claude-fable-5`) or an inference profile ID — not a plain model-name string.

## Field-name differences from the direct Messages API
Converse expresses the same concepts as `messages.create`, just under different field names:
- `stopSequences` lives inside `inferenceConfig`, not as a top-level parameter.
- Tool specs use camelCase: `name`, `description`, `inputSchema` (vs. `input_schema`).
- Tool response blocks are `toolUse` / `toolResult` (vs. `tool_use` / `tool_result`).
- `toolChoice` can be `auto`, `any`, or a specific tool — same three options as the direct API, different key name.
- Extended thinking on Bedrock (as taught in this course) is configured with an explicit `thinking` boolean plus a `thinking_budget` token count (**minimum 1024 tokens**) — a token-budget model rather than the adaptive/`effort`-based thinking described for the direct API in 03.
- The built-in text editor tool requires an **exact Bedrock-specific tool-name string** per model version: `"str_replace_editor"` for Claude 3.7, `"str_replace_based_edit_tool"` for Claude 3.5 — get the string wrong and Bedrock won't recognize the tool.

## Embeddings on Bedrock
Anthropic doesn't provide embeddings on any platform. On Bedrock, the natural in-platform option demoed in this course is **Amazon Titan Embed Text V2** (~1024-dimension vectors) rather than the VoyageAI models used with the direct API in 03.

## Exam takeaways: Bedrock vs. direct Anthropic API
- Auth: AWS IAM/boto3 credentials, not an `ANTHROPIC_API_KEY`.
- Client: `boto3.client("bedrock-runtime", region_name=...)` instead of `anthropic.Anthropic()`.
- Call shape: `client.converse(modelId=..., messages=[...])` instead of `client.messages.create(model=..., max_tokens=..., messages=[...])`.
- Regional model availability is a real constraint on Bedrock — use inference profiles to avoid hard-coding a region-locked model ID.
- Everything above the client/auth/call layer (prompting technique, tool schemas, RAG design, evals, orchestration patterns) is identical to the direct API — Bedrock is a deployment/access-layer choice, not a different way of "thinking" about Claude.

## Bedrock exam checklist

When translating a direct-API example to Bedrock, change the access layer and preserve the reasoning:

- Credentials come from AWS IAM/boto3 configuration, not an Anthropic API key.
- Create a bedrock-runtime client in a region where the model is available.
- Use Converse with modelId, messages, inferenceConfig, and toolConfig as appropriate.
- Use an inference profile when the model is routed across supported regions; find profile IDs in the Bedrock console's cross-region inference area rather than guessing from the main model catalog.
- Read the returned output message and content blocks, then handle stop reasons and usage.
- Keep prompts, schemas, RAG, evals, orchestration, and verification conceptually identical to the direct API.

The deployment choice changes credentials, client shape, model identifier, regional availability, and some parameter names. It does not change the 4D human–AI responsibilities or the architecture of a reliable tool loop.
