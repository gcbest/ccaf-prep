# 06 · Introduction to Model Context Protocol — Quiz

### Q1. What core problem does MCP solve, in one sentence?
---
**A:** It shifts the burden of defining and maintaining tool integrations for third-party services from your server to dedicated, specialized MCP servers — often maintained by the service provider itself.

### Q2. Who can author an MCP server?
---
**A:** Anyone — often the service provider itself publishes an official implementation (e.g., a provider might release an official MCP server for their own API).

### Q3. What's the common misconception about MCP and "tool use," and what's the actual relationship?
---
**A:** People assume they're the same thing. They're complementary but distinct: MCP servers provide tool schemas/functions already implemented for you; tool use is the mechanism by which Claude actually calls those tools. The difference is who did the implementation work.

### Q4. What does "transport agnostic" mean for an MCP client/server connection, and what's the most common setup?
---
**A:** The client and server can communicate over different protocols (stdio, HTTP, WebSockets). Most common: both running on the same machine, communicating via standard input/output.

### Q5. Name the two core MCP message type pairs used between client and server.
---
**A:** `ListToolsRequest`/`ListToolsResult` (what tools are available) and `CallToolRequest`/`CallToolResult` (run a specific tool, get the result).

### Q6. In the Python MCP SDK, what does the `@mcp.tool(...)` decorator eliminate compared to hand-authoring a tool integration?
---
**A:** Manual JSON schema writing — Python type hints and Pydantic `Field()` descriptions let the SDK auto-generate the schema, plus you get automatic validation and natural error handling via exceptions.

### Q7. What command starts the MCP Inspector, and what can you do with it before wiring up a real client?
---
**A:** `mcp dev mcp_server.py`. You can connect, list and test tools with real inputs, and see success/failure plus returned data — testing without building a full client application.

### Q8. What are the two components of an MCP client implementation, and why wrap the second in a custom class?
---
**A:** A custom MCP Client wrapper class around the SDK's Client Session (the actual connection). The wrapper handles careful resource cleanup automatically.

### Q9. What's the key difference between a "direct" and a "templated" MCP resource?
---
**A:** A direct resource has a static URI with no parameters (e.g., `docs://documents`). A templated resource has a parameterized URI (e.g., `docs://documents/{doc_id}`) — the SDK auto-parses the parameter into a function keyword argument.

### Q10. Why use a resource instead of a tool call to inject a document's contents into a prompt?
---
**A:** Resources let your app inject content directly into the prompt context without requiring Claude to make a separate tool call and wait for the round trip — a smoother, faster user experience for data the app already knows the user wants.

### Q11. What determines how a client should parse a resource's returned content?
---
**A:** The resource's `mimeType` (e.g., `application/json` → `json.loads()` it; otherwise treat as raw text).

### Q12. What are MCP "prompts" for, and why would a developer bother writing one when users can already just ask Claude directly?
---
**A:** Pre-built, thoroughly tested instruction templates for a server's domain. Even though users could type their own request, a specialized, tested prompt handles edge cases and encodes expertise more reliably and consistently than an ad hoc user-written instruction.

### Q13. How do client-provided arguments make their way into an MCP prompt's text?
---
**A:** They're passed as a dict (e.g., `{"doc_id": "plan.md"}`) to `get_prompt(prompt_name, args)`, which interpolates them as keyword arguments into the prompt template function.

### Q14. Complete the MCP primitive-control table: who controls Tools, who controls Resources, who controls Prompts?
---
**A:** Tools — the model (Claude decides when to call). Resources — the app (your code decides when to fetch). Prompts — the user (triggered by explicit UI action).

### Q15. A developer wants to let Claude autonomously decide when to run a calculation using a JS sandbox. Which MCP primitive is this, and why?
---
**A:** A tool — because the decision to invoke it belongs to the model (Claude), which is the defining trait of tools vs. resources/prompts.

### Q16. A developer wants a slash-command-style button that lets a user trigger a pre-optimized "summarize this document" workflow on demand. Which MCP primitive is this?
---
**A:** A prompt — user-triggered, predefined workflows are exactly what MCP prompts are for.

### Q17. Give a concrete real-world parallel to MCP resources inside Claude's own official interface.
---
**A:** The "Add from Google Drive" feature — the application code (not the model) decides which documents to show and handles injecting their content into the chat context, exactly like an app-controlled resource.

### Q18. Why is the MCP Inspector's session state useful when testing a server?
---
**A:** State persists between calls, so you can run an edit tool and immediately use a read tool to verify the result, as well as test multi-tool interactions without building a full client.

### Q19. What makes an MCP tool definition reliable for both Claude and the client application?
---
**A:** It should have a clear name and specific description explaining when it applies and what it returns, use typed and validated inputs, and produce predictable results with meaningful errors.

### Q20. In a typical production project, does the application usually implement both an MCP client and server? Why or why not?
---
**A:** Usually it implements the side it owns—either a server that publishes capabilities or a client that connects to an existing server. The course builds both mainly to make the end-to-end protocol understandable.

### Q21. What are `ReadResourceRequest` and `ReadResourceResult` used for?
---
**A:** They implement the request/response exchange for reading a resource's read-only data, such as fetching a document that the application will inject directly into the prompt.

### Q22. What should an MCP server do when it needs to change the meaning of an existing capability?
---
**A:** Version or deprecate the capability instead of silently changing its meaning, so clients can adapt without unexpected behavior.
