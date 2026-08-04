# 06 · Introduction to Model Context Protocol

Source: Introduction to Model Context Protocol (Anthropic Academy) — official CCA-F prep course #6. Full 14-lesson course, built hands-on with the Python MCP SDK.

## The problem MCP solves
Say you're building a chat interface where users ask Claude about their GitHub data. GitHub has massive functionality — repos, PRs, issues, projects. Without MCP, you'd have to hand-write, test, and maintain tool schemas/functions for all of it yourself: real, ongoing engineering burden.
**MCP shifts tool definition and execution away from your server to dedicated MCP servers.** An MCP Server for GitHub wraps that functionality and exposes it as a standardized set of tools; your app connects to the server instead of implementing everything from scratch.

## MCP Servers
- Provide access to data/functionality from outside services, exposing **tools, prompts, and resources** in a standardized way.
- **Anyone can author an MCP server** — often the service provider itself ships an official implementation (e.g., AWS might release an official MCP server for its services).
- **MCP vs. calling the API directly**: MCP servers ship tool schemas/functions already defined for you; calling an API directly means you author those definitions yourself.
- **MCP vs. tool use — common misconception**: they're complementary, not the same thing. MCP servers provide the tool schemas/functions (the *what*); tool use is how Claude actually calls those tools (the *mechanism*). The key difference is **who did the implementation work** — with MCP, someone else already did it.

## MCP Clients
The client is the communication bridge between your server and an MCP server — your access point to its tools, handling message exchange/protocol details.
- **Transport agnostic**: client and server can talk over stdio (same machine, most common), HTTP, WebSockets, or other network protocols.
- **Core message types**: `ListToolsRequest`/`ListToolsResult` (what tools do you have?) and `CallToolRequest`/`CallToolResult` (run this tool with these args, give me the result).

### Full request flow (GitHub example: "What repositories do I have?")
User query → server needs tool list → server asks MCP client for available tools → client sends `ListToolsRequest` to MCP server, gets `ListToolsResult` → server sends query + tools to Claude → Claude decides to call a tool → server asks client to run it → client sends `CallToolRequest` to MCP server → server makes the real GitHub API call → result flows back as `CallToolResult` → server sends the tool result to Claude → Claude formulates the final answer → user gets the answer.
Many steps, but each component has one clear responsibility — the client abstracts away server-communication complexity.

## Building an MCP server (Python SDK / FastMCP)
```python
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("DocumentMCP", log_level="ERROR")
docs = {"deposition.md": "...", "report.pdf": "...", ...}  # in-memory store
```
### Defining tools
```python
@mcp.tool(name="read_doc_contents", description="Read the contents of a document and return it as a string.")
def read_document(doc_id: str = Field(description="Id of the document to read")):
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")
    return docs[doc_id]
```
- Decorators + Python type hints + Pydantic `Field()` descriptions replace hand-written JSON schemas — the SDK auto-generates the schema Claude sees.
- Benefits: no manual JSON schema writing, automatic validation from type hints, clear parameter descriptions, error handling integrates naturally via Python exceptions, tool registration happens automatically through the decorator.

### The server inspector — testing without a full client
- Start with `mcp dev mcp_server.py` → opens a local URL (e.g., `http://127.0.0.1:6274`).
- Click **Connect**, then use the **Tools** tab: "List Tools" → select a tool → fill inputs → "Run Tool" → see success status + returned data.
- State persists between calls in the inspector session, so you can test an edit tool then immediately verify with a read tool.
- Core dev-loop value: iterate on tool implementations, test edge cases/errors, verify multi-tool interactions, debug in real time — without wiring up a full client application.

## MCP Clients — implementation
Two components: a custom **MCP Client** wrapper class (for convenience) around the SDK's **Client Session** (the actual connection, requiring careful cleanup — hence the wrapper).
```python
async def list_tools(self) -> list[types.Tool]:
    result = await self.session().list_tools()
    return result.tools

async def call_tool(self, tool_name: str, tool_input: dict) -> types.CallToolResult | None:
    return await self.session().call_tool(tool_name, tool_input)
```
In most real projects you implement **either** a client or a server, not both (the course builds both for teaching purposes).

## Resources — exposing data (like a GET handler)
Resources expose read-only data (contrast: tools perform actions). Use case: a document `@mention` autocomplete feature — list available documents, then fetch one when mentioned, injecting its content directly into the prompt (no tool call needed, saves a round trip).
Follows a request/response pattern: client sends `ReadResourceRequest` with a URI → server returns `ReadResourceResult`.

### Two resource types
```python
# Direct — static URI, no parameters
@mcp.resource("docs://documents", mime_type="application/json")
def list_docs() -> list[str]:
    return list(docs.keys())

# Templated — parameterized URI, SDK auto-parses params into kwargs
@mcp.resource("docs://documents/{doc_id}", mime_type="text/plain")
def fetch_doc(doc_id: str) -> str:
    if doc_id not in docs:
        raise ValueError(f"Doc with id {doc_id} not found")
    return docs[doc_id]
```
- `mime_type` tells the client how to parse the response: `application/json`, `text/plain`, `application/pdf`, etc. The SDK auto-serializes your return value — no manual JSON-stringifying.
- Test resources the same way as tools, via the Inspector's **Resources** and **Resource Templates** sections.

## Accessing resources from the client
```python
async def read_resource(self, uri: str) -> Any:
    result = await self.session().read_resource(AnyUrl(uri))
    resource = result.contents[0]
    if isinstance(resource, types.TextResourceContents):
        if resource.mimeType == "application/json":
            return json.loads(resource.text)
    return resource.text
```
- The result's `contents` is a list; you typically use just the first element.
- Check `mimeType` to decide whether to `json.loads()` or return raw text.
- In the CLI, typing `@` triggers an autocomplete list of resources; selecting one includes its content directly in the prompt sent to the model — no extra tool-call round trip, smoother UX than requiring Claude to fetch it itself.

## Prompts — pre-built, tested instruction templates
Users can already ask Claude to do most things directly (e.g., "reformat report.pdf in markdown"), but a **thoroughly tested, specialized prompt** authored by the MCP server developer gets more consistent, higher-quality results than users writing their own instructions each time.
```python
@mcp.prompt(name="format", description="Rewrites the contents of the document in Markdown format.")
def format_document(doc_id: str = Field(description="Id of the document to format")) -> list[base.Message]:
    prompt = f"""Your goal is to reformat a document to be written with markdown syntax.
The id of the document you need to reformat is:
<document_id>{doc_id}</document_id>
Add in headers, bullet points, tables, etc as necessary. ..."""
    return [base.UserMessage(prompt)]
```
- Returns a list of messages sent directly to Claude — can include multiple user/assistant messages for more complex flows.
- Users trigger prompts via UI actions: `/` slash commands, menu selections, button clicks (user-initiated, not automatic).
- Benefits: consistency (same reliable results every time), encoded expertise (domain knowledge baked in once), reusability (any client using the server gets the same prompts), single-point maintenance (update once, all clients improve).

## Prompts — client implementation
```python
async def list_prompts(self) -> list[types.Prompt]:
    result = await self.session().list_prompts()
    return result.prompts

async def get_prompt(self, prompt_name, args: dict[str, str]):
    result = await self.session().get_prompt(prompt_name, args)
    return result.messages
```
Arguments provided by the client become keyword arguments interpolated into the prompt template (e.g., `{"doc_id": "plan.md"}`).

## MCP review — the three primitives, who controls each
| Primitive | Controlled by | Use for |
|---|---|---|
| **Tools** | The **model** (Claude decides when to call) | Giving Claude new capabilities it uses autonomously (e.g., "calculate the square root of 3" → Claude picks a code-execution tool) |
| **Resources** | Your **app** (app code decides when to fetch) | Populating UI (autocomplete lists) or injecting context into prompts (e.g., Claude's "Add from Google Drive") |
| **Prompts** | The **user** (triggered by explicit action) | Predefined, optimized workflows a user starts on demand (e.g., the workflow buttons under Claude's chat input) |

**Decision guide**: need to give Claude a new capability → tool. Need data into your app for UI/context → resource. Want a predefined user-triggered workflow → prompt. Each primitive serves a different layer of your stack: tools serve the model, resources serve your app, prompts serve your users.

## Course implementation details

### Client/server scope

MCP complements tool use: MCP standardizes discovery and invocation of tools and also exposes resources and prompts; the model still decides how to use a tool after the client has provided its schema. Most real applications implement either an MCP server or an MCP client. The course builds both so the end-to-end protocol is visible, but production architecture should start by identifying which side your application owns.

A server publishes capabilities. A client connects, lists them, selects what to expose to the model or application, invokes them, and cleans up the session. The normal tool exchange is ListToolsRequest/ListToolsResult followed by CallToolRequest/CallToolResult.

### FastMCP workflow

FastMCP uses decorators, Python type hints, and Pydantic-style validation to derive tool schemas. A tool should have a clear name, description, typed inputs, and a predictable return value; the description is part of the model-facing interface and should explain when the tool is appropriate and what errors mean.

The MCP Inspector is the fastest manual check for a server: run the course's mcp dev command against the server file, then inspect Tools, Resources, and Resource Templates. Run the client example separately with uv run and test the application wrapper that lists tools and calls a selected tool. Treat the Inspector as a protocol/debugging tool, not as proof that the surrounding application permissions and business rules are correct.

### Resources and prompts

Resources are read-only context exposed by the server. A direct resource has a fixed URI; a resource template has URI parameters. Read results contain a contents list with the URI, MIME type, and text or binary data. The MIME type tells the client how to parse or display the data. In a chat UI, resource autocomplete can inject content into the conversation without making the model call a tool.

Prompts are reusable, user-triggered templates. A prompt decorator defines the template, list-prompts advertises it, and get-prompt resolves keyword arguments into messages. User interfaces commonly expose them as slash commands. Prompts are a good place for tested workflow structure and domain phrasing, while tools are for model-selected actions and resources are for application-selected context.

When designing an MCP server, keep tools narrow, descriptions specific, inputs validated, resources least-privilege, and prompts explicit about the expected output. Version or deprecate a capability rather than silently changing its meaning.
