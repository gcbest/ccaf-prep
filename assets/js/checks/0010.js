/* Section checks for lesson 0010 — The Claude Agent SDK, part 1 (orchestration).
   Covers the scenes that carry no decision point of their own. */
window.CCAF_CHECKS = {
  lesson: "0010-claude-agent-sdk-orchestration",
  items: {
    scene0: {
      q: "Why does a library like the Agent SDK have permission modes, hooks, settings files, and CLAUDE.md loading at all?",
      options: [
        "They were added so the SDK could match competitor feature lists",
        "Because the SDK spawns the Claude Code CLI as a subprocess, so Claude Code's features come along with it",
        "Because the Claude API exposes them directly on the Messages endpoint",
        "Because MCP servers require them in order to register tools"
      ],
      correct: 1,
      explain: "The SDK is a steering wheel bolted onto a car that already exists. That one fact also explains options like pathToClaudeCodeExecutable and spawnClaudeCodeProcess, which would be nonsense in a pure HTTP client."
    },
    scene3: {
      q: "Which budget option does the model actually know about, so it can pace itself and finish rather than be cut off mid-answer?",
      options: [
        "maxTurns",
        "maxBudgetUsd",
        "taskBudget",
        "fallbackModel"
      ],
      correct: 2,
      explain: "maxTurns and maxBudgetUsd are guillotines — the run stops when the number is hit, mid-thought. taskBudget is an API-side token budget the model is told about, so it can wrap up deliberately. fallbackModel isn't a cap at all; it's what to use when the primary model fails."
    },
    scene4: {
      q: "You define a subagent and omit its `tools` field entirely. What can it do?",
      options: [
        "Nothing — it has no tools until you list them",
        "Only Read, Grep, and Glob, which are the safe defaults",
        "It inherits every tool available to subagents",
        "Only the tools the parent listed in allowedTools"
      ],
      correct: 2,
      explain: "Silence means \"give them the whole keyring.\" Listing tools is how you restrict — and a tool you leave off the list isn't in the subagent's session at all: no permission prompt, no error, Claude just works without it."
    }
  }
};
