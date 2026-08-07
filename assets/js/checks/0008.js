/* Section checks for lesson 0008 — Model Context Protocol. */
window.CCAF_CHECKS = {
  lesson: "0008-model-context-protocol",
  items: {
    scene0: {
      q: "Tomás has hand-authored seventeen integrations. What does MCP actually change about that?",
      options: [
        "It makes tools cheaper to call by batching schema definitions",
        "It changes who does the work of creating tools, moving maintenance to MCP server maintainers",
        "It replaces tools with resources, which need no schema",
        "It lets Claude generate the tool implementations from the service's API docs"
      ],
      correct: 1,
      explain: "MCP does not change what tools are. It shifts tool definition and execution onto dedicated servers — often shipped by the service provider itself, whose job it then is to keep them current."
    },
    scene2: {
      q: "In the full request flow, which component actually makes the real GitHub API call?",
      options: [
        "The MCP client",
        "The MCP server",
        "Your application server",
        "Claude, once it receives the tool list"
      ],
      correct: 1,
      explain: "The MCP client is a hotel concierge: it phones the kitchen for you and carries the tray back, but it never once cooks the meal. It handles ListTools and CallTool messaging and executes nothing."
    },
    scene4: {
      q: "Tomás's starter project contains both a custom MCP client and a custom MCP server. What does the course say about that?",
      options: [
        "It is the recommended production shape, since it keeps the protocol local",
        "A real project normally implements either a client or a server — both are built here only so the protocol is visible",
        "It is required whenever the documents live in memory rather than a database",
        "It is a transitional step before splitting the two across processes"
      ],
      correct: 1,
      explain: "In production, start by identifying which side your application owns. Note the sandbox caveat too: the in-memory documents are a teaching store, wiped whenever the process restarts."
    },
    scene5: {
      q: "Tomás writes no JSON schema at all. What generates the schema Claude sees?",
      options: [
        "The MCP Inspector, on first connect",
        "The @mcp.tool decorator plus Python type hints plus Pydantic Field() descriptions",
        "A manifest file registered alongside the server module",
        "Claude, by introspecting the function at call time"
      ],
      correct: 1,
      explain: "The pattern is always decorator → function definition → parameter typing → validation → core logic. And the description is not documentation for humans — it is part of the interface Claude reads."
    },
    scene6: {
      q: "Tomás runs edit_document in the MCP Inspector, then immediately runs read_doc_contents on the same document. Why does that work?",
      options: [
        "The Inspector replays the previous request as context",
        "State persists between calls within an Inspector session, so the edit is visible",
        "read_doc_contents reads from the client's cache rather than the server",
        "The Inspector automatically chains tools that share a parameter"
      ],
      correct: 1,
      explain: "That lets him verify a multi-tool interaction without writing a line of client code. But a green run proves the server speaks MCP correctly — not that the application's permissions and business rules are right."
    },
    scene7: {
      q: "Ade wraps the SDK's Client Session in his own MCP Client class. Why is that the common practice rather than a stylistic flourish?",
      options: [
        "The Session cannot list tools without a wrapper",
        "The Session is a live connection needing careful resource cleanup; the wrapper owns connect, cleanup, and the async lifecycle",
        "The wrapper is where tool execution happens",
        "It lets several servers share one session object"
      ],
      correct: 1,
      explain: "The Session is the live electrical wire; the wrapper is the electrician who insulates it and remembers to turn it off. It exposes just list_tools and call_tool to the rest of the codebase."
    },
    scene10: {
      q: "A user picks a document with @ in Ade's CLI. What happens to that document's contents?",
      options: [
        "Claude issues a tool call to fetch it, then continues",
        "Application code pulls it in and includes it in the prompt — no tool call, no extra round trip",
        "The client caches it and serves it on the next CallToolRequest",
        "It is registered as a new tool scoped to that conversation"
      ],
      correct: 1,
      explain: "App-controlled context is a resource. Claude's own “Add from Google Drive” works the same way: application code, not the model, decides which documents to show and injects the content."
    },
    scene12: {
      q: "The client calls get_prompt(\"format\", {\"doc_id\": \"plan.md\"}). What comes back?",
      options: [
        "A tool schema the client registers before calling Claude",
        "A messages array forming the conversation input for the model",
        "The resolved document text, ready to interpolate",
        "A CallToolResult wrapping the formatted document"
      ],
      correct: 1,
      explain: "The supplied arguments become keyword arguments on the server's prompt function and get interpolated into the template. Same doorbell, different room — discovery then invoke, just aimed at the prompts drawer."
    },
    scene16: {
      q: "Hannah's checklist includes “version or deprecate; never silently redefine.” What is the reason?",
      options: [
        "Clients cache schemas, so a redefinition breaks the cache",
        "If a capability's meaning changes, shipping a new one and retiring the old one deliberately lets clients adapt",
        "The Inspector cannot detect a changed return shape",
        "Pydantic validation is generated at import time and will not refresh"
      ],
      correct: 1,
      explain: "And the permission point people get wrong: connecting a server does not dissolve the underlying system's access control. Exposing a server's tools to Claude is a decision you make per tool."
    }
  }
};
