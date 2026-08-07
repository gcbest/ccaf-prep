/* Section checks for lesson 0004 — Claude API: tools, retrieval, and context. */
window.CCAF_CHECKS = {
  lesson: "0004-claude-api-tools-retrieval-and-context",
  items: {
    scene0: {
      q: "Dara states the division of labour once and never renegotiates it. What is it?",
      options: [
        "Claude owns the loop and the reasoning; your code supplies the tools",
        "You own the loop and the tools; Claude owns the reasoning",
        "Claude executes tools directly; your code validates the results afterwards",
        "The SDK owns the loop; you own the schemas and Claude owns execution"
      ],
      correct: 1,
      explain: "Claude never touches your database — it writes a request, and your code decides whether and how to honour it. A tool gives Claude a way to ask for something, not a new ability."
    },
    scene3: {
      q: "A tool throws an exception mid-loop. What does run_tools do with it?",
      options: [
        "Re-raises it so the caller can retry the whole conversation",
        "Returns a tool_result with is_error: true and the error message as content",
        "Drops that tool_use block and returns only the successful results",
        "Sends a new user message asking Claude to pick a different tool"
      ],
      correct: 1,
      explain: "Execution is wrapped in try/except so a failure comes back to Claude as an error result rather than crashing the loop. The loop is boring on purpose — the cleverness lives in the tools and their descriptions."
    },
    scene7: {
      q: "Assist uses the built-in text editor tool. What does “built-in” mean here?",
      options: [
        "Anthropic executes the file operations for you, as with web search",
        "Claude already knows the schema from a version-dated stub, but the implementation is yours",
        "The SDK ships a default implementation you can override",
        "The tool runs inside Anthropic's sandbox with your files mounted"
      ],
      correct: 1,
      explain: "Anthropic gives us the menu; we still have to hire the cook. Your code opens, reads, replaces, and creates files — and should constrain which paths and operations are permitted, treating tool inputs as untrusted."
    },
    scene10: {
      q: "In the Computer Use loop, why is taking a fresh screenshot after each action non-negotiable?",
      options: [
        "It is how billing measures the length of the session",
        "It is Claude's only way to perceive whether the click landed",
        "It resets the sandboxed container between actions",
        "It is required before the next tool_use block can be parsed"
      ],
      correct: 1,
      explain: "Look before acting, look again after. And because Claude can take arbitrary UI actions, Computer Use runs against a sandboxed VM or container, never a production desktop."
    },
    scene14: {
      q: "Lila's semantic search returns two chunks at cosine distance 0.71 and 0.72. What should she conclude?",
      options: [
        "Both are close to 0 and worth handing to Claude; the gap between them is a rounding error",
        "0.71 is the only relevant match, since lower distance means a decisive win",
        "Both are near 1, so neither is similar enough to use",
        "The vectors were not normalised, so the distances are not comparable"
      ],
      correct: 0,
      explain: "Cosine distance is 1 minus cosine similarity, so closer to 0 means more similar. Note too that Anthropic does not provide embeddings — the recommended provider is VoyageAI."
    }
  }
};
