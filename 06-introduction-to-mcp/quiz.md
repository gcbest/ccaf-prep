# 06 · Introduction to Model Context Protocol — Quiz

### Q1. What core problem does MCP solve, in one sentence?
---
**A:** It shifts the burden of defining and maintaining tool integrations for third-party services from your server to dedicated, specialized MCP servers — often maintained by the service provider itself.
*Memory hook:* Instead of building every key for every building, hire the building's own locksmith and use the standard key shape.

### Q2. Who can author an MCP server?
---
**A:** Anyone — often the service provider itself publishes an official implementation (e.g., a provider might release an official MCP server for their own API).
*Memory hook:* Any chef can open a food truck; the restaurant owner may simply be the one who publishes the official truck.

### Q3. What's the common misconception about MCP and "tool use," and what's the actual relationship?
---
**A:** People assume they're the same thing. They're complementary but distinct: MCP servers provide tool schemas/functions already implemented for you; tool use is the mechanism by which Claude actually calls those tools. The difference is who did the implementation work.
*Memory hook:* MCP supplies the vending machine; tool use is Claude pressing the button and receiving the snack.

### Q4. What does "transport agnostic" mean for an MCP client/server connection, and what's the most common setup?
---
**A:** The client and server can communicate over different protocols (stdio, HTTP, WebSockets). Most common: both running on the same machine, communicating via standard input/output.
*Memory hook:* The same conversation can travel by walkie-talkie, phone line, or web socket; the common local setup uses the machine's own hallway.

### Q5. Name the two core MCP message type pairs used between client and server.
---
**A:** `ListToolsRequest`/`ListToolsResult` (what tools are available) and `CallToolRequest`/`CallToolResult` (run a specific tool, get the result).
*Memory hook:* First ask for the restaurant menu; then place one order and receive the dish.

### Q6. In the Python MCP SDK, what does the `@mcp.tool(...)` decorator eliminate compared to hand-authoring a tool integration?
---
**A:** Manual JSON schema writing — Python type hints and Pydantic `Field()` descriptions let the SDK auto-generate the schema, plus you get automatic validation and natural error handling via exceptions.
*Memory hook:* Type hints are the ingredients list; FastMCP prints the menu and checks the order instead of making you typeset every menu card.

### Q7. What command starts the MCP Inspector, and what can you do with it before wiring up a real client?
---
**A:** `mcp dev mcp_server.py`. You can connect, list and test tools with real inputs, and see success/failure plus returned data — testing without building a full client application.
*Memory hook:* The Inspector is a wind tunnel for your server: run `mcp dev`, test the tools, and watch which wings flap before building the airplane.

### Q8. What are the two components of an MCP client implementation, and why wrap the second in a custom class?
---
**A:** A custom MCP Client wrapper class around the SDK's Client Session (the actual connection). The wrapper handles careful resource cleanup automatically.
*Memory hook:* The Session is the live electrical wire; the wrapper is the electrician who wraps it safely and remembers to turn it off.

### Q9. What's the key difference between a "direct" and a "templated" MCP resource?
---
**A:** A direct resource has a static URI with no parameters (e.g., `docs://documents`). A templated resource has a parameterized URI (e.g., `docs://documents/{doc_id}`) — the SDK auto-parses the parameter into a function keyword argument.
*Memory hook:* A direct resource is one fixed mailbox; a templated resource is a row of mailboxes where `{doc_id}` is the apartment number.

### Q10. Why use a resource instead of a tool call to inject a document's contents into a prompt?
---
**A:** Resources let your app inject content directly into the prompt context without requiring Claude to make a separate tool call and wait for the round trip — a smoother, faster user experience for data the app already knows the user wants.
*Memory hook:* Put the document on Claude's desk before the meeting instead of making Claude leave the room to fetch it.

### Q11. What determines how a client should parse a resource's returned content?
---
**A:** The resource's `mimeType` (e.g., `application/json` → `json.loads()` it; otherwise treat as raw text).
*Memory hook:* The MIME label is the package's handling sticker: JSON goes to the parser machine; plain text goes straight to the reader.

### Q12. What are MCP "prompts" for, and why would a developer bother writing one when users can already just ask Claude directly?
---
**A:** Pre-built, thoroughly tested instruction templates for a server's domain. Even though users could type their own request, a specialized, tested prompt handles edge cases and encodes expertise more reliably and consistently than an ad hoc user-written instruction.
*Memory hook:* A prompt is a tested cockpit checklist: passengers could guess the procedure, but the checklist remembers the dangerous edge cases.

### Q13. How do client-provided arguments make their way into an MCP prompt's text?
---
**A:** They're passed as a dict (e.g., `{"doc_id": "plan.md"}`) to `get_prompt(prompt_name, args)`, which interpolates them as keyword arguments into the prompt template function.
*Memory hook:* The client hands the template a name tag—`doc_id: plan.md`—and the prompt stitches that tag into the finished instruction.

### Q14. Complete the MCP primitive-control table: who controls Tools, who controls Resources, who controls Prompts?
---
**A:** Tools — the model (Claude decides when to call). Resources — the app (your code decides when to fetch). Prompts — the user (triggered by explicit UI action).
*Memory hook:* **Model pulls the lever**, **app sets the table**, **user presses the button**—tool, resource, prompt.

### Q15. A developer wants to let Claude autonomously decide when to run a calculation using a JS sandbox. Which MCP primitive is this, and why?
---
**A:** A tool — because the decision to invoke it belongs to the model (Claude), which is the defining trait of tools vs. resources/prompts.
*Memory hook:* If Claude can spontaneously grab the calculator, it is a tool—the model owns the decision.

### Q16. A developer wants a slash-command-style button that lets a user trigger a pre-optimized "summarize this document" workflow on demand. Which MCP primitive is this?
---
**A:** A prompt — user-triggered, predefined workflows are exactly what MCP prompts are for.
*Memory hook:* A slash-command button is a vending-machine button: the user pushes it and receives the prepacked workflow.

### Q17. Give a concrete real-world parallel to MCP resources inside Claude's own official interface.
---
**A:** The "Add from Google Drive" feature — the application code (not the model) decides which documents to show and handles injecting their content into the chat context, exactly like an app-controlled resource.
*Memory hook:* When the app offers a Drive document in an `@` menu, the waiter chose the plate before Claude ever asked for food.

### Q18. Why is the MCP Inspector's session state useful when testing a server?
---
**A:** State persists between calls, so you can run an edit tool and immediately use a read tool to verify the result, as well as test multi-tool interactions without building a full client.
*Memory hook:* The Inspector remembers the room after you move the furniture, so you can walk back in and check whether the picture is now straight.

### Q19. What makes an MCP tool definition reliable for both Claude and the client application?
---
**A:** It should have a clear name and specific description explaining when it applies and what it returns, use typed and validated inputs, and produce predictable results with meaningful errors.
*Memory hook:* A reliable tool is a well-labeled vending machine: clear button, valid coin slot, predictable snack, useful “sold out” message.

### Q20. In a typical production project, does the application usually implement both an MCP client and server? Why or why not?
---
**A:** Usually it implements the side it owns—either a server that publishes capabilities or a client that connects to an existing server. The course builds both mainly to make the end-to-end protocol understandable.
*Memory hook:* In a real restaurant you usually run either the kitchen or the delivery app; the course builds both so you can see the whole meal's journey.

### Q21. What are `ReadResourceRequest` and `ReadResourceResult` used for?
---
**A:** They implement the request/response exchange for reading a resource's read-only data, such as fetching a document that the application will inject directly into the prompt.
*Memory hook:* One message asks the librarian for a book; the paired result is the book arriving on the reading desk.

### Q22. What should an MCP server do when it needs to change the meaning of an existing capability?
---
**A:** Version or deprecate the capability instead of silently changing its meaning, so clients can adapt without unexpected behavior.
*Memory hook:* If a blue button used to mean “save,” do not secretly make it “delete”—give the new button a new label and retire the old one carefully.
